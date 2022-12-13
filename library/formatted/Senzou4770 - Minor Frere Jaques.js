srate = 44100,
pitch_adjust = 1.0,

we = [
	1, 1.25, 1.5, 1.75, 2, 2.25, 2.50, 2.75, 3, 3.25, 3.5, 3.75, 4, 3.75, 3.5, 3.25, 3, 2.75, 2.5, 2.25, 2,
	1.75, 1.5, 1.25, 1.0, 0.75, 0.5, 0.25, 0, 0.25, 0.5, 0.75
],
tri = (pitch, octv) => we[((t * pitch * pitch_adjust / octv * 8200 / srate) >> 8) % we.length] * 30,
saw = (pitch, octv) => (t / 32 * 8200 / srate * pitch * pitch_adjust * octv) % (255 * octv),

c = 523.25,
d = 587.33,
ds = 622.25,
f = 698.46,
g = 783.99,
gs = 830.61,

chordtri = (note1, note2, note3, note4, vol) =>
	tri(note1, 1) * vol + tri(note2, 1) * vol + tri(note3, 1) * vol + tri(note4, 1) * vol,
chords = [
	chordtri(c, ds, g, 0, 0.1),
	chordtri(c, ds, g, 0, 0.1),
	chordtri(c, ds, g, 0, 0.1),
	chordtri(c, ds, gs, 0, 0.1)
],
bass = [
	saw(c / 8, 0.12 / 2) + saw(g / 8, 0.12 / 2),
	saw(c / 8, 0.12 / 2) + saw(g / 8, 0.12 / 2),
	saw(c / 8, 0.12 / 2) + saw(g / 8, 0.12 / 2),
	saw(gs / 16, 0.12 / 2) + saw(ds / 8, 0.12 / 2)
],
melody = [
	c, c, d, d, ds, ds, c, c, c, c, d, d, ds, ds, c, c, ds, ds, f, f, g, g, g, g, ds, ds, f, f, g, g, g, g, g,
	gs, g, f, ds, ds, c, c, g, gs, g, f, ds, ds, c, c, c, c, g / 2, g / 2, c, c, c, c, c, c, gs / 2, gs / 2,
	c, c, c, c
],

chords[(t * 8000 / srate >> 13) % chords.length] +
	bass[(t * 8000 / srate >> 13) % bass.length] +
	saw(melody[(t * 8000 / srate >> 10) % melody.length], 1) * 0.1;
