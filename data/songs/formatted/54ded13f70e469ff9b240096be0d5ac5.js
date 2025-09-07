songSpeed = 6.4,
T = t * songSpeed / 48000 /* Sample rate */,
b = T / 64 % 18 /* Song length */, // Time measurement

// Bass notes
notesTri =
	b < 4 ? '97CG'[2 * b & 3] : // Solid bass at the start
	(((b > 14 ?
		'9752'[8 * b & 3] : // Intermittent bass at the end
		'9704'[2 * b & 3] // Main intermittent bass
	) + ' ').repeat(13) + '2 4 5')[2 * T & 31],
// Square wave notes
notesSqr = [
	'947942CCB47942GGC4794BCCB4797442', // Square wave channel 1
	'C9BC97GGE9BC97LLG9BC9EGGE9BCB997'], // Square wave channel 2
// Square wave effects
fxSqr = [
	'V-'.repeat(16), // Staccato at the start
	'VSSTSSS-'.repeat(3) + 'VSSTSS-S', // 87% duty theme
	'1TT5TTDD'.repeat(4), // 75% duty theme
	'5D'.repeat(16)], // Vibrato at the end

// Main waveform generator
gen = (char, octave) => 440 * 48000 * T / songSpeed * 2 ** (octave + (parseInt(char, 36) + 1) / 12),
// Triangular wave generator
tri = x => ((x ^ -(x >> 8 & 1)) & 240) *
	(b > 4 ? ( // Clicks remover
		i = 32 * T % 32,
		j = 32 * T % 1,
		i < 1 | i >= 16 & i < 17 ? j : i > 31 | i > 15 & i < 16 ? 1 - j : 1
	) : 1),
// Square wave generator with effects
sqfx = (notesArr, fx, octave) => (
	/* FX table:
	87% 75% 50% Arpeggio
	0   1   2   3 - Attack
	4   5   6   7 - Clean
	8   9   A   B - Vibrato & Attack
	C   D   E   F - Vibrato
	G   H   I   J - Muted 1st half & Attack
	K   L   M   N - Muted 1st half
	O   P   Q   R - Muted 2nd half & Attack
	S   T   U   V - Muted 2nd half */
	fx = parseInt(fxSqr[fx][T & 31], 36),
	isNaN(fx) ? 0 : (
		out = gen(notesSqr[notesArr][T & 31], octave - 2 -
			/* 012389ABGHIJOPQR */ (4 * T & 3 || fx / 4 & 1 ? 0 : 1 / 12)) >> 8, // Attack
		effect = fx >> 3 & 3,
		duty = fx & 3,
		// Generator output
		128 * (((
			/* 89ABCDEF */ effect == 1 ? out + 64 * sin(PI * 2 * T) : // Vibrato effect
			/* GHIJKLMN */ effect == 2 && !(2 * T & 1) || // Muted 1st half
			/* OPQRSTUV */ effect == 3 && (2 * T & 1) ? 0 : // Muted 2nd half
			/* 01234567 */ out // No effect
		) & 255) > 32 * (
			/* 048CGKOS */ duty == 0 ? 7 : // 87.5% duty cycle
			/* 159DHLPT */ duty == 1 ? 6 : // 75%
			/* 26AEIMQU */ duty == 2 ? 4 : // 50%
			/* 37BFJNRV */ 4 * T & 1 ? 4 : 2 // Arpeggio (50% + 25%)
		))
	)
),
// Noise drums generator
drum = (pitch, pattern, speed) =>
	(1E5 * sin(pitch * T | 0) & 64) * // Noise
	(1 - 2 * T % 2 / 3) * // Decay
	(pattern >> (2 * T >> speed) & 1), // Pattern mask

// High pass filter (waveform centering, DC offset removing)
filterCounter = 0,
t || (filterValues = []), // Init filter array
filter = value => (
	t || filterValues.push(0),
	filterValues[filterCounter] += .005 /* Filter coefficient */ *
		(value - filterValues[filterCounter]),
	value - filterValues[++filterCounter - 1]),

// Square waves with echo
echoSize = b > 4 ? 9E3 : 21504,
t || (echoValues = Array(echoSize)), // Init echo array
sqr = (echoValues[t % echoSize] | 0) + // Adding previous state
	sqfx(0, // Ch1 notes
		b > 17 ? 1 : b > 16 ? 3 : b > 12 ? 2 : b > 2 ? 1 : 0, // Ch1 effects
		b > 6 & b < 12 | b > 14 ? 2 : 1) / 3 + // Ch1 octave
	((b > 4 & b < 8 | b > 10) && // Ch2 playing time
		sqfx(1, // Ch2 notes
		b > 17 ? 1 : b > 16 ? 3 : b > 12 ? 2 : 1, // Ch2 effects
		b > 10 & b < 12 | b > 15 ? 2 : 1) / 3), // Ch2 octave
echoValues[t % echoSize] = .4 * sqr, // Saving the decreased current state

// Output
max(0, min(255, 128 + filter( // Centering and limiting the waveform to 0..255
	sqr + // Square waves with echo
	tri(gen(notesTri, b > 4 ? -3 : -4) / 64) / 2 + // Triangle Bass
	((b > 3.9 & b < 8 | b > 9.9 & b < 17) && // Snare and Hats playing time
		.8 * drum(300, b > 9.9 ? // Noise Snare
			0b11100100010001001100010001000100 : // Fast theme
			0b01110100000100000001000001010000, 1) + // Slow theme
		drum(1E6, b > 9.9 ? // Noise Hats
			0b11010100010001000101010001000100 : // Fast theme
			0b11110001001101010011000100110001, 0) / 3) + // Slow theme
	((b > 2 & b < 17) && // Kick playing time
		40 * (sin(170 * (T % 4) ** .4) + 1) * (1 - T / 4 % 1)) // Kick
)));
