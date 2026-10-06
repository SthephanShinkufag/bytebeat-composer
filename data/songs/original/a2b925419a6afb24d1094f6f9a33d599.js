// Uh
// Author: Two2Fall
// Remix of: Zackx's synthwave engine example
// I hope you like this!

// Configuration Stuff

t || (
	Buffer = [], 
	SampleRate = 48000,
	Tuning = 436, // 436 hz sounds better here
	BPM = 130,
	Cents = 35,
	SamplesPerBeat = 16384,
	Speed = BPM / (60 * SampleRate / SamplesPerBeat)
),

// Speed and Tone
tt = t * (2 ** (-9 / 12)) * Tuning * 128 / SampleRate * (1 + (Cents / 100)),
ts = t * Speed,

// Core Functions
Sequence = (Sequence, Speed, fts=ts) => Sequence[(fts >> Speed) % Sequence.length],
SequenceNote = (Notes, Speed, Transpose=0, fts=ts) => tt * 2 ** ((Sequence(Notes, Speed, fts) + Transpose) / 12) || 0,
Delay = (Func, Level=12, Key=3e3, Divisor=2) => {
	Out = Func(ts);
	for (let Iterations = 1; Iterations <= Level; Iterations++) {
		Out += Func(ts - (Key * Iterations)) / (1 + Divisor)
	};
	return Out
},
// Synths
BassSine = (Input, DetuneFactor) => sin(sin(sin(Input * PI / 128) + sin(Input * PI / 64 / DetuneFactor) * 1.5) + cos(Input * DetuneFactor * PI / 256)),
Supersine = (Input, DetuneFactor) => (Detune = DetFactor => sin(sin(sin(Input * DetFactor * PI / 128) + Input * DetFactor * PI / 64) + Input * DetFactor * PI / 32) + sin(Input * DetFactor * PI / 16) / 4, (Detune(1) + Detune(DetuneFactor)) / 2),

// Sequences
MelodySequence = [0, 7, 11, 14, 7, 4, 9, 16, 6, 7, 12, 19, 14, 11, 9, 11],
BassSequence = [0, -19, -12, -21],

// Song
Song = j => (
	Bass = ts => ts > 0 && (Fifth = Semitone => BassSine(SequenceNote(BassSequence, 17, Semitone, ts), j) / 4, (Fifth(0) + Fifth(7)) / 2 * max(.5, 1 - ts / (ts >> 16 & 1 ? 124576 : 32768) % 1)),
	Bass = Delay(Bass, 5, 12288),
	Melody = ts => t > 0 && (Supersine(SequenceNote(MelodySequence, 13, BassSequence[ts >> 17 & 3], ts), j) * max(.25, 1 - ts / 8192 % 1) / 1.2),
	Melody = Delay(Melody, 4, 12288) / 2,
	Bass + Melody
),
[Song(1.005), Song(.995)]