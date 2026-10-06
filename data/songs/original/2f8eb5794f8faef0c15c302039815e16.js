// Configuration Stuff
t || (
	SampleRate = 48000,
	Tuning = 440,
	BPM = 73,
	SamplesPerBeat = 16384,
	Speed = BPM / (60 * SampleRate / SamplesPerBeat)
),

tt = t * (2 ** (-9 / 12)) * Tuning * 128 / SampleRate,
ts = t * Speed,

Sequence = (Sequence, Speed, fts=ts) => Sequence[(fts >> Speed) % Sequence.length],
SequenceNote = (Notes, Speed, Transpose=0, fts=ts) => tt * 2 ** ((Sequence(Notes, Speed, fts) + Transpose) / 12),

// Effects
Delay = (Func, Level=12, Key=3e3, Divisor=2) => {
	Out = Func(ts);
	for (let Iterations = 1; Iterations <= Level; Iterations++) {
		Out += Func(ts - (Key * Iterations)) / (1 + Divisor)
	};
	return Out
},

// Waveforms
Square = (Input, PulseWidth) => (Input % 256 / 2 + PulseWidth & 128) ,
Sawtooth = (Input, DetuneFactor) => ((Detune = Factor => atan(tan(Input * Factor * PI / 256)) / (2 * PI) * 64), (Detune(1) + Detune(DetuneFactor)) / 2),

// Sequences
ChordSequence = [
	[0, 4, 7, 14],
	[0, 4, 9, 16],
	[0, 5, 8, 14],
	[2, 7, 11, 14]
],
MelodySequence = [[4, 7, 11, 14], [4, 9, 12, 16], [5, 8, 12, 14], [2, 7, 11, 14]],

// Song
Song = j => (
	Melody = ts => ts > 0 && (Square(SequenceNote(Sequence(MelodySequence, 16, ts), 13, 0, ts), 32) - 64) * (1 - ts / 8192 % 1),
	Melody = Delay(Melody, 5, 6144) / 2,
	Chord = ChordSequence[ts >> 16 & 3].reduce((Accumulator, NextItem) => Accumulator + Sawtooth(tt * 2 ** (NextItem / 12), j), 0) * 2,
	min(max(Melody + Chord, -128), 127)
),
[Song(1.005), Song(.995)]