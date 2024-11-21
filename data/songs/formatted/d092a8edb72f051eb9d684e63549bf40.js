T = t / 1.2,
b = (T >> 18) % 12, // Musical measure
bass = (arr, start) =>
	b >= start && (.88 * t * 2 ** (arr[i = 7 & T >> 15] / 12) & -T >> 6) % 256 / 5,
square = (seq, pitch, vibr = 0) =>
	.44 * pitch * (t + vibr * sin(t / 7E2)) * 2 ** ([a, a1, a2, a1][3 & T >> seq][i] / 12) & 32,

// Bass chord
bass(a = [0, 3, 5, 7, 0, 3, -4, -2], 0) +
bass(a1 = [3, 7, 9, 11, 3, 7, 0, 2], 1) +
bass(a2 = [7, 10, 12, 14, 7, 10, 3, 5], 2) + [
	// First beat
	square(15, 2) + (b < 3 && square(14, 1)), // Flat squares
	// Second beat
	(square(9, 1) + (b < 5 && square(14, 2))) * (1.9 - T % 8192 / 6E3) + // Fading away squares
	(b > 1 && random() * (28 - T % 8192 / 500)) + // Hi-hat
	(b > 4 && .8 * square(b > 6 ? 14 : 15, 2, 9)) // Flat vibrato square
][1 & T >> 13] + // First / second beat selector
(b > 2 && square(14, 1, 14)) + // Low lead vibrato square
(b > 6 && .7 * square(17, 4, 12)); // High lead vibrato square
