// Musical measure
b = t >> 19,
d = b % 4 != 1,
// Sequences filtering
filter = (pattern, speed) => pattern >> (t >> speed) & 1,
// Noise generator
noise = pitch => .3 * (1E6 * sin(t / 1E2 * pitch | 0) & 64),
// Square generator
square = (arr, time, speed, pitch = 1, vibr = 0) =>
	2.1 * (time + vibr) / pitch * 2 ** (arr[time >> speed & (arr.length - 1)] / 12) & 128,
// Main theme
melody = time => time > 0 && (b > 5 ? .45 : .6) *
	square([
		// Original motif by Decent-Manager-6169
		8, 0, -7, 5, 0, -7, 8, 0, -7, 5, 0, -7, 8, 0, 5, -7, 10, 0, -7, 5, 0, -11, 10, 1, -7, 7, 3, -2, 10, 3,
		-2, 7, 12, 0, -7, 8, 0, -7, 12, 0, -7, 8, 0, -7, 12, 0, 8, -7, 12, 0, -7, 8, 0, -7, 12, 0, 10, 1, 3,
		7, -2, 3, 5, 7, 8, -4, -11, 5, -4, -11, 8, -4, -7, 5, -4, -11, 10, -4, 5, -7, 7, -2, -9, 3, -2, -9, 7,
		-2, -9, 3, -9, -2, 8, 7, 5, 10, 12, 0, -7, 8, 0, -7, 12, 0, -7, 8, 0, -7, 12, 0, 8, -7, 12, 0, -7, 8,
		0, -7, 12, 0, 10, 1, 3, 7, -2, 3, 5, 7
	], time, 12) *
	// Adjustable decay
	(1 - time % 4096 / 4224 / (d ? 1 : 1 + (time >> 16) % 8 / 4)),
// Lead synth
lead = (time, pitch) => .18 *
	// Vibrato squares (bass theme by Rio zack)
	square([8, 10, 12, 12, 8, 7, 5, 7, 8, 10, 12, 15, 10, 12, 5, 5], time, 16, pitch, 14 * sin(time / 1E3)) *
	// Adjustable interruption
	(b > 5 && d ? filter(b + 1 & 4 ? 0x5555D555 : 0xD75D5755, 11) : .8),

// Main melody with 3x echo
melody(t) + (b && b != 5 && melody(t - 4096) / 2) + melody(t - 8192) / 3 +
(b > 1 && d &&
	// Kick
	28 * (sin(19 * cbrt(t / 4 % 2048)) + 1) * filter(0xD555F555, 13) +
	// Hi-hats
	noise(80) * filter(0x51111111, 10) / 2 +
	(t & 8192 && noise(99) * (1 - t % 8192 / 12E3))) +
(b > 2 &&
	// Bass
	.16 * square([5, 5, 7, 3, 5, 5, 5, 3, 1, 1, 3, 3, -2, -2, -2, 1], t, 15, 4) +
	// Snare
	(d && noise(19) * filter(0xC4444444, 13))) +
// Lead synth with "flanger" effect
(b > 4 && lead(t, .5) + .4 * lead(t - 4096, .5) + lead(t) / 2);
