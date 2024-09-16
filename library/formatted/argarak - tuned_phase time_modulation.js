/*
 * tuned_phase time_modulation
 * by argarak
 * adapted for bytebeat players by SthephanShi
 */

dc = 128,
decreaseAmount = 20,
slowDownStartSample = 120 * 44100,
slowDownSpeed = 10000,
tempo = t === 0 ? 80 : t > slowDownStartSample &&
	t < slowDownStartSample + decreaseAmount * slowDownSpeed &&
		t % slowDownSpeed === 0 ? tempo - 1 : tempo,

// Control speed and conversion from 8 to 44.1kHz
a = tempo / 441 * t,

bd = function(s, vol) {
	if((s / 50) % 80 > 60) {
		return sin(((s / 1) % 1000) ** 0.5) * (vol - (s / 50) % vol);
	}
	return 0;
},

sd = function(s) {
	const speed = 50;
	if((s / 50) % 200 < 20 || (s / 50) % 180 > 160) {
		return (
			sin(((s / 2) % 1000) ** 0.2) * (20 - (s / speed) % 20) / 2 +
			random() * (20 - (s / speed) % 20) ** 0.8 / 2
		);
	}
	return 0;
},

hi = function(s) {
	const speed = 50;
	if((s / 50) % 200 > 100 || (s / 50) % 140 > 90) {
		return random() * (20 - (s / speed) % 20) ** 1.77 / 50;
	}
	return 0;
},

tunes = [0.10265, 0.1088, 0.1153, 0.122, 0.1293, 0.1373, 0.1453, 0.154, 0.163, 0.173, 0.183, 0.194],

delayer = function(s, vol) {
	if(s <= 0) {
		return 0;
	}
	if((s / 50) % 200 > 180) {
		return (
			sin(
				s * tunes[int((s / 4000) % 12)] +
				sin(s * 0.5 * tunes[int((s / 4000) % 12)]) *
				0.5 *
				(vol - (s / (4000 / vol)) % vol)
			) *
			(vol - (s / (4000 / vol)) % vol)
		);
	}
	return 0;
},

delaytest2 = s => delayer(s, 10) + delayer(s - 6000, 5) + delayer(s - 10000, 2),

C = 0.10265,
C_ = 0.1088,
D = 0.1153,
D_ = 0.122,
E = 0.1293,
F = 0.1373,
F_ = 0.1453,
G = 0.154,
G_ = 0.163,
A = 0.173,
A_ = 0.183,
B = 0.194,

chord_seq = [
	[C, F, G, G / 2],
	[D_, A_, A_, C],
	[F, C * 2, D * 2, F],
	[A_, D * 2, F * 2, G_]
],

subbass = s => sin(s * 0.5 * chord_seq[int((s / 30000) % 4)][0]) * 5,

chord = function(s) {
	const speed = 30000;
	return (
		sin(
			s * 2 * chord_seq[0][int((s / speed) % 4)] +
			sin(s * 1 * chord_seq[0][int((s / speed) % 4)]) *
			((s / (speed / 2.5)) % 2.5)
		) *
		((s / (speed / 5)) % 5) +
		sin(
			s * 2 * chord_seq[1][int((s / speed) % 4)] +
			sin(s * 1 * chord_seq[1][int((s / speed) % 4)]) *
			((s / (speed / 2.5)) % 2.5)
		) *
		((s / (speed / 5)) % 5) +
		sin(
			s * 2 * chord_seq[2][int((s / speed) % 4)] +
			sin(s * 1 * chord_seq[2][int((s / speed) % 4)]) *
			((s / (speed / 2.5)) % 2.5)
		) *
		((s / (speed / 5)) % 5) +
		sin(
			s * 2 * chord_seq[3][int((s / speed) % 4)] +
			sin(s * 1 * chord_seq[3][int((s / speed) % 4)]) *
			((s / (speed / 2.5)) % 2.5)
		) *
		((s / (speed / 5)) % 5)
	);
},

lead_seq = [A_, D * 2, F * 2, G_, F, C * 2, D * 2, F, D_, A_, A_, C, C, F, G, G / 2],

somethinglead = s =>
	3 * ((sin(
		s * lead_seq[int(abs(sin(s * 0.00001) * 16))] +
		(sin(s * 2 * lead_seq[int(abs(sin(s * 0.00001) * 16))]) * (((s / 2000) % 4) ^ 2)) % 5
	) * (((s / 1000) % 3) ^ 2)) % 5),

// Mix everything together
dc +
	bd(a, 20) +
	sd(a, 10) * (t > 44100 * 5 ? 1 : 0) +
	hi(a, 10) * (t > 44100 * 5 ? 1 : 0) +
	delaytest2(a, 10) * (t > 44100 * 10 ? 1 : 0) +
	subbass(a, 10) * (t > 44100 * 30 ? 1 : 0) +
	chord(a, 10) * (t > 44100 * 30 ? 1 : 0) +
	somethinglead(a) * (t > 44100 * 60 ? 1 : 0);
