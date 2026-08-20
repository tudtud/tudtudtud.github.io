import { SERIAL_SCHEMES } from "../data/serials.js";
import { CONFIG } from "./config.js";
import { clamp } from "./format.js";

const NOT_FOUND =
  "That doesn't match a documented neck-plate range. Check for a transposed digit, " +
  "or a prefix you may have dropped.";
const HEADSTOCK =
  "Letter-prefixed serials on the headstock are 1976 or later. This tool covers " +
  "neck-plate serials only.";

function digitsFor(scheme, s) {
  if (typeof scheme.strip === "number") return s.slice(scheme.strip);
  if (scheme.strip) return s.replace(scheme.strip, "");
  return s;
}

export function readSerial(input) {
  let s = String(input).trim().toUpperCase().replace(/[\s\-–—#]/g, "");
  if (!s) return { error: "Enter a serial number from the neck plate." };

  // F is a neck plate; every other letter prefix is a 1976+ headstock serial.
  if (/^[A-EG-KM-Z]/.test(s) || (/^F/.test(s) && !/^F\d{6}$/.test(s)))
    return { error: HEADSTOCK };

  // Some 1957–58 plates carry a leading "0" or "-", making six characters.
  s = s.replace(/^0+(?=\d{5}$)/, "");

  for (const scheme of SERIAL_SCHEMES) {
    if (!scheme.match.test(s)) continue;
    const n = parseInt(digitsFor(scheme, s), 10);
    if (Number.isNaN(n)) continue;

    const years = new Set();
    for (const [lo, hi, from, to = from] of scheme.ranges)
      if (n >= lo && n <= hi) for (let y = from; y <= to; y++) years.add(y);
    if (!years.size) continue;

    const first = Math.min(...years), last = Math.max(...years);
    return {
      scheme, n, raw: s,
      years: [...years].sort((a, b) => a - b),
      interval: [first, last + 1],
      slop: [clamp(first - CONFIG.binSlopYears),
             clamp(last + 1 + CONFIG.binSlopYears)],
    };
  }
  return { error: NOT_FOUND };
}
