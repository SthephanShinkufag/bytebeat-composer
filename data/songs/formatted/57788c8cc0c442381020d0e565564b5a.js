t /= 44100, // Sample rate
b = (100 /* Tempo */ * t / 60) % 224 /* Song length */,
D = 294, EE = 330, G = 392, A = 440, B = 494,

seq = (a, i) => a[(i | 0) % a.length],
vibr = amp => t + amp * 1E-4 * sin(33 * t),
noise = (pitch, tempo, a) => seq(a, b * tempo) * (1E5 * sin((t * pitch | 0) ** 2) & 255),
square = (del, pitch, tempo, v, a) => 25 * (pitch * vibr(v) * seq(a, (b - del) / tempo) % 2 | 0),
triang = (del, pitch, tempo, v, a) => abs(pitch * vibr(v) * seq(a, (b - del) / tempo) * 64 % 64 - 32 | 0),
reverb = (fn, ch, del, ...x) => [0, 1, 2, 3, 4].reduce((sum, i) =>
	sum + (!i || !ch || ch == (i % 2 || 2) || .3) * (1 - i / 6) * fn(del * i, ...x), 0),

rise = (start, len, x = 1) => b < start ? 0 : b < start + len ? (b - start) / len : x,
fade = (start, len) => b < start ? 1 : b < start + len ? 1 - (b - start) / len : 0,
drums = a => b < 160 && rise(80, 32) * noise(2E4, 8, a) / 20,
bass = v => b > 96 && fade(192, 24) * square(0, .25, 16, v, [EE, G]),
arpArr = [EE / 2, B / 2, D, EE, G, B, D * 2, G * 2, EE / 2, B / 2, D, EE, G, B, D * 2, EE * 2],
arpSqr = (ch, v) => rise(32, 32, fade(192, 32)) * reverb(square, ch, .5 + rise(64, 8) / 4, 2, .5, v, arpArr),
arpTri = (ch, v) => rise(0, 32, fade(32, 32)) * reverb(triang, ch, .5 + rise(24, 16) / 3, 2, .5, v, arpArr),
lead = (fn, v, pitch) => rise(72, 16, fade(160, 48)) * .7 * reverb(fn, 0, .6, pitch, 2, v,
	[EE, D, G, A, B, A, G, A, EE, D, G, A, B, A, G, D]),

[(drums('10040010030000004030202020201010') + bass(-8) +
	arpSqr(1, 4) + arpTri(1, 4) + .6 * lead(square, 6, 4) + lead(triang, 6, 1.5) - 127) / 128,
(drums('40010030010020000403020202020101') + bass(8) +
	arpSqr(2, 6) + arpTri(2, 4) + .6 * lead(square, 4, 3) + lead(triang, 4, 2) - 127) / 128];
