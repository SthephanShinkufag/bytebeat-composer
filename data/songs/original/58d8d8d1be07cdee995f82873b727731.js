/*
The Twelly Tool v1.03 - Absolutely Rework
	My bytebeats are getting better, so I have
	to rework my tools to make it more optimized.
	So I decided to rework my tool
*/

/* Constants */
t || (
	SampleRate = 48e3,
	Tuning = 444,
	SamplesPerBeat = 0x4000,
	BeatsPerMinute = 125,
	Volume = 16,

	FilterBuffer = [],
	DelayBuffers = [],
	[ResX, ResY] = [[], []],
	LerpVars = []
),

/* Those functions calculates essential constants, such as tone and speed, do not touch these! */
GetSpeed = (SampleRate, BPM, SamplesPerBeat) => t * (BPM / (60 * SampleRate / SamplesPerBeat)),
GetTone = (Tuning, SampleRate, Transpose=0) => t * (2 ** ((-9 + Transpose) / 12) * Tuning * 128 / SampleRate),

/* Now the time constants */
tt = GetTone(Tuning, SampleRate),
ts = GetSpeed(SampleRate, BeatsPerMinute, SamplesPerBeat),

/* Some shortcuts */
Repeat = (Obj, Times) => Obj.repeat(Times),
From = (Length, Func) => Array.from({ length: Length }, (_, i) => Func(_, i)),
Reverse = (Arr) => Arr.reverse(),
Join = (Arr, Sep) => Arr.join(Sep),
Split = (Arr, Sep) => Arr.split(Sep),
JoinRev = (Arr) => [...Arr, ...Reverse(Arr)],
ReplaceNaN = (Arr) => Array.from(Arr, x => x === undefined ? NaN : x),
Len = (Arr) => Arr.length,
Concat = (Str1, Str2) => Str1.concat(Str2),

/* =========== BASE FUNCTIONS =========== */
/* Those functions are the base functions, those functions that you gotta need when creating bytebeats with my tool */
Bar = (Start, End, Divisor) => (floor(ts / Divisor) + Start) % End,
Rbar = ReverseBar = (End, Divisor) => (End - 1) - Bar(0, End, Divisor),
BASE64_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/+",
Dec = Decode = (SourceString) => (
	[...SourceString].map(x => x == "-" ? NaN : BASE64_CHARS.indexOf(x))
),
Enc = Encode = (Numbers) => (
	Join(Numbers.map(x => Number.isNaN(x) ? "-" : BASE64_CHARS[x]), "")
),
Seq = ArraySequencer = (Data, Divisor) => Data[Bar(0, Len(Data), Divisor)],
Rseq = ReversedArraySequencer = (Data, Divisor) => Data[Rbar(0, Len(Data), Divisor)],
Mseq = MelodicSequencer = (Data, Divisor, Transpose=0) => tt * 2 ** ((Decode(Seq(Data, Divisor)) - Transpose) / 12) || 0,
Cseq = ChordSequencer = (Data, Divisor, Waveform) => (
	Index = [...Seq(Data, Divisor)],
	Index.map(x => Dec(x)).reduce((ac, i) => ac + Waveform(tt * 2 ** (i / 12)) % 256 / Index.length, 0)
),
Bseq = BeatSequencer = (Data, Divisor, Elements) => (
	Data.reduce((ac, i) => ac + (Seq(i, Divisor) == "1" ? Elements[Data.indexOf(i)] : 0), 0) 
),
Dseq = DecodeSequencer = (Data, Divisor) => Dec(Seq(Data, Divisor)),
SoftClamp = (Input) => tanh(Input * PI / 128) * Volume,
HardClamp = (Input) => min(max(Input, -128), 127),


/* []====================FILTERS=====================[] */
/* Those filters are important when creating waveforms or editing audio, use they well! */

/* Call-counts */
/* All filters and effects here (or almost all) are infinitely instanciables, so they need a call-count/index variable */

LPRI = 0,
LPFI = 0,
DLYI = 0,
LRPI = 0,

LPF = (Input, Amp) => (
	Call = LPFI++,
	AmpLPF = Amp / (48e3 / SampleRate),
	FilterBuffer[Call] ??= 0,
	FilterBuffer[Call] += (Input - FilterBuffer[Call]) * AmpLPF
),
LPR = (Input, Frequency, Resonance) => (
    Call = LPRI++,
    
    ResX[Call] ??= 0,
    ResY[Call] ??= 0,
    Feedback = Resonance + Resonance / (1 - Frequency),

    ResX[Call] += Frequency * (Input - ResX[Call] + Feedback * (ResX[Call] - ResY[Call])),
    ResY[Call] += Frequency * (ResX[Call] - ResY[Call]),

    ResY[Call]
),
DLY = Delay = (Input, Samples, Feedback) => (
	Call = DLYI++,
	DelayBuffers[Call] || (DelayBuffers[Call] = Array(Samples).fill(0)),
	Buffer = DelayBuffers[Call],

	Samples = (Samples / (48e3 / SampleRate)) | 0,
	Input += Buffer[t % Samples],
	Buffer[t % Samples] = Input * Feedback,
	Buffer[t % Samples] * (1 / Feedback)
),
HPF = (Input, Amp) => Input - LPF(Input, Amp),
HPR = (Input, Freq, Res) => Input - LPR(Input, Freq, Res),
BPF = (Input, LowAmp, HighAmp) => HPF(LPF(Input, LowAmp), HighAmp),
Lerp = (End, Speed, Repeat=Infinity) => (
	Call = LRPI++,
	ts % Repeat ? 0 : LerpVars[Call] = 0,

	LerpVars[Call] += (End - LerpVars[Call]) / Speed /
	(SampleRate / 48e3)
),


/* Tools */
/* After the filters and effects, I've made a new tools/effects to import on your track, those are important, so use it well! */
Chorus = (ToneIns, Level, Amp=1) => (ToneIns(1) + ToneIns(Level / 1000 + 1) * Amp) / 2,

Envelope = (Len, IsBackw=0, Exp=1, Cyc=1, Min=0, t=ts) => (
	IsBackw ? ( 
		max((t / Len % Cyc) ** Exp, Min) 
	) : (
		max((1 - t / Len % Cyc) ** Exp, Min) 
	)
),
Mix = (...Arr) => (
	Arr = Arr.map(x => x % 256 / 256 * Volume),
	min(max((Arr.reduce((Accumulator, Item) => Accumulator + Item, 0)), -128), 127)
),

Tseq = (Data, Semitones) => ( 
	Encode(Decode(Data).map(
		Semitone => Semitone + Semitones)
	)
),

Eseq = (EnvArray, Divisor, Env) => (
	Element = 2 ** Dec(Seq(EnvArray, Divisor)),
	Env(Element) || 0
),
Static = (Amount) => ( 
	sin((Amount * (tt / Amount | 0)) ** 3)
),
Print = (Text) => {throw Text},
Crushify = (Input, Amount) => (Input * Amount | 0) / Amount,

/* That's it, no more, no less */
/* Now, if you want to add your waveforms, do it on the Synths variable */


Synths = [
	/* 8-bit pulse oscillator*/
	/* A tracker-like pulse channel */
	((Input, Width, Mode) => (
		Smode = Split(Mode, " "),
		Width *= 16,
		
		Smode[0] == "vibr" ? ((
			Input + Dec(Smode[1][0]) * (sin(
				ts * PI / SamplesPerBeat * Dec(Smode[1][1])
			))) % 256 / 2 + 
			Width & 128
		) : Smode[0] == "env" ? (
			(Input % 256 / 2 + Width & 128) * 
			(16 * Envelope(
				2 ** Dec(Smode[1][0]), /* Length         */
				parseInt(Smode[1][1]), /* Reverse or not */
				Dec(Smode[1][2])       /* Strength       */
			) | 0) / 16
		) : Smode[0] == "arp" ? (
			(Input * 2 ** (
				Dseq(Smode[1], 0x400 * Dec(Smode[2])) / 12
			) % 256 / 2 + Width & 128) 
		) : Smode[0] == "kick" ? (
			Pitch = Lerp(0x1000 * Smode[1], 0x1000 * Smode[1] / 4, 0x1000 * Smode[1]),
			Pitch % 256 / 2 + Width & 128
		)  : Mode == "norm" ? (
			Input % 256 / 2 + Width & 128
		) : 0
	)),

	/* 8-bit triangle oscillator*/
	/* A tracker-like triangle channel */
	((Input, Mode) => (
		Smode = Split(Mode, " "),
		Smode[0] == "kick" ? (
			Pitch = Lerp(0x1000 * Smode[1], 0x1000 * Smode[1] / 4, 0x1000 * Smode[1]),
			asin(sin(
				Pitch * PI / 128
			)) * 128 * (2 / PI) & ~15
		) : Smode[0] == "vibr" ? (
			Pitch = Dec(Smode[1][0]) * abs(sin(
				ts * PI / SamplesPerBeat * Dec(Smode[1][1])
			)),
			asin(sin(
				(Input + Pitch) * PI / 128
			)) * 128 * (2 / PI) & ~15
		) : Smode[0] == "arp" ? (
			asin(sin(
				Input * 2 ** ((Dseq(
				Smode[1], 
				0x400 * Dec(Smode[2]
			))) / 12) * PI / 128
			)) * 128 * (2 / PI) & ~15
		) : Smode[0] == "norm" ? (
			asin(sin(
				Input * PI / 128
			)) * 128 * (2 / PI) & ~15
		) : 0
	))
	
],
Patterns = [
	["jhfh", "1110100101000010"],
	"555hhh55hhkk--85555hhh55ff--8888",
	"1-------2222----"
],

MelodyFreq = Mseq(Patterns[0][0], 0x20000),
SquareMelody = Synths[0](MelodyFreq, 2, "arp 05a 1"),
SquareMelody *= Seq(Patterns[0][1], 0x1000),
SquareMelody *= Crushify(Envelope(0x1000, 0, 1 / 4), 16) * 4,
SquareMelody += Synths[0](MelodyFreq, 2, "arp 05a 1") * (Seq(Patterns[0][1], 0x1000) == "0") % 256 / 8,

BassFreq = Mseq(Patterns[1], 0x1000, 12),
TriangleBass = Synths[1](BassFreq / 2, ts >> 12 & 3 ? "vibr v2" : "kick 2"),
SquareBass = Synths[0](BassFreq, 1, ts >> 12 & 3 ? "vibr v2" : "kick 2"),

DrumIndex = Seq(Patterns[2], 0x800),
NoiseDrum = DrumIndex == 1 ? Static(2) : DrumIndex == 2 ? Static((-ts >> 5 & 255) / 64 + 1) : 0,
NoiseDrum *= 128,
NoiseDrum &= 128,
NoiseDrum *= DrumIndex == 1 ? 1 / 2 : DrumIndex == 2 ? (Dseq("f-edcba987654321", 0x200) / 16) || 0 : 0,

Channels = [
	SquareMelody,
	SquareBass,
	TriangleBass,
	NoiseDrum
],
Channels = Channels.reduce((ac, i) => ac + (i % 256 / Channels.length), 0),
HardClamp(HPF(HardClamp(Channels * Volume / 128), .005) * Volume)