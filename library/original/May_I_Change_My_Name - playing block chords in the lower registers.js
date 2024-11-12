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
		this.w = weight;
		this.d = decay;
		this.t = 0;
		for (let j=0; j<smooth; ++j)
			for (let i=0; i<this.arr.length; ++i)
				this.arr[i] = this.arr[i]*.2+this.arr[mod(i-1,this.arr.length)]*.8;
	};
	render(off=0) {
		this.arr[this.t%this.arr.length]=(this.arr[this.t%this.arr.length]*this.w+this.arr[((this.t||1)-1)%this.arr.length]*(1-this.w))*(1-this.d)+this.d/2;
		return (this.arr[mod(this.t++ +round(off),this.arr.length)]*2-1)*(1-.9**this.t);
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

let a;
let P5 = 3/2;
let P4 = 4/3;

let master = new Clock(8.4);
let lpf1 = new Lowpass(32,14);
let wide = new Delay(480);

let beatCnt = 0;
let seq = [
	[27,39,55,58,63],[55,58,63],[31,43,55,58,63],[55,58,63],
	[32,44,56,58,63],[56,58,63],[56,58,63],[34,46,56,60,63],
	[27,39,55,58,63],[55,58,63],[31,43,55,58,63],[55,58,63],
	[32,44,56,58,63],[56,58,63],[56,58,63],[34,46,56,60,63],
	[36,48,55,58,63],[55,58,63],[38,50,53,58,62],[53,58,62],
	[39,51,55,58,63],[55,58,63],[41,53,56,60,63],[56,60,63],
	[34,46,53,58,63,80,92],[53,58,63,79,91],[53,58,63,77,89],[53,58,63,75,87],
	[22,34,53,58,63,80,92],[53,58,63,79,91],[53,58,63,77,89],[34,46,53,56,58,63,75,87],
	[27,39,55,58,63]
];

const NUM_VOICES = 32;
let piano;

return (t, sr)=>{
	if (!t) {
		i = 0;
		master = new Clock(8.8);
		a=undefined;
		beatCnt = 0;
		piano = new PolyphonicInstrument(Piano,NUM_VOICES);
	}
	let beat = master.tick(t);
	if (beat) {
		let notes = seq[beatCnt++>>3];
		if (notes && beatCnt%8 == 1) {
			piano.all(Piano.prototype.pressPedal);
			if (notes instanceof Array)
				for (note of notes)
					piano.play(note);
			else
				piano.play(notes);
		}
		else if (beatCnt%16 == 0)
			piano.all(Piano.prototype.releasePedal);
	}
   let clean = piano.render();
	let out = atan(.2*lpf1.render(clean));
	return out;
}