t /= 44100, // Sample rate
bpm = 105, // Song speed
len = 256, // Song length
b = (bpm * t / 60) % len,

// Notes
C = 262, Db = 277, D = 294, Eb = 311, EE = 330, F = 349,
Gb = 370, G = 392, Ab = 415, A = 440, Bb = 466, B = 494,

// Wave modifier
wave = amp => amp * 1E-4 * sin(44 * t),

// Square arpeggiator
arp = echo => (i = b - echo, 25 * ((b & 16 ? 4 : 2) * (t + ((b & 32) && wave(6))) * [
	C, D, G,
	D, Gb, A,
	EE, G, B,
	D, Gb, A,
	C * 2, D, G,
	D * 2, Gb, B,
	EE * 2, G, B,
	D * 2, Gb, A
][3 * ((i >> 1) % 8) + int((b & 64 ? 22 : 2) * i) % 3] % 2 | 0)),

// Square bass pad
pad = (pitch, echo) => 20 * int(.7 * (pitch * (t + wave(4)) * [
	C, D, EE, D, C, D, B / 2, C
][((b - echo) >> 1) % 8] % 2)),

// Hi-hats
((b & 16 | b & 32) &&
	(1E4 * sin((128 * t * '11101000100010001100101010001000'[int(8 * b) % 32]) ** 2) & 255) / 10) +
// Kick
((b & 32) && 55 * int(b * (256 >> 32 * b) % 2)) +
// Arpeggio
arp(0) + .8 * arp(.4) + .6 * arp(.8) +
// Bass pad
pad(1, 0) + pad(1.5, 1) + .5 * pad(2, 1);
