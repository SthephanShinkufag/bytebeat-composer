SAMPLE_RATE = 44100,
DEBUG = 1,
FEEDBACK_ITERATIONS = 3,
_log = DEBUG ? console.error : () => {},

//     /\
//    /  \
//   /    \___
//  /         \_
//  AAAADDDSSSR

sum = (a, b) => a + b,
clamp = x => min(max(x, -1), 1),

adsr = (attack_time, decay_time, sustain_level, release_rate, sustain_time, t) => (
	ad_time = attack_time + decay_time,
	ads_time = min(ad_time, sustain_time),
	release_level = release_rate &&
		adsr(attack_time, decay_time, sustain_level, 0, sustain_time, sustain_time),

	t > sustain_time ? max(release_level - (t - sustain_time) * release_rate, 0) :
	t < 0 ? 0 :
	t < attack_time ? t / attack_time :
	t < ad_time ? 1 - (1 - sustain_level) * pow((t - attack_time) / decay_time, 0.5) :
	sustain_level
),

wav = (a, d, s, r, st, freq, t) => adsr(a, d, s, r, st, t) * sin(2 * PI * freq * t),

// op: [a, d, s, r, ratio, level, modulators/feedback]

feedop = (a, d, s, r, ratio, level, mods, st, freq, t, iter) =>
	iter ? level * mods * wav(a, d, s, r, st, freq * ratio, t +
		feedop(a, d, s, r, ratio, level, mods, st, freq, t, iter - 1) / freq * 220) : 0,

fmop = (a, d, s, r, ratio, level, mods, st, freq, t) => (
	modulation = mods ?
		mods.length ?
			// Modulation is more op(s)
			fm(mods, st, freq, t) :
			// Modulation is feedback
			feedop(a, d, s, r, ratio, level, mods, st, freq, t, FEEDBACK_ITERATIONS) :
		0,
	clamp(level * wav(a, d, s, r, st, freq * ratio, t + modulation / freq * 220))
),

fm = (ops, st, freq, t) =>
	ops.map(([a, d, s, r, ratio, level, mods]) => fmop(a, d, s, r, ratio, level, mods, st, freq, t))
		.reduce((a, b) => a + b),

// INSTRUMENTS

detune_test = [
	[0, 0, 1, 2, 1, 1],
	[0, 0, 1, 2, 1 + 12e-4, 1] // 1 detune epsilon = 4e-4 ratio
],

feedback_test = [
	[0.1, 0.1, 0.9, 1, 1, 1, 8e-4]
],

// fmop(0.5, 0.5, 0.5, 2, 1, 1, 8e-3, 0, 440, scale_t) * 127 + 128
pianotonk = [
	//  a   d   s   r ratio level [mods]/feedback
	[0.007, 0.40, 0.09, 5, 1, 1 / 3, [
		[0.007, 0.70, 0.94, 5, 3.0036, 4e-4, [
			[0.005, 0.40, 0.94, 5, 12, 1e-4]
		]],
		[0.005, 0.07, 0.94, 5, 0.9988, 85e-5, 8e-2]
	]]
],

synthup = [
	//  a   d   s   r ratio level [mods]/feedback
	[0.02, 0.3, 0.94, 7, 2, 0.2, [
		[0.007, 0.1, 0.5, 5, 1.0012, 0.001]
	]],
	[0.02, 0.3, 0.94, 8, 2.0024, 0.2, [
		[0.007, 0.1, 0.94, 5, 2, 0.0006, 0.5]
	]]
],

bass = [
	[0, 6, 0, 4, 0.5, 0.25],
	[0, 0.02, 0, 4, 0.5, 0.25],
	[0, 3, 0, 4, 0.4994, 0.25, [
		[0, 0.6, 0, 4, 0.4994, 5e-3]
	]]
],

c_hat = [
	[0, 0.06, 0, 4, 2.9964, 0.2, [
		[0, 0, 1, 9, 2.9964, 3e-3]
	]],
	[0, 0.08, 0, 4, 2.0024, 0.5, [
		[0, 0, 1, 1, 2.0024, 2e-3, 1]
	]]
],

o_hat = [
	[0, 0.4, 0, 4, 2.9964, 0.02, [
		[0, 0, 1, 9, 2.9964, 3e-3]
	]],
	[0, 0.4, 0, 4, 2.0024, 0.5, [
		[0, 0, 1, 1, 2.0024, 2e-3, 1]
	]]
],

kick = [
	[1e-4, 0.1, 0, 4, 1, 0.8, [
		[0.001, 0.01, 0, 4, 0.5, 0.005],
		[0, 0.001, 0, 4, 4, 0.001, 1]
	]]
],

snare = [
	[0, 0.15, 0, 4, 0.5, 0.4, [
		[0, 0.001, 0, 4, 0.5, 0.1]
	]],
	[0, 0.12, 0, 4, 0.5, 0.8, [
		[0, 9, 1, 9, 15, 0.01, 1]
	]]
],

semitone = (base, n) => base * pow(2, n / 12),

// OUTPUT
seek = 0,
scale_t = t / SAMPLE_RATE + 0.12 * 16 * seek,

// SONG DATA STUFF
//          0123456789abcdef
pt_rhyth = '0123012012012012',
ptc_rhyt = '9901201201201201',
pt_note = [
// 0123456789abcdef
	'4444444444444444',
	'0000000222222222',
	'4444444444444444',
	'7777777999999999'
],
ptc_not = [
// 0123456789abcdef
	'4444444444444444',
	'4400000022222222',
	'4444444444444444',
	'4477777799999999'
],

bass_rhyth = [
	'0123012010010101',
	'0123012012010101',
	'0123012010010101',
	'0123012012010101'
],
bass_not = [
// 0123456789abcdef
	'7777555775777755',
	'3333333222552255',
	'7777555775777755',
	'aaaaaaaccceehhee'
],

lead_rhyth = [
	'0123012301001000',
	'0123012301001234',
	'0123012301001000',
	'0123012301001234',
	'0123012301001000',
	'0123012301001234',
	'0123012301001000',
	'0123012301001201'
],
lead_note = [
	'ccccaaaa77300373',
	'ccccaaaaffaccccc',
	'ccccaaaa77300373',
	'ccccaaaahhjmmmmm',
	'ccccaaaa77300373',
	'ccccaaaaffaccccc',
	'ccccaaaa77300373',
	'ccccaaaahhjmmmjj'
],

//            0123456789abcdef
hat_picker = '0000000100010010',

// SONG STUFF
frame = 0.12,
beat = int(scale_t / frame),
beat_prog = scale_t % frame,
measure = int(beat / 16),
measure_prog = beat % 16,
g4 = measure % 40,
group_prog = g4 % 4,
group2_prog = g4 % 8,
group3_prog = g4 % 16,

v1 = fm(
	pianotonk,
	2 * frame,
	semitone(110, pt_note[group_prog][measure_prog] - 4),
	beat_prog + pt_rhyth[measure_prog] * frame
),
v2 = [0, group_prog & 1 ? 4 : 3, 7].map(n => fm(
	pianotonk,
	2 * frame,
	semitone(220, ptc_not[group_prog][measure_prog] - 4 + n),
	beat_prog + ptc_rhyt[measure_prog] * frame
)).reduce(sum) / 2,
v3 = g4 > 3 && g4 < 36 && fm(
	bass,
	9,
	semitone(109, parseInt(bass_not[group_prog][measure_prog], 36) - 7),
	beat_prog + bass_rhyth[group_prog][measure_prog] * frame
),
v4note = semitone(220, parseInt(lead_note[group2_prog][measure_prog], 36)),
v4t = beat_prog + lead_rhyth[group2_prog][measure_prog] * frame,
v4t2 = max((scale_t - frame * 16 * 32) % (frame * 16 * 40), 0),
v4b = fm(synthup, 48 * frame, 440 + wav(0.4, 9, 1, 1, 9, 6, v4t2) / 8, v4t2) * max(1 - v4t2 / 4, 0),
v4 = g4 > 23 && (group3_prog & 8 ? fm(
	synthup,
	frame * ((group_prog & 1) && (measure_prog & 8) ? 4.5 : 2),
	v4note + wav(0.7, 9, 1, 1, 9, 6, v4t) / 2,
	v4t
) * (1 - (v4note - 220) / v4note / 3) : v4b),
v5t = beat_prog + beat % 4 * frame,
v5 = g4 > 15 && fm(kick, 1, 104 / (1 + v5t * 4), v5t),
v6 = g4 > 7 && fm(+hat_picker[measure_prog | 0] ? o_hat : c_hat, 1, semitone(440, -2), beat_prog) / 6,
v7t = (scale_t + frame * 4) % (frame * 8),
v7 = g4 > 15 && fm(snare, 1, 466 / (1 + v7t), v7t) / 2,
v = clamp(v1 + v2 + v3 + v4 + v5 + v6 + v7),

v * 127 + 128;
