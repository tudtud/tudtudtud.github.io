// Guitars verified in hand. Values are the RAW markings, exactly as they read on
// the instrument, so loading one also exercises the parsers.
//
// verifiedYear   what the guitar IS — the model year a dealer would sell it as
// assembledYear  when it was actually BUILT, when that differs
//
// Those two come apart: Fender built to old specs into the next calendar year, so a
// guitar sold as a 1965 can have been assembled in early 1966. The tool computes the
// build date, so validation checks assembledYear when present.
//
// Every entry is a regression test — see test/run.js.
//
// To add an example:
//   1. Copy the template below and append it to EXAMPLES.
//   2. Use a unique id; add the expected result for it to WANT in test/run.js.
//   3. Run `npm test` and keep the example only when the computed window agrees.
//
// Required fields:
//   id             short unique machine-readable id
//   label          text shown in the example picker
//   truth          human-readable instrument description used in test output
//   verifiedYear   model year the instrument is known or sold as
//   basis          how it was verified, usually "in hand"
//   serial         raw serial marking, including a prefix or dash when present
//   serialLocation where the serial was found, such as "neck plate"
//   signals        object of evidence keys to raw markings or selected values
//   note           short explanation of the useful or surprising evidence
//
// Optional fields:
//   assembledYear  build year when it differs from verifiedYear; the test checks
//                  this year because the tool dates assembly, not the model label
//
// Signal keys come from data/evidence.js. Use the exact key and enter what is
// physically marked or selected in the UI. The complete object below demonstrates
// every supported key; omit signals that were not inspected in a real example.
// Select values must be the internal values, not their display labels.
//
// Copyable shape:
// {
//   id: "unique-id", label: "YEAR Model · serial",
//   truth: "YEAR Model", verifiedYear: YEAR, basis: "in hand",
//   serial: "RAW SERIAL", serialLocation: "neck plate",
//   signals: {
//     neck: "2SEP65B", body: "7-65", pickup: "10-25-65",
//     bottoms: "lightgrey", pots: "1376514", board: "veneer",
//     skunk: "absent", patents: "four", dots: "pearloid",
//     plate: "plain4", tuners: "double", logo: "transition",
//   },
//   note: "Why this example is useful or what the evidence shows.",
// },
export const EXAMPLES = [
  {
    id: "tele53", label: "1953 Telecaster · bridge plate 4904",
    truth: "1953 Telecaster", verifiedYear: 1953, basis: "in hand",
    serial: "4904", serialLocation: "bridge plate",
    signals: { neck: "TG 4-30-53", body: "Eddie 4-21-53", pots: "140220" },
    note: "Heel, pocket and cavity tape span 13 days — early guitars cluster tightly.",
  },
  {
    id: "tele60", label: "1960 Telecaster · 51096",
    truth: "1960 Telecaster", verifiedYear: 1960, basis: "in hand",
    serial: "51096", serialLocation: "neck plate",
    signals: {
      pots: "1376019", skunk: "absent", plate: "plain4",
      tuners: "single", logo: "spaghetti"
    },
    note: "No neck date supplied; the pot code sets the floor.",
  },
  {
    id: "jag64", label: "1964 Jaguar · L50894",
    truth: "1964 Jaguar", verifiedYear: 1964, basis: "in hand",
    serial: "L50894", serialLocation: "neck plate",
    signals: { neck: "1NOV64B", pots: "3046450", skunk: "absent", plate: "plain4" },
    note: "Tightest window in the set. Straddles the CBS acquisition date.",
  },
  {
    id: "strat64", label: "1964 Stratocaster · L27733",
    truth: "1964 Stratocaster", verifiedYear: 1964, basis: "in hand",
    serial: "L27733", serialLocation: "neck plate",
    signals: {
      neck: "2MAR64B", pots: "304 6345", pickup: "EZ APR 30 64",
      skunk: "absent", plate: "plain4"
    },
    note: "Pot lags the build by about four months.",
  },
  {
    id: "strat65", label: "1965 Stratocaster · L51039",
    truth: "1965 Stratocaster", verifiedYear: 1965, basis: "in hand",
    serial: "L51039", serialLocation: "neck plate",
    signals: { neck: "2SEP65B", pickup: "10-25-65", skunk: "absent", plate: "plain4" },
    note: "Serial falls in the published 1964 band — bin slop. The tool stretches and says so.",
  },
  {
    id: "strat65b", label: "1965 Stratocaster · L99803",
    truth: "1965 Stratocaster", verifiedYear: 1965, basis: "in hand",
    serial: "L99803", serialLocation: "neck plate",
    signals: { neck: "2JUL65B", pots: "137 6514", pickup: "9-8-65" },
    note: "Near the top of the L series. Neck, pot and pickup all agree inside four months.",
  },
  {
    id: "strat65c", label: "1965 Stratocaster · 102127 · Lake Placid Blue",
    truth: "1965 Stratocaster", verifiedYear: 1965, basis: "in hand",
    serial: "102127", serialLocation: "neck plate",
    signals: { neck: "2OCT65B", pickup: "12-7-65" },
    note: "Custom colour. No pot codes supplied; neck and pickup carry it.",
  },
  {
    id: "strat65d", label: "1965 Stratocaster · 107692 · built in 1966",
    truth: "1965 Stratocaster", verifiedYear: 1965, assembledYear: 1966, basis: "in hand",
    serial: "107692", serialLocation: "neck plate",
    signals: { neck: "2OCT65B", pots: "137 6549", pickup: "1-10-66" },
    note: "Shipped in 1966 with 1965 features. The tool returns the BUILD date, early " +
      "1966, which is the honest answer — the '65 label is a model year, not an " +
      "assembly date. Sellers use both.",
  },
  {
    id: "strat66", label: "1966 Stratocaster · 120015",
    truth: "1966 Stratocaster", verifiedYear: 1966, basis: "in hand",
    serial: "120015", serialLocation: "neck plate",
    signals: {
      neck: "13JAN66B", pots: "137 6549", pickup: "3-2-66",
      skunk: "absent", plate: "plain4"
    },
    note: "Plain four-bolt plate on a 1966 guitar — the F stamp phased in gradually. " +
      "This example is why the plain-plate ceiling is loose.",
  },
  {
    id: "strat60ht", label: "1960 Stratocaster Hardtail · 49457",
    truth: "1960 Stratocaster Hardtail", verifiedYear: 1960, basis: "in hand",
    serial: "49457", serialLocation: "neck plate",
    signals: { neck: "6/60", body: "3/60", bottoms: "black" },
    note: "Body dated three months BEFORE the neck — the example that corrected the " +
      "body-date assumption. Hardtail, so no tremolo cavity date.",
  },
];
