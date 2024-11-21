// LP filters work great at high samplerates
t /= 4,

// Formula
z = (t * (4 | 7 & t >> 13) >> (~t >> 11 & 1) & 128) + (t * (t >> 11 & t >> 13) * (~t >> 9 & 3) & 127),

// Envelope and LFO
l = (sin(t / 1024 / 8) + 1.5) * 0.3, // Sine LFO
CUTOFF = l * Math.E ** (-1 / 1024 * (t & 255 * 8)), // Exp decay

// Set to 0.9 for a TB303ish acid sound
RESONANCE = 0.0,

// The guts
FB = function() {
	this.lp6 = 0;
	this.lp12 = 0;
},
y = ('undefined' != typeof glob && null != glob || (glob = new FB), glob),
cl = (u, t, f) => min(max(f, u), t),
c = cl(0, .99, CUTOFF),
r = RESONANCE,
fb = r + r / (1 - c),
f = ((z & 255) / 127 - 1) / 4,
y.lp6 += c * (f - y.lp6 + fb * (y.lp6 - y.lp12)),
y.lp12 += c * (y.lp6 - y.lp12),
y.lp12;
