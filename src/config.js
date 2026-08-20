// Tunable constants. These are the numbers most likely to change as more
// verified guitars come in — keep them here rather than inline.
export const CONFIG = {
  email:      "you@yourdomain.com",
  price:      "$40",
  turnaround: "48 hours",

  axisMin: 1950,
  axisMax: 1977,

  // A neck is dated when it is made; the guitar is assembled after.
  // True Vintage Guitar: the heel date should sit within ~6 months of the pots.
  neckLagYears: 0.5,

  // Body, cavity and pickup dates land nearer final assembly.
  bodyLagYears: 0.3,

  // Heel and pot dates more than this far apart suggest a swap.
  // Observed on verified originals so far: 1.3, ~4.0 and 10.6 months.
  modifiedGapYears: 1,

  // Plates were grabbed from bins out of order, so a serial routinely turns up
  // a year either side of its published band.
  binSlopYears: 1,

  cbsAcquired: 1965,   // 3 January 1965
};
