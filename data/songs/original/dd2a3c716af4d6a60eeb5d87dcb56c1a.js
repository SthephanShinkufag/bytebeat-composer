// The Twelly Tools
// Just a set of tools created by me, with some MaxiToys and GreaserPirate inspirations.
// Configuration stuff
TrackProperties = {
	SampleRate: 48000, // Sample Rate to be played the track
	Tuning: 440, // The tuning of the track	
	SamplesPerBeat: 16384, // You can change this, this property means the samples per beat
	Volume: 1 , // The volume of your track (on float-point number)
	BPM: 131 // The BPM of your track
},
t || (
	FilterBuffer = [],
	DelayBuffers = [], 
	[ResonanceX, ResonanceY] = [[], []]
),

/* This calculates the t speed to be accorded to real BPM */
Speed = TrackProperties.BPM / (60 * TrackProperties.SampleRate / TrackProperties.SamplesPerBeat),

/* This calculates the exact tone  */
Tone = (2 ** (-9 / 12)) * TrackProperties.Tuning * 128 / TrackProperties.SampleRate,

// T CONSTANTS
// These are the most important constants on your track
// tt is for the tone and ts for the speed
tt = t * Tone,
ts = t * Speed,

// UTILITIES
// Those functions are the utilities of your track, you'll need them!
// The Iterate function: Advance each element of an array
Iterate = (SourceArray, Speed) => SourceArray[(ts >> Speed) % SourceArray.length],

// This function clamps a signal, removing the offset and the clipping
AdvancedClamp = (Input, AmplitudeAmount, Mode) => (
	Mode === "Soft" ? 
		tanh(Input * AmplitudeAmount * PI / 128) * 128
	: Mode === "Hard" ? 
		min(max(Input * AmplitudeAmount, -128), 127) 
	: Mode == "Sine" ? 
		sin(Input * AmplitudeAmount * PI / 128) * 128
	: Mode == "Tri" ? 
		asin(sin(Input * AmplitudeAmount * PI / 128)) * 128
		/ (PI / 2)
	: 0
),

// The ST function: Converts a semitone to a real note
ST = (Semitone) => tt * 2 ** (Semitone / 12),

// The Decode & Encode function: Encodes and decodes base-64 strings to array (and viceversa)
BASE64_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/+",
Decode = (SourceString) => [...SourceString].map(x => (
	Result = [],
	x === "-" ? NaN : BASE64_CHARS.indexOf(x)
)),
Encode = (Numbers) => (Numbers.map(n => Number.isNaN(n) ? "-" : BASE64_CHARS[n]).join("")),

// The Sequence function: Advance each base-36 encoded string character and convert it to notes
Sequence = (SourceData, Speed, Transpose=0) => ST(Iterate(Decode(SourceData), Speed) + Transpose) || 0,

// The ProcessChord function: Process and converts a string to a chord
ProcessChord = (ChordProgression, Speed, Waveform) => (
	(Index = [...Iterate(ChordProgression, Speed)]).reduce((ac, i) => 
		ac + Waveform(ST(Decode(i))) % 256 / Index.length, 0
	)
),
// The Delay Function: This function applies reverb into a signal, using the absolute197 reverb method.
// EDIT: I made it infinitely instanciable!
DelayCallCount = 0,
Delay = (Input, Feedback=0.5, Samples=12288) => (
    Call = DelayCallCount++,
	DelayBuffers[Call] || (DelayBuffers[Call] = Array(Samples).fill(0)),
	Buffer = DelayBuffers[Call],
	Input += Buffer[t % Samples],
	Buffer[t % Samples] = Input * Feedback,
	Buffer[t % Samples]
),

// FILTERS
// Those effects are filters, normal filters, so you've to use it well!
CallCount = 0,
LPF = LowPassFilter = (Input, Amp) => (
	Call = CallCount++,
	FilterBuffer[Call] ??= 0,
	FilterBuffer[Call] += (Input - FilterBuffer[Call]) * Amp
),
HPF = HighPassFilter = (Input, Amp) => (Input - LPF(Input, Amp)),
BPF = BandPassFilter = (Input, LowAmp, HighAmp) => HPF(LPF(Input, LowAmp), HighAmp),
NOF = NotchFilter = (Input, LowAmp, HighAmp) => (HPF(Input, HighAmp) + LPF(Input, LowAmp)) / 1.75,
LBF = LowBoostFilter = (Input, Amp, Level) => Input + LPF(Input, Amp) * Level,
HBF = HighBoostFilter = (Input, Amp, Level) => Input + HPF(Input, Amp) * Level,

// NEW! Low Pass Filter with Resonance ADDED!
// https://www.musicdsp.org/en/latest/Filters/29-resonant-filter.html
LPRCallCount = 0,
LPR = LowPassResonance = (Input, Frequency=.05, Resonance=.7) => (
    Call = LPRCallCount++,
    
    ResonanceX[Call] ??= 0,
    ResonanceY[Call] ??= 0,

    Feedback = Resonance + Resonance / (1 - Frequency),

    ResonanceX[Call] += Frequency * (Input - ResonanceX[Call] + Feedback * (ResonanceX[Call] - ResonanceY[Call])),
    ResonanceY[Call] += Frequency * (ResonanceX[Call] - ResonanceY[Call]),

    ResonanceY[Call]
),
Kick = (Time, Amplitude=128, Tone=8, Exponent=4) => Amplitude * sin(sin(Tone * cbrt(ts % Time))) * (1 - ts / Time % 1) ** Exponent,

Snare = (Time, OnlyNoise=0, Amplitude=256, Tone=12, Exponent=8) => (
	SnareNoise = BPF(random(), .1, .2) * Amplitude ,
	SnarePerc = AdvancedClamp(Kick(Time, Amplitude / 6, Tone, Exponent) + SnareNoise * (1 - ts / Time % 1) ** (Exponent / 3 | 0), 1, "Soft"),
	OnlyNoise ? AdvancedClamp(LPR(SnarePerc, .7), 1, "Soft") : SnareNoise * (1 - ts / Time % 1) ** (Exponent / 3 | 0)
),

Hihat = (Time, Amplitude=128, Exponent=3) => (
	HihatNoise = HPF(random(), .6) * Amplitude,
	HihatNoise * (1 - ts / Time % 1) ** Exponent
),
Reverb = WetSignal => (
	Out = Length => (
		Signal = AdvancedClamp(WetSignal, 1 / 2, "Soft"),
		WetOut = Delay(Delay(Signal, .5, Length / 2), .5, Length * 2),
		DryOut = AdvancedClamp(WetOut, 1 / 2, "Soft")
	),
	Master = Length => [Out((Length * (7 / 8)) | 0), Out((Length * (9 / 8)) | 0)],
	Mix = Master(12288 / (48000 / TrackProperties.SampleRate)),
	Mix.map(Pan => AdvancedClamp(Pan, 1 / 2, "Soft")),
	Mix.map(Pan => HBF(LBF(Pan, .001, .11), .25, 2)),
	Mix.map(Pan => AdvancedClamp(Pan, 1.25, "Hard"))
),

Waveform = (Type, Input, Args=[]) => (
	Type == "Square" ? HPF(Input % 256 / 2 + Args[0] & 128, 0.005) - 24:
	Type == "Triangle" ? HPF(asin(sin(Input * PI / 256)) / (PI / 2) * 128 & ~15, 0.005) :
	Type == "Sawtooth" ? HPF(atan(tan(Input * PI / 256)) / (PI / 2) * 128 & ~15, 0.005) : 
	Type == "Sine" ? HPF(sin(Input * PI / 128) * 64 & ~15, 0.005) :
	Type == "XOR" ? HPF((Input ^ (Input * 1.005) | Input) % 256, 0.005) :
	Type == "OR" ? HPF((Input | (Input * 2)) % 256, 0.005) :
	Type == "AND" ? HPF((Input & (Input * 2 * 1.0025)) % 256, 0.005) :
	Type == "Sierpinski" ? HPF((Input | ts >> Args[0]) % 256, 0.005) :
	0
),
Envelope = (Length, IsBackwards=0, Exponent=1, Cycles=1, MinimumValue=0) => (
	IsBackwards ? ( 
		max((ts / Length % Cycles) ** Exponent, MinimumValue) 
	) : (
		max((1 - ts / Length % Cycles) ** Exponent, MinimumValue) 
	)
),
LFO = (Time, Amplitude) => Amplitude * sin(ts * PI / 16384 * Time),
BFO = AbsoluteLFO = (Time, Amplitude) => abs(LFO(Time, Amplitude)),
/* Mix */

/* Melody */
Melody = "0-7-e-a-c-73-70-0-7-e-f-h-fe--a-",
MelodyTone = (Tone) => Waveform("XOR", Tone * Sequence(Melody, 12, 12)) * Envelope(8192),
MelodyInstance = Reverb(MelodyTone(1)),

/* Bass */

Bass = "cccc88a7",
BassInstance = (Waveform("AND", Sequence(Bass, 16, -24)) + Waveform("OR", Sequence(Bass, 16, -36), [BFO(1 / 16, 152)])) / 1.5,
BassInstance = [BassInstance * 1.1, BassInstance * .79],

/* Chords */
Chords = ["cfj", "cfj", "cfj", "cfj", "cfk", "cfk", "aeh", "aej"],
ChordTone = Detune => ProcessChord(Chords, 16, _ => Waveform("AND", _  * Detune)),
ChordInstance = [1.005, .995].map(x => (ChordTone(x) + ChordTone(1)) / 2),

Song = Pan => (
	P = PatternIndex = ts >> 17,
	Faller = P >= 4 ? Envelope(16384, 1) : 1,
	Drums = AdvancedClamp(Kick(16384, 128, 7, 2) + Hihat(8192) * !!(ts & 8192) + Snare(16384) * !!(ts & 16384) * 1.2 + Delay(Snare(16384, 0, 192, 12, 3) * 8 * !!(ts & 16384) / 2, .55, 6144) * 2, 1 / 2, "Soft"),
	Drums *= P >= 4,
	AdvancedClamp(
		((
			ChordInstance[Pan] + 
			MelodyInstance[Pan] * 1.5 + 
			BassInstance[Pan] + 16
		) * Faller + Drums) * 1.2 - 16, 
	TrackProperties.Volume, "Hard") * ((ts >> 14 & 15) == 15 ? !(ts >> 11 & 1) : 1)
),

[Song(0), Song(1)]