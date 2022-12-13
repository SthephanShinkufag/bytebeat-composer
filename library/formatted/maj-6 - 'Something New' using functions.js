beat = t >> 13, // Beat counter
bar = beat >> 3,

tuning = .08, // Adjust base frequency of scale

// I've worked out the following formulas for differently tempered diatonic scales:
// just:        r = n => (1 << n / 7) * [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8][n % 7],
// pythagorean: r = n => (1 << 8 * (n % 7 + 1) % 11 + n / 7) / 3 ** (6 - 2 * (n + 4) % 7),
// equal:       r = n => (1 << n/7) * 1.0594 ** (2 * n % 14 - (n % 7 > 3)),
r = n => (1 << n / 7) * 1.0594 ** (2 * n % 14 - (n % 7 > 3)),

// Triangle wave using equal temperament formula. vp, va = vibrato period, amplitude.
// The "n+4" here is because my original pythagorean formula gives a lydian mode
// while the equal and just formulas give a classic diatonic scale.
tri = (n, vp = 600, va = 5) => abs(tuning * r(n + 4) * (t + va * sin(t / vp)) % 64 - 32),

// Four parallel thirds
chord = n => tri(n) + tri(n + 2) + tri(n + 4) + tri(n + 6),

// Melody
m = (beat ^ bar + 3) % 12 + 14,

root = 17 - bar % 4,

tri(m, 450, 2) +
	.3 * chord(root) +
	.5 * tri(root - 14);
