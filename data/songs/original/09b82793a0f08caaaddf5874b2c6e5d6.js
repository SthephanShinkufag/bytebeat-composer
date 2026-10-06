/*!
 *       •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · Quiet Stroll Through Ponyville
 *       •───────────────•°•❀•°•───────────────•
 */

(() => {
	pi = Math.PI; tau = 2 * Math.PI;
	rnd = () => random() - .5;
	
	//================//
	// initialization //
	//================//
	
	if (t === 0) {
		fx = [];
		rfx = [];
		slf = [];
		pfx = Array(8).fill(0);
		pfxi = 0;
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
	bpf2 = (inp, hcut, lcut) => bpf(bpf(inp, hcut, lcut), hcut, lcut);
	/* resonant lp */
	lpr = (inp, cut, res) => (
		cut += 1e-14,
		lpr_fxii = fxi ++,
		rf = rfx[lpr_fxii] ??= {f0: 0, f1: 0},
		rf.f0 += rf.f1 += (inp - rf.f0 - rf.f1 * (1 - sqrt(res) ** .7) / cut) * cut
	);

	/* cosine interpolation */
	cosp = (a, b, m) => {
		mu = (1 - cos(m * PI)) * .5;
		return a * (1 - mu) + b * mu;
	};
	wsin = (phase) => (-cos(phase / 256 * PI) + 1) * 128 - .5;
	/* delay/reverb w/ tail continuity */
	dMax = 5e4;
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

	acc = a => (
		acc_fxii = fxi++,
		fx[acc_fxii] ||= 0,
		fx[acc_fxii] += a / max(1, t)
	);

	/* slide/portamento */
	sli = (a, n) => (
		sli_fxii = sfxi++,
		sl = slf[sli_fxii] ??= {x: 0, y: 0},
		isNaN(a) ? 0 : (sl.x += sl.y += (a / max(1, t) - sl.y) / n)
	);

	pink = ch => {
		let sum = 0;

		for (let id = 0; id < 12; id++) {
			if ((pfxi & ((1 << id) - 1)) === 0)
			pfx[id] = random() * 2 - 1;
			sum += pfx[id] / 6;
		};

		pfxi++;
		return sum;
	};

	//================//
	// track settings //
	//================//

	let bpm = 85;
	let sr = 44100;
	let spb = 60 / bpm * sr;
	let ts = t / sr * bpm / 60 * 16384;
	var tt = t / sr * 433 * 2 ** (-6 / 12);

	/* delay/reverb taps */
	let rt = this.delayClock ??= 0;
	rvrbHeads = [[
		{t: 600 + sin(rt / 8e3) * 40, m: 1, fb: 0},
		{t: 5e3 + wsin(rt / 180), m: .6, fb: .3},
		{t: 1e4 + wsin(rt / 300), m: .5, fb: .5},
		{t: 19e3 + wsin(rt / 380), m: .3, fb: .7},
		{t: 35e3 + wsin(rt / 420), m: .2, fb: .9},
	], [
		{t: 600 + cos(rt / 8e3) * 40, m: 1, fb: 0},
		{t: 11e2 + wsin(rt / 200), m: .6, fb: .3},
		{t: 13e3 + wsin(rt / 320), m: .5, fb: .5},
		{t: 14e3 + wsin(rt / 320), m: .3, fb: .7},
		{t: 4e4 + wsin(rt / 450), m: .2, fb: .9},
	]];

	chrsHeads = [[
		{t: 900 + sin(rt / 4e3) * 50, m: 1, fb: .2},
		{t: 17e2 + wsin(rt / 310), m: .5, fb: .65},
		{t: spb / 4.05 * 3 + cos(rt / 35e3) * 150, m: 1,  fb: .75}
	], [
		{t: 900 + cos(rt / 4e3) * 50, m: 1, fb: .2},
		{t: 16e2 + wsin(rt / 340), m: .5, fb: .65},
		{t: spb / 3.95 * 3 + sin(rt / 35e3) * 150, m: 1, fb: .75}
	]];
	
	//===========//
	// sequences //
	//===========//

	kSeq = "1----1--11---1--"[ts >> 13 & 15] | 0;

	// chord progression: I iii IV Vsus iii V
	cSeq = ["7cgj", "7cgj", "7bgj", "7bgj", "9chl", "7cej", "7bgj", "7bej"][ts >> 15 & 7];
	bSeq = acc(tt * 2 ** (parseInt("00445747"[ts >> 15 & 7], 16) / 12)) / 4;
	mSeq = sli(tt * 2 ** (parseInt("j g e gg    7bcj  g e gn  j  bcj  g e cj  ggeg b          7 b c j g e gg    7bcj  g e gn  j   no  n l jo  nnln g      jge ceb c g j g e   j o n l   j   g   c e g     j l jlj e g   j g e b c e g e g j n o q s o   n onj   j h g     gec   b c g     e c g b c "[ts >> 12 & 255], 36) / 12), 200);

	chrd = chord = (tone, chrdNotes = "0", trnsp = 0, wave = input => (input / 128 % 2 - 1)) => {
		let idx = chr = 0
		let maxPoly = 4
		for (; idx < min(maxPoly, chrdNotes.length); idx++) {
			let note = Array.isArray(chrdNotes) ? chrdNotes[idx] : parseInt(chrdNotes[idx], 36)
			chr += wave(tone * 2 ** ((note + trnsp) / 12))
		}
		return maxPoly ? chr / min(maxPoly, chrdNotes.length) : 0
	};

	//==================//
	// song arrangement //
	//==================//

	prog = (str = "", spd = 0) => {if (str === " ") return 0; return str[ts >> spd] | 0},
	kProg = prog("0011111111111100", 18), /*   kick    */
	sProg = prog("0011111100111100", 18), /*   snare   */
	hProg = prog("0111111111111100", 18), /*    hat    */
	mProg = prog("0000111100111100", 18), /*   melody  */
	cProg = prog("1111111111111111", 18), /*  chords   */
	fProg = prog("0101000101000100", 18), /*    fill   */
	bProg = prog("0111111111111110", 18), /*   bass    */

	//=============//
	// instruments //
	//=============//

	kick = () => (lpf2(tanh(sin(((ts / 8192 % 1 / 2) - 12 * pow(2, -10 * (ts / 8192 % 1 / 2)) - 7 * pow(2, -20 * (ts / 8192 % 1 / 2 )) - 3 * pow(2, -500 * (ts / 8192 % 1 / 2))) * 3)), .12) + rnd() / 32) / 1.5 * .9995 ** (ts % 8192) * kSeq;
	snare = (pt = 1) => tanh(lpf(bpf(sin((2 * PI * 40 * pow(2, -1 * (ts % (16384 / pt)) / 4096)) + sin((ts % (16384 / pt)) / 255)) * .998 ** (ts % (16384 / pt)) * 6 + bpf(rnd() * 10, .5, .85) * .999 ** (ts % (16384 / pt)), .25, .8), .18) * (ts >> 14 & 1) * 2) / 1.55 * .1 ** (5 / (ts % (16384 / pt)));
	fill = () => snare(2 + (ts >> 12 & 2)) *! (~ts >> 13 & 31);
	hat = () => tanh(bpf(rnd() + sign(sin((t + sin(t / 16) * 8) * PI / 480 * 441)) / pi, .6, .5) * .999 ** ((ts - 768) % 8192) * 3.2);
	drums = () => tanh(lpf2(hpf((kick() * kProg + snare(1) * sProg + hat() * hProg + fill() * fProg), .01), .35) * 1.4) * .85 * .1 ** (25 / (ts % 8192));
	
	fm = (phase, index, mod, fb, mix) => sin(tau * phase + index * sin(mod * tau * phase + fb * sin(mod * tau * phase)) * mix) || 0;
	rhd = (phase, vel, bell = 1, lr) => fm(phase * (lr ? .997 : 1.003), .8 + (1.9 + bell) * vel, 1, .1 + .2 * vel, .25 + .5 * vel) * vel * (abs(lr - cos(t / 5e3) ** 2) * .65 + .35);
	rhodes = (phase, lr) => rhd(phase, .65 * .99995 ** (ts % (ts >> 17 & 1 ? 32768 : 65536)) + .35 * .9999 ** (ts % 32768), .15, lr) / 2;
	
	cqrt = phase => cos(sqrt(phase % 1) * PI * 2); // cosine square root bass
	bass = lr => cqrt(bSeq / 2) + cqrt(bSeq) / 2 + cqrt(bSeq * (lr ? 3.005 : 2.995)) / 3;

	//================//
	// mix and master //
	//================//
	
	master = lr => bpf(round(tanh(bpf2(
		drums()
		+ lpf(bass(lr), .1) / 7 * .9999 ** (ts % 32768) * .1 ** (25 / (ts % 32768)) * bProg

		+ dly(0
			+ dly((fm(mSeq, 1, 3, .55, .35) + fm(mSeq * 2, 2, 3, .55, .15) / 2) * .99975 ** (ts % 4096) / 3.55 * mProg, chrsHeads[lr], .35, x => tanh(bpf(x, .025, .8) / 160) * 100)
			+ chrd(acc(tt), cSeq, 0, i => rhodes(i / 2, lr)) * .999935 ** (ts % 32768) * .1 ** (25 / (ts % 32768)) * 2 * cProg
		, rvrbHeads[lr], .55, x => tanh(bpf(x, .02, .6) / 160) * 100) / 1.85
	, .025, .2) * 1.4 * 2) * 48) / 48, .005, .35)

	// vhs simulation
	+ ((t / sr * 60 * 2 % 2 - 1) + pink(lr)) / 96

	//=============//
	// final sound //
	//=============//

	return [master(0), master(1)];
})()