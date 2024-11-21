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
		this.p = pitch;
		this.w = weight;
		this.d = decay;
		this.t = 0;
		for (let j=0; j<smooth; ++j)
			for (let i=0; i<this.arr.length; ++i)
				this.arr[i] = this.arr[i]*.2+this.arr[mod(i-1,this.arr.length)]*.8;
	};
	render(off=0) {
		this.arr[this.t%this.arr.length]=(this.arr[this.t%this.arr.length]*this.w+this.arr[((this.t||1)-1)%this.arr.length]*(1-this.w))*(1-this.d)+this.d/2;
		return ((this.arr[mod(this.t++ +round(off),this.arr.length)]*2-1))*(1-.9**this.t);
	};
};

class Piano {
	static pedal = true;
	static calcWeight = pitch=>min((Piano.pedal?.75:.2)+pitch/400,.99);
	static calcSmoothing = pitch=>(pitch<60?pitch/10+8:24-pitch/6)/2;
	static calcDecay = pitch=>1-.992**(18/pitch)+(Piano.pedal?0:.05);
	constructor(pitch) {
		this.p = pitch;
		this.a = new String(
			263*2**((pitch-60)/12),
			Piano.calcWeight(pitch),
			Piano.calcSmoothing(pitch),
			Piano.calcDecay(pitch)
		);
		this.b = new String(
			263*2**((pitch-60)/12)*.9985**(24/pitch),
			Piano.calcWeight(pitch),
			Piano.calcSmoothing(pitch),
			Piano.calcDecay(pitch)
		);
		this.c = new String(
			263*2**((pitch-60)/12)*1.002**(24/pitch),
			Piano.calcWeight(pitch),
			Piano.calcSmoothing(pitch),
			Piano.calcDecay(pitch)
		);
	};
	render() {
		return this.a.render()+this.b.render()+(this.p>36?this.c.render():0);
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

let master;
let lpf1 = new Lowpass(32,16);
let R = Array;

let beatCnt = 0;
let seq = [
	64,...R(11),64,...R(8),64,,,64,...R(11),65,...R(11),64,...R(11),60,...R(11),64,...R(23),
	[48,55,60,64],...R(11),[48,55,60,64],...R(8),[48,55,60,64],,,[48,55,60,64],...R(11),[41,57,60,65],...R(11),
	[36,55,60,64],...R(11),[41,57,60],...R(11),[36,55,60,64],...R(11),[35,56,62],...R(11),

	[33,101],96,100,93,99,96,[57,60,64,98],93,97,93,96,[57,60,64,88],
	[57,60,64,95],88,94,84,93,88,[57,60,65,92],84,91,84,90,81,
	[57,60,64,89],84,88,81,87,84,[52,57,60,86],81,85,81,84,76,
	[57,60,64,83],76,82,72,81,76,80,72,79,72,78,69,
	[33,77],72,76,69,75,72,[45,52,74],69,73,69,72,[45,52,64],
	[45,52,71],64,70,60,69,64,[45,53,68],60,67,60,66,57,
	[45,52,65],60,64,57,63,60,[33,62],57,61,57,60,52,
	[40,59],52,58,48,57,52,56,48,57,52,60,53,
	[32,64],59,62,65,76,71,[53,62,74],77,88,83,86,[53,62,77],
	[53,60,86],81,84,77,74,69,[33,45,72],65,62,57,60,53,
	[32,44,64],59,62,65,76,71,[55,62,74],77,[53,62,88],83,[52,62,86],76,
	[52,60,86],81,84,76,74,69,[33,45,72],64,62,57,60,59,
	[35,47,69],64,68,71,81,76,[56,59,64,80],83,[68,93],88,[73,92],83,[59,63,69,71,92],87,90,83,80,75,[47,59,78],71,68,63,66,59,
	[40,52,69],64,68,71,81,76,[59,68,80],83,[58,67,93],88,[59,68,92],83,[52,56,64,100]
];

const NUM_VOICES = 32;
let piano;
let wide;

return (t, sr)=>{
	if (!t) {
		i = 0;
		master = new Clock(44);
		beatCnt = 0;
		piano = new PolyphonicInstrument(Piano,NUM_VOICES);
		wide = new Delay(480);
	}
	let beat = master.tick(t);
	if (beat) {
		let notes = seq[beatCnt++>>2];
		if (notes && beatCnt%4 == 1) {
			piano.all(Piano.prototype.pressPedal);
			if (notes instanceof Array)
				for (note of notes)
					piano.play(note);
			else
				piano.play(notes);
		}
		else if (beatCnt >= 12*16*4 && beatCnt%24 == 0)
			piano.all(Piano.prototype.releasePedal);
		else if (beatCnt%48 == 0)
			piano.all(Piano.prototype.releasePedal);
	}
   let clean = piano.render();
	let out = atan(clean)/PI*2;
	return out;
}