import { CONFIG } from "./config.js";
import { EVIDENCE } from "../data/evidence.js";
import { CROSS_CHECKS } from "../data/cross-checks.js";
import { PARSERS } from "./parse-dates.js";

// Open-ended upper bounds are stored as null in the data layer.
const closed = ([lo, hi]) => [lo, hi ?? CONFIG.axisMax];

export const findEvidence = key => EVIDENCE.find(e => e.key === key);
export const parserFor    = ev  => PARSERS[ev.field.parser];

/**
 * Evaluate one raw input against its signal definition.
 * Returns { signal, text, bad } — signal is null when the input is empty or invalid.
 */
export function evaluate(key, value) {
  const ev = findEvidence(key);
  if (!ev) return { signal: null, text: "", bad: false };

  if (ev.field.type === "select") {
    const option = ev.field.options.find(o => o.value === value);
    if (!option) return { signal: null, text: "", bad: false };
    return {
      signal: { value: option.value, interval: option.interval && closed(option.interval) },
      text: option.interval ? fmtInterval(closed(option.interval)) : "cross-check only",
      bad: false,
    };
  }

  const parsed = parserFor(ev)?.(value);
  if (!parsed)       return { signal: null, text: "", bad: false };
  if (parsed.error)  return { signal: null, text: parsed.error, bad: true };
  return { signal: { ...parsed, interval: closed(parsed.interval) }, text: parsed.note, bad: false };
}

// Injected by format.js consumers to avoid a circular import in tests.
let fmtInterval = ([lo, hi]) => `${lo.toFixed(2)}–${hi.toFixed(2)}`;
export const setIntervalFormatter = fn => { fmtInterval = fn; };

/* ------------------------------------------------------------------ state */

export const state = { serial: null, signals: {}, raw: {}, example: null, stretched: false };

export function setSignal(key, signal, raw) {
  state.raw[key] = raw;
  if (signal) state.signals[key] = signal;
  else delete state.signals[key];
}

export function clearSignals() {
  state.signals = {}; state.raw = {}; state.example = null;
}

/* ------------------------------------------------------------------ maths */

export const constraints = (serialInterval = state.serial?.interval) => [
  ...(serialInterval ? [{ key: "serial", name: "Serial", interval: serialInterval }] : []),
  ...EVIDENCE.filter(e => state.signals[e.key]?.interval)
             .map(e => ({ key: e.key, name: e.name, interval: state.signals[e.key].interval })),
];

export const intersect = list => list.reduce(
  ([lo, hi], c) => [Math.max(lo, c.interval[0]), Math.min(hi, c.interval[1])],
  [CONFIG.axisMin, CONFIG.axisMax]);

export const disjointPairs = list => list.flatMap((a, i) =>
  list.slice(i + 1)
      .filter(b => a.interval[1] <= b.interval[0] || b.interval[1] <= a.interval[0])
      .map(b => [a, b]));

/**
 * Two-tier serial. Plates were grabbed from bins and routinely turn up a year
 * either side of their published band, so a serial must never veto a neck stamp.
 * Try the published band first — it is tighter and usually right. Only if it
 * contradicts the physical evidence do we fall back to the bin-slop band, and
 * then we say so rather than quietly widening.
 */
export function resolve() {
  const strict = constraints();
  const tight  = { list: strict, stretched: false };
  if (!state.serial?.slop) return tight;

  const w = intersect(strict);
  if (w[1] > w[0] && disjointPairs(strict).length === 0) return tight;

  const loose = constraints(state.serial.slop);
  const w2 = intersect(loose);
  return (w2[1] > w2[0] && disjointPairs(loose).length === 0)
    ? { list: loose, stretched: true }
    : tight;   // still broken — a real contradiction, reported against the tight band
}

export function crossCheckNotes() {
  const neck = state.signals.neck?.interval?.[0];
  const pot  = state.signals.pots?.interval?.[0];
  const snapshot = Object.fromEntries(
    Object.entries(state.signals).map(([k, v]) => [k, v.value]));
  snapshot.gapYears = (neck && pot) ? Math.abs(pot - neck) : 0;
  return CROSS_CHECKS.filter(c => c.when(snapshot, CONFIG)).map(c => c.say);
}

/** One call that returns everything the UI needs. */
export function analyse() {
  const { list, stretched } = resolve();
  state.stretched = stretched;
  const window = intersect(list);
  const conflicts = disjointPairs(list);
  return {
    list, window, conflicts, stretched,
    added: list.length - 1,
    broken: window[1] <= window[0] || conflicts.length > 0,
    notes: crossCheckNotes(),
    months: Math.round((window[1] - window[0]) * 12),
  };
}
