// Deltarune - KEYGEN
// https://www.youtube.com/watch?v=DEDeNeKqyzs
const instruments = 10;
const startingTempo = 1000;
const A4 = 440;

const MajorScale = {
	C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
}

const InverseMajorScale =
{
sharps: ['C ','C#','D ','D#','E ','F ','F#','G ','G#','A ','A#','B '],
flats: ['C ','Db','D ','Eb','E ','F ','Gb','G ','Ab','A ','Bb','B ']
};

function noteNameToHz(N) {
  const MIDI = MajorScale[N[0]]+{'#':1,'b':-1,' ':0}[N[1]]+parseInt(N[2])*12 + 12;
  return 2**((MIDI-69)/12)*A4;
}

function HzToNoteName(H,flats=0) {
  const MIDI = round(log2(H/A4)*12) + 69;
  const octave = (MIDI - 12) / 12;
  const noteWithinOctave = MIDI % 12;
  return InverseMajorScale[flats?'flats':'sharps'][noteWithinOctave] + octave.toString(10)[0];
}

// Don't change these, they're updated automatically.
let sampleRate = 48000;
let lastT = 0;
let change = 0;
let reversed = false;

class ADSR {
	constructor(attack, decay, sustainTime, sustainLevel, release, exponent=1.0) {
		this._A = attack;
		this._D = decay;
		this._SL = sustainLevel;
		this._ST = sustainTime;
		this._R = release;
		this._E = exponent;
		this._t = 0;
	}
	get v() {
		if(this._t < this._A) return (this._t / this._A) ** this._E;
		else if(this._t < this._A+this._D) {
			const d = ((this._t - this._A) / this._D) ** this._E;
			return (1-d)+(this._SL)*d;
		} else if(this._t < this._A+this._D+this._ST) return this._SL;
		else if(this._t <= this._A+this._D+this._ST+this._R) return this._SL*(1-((this._t - this._A - this._D - this._ST) / this._R) ** this._E);
		else return null; // We've already fully released!
	}
	t() {this._t+=(T.T/60)/sampleRate;}
}

class Tempo {
	constructor(tempo = 120) {
		this.T = tempo;
		this._t = this._T = 0;
	}
	s(T) { this.T = T; }
	t() {
		this._t += 1 * (this.T / 60);
		while(this._t > sampleRate) {
			this._t -= sampleRate;
			return 1;
		}
		return 0;
	}
	r() {
		this._t = this._T = 0;
	}
}

let T = new Tempo(startingTempo);

// An abstract class for a voice.
// Create this with a pitch to set Hz and phase values.
// Works with both sharps and flats!
class Voice {
	constructor(note, volume=1, adsr = new ADSR(0, 0, 0, 1, 1)) {
		this.phase = 0;
		this.Hz = noteNameToHz(note);
		this.ADSR = adsr;
		this.v = volume;
	}
	t() {
		this.ADSR.t();
	}
	_p() {
		this.phase = (this.phase + 1 / sampleRate * this.Hz * change)%1.0;
	}
}

// Wrapper function for various retro instruments.
// 0 - Square wave.
// 1 - Octosquare wave.
// 2 - 8-step triangle wave.
// 3 - POKEY.
function Retro(type,duty=0.5) {
	class RetroClass extends Voice {
		constructor(...a) {
			super(...a);
		}
		sample() {
			const v = this.ADSR.v;
			if(v==null) return null;
			this._p();
			switch(type) {
				case 0: default:
				return this.phase < duty? v * this.v : 0;
				case 1:
				return (this.phase*7.999&7)/7 * v * this.v;
				case 2:
				return this.phase < 0.5? (this.phase*15.999&15)/15 * v * this.v * 2: (2 - (this.phase*15.999&15)/15*2) * v * this.v;
				case 3:
				return +'011100100010101111011010011000000'[(this.phase*31.999&31)]*this.v*v;
			}
		}
	}
return RetroClass;
}


// A Karplus-Strong string.
// This used to be a bare class but I changed it and now
// you can change the damping. (lower retention is more damping, FYI)
function String(retention) {
	class StringClass extends Voice {
		constructor(...a) {
			super(...a);
			this.wavetable=Array(this.len=round(sampleRate/this.Hz)).fill(0).map(k=>random());
			this.idx=0;
		}
   	_p() {
     		this.idx=(this.idx+change)%this.len;
   	}
		sample() {
			const v = this.ADSR.v;
			if(v==null) return null;
			this.wavetable[(this.idx+1)%this.len]=this.wavetable[(this.idx+1)%this.len]*retention+this.wavetable[(this.idx)%this.len]*(1-retention);
			this._p();
			return this.wavetable[this.idx] * v * this.v;
		}
	}
   return StringClass;
}

// Wrapper function for FM instruments.
// X0 - Sine wave.
// X1 - Soft E. piano
// X2 -      E. piano
function FM(brightness) {
	class FMClass extends Voice {
		constructor(...a) {
			super(...a);
		}
		_p() {
		this.phase = (this.phase + (PI*2) / sampleRate * this.Hz * change)%(PI*40320);
		}
		sample() {
			const v = this.ADSR.v;
			if(v==null) return null;
			const b = brightness>9?v:1;
			this._p();
			switch(brightness%10) {
				case 0: return (sin(this.phase)/2+0.5)*v*this.v;
				case 1: return (sin(sin(this.phase)*0.7*v+this.phase)/2+0.5)*v*this.v
				case 2: return (sin(sin(sin(this.phase*16)/4+this.phase)*1.3*v+this.phase)/2+0.5)*v*this.v
				default: return 0;
			}
		}
	}
	return FMClass;
}

let voices = instruments==null?[]:Array(instruments).fill(null);

function insertVoice(z,...a) {
	for(let i = 0; i < voices.length; i++) {
		if(voices[i]==null) {
			voices[i] = new z(...a);
			return;
		}
	}
	if(instruments==null) voices.push(new z(...a));
}

function tickADSR() {
	for(let i = 0; i < voices.length; i++) {
		if(voices[i] != null) voices[i].t();
	}
}

let time = {idx: 0, beat: 0};

function tick() {
	while( reversed?(song[time.idx]?.start ?? Number.NEGATIVE_INFINITY) >= time.beat:(song[time.idx]?.start ?? Number.POSITIVE_INFINITY) <= time.beat ) {
		const node = song[time.idx];
		time.idx+=reversed?-1:1;
		switch(node.type) {
			case 'instrument': insertVoice(node.class,node.note,node.volume,new ADSR(...node.adsr)); break;
			case 'tempo': T.s(node.tempo); break;
			case 'loop': T._t=T._T=time.beat=time.idx=0; break;
			default: throw `Unknown type ${node.type}, node ${time.idx}: ${JSON.stringify(node)}`; break;
		}
	}
	time.beat+=reversed?-1:1;
}

function mixer(maxVolume) {
	let output = 0;
	for(let i = 0; i < voices.length; i++) {
		if(voices[i]!=null) {
			const sample = voices[i].sample();
			if(sample==null) {
				voices[i] = null;
				continue;
			} else if(typeof sample === 'number' && !isNaN(sample)) {
				output += sample;
			}
		}
	}
	return (output / maxVolume) * 2 - 1;
}

let recompileDetector = null;

function display(y) {
 let S = `${T.T} TPM, T=${time.beat}\n@CHASYXX'S MIDI(?) ENGINE 0.5.0@|Instruments@@@@@|\n--------------------------------+---+------------+\n`;
 for(let i = 0; i < max(9,voices.length); i++) {
   let s = '';
   if(y) {
	   const d = Math.round(max(9,voices.length)/2)+2;
   	if((time.idx+i-d)<song.length && (time.idx+i)>(d-1)) {
			const entry = song[i+time.idx-d];
   		if(entry.start == song[time.idx-1].start) s='----> '; else s= `${entry.start.toString(10).padStart(5,'@')} `;
   		if(entry.type==='instrument') s+=`${entry.class.name.padEnd(12,'@')}: ${entry.note}`;
   		else if(entry.type==='tempo') s+= `Set tempo to ${entry.tempo} TPM`;
         else s+= 'Loop';
   	}
   }
   s=(s.padEnd(32,'@'))+'|';
   if(i<voices.length) {
     if(voices[i] === null)
     s+=`@:@|@.@.@::@.@.@`;
     else s+=`${HzToNoteName(voices[i].Hz)}|${voices[i].constructor.name.padEnd(12,'@')}`;
   } else s+=`=F=#===FLOOR!===`;
   s+='|'
   S+=s+'\n';
 }
 throw S.replace(/@/g,'\u200c ');
}

function main(t,SR) {
	sampleRate=SR??sampleRate;
	change = abs(round(t*SR)-lastT);
	reversed = round(t*SR) < lastT;
	if(abs(t) < Number.EPSILON) {
		change = 1;
		reversed = false;
		T.r();
		T.s(startingTempo);
		time = {idx: 0, beat: 0};
		voices = instruments==null?[]:Array(instruments).fill(null);
		if (recompileDetector != null) tick();
	} else if(recompileDetector == null) {
		time.beat = floor(t * startingTempo / 60); // This will work fine for songs that don't change tempo.
		// For songs that do, it tries it's best.
		tick();
		recompileDetector = 1;
	}
	for(let i = 0; i < change; i++) {
		switch(T.t()) {
			default: break;
			case 1: tick(); display(1);
			case 0: tickADSR(); break;
		}
	}
	lastT = round(t*SR);
   if(t==0) display(0);
	return mixer(5);
}

const Arp = String(0.9);
const Bass = Retro(0,0.4);
const Melody = Retro(0,0.3);

const ArpV = 1.5;
const BassV = 1;
const MelodyV = 1;

// const Arp = Retro(0);
// const Bass = Retro(0);
// const Melody = Retro(0);

const song = [
	{ type: 'instrument', start: 0 , class: Bass, volume: BassV, adsr: [ 0, 0, 24, 1, 0, 1 ], note: 'C 2'},
	{ type: 'instrument', start: 0 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 0 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 4'},
	{ type: 'instrument', start: 2 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D 4'},
	{ type: 'instrument', start: 4 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 6 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 8 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 10 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 12 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 14 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D 4'},
	{ type: 'instrument', start: 16 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 4'},
	{ type: 'instrument', start: 18 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D 4'},
	{ type: 'instrument', start: 20 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 20 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 22 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 24 , class: Bass, volume: BassV, adsr: [ 0, 0, 8, 1, 0, 1 ], note: 'D 2'},
	{ type: 'instrument', start: 24 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 26 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 26 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'D#5'},
	{ type: 'instrument', start: 28 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 28 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 30 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D 4'},
	{ type: 'instrument', start: 32 , class: Bass, volume: BassV, adsr: [ 0, 0, 32, 1, 0, 1 ], note: 'D#2'},
	{ type: 'instrument', start: 32 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'G 5'},
{ type: 'instrument', start: 32 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 34 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 36 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G#4'},
	{ type: 'instrument', start: 38 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 40 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'F 5'},
{ type: 'instrument', start: 40 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#5'},
	{ type: 'instrument', start: 42 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G#4'},
	{ type: 'instrument', start: 44 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'D#5'},
{ type: 'instrument', start: 44 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 46 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 48 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
	{ type: 'instrument', start: 50 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 52 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G#4'},
	{ type: 'instrument', start: 54 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 56 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 56 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#5'},
	{ type: 'instrument', start: 58 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G#4'},
	{ type: 'instrument', start: 60 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'G 4'},
	{ type: 'instrument', start: 62 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'D#4'},
   { type: 'instrument', start: 64 , class: Bass, volume: BassV, adsr: [ 0, 0, 32, 1, 0, 1 ], note: 'A#1'},
	{ type: 'instrument', start: 64 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
	{ type: 'instrument', start: 64, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 4'},
	{ type: 'instrument', start: 65 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 66 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
	{ type: 'instrument', start: 66, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 67 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 68 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
{ type: 'instrument', start: 68, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 69 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 70 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
{ type: 'instrument', start: 70, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 71 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 72 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
	{ type: 'instrument', start: 72, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 73 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 74 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
	{ type: 'instrument', start: 74 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 75 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 76 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
	{ type: 'instrument', start: 76 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 77 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 78 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 1, 1 ], note: 'E#4'},
	{ type: 'instrument', start: 78 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 79 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 1, 1, 8, 1 ], note: 'E#5'},
	{ type: 'instrument', start: 80, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 4'},
	{ type: 'instrument', start: 82, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 84, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 86, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 88 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'D#5'},
	{ type: 'instrument', start: 88, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 90 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 92 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 92 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 94 , class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 96 , class: Bass, volume: BassV, adsr: [ 0, 0, 32, 1, 0, 1 ], note: 'F 2'},
	{ type: 'instrument', start: 96 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'G 5'},
	{ type: 'instrument', start: 96, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 4'},
	{ type: 'instrument', start: 98, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 100, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 102, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 104 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 104, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 106, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 108 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'D#5'},
	{ type: 'instrument', start: 108, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 110, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 112, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 4'},
	{ type: 'instrument', start: 114, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A 4'},
	{ type: 'instrument', start: 116, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 118, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 120 , class: Melody, volume: MelodyV, adsr: [ 0, 0, 0, 1, 8, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 120, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'F 5'},
	{ type: 'instrument', start: 122, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'C 5'},
	{ type: 'instrument', start: 124, class: Arp, volume: ArpV, adsr: [ 0, 0, 4, 1, 0, 1 ], note: 'A#4'},
	{ type: 'instrument', start: 126, class: Arp, volume: ArpV, adsr: [ 0, 0, 2, 1, 0, 1 ], note: 'A 4'},
   { type: 'loop', start: 128 }
];

return main;