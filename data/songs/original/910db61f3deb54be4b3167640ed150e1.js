// Set time properties
t %= 8388608,		// Song length (length of 8 bars in samples * entries in array, song uses 524288 * 16)
beat = t / 8192,	// Beat length
bar = beat / 8,	// Bar length

// Triangular wave generator
tri = note => abs(
	.08 *
	// Select note from musical scale (between D# and E lydian scales when taking 1st note as root)
	(1 << (shift = note + 4) / 7) * 2 ** ((2 * shift % 14 - (shift % 7 > 3)) / 12) *
	(t + 10 * sin(t / 1024)) // Vibrato effect
	% 64 - 32
) - 16, // Align wave to the center

// Define several variables for the song
root = 17 - (bar | 0) % 4, // Used for chords and bass
funcMel = note => tri((beat / 2 ^ bar / 3 * 8 + 3) % 12 + 14 + note), // Generates main melody
mainChord = (tri(root) + tri(root + 2) + tri(root + 4) + tri(root + 6)) / 3,
bass = 1.5 * tri(root - 14),
baseMel = funcMel(0),
upMel = funcMel(7) / 2,
downMel = funcMel(-7),
altBass = (tri(root - 7) + tri(root - 3)) / 2 * (1 + beat % 2 | 0), // Not really "bass" but it's close
chordCombo = mainChord + bass,
mildFull = baseMel + chordCombo,
cut = beat % 64 < 60, // For cutting off patterns at certain spots
full = mildFull + upMel + downMel / 2 + altBass,
exFull = full + upMel / 2,
inter = upMel + altBass,
altMel = tri((beat ^ bar / 3 * 8 + 3) % 6 + 21) / 2, // Melody used in the last third of the song

// Song array
[
	baseMel,
	baseMel + (bar / 8 % 1) * cut * chordCombo,
	mildFull,
	baseMel + cut * chordCombo,
	full,
	exFull,
	cut * chordCombo,
	inter,
	baseMel + cut * (inter + mainChord),
	full,
	exFull,
	full + altMel,
	exFull + altMel * 2,
	baseMel + upMel / 2 + altMel + mainChord,
	upMel + altMel + mainChord,
	altMel + cut * tri(root)
][bar >> 3]
+ 128; // Align song to center
