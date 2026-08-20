// Serial number schemes, oldest first. Matching stops at the first scheme whose
// pattern fits AND whose ranges contain the number.
//
// ranges: [firstSerial, lastSerial, year] — or [..., firstYear, lastYear] for a span.
// Bands overlap between years because Fender's did. That is not a mistake to fix.
//
// strip: number of leading characters to drop, or a regex to remove.
//
// UNVERIFIED: the pre-1963 boundaries come from the widely-circulated dealer
// tables and have not been checked against a primary source.
export const SERIAL_SCHEMES = [
  {
    id: "early",
    label: "Bridge plate or early neck plate",
    match: /^\d{1,4}$/,
    ranges: [
      [1,    999,  1950, 1952],
      [100,  5500, 1952, 1953],
      [1000, 6000, 1953, 1954],
    ],
  },
  {
    id: "plain",
    label: "Neck plate, no letter prefix",
    match: /^\d{4,5}$/,
    ranges: [
      [1,     6000,  1954],
      [6000,  10000, 1955],
      [10000, 16000, 1956],
      [16000, 25000, 1957],
      [25000, 30000, 1958],
      [30000, 40000, 1959],
      [40000, 58000, 1960],
      [55000, 72000, 1961],
      [72000, 93000, 1962],
      [93000, 99999, 1963],
    ],
  },
  {
    id: "lseries",
    label: "L-series neck plate",
    match: /^L\d{1,5}$/,
    strip: 1,
    ranges: [
      [1,     20000, 1963],
      [20000, 55000, 1964],
      [55000, 99999, 1965],
    ],
  },
  {
    id: "fplate",
    label: "F-plate neck plate",
    match: /^F?\d{6}$/,
    strip: /^F/,
    ranges: [
      [100000, 110000, 1965],
      [110000, 200000, 1966],
      [180000, 210000, 1967],
      [210000, 250000, 1968],
      [250000, 280000, 1969],
      [280000, 300000, 1970],
      [300000, 330000, 1971],
      [330000, 370000, 1972],
      [370000, 520000, 1973],
      [500000, 580000, 1974],
      [580000, 690000, 1975],
      [690000, 750000, 1976],
    ],
  },
];
