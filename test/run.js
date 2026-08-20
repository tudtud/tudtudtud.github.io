// Regression suite. No DOM, no browser.
//     node test/run.js
import { readSerial }   from "../src/parse-serial.js";
import { readNeckDate, readBodyDate, readPotCodes } from "../src/parse-dates.js";
import { fmtSpan, fmtMonth } from "../src/format.js";
import { EXAMPLES }     from "../data/examples.js";
import { EVIDENCE }     from "../data/evidence.js";
import {
  state, clearSignals, setSignal, evaluate, analyse, setIntervalFormatter,
} from "../src/fusion.js";

setIntervalFormatter(fmtSpan);

let pass = 0, fail = 0;
const ok = (name, got, want) => {
  if (String(got) === String(want)) { pass++; console.log(`  ok   ${name} → ${got}`); }
  else { fail++; console.log(`  FAIL ${name} → got ${got}, want ${want}`); }
};
const head = t => console.log(`\n${t}`);

/* ---------------------------------------------------------------- serials */
head("serials");
ok("4904 bridge plate", fmtSpan(readSerial("4904").interval), "1952 – 1954");
ok("51096",             fmtSpan(readSerial("51096").interval), "1960");
ok("L12345",            fmtSpan(readSerial("L12345").interval), "1963");
ok("F310000",           fmtSpan(readSerial("F310000").interval), "1971");
ok("310000 (no F)",     fmtSpan(readSerial("310000").interval), "1971");
ok("024000 zero-prefix",fmtSpan(readSerial("024000").interval), "1957");
ok("-24000 dash",       fmtSpan(readSerial("-24000").interval), "1957");
ok("57000 overlap",     readSerial("57000").years.join(","), "1960,1961");
ok("E123456 rejected",  !!readSerial("E123456").error, true);
ok("ZZZ rejected",      !!readSerial("ZZZ").error, true);
ok("empty rejected",    !!readSerial("").error, true);

/* ------------------------------------------------------------ date stamps */
head("date stamps — year is always the last number");
for (const [raw, want] of [
  ["3-62", "Mar 1962"], ["MAR 62", "Mar 1962"], ["TG-7-54", "Jul 1954"],
  ["10-12-54", "Oct 1954"], ["2SEP65B", "Sep 1965"], ["13JAN66B", "Jan 1966"],
  ["1 MAY 62 B", "May 1962"], ["2MAR64B", "Mar 1964"], ["1NOV64B", "Nov 1964"],
  ["EZ APR 30 64", "Apr 1964"], ["Eddie 4 - 21 - 53", "Apr 1953"],
  ["Gloria 5 - 4 - 53", "May 1953"], ["10-25-65", "Oct 1965"], ["MAR 1964", "Mar 1964"],
]) ok(raw, fmtMonth(readNeckDate(raw).interval[0]), want);
ok("13-62 rejected", !!readNeckDate("13-62").error, true);
ok("62 rejected",    !!readNeckDate("62").error, true);
ok("blank → null",   readNeckDate("  "), null);

/* -------------------------------------------------------------- pot codes */
head("pot codes");
ok("1376217",  readPotCodes("1376217").note.split(" →")[0], "CTS · week 17 of 1962");
ok("137615",   readPotCodes("137615").note.split(" →")[0],  "CTS · week 15 of 1956 (single-digit year)");
ok("304 6345", readPotCodes("304 6345").note.split(" →")[0],"Stackpole · week 45 of 1963");
ok("140220",   readPotCodes("140220").note.split(" →")[0],  "Clarostat · week 20 of 1952 (single-digit year)");
ok("328 unknown", !!readPotCodes("3286217").error, true);
ok("newest binds", Math.floor(readPotCodes("1376217, 1376525").interval[0]), 1965);
ok("open-ended",   readPotCodes("1376217").interval[1], null);

/* ------------------------------------------------------- verified guitars */
head("verified guitars");
function load(example) {
  clearSignals();
  state.serial = readSerial(example.serial);
  for (const [key, raw] of Object.entries(example.signals)) {
    const { signal } = evaluate(key, raw);
    setSignal(key, signal, raw);
  }
  state.example = example;
  return analyse();
}

const WANT = {
  tele53:   "Apr 1953 – Oct 1953",
  tele60:   "May 1960 – Jan 1961",
  jag64:    "Dec 1964 – Jan 1965",
  strat64:  "Apr 1964 – Aug 1964",
  strat65:  "Oct 1965 – Jan 1966",
  strat65b: "Sep 1965 – Dec 1965",
  strat65c: "Dec 1965 – Jan 1966",
  strat65d: "Jan 1966 – Apr 1966",
  strat66:  "Mar 1966 – Jul 1966",
  strat60ht:"Jun 1960 – Oct 1960",
};

for (const ex of EXAMPLES) {
  const a = load(ex);
  const window = fmtSpan(a.window);
  // The tool computes the BUILD date, so validate against assembledYear when the
  // guitar was finished in a different calendar year than its model designation.
  const target = ex.assembledYear ?? ex.verifiedYear;
  const contains = Math.floor(a.window[0]) <= target
                && Math.floor(a.window[1] - 1e-9) >= target;
  ok(`${ex.truth} window`, window, WANT[ex.id]);
  ok(`${ex.truth} agrees`, !a.broken && contains, true);
  if (a.notes.length) console.log(`       ⚠ ${a.notes.length} cross-check note(s)`);
  if (a.stretched)    console.log(`       ⓘ serial stretched past its published band`);
}

/* ------------------------------------------------------------- conflicts */
head("contradictions are caught");
const pick = (key, value) => {
  const { signal } = evaluate(key, value);
  setSignal(key, signal, value);
};
function scenario(serial, pairs) {
  clearSignals();
  state.serial = readSerial(serial);
  for (const [k, v] of pairs) pick(k, v);
  return analyse();
}
ok("1971 + spaghetti logo", scenario("310000", [["logo","spaghetti"]]).broken, true);
ok("1954 + four patents",   scenario("1062",   [["patents","four"]]).broken, true);
ok("1963 + no-line tuners", scenario("L12345", [["tuners","noline"]]).broken, true);
ok("slab board + stripe",   scenario("L12345", [["board","slab"],["skunk","present"]]).notes.length, 1);
ok("clay dots on maple",    scenario("L12345", [["board","maple"],["dots","clay"]]).notes.length, 1);
ok("maple + no stripe",     scenario("L12345", [["board","maple"],["skunk","absent"]]).notes.length, 1);
ok("heel/pot gap > 1yr",    scenario("L12345", [["neck","3-63"],["pots","1376625"]]).notes.length, 1);
ok("heel/pot gap ok",       scenario("L12345", [["neck","3-63"],["pots","1376217"]]).notes.length, 0);

head("data integrity");
ok("12 signals", EVIDENCE.length, 12);
ok("every select option has a value",
   EVIDENCE.filter(e => e.field.type === "select")
           .every(e => e.field.options.every(o => o.value)), true);
ok("every text field names a parser",
   EVIDENCE.filter(e => e.field.type === "text")
           .every(e => e.field.parser), true);
ok("every example has a verifiedYear", EXAMPLES.every(e => e.verifiedYear), true);

console.log(`\n${fail ? `${fail} FAILED` : `all ${pass} passed`}`);
process.exit(fail ? 1 : 0);
