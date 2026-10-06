// The Twelly Tools
// Just a set of tools created by me, with some MaxiToys and GreaserPirate inspirations.
// Configuration stuff

/* Configurations */
SR   = SampleRate     = 48000, 
TN   = Tuning         = 440,
SpB  = SamplesPerBeat = 16384,
V    = Volume         = 128,
BpM  = BeatsPerMinute = 164,

t || (
	FilterBuffer = [],
	DelayBuffers = [], 
	[ResonanceX, ResonanceY] = [[], []]
),

/* This calculates the time speed to be accorded to real BPM */
Speed = BpM / (60 * SR / SpB),

/* This calculates the exact tone  */
Tone = (2 ** (-9 / 12)) * TN * 128 / SR,

// T CONSTANTS
/* These are the most important constants on your track */
/* tt is for the tone and ts for the speed */
tt = t * Tone,
ts = t * Speed,

// UTILITIES
/* Those functions are the utilities of your track, you'll need them! */

/* Those functions are to advance each element of an array */
Bar = (End, Speed) => (ts >> Speed) % End,
ReverseBar = (End, Speed) => Array.from({length: End}, (_, i) => i + 1).reverse()[(ts >> Speed) % End],
Iterate = (SourceArray, Speed) => SourceArray[Bar(SourceArray.length, Speed)],

/* This function is useful for wavetables */
PlayWavetable = (Data, ts) => Decode(Data)[(ts | 0) % Data.length],

/* This function clamps a signal, removing the offset and the clipping */
Clamp = (Input, AmplitudeAmount, Mode) => (
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

/* This function mixs all channels */
Mix = (...Arr) => (
	Arr = Arr.map(x => x % 256 / 256 * V),
	Clamp(Arr.reduce((Accumulator, Item) => Accumulator + Item, 0), 1 / 2, "Soft")
),

/* The ST function: Converts a semitone to a real note */
GenSemitone = (Semitone) => 2 ** (Semitone / 12),
ST = Semitone = (Semitone) => tt * GenSemitone(Semitone),

/* The Decode & Encode function: Encodes and decodes base-64 strings to array (and viceversa) */
BASE64_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/+",
Decode = (SourceString) => [...SourceString].map(x => (
	Result = [],
	x === "-" ? NaN : BASE64_CHARS.indexOf(x)
)),
Encode = (Numbers) => (Numbers.map(n => Number.isNaN(n) ? "-" : BASE64_CHARS[n]).join("")),

/* The Print Functions: If you want to create a display info, this is too useful, so use it good!*/

ActivateConsole = 1, // First, to use all the print functions, you have to change the value of this variable to true, or 1, the default value is 0

/* The Print Functions */
Print = (Text) => {
	if (ActivateConsole) {
		throw Text
	}
	else {throw new Error("Console Error: The console feature is disabled.")}
},
PrintF = (End, Text) => {Print(Text.join(End))},

/* The Center function: centers a string */
CenterString = (Symbol, Input, Amount) => (
	Symbol.repeat(Amount).concat(Input)
	.concat(Symbol.repeat(Amount))
),

/* The MoveString function: adds a symbol in determinated length to "move" the string */
MoveStringToRight = (Symbol, Input, Amount) => (
	Symbol.repeat(Amount).concat(Input)
),

/* Some shortcuts */
Repeat = (Obj, Times) => Obj.repeat(Times),
From = (Length, Func) => Array.from({ length: Length }, (_, i) => Func(_, i)),
Reverse = (Arr) => Arr.reverse(),
Join = (Arr, Sep) => Arr.join(Sep),
Split = (Arr, Sep) => Arr.split(Sep),
JoinRev = (Arr) => [...Arr, ...Reverse(Arr)],
ReplaceNaN = (Arr) => Array.from(Arr, x => x === undefined ? NaN : x),


/* Special Symbols */
NEWLINE = "\n",
TABULAT = "\t",
BIT = "█",

// The Sequence function: Advance each base-36 encoded string character and convert it to notes
Sequence = (SourceData, Speed, Transpose=0) => ST(Iterate(Decode(SourceData), Speed) + Transpose) || 0,

// The ProcessChord function: Process and converts a string to a chord
ProcessChord = (ChordProgression, Speed, Waveform) => (
	(Index = [...Iterate(ChordProgression, Speed)]).reduce((ac, i) => 
		ac + Waveform(ST(Decode(i)[0])) % 256 / Index.length, 0
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

/* Low Pass Filter: allows low frequencies to pass through while attenuating (reducing) high frequencies*/
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
HPR = HighPassResonance = (Input, Level, Resonance) => Input - LPR(Input, Level, Resonance),


/* Waveform: Selects and converts a signal into a custom waveform */
Waveform = (Type, Input, Arg) => (
	Type == "Square" ? HPF(Input % 256 / 2 + 64 & 128, 0.005) :
	Type == "NSquare" ? Input % 256 / 2 + 64 & 128 :
	Type == "Square16" ? HPF(Input % 256 / 2 + 16 & 128, 0.005) :
	Type == "NSquare16" ? Input % 256 / 2 + 16 & 128:
	Type == "Square32" ? HPF(Input % 256 / 2 + 32 & 128, 0.005) :
	Type == "NSquare32" ? Input % 256 / 2 + 32 & 128:
	Type == "Square96" ? HPF(Input % 256 / 2 + 96 & 128, 0.005) :
	Type == "NSquare96" ? Input % 256 / 2 + 96 & 128:
	Type == "Triangle" ? HPF(asin(sin(Input * PI / 256)) / (PI / 2) * 128 & ~15, 0.005) :
	Type == "Sawtooth" ? HPF(atan(tan(Input * PI / 256)) / (PI / 2) * 128 & ~15, 0.005) : 
	Type == "Sine" ? HPF(sin(Input * PI / 128) * 128 & ~15, 0.005) :
	Type == "FMSine1" ? sin(Input * PI / 64 + sin(Input * PI / 128 + sin(Input * PI / 4) * Arg / 3) * Arg + sin(sin(Input * PI / 64) + Input * PI / 32) / 3 * Arg) * 128:
	Type == "FMSine2" ? sin(sin(Input * PI / 128) * Arg + Input * PI / 64) * 128 :
	Type == "XOR" ? HPF((Input ^ (Input * 1.005) | Input) % 256, 0.005) :
	Type == "OR" ? HPF((Input | (Input * 2)) % 256, 0.005) :
	Type == "AND" ? HPF((Input & (Input * 2 * 1.0025)) % 256, 0.005) :
	Type == "Sierpinski" ? HPF((Input | ts >> Args[0]) % 256, 0.005) :
	0
),

/* The chorus function: Create a simple chorus using two tone instances */
Chorus = (ToneIns, Level) => (ToneIns(1) + ToneIns(1 + (Level / 100))) / 2,

/* Envelope: This function creates a envelope without ADSR */
Envelope = (Length, IsBackwards=0, Exponent=1, Cycles=1, MinimumValue=0) => (
	IsBackwards ? ( 
		max((ts / Length % Cycles) ** Exponent, MinimumValue) 
	) : (
		max((1 - ts / Length % Cycles) ** Exponent, MinimumValue) 
	)
),
TransposeData = (Data, Semitones) => Encode(Decode(Data).map(Semitone => Semitone + Semitones)),

/* SequenceEnvelope: This function creates an envelope, but with custom lengths */
SequenceEnvelope = (EnvArray, Speed, Env) => (
	Element = 2 ** Decode(Iterate(EnvArray, Speed)),
	Env(Element)
),
Static = (Amount) => sin((Amount * (tt / Amount | 0)) ** 3),

/* Drum Functions*/
Kick = (Type="Normal", Time, Amplitude=128, Tone=8, Exponent=4) => 
	Type == "Normal" ? (
		Amplitude * sin(sin(Tone * cbrt(ts % Time))) * Envelope(Time, 0, Exponent)
	) : Type == "Square" ? (
			Amplitude * sign(sin(Tone * cbrt(ts % Time))) * Envelope(Time, 0, Exponent) 
	) : Type == "Triangle" ? (
			asin(sin(Tone * cbrt(ts % Time))) * Amplitude * (2 / PI) & ~15
	) : 0,

Snare = (Type="Normal", Time, Amplitude=256, Tone=12, Exponent=8) => (
	SnareEnv = I = Mode => Envelope(Time, 0, Exponent / Mode | 0),
	Type == "Normal" ? (
		SnareNoise = BPF(random(), .1, .2) * Amplitude,
		SnarePerc = Clamp(Kick(Type, Time, Amplitude / 2, Tone, Exponent) + SnareNoise * I(3), 1, "Soft"),
		Clamp(LPR(SnarePerc, .7), 1, "Soft")
	) : Type == "Square" ? (
		(Waveform("NSquare", Static(Tone / 4) * 256) - 64) * I(3)
	) : Type == "Triangle" ? 
		0
	: 0
),
Hihat = (Type="Normal", Time, Amplitude=128, Exponent=3) => (
	Type == "Normal" ? (
		HihatNoise = HPF(random(), .6) * Amplitude,
		HihatNoise * Envelope(Time, 0, Exponent)
	) : (Type == "Square") ? (
		HihatNoise = Waveform("NSquare", Static(1) * Amplitude * 4) % 256 / 128 * Amplitude - (Amplitude / 2),
		HihatNoise * Envelope(Time, 0, Exponent)
	) : 0
),
/* I accidentaly something like a clap while testing the snare function lol */
Clap = (Length, Amplitude, Exponent) => (
	Snare("Normal", Length, Amplitude, 3, 12 + Exponent)
),
/* Reverb: creates a reverb effect using two delays instances */
Reverb = (WetSignal, Length) => (
	Out = Length => (
		Signal = Clamp(WetSignal, 1 / 2, "Soft"),
		WetOut = Delay(Delay(Signal, .5, Length / 2), .5, Length * 2),
		DryOut = Clamp(WetOut, 1 / 2, "Soft")
	),
	Master = Length => [Out((Length * (7 / 8)) | 0), Out((Length * (9 / 8)) | 0)],
	M = Master(Length / (48000 / SR)),
	M.map(Pan => Clamp(Pan, 1 / 2, "Soft")),
	M.map(Pan => HBF(LBF(Pan, .001, .11), .25, 2)),
	M.map(Pan => Clamp(Pan, 1.25, "Hard"))
),

/*LFOs Functions*/
LFO = (Time, Amplitude) => Amplitude * sin(ts * PI / 16384 * Time),
BFO = AbsoluteLFO = (Time, Amplitude) => abs(LFO(Time, Amplitude)),

/* Mix */

/* Melody */
Melody = "e-h-l-j-d-h-t-jh9-h-l-j-a-h-y-x-",
MelIns = Sequence(Melody, 13),
MelIns = Reverb(Waveform("FMSine1", MelIns, 1), 12288),

/* Bass & Sub-Bass */
SubnBass = "eehhlljjddhhttjh",
BassIns = Sequence(SubnBass, 17, -24),
BassIns = Waveform("FMSine2", BassIns, 4 * Envelope(131072)) * Envelope(131072, 0, .5),
SubBassIns = Waveform("Sawtooth", Sequence(SubnBass, 17, -36)),
SubBassIns = [LPR(SubBassIns, .1), LPR(SubBassIns * 1.001, .06)].map(x => x / 2),

/* Lead */
Lead = "eehgee9leehjee9-eqtxtqe9lqltvqpl-ehljdhtj9hljahyxegh-ed9-eqh-dgl-",
LdIns = Sequence(Lead, 15, 12 + LFO(1, 1 / 256 / 8)),
LdIns = Reverb(Waveform("Square", LdIns), 12288),

/* Drums */
DrmIns = Mix(Kick("Normal", 32768) + Hihat("Normal", 8192, 192, 8) + Clap(32768, 256, 24) * !!(ts & 32768)),

Master = Pan => (
	DrmEnvelope = Envelope(32768, 1, 1),
	Clamp(Mix(Mix(
		MelIns[Pan], BassIns, 
		SubBassIns[Pan], LdIns[Pan] / 1.25
	) * DrmEnvelope + DrmIns * 1.5), 1 / 2, "Soft")
),
[Master(0), Master(1)]