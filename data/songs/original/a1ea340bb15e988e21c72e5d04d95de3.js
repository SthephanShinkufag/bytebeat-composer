t || (_ => {

///
///  definitions
///

const BPM = 120;
const TPB = 4;   // ticks per beat

SR = 48e3;
TL = () => SR*60/BPM/TPB;

basefreq = 432;
EDO = 31;

///
///  utility functions (various math and array operations)
///

fmod = (a, b) => ((a % b) + b) % b; // fixed mod function because (-1 % 5) == -1 instead of 4
lerp = (a, b, x) => x*b + (1 - x)*a;

aadd = (arr1, arr2) => arr1.map((_, i) => arr1[i] + arr2[i]);
aadd1 = (arr, x) => arr.map(a => a + x);
asub = (arr1, arr2) => arr1.map((_, i) => arr1[i] - arr2[i]);
amul1 = (arr, x) => arr.map(a => a * x);
amix = (arr1, arr2, mix) => arr1.map((_, i) => lerp(arr1[i], arr2[i], mix));

stadd1 = (inp, x) => [inp[0] + x, inp[1] + x];
stadd = (in1, in2) => [in1[0] + in2[0], in1[1] + in2[1]];
stmix = (in1, in2, mix) => [lerp(in1[0], in2[0], mix), lerp(in1[1], in2[1], mix)];

amix1 = (x, arr, mix) => arr.map(a => lerp(x, a, mix));

avg = arr => arr.reduce((a, b) => a + b)/arr.length;


///
///  channel mixing matrix functions (householder and hadamard)
///


hsmix = function (inp) {
	let mult = -2/inp.length;
	let sum = 0;

	for (let i = 0; i < inp.length; i++) {
		sum += inp[i];
	}

	sum *= mult;

	for (let i = 0; i < inp.length; i++) {
		inp[i] += sum;
	}
};

hdmix = function(inp, chns) {
	hdrec(inp, chns, 0);

	let k = sqrt(1/chns);

	for (let i = 0; i < chns; i++) {
		inp[i] *= k;
	}
};

hdrec = function(inp, size, off) {
	if (size <= 1) return;
	let hs = size/2;

	hdrec(inp, hs, off);
	hdrec(inp, hs, off + hs);

	for (let i = 0; i < hs; i++) {
		let x = inp[i + off];
		let y = inp[i + off + hs];
		inp[i + off] = x + y;
		inp[i + off + hs] = x - y;
	}
};


///
///  basic waves (+ frequency computation)
///


let notefreq = n => pow(2, n/EDO);

let sine = (x, mod = 0) => sin(2*PI*x + mod);
let tri = (x, mod = 0) => asin(sine(x, mod))/(PI/2);
let sqr = (x, mod = 0) => 1 - 2*floor(fmod(2*(x + mod), 2));
let saw = (x, mod = 0) => fmod(2*(x + mod) + 1, 2) - 1;
let rsqr = (x, mod = 0) => sine(x, 0.5*(sine(2*x, mod) + mod));

// waves which require an additional phase shift of -0.25 to make proper bipolar versions
let spwaves = [sqr, saw, rsqr].map(f => f.name);

let sawtf = (x, tf) => {
	let _base = (x, k) => (k == 0 ? sin(x) : ((x == PI && k == 1) ? PI/2 : atan(k*sin(x)/(1 + k*cos(x)))/k));
	let base = (x, k) => _base(2*PI*x, k)/_base(acos(-k), k);

	return base(x, sqrt((1 - cos(PI*tf))/2));
};


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  envelope functions
///


let env_adsr = (att, dec, sus, rel) => ({
	func: function() {
		if (!this.active) return 0;

		let out = this.val;

		let maxVal = (this.decay == 0) ? this.sustain : 1;

		if (!this.held && this.stage != 3) {
			this.stage = 3;
		}

		if (this.stage == 0) {
			if (this.attack == 0) {
				this.val = maxVal;
				this.stage = 1 + (this.decay == 0);
			}

			this.val = min(this.val + 1/SR/this.attack, maxVal);

			if (this.val == maxVal) {
				this.stage = 1 + (this.decay == 0);
			}
		} else if (this.stage == 1) {
			if (this.decay == 0) {
				this.val = this.sustain;
				this.stage = 2 + (this.sustain == 0);
			}

			this.val = max(this.val - 1/SR/this.decay, this.sustain);

			if (this.val == this.sustain) {
				this.stage = 2 + (this.sustain == 0);
			}
		} else if (this.stage == 3) {
			if (this.release == 0) {
				this.val = 0;
				this.active = false;
			}

			this.val = max(this.val - 1/SR/this.release, 0);

			if (this.val == 0) {
				this.active = false;
			}
		}

		return out;
	},

	val: 0,
	stage: 0,
	held: true,
	active: true,
	attack: att,
	decay: dec,
	sustain: sus,
	release: rel,
});


let env_const = () => ({
	func: function() {
		return 1;
	},

	held: true,
	active: true,
});


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  modulators
///


let mod_wav = (wave, freq, amt, target, bi = false, invert = false) => ({
	func: function() {
		var out;

		if (!this.bi) {
			if (this.wave.name in spwaves) {
				out = this.wave(this.phase - 0.5);
			} else {
				out = this.wave(this.phase - 0.25);
			}

			out = (out + 1)/2*this.amt;

			if (this.invert) {
				out = 1 - out;
			}
		} else {
			out = this.wave(this.phase)*this.amt;
		}

		this.phase = (this.phase + this.freq/SR) % 1;

		return out;
	},

	wave: wave,
	freq: freq,
	amt: amt,
	bi: bi,
	invert: invert,
	phase: 0,

	target: target,
});


let mod_rnd = (freq, amt, target, bi = false) => ({
	func: function() {
		if (this.phase >= 1) {
			this.phase -= 1;

			var newval = random();

			if (this.bi) {
				newval = 2*newval - 1;
			}

			this.vals = [this.vals[1], newval];
		}

		let coef = 3*this.phase**2 - 2*this.phase**3;
		let out = (this.vals[0]*(1 - coef) + this.vals[1]*coef)*this.amt;

		this.phase += this.freq/SR;

		return out;
	},

	freq: freq,
	amt: amt,
	bi: bi,
	phase: 1,
	vals: [0, 0],

	target: target,
});


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  synth functions and note events
///


let synth_wave = ({pitch, id, env, wave = sine, mods = [], mixsend = null}) => ({type: "noteon", event: {
	func: function() {
		var vals = {};

		for (let m of this.mods) {
			if (m.target == "freq") {
				vals[m.target] = this[m.target] * 2**m.func();
			} else {
				vals[m.target] = this[m.target] + m.func();
			}
		}

		for (let field of ["freq", "phase"]) {
			if (!vals.hasOwnProperty(field)) {
				vals[field] = this[field];
			}
		}

		let out = this.wave(vals.phase)*this.env[0].func();

		this.phase = (this.phase + basefreq*vals.freq/SR) % 1;

		return out;
	},

	freq: notefreq(pitch, basefreq),
	phase: 0,

	env: env,

	wave: wave,

	mods: mods,

	mixsend: mixsend,
	id: id,
}});


let synth_wavetf = ({pitch, id, env, wave = sawtf, tflevel = 1, mods = [], mixsend = null}) => ({type: "noteon", event: {
	func: function() {
		var vals = {};

		for (let m of this.mods) {
			if (m.target == "freq") {
				vals[m.target] = this[m.target] * 2**m.func();
			} else {
				vals[m.target] = this[m.target] + m.func();
			}
		}

		for (let field of ["freq", "phase", "tflevel"]) {
			if (!vals.hasOwnProperty(field)) {
				vals[field] = this[field];
			}
		}

		let out = this.wave(vals.phase, vals.tflevel*this.env[1].func())*this.env[0].func();

		this.phase = (this.phase + basefreq*vals.freq/SR) % 1;

		return out;
	},

	freq: notefreq(pitch, basefreq),
	phase: 0,

	env: env,

	wave: wave,

	tflevel: tflevel,

	mods: mods,

	mixsend: mixsend,
	id: id,
}});


let synth_2op = ({
	pitch, id,
	env,
	carrwave = sine, modwave = sine,
	modlevel = 1, modmult = 1,
	mods = [],
	mixsend = null
}) => ({type: "noteon", event: {
	func: function() {
		var vals = {};

		for (let m of this.mods) {
			if (m.target in ["freq", "modmult"]) {
				vals[m.target] = this[m.target] * 2**m.func();
			} else {
				vals[m.target] = this[m.target] + m.func();
			}
		}

		for (let field of ["freq", "phase_c", "phase_m", "modlevel", "modmult"]) {
			if (!vals.hasOwnProperty(field)) {
				vals[field] = this[field];
			}
		}

		let modout = vals.modlevel*this.modwave(vals.phase_m)*this.env[1].func();

		let out = this.carrwave(vals.phase_c, modout)*this.env[0].func();

		this.phase_c = (this.phase_c + basefreq*vals.freq/SR) % 1;
		this.phase_m = (this.phase_m + vals.modmult*basefreq*vals.freq/SR) % 1;

		return out;
	},

	freq: notefreq(pitch, basefreq),
	phase_c: 0,
	phase_m: 0,

	env: env,

	carrwave: carrwave,
	modwave: modwave,

	modlevel: modlevel,

	modmult: modmult,

	mods: mods,

	mixsend: mixsend,
	id: id,
}});


let synth_4op = ({
	pitch, id,
	env,
	carrwave = sine, mod1wave = sine, mod2wave = sine, mod3wave = sine,
	mod1level = 1, mod2level = 1, mod3level = 1,
	mod1mult = 1, mod2mult = 1, mod3mult = 1,
	mods = [],
	mixsend = null
}) => ({type: "noteon", event: {
	func: function() {
		var vals = {};

		for (let m of this.mods) {
			if (m.target in ["freq", "mod1mult", "mod2mult", "mod3mult"]) {
				vals[m.target] = this[m.target] * 2**m.func();
			} else {
				vals[m.target] = this[m.target] + m.func();
			}
		}

		for (let field of [
			"freq", "phase_c", "phase_m1", "phase_m2", "phase_m3",
			"mod1level", "mod2level", "mod3level", "mod1mult", "mod2mult", "mod3mult"
		]) {
			if (!vals.hasOwnProperty(field)) {
				vals[field] = this[field];
			}
		}

		let mod3out = vals.mod3level*this.mod3wave(vals.phase_m3)*this.env[3].func();
		let mod2out = vals.mod2level*this.mod2wave(vals.phase_m2, mod3out)*this.env[2].func();
		let mod1out = vals.mod1level*this.mod1wave(vals.phase_m1, mod2out)*this.env[1].func();

		let output = this.carrwave(vals.phase_c, mod1out)*this.env[0].func();

		this.phase_c = (this.phase_c + basefreq*vals.freq/SR) % 1;
		this.phase_m1 = (this.phase_m1 + vals.mod1mult*basefreq*vals.freq/SR) % 1;
		this.phase_m2 = (this.phase_m2 + vals.mod2mult*basefreq*vals.freq/SR) % 1;
		this.phase_m3 = (this.phase_m3 + vals.mod3mult*basefreq*vals.freq/SR) % 1;

		return output;
	},

	freq: notefreq(pitch, basefreq),
	phase_c: 0,
	phase_m1: 0,
	phase_m2: 0,
	phase_m3: 0,

	env: env,

	carrwave: carrwave,
	mod1wave: mod1wave,
	mod2wave: mod2wave,
	mod3wave: mod3wave,

	mod1level: mod1level,
	mod2level: mod2level,
	mod3level: mod3level,

	mod1mult: mod1mult,
	mod2mult: mod2mult,
	mod3mult: mod3mult,

	mods: mods,

	mixsend: mixsend,
	id: id,
}});


let off = id => (() => ({type: "noteoff", event: {
	id: id,
}}));


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  audio effects functions
///


let mono = () => ({
	func: avg
});


let softclip = () => ({
	func: function(samp) {
		if (typeof samp == "number") {
			samp = [samp, samp];
		}

		return samp.map(tanh);
	},
});


let dcremove = (coef = 0.5) => ({
	func: function(samp) {
		if (typeof samp == "number") {
			samp = [samp, samp];
		}

		let out = aadd(amul1(samp, this.coef), amul1(this.last, 1 - this.coef));
		this.last = out;

		return asub(samp, out);
	},

	coef: min(max(coef, 0), 1)/100,
	last: [0, 0]
});


let gain = amt => ({
	func: function(samp) {
		if (typeof samp == "number") {
			samp = [samp, samp];
		}

		return amul1(samp, pow(2, this.amt/6));
	},

	amt: amt,
});


let filter = (cutoff = 10300, order = 1, lpf = true, mono = false) => ({
	func: function(samp) {
		let a = tan(PI*this.cutoff/SR);
		let a2 = a*a;

		if (typeof samp == "number") {
			samp = [samp, samp];
		}

		var out = samp.slice();

		for (let i = 0; i < this.order; i++) {
			let r = sin(PI*(2*i + 1)/(4*this.order));
			let s = a2 + 2*a*r + 1;

			let A = a2/s;
			let d1 = 2*(1 - a2)/s;
			let d2 = 4*a*r/s - 1;

			for (let c of [0, 1]) {
				this.buf[c][0][i] = d1*this.buf[c][1][i] + d2*this.buf[c][2][i] + out[c];
				
				out[c] = A*(this.buf[c][0][i] + 2*this.buf[c][1][i] + this.buf[c][2][i]);

    			this.buf[c][2][i] = this.buf[c][1][i];
    			this.buf[c][1][i] = this.buf[c][0][i];
			}
		}

		return (this.mono ? avg : (x => x)).apply(null, [this.lpf ? out : asub(samp, out)]);
	},

	buf: Array(2).fill(Array(3).fill(Array(order).fill(0))),

	cutoff: min(cutoff, 10300),
	order: order,
	lpf: lpf,

	mono: mono,
});


let delay = (time, fdbk, mix = 0.5, mod = 0, modfreq = 1) => ({
	func: function(samp) {
		let pos = this.idx + 50*this.mod*(1 - cos(this.modfreq*2*PI*this.idx/SR));

		if (typeof(samp) == "number") {
			samp = [samp, samp];
		}

		var dlyd = [];

		for (let i of [0, 1]) {
			let buf = this.buffer[i];

			dlyd[i] = lerp(buf[floor(pos) % buf.length], buf[(floor(pos) + 1) % buf.length], pos % 1);
		}

		var out = aadd(samp, amul1(dlyd, this.fdbk));

		for (let i of [0, 1]) {
			this.buffer[i][this.idx % this.buffer[i].length] = out[i];
		}

		this.idx++;

		return amix(samp, dlyd, this.mix);
	},

	buffer: Array(2).fill(Array(round(time/1e3*SR)).fill(0)),
	idx: 0,
	fdbk: fdbk,
	mix: mix,

	mod: mod,
	modfreq: modfreq,
});


let delayMult = (time, fdbk, mix = 0.5, mod = 0, modfreq = 1, chns = 8) => ({
	func: function(samp) {
		let dlyd = [];

		for (let i = 0; i < this.chns; i++) {
			let buf = this.buffers[i];
			let bufpos = this.idx + 50*this.mod*(1 - cos(this.modfreq*2*PI*this.idx/SR/pow(2, i/this.chns)));

			dlyd[i] = lerp(buf[floor(bufpos) % buf.length], buf[(floor(bufpos) + 1) % buf.length], bufpos % 1);
		}

		hsmix(dlyd);

		let _multiin = !(typeof samp == "number");
		let stereoin = _multiin && samp.length == 2;
		let multiin = _multiin && !stereoin;
		var origsamp = samp;

		if (!_multiin) {
			origsamp = [origsamp, origsamp];
		}

		if (!_multiin) {
			samp = Array(this.chns + 1).fill(samp);
		} else if (stereoin) {
			samp = Array(this.chns + 1).fill(avg(samp));
		}

		for (let i = 0; i < this.chns; i++) {
			this.buffers[i][this.idx % this.buffers[i].length] = samp[i] + dlyd[i]*this.fdbk;
		}

		this.idx++;

		var out;

		out = multiin ? amix1(samp[this.chns], amix(dlyd, samp, 0.5), this.mix) : amix(origsamp, dlyd, this.mix);

		return out.slice(0, 2);
	},

	buffers: Array(chns).fill().map((_, c) => Array(round(min(time/1e3*SR*pow(2, c/chns), 1e6))).fill(0)),
	idx: 0,
	fdbk: fdbk,
	mix: mix,

	mod: mod,
	modfreq: modfreq,

	chns: chns,
});


let diff = (maxdur, chns = 8) => ({
	func: function(samp) {
		let pos = this.buffers.map(buf => this.idx % buf.length);
		this.idx++;

		if (typeof(samp) == "number") {
			samp = Array(this.chns + 1).fill(samp);
		} else if (samp.length == 2) {
			samp = Array(this.chns + 1).fill(avg(samp));
		}

		let dlyd = [];

		for (let i = 0; i < this.chns; i++) {
			dlyd[i] = this.buffers[i][pos[i]];
			this.buffers[i][pos[i]] = samp[i];
		}

		hdmix(dlyd, this.chns);

		for (let i = 0; i < this.chns; i++) {
			if (this.flip[i]) {
				dlyd[i] *= 1;
			}
		}

		return dlyd.concat(samp[this.chns]);
	},

	buffers: Array(chns).fill().map((_, c) => Array(floor(maxdur/1e3*SR*c/chns + maxdur/1e3*SR/chns*random()) + 1).fill(0)),
	flip: Array(chns).fill(0).map(_ => random() >= 0.5),
	idx: 0,

	chns: chns,
});


let reverb = (time, fdbk, mix = 0.5, mod = 0, modfreq = 1, diffsteps = 4, difftime = 20) => {
	var res = [];

	for (let i = 0; i < diffsteps; i++) {
		res.push(diff(difftime));
		difftime *= 2;
	}

	res.push(delayMult(time, fdbk, mix, mod, modfreq));

	return res;
};


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  user-defined patches
///


let synth1 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(0.001, 0.750, 0, 0.000),
			env_adsr(0.000, 0.750, 0, 0.000),
			env_adsr(0.000, 0.750, 0, 0.000),
			env_const(),
		],

		mod1level: 0.5,
		mod2level: 1,
		mod3level: 0,

		mods: [
			mod_wav(sine, 2, 10/1200, "mod1mult", true),
			mod_wav(sine, 1.5, 0.5, "mod1level", true),
			mod_wav(sine, 1.5, -1, "mod2level", true),
		],

		mixsend: 1,
		id: "",
	})
);


let synth2 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(2.000, 2.000, 0, 0.000),
			env_const(),
			env_const(),
			env_const(),
		],

		mod1wave: rsqr,
		mod2wave: rsqr,

		mod1level: 1,
		mod2level: 0.5,
		mod3level: 0,

		mods: [
			mod_rnd(10, -1, "mod1level"),
			mod_rnd(5, -0.5, "mod2level"),
		],

		mixsend: 2,
		id: "",
	})
);


let synth3 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(1.000, 1.000, 0, 0.000),
			env_adsr(0.000, 2.000, 0, 0.000),
			env_const(),
			env_const(),
		],

		mod1level: 0,
		mod2level: 0,
		mod3level: 0,

		mod1mult: 2,

		mods: [
			mod_wav(sine, 1, 1, "mod1level"),
			mod_wav(sine, 1, 0.5, "mod2level"),
		],

		mixsend: 3,
		id: "",
	})
);


let synth4 = pitch => (() =>
	synth_2op({
		pitch: pitch - 93,

		env: [
			env_adsr(2.000, 0.005, 0, 0.000),
			env_adsr(2.000, 0.005, 0, 0.000),
		],

		modlevel: 0.5,

		mixsend: 4,
		id: "",
	})
);


let synth5 = pitch => (() =>
	synth_2op({
		pitch: pitch - 93,

		env: [
			env_adsr(0.000, 4.000, 0, 0.025),
			env_adsr(0.000, 4.000, 0, 0.025),
		],

		modlevel: 2,

		mixsend: 5,
		id: "bass",
	})
);


let synth6 = pitch => (() =>
	synth_4op({
		pitch: pitch - 31,

		env: [
			env_adsr(0.500, 2.000, 0, 0.000),
			env_adsr(0.250, 2.000, 0, 0.000),
			env_adsr(0.250, 2.000, 0, 0.000),
			env_const()
		],

		mod2level: 0.125,
		mod3level: 0,

		mod2mult: 4,

		mods: [ mod_wav(sine, 4, 5/1200, "freq") ],

		mixsend: 2,
		id: "",
	})
);


let synth7 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(0.250, 1.750, 0, 0.000),
			env_adsr(0.000, 2.000, 0, 0.000),
			env_const(),
			env_const(),
		],

		mod1level: 0,
		mod2level: 0,
		mod3level: 0,

		mod1mult: 2,

		mods: [
			mod_wav(sine, 1, 1, "mod1level"),
			mod_wav(sine, 1, 0.5, "mod2level"),
		],

		mixsend: 6,
		id: "",
	})
);


let synth8 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(0.001, 0.750, 0, 0.000),
			env_adsr(0.000, 0.750, 0, 0.000),
			env_adsr(0.000, 0.750, 0, 0.000),
			env_const(),
		],

		mod1level: 0.5,
		mod2level: 1,
		mod3level: 0,

		mods: [
			mod_wav(sine, 2, 0.5, "mod1level", true),
			mod_wav(sine, 2, -1, "mod2level", true),
		],

		mixsend: 7,
		id: "",
	})
);


let synth6_end = pitch => (() =>
	synth_4op({
		pitch: pitch - 31,

		env: [
			env_adsr(0.500, 30.000, 0, 2.000),
			env_adsr(0.250, 30.000, 0, 2.000),
			env_adsr(0.250, 30.000, 0, 2.000),
			env_const()
		],

		mod2level: 0.125,
		mod3level: 0,

		mod2mult: 4,

		mods: [ mod_wav(sine, 4, 5/1200, "freq") ],

		mixsend: 2,
		id: "end",
	})
);


let synth7_end = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(0.250, 29.750, 0, 2.000),
			env_adsr(0.000, 30.000, 0, 2.000),
			env_const(),
			env_const(),
		],

		mod1level: 1,
		mod2level: 0.5,
		mod3level: 0,

		mod1mult: 2,

		mixsend: 6,
		id: "end",
	})
);


let synth9 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(1.000, 4.000, 0, 0.000),
			env_adsr(2.000, 2.000, 0, 0.000),
			env_const(),
			env_const(),
		],

		mod1level: 1,
		mod2level: 0.5,
		mod3level: 0,

		mod1mult: 2,

		mixsend: 3,
		id: "",
	})
);


let synth5_end2 = pitch => (() =>
	synth_2op({
		pitch: pitch - 93,

		env: [
			env_adsr(0.000, 8.000, 0, 0.025),
			env_adsr(0.000, 8.000, 0, 0.025),
		],

		modlevel: 2,

		mixsend: 5,
		id: "bass",
	})
);


let synth3_end2 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(1.000, 10.000, 0, 0.000),
			env_adsr(0.000, 10.000, 0, 0.000),
			env_const(),
			env_const(),
		],

		mod1level: 1,
		mod2level: 0.5,
		mod3level: 0,

		mod1mult: 2,

		mixsend: 3,
		id: "end",
	})
);


let synth9_end2 = pitch => (() =>
	synth_4op({
		pitch: pitch,

		env: [
			env_adsr(1.000, 10.000, 0, 0.000),
			env_adsr(2.000, 8.000, 0, 0.000),
			env_const(),
			env_const(),
		],

		mod1level: 1,
		mod2level: 0.5,
		mod3level: 0,

		mod1mult: 2,

		mixsend: 3,
		id: "",
	})
);


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  mixer and sequencer
///


mixer = [
	{
		fx: [
			reverb(200, 0.8, 0.375, 1)
		]
	},

	{
		fx: [
			gain(-12),
			delay(500, 0.5, 0.25), dcremove(1),
			delayMult(1000, 0, 0.02, 1e4, 0.5),
			filter(6000, 2), dcremove(1),
		],

		send: 0,
	},

	{
		fx: [ gain(-21) ],
		send: 0,
	},

	{
		fx: [
			gain(-24),
			delayMult(4, 0, 1, 1, 2),
		],

		send: 0,
	},

	{
		fx: [ gain(-18) ]
	},

	{
		fx: [ gain(-12) ]
	},

	{
		fx: [ gain(3) ],
		send: 3,
	},

	{
		fx: [
			gain(-9),
			delay(500, 0.5, 0.25),
			delayMult(4, 0, 1, 1),
		],

		send: 0,
	},
];

masterfx = [  ];

notes = [];
realt = 0;
tick = 0;
seqptr = 0;
sum = [0, 0];

seq = [
	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(0)]],
		[6, [synth1(13)]],

		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8)]],
		[6, [synth1(5)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-23)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[6, [synth1(13)]],

		[16, []],
	],

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8)]],
		[2, [synth1(0)]],
		[6, [synth1(18)]],

		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[6, [synth1(5)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-23)]],
		[2, [synth1(13)]],
		[6, [synth1(-5)]],
	
		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8)]],
		[6, [synth1(-18)]],
	],

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8)]],
		[6, [synth1(13)]],

		[2, [synth1(-39)]],
		[2, [synth1(-18)]],
		[2, [synth1(0)]],
		[2, [synth1(-8)]],
		[2, [synth1(10)]],
		[6, [synth1(13)]],

		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(0)]],
		[2, [synth1(13)]],
		[6, [synth1(-8)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[6, [synth1(5)]],
	],

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8)]],
		[6, [synth1(18)]],

		[2, [synth1(-39)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[2, [synth1(0)]],
		[2, [synth1(13)]],
		[6, [synth1(10)]],

		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(0)]],
		[2, [synth1(-5)]],
		[2, [synth1(5)]],
		[6, [synth1(23)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[2, [synth1(5)]],
		[6, [synth1(13)]],

		[16, [synth2(-75), synth2(-57), synth2(-44)]],
	],

/*********/

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth3(26)]],
		[2, [synth1(-5), synth3(31)]],
		[2, [synth1(0), synth3(13)]],
		[6, [synth1(13)]],

		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18), synth3(-31)]],
		[2, [synth1(-13), synth3(-8)]],
		[2, [synth1(-8), synth3(5)]],
		[6, [synth1(5)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-23), synth3(-23)]],
		[2, [synth1(-18), synth3(-5)]],
		[2, [synth1(-5), synth3(13)]],
		[6, [synth1(13)]],

		[4, []],
		[2, [synth3(-36)]],
		[2, [synth3(-18)]],
		[8, [synth3(-8)]],
	],

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth3(44)]],
		[2, [synth1(-8), synth3(26)]],
		[2, [synth1(0), synth3(5)]],
		[6, [synth1(18)]],

		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-13), synth3(0)]],
		[2, [synth1(-18), synth3(18)]],
		[2, [synth1(-8), synth3(13)]],
		[6, [synth1(5)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18), synth3(8)]],
		[2, [synth1(-23), synth3(5)]],
		[2, [synth1(13), synth3(26)]],
		[6, [synth1(-5)]],
	
		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18), synth3(13)]],
		[2, [synth1(-5), synth3(0)]],
		[2, [synth1(-8), synth3(-13)]],
		[6, [synth1(-18)]],
	],

	[
		[2, [synth1(-44), synth6(-13), synth6(5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth3(49)]],
		[2, [synth1(-5), synth3(36)]],
		[2, [synth1(0), synth3(23)]],
		[6, [synth1(13)]],

		[2, [synth1(-49), synth6(-8), synth6(13)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18), synth3(44)]],
		[2, [synth1(-13), synth3(23)]],
		[2, [synth1(-8), synth3(0)]],
		[6, [synth1(5)]],

		[2, [synth1(-54), synth6(-5), synth6(13)]],
		[2, [synth1(-36)]],
		[2, [synth1(-23), synth3(8)]],
		[2, [synth1(-18), synth3(39)]],
		[2, [synth1(-5), synth3(18)]],
		[6, [synth1(13)]],

		[2, [synth1(-67), synth6(-18), synth6(5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18), synth3(13)]],
		[2, [synth1(-5), synth3(23)]],
		[2, [synth1(-8), synth3(31)]],
		[6, [synth1(0)]],
	],

	[
		[2, [synth1(-44), synth6(-26), synth6(-5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth3(13)]],
		[2, [synth1(-8), synth3(-5)]],
		[2, [synth1(0), synth3(0)]],
		[6, [synth1(18)]],

		[2, [synth1(-49), synth6(-18), synth6(0)]],
		[2, [synth1(-31)]],
		[2, [synth1(-13), synth3(18)]],
		[2, [synth1(-18), synth3(-8)]],
		[2, [synth1(-8)], synth3(0)],
		[6, [synth1(5)]],

		[2, [synth1(-54), synth6(-23), synth6(-5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18), synth3(13)]],
		[2, [synth1(-23), synth3(-5)]],
		[2, [synth1(13), synth3(-13)]],
		[6, [synth1(-5)]],
	
		[2, [synth1(-49), synth6(0), synth6(23)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18), synth3(23)]],
		[2, [synth1(-5), synth3(13)]],
		[2, [synth1(-8), synth3(0)]],
		[6, [synth1(-18)]],
	],

	[
		[2, [synth1(-44), synth6(-5), synth6(13)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth3(31)]],
		[2, [synth1(-5), synth3(18)]],
		[2, [synth1(-8), synth3(5)]],
		[6, [synth1(13)]],

		[2, [synth1(-39), synth6(-8), synth6(18)]],
		[2, [synth1(-18)]],
		[2, [synth1(0), synth3(36)]],
		[2, [synth1(-8), synth3(23)]],
		[2, [synth1(10), synth3(10)]],
		[6, [synth1(13)]],

		[2, [synth1(-36), synth6(-5), synth6(13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5), synth3(31)]],
		[2, [synth1(0), synth3(13)]],
		[2, [synth1(13), synth3(5)]],
		[6, [synth1(-8)]],

		[2, [synth1(-54), synth6(-13), synth6(5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-13), synth3(44)]],
		[2, [synth1(-18), synth3(26)]],
		[2, [synth1(-8), synth3(18)]],
		[6, [synth1(5)]],
	],

	[
		[2, [synth1(-44), synth6(-26), synth6(-5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth3(36)]],
		[2, [synth1(-5), synth3(18)]],
		[2, [synth1(-8), synth3(23)]],
		[6, [synth1(18)]],

		[2, [synth1(-39), synth6(-18), synth6(0)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8), synth3(31)]],
		[2, [synth1(0), synth3(18)]],
		[2, [synth1(13), synth3(13)]],
		[6, [synth1(10)]],

		[2, [synth1(-36), synth6(-5), synth6(5)]],
		[2, [synth1(-18)]],
		[2, [synth1(0), synth3(-5)]],
		[2, [synth1(-5), synth3(13)]],
		[2, [synth1(5), synth3(23)]],
		[6, [synth1(23)]],

		[2, [synth1(-54), synth6(-13), synth6(13)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18), synth3(26)]],
		[2, [synth1(-8), synth3(8)]],
		[2, [synth1(5), synth3(-5)]],
		[6, [synth1(13)]],
	],

	[
		[16, []],
		[16, [synth4(-23), synth4(8)]],
	],

/*********/

	[
		[1, [synth1(-44), synth5(-13), synth6(-13), synth6(5), synth7(13)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(-5)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[5, [synth1(-8)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-8), synth6(13), synth7(-8)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-31)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0), synth7(5)]],
		[1, [synth1(5)]],
		[1, [synth1(-8)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(-13), synth6(5), synth7(-5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8), synth7(18)]],
		[1, [synth1(-23)]],
		[1, [synth1(0)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-8), synth6(18), synth7(13)]],
		[1, [synth1(-31)]],
		[1, [synth1(-13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(0)]],
		[1, [synth1(5)]],
		[1, [synth1(18), synth7(0)]],
		[1, [synth1(13)]],
		[1, [synth1(-5)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(-5), synth6(13), synth7(5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(18)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[5, [synth1(-8)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-18), synth6(0), synth7(13)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-31)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0), synth7(23)]],
		[1, [synth1(5)]],
		[1, [synth1(-8)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(-13), synth6(5), synth7(26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8), synth7(13)]],
		[1, [synth1(-23)]],
		[1, [synth1(-5)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-8), synth6(13), synth7(5)]],
		[1, [synth1(-31)]],
		[1, [synth1(-13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(0)]],
		[1, [synth1(5)]],
		[1, [synth1(18), synth7(0)]],
		[1, [synth1(13)]],
		[1, [synth1(23)]],
		[5, [synth1(31)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(13), synth6(31), synth7(13)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(18)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[5, [synth1(-8)]],
		[0, [off("bass")]],

		[1, [synth1(-39), synth5(-8), synth6(23), synth6(44), synth7(5)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[1, [synth1(10)]],
		[1, [synth1(0)]],
		[1, [synth1(13), synth7(13)]],
		[1, [synth1(10)]],
		[1, [synth1(0)]],
		[5, [synth1(18)]],
		[0, [off("bass")]],

		[1, [synth1(-36), synth5(-5), synth6(26), synth6(36), synth7(0)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[1, [synth1(10)]],
		[1, [synth1(0), synth7(-5)]],
		[1, [synth1(13)]],
		[1, [synth1(10)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(8), synth6(49), synth7(8)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-23)]],
		[1, [synth1(-13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(8), synth7(5)]],
		[1, [synth1(5)]],
		[1, [synth1(-5)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(26), synth6(44), synth7(-5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(5)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[5, [synth1(-8)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(23), synth6(36), synth7(13)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-31)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0), synth7(-8)]],
		[1, [synth1(5)]],
		[1, [synth1(-8)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(18), synth6(26), synth7(-5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8), synth7(0)]],
		[1, [synth1(-23)]],
		[1, [synth1(0)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],

		[1, [synth1(-26), synth5(-26), synth6(23), synth6(36), synth7(5)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[1, [synth1(5)]],
		[1, [synth1(0)]],
		[1, [synth1(18), synth7(13)]],
		[1, [synth1(13)]],
		[1, [synth1(10)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(-13), synth6(5), synth7(-18)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26), synth8(26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(-5), synth8(31)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[4, [synth8(44)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-8), synth6(13), synth7(-8), synth8(23)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-31)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0), synth7(5)]],
		[1, [synth1(5)]],
		[1, [synth1(-8)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(-13), synth6(5), synth7(-5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18), synth8(26)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8), synth7(18), synth8(8)]],
		[1, [synth1(-23)]],
		[1, [synth1(0)]],
		[1, [synth1(13)]],
		[4, [synth8(5)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-8), synth6(18), synth7(13), synth8(13)]],
		[1, [synth1(-31)]],
		[1, [synth1(-13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(0)]],
		[1, [synth1(5)]],
		[1, [synth1(18), synth7(0)]],
		[1, [synth1(13)]],
		[1, [synth1(-5)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(-5), synth6(13), synth7(5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26), synth8(18)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(18), synth8(13)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[4, [synth8(36)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-18), synth6(0), synth7(13), synth8(23)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-31)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0), synth7(23)]],
		[1, [synth1(5)]],
		[1, [synth1(-8)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(-13), synth6(5), synth7(26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18), synth8(26)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8), synth7(13), synth8(23)]],
		[1, [synth1(-23)]],
		[1, [synth1(-5)]],
		[1, [synth1(0)]],
		[4, [synth8(26)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(-8), synth6(13), synth7(5), synth8(13)]],
		[1, [synth1(-31)]],
		[1, [synth1(-13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(0)]],
		[1, [synth1(5)]],
		[1, [synth1(18), synth7(0)]],
		[1, [synth1(13)]],
		[1, [synth1(23)]],
		[5, [synth1(31)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(13), synth6(31), synth7(-5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26), synth8(26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(13), synth8(31)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[4, [synth8(36)]],
		[0, [off("bass")]],

		[1, [synth1(-39), synth5(-8), synth6(23), synth6(44), synth7(5), synth8(31)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[1, [synth1(10)]],
		[1, [synth1(0)]],
		[1, [synth1(13), synth7(18)]],
		[1, [synth1(10)]],
		[1, [synth1(0)]],
		[5, [synth1(18)]],
		[0, [off("bass")]],

		[1, [synth1(-36), synth5(-5), synth6(26), synth6(36), synth7(13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18), synth8(26)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[1, [synth1(10)]],
		[1, [synth1(0), synth7(-5), synth8(31)]],
		[1, [synth1(13)]],
		[1, [synth1(10)]],
		[1, [synth1(13)]],
		[4, [synth8(44)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(8), synth6(49), synth7(8), synth8(26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-23)]],
		[1, [synth1(-13)]],
		[1, [synth1(-18)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8)]],
		[1, [synth1(8), synth7(5)]],
		[1, [synth1(5)]],
		[1, [synth1(-5)]],
		[5, [synth1(13)]],
		[0, [off("bass")]],
	],

	[
		[1, [synth1(-44), synth5(-13), synth6(26), synth6(44), synth7(-18)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26)]],
		[1, [synth1(-36)]],
		[1, [synth1(-26), synth8(18)]],
		[1, [synth1(-18)]],
		[1, [synth1(-26)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8), synth7(5), synth8(23)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[4, [synth8(26)]],
		[0, [off("bass")]],

		[1, [synth1(-49), synth5(-18), synth6(23), synth6(36), synth7(-8), synth8(13)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18)]],
		[1, [synth1(-31)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0), synth7(13)]],
		[1, [synth1(5)]],
		[1, [synth1(-8)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],

		[1, [synth1(-54), synth5(-23), synth6(18), synth6(26), synth7(-5)]],
		[1, [synth1(-36)]],
		[1, [synth1(-31)]],
		[1, [synth1(-36)]],
		[1, [synth1(-18), synth8(5)]],
		[1, [synth1(-13)]],
		[1, [synth1(-26)]],
		[1, [synth1(-5)]],
		[1, [synth1(-8), synth7(0), synth8(8)]],
		[1, [synth1(-23)]],
		[1, [synth1(0)]],
		[1, [synth1(13)]],
		[4, [synth8(13)]],
		[0, [off("bass")]],

		[1, [synth1(-26), synth5(-26), synth6_end(23), synth6_end(36), synth7_end(5), synth8(5)]],
		[1, [synth1(-18)]],
		[1, [synth1(-8)]],
		[1, [synth1(-18)]],
		[1, [synth1(0)]],
		[1, [synth1(-8)]],
		[1, [synth1(5)]],
		[1, [synth1(0)]],
		[1, [synth1(18), synth7_end(13)]],
		[1, [synth1(13)]],
		[1, [synth1(10)]],
		[5, [synth1(0)]],
		[0, [off("bass")]],
	],

/*********/

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(0)]],
		[6, [synth1(13)]],

		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8)]],
		[6, [synth1(5)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-23)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[6, [synth1(13)]],

		[16, []],
	],

	[
		[2, [synth1(-44)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8)]],
		[2, [synth1(0)]],
		[6, [synth1(18)]],

		[2, [synth1(-49)]],
		[2, [synth1(-31)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[6, [synth1(5)]],

		[2, [synth1(-54)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-23)]],
		[2, [synth1(13)]],
		[6, [synth1(-5)]],
	
		[16, [synth4(-23), synth4(8), off("end")]],
	],

	[
		[2, [synth1(-44), synth5(-13), synth3(-44), synth3(-26), synth9(-18), synth9(-13), synth9(-5), synth9(0)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(0), synth8(-5)]],
		[2, [synth1(13)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-49), synth5(-18), synth8(13), synth3(-39), synth3(-31)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8), synth8(0)]],
		[6, [synth1(5)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(-23), synth3(-44), synth3(-36), synth9(-23), synth9(-13), synth9(-5), synth9(5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-23)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5), synth8(-5)]],
		[2, [synth1(13)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-67), synth5(-5), synth8(5), synth3(-49), synth3(-36)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8), synth8(0)]],
		[6, [synth1(0)]],
		[0, [off("bass")]],
	],

	[
		[2, [synth1(-44), synth5(-13), synth3(-39), synth3(-26), synth9(-8), synth9(0), synth9(5), synth9(13)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8)]],
		[2, [synth1(0), synth8(-5)]],
		[2, [synth1(18)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-49), synth5(-18), synth8(18), synth3(-49), synth3(-31)]],
		[2, [synth1(-31)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8), synth8(13)]],
		[6, [synth1(5)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(-23), synth3(-44), synth3(-26), synth9(-18), synth9(-13), synth9(0), synth9(5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-23)]],
		[2, [synth1(13), synth8(-5)]],
		[2, [synth1(-5)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],
	
		[2, [synth1(-49), synth5(0), synth8(5), synth9(-39), synth9(-31)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8), synth8(13)]],
		[6, [synth1(-18)]],
		[0, [off("bass")]],
	],

	[
		[2, [synth1(-44), synth5(-18), synth9(0), synth9(5), synth9(13), synth9(26)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8), synth8(-5)]],
		[2, [synth1(13)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-39), synth5(-8), synth8(13), synth3(-39), synth3(-18)]],
		[2, [synth1(-18)]],
		[2, [synth1(0)]],
		[2, [synth1(-8)]],
		[2, [synth1(10), synth8(0)]],
		[6, [synth1(13)]],
		[0, [off("bass")]],

		[2, [synth1(-36), synth5(-5), synth3(-36), synth3(-18), synth9(-18), synth9(-5), synth9(0), synth9(13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(0)]],
		[2, [synth1(13), synth8(-5)]],
		[2, [synth1(-8)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(-23), synth8(5), synth3(-44), synth3(-26)]],
		[2, [synth1(-36)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8), synth8(0)]],
		[6, [synth1(5)]],
		[0, [off("bass")]],
	],

	[
		[2, [synth1(-44), synth5(-18), synth3(-49), synth3(-31), synth9(-13), synth9(-8), synth9(0), synth9(13)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8), synth8(-5)]],
		[2, [synth1(18)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-39), synth5(-13), synth8(18), synth3(-57), synth3(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[2, [synth1(0)]],
		[2, [synth1(13), synth8(13)]],
		[6, [synth1(10)]],
		[0, [off("bass")]],

		[2, [synth1(-36), synth5(-8), synth3(-39), synth3(-26), synth9(-8), synth9(0), synth9(5), synth9(18)]],
		[2, [synth1(-18)]],
		[2, [synth1(0)]],
		[2, [synth1(-5)]],
		[2, [synth1(5), synth8(-5)]],
		[2, [synth1(23)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(-5), synth8(5), synth3(-49), synth3(-31)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[2, [synth1(5), synth8(13)]],
		[6, [synth1(13)]],
		[0, [off("bass")]],
	],

/*********/

	[
		[2, [synth1(-44), synth5(-23), synth3(-18), synth3(5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth9(0)]],
		[2, [synth1(-5), synth9(5)]],
		[2, [synth1(0), synth8(-5), synth8(26), synth3(-8), synth3(18), synth9(23)]],
		[2, [synth1(13), synth9(36)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-49), synth5(0), synth8(23), synth8(13), synth3(-18), synth3(0)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-13)]],
		[2, [synth1(-8), synth8(0), synth8(13), synth3(-5), synth3(13)]],
		[6, [synth1(5)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(-5), synth3(-18), synth3(5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-23), synth9(-5)]],
		[2, [synth1(-18), synth9(0)]],
		[2, [synth1(-5), synth8(-5), synth8(18), synth3(5), synth3(26), synth9(13)]],
		[2, [synth1(13), synth9(26)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-67), synth5(-18), synth8(13), synth8(5), synth3(-8), synth3(13)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8), synth8(0), synth8(-8), synth3(0), synth3(23)]],
		[6, [synth1(0)]],
		[0, [off("bass")]],
	],

	[
		[2, [synth1(-44), synth5(-13), synth3(-18), synth3(5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth9(0)]],
		[2, [synth1(-8), synth9(5)]],
		[2, [synth1(0), synth8(-5), synth8(26),  synth3(0), synth3(13), synth9(23)]],
		[2, [synth1(18), synth9(31)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-49), synth5(-5), synth8(18), synth8(31), synth3(-26), synth3(18)]],
		[2, [synth1(-31)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8), synth8(13), synth8(18), synth3(-8), synth3(5)]],
		[6, [synth1(5)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(-18), synth3(0), synth3(13)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18), synth9(-5)]],
		[2, [synth1(-23), synth9(5)]],
		[2, [synth1(13), synth8(-5), synth8(23), synth3(-8), synth3(0), synth9(13)]],
		[2, [synth1(-5), synth9(23)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],
	
		[2, [synth1(-49), synth5(-26), synth8(5), synth8(18), synth3(-13), synth3(5)]],
		[2, [synth1(-31)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5)]],
		[2, [synth1(-8), synth8(13), synth8(5), synth3(5), synth3(13)]],
		[6, [synth1(-18)]],
		[0, [off("bass")]],
	],

	[
		[2, [synth1(-44), synth5(-13), synth3(-18), synth3(5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth9(18)]],
		[2, [synth1(-5), synth9(23)]],
		[2, [synth1(-8), synth8(-5), synth8(26), synth3(-8), synth3(18), synth9(31)]],
		[2, [synth1(13), synth9(44)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-39), synth5(-8), synth8(13), synth8(23), synth3(-8), synth3(10)]],
		[2, [synth1(-18)]],
		[2, [synth1(0)]],
		[2, [synth1(-8)]],
		[2, [synth1(10), synth8(0), synth8(31), synth3(0), synth3(23)]],
		[6, [synth1(13)]],
		[0, [off("bass")]],

		[2, [synth1(-36), synth5(-5), synth3(-36), synth3(-5), synth3(18)]],
		[2, [synth1(-18)]],
		[2, [synth1(-5), synth9(-5)]],
		[2, [synth1(0), synth9(13)]],
		[2, [synth1(13), synth8(-5), synth8(36), synth3(13), synth3(31), synth9(23)]],
		[2, [synth1(-8), synth9(36)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-54), synth5(0), synth8(5), synth8(31), synth3(-13), synth3(13)]],
		[2, [synth1(-36)]],
		[2, [synth1(-13)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8), synth8(0), synth8(26), synth3(0), synth3(26)]],
		[6, [synth1(5)]],
		[0, [off("bass")]],
	],

	[
		[2, [synth1(-44), synth5(-5), synth3(-8), synth3(5)]],
		[2, [synth1(-26)]],
		[2, [synth1(-13), synth9(0)]],
		[2, [synth1(-5), synth9(5)]],
		[2, [synth1(-8), synth8(-5), synth8(18), synth3(13), synth3(23), synth9(23)]],
		[2, [synth1(18), synth9(31)]],
		[4, [synth8(0)]],
		[0, [off("bass")]],

		[2, [synth1(-39), synth5(-18), synth8(18), synth8(23), synth3(-21), synth3(0)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[2, [synth1(0)]],
		[2, [synth1(13), synth8(13), synth8(26), synth3(5), synth3(18)]],
		[6, [synth1(10)]],
		[0, [off("bass")]],

		[2, [synth1(-36), synth5_end2(-23), synth3(-18), synth3(-5)]],
		[2, [synth1(-18)]],
		[2, [synth1(0), synth9_end2(-5)]],
		[2, [synth1(-5), synth9_end2(13)]],
		[2, [synth1(5), synth8(-5), synth8(31), synth3(31), synth3(44), synth9_end2(23)]],
		[2, [synth1(23), synth9_end2(36)]],
		[4, [synth8(0)]],

		[2, [synth1(-54), synth8(5), synth8(36), synth3_end2(-13), synth3_end2(5)]],
		[2, [synth1(-36)]],
		[2, [synth1(-18)]],
		[2, [synth1(-8)]],
		[2, [synth1(5), synth8(13), synth8(18), synth3_end2(-5), synth3_end2(18)]],
		[6, [synth1(13)]],
	],

	[
		[8, []],
		[4, [synth8(-5)]],
		[4, [synth8(0)]],
		[8, [synth8(13)]],
		[8, [synth8(0)]],

		[8, []],
		[4, [synth8(-5)]],
		[4, [synth8(0)]],
		[8, [synth8(5)]],
		[8, [synth8(0)]],
	],
].flat();


for (let i = 0; i < mixer.length; i++) {
	mixer[i].signal = [0, 0];
	mixer[i].send ??= -1;
	mixer[i].fx = mixer[i].fx.flat();
}

masterfx = masterfx.flat();

})(),


////////////////////////////////////////////////////////////////////////////////////////////////


///
///  note and audio processing code
///


(_ => {

if (seqptr < seq.length && realt >= tick) {
	for (let c of seq[seqptr][1]) {
		let cmd = c();

		if (cmd.type == "noteon") {
			notes.push(cmd.event);
		} else if (cmd.type == "noteoff") {
			for (let i = 0; i < notes.length; i++) {
				let note = notes[i];

				if (note.id == cmd.event.id) {
					for (let j = 0; j < note.env.length; j++) {
						notes[i].env[j].held = false;
					}
				}
			}
		}
	}

	tick += seq[seqptr][0]*TL();
	seqptr++;
}

sum = [0, 0];

for (let i = 0; i < notes.length;) {
	if (!notes[i].env[0].active) {
		notes.splice(i, 1);
		continue;
	}

	let noteout = notes[i].func();

	if (notes[i].mixsend == null) {
		sum = aadd1(sum, noteout);
	} else {
		mixer[notes[i].mixsend].signal = aadd1(mixer[notes[i].mixsend].signal, noteout);
	}

	i++;
}

for (let j = mixer.length - 1; j >= 0; j--) {
	for (let fi = 0; fi < mixer[j].fx.length; fi++) {
		mixer[j].signal = mixer[j].fx[fi].func(mixer[j].signal);
	}

	if (mixer[j].send == -1) {
		sum = aadd(sum, mixer[j].signal);
	} else if (mixer[j].send < j) {
		let dest = mixer[mixer[j].send];
		dest.signal = aadd(mixer[j].signal, dest.signal);
	}

	mixer[j].signal = [0, 0];
}

for (let i = 0; i < masterfx.length; i++) {
	sum = masterfx[i].func(sum);
}

realt++;

return sum;

})()