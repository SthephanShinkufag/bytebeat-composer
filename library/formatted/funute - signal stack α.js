RATE = 44100,
FOURIER_N = 31,

t /= RATE,
BPM = 120,

bd = 1 / BPM * 30,
ml = 8,

beat_num = int(t / bd) % ml,
beat_prog = t / bd % bd,

mn = int(t / (ml * bd)),
mtl = bd * ml,
mp = (t % mtl) / mtl,

fourier = (fn, n, hz, r, t) => n ? fourier(fn, n - 1, hz, r + fn(n) * sin(2 * PI * t * hz * n), t) : r,

sq = n => n & 1 ? 1 / n : 0,
saw = n => 1 / n,
tri = n => n & 1 ? .7 * (n / 2 & 1 ? 1 : -1) / n / n : 0,

lp = (fn, k, n) => fn(n) * max(0, 1 - n / k),
hp = (fn, k, n) => fn(n) * min(1, n / k),

mapsum = (a, m) => a.map(m).reduce((a, b) => a + b),
nf = (base, st) => base * (2 ** (1 / 12)) ** st,

chseq = [0xeb74, 0xdb63, 0xdb62, 0xc851],
ch = (p, s, t) =>
	mapsum([0, 1, 2, 3], k =>
		mapsum([1, 1.002], dt => (
			b = k * 4,
			fourier(n => lp(saw, p, n), FOURIER_N, nf(dt * 208, (s & (15 << b)) >> b), 0, t) / 4))),

s = chseq[mn % 4],
(
	.2 * ch(beat_num % 4 * 6 + 1, s, t) +
	(mn > 7 && .2 * fourier(
		n => lp(sq, 69 * (1 - mp) ** 3 + 1, n),
		FOURIER_N * 2,
		nf(104, s & 15), 0, t)) +
	(mn > 15 && .2 * fourier(
		n => hp(tri, beat_prog * 9 + mp * 4, n),
		FOURIER_N,
		nf(104, s & (3 << beat_num)), 0, t))
) * 127 + 128;
