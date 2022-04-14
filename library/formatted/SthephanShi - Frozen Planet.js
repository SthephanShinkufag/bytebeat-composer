t /= 44100, // Sample rate
bpm = 105, // Song speed
len = 224, // Song length
b = (bpm * t / 60) % len,

// Notes
C = 262, Db = 277, D = 294, Eb = 311, EE = 330, F = 349,
Gb = 370, G = 392, Ab = 415, A = 440, Bb = 466, B = 494,

u = b & 16 ? 2 : 1,

// Square-wave arpeggiator
arp = (pitch, echo = 0, pattern = 22) => (i = b - echo, (pitch * u * t * [
	A / 2, Db, Gb,
	Gb, A, Db * 2,
	Gb, B, D * 2,
	Gb, B, Gb * 2,
	A / 2, Db, Gb,
	Gb, A, Db * 2,
	Gb, B, D * 2,
	A, EE * 2, A * 2
][3 * ((i >> 1) % 8) + int(pattern * i) % 3] % 2) << 4),

// Square-wave pad with floating frequency
pad = (pitch, echo = 0) => 20 * int(.7 * (pitch * u * (t + 3E-4 * sin(44 * t)) * [
	Gb / 2, Db, D, Gb, Gb / 2, Db, D, A
][((b - echo) >> 1) % 8] % 2)),

b1 = b < 64,
b2 = b < 160,
48 +
// Hihat
((b > 16 && b1 || b > 80 && b2) &&
	(1E4 * sin((128 * t * '10001010'[int(8 * b) % 8]) ** 2) & 255) / 13) +
// Kick
((b > 32 && b1 || b > 128 && b2) && 56 * int(b * (256 >> 32 * b) % 2)) +
// Bass
(b2 && 38 * int((t * [
	Db, D, Db, B / 2,
	Db, D, EE, Gb,
	Db, D, Db, B / 2,
	Db, Gb, A, Ab
][int(2 * b) % 16] >> 1) % 2)) +
// Pad
(!b1 && pad(1) + pad(2, 1) + .8 * pad(3)) +
// Arpeggio
((b1 || b > 96 && b2) && arp(2) + .7 * arp(2, .4) + .5 * arp(2, 1)) +
// Arpeggio High
(!b2 && 1.7 * arp(2, 0, 4) + arp(4, .3, 4));
