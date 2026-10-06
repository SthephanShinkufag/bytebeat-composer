/*Bad Ending Theme (COMPLETE) by Two2Fall*/

// main functions
t*=1.015,
// t = (-t + 2323860), // Uncomment to make this song backwards
seqnote = x => t * 2 ** ((x) / 12),
parse = (x, s) => parseInt(x[(t >> s) % x.length], 36) - 20,
addharmony3 = (ch1, ch2, ch3) => (ch1 % 85) + (ch2 % 85) + (ch3 % 85),
decay = (x, l, d) => x % 256 * (-t & l) / d,

// notes from channel 1
ch1 = seqnote([4, 2, 0, -1][(t >> 16) % 4]) / 3,
ch2 = seqnote([9, 7, 5, 4, 9][(t >> 16) % 4]) / 3,
ch3 = seqnote([12, 11, 9, 8][(t >> 16) % 4]) / 3,

channel1 = addharmony3(ch1, ch2, ch3),

//note from main melody
seq = seqnote([
parse('HOHMHOHMFOFMFOFMDODMDKDJCOCMCKCJ',13),
parse('HOHMHOHMFOFMFOFMDODMDKDJCOCMCKCJ',13),
parse('HJKMKJKJHJKMKJKMOMKJKMKKJJHHGGHH',13),
parse('HJKMKJKJHJKMKJKMOMKJKMKKJJHHGGHH',13),
parse('HCHCHCHCOHMHKHJHKCMCOCMCKCHCKCMC',13),
parse('HCHCHCHCOHMHKHJHKCMCOCMCKCHCKCMC',13),
parse('HOMKFOKODOMKCOKOHOMKFOKODOMKCOKJ',13),
parse('7M7O7Q7Q5L5M5O5Q3M3O3Q3Q2L2M2O2Q',13)+10, 
parse('HOHOHMHOFOFOFMFODODODMDOCOCOCMCF',13),
][(t >> 18) % 9]),

// drums
drums = ((((sqrt(3e2 * (t & [16383, 8191, 16383, 16383][(t >> 15) % 4])) & 64) + ((3e5 / (t & 32767)) & 64) +(t * sin(t >> 2) & 255) * (-t & 8191) / 2e4 * "001"[(t >> 13) % 3]) + (random() * (-t & 8191) / 200))) / 1.2,

((channel1 / 2) + (seq % 256 / 2))