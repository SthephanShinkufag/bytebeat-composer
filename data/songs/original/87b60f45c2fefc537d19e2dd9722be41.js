let mod=(n,d)=>n%d>=0?n%d:n%d+d;
let clamp=(mn,mx)=>q=>max(min(q,mx),mn);

class Clock {
	constructor(freq) {
		this.f = freq;
	};
	tick(t) {
		if (floor(this.f*t)!=floor(this.f*this.t??-1)) {
			this.t = t;
			return true;
		}
		this.t = t;
		return false;
	};
};

class String {
	constructor(pitch, weight, smooth=0, decay=0) {
		this.arr = Array.from({length:round(110*436/pitch)},random);
		this.pc = round(110*436/pitch)-110*436/pitch;
		this.w = weight;
		this.d = decay;
		this.t = 0;
		for (let j=0; j<smooth; ++j)
			for (let i=0; i<this.arr.length; ++i)
				this.arr[i] = this.arr[i]*.2+this.arr[mod(i-1,this.arr.length)]*.8;
	};
	render(off=0) {
		this.arr[this.t%this.arr.length]=(this.arr[this.t%this.arr.length]*this.w+this.arr[mod(this.t-1,this.arr.length)]*(1-this.w))*(1-this.d)+this.d/2;
		let idx = mod(this.t++ +off+this.t/this.arr.length*this.pc,this.arr.length);
		let xfade = idx-floor(idx);
		return (this.arr[floor(idx)]*2*(1-xfade)+this.arr[ceil(idx)%this.arr.length]*2*xfade-1);
	};
};

class Piano {
	static pedal = true;
	static calcWeight = pitch=>min((Piano.pedal?.75:.2)+pitch/400,.99);
	static calcSmoothing = pitch=>(pitch<60?pitch/10+8:30-pitch/5)/2;
	static calcDecay = pitch=>1-.992**(18/pitch)+(Piano.pedal?0:.05);
	constructor(pitch) {
		this.p = pitch;
		this.t = 0;
		this.a = new String(
			263*2**((pitch-60)/12),
			Piano.calcWeight(pitch),
			Piano.calcSmoothing(pitch),
			Piano.calcDecay(pitch)
		);
		this.b = new String(
			263*2**((pitch-60)/12)*.9985**(18/pitch),
			Piano.calcWeight(pitch),
			Piano.calcSmoothing(pitch),
			Piano.calcDecay(pitch)
		);
		this.c = new String(
			263*2**((pitch-60)/12)*1.002**(18/pitch),
			Piano.calcWeight(pitch),
			Piano.calcSmoothing(pitch),
			Piano.calcDecay(pitch)
		);
	};
	render() {
		return (this.a.render()+this.b.render()+(this.p>36?this.c.render():0))*(1-.993**(this.t++*max(1,this.p**2/3600)));
	};
	pressPedal() {
		Piano.pedal = true;
		if (this instanceof Piano) {
			this.a.w = Piano.calcWeight(this.p);
			this.b.w = Piano.calcWeight(this.p);
			this.c.w = Piano.calcWeight(this.p);
			this.a.d = Piano.calcDecay(this.p);
			this.b.d = Piano.calcDecay(this.p);
			this.c.d = Piano.calcDecay(this.p);
		}
	};
	releasePedal() {
		Piano.pedal = false;
		if (this instanceof Piano) {
			this.a.w = Piano.calcWeight(this.p);
			this.b.w = Piano.calcWeight(this.p);
			this.c.w = Piano.calcWeight(this.p);
			this.a.d = Piano.calcDecay(this.p);
			this.b.d = Piano.calcDecay(this.p);
			this.c.d = Piano.calcDecay(this.p);
		}
	};
};

class OrchStacc {
	constructor(pitch) {
		this.p = pitch;
		this.t = 0;
	};
	render() {
		let env=.06**(200/(this.t>>1))*.99982**(this.t>>1);
		let D=n=>n*1.0005**n;
		let C=f=>((s=h=>sin(this.t*2*PI/48000*h*104*2**(f/12)),
(s(D(1))+s(D(2))/2+s(D(3))/3+s(D(4))/2+s(D(5))/3+s(D(6))/4+s(D(7))/4+s(D(8))/8+s(D(9))/5+s(D(10))/6+s(D(11))/6)/4+((t/48000*254.4*104*2**(f/12)&255)+(this.t/48000*257*104*2**(f/12)&255)+(this.t/48000*255.6*104*2**(f/12)&255)+(this.t/48000*256.8*104*2**(f/12)&255))/4096)-.125)*env;
	};
};

class PolyphonicInstrument {
	constructor(instrumentClass, nVoices) {
		this.Instrument = instrumentClass;
		this.voices = Array(nVoices).fill(undefined);
		this.vTail = 0;
	};
	play(...args) {
		this.voices[this.vTail++%this.voices.length] = new this.Instrument(...args);
	};
	render() {
		return this.voices.reduce((a,v)=>a+(v?v.render():0),0);
	};
	all(method, ...args) {
		method(...args);
		this.voices.forEach(v=>v&&method.call(v, ...args));
	};
};

class Lowpass {
	constructor(samples, cutoff=samples/5) {
		this.arr = Array(samples).fill(0);
		this.kern = Array(samples).fill(0).map((e,i)=>{let x=i/(samples-1)*2-1; return sin(cutoff*x)/(PI*x)*.5*(1+cos(PI*x));});
		this.i = 0;
	};
	render(samp) {
		this.arr[this.i++%this.arr.length] = samp;
		return this.arr.reduce((s,v,i)=>s+v*this.kern[mod(i-this.i,this.kern.length)]/this.arr.length,0)*10;
	};
};

class Highpass {
	constructor(samples, cutoff=samples/5) {
		this.arr = Array(samples).fill(0);
		this.kern = Array(samples).fill(0).map((e,i)=>{let x=i/(samples-1)*2-1; return sin(cutoff*x)/(PI*x)*.5*(1+cos(PI*x))*(-1)**i});
		this.i = 0;
	};
	render(samp) {
		this.arr[this.i++%this.arr.length] = samp;
		return this.arr.reduce((s,v,i)=>s+v*this.kern[mod(i-this.i,this.kern.length)]/this.arr.length,0)*10;
	};
};

class Delay {
	constructor(samples) {
		this.arr = Array(samples).fill(0);
		this.i = 0;
	};
	render(samp) {
		this.arr[this.i++%this.arr.length] = samp;
		return this.arr[this.i%this.arr.length];
	};
};

let a;
let P5 = 3/2;
let P4 = 4/3;

let master = new Clock(8.4);
let lpf1 = new Lowpass(40,19);
let wide = new Delay(480);

let beatCnt = 0;
let pChordsA = [
	[40,56,59,64],[56,59,64],[56,59,64],[40,56,59,64],
	[33,57,59,64],[57,59,64],[57,59,64],[35,57,59,64],
	[37,56,59,64],[56,59,64],[35,54,59,63],[54,59,63],
	[33,52,57,61],[52,57,61],[52,57,61],[52,57,61]
];
let pChordsB = [...pChordsA];
pChordsB[14] = [33,52,54,60];
pChordsB[15] = [];
let mel = [...Array(64),,71,78,80,80,78,76,71,78,80,,80,,,,,,71,78,80,80,78,76,71,78,80,,78,,76,,76,83,76,81,76,80,76,75,76,78,80,,78,,76,,73,...Array(16),,71,78,80,80,78,76,71,78,80,,80,,,,,,71,78,80,80,78,76,71,78,80,,78,,76,,76,83,76,81,76,80,76,75,76,78,80,,78,,76,,78,,76,73,...Array(12),71];
let chords = [...pChordsA,...pChordsA,...pChordsB];

const NUM_VOICES = 12;
let piano;
let lead;
let strings;
let songSeq;

return (t, sr)=>{
	if (!t) {
		i = 0;
		master = new Clock(8.8);
		a=undefined;
		beatCnt = 0;
		piano = new PolyphonicInstrument(Piano,NUM_VOICES);
		lead = new PolyphonicInstrument(Piano, 4);
		strings = new PolyphonicInstrument(OrchStacc, 5);
		songSeq = 0;
	}
	let beat = master.tick(t);
	if (beat) {
		let notes = chords[beatCnt>>3];
		let melNote = mel[beatCnt>>1];
		if (notes && beatCnt%8 == 0) {
			piano.all(Piano.prototype.pressPedal);
			if (notes instanceof Array)
				notes.forEach(n=>piano.play(n));
			else
				piano.play(notes);
		}
		else if (beatCnt%16 == 15)
			piano.all(Piano.prototype.releasePedal);
		if (melNote && beatCnt%2 == 0) {
			lead.all(Piano.prototype.pressPedal);
			if (melNote instanceof Array)
				melNote.forEach(n=>lead.play(n));
			else
				lead.play(melNote);
		}
		if (++beatCnt%128 == 0) ++songSeq;
	}
   let clean = piano.render();
	let out = .15*lpf1.render(clean)+lead.render();
	return out;
}