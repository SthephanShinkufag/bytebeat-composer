q = t / 32e3,
r = 1.05946309,
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

z = (int(q * 2) % 128) > 63 ? r * r * r : 1, // Keyshift-o-matic
tr = (int(q * 4) % 128) > 63, // Lead trigger
n = [ // Notes
	a, c, e, c, a, d, f, d,
	a, c, f, a, c, e, g, e,
	g, b, d, b, f, a, c, a, // Phrase 2
	a, c, g, c, g, b, d, b
],

os = [ // Offsets for lead trigger
	1, 0, 1, 2, 1, 2, 1, 0,
	1, 0, 1, 2, 1, 2, 1, 0,
	1, 0, 1, 0, 1, 2, 1, 2,
	1, 0, 1, 0, 1, 2, 1, 2
],

na = (q * n[(int(q * 1) % 8) * 4 + (int(q * 64) % 3)]) * (int((q * 4) % 2) / 2) * z, // Arp chords
nb = ((q * (n[int((q * 4) % 32)] << (tr * os[int((q * 4) % 32)]))) / 2) * z, // Slow arp & lead
nc = (q * [a, b, c, e, c, b, a, 0][int(q * 4) % 8]) * z, // Lead
nd = (
	q * [a, a << 1, a, 0, a, 0, a, 0, g >> 1, g, g >> 1, 0, e >> 1, 0, c >> 1, c][int(q * 4) % 16] / 4
) * z, // BASS

kick = (
	tan(sin(32 / ((((q * 64) % 32))))) *
	(((((q * 16) % 8) < 2.5) & (((q * 16) % 8) > 0.2)) * ((2 - (((q * 16) % 4))) * 32))
) * (((q * 8) % 8) < 1),
snare = (((((q * 16) % 16) > 7.9) & (((q * 16) % 16) < 8.75)) * (((q * (f >> 2)) & 1) * 80)) +
	(((random() * 8) >> 2) * (((28 - (((q * 64) % 32))) / 2.8) * (int(q * 4) % 4))) / 1.5,
hihat = (((q * 64) % 8 < 2) * (((random() * 7) << 6) >> 4)) +
	((((q * 64) % 8) < 1) * (((q * 7040) % 2) << 3)),

// Output channels
(
	(kick + snare + hihat) / 2 +
	((sin(na * 4) < cos(q * 4)) * 4.5) * ((4 - (((q * 32) % 4))) * 1.3) +
	((tan(sin(nb * 2.00) * 1.5) / 2.39) * (sin(nb * 3.00) * 3) * (cos(nb * 1.013) * 2) / 2) *
		(((8 - (((q * 32) % 8)) * 0.9) - 3) / 1.7)
) / 1.3 +
	((sin(nc * 1) * 3) * (sin(nc * 4.0) * 4) * (sin(nc * 1.02) * 2)) / 2 +
	(tan(sin(nd / 2) * tan(cos(nd * 1.5) * 1.03)) + 4) * 3 + 110;
