RATE = 44100,
TEMPO = 60 / 600,

S = t => (
	D = (s, d, t) => max(s * (d - t) / d, 0),
	U = (n, t) => t * 220 * pow(1.059463094, n),
	sw = (n, t) => sin(U(n, t) * PI * 4),
	Z = (n, t) => (u = U(n, t), u % 1 + u * 0.996 % 1 - 1),
	sq = (n, t) => (U(n, t * 4) | 0) % 2,
	f = (s, d, n, t) => sw(n, t) * D(s, d, t),
	fm = (ms, md, s, d, n, t) => sw(n, t + f(ms, md, n, t)) * D(s, d, t),
	ts = t / RATE,
	beat = int(ts / TEMPO),
	bprg = ts % TEMPO,
	mp = beat % 16,
	ms = int(beat / 16),
	mr = ts % (TEMPO * 16),
	m4 = ms % 4,
	m8 = ms % 8,
	mx = ms % 16,
	bup = (mp % 3 & 1) ^ (mp > 11),
	K = (k, i, b) => '0x' + k[i] - b,
	bn = K('4402', m4, bup ? 28 : 40),
	m1 = K('03c8038370ca0385', mx, 12),
	m2 = K('c7aac075c3c7c077', mx, 12),
	mg = (v, l) => ms > l && v,
	mm = 0.003,

	fm(-0.017 - 1e-3 * bn, 0.4, 0.5, 0.6, bn, bprg) +
	mg(fm(9, 9, 0.04, 0.03, 0, bprg), 7) +
	mg(fm(0, 1, !(mp & 3) * 0.7, 0.5, -38, pow(bprg, 0.6)), -3) +
	mg(fm(0.1, 1, !((mp + 4) & 7) / 4, 0.2, 0, pow(bprg, 0.7)), 7) +
	mg(
		Z(m4 === 3 ? 2 : 0, mr) +
		Z(m8 === 3 ? 5 : 3, mr) +
		Z(m8 === 7 ? 7 : m4 < 2 ? 7 : 4 + m4 * 2, mr),
		15
	) * min(mr, 0.4) * D(0.7, 2, mr) +
	mg(
		fm(mm - 4e-4 * m1, 2, 0.5, 2, m1, mr) +
		fm(mm - 4e-4 * m2, 2, m2 && 0.5, 2, m2, max(mr - TEMPO * 8, 0)),
		31
	)),

E = (t, k) => k ? S(max(t - k * 4200, 0)) * pow(0.3, k) + E(t, k - 1) : 0,

E(t, 4) * 128 + 128;
