t /= 44100, // Sample rate
b = (112 /* Tempo */ * t / 60) % 160 /* Song length */,

// Notes
C = 262, D = 294, F = 349, G = 392, A = 440,
a1 = [D, F, G, A, D, F, G, C],
a2 = [D, C, F, C, G, D, A, D, C, D, F, C, G, D, C, D],
a3 = [D, F, G, A, D, A, F, G, A, F, G, A, D, A, F, C],
a4 = [D, C, F, G, A, D, F, G, D, C, F, G, A, D, F, C],

seq = (a, i) => a[(i | 0) % a.length],
wave = amp => t + amp * 1E-4 * sin(40 * t),
noise = (a, pitch, speed) => seq(a, b * speed) * (int(1E5 * sin(int(t * pitch) ** 2)) & 255),
square = (a, pitch, echo, speed = .5) => 16 * int(pitch * wave(5) * seq(a, (b - echo) * speed) % 2),
triang = (a, pitch, echo) => .14 * abs(((255 * pitch * wave(4) * seq(a, b - echo)) & 255) - 128),
reverb = (fn, a, p, e) => fn(a, p, 0) + .8 * fn(a, p, e) + .6 * fn(a, p, 2 * e) + .6 * fn(a, p, 3 * e),

b1 = b > 32 && b < 128,
// Kick
(b1 && 50 * int(b * (256 >> 32 * b) % 2)) +
// Hi-hat
noise('1000000010001000111111001000100010000000111111001000000011111100', 3E4, 16) / 9 +
// Snare
(b > 28 && b < 32 && noise('0020201022002122', 32E2, 4) / 9) +
(b1 && noise('0010001000100011', 34E2, 2) / 5) +
// Basses
.6 * square(a1, 1, 0) + square(a1, 1.5, 1) + square(a1, 2, 1) +
(b1 && .8 * square(a2, .5, .5, 1)) +
// Square leads
(b > 96 && .6 * reverb(square, a4, 4, .5)) +
(b > 128 && .4 * reverb(square, a4, 6, .7)) +
// Triangle leads
(b > 48 && b < 128 && reverb(triang, a3, 4, b > 80 ? .5 : .4)) +
(b > 80 && b < 96 && .8 * reverb(triang, a3, 3, .5));
