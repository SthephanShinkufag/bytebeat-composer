// GLOBALS
volume = 95,
sample_rate = 44100,
bpm = 188,
tempo = Math.floor((32 / bpm) * sample_rate),
fm1out = sqr = puls = 0,
kb = 0b000001,
sb = 0b000010,
hb = 0b000100,
fb = 0b001000,
qb = 0b010000,
pb = 0b100000,
chans = 0,

/* RAM
	 0 rhythm counter
	 1 beat counter
	 2 long beat counter
	 4 kick trigger pos in time
	 5 snar trigger pos in time
	 6 snar filter ram
	 7 little snare time
	 8 hats
	 9 hats vol
	20 fm pos
	21 fm note
	30 sqr pos
	31 sqr note
	32 puls pos
*/
typeof ram == 'undefined' || t == 0 ? ram = Array(256).fill(0) : 0,

// BEAT FUNCTIONS
t % tempo == 0 ? ram[1]++ : 0,
beat = ram[1],
get_beat = function(seq_length) {
	return beat % seq_length;
},
if_beat = function(seq_length, beat_pos) {
	return beat % seq_length == beat_pos && t % tempo == 0;
},
if_euclid = function(beat_length) {
	return t % (tempo * beat_length) == 0;
},

// PITCH
note_hertz = function(steps_from_a) {
	return 420.69 * Math.pow(1.059463, steps_from_a);
},

// OSCILLATORS
noise_wave = function() {
	return Math.random() - 0.5;
},
square_wave = function(frequency) {
	duty_length = sample_rate / frequency;
	duty_on = t % duty_length > duty_length / 2 ? 0 : 1;
	return duty_on - 0.5;
},
pulse_wave = function(frequency, duty) {
	duty_length = sample_rate / frequency;
	return (t % duty_length > duty_length * duty) - 0.5;
},

saw_wave = function(frequency) {
	duty_length = sample_rate / frequency;
	return (t % duty_length) / duty_length - 0.5;
},

sine_wave = function(frequency) {
	duty_length = sample_rate / frequency;
	return Math.sin(t / duty_length * (2 * Math.PI)) / 2;
},
triangle_wave = function(frequency) {
	duty_length = sample_rate / frequency;
	pos = (t % duty_length) / duty_length;
	return (pos <= 0.5 ? pos * 2 : (1 - pos) * 2) - 0.5;
},
fm = function(freq, mod) {
	// car_frequency is in hertz
	// mod_sine is -1 .. 1
	duty_length = sample_rate / freq;
	return Math.sin(Math.PI * (t / duty_length + mod));
},
// Run sample against decay envelope
fm1 = function(p, i, len) {
	// p = pitch
	// i = ram position
	// len = number of seconds for decay
	// s = fm(p / 4, 0) * decay_exponential(ram[i], sample_rate * len, 10);
	s = fm(p * 3, 0) * decay_exponential(ram[i], sample_rate * len, 10);
	s = fm(p * 1, s) * decay_exponential(ram[i], sample_rate * len, 30);
	return s;
},

// FILTERS
lopass = function(s, cut, addr) {
	s_p = ram[addr];
	s = s > s_p ?
		// waveform up
		s - s_p > cut ? s_p + cut : s :
		// waveform down
		s_p - s > cut ? s_p - cut : s;
	ram[addr] = s;
	return s;
},
hipass = function(s, cut, addr) {
	s_n = lopass(s, cut, addr);
	s = -(-s + s_n) / 2;
	ram[addr] = s;
	return s;
},

// ENVELOPES
decay_exponential = function(start, length, curve) {
	if(start + length < t) {
		return 0;
	}
	e_pos = (length - (t - start)) / length;
	return Math.pow(e_pos, curve);
},

// SEQUENCE LOGIC UPDATES
section_a = function() {
	if_beat(2 << ((beat >> 6) % 4), 0) ? ram[0]++ : 0;

	beat1 = function() {
		// Kick
		if((chans & kb) && (if_beat(8, 0) || if_euclid(14) || if_euclid(7))) {
			ram[4] = t;
		}
	},
	beat2 = function() {
		if(chans & kb) {
			if_beat(8, 4) ? ram[5] = t : 0;
			(if_euclid(7) || if_euclid(1)) && Math.random() > 0.67 ? ram[7] = t : 0;
		}
	},
	dobeats = function(pos) {
		if(pos % 2 == 0) {
			beat1();
		}
		if(pos % 2 == 1) {
			beat2();
		}
	},
	dobeats(ram[0]);

	// FM LOGIC
	if(chans & fb) {
		(beat >> 2) % 4 == 0 ? ram[21] = (ram[21] + 1) % 12 : 0;
		beat % 4 == 0 ? ram[20] = t : 0;
		fm1out = 0.25 * fm1(note_hertz(-24 + ram[21]), 20, 3);
	}

	// SQR LOGIC
	if(chans & qb) {
		if_euclid(7) || if_euclid(21) ? ram[30] = t : 0;
		if_euclid(7) || if_euclid(21) ? ram[31] = t % 15 : 0;
	}
	sqr = square_wave(note_hertz(ram[31] + ram[21]));
	sqr += square_wave(note_hertz(ram[31] + ram[21]) * 0.999);
	sqr += square_wave(note_hertz(ram[31] + ram[21] + 3));
	sqr += square_wave(note_hertz(ram[31] + ram[21] + 19)) * 0.5;
	sqr *= decay_exponential(ram[30], 255000, 4) * 0.25;

	if(chans & pb) {
		puls = pulse_wave(note_hertz(ram[21] - 36), (sine_wave(2.5) + 1) * 0.5);
		puls += pulse_wave(note_hertz(ram[21] - 24), (sine_wave(2.501) + 1) * 0.5);
		puls *= 0.4;
	}
},

section_b = function() {
	// Kik
	if((chans & kb) && (if_beat(64, 0) || if_euclid(19) || (if_euclid(2) && (t >> 5) % 8 < 1))) {
		ram[4] = t;
	}
	// Snar
	if((chans & sb) && if_beat(16, 8)) {
		ram[5] = t;
	}
	// Hat
	if(chans & hb) {
		if_beat(8, 2) || if_euclid(5) || if_euclid(7) ? ram[8] = t : 0;
	}
	// Sqr
	if((chans & qb) && (
		if_beat(16, 0) || if_beat(16, 2) ||
		(if_beat(16, 4) && (t >> 7) % 4 < 2) ||
		(if_beat(16, 15) && (t >> 4) % 8 < 3)
	)) {
		ram[30] = t;
	}
	sqr = square_wave(note_hertz(ram[31] + ram[21]));
	sqr += square_wave(note_hertz(ram[31] + ram[21]) * 0.999);
	sqr += square_wave(note_hertz(ram[31] + ram[21] + 3 + (1 & (((t >> 13) % 8) < 3))));
	sqr += square_wave(note_hertz(ram[31] + ram[21] + 19)) * 0.5;
	sqr *= decay_exponential(ram[30], 25500, 8) * 0.25;
},

songong = [{
	b: 16,
	c: kb | sb | hb | qb | fb | pb,
	f: section_a
}, {
	b: 96,
	c: kb | sb | qb,
	f: section_b
}, {
	b: 128,
	c: kb | sb | hb | qb | fb,
	f: section_a
}, {
	b: 192,
	c: kb | sb | hb | qb | fb,
	f: section_b
}, {
	b: 256,
	c: kb | sb | hb | qb | fb | pb,
	f: section_a
}, {
	b: 392,
	c: kb | sb | hb | qb | fb | pb,
	f: section_b
}, {
	b: 420,
	c: kb | sb | hb | qb | fb,
	f: section_a
}, {
	b: 480,
	c: kb | sb | hb | qb | fb | pb,
	f: section_b
}, {
	b: 496,
	c: kb | sb | hb | qb | fb,
	f: section_a
}, {
	b: 512,
	c: kb | sb | hb | qb | fb,
	f: section_b
}, {
	b: 548,
	c: kb | sb | qb | fb,
	f: section_b
}, {
	b: 612,
	c: sb | qb | fb,
	f: section_b
}, {
	b: 666,
	c: kb | sb | hb | qb | fb,
	f: section_b
}, {
	b: 680,
	c: kb | sb | qb | fb,
	f: section_b
}],

section_runner = function() {
	section = 0;
	for(i = 0; i < songong.length; i++) {
		if(beat > songong[i].b) {
			section++;
		} else {
			continue;
		}
	}
	if(section < songong.length) {
		chans = songong[section].c;
		songong[section].f();
	}
},

section_runner(),

// KICK
ke = 5000,
kw = triangle_wave(50 + decay_exponential(ram[4], ke, 800) / 1000),
kw *= decay_exponential(ram[4], ke, 2) * 5,

// SNARE
sw = lopass(triangle_wave(333) * 0.7 + noise_wave(), 33, 6),
sn1 = sw * decay_exponential(ram[5], 2500, 5) * 4,
sn2 = sw * decay_exponential(ram[7], 200, 4) * 2,
s = (sn1 + sn2) * 1.333,

// HIHAT
cf = 1799,
mf = 3293,
m2f = 8659,
hw = square_wave(cf) * square_wave(mf) * square_wave(m2f),
h = hw * decay_exponential(ram[8], 25000, 25) * (if_beat(2, 0) * 3 + 2),

// MIXER / LIMITER / OUTPUT
output = (s + kw + h) * 2 + fm1out + sqr + puls,
output *= 0.5,
output = Math.min(Math.max(-1, output), 1),
output * volume + 127;
