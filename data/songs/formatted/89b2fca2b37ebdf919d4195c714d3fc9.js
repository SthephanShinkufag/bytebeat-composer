s = sin(t >> 5), h = 1 & t, t *= .18,
rpt = (beats, fill) => Array(beats).fill(fill),
beat = (arr, len, spd, vel = 2e4, morph = t, oct = 0) =>
	vel / (morph & (2 ** (spd - oct) / arr[(t >> spd) % len]) - 1),
mix = (x, vol, dist = 0) => (x * vol * (1 + dist)) % (256 * vol),
m = (...a) => mix(...a) || 0,
seq = (arr, len, spd) => arr[(t >> spd) % len],
mseq = (arr, len, spd, transp = 0) => t * 1.05946 ** (transp + seq(arr, len, spd)),

// Song:
p = [4, 9, 4.5, 7.5],
q = [1, , , , , 1, , 1],
q2 = [1, h, s, h, h, 2, s, h],
mel = [0, 0, 7, 8, 7, 0, 3, 5, 7, 5, 3, 5, 2, 3, 2, 5],
mel2 = [3, 3, 2, 2, 0, 0, 5, -2],
bass = [8, 5, 0, 10],

// lead1 = m(m(mseq(mel, 16, 11) & beat([1], 1, 11, 1e3), 14, 0) + m(mseq(mel, 16, 11), 1.7, 3), .4),
lead1 = m(mseq(mel, 16, 11) & beat([1], 1, 11, 1e3), 14, 0),
lead2 = m(mseq(mel, 16, 11), 1.7, 3),
lead3 = m(mseq(mel, 16, 11, 12), .9, 3),
lLeft = m(lead1 + lead2, .35),
lRight = m(lead1 + lead3, .35),
bs = m(mseq(bass, 4, 14), .5),
drums = m(beat(q2, 8, 11, 5e4), .6) + m(beat(q, 8, 11, 4e5), .7),
// l2 = m(mseq(mel2, 8, 13, 47.9) + beat([5], 1, 6, 2e5, mseq(mel2, 8, 13)), .1),
// l2 = m(m(mseq(mel2, 8, 13, 47.9), .5) + m(mseq(mel2, 8, 13, 48), .5), .1),
lead4 = m(m(mseq(mel2, 8, 13, 47.8), .5) + m(mseq(mel2, 8, 13, 48.3), .2) + beat([1], 1, 10, 1e5, t), .13),
distBass = bs & beat([1], 1, 10, 5e4, bs),
dbPunchy = m(beat([1], 1, 12, 1e6) + bs & beat([1], 1, 10, 5e4, bs), .4),

[m((lLeft | bs % 64) + dbPunchy + lead4, .6) + m(drums * 1.2, .44),
	m((lRight | bs % 128) + dbPunchy + lead4, .6) + m(drums * 1.2, .4)];
