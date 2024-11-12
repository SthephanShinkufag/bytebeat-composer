let mod=(n,d)=>n%d>=0?n%d:n%d+d;
let clamp=(mn,mx)=>q=>max(min(q,mx),mn);
let sinf=t=>sin(t*PI/128);
let SS=(t,f)=>(f=2**(f/12),t*f%254.4+(t+128)*f%255.6+t*f%257+t*f%256.3)/512-1;
let BS=(t,f)=>(t*f%256/128-1)+(t*f%256>192)-(t*f%256<64);

class Clock {
	constructor(freq) {
		this.f = freq;
		this.b = 8;
	};
	tick(t) {
		if (floor(this.f*t)!=floor(this.f*this.t??-1)) {
			this.t = t;
			return this.b++;
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
		if (this.t < 5000*this.w - 3500) {
			++this.t;
			return 0;
		}
		this.arr[this.t%this.arr.length]=(this.arr[this.t%this.arr.length]*this.w+this.arr[((this.t||1)-1)%this.arr.length]*(1-this.w))*(1-this.d)+this.d/2;
		let offFrac = off - floor(off);
		let samp1 = this.arr[mod(this.t++ +floor(off),this.arr.length)]*2-1;
		return samp1*(1-offFrac)+(this.arr[mod(this.t+floor(off),this.arr.length)]*2-1)*offFrac;
	};
};

class Kick {
	constructor() {
		this.n = 0;
		this.env = 1;
	}
	render() {
		let n = this.n++;
		this.env = .9994**n;
		return tanh(sinf(4E4/sqrt(n))*this.env/2+tanh(sinf(1.4E4*.99997**n)*(.9995**n)*5));
	}
};

class Snare {
	constructor() {
		this.n = 0;
	}
	render() {
		let n = this.n++;
		return (sinf(n*.8)*sinf(n*1.9)*.9988**n+(random()-.5)/2*.9997**n);
	}
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

class Echo {
	constructor(samples, feedback) {
		this.arr = Array(samples).fill(0);
		this.i = 0;
		this.fb = feedback;
	};
	render(samp) {
		this.arr[this.i%this.arr.length] = samp+this.fb*this.arr[(this.i+1)%this.arr.length];
		return this.arr[this.i++%this.arr.length];
	};
};

class PingPongEcho {
	constructor(samples, feedback) {
		this.echoL = new Echo(samples, feedback);
		this.echoR = new Echo(samples, feedback);
		this.preDly = new Delay(samples>>1);
		this.fb = feedback;
	};
	render(samp) {
		return [this.echoL.render(samp),samp+this.echoR.render(this.preDly.render(samp))*this.fb];
	};
};

let a, b, c, d, e, k, s;

let chordTrack = [[49,56,60,65,68],[49,56,60,63,68],[49,58,61,66,68],[49,56,60,63,68]];

let i = 0;
let lastBeat = 0;

let master = new Clock(8.4);
let lpf1 = new Lowpass(40,1);
let lpf2 = new Lowpass(40,3);
let lpf3 = new Lowpass(32,1);
let hpf1 = new Highpass(26,11);
let amp = s=>tanh(2**(clamp(-2,2)(s)+.8)-1.8)-.05;

let ppEch = new PingPongEcho(21818,.5);
let ppEchIntro = new PingPongEcho(21818,.2);
let wide = new Delay(480);

let tB = 0;
let tFract = 0;
let xpos = 1;
let doXpos = false;
return (t, sr)=>{
	if (!t) {
		i = 0;
		master = new Clock(8.8);
		a=b=c=d=e=k=s=undefined;
		lastBeat = 0;
		ppEch = new PingPongEcho(21818,.5);
		chordTrack = [[49,56,60,65,68],[49,56,60,63,68],[49,58,61,66,68],[49,56,60,63,68]];
		xpos = 1;
		doXpos = false;
	}
	let beat = master.tick(t);
	let ch = chordTrack[max(beat,lastBeat)-8>>4&3];
	let seq = [ch,,,ch,[0,0,0,0,0],,ch,,ch,,,ch,[0,0,0,0,0],,ch,,];
	let bassSeq = [2,1,1,1,4,,2,tB<9300?4:NaN,tB<15000?4:NaN,4,,4,2,,4,tB<9300?2:NaN];
	let bass = (BS(t*sr*xpos,2**(-5/12)*1.002*bassSeq[i]/4)+BS(t*sr*xpos,2**(-5/12)*.998*bassSeq[i]/4))/4;
	if (beat) {
		if (beat == 262) {
			chordTrack = [[49,54,61,65,70],[49,54,61,65,70],[49,56,60,65,68],[49,56,60,65,68]];
			doXpos = true;
		}
		else if (beat == 326)
			chordTrack = [[49,54,61,65,70],[49,54,61,65,70],[49,56,60,65,68],[49,56,59,65,68]];
		else if (beat == 390)
			chordTrack = [[49,54,61,65,70],[51,54,60,63,68],[49,56,60,65,68],[53,56,61,65,70]];
		else if (beat == 454)
			chordTrack = [[49,54,61,65,70],[51,54,60,63,68],[49,56,60,65,68],[49,56,60,65,68]];
		else if (beat == 518)
			chordTrack = [[49,54,61,65,70],[51,54,60,63,68],[49,56,60,65,68],[53,56,61,65,70]];
		else if (beat == 582)
			chordTrack = [[49,54,61,65,70],[51,54,60,63,68],[49,56,60,65,68],[49,56,60,65,68]];
		else if (beat == 646) {
			chordTrack = [[49,56,60,65,68],[49,56,60,63,68],[49,58,61,66,68],[49,56,60,63,68]];
			doXpos = false;
		}
		if (seq[i]) {
			if (seq[i][0]!=undefined)
				if (seq[i][0])
					a = new String(263*2**((seq[i][0]-60)/12),.7,2,.002);
				else {
					a.d=.04
					a.weight=.2;
				};
			if (seq[i][1]!=undefined)
				if (seq[i][1])
					b = new String(263*2**((seq[i][1]-60)/12),.75,2,.003);
				else {
					b.d=.04
					b.weight=.2;
				};
			if (seq[i][2]!=undefined)
				if (seq[i][2])
					c = new String(263*2**((seq[i][2]-60)/12),.8,1,.003);
				else {
					c.d=.04
					c.weight=.2;
				};
			if (seq[i][3]!=undefined)
				if (seq[i][3])
					d = new String(263*2**((seq[i][3]-60)/12),.85,1,.003);
				else {
					d.d=.04
					d.weight=.2;
				};
			if (seq[i][4]!=undefined)
				if (seq[i][4])
					e = new String(263*2**((seq[i][4]-60)/12),.9,1,.003);
				else {
					e.d=.04
					e.weight=.2;
				};
		}
		if (beat%4 == 0) {
			tFract = 0;
			if (beat > seq.length*8) {
				k = new Kick();
				if (beat % 16 == 4)
					s = new Snare();
			}
			if (doXpos && beat % 16 == 8) {
				if (beat < 390)
					xpos = (beat-8)&32 ? 1 : 2**(5/12);
				else
					xpos = 2**([5,-5,0,-3,5,-5,0,0][beat-8>>4&7]/12);
			}
			else if (!doXpos)
				xpos = 1;
		}
		++i
		i%=seq.length;
		lastBeat = beat;
	}
	if (i%4 == 1) {
		tB *= .997;
	}
	let clean = (a?a.render():0)+(b?b.render():0)+(c?c.render():0)+(d?d.render():0)+(e?e.render():0);
	let lp = lpf1.render(clean)/2;
	let bp = hpf1.render(lpf2.render(clean));
	let filt = lp+bp*20;
	let kickduck = (k?1-k.env:1)**3;
	let guitar = lastBeat>seq.length*8+7?ppEch.render(amp(filt/3+clean/2)):ppEchIntro.render(amp(filt/3+clean/2));
	let chords = lpf3.render(ch.reduce((a,v)=>a+SS(t*sr,v-54),0)/16)*(1-.9994**(tB++))**3;
	let fract = lastBeat>seq.length*8+7?(t*sr*xpos*3/4&tFract++*.77>>6&t*sr*xpos*9/8)%256/128-.2:0;
	bass = isNaN(bass)||lastBeat<seq.length*8+8?0:bass*kickduck;
	let mix = tanh(((k?k.render():0)+(s?s.render():0)+chords*1.3+fract-bass)*.8);
	let fade = .99999**max(0,t*sr-42E5);
	let out = [(mix+guitar[0]*kickduck)*.8*fade,(wide.render(mix)+guitar[1]*kickduck)*.8*fade];
	return out;
}