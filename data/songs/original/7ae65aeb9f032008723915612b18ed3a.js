t || (
	SR = 48e3,

	lerp = (a, b, x) => a*(1 - x) + b*x,
	sum = (a, b) => a + b,

	avg = arr => arr.reduce(sum)/arr.length,
	aadd = (arr1, arr2) => arr1.map((_, i) => arr1[i] + arr2[i]),
	amix = (arr1, arr2, mix) => arr1.map((_, i) => lerp(arr1[i], arr2[i], mix)),
	amix1 = (x, arr, mix) => arr.map(a => lerp(x, a, mix)),

	saw = p => (2*p + 1) % 2 - 1,

	clip = (inp, thr=1) => min(max(inp, -thr), thr),
	stsep = (inp, sep) => amix1(avg(inp), inp, sep),

	lp6 = class {
		last = 0;

		proc(inp, cut) {
			cut /= SR/2;
			return this.last += (inp - this.last)*cut;
		}
	},

	lp6inst = class {
		last = 0;

		proc(inp, cut) {
			cut /= SR/2;
			return this.last += (inp - this.last)*(this.last > inp ? cut : 0.01);
		}
	},

	hp6 = class {
		lp = new lp6;

		proc(inp, cut) {
			return inp - this.lp.proc(inp, cut);
		}
	},

	bp6 = class {
		f1 = new lp6;
		f2 = new lp6;

		proc(inp, cut) {
			return this.f2.proc(inp - this.f1.proc(inp, cut), cut);
		}
	},

	lp12 = class {
		last = [0, 0];
		tick = 0;

		proc(inp, cut, res) {
			let d = this.tick;
			let p = 10**(-res*0.009375);
			let r = SR/(2*PI*cut);
			let e = r*r;
			let k = p*r + p + e;

			let out = (this.last[~d&1] = (inp + (k + e - 1)*this.last[d&1] - e*this.last[~d&1])/k);
			this.tick++;
			return out;
		}
	},

	hp12 = class {
		lp = new lp12;

		proc(inp, cut, res) {
			return inp - this.lp.proc(inp, cut, res);
		}
	},

	bp12 = class {
		f1 = new lp12;
		f2 = new lp12;

		proc(inp, cut, res) {
			return this.f2.proc(inp - this.f1.proc(inp, cut, res), cut, res);
		}
	},

	multdelay = class {
		idx = 0;

		hsmix(inp) {
			let mult = -2/inp.length;
			let sum = 0;

			for (let i = 0; i < inp.length; i++) {
				sum += inp[i];
			}

			sum *= mult;

			for (let i = 0; i < inp.length; i++) {
				inp[i] += sum;
			}
		}

		constructor(time, mod = 0, modfreq = 1, chns = 8) {
			this.mod = mod;
			this.modfreq = modfreq;
			this.chns = chns;
			this.bufs = Array(this.chns).fill().map((_, c) => Array(round(min(time/1e3*SR*pow(2, c/this.chns), 1e6))).fill(0));
		}

		proc(inp, fdbk, mix) {
			let dlyd = [];

			for (let i = 0; i < this.chns; i++) {
				let buf = this.bufs[i];
				let bufpos = this.idx + SR/960*this.mod*(1 - cos(this.modfreq*2*PI*this.idx/SR/pow(2, i/this.chns)));

				dlyd[i] = lerp(buf[floor(bufpos) % buf.length], buf[(floor(bufpos) + 1) % buf.length], bufpos % 1);
			}

			this.hsmix(dlyd);

			let _multiin = !(typeof inp == "number");
			let stereoin = _multiin && inp.length == 2;
			let multiin = _multiin && !stereoin;
			var originp = inp;

			if (!_multiin) {
				originp = [originp, originp];
			}

			if (!_multiin) {
				inp = Array(this.chns + 1).fill(inp);
			} else if (stereoin) {
				inp = Array(this.chns + 1).fill(avg(inp));
			}

			for (let i = 0; i < this.chns; i++) {
				this.bufs[i][this.idx % this.bufs[i].length] = inp[i] + dlyd[i]*fdbk;
			}

			this.idx++;

			let out = multiin ? amix1(inp[this.chns], amix(dlyd, inp, 0.5), mix) : amix(originp, dlyd, mix);

			return out.slice(0, 2);
		}
	},

	diffusor = class {
		idx = 0;

		hdrec(inp, size, off) {
			if (size <= 1) return;
			let hs = size/2;

			this.hdrec(inp, hs, off);
			this.hdrec(inp, hs, off + hs);

			for (let i = 0; i < hs; i++) {
				let x = inp[i + off];
				let y = inp[i + off + hs];
				inp[i + off] = x + y;
				inp[i + off + hs] = x - y;
			}
		}

		hdmix (inp, chns) {
			this.hdrec(inp, chns, 0);

			let k = sqrt(1/chns);

			for (let i = 0; i < chns; i++) {
				inp[i] *= k;
			}
		}

		constructor(maxdur, chns) {
			this.chns = chns;
			this.flip = Array(this.chns).fill(0).map(_ => random() >= 0.5);
			this.bufs = Array(this.chns).fill().map(
				(_, c) => Array(floor(maxdur/1e3*SR*c/this.chns + maxdur/1e3*SR/this.chns*random()) + 1).fill(0)
			);
		}

		proc(inp) {
			let pos = this.bufs.map(buf => this.idx % buf.length);
			this.idx++;

			if (typeof(inp) == "number") {
				inp = Array(this.chns + 1).fill(inp);
			} else if (inp.length == 2) {
				inp = Array(this.chns + 1).fill(avg(inp));
			}

			let dlyd = [];

			for (let i = 0; i < this.chns; i++) {
				dlyd[i] = this.bufs[i][pos[i]];
				this.bufs[i][pos[i]] = inp[i];
			}

			this.hdmix(dlyd, this.chns);

			for (let i = 0; i < this.chns; i++) {
				if (this.flip[i]) {
					dlyd[i] *= -1;
				}
			}

			return dlyd.concat(inp[this.chns]);
		}
	},

	reverb = class {
		constructor(time, mod = 0, modfreq = 1, diffsteps = 4, difftime = 20, chns = 8) {
			this.dly = new multdelay(time, mod, modfreq, chns);
			this.diffs = Array(diffsteps).fill().map((_, i) => new diffusor(difftime*2**i, chns));
		}

		proc(inp, fdbk, mix) {
			var out = inp;

			for (let diff of this.diffs) {
				out = diff.proc(out);
			}

			return this.dly.proc(out, fdbk, mix);
		}
	},

	colorgen = class {
		dur = 0;
		phase = 0;
		timer = 0;
		notes = Array(7).fill().map((_, i) => [1, 9/8, 5/4, 3/2, 15/8].map(x => x*2**i)).flat();
		note = 0;
		curbase = 0;

		proc(base) {
			if (this.timer <= 0) {
				this.note = this.notes[random()*this.notes.length|0];
				this.curbase = base;
				this.timer += this.dur = round(2e3*(1 + 2*random()));
				this.phase = 0;
			}

			let sinephase = 2*PI*this.phase;
			let out = sin(sinephase)*(1 - cos(2*PI*(this.timer/this.dur)**(this.note**0.8 + 1)))/3/this.note;
			this.phase += this.curbase*this.note/48e3;
			this.timer--;

			return out;
		}
	},

	cg = Array(12).fill().map(_ => new colorgen),
	colhp = new hp6,

	noteslide = new lp6,
	mellp = new lp12,
	melhp = new hp12,

	chord = Array(3).fill().map((_, i) => [1, 9/8, 5/4, 3/2, 15/8].map(x => x*2**i)).flat().map(x => [x, 0]),
	chord.unshift([0.5, 0]),
	chordlp = new lp12,

	rvb = new reverb(200, 0.5),
	rvb2 = new reverb(200, 1),
	rvb3 = new reverb(150, 0.5),
	rvb4 = new reverb(200, 1),

	clrgate = new lp6,
	bassgate = new lp6,
	chrgate = new lp6,
	mldgate = new lp6,

	silent = [0, 0],

	mphase = 0,
	ophase = 0,
	ophase2 = 0
),

bar = t/6e5,
outrot = max(t - 6e5*.2, 0),
halfnote = .5/cbrt(16),
base = 309,
mnotes = [1, 9/8, 3/2, 4/3, 9/8, 3/2, 15/9, 4/3],
_curnote = base*mnotes[floor(t/15e4) % mnotes.length],
ocurnote = base*mnotes[floor(outrot/15e4) % mnotes.length],
curnote = noteslide.proc(_curnote, 7.5),
root = bar < 2 ? 1 : 1/[1, 1.5][floor(t/3e5) % 2],
outronote = [1, 2/3, 8/9, 15/18, 3/4, 2/3, 9/16, 0.5][floor(outrot/3e5) % 8],

env = bar < 1.5 + halfnote ? tanh(2) : tanh(1 - cos(2*PI*(t/3e5%1)**0.75)),

color = cg.map((x, i) => x.proc(base*root)).reduce(sum)/sqrt(cg.length)*3*env,
bass = tanh(sin(2*PI*(t%3e5)*base/4*root/48e3)*.8)*env,
melody = mellp.proc(saw(mphase) + saw(mphase*2 + 0.5)/2*env, curnote*(3 - cos(2*PI*t/3e5)), 16)*(base/curnote)*env,
melody = melhp.proc(melody, curnote/2, 0),

chordout = chord.map(x => {
	let out = saw(x[1])/max(x[0], 1)*env;
	x[1] += x[0]*base*root*1.2**(random() - 0.5)/48e3;
	return out;
}).reduce(sum)/chord.length*3.5,
chordout = chordlp.proc(chordout, 500*2**env*root, 0),

outro = sin(8*PI*ophase)*(1 - outrot/15e4%1)**2*min(outrot%15e4/256, 1)*(base/ocurnote)/2,
outro += sin(4*PI*ophase2)*(1 - outrot/3e5%1)**2*min((outrot%3e5)/256, 1)/outronote/1.5,

bar < 12 || (mphase += curnote*1.2**(random() - 0.5)/48e3),
bar < 28.2 || (ophase += ocurnote/48e3, ophase2 += outronote*base/48e3),

color *= clrgate.proc(+(bar < 28), bar < 2 ? 1/16 : 24e3),
bass *= bassgate.proc(bar >= 4 & bar < 24, bar < 24 ? 1/8 : 1/4),
chordout *= chrgate.proc(bar >= 8 & bar < 28, bar < 28 ? 1/8 : 24e3),
melody *= mldgate.proc(bar >= 12 & bar < 20, bar < 20 ? 1/8 : 1/4),
outro *= bar < 32.2,

colorvb = rvb.proc(colhp.proc(color, 1000), 0.8, 0.375),
melodyrvb = bar < 12 ? silent : rvb2.proc(melody/1.75, 0.85, 1),
chordrvb = bar < 8 ? silent : rvb3.proc(chordout, 0.8, 1),
outrorvb = bar < 28 ? silent : rvb4.proc(outro, 0.85, 0.5),

mix = stsep(melodyrvb, 0.5),
mix = aadd(mix, stsep(colorvb, 0.5)),
mix = aadd(mix, stsep(chordrvb, 0.5)),
mix = aadd(mix, stsep(outrorvb, 0.5)),
mix.map(x => (x + bass)/3)