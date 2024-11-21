// v = check at what section we are
v = t >> 12,
// Repeat song
v %= 1152,
// Patterns:
// NOTE: some patterns that are commented out here are placed inside the synth scripts themselves,
//   as they don't need any post-processing
// Start theme
D = '881146',
// Start theme major
X = D.replace(/4/g, 5),
// Drums
F = '1       1 1 ',
// Couplet 1
G = '888888111111468888111146',
// Couplet 1b (major)
I = G.replace(/4/g, 5),
// Base for intro
J = '8=',
// Chorus
L = '==;;1188--468888',
N = '==449;==449;;;4489;;4489881146881146881146881146',

M = function(p, o, q, m, s) {
	// Get absolute pitch from semitone.
	g = t * pow(2, (m.charCodeAt(q) + p) / 12 - o);
	// This section is used by both saw and triangle wave (as tri is nothing more than abs(saw))
	x = (g % 128) / 64 - 1;
	// The real magic: decide between pulse, saw and triangle and synthesize them.
	return s ? s < 2 ? x : abs(x) : (g & 128) / 64 - 1;
},

// Intro
0.2 * ((v < 192 ? M(0, 4, (v >> 1) % 6, (v % 96) < 48 ? D : X, 2) + (v % 6 ? 0 : M(0, 5, 0, '1', 0)) :
// First part
v < 192 * 2 ? (
	(v % 96) < 48 ?
		M(v % 192 < 96 ? 12 : 10, 6, (v >> 1) % 24, v % 192 < 96 ? G : I, 2) :
		M(v % 192 < 96 ? 7 : 5, 6, (v >> 1) % 6, D, 2)
) + M(v % 192 < 96 ? 12 : 10, 7, (v % 96) < 48, J, 2) :
// First part repeated with different synths
v < 192 * 3 ? (
	(v % 96) < 48 ?
		M(v % 192 < 96 ? 12 : 10, 6, (v >> 1) % 24, v % 192 < 96 ? G : I, 0) :
		M(v % 192 < 96 ? 7 : 5, 6, (v >> 1) % 6, D, 1)
) + M(v % 192 < 96 ? 12 : 10, 7, (v % 96) < 48, J, 2) :
// First part repeated with different synths
v < 192 * 4 ? (
	(v % 96) < 48 ?
		M(v % 192 < 96 ? 12 : 10, 6, (v >> 1) % 24, v % 192 < 96 ? G : I, 1) :
		M(v % 192 < 96 ? 7 : 5, 6, (v >> 1) % 6, D, 1)
) + M(v % 192 < 96 ? 12 : 10, 7, (v % 96) < 48, J, 2) :
// Chorus
+M(0, 5, (v >> 1) % 48, N, 0) + M(0, 6, (v / 12) % 16, L, 1)) +
	// This number is the reverse binary representation of 100100010001000000000001010101000001010100000001,
	//   which is the drums pattern.
	// By doing num>>[0-48] every time, it loops through the pattern.
	// If it finds a one, it plays noise. Otherwise nothing is heard.
	(159497927791873 >> (v % 48) & 1 ? random() : 0));
