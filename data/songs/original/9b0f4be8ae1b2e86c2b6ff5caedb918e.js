/*
  *  ══════════════════════════════════════════════════════
  * PrincessPriscillaPT - ❄️ Winter Whispers of Equestria ❄️
  *  ══════════════════════════════════════════════════════
  *   ※ Licensed under CC-BY-SA-4.0 ║ https://creativecommons.org/licenses/by-sa/4.0
  *
  * Snow drifts over Ponyville as magic hums softly. Wrapped in a warm blanket, you rest by the hearth, watching winter clouds dance across Equestria’s skies. ❄️✨
  *
  */

	//  ══════════════════════════════  //
	// Utilities & Global Configuration //
	//  ══════════════════════════════  //

/* Song Settings */
sr = sampleRate = 44100,
freq = frequency = 426.46,
spb = samplesPerBeat = 0x4000,
bpm = beatsPerMinute = 92,
dB = dBGain = 1,
modePan = 0,
/* Get Speed and Tuning */
speed = (bpm, sr, spb) => t * abs(bpm / (sr * 60) * spb),
tune = (sr, freq, trsp = 0) => (t / sr * 256) * freq * 2 ** (trsp / 12),
ts = tSpeed = speed(bpm, sr, spb),
tt = tTune = tune(sr, freq, 4),

	//  ═════════════════  //
	// Effects and Filters //
	//  ═════════════════  //

/* Infinitely Instantiable 1 & 2-pole Filters */

t || (fx = []), fxi = 0,
lpf = lowPassFilter = (audio, cutoff) => (
	lp_fxii = fxi ++,
	fx[lp_fxii] ??= 0,
	fx[lp_fxii] += (audio - fx[lp_fxii]) * cutoff
),
hpf = highPassFilter = (audio, cutoff) => audio - lpf(audio, cutoff),
bpf = bandPassFilter = (audio, highCutoff, lowCutoff) => hpf(lpf(audio, lowCutoff), highCutoff),

lpf2 = twoPoleLowPass = (audio, cutoff1, cutoff2) => lpf(lpf(audio, cutoff1), cutoff2),
hpf2 = twoPoleHighPass = (audio, cutoff1, cutoff2) => hpf(hpf(audio, cutoff1), cutoff2),

/* feeshbread's Dead Data Reverb */
wsin = phase => (- cos(phase / 256 * PI) + 1) * 128 - .5,
dt = t, rvrbMax = 1e5,
rvrb = multiTapReverb = (audio, heads, dw, fbfn = x => x) => {
	rvrb_fxii = fxi ++;
	fx[rvrb_fxii] ??= new Float32Array(rvrbMax);
	rvrb_wi = dt % rvrbMax;
	rvrb_feed = audio;
	rvrb_out = 0;
	for(let head of heads) {
		rvrb_ri = (rvrbMax + dt - round(head.t)) % rvrbMax;
		rvrb_feed += fx[rvrb_fxii] [rvrb_ri] * head.fb;
		rvrb_out += fx[rvrb_fxii] [rvrb_ri] * head.m
	} fx[rvrb_fxii] [rvrb_wi] = fbfn(rvrb_feed);
	return audio * (1 - dw) + rvrb_out * dw
},
rvrbHeads = [[
	{t:1e3 + wsin(t / 180), m:.6, fb:.3},
	{t:1e4 + wsin(t / 300), m:.5, fb:.5},
	{t:17e3 + wsin(t / 380), m:.3, fb:.7},
	{t:37e3 + wsin(t / 420), m:.2, fb:.9}
],[
	{t:11e2 + wsin(t / 200), m:.6, fb:.3},
	{t:13e3 + wsin(t / 320), m:.5, fb:.5},
	{t:14e3 + wsin(t / 330), m:.3, fb:.7},
	{t:4e4 + wsin(t / 450), m:.2, fb:.9}
]],

/* Downsampler - PriscillaDSP */
t || (dwnfx = []), dwnfxi = 0,
dwnPresets = {
	subtlelofi: { hertz: 11025, mix: .35 },
	samplercrunch: { hertz: 8000, mix: .7 },
	aggressivealias: { hertz: 4000, mix: 1 },
	custom: { hertz: 8e3, mix: 0 }
},
dwn = downSample = (signal, preset = "subtlelofi") => (
	dwn_fxii = dwnfxi++,
	dwnfx[dwn_fxii] ??= { val: 0, frame: -1 },

	{ hertz: hertz, mix: mix } = dwnPresets[preset] 
	?? (() => { throw new ReferenceError(`dwn() function error: Preset not found (reading preset: ${preset})`); })(),

	m = min(1, max(0, mix)),
	frame = (t * min(sr, max(0, hertz)) / sr) | 0,

	((((frame != dwnfx[dwn_fxii].frame)
		? (dwnfx[dwn_fxii].frame = frame, dwnfx[dwn_fxii].val = signal)
		: dwnfx[dwn_fxii].val) || 0) * m) + signal * (1 - m)
),

/* Feedback Delay Line - PriscillaDSP */
t || (dlayfx = []),  dlayfxi = 0,
dlayMax = 1e5,
dlay = (signal, time, dlayVol = .5, feedback = .5) => (
	dlay_fxii = dlayfxi ++,
	dlayfx[dlay_fxii] ??= {
		buf: new Float32Array(dlayMax),
		idx: 0
	},
	dLength = min(dlayfx[dlay_fxii].buf.length, max(1, time | 0)),
	out = dlayfx[dlay_fxii].buf [dlayfx[dlay_fxii].idx],
	dlayfx[dlay_fxii].buf[dlayfx[dlay_fxii].idx] = signal + out * feedback,
	dlayfx[dlay_fxii].idx = (dlayfx[dlay_fxii].idx + 1) % round(dLength),
	mix = min(1, max(0, dlayVol)),
	signal + out * mix
),
dLen = delayLength = (sr, bpm, rhy = 1 / 4) => round((30 * sr) / (bpm / rhy / 2)),

/* Quantization Function + LFO Modulation */
qti = quantize = (audio, steps, mix = .35) => audio * min(1, max(0, -mix + 1)) + round(audio * steps) / steps * min(1, max(0, mix)),
qLFO = quantizeLFOMod = 24 + sin(t / 3e4) * 8,

/* Stereo Panning + Detune */
pan = (0.5 * sin(t / 5e4) + 0.5 * sin(t / 9e4 + 2)) * modePan * min(1, t / 1e6),
str = stereo = x => (x ? .995 : 1.005),

/* Sliding Note Function */
t || (sli = []), slifxi = 0,
slide = (input, portamento) => (
	sli_fxii = slifxi++,
	sli[sli_fxii] ??= [0, 0, 0, 0], // [out, vel, target, noteOn]

	noteOn = !isNaN(input) && !sli[sli_fxii][3],
	sli[sli_fxii][3] = !isNaN(input),
	sli[sli_fxii][2] = t ? input / t : t,

	!isNaN(input) ? (sli[sli_fxii][0] += sli[sli_fxii][1] += (sli[sli_fxii][2] - sli[sli_fxii][1]) / (noteOn ? 1 : (t > 2 ? (portamento ? portamento : 1) : 1))) : 0
),

	//  ════════════════  //
	// Parsing and Tuning //
	//  ════════════════  //

/* Base 64 Function (extended parseInt() - inspo from Two2Fall) */
b64 = base64 = (string, radix = 10) => {
	if (radix < 2 || radix > 64) {
		throw new ReferenceError(`\nbase64() function error: Radix must be between 2 and 64 (reading: ${radix})`)
	};
	if (string == null || string == "") return NaN;
	_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/+".slice(0, radix);
	let _value = 0;
	for (ch of string) {
		idx = _chars.indexOf(ch);
		if (idx == -1) return NaN;
		_value = _value * radix + idx;
	};
	return _value
},

/* Just Intonation and Equal Temperament Tuning Scale */
/* Just Intonation - Takes the note from 12EDO into ratios */
ji = justIntonation = (note, transpose = 0) => (
	_ratios = [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 45 / 32, 3 / 2, 8 / 5, 5 / 3, 16 / 9, 15 / 8],
	_note = ((floor(note) % 12) + 12) % 12,
	_transpose = ((floor(transpose) % 12) + 12) % 12,
	_octave = floor(note / 12) + floor(transpose / 12),
	_ratios[_note] * 2 ** _octave * _ratios[_transpose]
),

/* Equal Temperament - The main frequency scale */
/* Mode: [0] JI-Snapped EDO | [1] Raw EDO Ladder */
tet = equalTemperament = (note, transpose = 0, edo = 12, mode = 0) => mode ? 2 ** ((note + transpose) / edo) : 2 ** (round(log2(ji(note, transpose)) * edo) / edo),

/* Chord Function */
chrd = chords = (tone = t => t, chrdNotes = [0], trnsp = 0, wave = input => (input / 128 % 2 - 1 + input / 127 % 2 - 1) / 2) => {
	let idx = chr = 0
	let maxPoly = 8
	for (; idx < min(maxPoly, chrdNotes.length); idx++)
		chr += wave(tone((chrdNotes[idx] + trnsp)))
	return maxPoly ? chr / maxPoly : 0
},

/* Waveforms */
wv = t => sin(((t | 7) - 7) * PI / 128 + sqrt(abs(sin(t / 2e4))) * PI / 6) * (1 - t / 256 % 1) + sin((t * PI / 64) + sin(t * 3 * PI / 64)) / 4,
wvBell = x => sin(sin(x * PI / 128) * 2 + sin(x * PI / 128 * 6)),
wvFM = t => (abs(sin(t * PI / 32) + cos(t * PI / 128) + cbrt(sin(t * PI / 64)) + abs(sin(t * PI / 16)) / 2) - 1.0179) / 2.1,
wvBass = (t, d = 1) => bpf(lpf(tanh((t / 256 % 2 - 1 + t / d / 256 % 2 - 1) * 2) * .5 - tanh(2 * sin(t * PI / 128 + sin(t * PI / 128) / 2)) + sin(t * PI / 256 / d) + tanh(bpf(wvFM(t * d / 2 * d ** .5 ^ wvFM(t / d) * 64) % wvFM(t * d) * 2, .05, .5 + abs(sin(t / 4e4)) * .5) * 1.5) * 1.5, .2 + abs(sin(t / 4e4)) * .8), .01, .5) / 2,

bsfq = t / sr * 70, env = exp( - ts % 8192 / 1e4),
timpani = lr => rvrb(hpf(tanh(sin(sin(2 * PI * bsfq) * env + sin(2 * PI * bsfq * 1.5) * .85 * env ** 2 + sin(2 * PI * bsfq * (1.5 ** 2)) * .65 * env ** 4 + sin(2 * PI * bsfq * (1.5 ** 3)) * .35 * env ** 8) + .15 * bpf(bpf(random(), .05, .05), .05, .05) * env ** 8 * 128) * (1 - (ts / 8192 % 1) ** 4) * min(1, abs(sin(ts * PI / 8192)) * 16) / 2 * "10010010"[ts >> 13 & 7], .02) * (ts >> 20 & 1) *! ((ts >> 19) > 8), rvrbHeads[lr], .35, x => tanh(bpf(x, .01, .1) / 160) * 100) * 2,
snare = lr => rvrb(bpf(tanh(sin(sin(t / 50 - .995 ** (ts % 4096) * 3) * .999 ** (ts % 4096) * 2 + bpf(random(), .4, .5) * 8 * .9992 ** (ts % 4096)) / 2) / "1_42_41_42_41_2_1_42_41_42_41432"[ts >> 12 & 31] || 0, .03, .2) *!! (ts >> 19 & 3) *! ((ts >> 19) > 8), [{t: 1e3 + wsin(t / 180), m: .6, fb: .3}, {t: 11e2 + wsin(t / 200), m: .6, fb: .3}], .55, x => tanh(bpf(x, .05, .5) / 180) * 100),

/* Melody */
mel = ["07EFMQRY", "3AEJMQVT", "8CFJKORW", "AEFHMQRT"][ts >> 17 & 3],

/* Master Chain + Ambience */
master = (lr = 0) => dwn(
	atan(((
		rvrb(
			dlay(
				bpf(0
					+ wv((tt + sin(t / 5e3) * 60) / 4 * str(lr) * tet(b64(mel[ts >> 13 & 7], 36))) * 1.5 * (1 - ts / 8192 % 1) ** .5
					+ wvBell((tt + sin(t / 1e3) * 20) * str(lr) * tet(b64(mel[7 & (7 & ts >> 11) + (ts >> 12)], 36))) / 2 * (ts / 2048 % 1) * min(1, ts / 2 ** 19) ** 5
					+ wvFM(tt / 8 * str(lr) * tet(b64(['07EF', '3AEJ', '8CFJ', 'AEFH'][ts >> 17 & 3][ts >> 11 & 3], 36)) * 2 ** (ts >> 13 & 3), str(lr)) / 4
					, .01, .8) *! ((ts >> 19) > 8)
				, dLen(sr, bpm, 3 / 4), .55, .55)
			+ bpf(0
				+ chrd(x => tt * str(lr) * tet(x), [[0, 3, 7, 10], [-2, 3, 7, 10], [0, 3, 7, 8], [2, 3, 5, 10]][ts >> 17 & 3], 0, input => wvBell(input) ^ (input / 256 % 2 - 1 + input / 254 % 2 - 1))
				, .05, .5) * 2 *!! (ts >> 19) *! ((ts >> 19) > 8)
			, rvrbHeads[lr], .55, x => tanh(bpf(x, .01, .8) / 180) * 100
		) * 1.125
		+ wvBass(slide(tt / 16 * tet(parseInt('CF8A'[ts >> 17 & 3], 16), 12 * ((ts >> 14 & 7) == 7) * ("101100110"[ts >> 19] | 0)), ((ts + 16384) >> 19 == 1 ? 5e3 : 3e3)), str(lr)) *!! (ts >> 19) * 1.1 * (ts >> 20 & 1 ? ("10010010"[ts >> 13 & 7] | 0) ? min(1, .2 + ts / 8192 % 1) ** 2 * .55 + .45 : 1 : 1) *!! (ts >> 19 & 7) *! ((ts >> 19) > 8)
	)
) / 40) 
* min(1, t / 1e6) * 1.25) * 35,
[qti(master(0) * ((pan / 3) + .667), qLFO), qti(master(1) * ((- pan / 3) + .667), qLFO)].map((x, lr) => 
	tanh((rnd = random() - .5, 0
	+ x
	+ timpani(lr) * 1.95
	+ snare(lr) * 5
	+ rnd / 16 * max(0, 1 - ts / 524288 % 4) ** 4 *! ((ts >> 19) > 8)
	+ (0
		+ bpf(bpf(rnd, .15, .1), .2, .1) * 10 * abs(sin(t / 2e5)) *! ((ts >> 19) > 8)
		+ lpf2(rnd, .03 ,.025) * 4 *! ((ts >> 19) > 8)
		+ bpf(bpf(rnd, .2, .5), .2, .5) * (ts >> 18 & 1 ? min(1, max(0, (((ts % 2 ** 19) - 2 ** 19) / 65536) + 1)) : min(1, max(0, 1 - ts / 2 ** 19 % 1) ** 1.5)) ** 8 * 3 * ("0111100110011001111"[ts >> 18] | 0)
	  ) / 1.25 * min(1, t / 1e6)
	+ bpf(((t * t / 4096 | ts / 12) & 255) - (ts / 24 & 127) - 127.5, .01, .8) / 128 / 10 * min(1, t / 1e6) *! ((ts >> 19) > 8)
) / 1.35 * 10 ** (min(6, max(-100, dB)) / 20)))