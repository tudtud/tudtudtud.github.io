import { CONFIG } from "./config.js";

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                       "Jul","Aug","Sep","Oct","Nov","Dec"];

export const clamp  = v => Math.min(CONFIG.axisMax, Math.max(CONFIG.axisMin, v));
export const toYear = (year, month) => year + (month - 1) / 12;
export const toPct  = v =>
  ((clamp(v) - CONFIG.axisMin) / (CONFIG.axisMax - CONFIG.axisMin)) * 100;

export const fmtMonth = v =>
  MONTHS[Math.min(11, Math.max(0, Math.round((v % 1) * 12)))] + " " + Math.floor(v);

// Whole calendar years read better as years than as Jan–Jan.
export function fmtSpan([lo, hi]) {
  const first = Math.floor(lo), last = Math.floor(hi - 1e-9);
  const wholeYears = Number.isInteger(lo) && Number.isInteger(hi);
  if (!wholeYears && hi - lo <= 1.34) return `${fmtMonth(lo)} – ${fmtMonth(hi)}`;
  return first === last ? String(first) : `${first} – ${last}`;
}
