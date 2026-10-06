/*!
 *      •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · Blossoming Trot of Ponyville
 *      •───────────────•°•❀•°•───────────────•
 */

(() => {
	pi = Math.PI; tau = 2 * Math.PI;
	S = Math.sin; C = Math.cos; rnd = () => Math.random();
	
	//================//
	// initialization //
	//================//
	
	if (t === 0) {
		fx = [];
		rfx = [];
		slf = [];
	};
	
	this.buf ??= {};
	buf = this.buf;

	/* index count */
	let fxi = 0;
	let sfxi = 0;
	let dfxi = 0;

	/* persistent */
	this.delayClock ??= 0;
	let dt = this.delayClock++;

	//=========//
	// effects //
	//=========//
	
	/* gain mixing */
	gain = (dB = 0) => 10 ** (dB / 20);

	/* filters */
	lpf = (inp, cut) => (
		lpf_fxii = fxi++,
		f = fx[lpf_fxii] ??= {f0: 0},
		f.f0 += (inp - f.f0) * cut
	);
	hpf = (inp, cut) => inp - lpf(inp, cut);
	bpf = (inp, hcut, lcut) => hpf(lpf(inp, lcut), hcut);
	bbf = (inp, hcut, lcut, boost) => inp + bpf(inp, hcut, lcut) * boost;
	/* 2 poles */
	lpf2 = (inp, cut) => lpf(lpf(inp, cut), cut);
	hpf2 = (inp, cut) => hpf(hpf(inp, cut), cut);
	/* resonant lp */
	lpr = (inp, cut, res) => (
		cut += 1e-14,
		lpr_fxii = fxi ++,
		rf = rfx[lpr_fxii] ??= {f0: 0, f1: 0},
		rf.f0 += rf.f1 += (inp - rf.f0 - rf.f1 * (1 - sqrt(res) ** .7) / cut) * cut
	);

	/* cosine interpolation */
	cosp = (a, b, m) => {
		mu = (1 - C(m * PI)) * .5;
		return a * (1 - mu) + b * mu;
	};
	wsin = (phase) => (-C(phase / 256 * PI) + 1) * 128 - .5;
	/* delay/reverb w/ tail continuity */
	dMax = 1e5;
	dly = multiTapDelay = (inp, heads, mix, fbfn = x => x) => {
		dly_fxii = dfxi++;
		buf[dly_fxii] ??= new Float32Array(dMax);
		dly_wi = dt % dMax;
		dly_feed = inp;
		dly_out = 0;

		for(let head of heads){
			pos = dMax + dt - head.t;i0 = floor(pos) % dMax; i1 = (i0 + 1) % dMax; mu = pos - floor(pos);

			dly_ri = cosp(buf[dly_fxii][i0], buf[dly_fxii][i1], mu);
			dly_feed += dly_ri * head.fb;
			dly_out += dly_ri * head.m;
		};

		buf[dly_fxii][dly_wi] = fbfn(dly_feed);
		return inp * (1 - mix) + dly_out * mix;
	};

	/* slide/portamento */
	sli = slide = (input, portamento) => (
		sld_fxii = sfxi++,
		sld = slf[sld_fxii] ??= {out: 0, vel: 0, target: 0, noteOn: 0},

		noteOn = !isNaN(input) && !sld.noteOn,
		sld.noteOn = !isNaN(input),
		sld.target = t ? input / t : t,

		!isNaN(input) ? (sld.out += sld.vel += (sld.target - sld.vel) / (noteOn ? 1 : (t > 2 ? (portamento || 1) : 1))) : 0
	);

	//================//
	// track settings //
	//================//

	let bpm = 117;
	let sr = 44100;
	let spb = 60 / bpm * sr;
	let ts = t / sr * bpm / 60 * 16384;
	var tt = t / sr * 440 * 2 ** (-3 / 12);

	rt = this.delayClock ?? 0,
	/* reverb heads */
	rvrbHeads = [[
		{t: 600 + sin(rt / 8e3) * 40, m: 1, fb: 0},
		{t: 5e3 + wsin(rt / 180), m: .6, fb: .3},
		{t: 1e4 + wsin(rt / 300), m: .5, fb: .5},
		{t: 19e3 + wsin(rt / 380), m: .3, fb: .7},
		{t: 35e3 + wsin(rt / 420), m: .2, fb: .9},
		{t: spb / 4.05 * 3 + C(rt / 35e3) * 175, m: 1,  fb: .75}
	], [
		{t: 600 + C(rt / 8e3) * 40, m: 1, fb: 0},
		{t: 11e2 + wsin(rt / 200), m: .6, fb: .3},
		{t: 13e3 + wsin(rt / 320), m: .5, fb: .5},
		{t: 14e3 + wsin(rt / 320), m: .3, fb: .7},
		{t: 4e4 + wsin(rt / 450), m: .2, fb: .9},
		{t: spb / 3.95 * 3 + sin(rt / 35e3) * 175, m: 1, fb: .75}
	]];

	//==================//
	// song arrangement //
	//==================//
	prog = (str = "", spd = 0) => {if (str === " ") return 0; return str[ts >> spd] | 0},
	kProg = prog("011100110", 19), /*   kick    */
	sProg = prog("001101110", 19), /*   snare   */
	hProg = prog("011111111", 19), /*    hat    */
	mProg = prog("001100110", 19), /*   melody  */
	lProg = prog("001101111", 19), /*   lead    */
	cProg = prog("111111111", 19), /*  chords   */
	rProg = prog("110101011", 19), /*   riser   */
	bProg = prog("111111110", 19), /*   bass    */

	//===========//
	// sequences //
	//===========//

	chrds = ["047B", [-3, 4, 7, 12], "259C", [-5, 2, 5, 11], "047B", [-3, 4, 7, 12], [-7, 4, 7, 12], [-5, 2, 5, 11]][ts >> 15 & 7];
	mel = slide(tt * 2 ** (parseInt("cc 99 777 4 779 cce g eee c bc7 "[ts >> 12 & 31], 36) / 12), 1e3);
	mel2 = tt * 2 ** (parseInt("774 9 99  4 994 77 44 99  b 997 jj gg ee  g jjgjllo n jj  hge j"[ts >> 12 & 63], 36) / 12);
	bas = slide(tt * 2 ** (parseInt("c9e7c957"[ts >> 15 & 7], 36) / 12), 3e3);

	/* chord with waveform replacement */
	chrd = chord = (tone = x => x, chrdNotes = "0", trnsp = 0, wave = input => (input / 128 % 2 - 1)) => {
		let idx = chr = 0
		let maxPoly = 4
		for (; idx < min(maxPoly, chrdNotes.length); idx++) {
			let note = Array.isArray(chrdNotes) ? chrdNotes[idx] : parseInt(chrdNotes[idx], 36)
			chr += wave(tone * 2 ** ((note + trnsp) / 12))
		}
		return maxPoly ? chr / maxPoly : 0
	};

	//=======//
	// drums //
	//=======//
	
	sc = sidechain = (volume = 1, speed = 0) => 
		(1 - (1 - min(1, ts / 6144 % ((16384 / 2 ** speed) / 6144)) ** 2) * volume)
		;
	kik = kick = (volume = 1, speed = 0) => (
		_tk = 16384 / 2 ** speed,
		_ptk = ts % _tk + 1,
		bbf(sin(sin((_ptk) ** .3 * 5 - sin(.999 ** _ptk * 20) * 2 + (rnd()) / 2 * .998 ** _ptk)) * 1.55 * (1 - min(1, ts / 16384 % (_tk / 16384) * 1.35) ** 1.15) * volume, .02, .1, -1)
	);
	snr = snare = (volume = 1, speed = 0) => (
		_ts = 16384 / 2 ** speed,
		bpf(bpf(rnd(), .2, .4), .2, .4) * 24 * max(1 - ts / 8192 % (_ts / 8192), 0) ** 1 * max(ts / 8192 % (_ts / 8192), 0) * (1 - ts / 16384 % (_ts / 16384)) ** 3 * volume || 0
	);
	hat = (volume = 1, speed = 0) =>
		bpf(hpf((rnd()) + sign(S((t + S(t / 16) * 128) * PI / 480 * 441)) / 3, .35), .55, .45) * 3 * (1 - ts / 16384 % ((16384 / 2 ** speed) / 16384)) ** 6 * volume;
	brk = rProg ? !((ts >> 16 & 7) == 7) : 1;

	//=========================//
	// oscillators/instruments //
	//=========================//

	wave = (input, type, speed, arg = 0) => (
		type = type.toLowerCase(),
		type == "squ" ? (input * 4 & 2) - 1 :
		type == "tri" ? abs(input * 2 % 2 - 1) * 2 - 1 :
		type == "saw" ? input * 2 % 2 - 1  : 
		type == "sin" ? S(input * tau  + 1e-11) :
		type == "xor" ? (((input * 256 ^ input * 512) & 255) - 127.5) / 127.5 :
		type == "or" ? (((input * 256 | (input * 512 * (1 + arg / 1024))) & 255) - 127.5) / 127.5 :
		type == "and" ? (((input * 256 & (input * 512 * (1 + arg / 1024))) & 255) - 127.5) / 127.5 :
		type == "sier" ? (((input * 256 & speed >> arg) & 255) - (speed >> (arg + 1) & 127)) / 127.5 :
		type == "csqrt" ? C(sqrt(input * 4 % 4) * pi) :
		(_ => {throw Error(`wave() function error: Invalid wave type (reading: ${type})`);})()
	) || 0;
	fm = (phase, index, mod, fb, mix) => S(tau * phase + index * S(mod * tau * phase + fb * S(mod* tau * phase)) * mix) || 0;
	pwm = (tone, width = .5, mode = 0) => (tone ? (sign((mode ? S(tone* tau) : asin(S(tone* tau + 1 / 2 ** 22)) / PI * 2) / (1 + 1e-9) - width) / 2 + width / 2) : 0) || 0;

	master = lr => tanh((
	(dly((0
		+ fm(mel, 1, 3, 0, .35) * gain(-5 * mProg - 1.2) * min(1, ts / 262144)
 		+ bpf(wave(mel2 * 2 * 255 / 256, "tri") / 2 + pwm(mel2, .2), .01, .55) * gain(1.5) * lProg
		+ hpf(bpf(chrd(tt / 2, chrds, 0, x => wave(x * (lr ? .995 : 1.005) + 2 ** 22, "saw")), .05, .4), .08) * (1 - (ts % 32768) / 12288 % 1 * .45) * (1 - ((ts % 32768) % 12288) / 8192 % 1 * .65) * gain(16)
		) *! ((ts >> 19) > 8), rvrbHeads[lr], .4, x => tanh(bpf(x, .02, .8) / 180) * 100) * gain(-5.2)
	+ lpf(bpf(wave(bas / 16, "csqrt") + wave(bas / 8 * (lr ? .995 : 1.005), "csqrt"), .035, .35), .35) * gain(-3.5) * min(1, ts / 524288) * bProg
) * sc(!!(ts >> 19 & 7) * brk * kProg)
	+ hat(gain(-4), 1) * hProg * brk
	+ snare(gain(-2)) *!! (ts >> 20 & 3) * (ts >> 14 & 1) * sProg * brk
	+ hpf(hpf(kick(), .005), .005) * kProg * brk
	+ bpf(random(), .3, .5) * (ts / 524288 % 1) ** 24 * rProg * gain(-1.2)
) * gain(-1.5)) * min(1, t / 5e5);

	return [master(0), master(1)]
})()