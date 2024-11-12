t = 44100 * (b = t / 44100 /* Sample rate */),
gT = 110 /* bpm */ * .08 * b, // Generator timing
b *= 1.1, // Song timing
len = 224, // Song length
k = b / len & 1 ? 5 : 4, // Generator mode
b %= len, // Song looping

// Generators
gen = (del, pitch, vibr, arp = 0, k1 = 5, k2 = 5) => (t + vibr * sin(5 * (T = gT - del))) * 2 ** (
	pitch + ('6202'[(T >> 5) % 4] - 3) / 12 +
	(arp && int((w = abs((T / arp & 31) - 17)) / k2) - (0x158A >> w % k1 * k & 15) / 12)),
sqr = x => (x & 128) / 4,
tri = x => abs((x & 255) - 128) / 4,

// Effects
echo = (fn, ch /* 0|1 */, vol, pan /* 0..1 */, delay, pitch, vibr, arp, k1, k2) => (
	out = 0,
	vol && Array(4).fill().map((e, i) =>
		out += (!i || ch == i % 2 || 1 - pan) * fn(gen(delay * i, pitch, vibr, arp, k1, k2)) / (i + 1)),
	vol * out),
rise = (start, len, x = 1) => b < start ? 0 : b < start + len ? (b - start) / len : x,
fade = (start, len) => b < start ? 1 : b < start + len ? 1 - (b - start) / len : 0,
drop = (tempo, hold) => 1 - gT % tempo / hold,
pan = (ch, vol /* 0..1 */, pan = .5 /* 0..1 */) => vol * (abs((b + 4 * ch) % 8 / 4 - 1) - pan) + 1,

// Instruments
arp1 = (ch, v) => 1.2 * (
	echo(sqr, ch, rise(0, 8, fade(32, 32)), .6, 2 + rise(8, 24, 1.2), 1, v, 1) +
	echo(tri, ch, rise(32, 16, fade(64, 16)), 1, 3, 1, 2 * v, 1) +
	echo(sqr, ch, rise(64, 8, fade(96, 32)), .2, 3, 1, v, 1, 4)),
arp2 = (ch, v) =>
	1.2 * drop(2, 4) * echo(sqr, ch, rise(112, 32, fade(160, 32)), .5, 3, 0, v, 2, 4, 4) +
	1.5 * drop(2, 4 + 8 * rise(176, 16)) * echo(tri, ch, rise(144, 16, fade(192, 32)), 0, 3, 1, v, 2),
bass = (ch, v) =>
	rise(12, 20, fade(128, 96)) * (.7 * sqr(gen(0, -1, v)) + .2 * sqr(gen(0, -2, v))),
lead = ch => fade(192, 32) * (
	.7 * echo(sqr, ch, rise(24, 32), .5, 3, 1, 14, 8) +
	echo(tri, ch, rise(80, 16), .5, 3, 1, 16, 8, 4, 4)),

// Output
[arp1(0, 10) * pan(0, r = rise(0, 32)) + arp2(0, 10) * pan(0, .8, .8) + bass(0, 12) + lead(0) * pan(1, .8),
 arp1(1, -8) * pan(1, r) + arp2(1, -8) * pan(1, .8, .8) + bass(1, -10) + lead(1) * pan(0, .8)];
