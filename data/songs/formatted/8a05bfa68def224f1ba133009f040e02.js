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

arp = [ // Cut out odds
	f, a << 1, c << 1, // 0 --
	0, 0, 0, // 2 -
	0, 0, 0, // 4 --
	g, b << 1, d << 1, // 6 -
	0, 0, 0, // 8 --
	0, 0, 0, // 10 -
	g, b << 1, d << 1, // 12 --
	0, 0, 0, // 14 -

	g, b << 1, d << 1, // 16 --
	0, 0, 0, // 18 -
	0, 0, 0, // 20 --
	a << 1, c << 1, e << 1, // 22 -
	0, 0, 0, // 24 --
	0, 0, 0, // 26 -
	g, b << 1, d, // 28 --
	0, 0, 0, // 30 -

	f, a << 1, c << 1, // 32 --
	0, 0, 0, // 34 -
	0, 0, 0, // 36 --
	g, b << 1, d << 1, // 38 -
	0, 0, 0, // 40 --
	0, 0, 0, // 42 -
	e, g, b << 1, // 44 --
	0, 0, 0, // 46 -

	e, g, b << 1, // 48 --
	0, 0, 0, // 50 -
	0, 0, 0, // 52 --
	f, a << 1, c << 1, // 54 -
	0, 0, 0, // 56 --
	0, 0, 0, // 58 -
	0, 0, 0, // 60 --
	0, 0, 0 // 62 -
],

leadn = [
	a, 0, b, 0, c, 0, 0, 0, e, 0, 0, 0, d, 0, c, d, c, b, 0, 0, c, 0, 0, 0, a, 0, 0, 0, g >> 1, 0, 0, 0, e, 0,
	a, 0, b, 0, c, cs, d, 0, 0, 0, b, 0, c, 0, b, 0, a, 0, e, 0, d, ds, e, 0, g >> 1, gs >> 1, a, 0, 0, 0, c,
	0, b, 0, c, d, e, 0, 0, 0, f, 0, e, 0, 0, 0, d, e, d, 0, d, 0, a, 0, 0, 0, d, 0, e, f, g, 0, a, 0, c, 0,
	b, 0, 0, 0, g, 0, f, g, d, 0, 0, g, f, 0, 0, 0, e, 0, f, e, d, 0, e, 0, 0, 0, b, 0, a, 0, b, 0, c, 0, 0,
	0, e, 0, 0, 0, d, c, b, 0, c, 0, b, 0, 0, 0, e, 0, 0, 0, a << 1, 0, g, 0, e, 0, a << 1, g, e, 0, d, 0, d,
	ds, e, 0, 0, 0, d << 1, 0, c << 1, 0, a << 1, 0, 0, 0, gs, 0, a << 1, 0, 0, 0, e, 0, g, a << 1, 0, 0
],

bassn = [
	a, a << 1, a, 0, a, 0, g, 0, g, g, 0, 0, d, d << 1, d, 0, g << 1, g, e, 0, e, 0, e, e << 1, e, 0, d, 0, d,
	0, a, a << 1, a, 0, a, 0, g, 0, g << 1, g, 0, 0, d, d << 1, d, 0, b, 0, b, 0, g, 0, c, 0, a, a << 1, a, 0,
	f >> 1, f >> 1, f, g, 0, 0, 0
],

z = (int(q * 2) % 128) > 63 ? r * r * r : 1,

tempo = 4,

// cl = lead array length // bl = bass array length // ll = lead array length
cl = 32,
bl = 64,
ll = 64,

leadtrx = [0, 2, 0, 1, 0, 0, 1, 1],
leadjmp = leadtrx[int((q / (2 * tempo)) % 8)] * 64,

// Broken transpose
trns = 4,

// Lead and chord echo timing respectively
lec = -0.17,
ec = -0.5,

// Initializing setting echo timings
lecho = lec,
echo = ec,

ad = 5,
at = (arp[(int(q * 1 * tempo) % cl) * 3 + 2] * z) << ad,

bass = (((q * 16 * tempo) % 16) - 16) *
	((q * (bassn[(int(q * 2 * tempo) + int((q / 8) % 3) - 1) % bl] * z) % 32) / 9),
chords = ((((q * 4 * tempo) % 4) * 4) - 16) *
	(((q * ((arp[(int(q * 1 * tempo) % cl) * 3 + (int(q * at) % 3)] * z) * 2)) * 1) & 8) >> 1,
lead = ((q * (leadn[(int(q * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) << 3,

// Delay/echo code mess "I wish I could do a FOR loop" ---- start

lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) << 2,
at = (arp[(int((q + echo) * 1 * tempo) % cl) * 3 + 2] * z) << ad,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * at) % 3)] * z) * 2)) * 1
) & 8) >> 2,
lecho += lec,
echo += ec,

lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) << 1,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * 64) % 3)] * z) * 2)) * 2
) & 8) >> 3,
lecho += lec,
echo += ec,

lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) >> 0,
at = (arp[(int((q + echo) * 1 * tempo) % cl) * 3 + 2] * z) << ad,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * at) % 3)] * z) * 2)) * 1
) & 8) >> 4,
lecho += lec,
echo += ec,

lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) >> 1,
at = (arp[(int((q + echo) * 1 * tempo) % cl) * 3 + 2] * z) << ad,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * 64) % 3)] * z) * 2)) * 2
) & 8) >> 5,
lecho += lec,
echo += ec,

lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) >> 2,
at = (arp[(int((q + echo) * 1 * tempo) % cl) * 3 + 2] * z) << ad,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * at) % 3)] * z) * 2)) * 1
) & 8) >> 6,
lecho += lec,
echo += ec,

lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) >> 3,
at = (arp[(int((q + echo) * 1 * tempo) % cl) * 3 + 2] * z) << ad,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * 64) % 3)] * z) * 2)) * 2
) & 8) >> 7,
lecho += lec,
echo += ec,

at = (arp[(int((q + echo) * 1 * tempo) % cl) * 3 + 2] * z) << ad,
lead += (((q + lecho) * (leadn[(int((q + lecho) * 2 * tempo) % ll) + leadjmp] * z) * trns) & 4) >> 4,
chords += (((((q + echo) * 4 * tempo) % 4) * 4) - 16) * ((
	((q + echo) * ((arp[(int((q + echo) * 1 * tempo) % cl) * 3 + (int((q + echo) * at) % 3)] * z) * 2)) * 1
) & 8) >> 8,

// ---- End

groovea = (((t / sr) * 1) % 16) < 8 ? 4 << int((q * 2) % 2) : 8,
grooveb = (((t / sr) * 1) % 16) > 8 ? 16 << int((q * 2) % 2) : 16,
kick = (
	tan(sin(32 / ((((q * 64) % 32))))) *
	(((((q * 16) % 8) < 2.5) << (((q * 880) % 32) < 0)) * ((2 - (((q * 16) % 4))) * 64))
) * (((q * 8) % 4) < 1),
snare = (((
	((random() * (((((q * 16) % 16) > 8) & (((q * 16) % 16) < 9.7)) * ((q * 610) & 8)))) *
	((((q * 16) % 16) > 8.7)) * (((q * 16) % 16) - 16)
) * 10) - (((((q * 16) % 16) > 8) & (((q * 16) % 16) < 8.9)) * (int((q * 440) % 2) << 9))) / 10,
hihata = ((((q * 6900) & 3) ^ ((q * 9800) % 3)) / ((q * groovea) % 1)) * ((q * 8) & 2),
hihatb = ((((q * grooveb * tempo) % 16) - 16) * (((random() * 16) ^ (((q * 8e4) & 2) * 8)))) / 22,

out = (
	((t / sr) * 1) > 16 ? chords + bass + lead / 2.5 + hihatb + snare + (kick + hihata) / 4 : chords + hihatb
) + 190;
