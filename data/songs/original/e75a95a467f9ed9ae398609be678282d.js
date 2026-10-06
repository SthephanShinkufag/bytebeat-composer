/*

The Twelly Sequencer

I have created a simple sequencer with a long square function, well, I extended it and now it is so fucking long. Man this is the first code that exceeds 10000 bytes lmao.

Well I hope you like it
*/

// Configuration Stuff
t || (
	SampleRate = 48000,
	Tuning = 440,
	BPM = 140,
	SamplesPerBeat = 16384,
	Speed = BPM / (60 * SampleRate / SamplesPerBeat)
),

tt = t * (2 ** (-9 / 12)) * Tuning * 128 / SampleRate,
ts = t * Speed,

MakeNote = (Semitone) => tt * 2 ** (Semitone / 12),
Sequence = (Pattern, Speed, fts=ts) => Pattern[(fts >> Speed) % Pattern.length],
SequenceNote = (Notes, Speed, Transpose=0, fts=ts) => MakeNote(Sequence(Notes, Speed, fts) + Transpose),

// Effects, filters and tools
AddEnvelope = (Input, Duration, Exponent, MinValue) => Input % 256 * max(MinValue, (1 - ts / (Duration * SamplesPerBeat) % 1) ** Exponent),
AddLPF = (Input, Power) => (
	this.Accumulator ??= 0,
	this.Accumulator += (Input - this.Accumulator) * Power
),
AddHPF = (Input, Power) => Input - AddLPF(Input, Power),
AddBitcrush = (Input, Level) => floor(Input / Level) * Level,
LFO = (Divisor, Depth) => sin(ts * PI / SamplesPerBeat * Divisor) * Depth,
AddVibrato = (Input, Divisor, Depth) => Input + LFO(Divisor, Depth),
Notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
CreateChord = (Chord) => (
	SplittedChord = Chord.match(/^([A-G](#|b)?)(.*)$/),
	[Note, Type] = [SplittedChord[1], SplittedChord[3]],
	Tonic = Notes.indexOf(Note),
	Type == 'maj' ? [0, 4, 7].map(x => x + Tonic) : 
	Type == 'min' ? [0, 3, 7].map(x => x + Tonic) :
	Type == 'maj7' ? [0, 4, 7, 11].map(x => x + Tonic) :
	Type == 'min7' ? [0, 3, 7, 10].map(x => x + Tonic) : 
	Type == 'maj8' ? [0, 4, 7, 12].map(x => x + Tonic) :
	Type == 'min8' ? [0, 3, 7, 12].map(x => x + Tonic) : 
	Type == 'sus2' ? [0, 2, 7].map(x => x + Tonic) : 
	Type == 'sus4' ? [0, 5, 7].map(x => x + Tonic) : 
	Type == 'sus28' ? [0, 2, 7, 12].map(x => x + Tonic) : 
	Type == 'sus48' ? [0, 5, 7, 12].map(x => x + Tonic) : 0
),

// Oscillators
Square = (Input, Amplitude, PulseWidth, EnvelopeDuration, EnvelopeExponent=1, EnvelopeMinimunValue=0, HighestFilterLevel=0.005, VibratoConfig={Divisor: 0, Depth: 0}) => (
	NormalSquare = AddHPF(AddVibrato(Input, VibratoConfig.Divisor, VibratoConfig.Depth) % 256 / 2 + PulseWidth & 128, HighestFilterLevel),
	NormalSquare = NormalSquare % 256 / 128 - 1,
	NormalSquare *= Amplitude,
	AddEnvelope(NormalSquare + (Amplitude / 2), EnvelopeDuration, EnvelopeExponent, EnvelopeMinimunValue)
),
Triangle = (Input, Amplitude, EnvelopeDuration, EnvelopeExponent=1, EnvelopeMinimunValue=0, HighestFilterLevel=0.005, VibratoConfig={Divisor: 0, Depth: 0}) => (
	Waveform = asin(sin(AddVibrato(Input, VibratoConfig.Divisor, VibratoConfig.Depth) * PI / 128)) / (PI / 2) * 128 % 256,
	Waveform = AddHPF(Waveform, HighestFilterLevel),
	Waveform /= 128,
	Waveform *= Amplitude,
	AddEnvelope(Waveform, EnvelopeDuration, EnvelopeExponent, EnvelopeMinimunValue)
),
Sawtooth = (Input, Amplitude, EnvelopeDuration, EnvelopeExponent = 1, EnvelopeMinimumValue = 0, HighestFilterLevel = 0.005) => (
	Wave = atan(tan(Input * PI / 256)) * Amplitude,
	Wave = AddHPF(Wave, HighestFilterLevel) / 1.5,
	AddEnvelope(Wave, EnvelopeDuration, EnvelopeExponent, EnvelopeMinimumValue)
),

BuildSquare = (Arguments) => (
	EnvelopeSettings = Arguments.Envelope,
	Square(Arguments.Input, Arguments.Amplitude, Arguments.PulseWidth, EnvelopeSettings.Duration, EnvelopeSettings.Exponent, EnvelopeSettings.EMV, Arguments.HFL)
),
BuildTriangle = (Arguments) => (
	EnvelopeSettings = Arguments.Envelope,
	VibratoSettings = Arguments.Vibrato,
	Triangle(Arguments.Input, Arguments.Amplitude, EnvelopeSettings.Duration, EnvelopeSettings.Exponent, EnvelopeSettings.MinimumValue, Arguments.HFL, VibratoSettings)
),
BuildSawtooth = (Arguments) => (
	EnvelopeSettings = Arguments.Envelope,
	VibratoSettings = Arguments.Vibrato,
	Sawtooth(Arguments.Input, Arguments.Amplitude, EnvelopeSettings.Duration, EnvelopeSettings.Exponent, EnvelopeSettings.EMV, Arguments.HFL, VibratoSettings)
),
LoadChannel = (Channel) => (
	PatternType = Channel.PatternType,
	Pattern = Channel.Pattern,
	PatternSpeed = Channel.PatternSpeed,
	Waveform = Channel.Waveform,
	
	PatternType == 'ArpeggioChord' ? (
		ChordName = Sequence(Pattern, PatternSpeed[0]),
		ChordNotes = CreateChord(ChordName),
		ChordFreqs = SequenceNote(ChordNotes, PatternSpeed[1], Transpose),

		Waveform.Configuration.Input = ChordFreqs,
			Waveform.Oscillator == "Triangle" ? BuildTriangle(Waveform.Configuration) :
			Waveform.Oscillator == "Square" ? BuildSquare(Waveform.Configuration) : 
			Waveform.Oscillator == "Sawtooth" ? BuildSawtooth(Waveform.Configuration) : 0
	) : PatternType == 'Chord' ? (
		ChordName = Sequence(Pattern, PatternSpeed[0]),
		ChordNotes = CreateChord(ChordName),

		Waveform.Oscillator == "Triangle" ? (

			Settings = Waveform.Configuration,
			ChordNotes.reduce((Accumulator, NextItem) => Accumulator + Triangle(MakeNote(NextItem), Settings.Amplitude, Settings.Envelope.Duration, Settings.Envelope.Exponent, Settings.Envelope.EMV, Settings.HFL, Settings.Vibrato), 0)) : 

		Waveform.Oscillator == "Square" ? (

			Settings = Waveform.Configuration,	
			ChordNotes.reduce((Accumulator, NextItem) => Accumulator + Square(MakeNote(NextItem), Settings.Amplitude, Settings.PulseWidth, Settings.Envelope.Duration, Settings.Envelope.Exponent, Settings.Envelope.EMV, Settings.HFL, Settings.Vibrato), 0)
		/ 1.5 + 64
		) : Waveform.Oscillator == "Sawtooth" ? (

			Settings = Waveform.Configuration,	
			ChordNotes.reduce((Accumulator, NextItem) => Accumulator + Sawtooth(MakeNote(NextItem), Settings.Amplitude, Settings.Envelope.Duration, Settings.Envelope.Exponent, Settings.Envelope.EMV, Settings.HFL, Settings.Vibrato), 0)
		/ 1.5 + 64
		) : 0
	) : PatternType == "NormalPattern" ? (
		Settings = Waveform.Configuration,
		Waveform.Oscillator == "Square" ? (
			Seq = SequenceNote(Pattern, PatternSpeed),
			Waveform.Configuration.Input = Seq,
			BuildSquare(Waveform.Configuration)
		) : Waveform.Oscillator == "Triangle" ? (
			Seq = SequenceNote(Pattern, PatternSpeed),
			Waveform.Configuration.Input = Seq,
			BuildTriangle(Waveform.Configuration)
		) : Waveform.Oscillator == "Sawtooth" ? (
			Seq = SequenceNote(Pattern, PatternSpeed),
			Waveform.Configuration.Input = Seq,
			BuildSawtooth(Waveform.Configuration)
		) : 0
	) : PatternType == "BarPattern" ? (
		Settings = Waveform.Configuration,
		Waveform.Oscillator == "Square" ? (
			Bar = Sequence(Pattern, PatternSpeed[0]),
			Seq = SequenceNote(Bar, PatternSpeed[1]),
			Waveform.Configuration.Input = Seq,
			BuildSquare(Waveform.Configuration)
		) : Waveform.Oscillator == "Triangle" ? (
			Bar = Sequence(Pattern, PatternSpeed[0]),
			Seq = SequenceNote(Bar, PatternSpeed[1]),
			Waveform.Configuration.Input = Seq,
			BuildTriangle(Waveform.Configuration)
		) : Waveform.Oscillator == "Sawtooth" ? (
			Bar = Sequence(Pattern, PatternSpeed[0]),
			Seq = SequenceNote(Bar, PatternSpeed[1]),
			Waveform.Configuration.Input = Seq,
			BuildSawtooth(Waveform.Configuration)
		) : 0 
	) : PatternType == "RawChord" ? (
			Settings = Waveform.Configuration,
			Bar = Sequence(Pattern, PatternSpeed[0]),
			Waveform.Oscillator == "Square" ? (
			Bar.reduce((Accumulator, NextItem) => 
				Accumulator + Square(MakeNote(NextItem), 
					Settings.Amplitude, Settings.PulseWidth, 
					Settings.Envelope.Duration, 
					Settings.Envelope.Exponent, 
					Settings.Envelope.EMV, Settings.HFL, 
					Settings.Vibrato
				) / 2, 0) 
			) : Waveform.Oscillator == "Triangle" ? (
			Bar.reduce((Accumulator, NextItem) => 
				Accumulator + Triangle(MakeNote(NextItem), 
					Settings.Amplitude, 
					Settings.Envelope.Duration, 
					Settings.Envelope.Exponent, 
					Settings.Envelope.EMV, Settings.HFL, 
					Settings.Vibrato
				) / 2, 0) 
			) : Waveform.Oscillator == "Sawtooth" ? (
			Bar.reduce((Accumulator, NextItem) => 
				Accumulator + Sawtooth(MakeNote(NextItem), 
					Settings.Amplitude, 
					Settings.Envelope.Duration, 
					Settings.Envelope.Exponent, 
					Settings.Envelope.EMV, Settings.HFL, 
					Settings.Vibrato
				) / 2, 0) 
			) : 0
		) : PatternType == "RawArpeggioChord" ? (	
			Settings = Waveform.Configuration,
			Bar = Sequence(Pattern, PatternSpeed[0]),
			Input = SequenceNote(Bar, PatternSpeed[1]),
			Waveform.Configuration.Input = Input,
			Waveform.Oscillator == "Square" ?
				BuildSquare(Waveform.Configuration) :
			Waveform.Oscillator == "Triangle" ?
				BuildTriangle(Waveform.Configuration)
			: Waveform.Oscillator == "Sawtooth" ?
				BuildSawtooth(Waveform.Configuration)
			: 0
		) : 0
	
),
SongChannels = {
	Chord: {
		Pattern: [[7, 14, 19], [5, 12, 17], [3, 10, 15], [5, 12, 17]],
		PatternType: "RawArpeggioChord",
		PatternSpeed: [17, 10],
		Waveform: {
			Oscillator: "Square",
			Configuration: {
				HFL: 0.01,
				PulseWidth: 32,
				Amplitude: 128,
				Envelope: {
					Duration: 1,
					Exponent: 2,
					EMV: 0.35
				},
				Vibrato: {
					Divisor: 0,
					Depth: 0
				},
			},
		},
	},
	Bass: {
		Pattern: [-12, -14, -16, -14],
		PatternType: "NormalPattern",
		PatternSpeed: 17,
		Waveform: {
			Oscillator: "Sawtooth",
			Configuration: {
				HFL: 0.005,
				Amplitude: 64,
				Envelope: {
					Duration: 1,
					Exponent: 0,
					EMV: 0.35
				},
				Vibrato: {
					Divisor: 0,
					Depth: 0
				}
			}
		}
	},
	Melody: {
		Pattern: [[7, 9, 12, 14, 7, 9, 12, 9, 7, 9, 12, 14, 7, 10, 12, 7], [5, 7, 9, 12, 5, 7, 9, 14, 5, 7, 9, 16, 5, 7, 9, 17]].map(x => x.map(x => x + 12)),
		PatternType: "BarPattern",
		PatternSpeed: [17, 13],
		Waveform: {
			Oscillator: "Sawtooth",
			Configuration: {
				HFL: 0.01,
				Amplitude: 128,
				PulseWidth: 16,
				Envelope: {
					Duration: 1 / 2,
					Exponent: 2,
					EMV: 0
				},
				Vibrato: {
					Divisor: 4,
					Depth: (ts >> 17 & 1 ? 32 : 1)
				},
			},
		},
	}
},
Channels = [SongChannels.Melody,SongChannels.Chord, SongChannels.Bass].map((Element) => LoadChannel(Element)),
Out = Channels.reduce((ac, i) => (ac + i), 0) / Channels.length,
Out = min(max(Out * 2, -128), 127),
Out