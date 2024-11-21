sr = 44100,
q = (t + (sr * 128)) / sr,
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

arp = [
	a, d, f,
	0, 0, 0,
	0, 0, 0,
	0, 0, 0,
	0, 0, 0,
	0, 0, 0,
	b << 1, d, g,
	0, 0, 0,
	0, 0, 0,
	0, 0, 0,
	d, gs, c,
	d, gs, c,
	0, 0, 0,
	d, g, b,
	0, 0, 0,
	d, g, a
],

leadn = [c, d, 0, d, d, 0, e, e, f, f, g, 0, f, 0, g, a],
bassn = [d >> 1, d, 0, d, 0, d, d >> 1, 0, g >> 2, 0, g >> 1, 0, a >> 1, 0, a, 0],

bass = sin(q * (bassn[int(q * 4) % 16] >> 1)) * 32,
chords = max(sin((q * (arp[(int(q * 2) % 16) * 3 + (int(q * 64) % 3)] * 2)) * 2) * 4, (q * 16) % 4) * 4,
trns = 4,
ec = -0.35,
lead = cos(q * leadn[int(q * 4) % 16] * trns) * 8,
echo = ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 7,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) * 3.5,
echo += ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 6,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) * 3,
echo += ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 5,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) * 2.5,
echo += ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 4,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) * 2,
echo += ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 3,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) * 1.5,
echo += ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 2,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) * 1,
echo += ec,
lead += cos((q + echo) * leadn[int((q + echo) * 4) % 16] * trns) * 1,
chords += max(sin(
	((q + echo) * (arp[(int((q + echo) * 2) % 16) * 3 + (int((q + echo) * 64) % 3)] * 2)) * 2
) * 4, ((q + echo) * 16) % 4) / 2,

kick = (
	tan(sin(32 / ((((q * 64) % 32))))) *
	(((((q * 16) % 8) < 2.5) << (((q * 880) % 32) < 0)) * ((2 - (((q * 16) % 4))) * 64))
) * (((q * 8) % 4) < 1),
snare = ((((((q * 16) % 16) > 8) & (((q * 16) % 16) < 8.70)) * (((q * 440) & 1) * 70))) +
	((((random() * 8) >> 2) * (((32 - (((q * 64) % 32))) >> 2) * ((q * 2) & 1))) * 2.5),
hihat = ((((q * 6900) & 3) ^ ((q * 9800) % 3)) / ((q * 8) % 1)) * ((q * 8) & 2),

out = (chords + bass + (lead / 1.7) + (kick + snare + hihat) / 4) + 64;
