t /= 44100, // Sample rate
beat = 115 /* Tempo */ * t / 60,
bar = beat >> 2,
C = 65.40639, // C2 note in Hz
F = 43.65353, // F1 note in Hz
// Differently tempered diatonic scales:
// just:        scale = n => C * (1 << n / 7) * [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8][n % 7],
// pythagorean: scale = n => C * (1 << n / 7) * [1, 9/8, 81/64, 4/3, 3/2, 27/16, 243/128][n % 7],
// pythagorean: scale = n => C * (1 << 8 * (n % 7 + 1) % 11 + n / 7) / 3 ** (6 - 2 * (n + 4) % 7) / 1.0535,
// equal:       scale = n => (n += 4, F * (1 << n / 7) * 1.0594 ** (2 * n % 14 - (n % 7 > 3))),
scale = n => (n += 4, F * (1 << n / 7) * 1.0594 ** (2 * n % 14 - (n % 7 > 3))),
vibrato = (amp, freq) => t + amp * 15E-6 * sin(freq * t),
triang = (n, va, vf) => abs(scale(n) * vibrato(va, vf) * 64 % 64 - 32),
pad = n => triang(17 - bar % 4 + n, 25, 40),

// Lead
triang((2 * beat ^ bar + 3) % 12 + 14, 30, 30) +
// Chords (four parallel thirds)
.3 * (pad(0) + pad(2) + pad(4) + pad(6)) +
// Bass
.5 * pad(-14);
