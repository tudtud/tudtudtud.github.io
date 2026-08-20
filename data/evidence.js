// The eleven signals, in display order. PURE DATA — no imports, no functions.
//
// interval: [earliest, latest] in fractional years. `null` as the upper bound
//           means open-ended; the fusion layer substitutes the axis maximum.
//           `null` for the whole interval means cross-check only — the signal
//           contributes no date, it only checks other answers.
// parser:   key into PARSERS in src/parse-dates.js
// bound:    styling hint — exact | floor | range
export const EVIDENCE = [
  {
    key: "neck", name: "Neck heel date", bound: "exact", boundLabel: "Exact ± weeks",
    where: "Butt of the neck · four screws off",
    facts: [
      "Pencil until Mar 1962 · ink stamp after",
      "Pre-1954 <b>month-day-year</b> · 1954 on <b>month-year</b>",
      "Stamp adds a model code in front, nut width behind",
      "Dates the <b>neck</b>, not the guitar",
      "Should land within ~6 months of the pot codes",
      "A year or more apart suggests a swap",
      "1959&ndash;1960 &mdash; some necks carry no date at all",
    ],
    examples: [
      "<b>3-62</b> &rarr; March 1962",
      "<b>TG-7-54</b> &rarr; Tadeo Gomez, July 1954",
      "<b>10-12-54</b> &rarr; Oct 12, 1954",
      "<b>2SEP65B</b> &rarr; Sept 1965 &middot; 2 = Strat &middot; B = width",
      "<b>13JAN66B</b> &rarr; Jan 1966 &middot; Strat recoded 13 from 1966",
    ],
    field: { type: "text", placeholder: "3-62  ·  TG-7-54  ·  2SEP65B", parser: "neckDate" },
  },
  {
    key: "body", name: "Body / cavity date", bound: "exact", boundLabel: "Exact ± weeks",
    where: "Neck pocket · tremolo cavity · masking tape in the control cavity",
    facts: [
      "Pencil, often with the worker's name rather than initials",
      "Marks when the body was <b>routed</b> — often before the neck",
      "Strats: usually the tremolo cavity, through about 1966",
      "Masking tape in the control cavity gives the wiring date",
      "Early-1950s guitars cluster tightly &mdash; days, not months",
    ],
    examples: [
      "<b>Eddie 4 - 21 - 53</b> &rarr; April 21, 1953 (neck pocket)",
      "<b>Gloria 5 - 4 - 53</b> &rarr; May 4, 1953 (control cavity tape)",
      "Bodies are often dated <b>weeks or months before</b> the neck",
      "<b>7-60</b> &rarr; July 1960 (tremolo cavity)",
    ],
    field: { type: "text", placeholder: "Eddie 4-21-53  ·  7-60", parser: "bodyDate" },
  },
  {
    key: "pickup", name: "Pickup date", bound: "exact", boundLabel: "Exact ± weeks",
    where: "Masking tape on the underside of each pickup",
    facts: [
      "Pencil date plus the winder's initials",
      "Wound close to assembly &mdash; a tight signal when present",
      "Check <b>all</b> pickups; one odd date means one swapped pickup",
      "Absent on many guitars &mdash; a blank is not a red flag",
    ],
    examples: [
      "<b>10-25-65</b> &rarr; October 25, 1965",
      "<b>EZ APR 30 64</b> &rarr; April 30, 1964 &mdash; EZ is the winder",
      "<b>5-62</b> &rarr; May 1962",
    ],
    field: { type: "text", placeholder: "10-25-65", parser: "cavityDate" },
  },
  {
    key: "bottoms", name: "Pickup bottoms", bound: "range", boundLabel: "Supporting",
    where: "Flatwork on the underside of the pickups",
    facts: [
      "<b>Black</b> &rarr; 1954 to around March 1964",
      "<b>Light grey</b> &rarr; from March 1964",
      "<b>Dark grey</b> &rarr; from about 1968",
      "Black is a <b>weak ceiling</b> — Fender burned through old stock in 1968",
      "Grey is the useful direction: a solid floor of early 1964",
      "A yellow date stamp appears with the first grey bottoms",
    ],
    field: { type: "select", options: [
      // Black bottoms reappear in 1968 (supply shortage) and sporadically in the
      // 1970s, so the ceiling is deliberately loose.
      { value: "black",     label: "Black",      interval: [1950, 1968.5] },
      { value: "lightgrey", label: "Light grey", interval: [1964.2, null] },
      { value: "darkgrey",  label: "Dark grey",  interval: [1967.9, null] },
    ] },
  },
  {
    key: "pots", name: "Pot codes", bound: "floor", boundLabel: "No earlier than",
    where: "Side of each pot · inside the control cavity",
    facts: [
      "First 3 digits = maker. <b>137</b> CTS &middot; <b>134</b> Centralab &middot; <b>304</b> Stackpole &middot; <b>140</b> Clarostat",
      "7 digits &rarr; maker + 2-digit year + week",
      "6 digits &rarr; maker + 1-digit year + week. Ends at 1959",
      "Sets a <b>floor, never a ceiling</b> &mdash; pots sat in bins",
      "Enter several; the newest one binds",
    ],
    examples: [
      "<b>1376217</b> &rarr; CTS &middot; week 17 of 1962",
      "<b>137615</b> &rarr; CTS &middot; week 15 of 1956",
      "<b>1376217, 1376525</b> &rarr; the 1965 pot binds",
    ],
    field: { type: "text", placeholder: "1376217, 1376525", parser: "potCodes" },
  },
  {
    key: "board", name: "Fretboard construction", bound: "range", boundLabel: "Narrows range",
    where: "Glue line, viewed from the side of the neck",
    facts: [
      "<b>One-piece maple</b> &rarr; through mid-1959",
      "<b>Slab rosewood</b>, flat glue line &rarr; mid-1959 to mid-1962",
      "<b>Veneer rosewood</b>, curved glue line &rarr; mid-1962 on",
      "Visible in most photos. Hard to fake",
    ],
    field: { type: "select", options: [
      { value: "maple",  label: "One-piece maple",                    interval: [1950, 1959.5] },
      { value: "slab",   label: "Slab rosewood (flat glue line)",     interval: [1959.4, 1962.7] },
      { value: "veneer", label: "Veneer rosewood (curved glue line)", interval: [1962.4, null] },
    ] },
  },
  {
    key: "skunk", name: "Skunk stripe", bound: "range", boundLabel: "Cross-check",
    where: "Back of the neck, heel to headstock",
    facts: [
      "<b>Maple necks</b> &mdash; routed from the back, plugged &rarr; stripe",
      "<b>Rosewood necks</b> &mdash; routed from the front &rarr; no stripe",
      "Doesn't date the guitar. Checks the fretboard answer",
    ],
    field: { type: "select", options: [
      { value: "present", label: "Present", interval: null },
      { value: "absent",  label: "Absent",  interval: null },
    ] },
  },
  {
    key: "patents", name: "Headstock patent numbers", bound: "range", boundLabel: "Narrows range",
    where: "Small line of numbers under the model name",
    facts: [
      "<b>None</b> &rarr; 1954 to 1961",
      "<b>Two</b> &rarr; added in 1961",
      "<b>Three</b> &rarr; a third added in 1962",
      "<b>Four</b> &rarr; a fourth added in 1964",
      "Dropped again in late 1976 for MADE IN USA",
      "Legible in a straight-on headstock photo",
    ],
    field: { type: "select", options: [
      { value: "none",  label: "No patent numbers", interval: [1950, 1961.6] },
      { value: "two",   label: "Two",               interval: [1961, 1962.7] },
      { value: "three", label: "Three",             interval: [1962, 1964.7] },
      { value: "four",  label: "Four",              interval: [1964, null] },
    ] },
  },
  {
    key: "dots", name: "Fretboard dots", bound: "range", boundLabel: "Narrows range",
    where: "Position markers on the fretboard face",
    facts: [
      "<b>Clay</b> &mdash; vulcanised fibreboard, flat grey-brown &rarr; through 1964",
      "<b>Pearloid</b> &mdash; plastic, faint shimmer &rarr; 1964 on",
      "Rosewood boards only &mdash; maple necks have black dots",
      "Visible in almost any front-on photo",
    ],
    field: { type: "select", options: [
      { value: "clay",     label: "Clay (matte, no shimmer)", interval: [1950, 1964.9] },
      { value: "pearloid", label: "Pearloid (plastic)",       interval: [1964, null] },
    ] },
  },
  {
    key: "plate", name: "Neck plate style", bound: "range", boundLabel: "Hard ceiling",
    where: "The plate itself",
    facts: [
      "<b>Script F</b> &rarr; 1965 or later",
      "<b>Three bolts</b> &rarr; 1971 or later",
      "The F stamp <b>phased in</b> — plain plates run into 1966&ndash;67",
      "So a plain plate is a weak ceiling; an F stamp is a hard floor",
      "Both visible in any photo of the back",
    ],
    field: { type: "select", options: [
      // Verified counterexample: a Jan 1966 Stratocaster on a plain four-bolt plate.
      // The ceiling is deliberately loose — this option rules out little on its own.
      { value: "plain4", label: "Four bolts, no F stamp", interval: [1950, 1967.5] },
      { value: "f4",     label: "Four bolts, script F",   interval: [1965.3, 1971.6] },
      { value: "bolt3",  label: "Three bolts",            interval: [1971, null] },
    ] },
  },
  {
    key: "tuners", name: "Kluson tuners", bound: "range", boundLabel: "Supporting",
    where: "Back of the headstock, stamped on the housing",
    facts: [
      "<b>No line</b> &rarr; through ~1956",
      "<b>Single line</b> &rarr; ~1956 to 1964",
      "<b>Double line</b> &rarr; 1964 on",
      "Commonly replaced. Supporting evidence only",
    ],
    field: { type: "select", options: [
      { value: "noline", label: "No line",     interval: [1950, 1956.6] },
      { value: "single", label: "Single line", interval: [1955.9, 1964.8] },
      { value: "double", label: "Double line", interval: [1964, null] },
    ] },
  },
  {
    key: "logo", name: "Headstock logo", bound: "range", boundLabel: "Supporting",
    where: "Headstock face · decal and surrounding text",
    facts: [
      "<b>Spaghetti</b> &mdash; thin script, black trim &rarr; through 1965 on Teles",
      "<b>Transition</b> &mdash; thicker gold, black trim &rarr; mid-1964 to mid-1968",
      "<b>Black / CBS</b> &mdash; black with gold trim &rarr; mid-1967 to 1980",
      "Black logo adds a circled &reg; and bold-caps model name",
      "Decals sit <b>over</b> the lacquer until 1968, under clear coat after",
      "Most reproduced part on the guitar &mdash; weak for authentication",
    ],
    examples: [
      "<b>SYNCHRONIZED TREMOLO</b> decal &rarr; dropped early 1971 (Strat)",
      "<b>MADE IN USA</b>, no patent nos. &rarr; late 1976 on",
      "Sources split on the black logo: mid-1967 or 1968",
    ],
    field: { type: "select", options: [
      { value: "spaghetti",  label: "Spaghetti (thin, black trim)",         interval: [1950, 1966.0] },
      { value: "transition", label: "Transition (gold, black trim)",        interval: [1964.4, 1968.4] },
      { value: "black",      label: "Black / CBS (black, gold trim)",       interval: [1967.4, null] },
      { value: "blackTrem",  label: "Black + SYNCHRONIZED TREMOLO (Strat)", interval: [1967.4, 1971.1] },
      { value: "blackUSA",   label: "Black + MADE IN USA, no patent nos.",  interval: [1976.6, null] },
    ] },
  },
];
