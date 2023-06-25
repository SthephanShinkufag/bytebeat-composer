// v is for the reverb
v = (x, y) => (
	t ? 0 : a = Array(10000).fill(0),
	// c is the vibrato thingy i made
	c = (t * [x, y][(t >> 10) % 2 + (t >> 15) % 1 * 3] *
		[1, 1.5, 1.2, 1.3, 1, 1.7, 1.8, 1.3, 1.6][(t >> 13) % 8] / 2 & 32) * (~t / 4 & 4095) / 5000,
	// m is (c) with (a) [reverb] to make the reverb
	m = c + a.shift(),
	a.push(m / 4),
	m / 2
),
// r is the static
r = 20 * random() * [1, 0, 1, 0, 1, 0, 1, 0][t >> 11 & 7],
// p is the pulse you hear
p = (x, y) => x * sin(y * log(t & 16383)) + 127,
// n is the bass
n = ((t * sin(t >> 3) * (t >> 14 & 1) & ~t >> 7 & 127) - 70) / 5,

// The stereo with the functions of the letters
[v(2.5, 2.1) + r + p(10, 20) + n, v(2.05, 2.5) + r + p(11, 22) + n];
