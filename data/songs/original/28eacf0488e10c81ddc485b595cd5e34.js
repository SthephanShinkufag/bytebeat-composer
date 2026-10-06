/*
TWO2FALL
Love Me Do - BYTEBEAT COVER
[]=====================================================[]

This cover was so easy to make. I will start using the TTT note system to create covers because it is so versatile.

I like this song so much so I have created this cover to make you hear it. I hope you like it!
*/

t || (
	SampleRate = 48000,
	Tuning = 440,
	BPM = 130,
	SamplesPerBeat = 16384,
	Volume = 128,
	Speed = BPM / (60 * SampleRate / SamplesPerBeat)
),

tt = t * (2 ** (-9 / 12)) * Tuning * 128 / SampleRate,
ts = t * Speed,

Sequence = (Sequence, Speed, fts=ts) => Sequence[(fts >> Speed) % Sequence.length],
ParseNote = (Note) => {
	GenerateList = Semitone => {
		return [Semitone - 60, Semitone - 48, Semitone - 36, Semitone - 24, Semitone - 12, Semitone, Semitone + 12, Semitone + 24, Semitone + 36, Semitone + 48, Semitone + 60]
	};
	NoteDictonary = {'C': GenerateList(0),'C#': GenerateList(1),'D': GenerateList(2),'D#': GenerateList(3),'E': GenerateList(4),'F': GenerateList(5),'F#': GenerateList(6),'G': GenerateList(7),'G#': GenerateList(8),'A': GenerateList(9),'A#': GenerateList(10),'B': GenerateList(11)
	};
	if (Note == "---") {return NaN};
	SplittedNote = [...Note.toUpperCase()];
	if (SplittedNote[1] === '-') {
		Note = NoteDictonary[SplittedNote[0]];
		Semitone = Note[parseInt(SplittedNote[2], 10) + 1]
		return Semitone 
	} else if (SplittedNote[1] === '#') {
		CompleteNote = `${SplittedNote[0]}#`;
		Scale = NoteDictonary[CompleteNote];
		Octave = parseInt(SplittedNote[2], 10) + 1;
		return Scale[Octave]
	} else {
		return 0;
	}
},
ProcessChord = (Input, Wave) => {
	Chord = Input.slice(1, -1).split("|")
	ChordSemitones = Chord.map(x => ParseNote(x))
	Chord = ChordSemitones.reduce((ac, i) => ac + Wave(tt * 2 ** (i / 12)) / ChordSemitones.length, 0)
	return Chord
},
Pattern = (Notes, Speed, Transpose=0, fts=ts) => (Semitones = Notes.split(" ").map(Note => ParseNote(Note)), tt * 2 ** ((Sequence(Semitones, Speed, fts) + Transpose) / 12)),

SimulatedNoise = Tone => (tt * Tone / 8 | 0) * (tt * Tone / 8 >> 2 | 0) * (tt * Tone / 8 >> 8 | 0) & 64,

// Notes
// I'm using right now the Twelly Tracker note system, because it looks nice
MelodyPattern = [
	"F-4 F-4 F-4 F-4 E-4 E-4 E-4 E-4 D-4 G-3 --- G-3 --- G-3 --- G-3",
	"F-4 F-4 F-4 F-4 E-4 E-4 E-4 E-4 D-4 G-3 --- G-3 --- G-3 --- G-3",
	"F-4 F-4 F-4 F-4 E-4 E-4 E-4 E-4 D-4 G-3 --- G-3 --- G-3 C-4 D-4",
	"--- --- G-3 --- G-3 G-3 --- G-3 --- G-3 G-3 --- C-4 C-4 B-3 B-3"
],
BassPattern = "G-3 --- D-3 --- C-3 --- G-3 ---", 
ChordPattern = [
	["(G-3|D-4|B-4|G-5)",
		"(G-3|G-4|B-4|G-5)",
		"(B-3|D-4|G-5|G-5)",
		"(D-4|G-4|B-4|G-5)",
		"(E-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
	"(C-4|E-4|G-4|C-5)"],
	["(G-3|D-4|G-4|G-5)",
		"(D-4|G-4|B-4|G-5)",
		"(G-4|B-4|G-5|B-5)",
		"(G-3|G-4|B-4|G-5)",
		"(E-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
	"(C-4|E-4|G-4|G-5)"],
	["(G-3|D-4|G-4|G-5)",
		"(D-4|G-4|B-4|G-5)",
		"(G-4|B-4|G-5|B-5)",
		"(G-3|G-4|B-4|G-5)",
		"(E-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
	"(C-4|E-4|G-4|G-5)"],
	["(G-3|D-4|B-4|G-5)",
		"(G-3|G-4|B-4|G-5)",
		"(B-3|D-4|G-5|G-5)",
		"(D-4|G-4|B-4|G-5)",
		"(E-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
		"(C-4|G-4|C-5|G-5)",
	"(C-4|E-4|G-4|C-5)"],
],
DrumPattern = "K S K S K SSK S ",

Melody = Sequence(MelodyPattern, 17),
Melody = Pattern(Melody, 13, 12) || 0,
Melody = (Melody % 256 / 2 + 16 & 128) ,

Bass = asin(sin(Pattern(BassPattern, 14) * PI / 128)) / (PI / 2) * 64 & ~15,
Bass += 64,
Chord = ProcessChord(Sequence(Sequence(ChordPattern, 17), 14), Input => ((Input % 256 / 2 + 16 & 128) - 128)),
Drums = Sequence(DrumPattern, 13) == 'K' ? SimulatedNoise((1 + (-ts >> 9 & 31)) / 64) * (1 - ts / 8192 % 1) * 2: Sequence(DrumPattern, 13) == 'S' ? SimulatedNoise(8) * (1 - ts / 8192 % 1) : 0,

min(max((Chord + Melody + Bass + Drums) / 2 - 64, -128), 127)