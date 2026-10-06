// Time measurements
sampleRate = 48000,
bpm = 96,
bps = bpm / 60,
T = 4 * t * bps / sampleRate,
b = T / 64 % 14 /* Song length */, // Time measurement

// Bass notes
notesTri = [
	'A A A A F DDD 8 8 5 3 5 8 D CC  ',
	'A A A A A A A A 8 8 8 8 5 5 5 5 '],
// Square wave notes
notesSqr = [
	'A AAFD58 8 5 8  A AADF C 5 8 A  ', // Ch1 #1
	'5 55A803 3 0 3  5 55AC 8 1 3 5  ', // Ch2 #1
	'A AAFD58 5 58DA A AADF C 8 5ADC ', // Ch1 #2
	'5 55A803 0 0385 5 55AC 8 3 15A8 '],// Ch2 #2
// Square wave effects
fxSqr = 'TSUV-',

// Main waveform generator
gen = (char, octave) => 110 /* A2 note in Hz */ * 48E3 / bps * T * 2 ** (octave + parseInt(char, 36) / 12),
// Triangular wave generator
tri = x => ((x ^ -(x >> 8 & 1)) & 240) *
	(h = 64 * T, i = h % 32, i < 1 ? h % 1 : i > 31 ? 1 - h % 1 : 1), // Clicks remover
// Square wave generator with effects
sqfx = (notesArr, fx, octave) => (
	/* FX table:
	12% 25% 50% Arpeggio
	0   1   2   3 - Attack
	4   5   6   7 - Clean
	8   9   A   B - Vibrato & Attack
	C   D   E   F - Vibrato
	G   H   I   J - Muted 1st half & Attack
	K   L   M   N - Muted 1st half
	O   P   Q   R - Muted 2nd half & Attack
	S   T   U   V - Muted 2nd half */
	fx = parseInt(fxSqr[fx], 36),
	isNaN(fx) ? 0 : (
		out = gen(notesSqr[notesArr][T & 31], octave - 2 -
			/* 012389ABGHIJOPQR */ (4 * T & 3 || fx / 4 & 1 ? 0 : 1 / 12)) >> 8, // Attack
		effect = fx >> 3 & 3,
		duty = fx & 3,
		128 * (((
			/* 89ABCDEF */ effect == 1 ? out + 64 * sin(PI * 2 * T) : // Vibrato effect
			/* GHIJKLMN */ effect == 2 && !(2 * T & 1) || // Muted 1st half
			/* OPQRSTUV */ effect == 3 && (2 * T & 1) ? 0 : // Muted 2nd half
			/* 01234567 */ out // No effect
		) & 255) > 32 * (
			/* 048CGKOS */ duty == 0 ? 7 : // 12.5% duty cycle
			/* 159DHLPT */ duty == 1 ? 6 : // 25%
			/* 26AEIMQU */ duty == 2 ? 4 : // 50%
			/* 37BFJNRV */ 4 * T & 1 ? 4 : 2 // Arpeggio (50% + 75%)
		))
	)
),
// Noise drums generator
drum = (pitch, pattern, speed) =>
	(1E5 * sin(pitch * T | 0) & 64) * // Noise
	(1 - 2 * T % 2 / 3) * // Decay
	(pattern >> (2 * T >> speed) & 1), // Pattern mask

// Square waves with echo
echoSize = 9E3,
t || (echoValues = Array(echoSize)), // Init echo array
sqr = (echoValues[t % echoSize] | 0) + // Adding previous state
	.4 * sqfx( // Ch1
		'22220022'[p = b & 7] /* notes */,
		'01122333'[p] /* fx */,
		b > 3 ? 2 : 1 /* octave */) +
	sqfx( // Ch2
		'333311-3'[p] /* notes */,
		'01110041'[p] /* fx */,
		'001212-2'[p] /* octave */) / 2,
echoValues[t % echoSize] = .44 * sqr, // Saving the decreased current state

// Output
max(0, min(255, // Limiting the waveform to 0..255
	sqr + // Square waves with echo
	tri(gen(notesTri['00111100'[p]][2 * T & 31], -3) / 64) / 2 + // Triangle Bass
	((b > 1.9 & b < 6 | b > 7.9) && .8 * drum(320, 0xA444C444, b > 8 & b < 12 ? 2 : 1)) + // Snare
	drum(1E6, 0xDD75D757, 0) / 3 + // Hi-hat
	40 * (sin(170 * (T % 4) ** .4) + 1) * (1 - T / 4 % 1) // Kick
));
