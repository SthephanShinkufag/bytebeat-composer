/*
 * tridecagon sequence
 * by argarak
 *
 * use https://dollchan.net/bytebeat/
 * for playback at 44100Hz
 */

c = t / 35,

// fancy new 'AD' envelope
e = (s, a, l, n) => {
	x = exp(-((s % 40) * n) * l);
	y = sqrt(a * (s % 40) * n);
	return y < x ? 2 * y : 2 * x;
},
ia = n => int(abs(n)),
ws = (s, w) => sin(w ** (s % 2)),

nC = 2.97, nC_ = 3.14, nD = 3.33, nD_ = 3.53, nE = 3.735, nF = 3.96, nF_ = 4.195, nG = 4.445,
nG_ = 4.71, nA = 4.99, nA_ = 5.285, nB = 5.595,

notes = [nC, nD, nD, nF, nG, nG_, nA_],
chord_env = e(c / 100, .001, 0.05, 1.9),

// looping sequence
i = t % 84e5,

mixer = [],
// kik, snr, hat, blip, chords, bass, mel
i > 79e5 ? mixer = [0, 1, 1, 0, 1, 0, 1, 1] :
i > 75e5 ? mixer = [1, 1, 1, 0, 1, 0, 1, 0] :
i > 69e5 ? mixer = [0, 0, 1, 0, 1, 0, 1, 0] :
i > 55e5 ? mixer = [1, 0, 1, 0, 0, 1, 1, 0] :
i > 50e5 ? mixer = [1, 1, 1, 1, 1, 1, 0, 1] :
i > 38e5 ? mixer = [1, 1, 1, 1, 1, 1, 0, 0] :
i > 30e5 ? mixer = [1, 0, 0, 0, 1, 1, 0, 0] :
i > 25e5 ? mixer = [1, 0, 0, 1, 1, 0, 0, 1] :
i > 20e5 ? mixer = [0, 0, 0, 1, 1, 0, 0, 0] :
i > 14e5 ? mixer = [1, 1, 1, 1, 0, 0, 0, 0] :
i > 12e5 ? mixer = [1, 1, 0, 1, 0, 0, 0, 0] :
i > 7e5 ? mixer = [1, 0, 0, 1, 0, 0, 0, 0] :
i > 0 ? mixer = [0, 0, 0, 1, 0, 0, 0, 0] : 0,

128 +
// kik
sin(log([0.04, 0.2][ia((c / 2000) % 2)] + (c / 80) % 10) * 40) * [18, 22][ia((c / 800) % 2)] *
e(c / 20, 10, 0.9, 0.20) * mixer[0] +

// snr
sin(sin(c * 10) * (log(0.9 + (c / 1) % 4) * 400000)) * 18 *
e((3 + c) / 40, 10, 0.5, 1.0) * mixer[1] +

// hat
sin(sin(c * 10) * (log(0.9 + (c / 1) % 4) * 400000)) * 10 *
e(c / 5, .4, [0.5, 0.2][ia((c / 200) % 2)], 1.20) * mixer[2] +

// blippy
ws((c / 7.15) * [nD_, nC, nA_, nG, nA_, nD_, nC, nG_, nC, nD, nC, nA_, nG][ia((c / 200) % 13)],
	1.4 + ia(sin(c / 3000) * 4)
) * 20 * e(c / 5, 2, [0.03, 0.1][ia((c / 2000) % 2)], 1.9) * mixer[3] +

// chords
(
	ws((c / 7.15) * [nD_, nC, nA_][ia((c / 3000) % 3)], 2.8) +
	ws((c / 7.15) * [nF, nG, nG_][ia((c / 1000) % 3)], 2.4) +
	ws((c / 7.15) * [nA_ / 2, nD / 2, nC][ia((c / 4000) % 3)], 2.0)
) * 34 * chord_env * mixer[4] -

// bass
ws((c / 7.15) / 4 * [nA_ / 2, nD / 2, nC][ia((c / 4000) % 3)], 3.7) * 12 *
(e(c / 20, 0.3, 0.09, 0.20) + 0.2) * mixer[5] +

// mel
ws((c / 7.15) * notes[ia(((c / 800) << 13) % 7)], 2.7) * 20 *
e(400 + c / 40, 0.008, 0.05, 1.9) * mixer[6] +

// unexpected cymbal! (just boring aliasing noise)
sin(sin(c * 10) * (log(0.2 + (c / 1) % 4) * 40000)) * 10 *
e(c / 50, 10, [0.5, 0.2][ia((c / 200) % 2)], 1.20) * 2 * mixer[7];
