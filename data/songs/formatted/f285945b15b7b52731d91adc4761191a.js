vol = 90,
tempo = 6480,
beat = int(t / tempo),
sample_rate = 44100,
s = 0,

/* system ram
	0..3 fm trigger pos in time
	4 kick trigger pos in time
	5 snar trigger pos in time
	6 snar filter ram
	7 little snare time
	8 hats
*/

typeof ram == 'undefined' ? ram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : 0,

get_beat = seq_length => beat & seq_length,
if_beat = (seq_length, beat_pos) => beat % seq_length == beat_pos && t % tempo == 0,
if_euclid = beat_length => t % (tempo * beat_length) == 0,
note_hertz = steps_from_a => 420.69 * 1.059463 ** steps_from_a,

decay_exponential = function(start, length, curve) {
	if(start + length < t) {
		return 0;
	}
	e_pos = ((t - start)) / length;
	return (1 / (e_pos + 1 / curve)) / curve;
},

lopass = function(s, cut, addr) {
	s_p = ram[addr];
	s = s > s_p ?
		// Waveform up
		s - s_p > cut ? s_p + cut : s :
		// Waveform down
		s_p - s > cut ? s_p - cut : s;
	ram[addr] = s;
	return s;
},

fm = function(freq, mod) {
	// car_frequency is in hertz
	// mod_sine is -1 .. 1
	duty_length = sample_rate / freq;
	return sin(PI * (t / duty_length + mod));
},

// Run sample against decay envelope
fm1 = function(p, i) {
	s = fm(p * 7, 0) * decay_exponential(ram[i], sample_rate, 10);
	s = fm(p * 3, s) * decay_exponential(ram[i], sample_rate, 100);
	s = fm(p * 1, s) * decay_exponential(ram[i], sample_rate, 10);
	// s = sine_wave(fm(p * 4, s, 0.1)) * decay_exponential(ram[i], 800, 20);
	// s = sine_wave(fm(p / 2, s, 0.1)) * decay_exponential(ram[i], 81800, 2);
	// s = sine_wave(fm(p / 8, s, 1)) * decay_exponential(ram[i], 51800, 100);
	return s;
},

noise_wave = () => random() - 0.5,

square_wave = function(frequency) {
	duty_length = sample_rate / frequency;
	duty_on = t % duty_length > duty_length / 2 ? 0 : 1;
	return duty_on - 0.5;
},

triangle_wave = function(frequency) {
	duty_length = sample_rate / frequency;
	pos = (t % duty_length) / duty_length;
	return (pos <= 0.5 ? pos * 2 : (1 - pos) * 2) - 0.5;
},

// Check for new trigger
t % (tempo * 4) == 0 ? ram[0] = t : 0,
t % (tempo * 5) == 0 ? ram[0] = t : 0,
t % (tempo * 13) == 0 ? ram[0] = t : 0,

// Bytebeat melody
ram[0] == t ? p = note_hertz(-30 + ((t / tempo) & 27) + ((t >> 16) % 4) * 3) : 0,

// Check for new trigger
t % (tempo * 4) == 0 ? ram[1] = t : 0,
t % (tempo * 7) == 0 ? ram[1] = t : 0,
t % (tempo * 11) == 0 ? ram[1] = t : 0,

// Bytebeat melody
ram[1] == t ? p1 = note_hertz(-23 + ((t / tempo) & 27) + ((t >> 16) % 6) * 2) : 0,

// Check for new trigger
t % (tempo * 2) == 0 ? ram[2] = t : 0,
t % (tempo * 9) == 0 ? ram[2] = t : 0,
t % (tempo * 12) == 0 ? ram[2] = t : 0,

// Bytebeat melody
ram[2] == t ? p2 = note_hertz(-16 + ((t / tempo) & 19) + ((t >> 16) % 7) * 5) : 0,

// Check for new trigger
if_euclid(6) ? ram[3] = t : 0,
if_euclid(7) ? ram[3] = t : 0,
if_euclid(8) ? ram[3] = t : 0,

// Bytebeat melody
ram[3] == t ? p3 = note_hertz(-23 + ((t / tempo) & 12) + ((t >> 16) % 2) * 4) : 0,

s += (fm1(p, 0) + fm1(p1, 1) + fm1(p2, 2) + fm1(p3, 3)) * 0.30,

// Kick
if_beat(8, 0) || if_euclid(14) || if_euclid(7) ? ram[4] = t : 0,
ke = 5000,
kw = triangle_wave(50 + decay_exponential(ram[4], ke, 800) / 1000),
kw *= decay_exponential(ram[4], ke, 10) * 5,
s += kw,

// Snare
sw = lopass(triangle_wave(333) * 0.7 + noise_wave(), 33, 6),
if_beat(8, 4) ? ram[5] = t : 0,
sn1 = sw * decay_exponential(ram[5], 2500, 10) * 4,
(if_euclid(7) || if_euclid(1)) && random() > 0.87 ? ram[7] = t : 0,
sn2 = sw * decay_exponential(ram[7], 1200, 10) * 2,
s += sn1 + sn2,

// Hat
cf = 1799,
mf = 3293,
m2f = 8659,
hw = square_wave(cf) * square_wave(mf) * square_wave(m2f),
if_euclid(3) || if_euclid(5) || if_euclid(7) ? ram[8] = t : 0,
s += hw * decay_exponential(ram[8], 20000, 50) * (if_beat(2, 0) * 3 + 2),

// Clamp that shit
// s *= 10,
s = min(1, s),
s = max(-1, s),

// output
s * vol + 127;
