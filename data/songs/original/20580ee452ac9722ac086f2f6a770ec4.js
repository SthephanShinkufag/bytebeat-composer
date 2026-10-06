// UNCOMMENTED & UNDOCUMENTED VERSION

SR = 48000, 
TN = 440,
SpB = 16384,
V = 128,
BpM = 102,

t || (
	FilterBuffer = [],
	DelayBuffers = [], 
	[ResonanceX, ResonanceY] = [[], []]
),
Speed = BpM / (60 * SR / SpB),
Tone = (2 ** (-9 / 12)) * TN * 128 / SR,

tt = t * Tone,
ts = t * Speed,

Bar = function(End, Speed, Time=ts) {return (Time >> Speed) % End},
ReverseBar = function(End, Speed) {
	return (End - 1) - Bar(End, Speed)
},
Iter = function(SourceArray, Speed) {
	return SourceArray[Bar(SourceArray.length, Speed)]
},

Clamp = function(Input, Amp=1/2, Mode="Hard") {
	if (Mode == "Soft") {
		return tanh(
			(Input * Amp * PI / 128)
		) * 128
	} else if (Mode === "Hard") { 
		return min(max(Input * Amp, -128), 127) 
	} else if (Mode === "Sine") { 
		return sin(Input * Amp * PI / 128) * 128
	} else if (Mode === "Tri") { 
		return asin(sin(Input * Amp * PI / 128)) * 128
		/ (PI / 2)
	}  else {
		return 0 	
	}
},

Mix = function(...Channels) {
	NewArray = Channels.map(x => x % 256 / 256 * V);
	return Clamp(NewArray.reduce((Accumulator, Item) => Accumulator + Item, 0), 1 / 2, "Soft");
},

GenSemitone = function(Semitone) {
	return 2 ** (Semitone / 12)
},
ST = Semitone = function(Sem) {
	return tt * GenSemitone(Sem)
},

BASE64_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/+",
Decode = function(SourceString) {
	const _String = [...SourceString];
	return _String.map(function(x) {
		if (x === "-") {	
			return NaN
		} else {
			return BASE64_CHARS.indexOf(x)
		}
	})
},
Encode = function(Numbers) {
	return Numbers.map(function(n) { 
		if (Number.isNaN(n)) {
			return "-"
		} else {	
			return BASE64_CHARS[n];
		}
	}).join("")
},

Wavetable = function(Name, Data) {
	this.Data = Data;
	this.Speed = null;
	this.Amplitude = null;
	this.Name = Name;
	this.Input = null;
},
Wavetable.prototype.SetParams = function(Amp, Speed, I) {
	this.Amplitude = Amp;
	this.Speed = Speed;
	this.Input = I;
},
Wavetable.prototype.Build = function() {
	const Index = Bar(
		this.Data.length, 
		this.Speed, this.Input
	);
	return Decode(this.Data[Index]) % 256 / 128 * this.Amplitude
},

ActivateConsole = 1,

Print = function(Text) {
	if (ActivateConsole) {
		throw Text
	}
	else {throw new Error("Console Error: The console feature is disabled.")}
},
PrintF = function(End, Text) {
	Print(Text.join(End))
},

CenterString = function(Symbol, Input, Amount) {
	return Symbol.repeat(Amount).concat(Input)
	.concat(Symbol.repeat(Amount))
},

MoveStringToRight = function(Symbol, Input, Amount) {
	return Symbol.repeat(Amount).concat(Input)
},

Repeat = (Obj, Times) => Obj.repeat(Times),
From = (Length, Func) => Array.from({ length: Length }, (_, i) => Func(_, i)),
Reverse = (Arr) => Arr.reverse(),
Join = (Arr, Sep) => Arr.join(Sep),
Split = (Arr, Sep) => Arr.split(Sep),
JoinRev = (Arr) => [...Arr, ...Reverse(Arr)],
ReplaceNaN = (Arr) => Array.from(Arr, x => x === undefined ? NaN : x),

NEWLINE = "\n",
TABULAT = "\t",
BIT = "█",


Seq = function(SourceData, Speed, Transpose=0) { 			
	return ST(Iter(Decode(SourceData), Speed) + Transpose) || 0
},

CSeq = function(ChordProg, Speed, Waveform) {
	let Index = [...Iter(ChordProg, Speed)];
	return Index.reduce((ac, i) => 
		ac + Waveform(ST(Decode(i)[0])) % 256 / Index.length, 0
	);
},

LPFI = 0,
LPRI = 0,
DlyI = 0,

Delay = function(Input, Feedback=0.5, Samples=12288) {
   Call = DlyI++;
	DelayBuffers[Call] || (DelayBuffers[Call] = Array(Samples).fill(0));
	Samples = (Samples / (48000 / SR)) | 0;
	Buffer = DelayBuffers[Call];
	Input += Buffer[t % Samples];
	Buffer[t % Samples] = Input * Feedback;
	return Buffer[t % Samples]
},
LPF = function(Input, Amp) {
	Call = LPFI++;
	AmpLPF = (Amp / (48000 / SR));
	FilterBuffer[Call] ??= 0;
	return FilterBuffer[Call] += (Input - FilterBuffer[Call]) * AmpLPF
},
HPF = function(Input, Amp) {return Input - LPF(Input, Amp)},
BPF = function(Input, LowAmp, HighAmp) {return HPF(LPF(Input, LowAmp), HighAmp)},
AF = function(Filter, Input, Arg1, Arg2) {
	if (Filter == "NOF") {
		return (HPF(Input, Arg1) + LPF(Input, Arg2)) / 1.75
	} else if (Filter == "LBF") {
		return Input + LPF(Input, Arg1) * Arg2
	} else if (Filter == "HBF") {
		return Input + HPF(Input, Arg1) * Arg2
	}
},
LPR = function(Input, Frequency=.05, Resonance=.7) {
    Call = LPRI++;
    
    ResonanceX[Call] ??= 0;
    ResonanceY[Call] ??= 0;

    Feedback = Resonance + Resonance / (1 - Frequency);

    ResonanceX[Call] += Frequency * (Input - ResonanceX[Call] + Feedback * (ResonanceX[Call] - ResonanceY[Call]));
    ResonanceY[Call] += Frequency * (ResonanceX[Call] - ResonanceY[Call]);

    return ResonanceY[Call];
},
HPR = function(Input, Level, Resonance) {
	return Input - LPR(Input, Level, Resonance)
},
GetInterval = function (Interval, Semitone) {
	Intervals = {
		"maj": [0, 4, 7],
		"m": [0, 3, 7],	
		"aug": [0, 4, 8],
		"dim": [0, 3, 6],
		"maj7": [0, 4, 7, 11],
		"m7": [0, 3, 7, 10],
		"7": [0, 4, 7, 11],
		"8": [0, 4, 7, 12],
		"m8": [0, 3, 7, 12],
		"aug8": [0, 4, 8],
		"dim8": [0, 3, 6, 12],
		"sus4": [0, 5, 7],
		"sus2": [0, 2, 7],
		"sus4(add8)": [0, 5, 7, 12],
		"sus2(add8)": [0, 2, 7, 12]
	};
	return Intervals[Interval].map(x => x + Semitone)
},
DecodeChrd = function(Chrd) {
	NOTES = ['C', 'Db', 'D', 'Eb', 'E',  'F', 'Gb', 'G', 'Ab', 'A',  'Bb', 'B'];
	if (Chrd[1] !== "#") {
		return GetInterval(Chrd.slice(1), NOTES.indexOf(Chrd[0]))
	} else {
		return GetInterval(Chrd.slice(2), NOTES.IndexOf(Chrd.slice(0, 2)))
	}
},
Waveform = (Type, Input, Arg) => (
	Type == "Square" ? HPF(Input % 256 / 2 + 64 & 128, 0.005) :
	Type == "NSquare" ? Input % 256 / 2 + 64 & 128 :
	Type == "Square16" ? HPF(Input % 256 / 2 + 16 & 128, 0.005) - 48 :
	Type == "NSquare16" ? Input % 256 / 2 + 16 & 128:
	Type == "Square32" ? HPF(Input % 256 / 2 + 32 & 128, 0.005) - 48:
	Type == "NSquare32" ? Input % 256 / 2 + 32 & 128:
	Type == "Square96" ? HPF(Input % 256 / 2 + 96 & 128, 0.005) - 48:
	Type == "NSquare96" ? Input % 256 / 2 + 96 & 128:
	Type == "Triangle" ? HPF(asin(sin(Input * PI / 256)) / (PI / 2) * 128 & ~15, 0.005) :
	Type == "Sawtooth" ? HPF(atan(tan(Input * PI / 256)) / (PI / 2) * 128 & ~15, 0.005) : 
	Type == "NSawtooth" ? atan(tan(Input * PI / 256)) / (PI / 2) * 128 : 
	Type == "Sine" ? HPF(sin(Input * PI / 128) * 128 & ~15, 0.005) :
	Type == "FMBell" ? sin(Input * PI / 64 + sin(Input * PI / 128 + sin(Input * PI / 4) * Arg / 3) * Arg + sin(sin(Input * PI / 64) + Input * PI / 32) / 3 * Arg) * 128:
	Type == "FMBass" ? sin(sin(Input * PI / 128) * Arg + Input * PI / 64) * 128 :
	Type == "FMBass" ? sin(sin(Input * PI / 128) * Arg + Input * PI / 64) * 128 :
	Type == "XOR" ? HPF((Input ^ (Input * 1.005) | Input) % 256, 0.005) % 256 - 128:
	Type == "OR" ? HPF((Input | (Input * 2)) % 256, 0.005) % 256 - 128 :
	Type == "AND" ? HPF((Input & (Input * 2 * 1.0025)) % 256, 0.005) % 256:
	Type == "Sierpinski" ? HPF((Input | ts >> Arg) % 256, 0.005) % 256 - 128:
	0
),
Lowtooth = (Input, Level) => LPR(Waveform("NSawtooth", Input), Level),

Chorus = function(ToneIns, Level) {return (ToneIns(1) + ToneIns(1 + (Level / 1000))) / 2},

Envelope = function(Len, IsBackw=0, Exp=1, Cyc=1, Min=0) {
	return IsBackw ? ( 
		max((ts / Len % Cyc) ** Exp, Min) 
	) : (
		max((1 - ts / Len % Cyc) ** Exp, Min) 
	)
},
TransposeSeq = function(Data, Semitones) { 
	return Encode(Decode(Data).map(
		Semitone => Semitone + Semitones)
	)
},

SeqEnvelope = function(EnvArray, Speed, Env) {
	Element = 2 ** Decode(Iter(EnvArray, Speed));
	return Env(Element)
},
Static = function(Amount) { 
	return sin((Amount * (tt / Amount | 0)) ** 3)
},
PL = Polyrhythm = function(Notes, Wave, Delay) {
	return Decode(Notes).reduce((ac, i) => ac + (
		Wave(ST(i)) * Envelope(Delay * GenSemitone(i), 0, 4 / (Notes.length))
	), 0) / Notes.length
},
Interv = (Func, Semitone) => (Func(1) + Func(GenSemitone(Semitone))) / 2,
Fifth = (Func) => Interv(Func, 7),
Fourth = (Func) => Interv(Func, 5),
Octave = (Func) => Interv(Func, 12),

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
Clap = (Length, Amplitude, Exponent) => (
	Snare("Normal", Length, Amplitude, 3, 12 + Exponent)
),

Reverb = (WetSignal, Length) => (
	Out = Length => (
		Signal = Clamp(WetSignal, 1 / 2, "Soft") - 96,
		WetOut = Delay(Delay(Signal, .65, Length / 2), .65, Length * 2) / 1.5,
		DryOut = Delay(Clamp(WetOut, 1 / 2, "Soft"), .5, Length * 8)
	),
	Master = Length => [Out((Length * (7 / 8)) | 0), Out((Length * (9 / 8)) | 0)].map(x => x % 256),
	ReverbMaster = Master(Length / (48000 / SR)),
	ReverbMaster.map(Pan => Clamp(Pan, 1, "Hard") * 2),
	ReverbMaster.map(Pan => AF("LBF", AF("HBF", Pan, .25, .2), .001, 11)),
	ReverbMaster.map(Pan => Clamp(HPF(Pan, 0.001), 1.4) + 1)
),

LFO = (Time, Amplitude) => Amplitude * sin(ts * PI / 16384 * Time),
BFO = AbsoluteLFO = (Time, Amplitude) => abs(LFO(Time, Amplitude)),

/* Mix */
/* Melody */
MelodyPattern = [
	"7777jjjjjjjj77778888kkkkkkkkmmmm",
	"jjjj77777777jjjjhhhh88888888aa98"
],
MelodyEnv = [
	"eeeeggggggggeeeeeeeeggggggggeeee",
	"eeeeggggggggeeeeeeeeggggggggddcc"
],
Melody = Seq(Iter(MelodyPattern, 17), 12),
MelodyEnv = SeqEnvelope(Iter(MelodyEnv, 17), 12, Env => Envelope(Env, 0, 1 / 2)),
Melody = Waveform("FMBell", Melody, MelodyEnv) * MelodyEnv,

/* Bass & Sub-bass */
BassPattern = ["077ccggj", "188ddhhk"],
BassEnvelopePattern = "deeeeeed",
Bass = Seq(Iter(BassPattern, 16), 13, -12),
BassEnvelope = SeqEnvelope(BassEnvelopePattern, 14, Env => Envelope(Env, 0, 1 / 2)),
Bass = Waveform("FMBass", Bass, BassEnvelope * 8) / 1.5,
SubBass = Seq(Iter(BassPattern, 16), 13, -24),
SubBass = Clamp(Lowtooth(SubBass, BassEnvelope / 2) * 1.5 + 48),

/* Mix */
Master = Mix(Melody, SubBass, Bass)