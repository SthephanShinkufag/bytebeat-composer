t || (
	A = Array(n = 16E3), // Echo array
	I = [4, 7, 11], // Arpeggio pattern
	J = [0, 2, ...I, 7, 4, 2, 0, 2, ...I, 14, 11, 7]), // Lead synth pattern
b = 2.5E-5 * t % 192, // Musical beat
T = 8 * b, // Musical bar

// Generators
square = (arr, speed, pitch, vibr = 0) => ((t + vibr * sin(t / 1E3)) *
	2 ** (pitch + arr[T / speed % arr.length | 0] / 12 + ((1 - (T >> 5 & 3)) % 2 + 2) / 4) & 128) / 4,
noise = p => 1E5 * sin(T * p | 0) & 64,

// Effects
rise = (start, len, x = 1) => b < start ? 0 : b < start + len ? (b - start) / len : x,
fade = (start, len) => b < start ? 1 : b < start + len ? 1 - (b - start) / len : 0,
drop = (tempo, hold) => 1 - T % tempo / hold,
mask = (pattern, speed) => pattern >> (T >> speed) & 1, // Sequences filtering

// Timing constants
k = b > 80,
l = b < 160,
m = k && b < 112,

// Instruments with echo effect
echo = (A[t % n] || 0) + // Playing saved echo from cache
	// Lead synth
	.8 * rise(0, 12, fade(128, 64)) * square(J, b > 112 ? 16 : k ? 8 : 2, 0, k ? 16 : 8) +
	// Arpeggio
	(b > 16 && 1.6 * fade(l ? 96 : 160, 32) * square(I, .2, 1) * drop(6, 9) *
		drop(2, b > 96 ? 2 : 2 + rise(48, 16, 3))) +
	// End arpeggio
	1.4 * rise(96, 32, fade(144, 40)) * square(I, 2, 1) * drop(6, 9) * drop(2, 3) +
	// Hi-hat
	(l && rise(12, 16) * noise(1E6) *
		(m ? drop(8, 9) * mask(0xAAAAAAAA, 2) / 2 : drop(1, 1) * mask(b > 48 ? 0xCCCCCCCC : 0xD4454444) / 3)),
A[t % n] = echo / 3, // Save weakened echo in cache

// Output
min(echo + (l &&
	// Dreamy arpeggio
	(b > 48 && 1.5 * square(I, .2, 0) * drop(2, 2.3)) +
	// Bass
	rise(8, 8, fade(144, 32)) * square(J, 0, -2) * drop(2, 2.4) +
	(b > 32 &&
		// Kick
		32 * (sin(80 * (T % (m ? 8 : 4)) ** .4) + 1) +
		// Snare
		.7 * noise(360) * drop(2, 4) * (m ? (T & 8) && drop(8, 9) : mask(0xA444C444, 1)))
), 255) / 128 - 1; // Limit the output to 0..255 and convert to -1..1
