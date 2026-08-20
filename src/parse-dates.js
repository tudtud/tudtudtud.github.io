import { CONFIG } from "./config.js";
import { MONTHS, toYear } from "./format.js";

const MONTH_NAMES = /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/;

// EIA manufacturer codes. CTS is Chicago Telephone Supply.
export const POT_MAKERS = {
  "137": "CTS",       "134": "Centralab", "304": "Stackpole",
  "140": "Clarostat", "106": "Allen-Bradley",
  "381": "Bourns",    "615": "IRC",
};

// Shared by every pencil/stamp date on the instrument.
//
// The year is always the LAST number in the string, never the first. Real
// markings interleave things: "EZ APR 30 64" puts the day between the month
// and the year; "2MAR64B" puts a model code in front of the month.
function readStamp(raw) {
  const s = String(raw).trim().toUpperCase();
  if (!s) return null;

  const nums = (s.match(/\d{1,4}/g) || []).map(Number);
  const named = s.match(MONTH_NAMES);

  let month, year;
  if (named) {
    month = MONTHS.findIndex(m => m.toUpperCase() === named[0]) + 1;
    if (!nums.length) return { error: "Need a year — MAR 62" };
    year = nums.at(-1);
  } else {
    if (nums.length < 2) return { error: "Need a month and a year — 3-62 or MAR 62" };
    month = nums[0];
    year  = nums.at(-1);
    if (month > 12) return { error: "First number should be the month" };
  }

  if (year < 100) year += year < 40 ? 2000 : 1900;
  if (year < 1949 || year > 1980) return { error: "Year is outside the neck-plate era" };
  if (month < 1 || month > 12)    return { error: "Month should be 1–12" };

  return { month, year, dated: toYear(year, month) };
}

export function readNeckDate(raw) {
  const p = readStamp(raw);
  if (!p || p.error) return p;
  return {
    interval: [p.dated, p.dated + CONFIG.neckLagYears],
    note: `${MONTHS[p.month - 1]} ${p.year} → assembled then or up to ~6 months later`,
  };
}

// Body and neck-pocket dates mark when the body was routed. That routinely happens
// BEFORE the neck is shaped, so this is not a "closer to assembly" signal — it
// carries a slightly longer tail than the neck does.
export function readBodyDate(raw) {
  const p = readStamp(raw);
  if (!p || p.error) return p;
  return {
    interval: [p.dated, p.dated + CONFIG.bodyLagYears],
    note: `${MONTHS[p.month - 1]} ${p.year} → body routed; assembled after`,
  };
}

// Masking tape in the control cavity and dates on pickup bottoms are written
// during wiring and winding, which is close to final assembly.
export function readCavityDate(raw) {
  const p = readStamp(raw);
  if (!p || p.error) return p;
  return {
    interval: [p.dated, p.dated + CONFIG.cavityLagYears],
    note: `${MONTHS[p.month - 1]} ${p.year} → assembled then or shortly after`,
  };
}

// EIA source-date code. Seven digits carry a two-digit year; six carry one
// digit, and single-digit years only ran through 1959 — so a lone digit
// resolves into the 1950s, never the 1960s.
export function readPotCodes(raw) {
  const codes = String(raw).split(",").map(c => c.replace(/\D/g, "")).filter(Boolean);
  if (!codes.length) return null;

  const notes = [];
  let newest = null;

  for (const code of codes) {
    const maker = POT_MAKERS[code.slice(0, 3)];
    if (code.length !== 6 && code.length !== 7) {
      notes.push(`${code}: need 6 or 7 digits`); continue;
    }
    if (!maker) {
      notes.push(`${code}: ${code.slice(0, 3)} isn't a maker code I know`); continue;
    }

    const year = code.length === 7 ? 1900 + +code.slice(3, 5) : 1950 + +code[3];
    const week = +code.slice(code.length === 7 ? 5 : 4);
    if (week < 1 || week > 53) {
      notes.push(`${code}: week ${week} isn't valid`); continue;
    }

    notes.push(`${maker} · week ${week} of ${year}${code.length === 6 ? " (single-digit year)" : ""}`);
    newest = Math.max(newest ?? -Infinity, year + (week - 1) / 52);
  }

  if (newest === null) return { error: notes.join(" · ") };
  return {
    interval: [newest, null],            // open-ended: a floor, never a ceiling
    note: notes.join(" · ") + " → guitar no earlier than this",
  };
}

export const PARSERS = {
  neckDate: readNeckDate, bodyDate: readBodyDate,
  cavityDate: readCavityDate, potCodes: readPotCodes,
};
