t2 = t / 44100,
p = 1.05946309,

// Notes
a = 14080,
as = a * p,
b = as * p,
c = b * p,
cs = c * p,
d = cs * p,
ds = d * p,
e = ds * p,
f = e * p,
fs = f * p,
g = fs * p,
gs = g * p,

// Functions
saw = n => (t2 * n) & 63,
sqr = n => (t2 * n) & 64,
sine = n => 32 * sin((t2 * n) / 10.25) + 32,

// Percussion
kick = 25 * (3E3 / (t & 16383) & 3),
snare = 10 * (3E4 / ((t + 16383) & 32767) & 4),
hihat = ((-t >> 8) % 16 + 16) % t * random(),

// Arp chords
arpch = [
	c, e, g,
	a, f, g,
	a, c, e,
	g / 2, a, c
],

// Bass
bs = [g / 2, a / 2, c / 2, e / 2],

// Output
sine(bs[(t >> 16) % 4]) + sqr(arpch[((t >> 12) % 3) + ((t >> 16) % 4) * 3]) + kick + snare + hihat;
