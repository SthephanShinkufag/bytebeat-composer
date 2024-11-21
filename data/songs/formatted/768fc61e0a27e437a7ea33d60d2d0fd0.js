sample_rate = 44100,
vol = 1 / 5,

st = t / 32 * 8000 / sample_rate * 1.025, // Sawtooth wave that cycles once every second (roughly)

all_note_tune_factor = 1.0, // Play with this to pitch up and down n stuff

a = 220 * all_note_tune_factor,
b = 246.94 * all_note_tune_factor,
c = 261.633 * all_note_tune_factor,
d = 293.665 * all_note_tune_factor,
e = 329.628 * all_note_tune_factor,
f = 349.228 * all_note_tune_factor,
g = 391.995 * all_note_tune_factor,

arp6 = t / 32 * 8000 / sample_rate >> 6,
arp12 = t / 32 * 8000 / sample_rate >> 8,

os1 = st * [a, c, [a, f, g][arp6 % 3], e][arp6 % 4],
os2 = st * 2 * [f / 8, g / 8, a / 4, a / 4, d / 4, e / 4, f / 4, f / 4][arp12 % 8],
os3 = st * [f / 8 + 0.1, g / 8 + 0.2, a / 4 + 0.3, a / 4 + 0.2, d / 4 + 0.1, e / 4 + 0.2,
	f / 4 + 0.3, f / 4 + 0.4][arp12 % 8],
os4 = st * 1.5 * [f / 8, g / 8, a / 4, a / 4, d / 4, e / 4, f / 4, f / 4][arp12 % 8] % 128,
os5 = st * [e, a, c, [a, f, g][arp6 % 3]][arp6 % 4],

(os1 * vol) % (255 * vol) +
	(os2 * vol) % (255 * vol) +
	(os3 * vol / 2) % (255 * vol / 2) +
	(os4 * vol) % (255 * vol) +
	(os5 * vol / 2) % (255 * vol / 2);
