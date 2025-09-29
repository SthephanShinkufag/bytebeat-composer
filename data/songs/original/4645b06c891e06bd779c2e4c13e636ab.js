const FORMULA = "8/3D11/2";

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
		this.avg = 0;
		this.t = 0;
		for (let j=0; j<smooth; ++j)
			for (let i=0; i<this.arr.length; ++i)
				this.arr[i] = this.arr[i]*.2+this.arr[mod(i-1,this.arr.length)]*.8;
		for (let i=0; i<this.arr.length; ++i)
			this.avg += (this.arr[i]*2-1)/this.arr.length;
	};
	render(off=0) {
		let newVal = (this.arr[this.t%this.arr.length]*this.w+this.arr[mod(this.t-1,this.arr.length)]*(1-this.w))*(1-this.d)+this.d/2;
		this.avg += (newVal-this.arr[this.t%this.arr.length])*2/this.arr.length;
		this.arr[this.t%this.arr.length]=newVal;
		let idx = mod(this.t++ +off+this.t/this.arr.length*this.pc,this.arr.length);
		let xfade = idx-floor(idx);
		return (this.arr[floor(idx)]*2*(1-xfade)+this.arr[ceil(idx)%this.arr.length]*2*xfade-1)-this.avg;
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
let seq = Array.from({length: 32}, _=>new Array());

const NUM_VOICES = 32;
let piano;

let ticksToNextNote;
let PRIMARY_DELAY;
let SECONDARY_DELAY;
let MULT;
let note;
let useSecondaryDelay;

return (t, sr)=>{
	if (!t) {
		i = 0;
		a=undefined;
		beatCnt = 0;
		piano = new PolyphonicInstrument(Piano,NUM_VOICES);
		ticksToNextNote = 0;
		useSecondaryDelay = false;
		let formula = /^(\d+)(?:\/(\d+))?([A-Ga-g])(\d+)(?:\/(\d+))?$/.exec(FORMULA);
		let pdNum, pdDenom = 1, sdNum, sdDenom = 1;
		if (!formula)
			throw "Syntax error in formula.";
		if (isNaN(pdNum = parseInt(formula[1])))
			throw "Syntax error in formula (could not get PRIMARY_DELAY)";
		if (formula[2] && isNaN(pdNum = parseInt(formula[2])))
			throw "Syntax error in formula (could not get PRIMARY_DELAY)";
		note = 36+[0,2,4,5,7,9,11][(parseInt(formula[3],17) - 5)%7];
		if (isNaN(sdNum = parseInt(formula[4])))
			throw "Syntax error in formula (could not get SECONDARY_DELAY)";
		if (formula[5] && isNaN(sdDenom = parseInt(formula[5])))
			throw "Syntax error in formula (could not get SECONDARY_DELAY)";
		let gcd = (a,b)=>!b?a:gcd(b,a%b);
		MULT = pdDenom * sdDenom / gcd(pdDenom,sdDenom);
		master = new Clock(2.2 * MULT);
		seq = Array.from({length: 16 * MULT}, _=>new Array());
		PRIMARY_DELAY = pdNum * sdDenom / gcd(pdDenom, sdDenom);
		SECONDARY_DELAY = sdNum * pdDenom / gcd(pdDenom, sdDenom);
	}
	let beat = master.tick(t);
	if (beat) {
		let notes = seq[beatCnt++%(16*MULT)];
		if (ticksToNextNote == 0) {
			if (notes.length)
				useSecondaryDelay = !useSecondaryDelay;
			notes.push(note++);
			note += int("01010010101"[note%12]);
			ticksToNextNote = useSecondaryDelay ? SECONDARY_DELAY : PRIMARY_DELAY;
		}
		if (notes) {
			piano.all(Piano.prototype.pressPedal);
			if (notes instanceof Array)
				notes.forEach(n=>piano.play(n));
			else
				piano.play(notes);
		}
		if (beatCnt%(8*MULT) == 0)
			piano.all(Piano.prototype.releasePedal);
		--ticksToNextNote;
	}
	if (note > 108)	// Stop generating at the end of a typical piano
		ticksToNextNote = 2;
   let clean = piano.render();
	let out = .15*lpf1.render(clean);
	return out;
}