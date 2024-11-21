songSpeed = 6.4,
T = t * songSpeed / 48000 /* sampleRate */,
b = T / 8 % 112,

// Notes and effects
notesBassSq = ['C78A', '5013'],
notesBassTr =
	'55 77 33 00 0 0 11 11 11 33 3 3 ',
notesLead = [[
	// Melody 1
	'5 0 3 0 5 0 3 0 5 0 3 0 5 0 3 0 '], [
	// Melody 2
	'5 0 3 0 5 3 7 3 8 3 7 3 8 887 53',
	'5 0 3 0 5 3 7 3 8 AA7 3 87887753'], [
	// Melody 3
	'55553333555577778888AAAA88887777',
	'55553333555577778888777733330000'], [
	// Melody 4
	'50553033535570778388A3AA83887377',
	'50553033505570778388707730330000'], [
	// High theme
	'FFFFHHCCCCCCAAAADDDDFFDDDDCCCCCC',
	'HHHHHHCCCCCCJJJJKKKKJJFFFFFFFFCC']],
fxLead = [[
	// Clean (melody 1,2)
	'6 6 6 6 2 6 6 6 6 266 6 266EEEEE'], [
	// Arpeggio (melody 1,2,4)
	'3 7 7 7 3 7 3 7 7 37F 7 17FFFFFF'], [
	// Staccato - pauses (melody 3)
	'P VVV VVV VPV VSS VVV V3V VVV PS'], [
	// Staccato - solid (melody 3,4)
	'VV1VV1VBVV1RR1VVBV1VV1VERVEV1RRB'], [
	// High theme
	'16EECC1EE4EE9ECC16EE2616E41E9E9E']],

// Generators
gen = char => 2112E4 * T / songSpeed * 2 ** ((parseInt(char, 36) + 1) / 12),
tri = x => (x ^ -(x >> 8 & 1)) & 240,
getChar = (arr, T) => arr[T >> 5 & arr.length - 1][T & 31],
sqFx = (notesArr, fxArr, delay) => {
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
	fx = parseInt(getChar(fxArr, T - delay), 36);
	note = getChar(notesArr, T - delay);
	if(isNaN(fx) || note === ' ') {
		return 0;
	}
	out = gen(note) * ((8 * T & 7) || (fx / 4 & 1) ? 1 : 2 ** (-1 / 12)) >> 8; // Attack: 012389ABGHIJOPQR
	switch(fx >> 3 & 3) {
	/* 89ABCDEF */ case 1: out += 64 * sin(2 * PI * T); break; // Vibrato effect
	/* GHIJKLMN */ case 2: !(2 * T & 1) && (out = 0); break; // Muted 1st half
	/* OPQRSTUV */ case 3: (2 * T & 1) && (out = 0); // Muted 2nd half
	}
	switch(fx & 3) {
	/* 048CGKOS */ case 0: d = 224; break; // 12.5% duty cycle
	/* 159DHLPT */ case 1: d = 192; break; // 25% duty cycle
	/* 26AEIMQU */ case 2: d = 128; break; // 50% duty cycle
	/* 37BFJNRV */ case 3: d = (8 * T & 3) < 2 ? 64 : 128; // Arpeggio: 75% + 50%
	}
	return 128 * ((out & 255) > d);
},
lead = (a, f) => sqFx(a, f, 0) + sqFx(a, f, 1.5) / 3 + sqFx(a, f, 3) / 4 + sqFx(a, f, 4.5) / 5,
sqBass = i => gen(notesBassSq[i][T / 8 & 3]) >> 10 & 128,
drum = pitch => (1E5 * sin(pitch * T | 0) & 64) * (1 - T % 2 / 3),

// Volume effects
mask = (pattern, speed) => pattern >> (T >> speed) & 1,
env = (rStart, rLen, fStart, fLen) => // Rise & fade
	b < rStart ? 0 : b < rStart + rLen ? (b - rStart) / rLen :
	b < fStart ? 1 : b < fStart + fLen ? 1 - (b - fStart) / fLen : 0,

// Output
min(255,
	(b < 96 ? env(0, 6, 32, 16) : env(88, 16, 104, 8)) *
		lead(notesLead[+(b > 7 && b < 32)], fxLead[+(b > 16)]) / 3 + // Melody 1,2 Lead
	(b < 96 && env(38, 10, 88, 16) *
		lead(notesLead[b > 64 ? 3 : 2], fxLead[b > 71 ? 1 : b > 56 ? 3 : 2]) / 3) + // Melody 3,4 Lead
	(b > 32 && env(28, 12, 48, 32) * lead(notesLead[4], fxLead[4]) / 5) + // High Lead
	env(0, 8, 104, 8) * (sqBass(0) + sqBass(1)) / 10 + // Square Bass
	((b < 32 || b > 48) && (b < 71 || b > 80) &&
		(b > 16 && b < 103 && .4 * tri(gen(notesBassTr[T & 31]) >> 9)) + // Triangle Bass
		(b > 8 && b < 96 && drum(1E6) * mask(0xEAEAAAEA, 1)) / 5) + // Hats
	(b > 7 && b < 104 && (b < 71 || b > 72) &&
		32 * (sin(180 * (T % 1) ** .4) + 1) * mask(0x44490449, 0) + // Kick
		.6 * drum(300) * mask(0xC4444444, 1))); // Snare
