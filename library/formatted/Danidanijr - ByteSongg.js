z = x => {
	t = t - x > 0 ? t - x : 0;
	bpm = 150;
	sr = 44100,
	SongLength = 40; // In bars
	bpmSR = 60 * sr / bpm;
	t = t % (bpmSR * 4 * SongLength); // Song loop
	step = t * 2 / bpmSR;
	stepL = step % 32;
	bar = floor(t / 4 / bpmSR);
	barL = bar % 4;
	n = [
		[76, 0, 3],
		[69, 3, 4],
		[69, 4, 5],
		[72, 5, 6],
		[74, 6, 7],
		[76, 7, 8],
		[77, 8, 11],
		[76, 11, 12],
		[72, 12, 14],
		[74, 14, 16],
		[74, 16, 19],
		[69, 19, 20],
		[69, 20, 22],
		[71, 22, 24],
		[79, 24, 27],
		[76, 27, 28],
		[74, 28, 30],
		[76, 30, 32]
	];
	chords = [
		[57, 60, 64],
		[57, 60, 65],
		[60, 64, 67],
		[59, 62, 67]
	];
	bass = [45, 48, 43, 40];
	note = (x, y) => (t / sr) * 440 * (2 ** ((x - 69) / 12)) * (y ? PI : 1);
	barF = (x, y, z) => x <= bar && bar <= y ? z : 0;
	NP = n.filter(i => i[1] <= stepL && stepL <= i[2] - 0.3)[0];
	r = (t * t / 1.743) % 1;
	NP = NP === undefined ? NP : NP[0];
	return (
		(typeof NP === 'number' ?
			(note(NP, 0) * 16 % 32 + note(NP, 0) * 15.9 % 32 + note(NP, 0) * 16.1 % 32) / 1.33333 : 0) +
		barF(8, 39, ((note(chords[barL][0], 0) * 16) % 32 +
			(note(chords[barL][1], 0) * 16) % 32 +
			(note(chords[barL][2], 0) * 16) % 32 +
			(note(chords[barL][0], 0) * 16.1) % 32 +
			(note(chords[barL][1], 0) * 16.1) % 32 +
			(note(chords[barL][2], 0) * 16.1) % 32) / 2) +
		barF(16, 39, sin(10000 / ((t % bpmSR) + 80)) * 40 + 40) +
		barF(24, 39, step % 4 > 2 ? (r * 40 + 40) / ((step % 4 - 2) + 0.7) : 0) +
		barF(24, 39, (step * 2) % 4 > 2 ? sin(note(bass[barL], 1)) * 70 + 5 : 0) +
		barF(24, 39, sin(note(chords[barL][0], 1) * 8) * 5 +
			sin(note(chords[barL][1], 1) * 8) * 5 + sin(note(chords[barL][2], 1) * 8) * 5)
	) / 2.1;
},
z(0) + (z(1974) / 3.2 + z(5317) / 4.8 + z(10521) / 3.7 + z(27423) / 6.3 + z(3531) / 5.6) / 2;
