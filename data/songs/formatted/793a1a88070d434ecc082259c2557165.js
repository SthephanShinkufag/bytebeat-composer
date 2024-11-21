((
	// abcdeghi is what bar you're currently on in the stepper, which is s.
	// s rises very slowly relative to t. we set it to step 0-7 inclusive
	// and for each step in the bars (0-7) we assign a letter variable to it
	// to save space. This is the bass note layout for each bar.
	(a = (s = int(t / 9600 % 8)) === 0) * (y = t * 2) * 1.5873 +
	(b = s === 1) * y * (v = 1.4983) +
	(c = s === 2) * y * v +
	(d = s === 3) * y +
	(e = s === 4) * y * 1.5873 +
	(g = s === 5) * y * v +
	(h = s === 6) * y +
	(i = s === 7) * y
) % (m = 256) +
(
	// u is an octave frequency, 4x the frequency of y (bass line)
	//   which is 2x the frequency of t (raw counter % 256)
	// the constant multipliers above and below are derived from the formula
	// as described on http://www.phy.mtu.edu/~suits/NoteFreqCalcs.html
	// to solve for a note offset, plug a constant into the formula f/(12th root of 2)
	// notice how we're using multiple bar identifier for the same notes.
	// this is another code shrinker.
	// also, v is = to 1.4983. I just used it so much
	// in the song I replaced it with a variable.
	(a | e) * (u = y * 4) * v +
	u * (
		(b | c | g | h) * 1.3348 +
		d * 0.8908 +
		i * 1.2599
	)
	// the above is equivalent to
	// u*(
	//  (s === 0) * 1.4983 +
	//  (s === 1) * 1.3348 +
	//  (s === 2) * 1.3348 +
	//  (s === 3) * 0.8908 +
	//  (s === 4) * 1.4983 +
	//  (s === 5) * 1.3348 +
	//  (s === 6) * 1.3348 +
	//  (s === 7) * 1.2599
	// )
) % m + (
	u * (
		i + (a | e) * 1.1892 +
		(b | c | g | h) * 1.1224 +
		d * v
	)
) % m + (
	u * (
		(a | e) +
		(b | g | h) * 0.8908 +
		c * 0.9438 +
		d * 1.1892 +
		i * 0.7491
	)
) % m + (
	u * (
		(a | e) * 0.7937 +
		(b | c | g | h) * 0.7491 +
		d / 2 + i * 0.627
	)
) % m) / 8 * (
	// now this is where the gating/chord groove happens
	// during the duration of the 8 bars above, there's
	// 96 steps. w represents each step as it occurs.
	// as the number '1' is bitshifted through each set
	// of hex numbers, if it lines up with another 1, it
	// will activate the above chord to be played by
	// evaluating to 1, otherwise, it will be zero and
	// mute the above chords.
	// I'm not doing any sort of fancy tempo changes for the groove
	// er, i guess the best way to show how the groove works is with a
	// pseudo tracker interface
	// C-5 --
	// --- --
	// D-5 --
	// C-5 --
	// --- --
	// D-5 --
	// E-5 --
	// --- --
	// G-5 --
	// manual swing i guess you can call it
	(((w = int(t / 800 % 96)) < 32) * (1 << w & 0xC007307) +
		(w >= 32 && w < 64) * (1 << w & 0x73070E70) +
		(w > 64) * (1 << w & 0xE70C400)) !== 0
) +

// noise generators
(t * sin(t * cos(t)) % 18 + 25) * ((1 << (t / 200 % 24) & 1052928) !== 0) +
(t * sin(t * cos(t)) % 38 + 75) * ((1 << (t / 400 % 24) & 12288) !== 0) +
(tan(sin(t * cos(t))) * 32 + 74) * (t % sin(t / 33) < cos(0.032 * t)) * ((1 << (t / 400 % 24) & 1) !== 0) +
// same concept as above, except they're running on much smaller loops.

// melody!
// manually changes the frequency based on what
// tick we're on (0-95)
// zero is considered to be off... but sometimes we need the root note,
// so we just use a number really close to zero! !! ! ! HAX
(pow(1.059463, z = (w === 83 |
		w === 77 |
		w === 63 |
		w === 35 |
		w === 17 |
		w === 51 |
		w === 47 |
		w === 9 |
		w === 0 |
		w === 30) * -5 +
	(w === 3) * 0.1 +
	(w === 41 | w === 6 | w === 74) * -2 +
	(w === 72 |
		w === 66 |
		w === 80 |
		w === 59 |
		w === 62 |
		w === 29 |
		w === 18 |
		w === 54 |
		w === 15 |
		w === 12) * -7 +
	(w === 69 | w === 56 | w === 26 | w === 20 | w === 14) * -9 +
	(w === 21) * -12 +
	(w === 50 | w === 44 | w === 33) * -4 +
	(w === 93) * -6
) * u * 2) % m / 4 * (z !== 0);
