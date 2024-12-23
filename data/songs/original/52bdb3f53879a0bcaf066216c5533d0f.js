// main functions
seqnote = x => t * 2 ** ((x) / 12),
addharmony3 = (ch1, ch2, ch3) => (ch1 % 85) + (ch2 % 85) + (ch3 % 85),
decay = (x, l, d) => x % 256 * (-t & l) / d,

// notes from channel 1
ch1 = seqnote([4, 2, 0, -1][(t >> 16) % 4]) / 3,
ch2 = seqnote([9, 7, 5, 4, 9][(t >> 16) % 4]) / 3,
ch3 = seqnote([12, 11, 9, 8][(t >> 16) % 4]) / 3,

channel1 = addharmony3(ch1, ch2, ch3),

//note from main melody
seq = seqnote([
-3, 4, -3, 2, -3, 4, -3, 2, -5, 4, -5, 2, -5, 4, -5, 2
, -7, 4, -7, 2, -7, 0, -7, -1, -8, 4, -8, 2, -8, 0, -8, -1][(t >> 13) % 32]),

// drums
drums = ((((sqrt(3e2 * (t & [16383, 8191, 16383, 16383][(t >> 15) % 4])) & 64) + ((3e5 / (t & 32767)) & 64) +(t * sin(t >> 2) & 255) * (-t & 8191) / 2e4 * "001"[(t >> 13) % 3]) + (random() * (-t & 8191) / 200))) / 1.2,

((channel1 / 2) + (seq % 256 / 2))