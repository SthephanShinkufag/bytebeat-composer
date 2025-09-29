// Dabu - Dwarf Fortress OST - Toady One
// https://www.youtube.com/watch?v=Mn9o6Gfnb_I
// But i actually tried to make a piano.
// also uh yeah smaller song thing yaay
const instruments = 10;
const startingTempo = 320;
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
	sample(){return null;}
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
				return this.phase < duty? v * this.v * 0.5: v * this.v * -0.5;
				case 1:
				return ((this.phase*7.999&7)/7-0.5) * v * this.v;
				case 2:
				return ((this.phase < 0.5 ? (this.phase*15.999&15)/15 * 2: (2 - (this.phase*15.999&15)/15*2))-0.5)*this.v*v;
				case 3:
				return (+'011100100010101111011010011000000'[(this.phase*31.999&31)]-0.5)*this.v*v;
			}
		}
	}
return RetroClass;
}


// A Karplus-Strong string.
// This used to be a bare class but I changed it and now
// you can change the damping. (lower retention is more damping, FYI)
function String(weight, smooth=0, decay=0, offset = 0) {
	class StringClass extends Voice {
		constructor(...a) {
			super(...a);
			this.wavetable = Array(this.len=round(sampleRate/(this.Hz)) + offset).fill(0).map(x=>random()-0.5);
			this.weight = weight;
			this.decay = decay;
			this.smooth = smooth;
			for (let j=0; j<smooth; ++j)
				for (let i=0; i<this.len; ++i)
					this.wavetable[i] = this.wavetable[i]*.2+this.wavetable[((i-1)%this.len+this.len)%this.len]*.8;
			this.idx=0;
		}
   	_p() {
     		this.idx=(this.idx+change)%this.len;
   	}
		sample() {
			const v = this.ADSR.v;
			if(v==null) return null;
			this.wavetable[this.idx%this.len]=
			(this.wavetable[this.idx%this.len]*this.weight+
			this.wavetable[((this.idx==0?this.len-1:this.idx-1))%this.len]*(1-this.weight))
			*(1-this.decay);
			const s = this.wavetable[this.idx] * v * this.v;
			this._p();
			return s*(this.smooth+1)**0.6;
		}
	}
   return StringClass;
}

// 7.13 2
function Piano(softPedal, softness=3) {
	class PianoClass {
		constructor(note, volume=1, adsr = new ADSR(0, 0, 0, 1, 1)) {
			this.phase = 0;
			this.Hz = noteNameToHz(note);
			this.ADSR = adsr;
			this.v = volume;
			this.strings = (this.Hz * 7.13 < A4) ? 1 : (this.Hz * 2 <= A4 || softPedal) ? 2 : 3;
			const W = min(0.9,0.3+(this.Hz-noteNameToHz('Cb0'))/(noteNameToHz('A 2')-noteNameToHz('Cb0'))*0.6);
			this.string1 = new (String(W,softness,0.000064,0))(note, 1, new ADSR(0, 0, 0, 1, 1));
			this.string2 = new (String(W,softness,0.000064,1))(note, 1, new ADSR(0, 0, 0, 1, 1));
			this.string3 = new (String(W,softness,0.000064,0))(note, 1, new ADSR(0, 0, 0, 1, 1));
		}
		t() {
			this.ADSR.t();
		}
		sample() {
			const v = this.ADSR.v;
			if(v==null) return null;
			const strA = this.string1.sample();
			const strB = this.string2.sample();
			const strC = this.string3.sample();
			let O = 0;
			if(this.strings==3) O=(strA+strB+strC)/2.5;
			else if(this.strings==2) O=(strA+strB)/1.3;
			else O=strA;
			return O * this.v * v;
		}
	}
	return PianoClass;
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
				case 0: return sin(this.phase)/2*v*this.v;
				case 1: return sin(sin(this.phase)*0.7*v+this.phase)/2*v*this.v
				case 2: return sin(sin(sin(this.phase*16)/4+this.phase)*1.3*v+this.phase)/2*v*this.v
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

function getEntry(offset = 0) {
	return song.slice((time.idx+offset)*41+1,(time.idx+offset)*41+42) ?? (reversed ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);
}

function tick() {
	while( (parseInt(getEntry().slice(1,7),16) <= time.beat) ^ reversed ) {
		const node = getEntry();
		time.idx+=reversed?-1:1;
		switch(node[0]) {
			case 'I': insertVoice(
		instrumentTable[parseInt(node.slice(8,10),16)],
		node.slice(10,13),
		parseInt(node.slice(13,15),16)/16,
		new ADSR(
			parseInt(node.slice(16,20),16)/256+1/16,
			parseInt(node.slice(21,25),16)/256,
			parseInt(node.slice(26,30),16)/256,
			parseInt(node.slice(30,32),16)/16,
			parseInt(node.slice(33,37),16)/256+1/16,
			parseInt(node.slice(38,40),16)/16
		)); break;
			case 'T': T.s(parseInt(node.slice(8,16),16)/65536); break;
			case 'L': T._t=T._T=time.beat=time.idx=0; break;
			default: throw `Unknown type ${node[0]}, node ${time.idx}: ${JSON.stringify(node)}`; break;
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
	return (output / maxVolume) * 2;
}

let recompileDetector = null;

function display(y) {
 let S = `${T.T} TPM, T=${time.beat}\n@CHASYXX'S COOL SEQUENCER 0.6.0@|Instruments@@@@@|\n--------------------------------+---+------------+\n`;
 for(let i = 0; i < max(9,voices.length); i++) {
   let s = '';
   if(y) {
	   const d = Math.round(max(9,voices.length)/2)+2;
   	if((time.idx+i-d)<(song.length-1)/41 && (time.idx+i)>(d-1)) {
			const entry = getEntry(i-d);
			const thisTime = parseInt(entry.slice(1,7),16);
			const lastTime = parseInt(getEntry(-1).slice(1,7),16);
   		if(thisTime == lastTime) s=(reversed?'REVERSED':'='.repeat((time.beat-lastTime)/(parseInt(getEntry(0).slice(1,7),16)-lastTime) * 8 | 0).padEnd(8,'-'))+'>@'; else s= `${('0o'+parseInt(entry.slice(1,7),16).toString(8)).padStart(9,'@')} `;
   		if(entry[0]==='I') s+=`${entry.slice(8,10)} plays ${entry.slice(10,13)}`;
   		else if(entry[0]==='T') s+= `Set tempo to ${parseInt(entry.slice(8,16),16)/65536}`;
         else s+= '=======@Loop@=======';
   	} else if ((time.idx+i-d)<(song.length+34)/35  && (time.idx+i)>(d-1)) {
			s+= '#############@STOP@#############';
		}
   }
   s=(s.padEnd(32,'@'))+'|';
   if(i<voices.length) {
     if(voices[i] === null)
     s+=`...|------------`;
     else s+=`${HzToNoteName(voices[i].Hz)}|${voices[i].constructor.name.padEnd(12,'-')}`;
   } else s+=`///|////////////`;
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
		change = 1;
		reversed = false;
		T.r();
		T.s(startingTempo);
		time.beat = floor(t * startingTempo / 60); // This will work fine for songs that don't change tempo.
		// For songs that do, it tries it's best.
		voices = instruments==null?[]:Array(instruments).fill(null);
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
	return mixer(3);
}

const instrumentTable = [
	// String(0.9)
	(Piano(0,14)),
]

const song = `
T000000|01680000........................ I000000|00G#310|0000:0000:000010:0900:10
I000002|00D#310|0000:0000:000010:0900:10 I000003|00F#410|0000:0000:000010:0900:10
I000004|00G#410|0000:0000:000010:0900:10 I000008|00F#410|0000:0000:000010:0c00:10
I00000e|00E 410|0000:0000:000010:0c00:10 I000014|00D#410|0000:0000:000010:0c00:10
I000019|00C#310|0000:0000:000010:0c00:10 I00001a|00C#410|0000:0000:000010:0c00:10
I000021|00E 410|0000:0000:000010:0c00:10 I000028|00C#410|0000:0000:000010:1000:10
I000034|00D#310|0000:0000:000010:0900:10 I000035|00A 310|0000:0000:000010:0900:10
I000037|00G#410|0000:0000:000010:0900:10 I000038|00F#410|0000:0000:000010:0900:10
I000039|00G#410|0000:0000:000010:0a00:10 I00003c|00E 410|0000:0000:000010:0900:10
I000040|00D#410|0000:0000:000010:0c00:10 I000044|00E 410|0000:0000:000010:1000:10
I00004b|00C#310|0000:0000:000010:0c00:10 I00004c|00F#410|0000:0000:000010:0c00:10
I000056|00C#410|0000:0000:000010:1000:10 T000063|01b80000........................
I000063|00D#310|0000:0000:000010:0900:10 I000064|00A 310|0000:0000:000010:0900:10
I000066|00B#310|0000:0000:000010:0900:10 I000067|00F#410|0000:0000:000010:0900:10
I000068|00G#410|0000:0000:000010:0900:10 I00006c|00F#410|0000:0000:000010:0900:10
I000070|00B#310|0000:0000:000010:0900:10 I000074|00A 310|0000:0000:000010:0900:10
I000078|00B#310|0000:0000:000010:0c00:10 I000078|00F#410|0000:0000:000010:0c00:10
I000080|00G#410|0000:0000:000010:0900:10 I000084|00C#410|0000:0000:000010:0900:10
I000084|00E 410|0000:0000:000010:0900:10 I000088|00C#418|0000:0000:000010:0900:10
I00008c|00G#310|0000:0000:000010:0900:10 I000090|00C#410|0000:0000:000010:0900:10
I000094|00G#410|0000:0000:000010:0c00:10 I0000a0|00G#410|0000:0000:000010:0900:10
I0000a4|00A#310|0000:0000:000010:0900:10 I0000a4|00C#410|0000:0000:000010:0900:10
I0000a8|00G 310|0000:0000:000010:0c00:10 I0000b0|00E 310|0000:0000:000010:0900:10
I0000b4|00G 310|0000:0000:000010:0c00:10 I0000bc|00C#410|0000:0000:000010:0900:10
I0000c0|00G 310|0000:0000:000010:0900:10 T0000c4|01b30000........................
I0000c4|00B 310|0000:0000:000010:0c00:10 I0000c8|00G#310|0000:0000:000010:0c00:10
I0000cc|00D#310|0000:0000:000010:0c00:10 I0000d0|00G#310|0000:0000:000010:0c00:10
T0000d4|01ae0000........................ I0000d4|00B 310|0000:0000:000010:0c00:10
I0000d8|00G#310|0000:0000:000010:0c00:10 I0000dc|00D#310|0000:0000:000010:0c00:10
I0000e0|00G#310|0000:0000:000010:0c00:10 T0000e4|01a90000........................
I0000e4|00B 310|0000:0000:000010:0c00:10 I0000e8|00G#310|0000:0000:000010:0c00:10
I0000ec|00D#310|0000:0000:000010:0c00:10 I0000f0|00G#310|0000:0000:000010:0c00:10
T0000f4|01a40000........................ I0000f4|00B 310|0000:0000:000010:0c00:10
I0000f8|00G#310|0000:0000:000010:0c00:10 I0000fc|00D#310|0000:0000:000010:0c00:10
I000100|00G#310|0000:0000:000010:0c00:10 I000104|00B 310|0000:0000:000010:0c00:10
I000104|00C#510|0000:0000:000010:1000:08 I000108|00G#310|0000:0000:000010:0c00:10
I000108|00B 410|0000:0000:000010:1000:08 I00010c|00D#310|0000:0000:000010:0c00:10
I000110|00G#310|0000:0000:000010:0c00:10 I000114|00B 310|0000:0000:000010:0c00:10
I000118|00G#310|0000:0000:000010:0c00:10 I00011c|00D#310|0000:0000:000010:0c00:10
I000120|00G#310|0000:0000:000010:0c00:10 I000124|00B 310|0000:0000:000010:0c00:10
I000128|00G#310|0000:0000:000010:0c00:10 I00012c|00D#310|0000:0000:000010:0c00:10
I000130|00G#310|0000:0000:000010:0c00:10 I000134|00B 310|0000:0000:000010:0c00:10
I000138|00G#310|0000:0000:000010:0c00:10 I00013c|00D#310|0000:0000:000010:0c00:10
I000140|00G#310|0000:0000:000010:0c00:10 I000144|00E 410|0000:0000:000010:0c00:10
I000144|00D#510|0000:0000:000010:0c00:10 I000148|00B 310|0000:0000:000010:0c00:10
I000148|00C#510|0000:0000:000010:0c00:10 I00014c|00G#310|0000:0000:000010:0c00:10
I000150|00B 310|0000:0000:000010:0c00:10 I000154|00E 410|0000:0000:000010:0c00:10
I000158|00B 310|0000:0000:000010:0c00:10 I00015c|00G#310|0000:0000:000010:0c00:10
I000160|00B 310|0000:0000:000010:0c00:10 I000164|00D#410|0000:0000:000010:0c00:10
I000168|00B 310|0000:0000:000010:0c00:10 T00016c|01a40000........................
I00016c|00G#310|0000:0000:000010:0c00:10 T000170|01ae0000........................
I000170|00B 310|0000:0000:000010:0c00:10 T000174|01b80000........................
I000174|00C#410|0000:0000:000010:0c00:10 T000178|01c20000........................
I000178|00B 310|0000:0000:000010:0c00:10 T00017c|01cc0000........................
I00017c|00G#310|0000:0000:000010:0c00:10 T000180|01d60000........................
I000180|00B 410|0000:0000:000010:1000:08 I000180|00B 310|0000:0000:000010:0c00:10
T000180|01e00000........................ I000184|00E 310|0000:0000:000010:0c00:10
I000184|00C#510|0000:0000:000010:1000:08 I000188|00B 310|0000:0000:000010:0c00:10
I000188|00B 410|0000:0000:000010:1000:08 I00018c|00G#310|0000:0000:000010:0c00:10
I000190|00B 310|0000:0000:000010:0c00:10 I000190|00D#510|0000:0000:000010:1000:08
I000194|00E 410|0000:0000:000010:0c00:10 I000198|00B 310|0000:0000:000010:0c00:10
I00019c|00G#310|0000:0000:000010:0c00:10 I0001a0|00B 310|0000:0000:000010:0c00:10
I0001a4|00G#218|0000:0000:000010:0c00:10 I0001a8|00G#310|0000:0000:000010:0c00:10
I0001ac|00D#310|0000:0000:000010:0c00:10 I0001b0|00D#410|0000:0000:000010:0c00:10
I0001b0|00D#510|0000:0000:000010:0c00:10 I0001b4|00B 310|0000:0000:000010:3000:10
I0001b4|00D#510|0000:0000:000010:0c00:10
`

// const song = ` I000000|00A 440|0000:0000:FFFF10:FFFF:10 `

return main;