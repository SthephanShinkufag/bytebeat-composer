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
		if (this.t<500) {
			++this.t;
			return sin(this.t/500*PI)/8;
		}
		this.arr[this.t%this.arr.length]=(this.arr[this.t%this.arr.length]*this.w+this.arr[((this.t||1)-1)%this.arr.length]*(1-this.w))*(1-this.d)+this.d/2;
		let offFrac = off - floor(off);
		let samp1 = this.arr[mod(this.t++ +floor(off),this.arr.length)]*2-1;
		return samp1*(1-offFrac)+(this.arr[mod(this.t+floor(off),this.arr.length)]*2-1)*offFrac;
	};
};

class Lowpass {
	constructor(samples, cutoff=samples/5) {
		this.arr = Array(samples).fill(0);
		this.kern = Array(samples).fill(0).map((e,i)=>{let x=i/(samples-1)*2-1; return (x?sin(PI*cutoff*x)/(PI*cutoff*x):1)*(1+cos(PI*x))/2;});
		this.i = 0;
	};
	render(samp) {
		this.arr[this.i++%this.arr.length] = samp;
		return this.arr.reduce((s,v,i)=>s+v*this.kern[mod(i-this.i,this.kern.length)]/this.arr.length,0)*10;
	};
};

class Highpass {
	constructor(samples, cutoff=samples/2) {
		this.arr = Array(samples).fill(0);
		this.kern = Array(samples).fill(0).map((e,i)=>{let x=i/(samples-1)*2-1; return (x?sin(PI*cutoff*x)/(PI*cutoff*x):1)*(1+cos(PI*x))/2*(-1)**i});
		this.i = 0;
	};
	render(samp) {
		this.arr[this.i++%this.arr.length] = samp;
		return this.arr.reduce((s,v,i)=>s+v*this.kern[mod(i-this.i,this.kern.length)]/this.arr.length,0)*10;
	};
};

let a, b, c;

let i = 0;
let seq = [
	[40,,],,[,,52],,[,,55],,[,,52],,
	[,50,0],,[,0,52],,[43,,],,[40,,],,
   ,,[,,52],,[44,,],,[,,52],,[43,,]
   ,,[,,50],,[42,,],,[40,,0],,
];
let bta = 0, btb = 0, btc = 0;

let master = new Clock(8.4);
let lpf1 = new Lowpass(40,1);
let lpf2 = new Lowpass(40,3);
let hpf1 = new Highpass(26,11);
let hpf2 = new Highpass(40);
let amp = s=>tanh(2**(clamp(-2,2)(s)+.5)-1.8)-.05

return (t, sr)=>{
	if (!t) {
		i = 0;
		master = new Clock(8.4);
		a=b=c=undefined;
	}
	let beat = master.tick(t);
	if (beat) {
		if ((i||!t)&&seq[i]) {
			if (seq[i][0]!=undefined)
				if (seq[i][0])
					a = new String(263*2**((seq[i][0]-60)/12),.6,2,.002);
				else {
					a.d=.04
					a.weight=.2;
				};
			if (seq[i][1]!=undefined)
				if (seq[i][1])
					b = new String(263*2**((seq[i][1]-60)/12),.67,2,.003);
				else {
					b.d=.04
					b.weight=.2;
				};
			if (seq[i][2]!=undefined)
				if (seq[i][2])
					c = new String(263*2**((seq[i][2]-60)/12),.7,1,.003);
				else {
					c.d=.04
					c.weight=.2;
				};
		}
		++i
		i%=seq.length;
	}
	if (5<=i&&i<7)
		++btc;
	else btc = 0;
	if (9<=i&&i<11)
		++btb;
	else btb = 0;
	if (13<=i&&i<15 || 29<=i&&i<31)
		++bta;
	else bta = 0;
   let clean = (a?a.render((bta/1.35E3-2)**3):0)+(b?b.render((btb/1.35E3-2)**3):0)+(c?c.render((btc/1.35E3-2)**3):0);
	let lp = lpf1.render(clean)/2;
	let bp = hpf1.render(lpf2.render(clean));
	let filt = lp+bp*20;
	//return clean*2;
	//return filt;
	return amp(filt*6)*.9;
}