songSpeed = 6.4,
T = t * songSpeed / 48000 /* sampleRate */,
b = T / 8 % 88 /* Song length */,
notesTri = '9 9 9 9 9 9 9 997 7 7 7 7 7 7 775 5 5 5 5 5 5 5 4 4 4 445 5 5 55',
notesSqr = [[
	'9 9  9997 7  7775 5  77 99' + (b < 16 ? '  99AC' : 'CEC9CE'),
	'9 9  999A A  AAAC A  AA 99' + (b < 16 ? '  AA77' : 'CEC9CE')], [
	'4 4  4440 2  2220 0  22 44' + (b < 16 ? '  4457' : '797479'),
	'4 4  4445 5  5557 5  55 44' + (b < 16 ? '  5522' : '797479')], [
	'C4797479E4797479C479747924797479'], [
	'CC797479EE797479CC79747977797479'], [
	'77242024992420247724202422242024']],
fxSqr = [[
	'5 5  5T 5 5  5T 5 5  5T 5' + (b < 16 ? 'T  1T55' : 'SS4SSSS')], [
	'5 5  55D5 5  1DD5 5  5T 5SOCSSSS'], [
	'4SSSSSSS4SSSSSSS4SSSSSSSSSSSSSSS'], [
	'4CSSS0444CSSS4444CSSS0444CSSS444'], [
	'4C   0444C   4444C   0444C   444']],
gen = (char, octave) => 2112E4 * T / songSpeed * 2 ** ((parseInt(char, 36) + 12 * octave) / 12),
tri = x => ((x ^ -(x >> 8 & 1)) & 240) * (
		// Clicks remover
		i = 32 * T % 32,
		j = 32 * T % 1,
		i < 1 || i >= 16 && i < 17 ? j : i > 31 || i > 15 && i < 16 ? 1 - j : 1),
getChar = (arr, T) => arr[T >> 5 & arr.length - 1][T & 31],
sqr = (notesArr, fxArr, octave = 1, delay) => (
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
	fx = parseInt(getChar(fxSqr[fxArr], T - delay), 36),
	note = getChar(notesSqr[notesArr], T - delay),
	isNaN(fx) || note === ' ' ? 0 : (
		out = gen(note, octave - 2) *
			/* 012389ABGHIJOPQR */ ((4 * T & 3) || (fx / 4 & 1) ? 1 : 2 ** (-1 / 12)) >> 8, // Attack
		e = fx >> 3 & 3,
		d = fx & 3,
		128 * (((
			/* 89ABCDEF */ e == 1 ? out + 64 * sin(2 * PI * T) : // Vibrato effect
			/* GHIJKLMN */ e == 2 && !(2 * T & 1) || // Muted 1st half
			/* OPQRSTUV */ e == 3 && (2 * T & 1) ? 0 : // Muted 2nd half
			/* 01234567 */ out // No effect
		) & 255) > (
			/* 048CGKOS */ d == 0 ? 224 : // 87.5% duty cycle
			/* 159DHLPT */ d == 1 ? 192 : // 75% duty cycle
			/* 26AEIMQU */ d == 2 ? 128 : // 50% duty cycle
			/* 37BFJNRV */ (8 * T & 3) < 2 ? 64 : 128))) // Arpeggio (25% + 50%)
),
lead = (n, f, o) => sqr(n, f, o, 0) + sqr(n, f, o, 1.5) / 2 + sqr(n, f, o, 3) / 3,
drum = (pitch, pattern, speed) =>
	(1E5 * sin(pitch * T | 0) & 64) * (1 - 2 * T % 2 / 3) * (pattern >> (2 * T >> speed) & 1),
min(255,
	// Ch1 Pulse Wave
	(b < 32 ? lead(0, 0, 0) : b < 48 ? lead(0, 1) : b < 56 ? lead(2, 2) : lead(3, b < 80 ? 3 : 4)) / 3 +
	// Ch2 Pulse Wave
	(b < 32 ? lead(1, 0, 0) : b < 48 ? lead(1, 1) : b < 64 ? 0 : lead(4, 4, b < 72 || b > 80 ? 1 : 2)) / 3 +
	// Ch3 Triangle Wave
	.6 * tri(gen(notesTri[2 * T & 63], -3) / 64) +
	(b < 80 &&
		// Ch4 Noise Snare
		drum(290, b < 15.5 ? 0x31111111 : 0xE4444444, 1) +
		// Ch4 Noise Hats
		(b < 15.5 ? drum(1E6, 0xC4A4A4A4, 1) : drum(1E6, 0xD4445444, 0)) / 3 +
		// Ch5 Kick
		(b > 16 && 50 * (sin(150 * (T % 4) ** .4) + 1) * (1 - T / 4 % 1)))
);
