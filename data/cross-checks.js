// Contradictions the interval maths cannot see, because they are relationships
// between answers rather than dates.
//
// Each `when` receives a plain snapshot:
//   { board, skunk, dots, ... }  the chosen option value, or undefined
//   gapYears                     |neck date − pot date| in years, or 0
export const CROSS_CHECKS = [
  {
    id: "rosewood-stripe",
    when: s => s.skunk === "present" && ["slab", "veneer"].includes(s.board),
    say: "A rosewood-board neck with a skunk stripe is a contradiction. Rosewood necks " +
         "were routed from the front, so there is nothing to plug. Either the board answer " +
         "is wrong, or the neck is not what it appears to be.",
  },
  {
    id: "maple-no-stripe",
    when: s => s.skunk === "absent" && s.board === "maple",
    say: "A one-piece maple neck with no skunk stripe is wrong for this era. Worth a " +
         "second look at the back of the neck under raking light.",
  },
  {
    id: "clay-on-maple",
    when: s => s.dots === "clay" && s.board === "maple",
    say: "Clay dots belong on a rosewood board. A one-piece maple neck of this era has " +
         "black dots in the maple itself.",
  },
  {
    // Calibrated from True Vintage Guitar: the heel date should land within about
    // six months of the pot codes. A year or more apart suggests modification.
    id: "heel-pot-gap",
    when: (s, cfg) => s.gapYears > cfg.modifiedGapYears,
    say: "The neck heel date and the pot codes are more than a year apart. Those should " +
         "normally sit within about six months of each other, so this is a common signature " +
         "of a swapped neck or replaced pots rather than an original assembly.",
  },
];
