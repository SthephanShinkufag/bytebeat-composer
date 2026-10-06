/*
|_   _| |__   ___                  
  | | | '_ \ / _ \                 
  | | | | | |  __/                 
 _|_|_|_| |_|\___|  _ _            
|_   _|_      _____| | |_   _      
  | | \ \ /\ / / _ \ | | | | |     
  | |  \ V  V /  __/ | | |_| |     
 _|_|_  \_/\_/ \___|_|_|\__, |     
|_   _| __ __ _  ___| | |___/ _ __ 
  | || '__/ _` |/ __| |/ / _ \ '__|
  | || | | (_| | (__|   <  __/ |   
  |_||_|  \__,_|\___|_|\_\___|_|   

[]===================================VERSION-1.035======[]

In this new version of TTT, I have improved in the channel settings, and fixed some bugs, I hope you like this little update!
*/

t ? 0 : (Wavetable = Array.from({length: 64}, _ => floor(random() * 2) - 1)),

SampleRate = 32000,
t /= SampleRate,

Speed = 0.625,

Song = [[
	[{	
		Waveform: "Square", 
		Speed: Speed, 
		Volume: 1.5, 
		Envelope: {
			Length: 1 / 2, 
			Exponent: 1,
			MinimumValue: .25
		},
	}, 'E-5 --- C-6 --- E-5 --- C-6 G-5 E-5 --- C-6 --- E-5 --- C-6 G-5 E-5 --- C-6 --- E-5 --- C-6 G-5 E-5 --- C-6 --- E-5 --- C-6 G-5 E-5 --- B-5 --- E-5 --- D-6 B-5 E-5 --- B-5 --- E-5 --- D-6 B-5 E-5 --- B-5 --- E-5 --- D-6 B-5 E-5 --- B-5 --- E-5 --- D-6 B-5']],
	[[{	
		Waveform: "Square", 
		Speed: Speed * 16, 
		Volume: 1.5, 
		Envelope: {
			Length: 1, 
			Exponent: 1,
			MinimumValue: 1
		},
	}, '(F-4|A-4|C-5|E-5) (E-4|G-4|B-4|E-5) (E-4|G-4|B-4|D-5) (D-4|F-4|A-4|D-5)']],
	[[{	
		Waveform: "Square", 
		Speed: Speed * 4, 
		Volume: 1, 
		Envelope: {
			Length: 1, 
			Exponent: 1,
			MinimumValue: 1
		},
	}, 'E-2 G-2 A-2 A-2 E-2 G-2 B-2 B-2 E-2 G-2 B-2 B-2 D-2 F-2 A-2 F-2']]
],

// You can change A4 
A4 = 440, 

// Please don't touch this
Bar = (Speed, End, T=t) => int(T / (Speed / 2)) % End,
Clamp = (Input) => min(max(Input, -128), 127),
ParseNote = (Note, InsertNote=false) => {
	GenerateList = Semitone => {
		return [Semitone - 60, Semitone - 48, Semitone - 36, Semitone - 24, Semitone - 12, Semitone, Semitone + 12, Semitone + 24, Semitone + 36, Semitone + 48, Semitone + 60]
	};
	NoteDictonary = {'C': GenerateList(0),'C#': GenerateList(1),'D': GenerateList(2),'D#': GenerateList(3),'E': GenerateList(4),'F': GenerateList(5),'F#': GenerateList(6),'G': GenerateList(7),'G#': GenerateList(8),'A': GenerateList(9),'A#': GenerateList(10),'B': GenerateList(11)
	};
	SplittedNote = [...Note.toUpperCase()];
	if (SplittedNote[1] === '-') {
		Note = NoteDictonary[SplittedNote[0]];
		Note = Note[parseInt(SplittedNote[2], 10) + 1]
		Semitone = 2 ** ((Note - 9) / 12);
		if (!InsertNote) {return Semitone * A4;} else {
			return SplittedNote.join('')
		}
	} else if (SplittedNote[1] === '#') {
		CompleteNote = `${SplittedNote[0]}#`;
		Scale = NoteDictonary[CompleteNote];
		Octave = parseInt(SplittedNote[2], 10) + 1;
		Semitone = 2 ** ((Scale[Octave] - 9) / 12);
		if (!InsertNote) {return Semitone * A4} else {
			return SplittedNote.join('')
		}
	} else {
		return 0;
	}
},
Chord = (Data, WaveformFunc=sin, Arpeggio=false) => {
	Data = Data.slice(Data.indexOf('(')+1, Data.length);
	Data = '(' + '0|' + Data
	Notes = Data.slice(1,-1).split('|');
	Notes = Notes.map((Note) => (List = ParseNote(Note)));
	return Notes.reduce((Accumulator, NextNote) => (
		Accumulator + WaveformFunc(t * 2 * PI * NextNote) / (Notes.length / 2)))
},

// Oscillators
// This includes the waveforms it'll use for the track

// Square waveforms
Square = (Input, PulseWidth=64) => (
	(Input * (64 / PI)) % 256 / 2 
	+ PulseWidth & 128
) - 64,
Square125 = (Input) => Square(Input, 16),
Square25 = (Input) => Square(Input, 32),
AtariSquare = (Input) => Wavetable[Bar(1 / (SampleRate / 16), 64, Input / SampleRate * (64 / PI))] * 128,

// Triangle and another waveforms
Sine = (Input) => (sin(Input) * 127 & ~15),
Triangle = (Input) => asin(sin(Input)) / 1.6 * 128 & ~15,
Sawtooth = (Input) => atan(tan(Input / 2)) / 1.6 * 128 & ~15,
Static = (Input) => Input === 0 || Input === 1 ? random() * 128 * Input & 64 : (T = t * SampleRate, (T * sin(T >> 3) & 64)),
Kick = (Speed, TS) => sin(256 * cbrt((t / TS) % Speed)) * 192 || 0,
Sequencer = (Track, Start=0) => {
	Sequence = Track[Start];
	Info = Sequence[Start];
	Sequence = Sequence[Start + 1].split(" ");
	
	GetConfig = () => {
		[Waveform, Speed, Volume, EnvelopeSettings, FilterSettings] = [
			Info.Waveform,
			Info.Speed,
			Info.Volume,
			Info.Envelope,
		];
		OutputWaveform = 0;
		if (Waveform == 'Square') {
			OutputWaveform = Square
		} else if (Waveform == 'Triangle') {
			OutputWaveform = Triangle
		} else if (Waveform == 'Sawtooth') {
			OutputWaveform = Sawtooth
		} else if (Waveform == 'Static') {
			OutputWaveform = Static
		} else if (Waveform == "Square16") {
			OutputWaveform = Square125
		} else if (Waveform == "Square32") {
			OutputWaveform = Square25
		} else if (Waveform == "Sine") {
			OutputWaveform = Sine
		} else if (Waveform == "AtariSquare") {
			OutputWaveform = AtariSquare
		} else if (Waveform == "Kick") {
			OutputWaveform = Kick
		};
		if (Waveform == "Kick") {OutputWaveform = Input => Kick(Input, Speed)}
		EnvelopeFunc = (Length, Exponent, MinimumValue) => max(MinimumValue, (1 - (t / Speed) / Length % 1) ** Exponent),
		Envelope = [EnvelopeFunc, EnvelopeSettings]
		return [OutputWaveform, Speed, Volume, Envelope]
	}
	[Waveform, Speed, Volume, Envelope] = GetConfig();
	Index = Bar(Speed, Sequence.length);
	Item = Sequence[Index];
	if (!Item) return 0;
	 if (Item[0] === '(' && Item[Item.length - 1] === ')') {
		return Chord(Item, Waveform) * Volume * (Envelope[0](Envelope[1].Length, Envelope[1].Exponent, Envelope[1].MinimumValue))
	} else if (Item === '---') {
		return 0
	}	else if (Item.startsWith("ARPEGGIO") ) {
		ArpeggioSpeed = parseInt(Item.slice(Item.indexOf("[") + 1, Item.indexOf("]")), 10);
		ChordPart = Item.slice(Item.indexOf('('), Item.indexOf(')') + 1).replaceAll("|"," ").slice(1, -1)
		Input = ParseNote(ChordPart.split(" ")[Bar((Speed / ArpeggioSpeed), ChordPart.split(" ").length)])
		return (Waveform(t * 2 * PI * Input) * Volume * (Envelope[0](Envelope[1].Length, Envelope[1].Exponent, Envelope[1].MinimumValue))) 

	} else if (/^[012]+$/.test(Item)) {
    return Waveform(Number(+Item[int(t / (Speed / 2)) % Item.length])) * Volume * (Envelope[0](Envelope[1].Length, Envelope[1].Exponent, Envelope[1].MinimumValue))
	} else if (/^[01]+$/.test(Item)) {
		return Kick(Item) * (Envelope[0](Envelope[1].Length, Envelope[1].Exponent, Envelope[1].MinimumValue))
	} else {
		return (Waveform(t * 2 * PI * ParseNote(Item)) * Volume * (Envelope[0](Envelope[1].Length, Envelope[1].Exponent, Envelope[1].MinimumValue)))
	};
},
Mix = (Arr, Vol) => (
	Arr = Arr.map(x => x % 256 / 256 * Vol),
	Clamp(Arr.reduce((Accumulator, NextItem) => Accumulator + NextItem, 0))
),

GetChannel = NumberOfChannel => Sequencer(Song[NumberOfChannel]),
Channels = Array.from({length: Song.length}, (v, i) => i + 1).map(Item => Clamp(GetChannel(Item - 1) / 2)),

Clamp(Mix(Channels, 64) * 2)