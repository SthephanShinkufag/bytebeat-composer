q = t / 44100,
r = pow(2, 1.0 / 12),
a = 880,
as = a * r,
b = as * r,
c = b * r,
cs = c * r,
d = cs * r,
ds = d * r,
e = ds * r,
f = e * r,
fs = f * r,
g = fs * r,
gs = g * r,

// Coded and Composed by Bp103

n = [a, c, e, c, a, d, f, d, a, c, f, a, c, e, g, e, g, b, d, b, f, a, c, a, a, c, g, c, g, b, d, b],
os = [1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 2, 1, 2],

xy = (x, y) => int(x) * 4 + int(y),

p = function(tt, vol) {
	aa = sin(int(q *
			(n[xy((q + tt) * 0.5 % 8, (q + tt) * 32 % 3)] - 1) *
			(2 + os[int(((q + tt) * 0.5) % 32)]))) *
		(vol / ((sin(q * 0.07) * 2.5) + 3.5));
	bb = tri(q * n[xy((q + tt) * 0.5 % 8, (q + tt) * 4 % 3)] * 2) * vol;
	cc = cos(int(q *
			(n[xy((q + tt) * 0.5 % 8, (q + tt) * 4 % 3)] - 1.5) *
			(2 + os[int(((q + tt) * 4) % 32)]))) *
		(vol / ((sin(q * 0.37) * 0.8) + 1.5));
	return aa + bb + cc;
},

delay = function() {
	tt = 0,
	to = 0.25,
	voll = 2;
	out = p(tt, 2);
	for(let i = 0; i < 8; i++) {
		out -= p(tt, i + voll);
		tt = tt + to;
	}
	return out - 130;
},

tri = function(snd) {
	amp = 3.12;
	return abs(amp - snd % (amp * 2)) - (amp / 2);
},

delay();
