/*!
 *    •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · Gallop Through the Leaves
 *    •───────────────•°•❀•°•───────────────•
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
		mu = (1 - cos(m * PI)) * .5;
		return a * (1 - mu) + b * mu;
	};
	wsin = (phase) => (-cos(phase / 256 * PI) + 1) * 128 - .5;
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
	//===============//

	const sr = 22050;

	this.beat ??= 0;
	let bpm = 95 + 35 * min(1, this.beat / 32) ** sqrt(3);
	//let bpm = 130;
	this.beat += bpm / 60 / sr;

	let ts = this.beat * 16384;
	let spb = 60 / bpm * sr;
	var tt = t / sr * 256 * 344.53125 * 2 ** (10 / 12);

	/* delay/reverb taps */
	let rt = this.delayClock ??= 0;
	rvrbHeads = [[
		{t: 300 + sin(rt / 4e3) * 40, m: 1, fb: 0},
		{t: 500 + wsin(rt / 180), m: .6, fb: .3},
		{t: 5e3 + wsin(rt / 300), m: .5, fb: .5},
		{t: 85e2 + wsin(rt / 380), m: .3, fb: .7},
		{t: 17500 + wsin(rt / 420), m:.2, fb: .9},
	],[
		{t: 300 + cos(rt / 4e3) * 40, m: 1, fb: 0},
		{t: 550 + wsin(rt / 200), m: .6, fb: .3},
		{t: 65e2 + wsin(rt / 320), m: .5, fb: .5},
		{t: 7e3 + wsin(rt / 320), m: .3, fb: .7},
		{t: 2e4 + wsin(rt / 450), m: .2, fb: .9},
	]];

	chrsHeads = [[
		{t: 450 + sin(rt / 4e3) * 50, m: 1, fb: .2},
		{t: 850 + wsin(rt / 310), m: .5, fb: .65},
		{t: spb / 4.05 * 3 + cos(rt / 35e3) * 150, m: 1,  fb: .75}
	], [
		{t: 450 + cos(rt / 4e3) * 50, m: 1, fb: .2},
		{t: 800 + wsin(rt / 340), m: .5, fb: .65},
		{t: spb / 3.95 * 3 + sin(rt / 35e3) * 150, m: 1, fb: .75}
	]];

	//==================//
	// song arrangement //
	//==================//

	prog = (str = "", spd = 0) => {if (str === " ") return 0; return parseInt(str[ts >> spd], 36)};
	let kProg = prog("000011111111111100000001111111110000000000", 18); /*   kick    */
	let sProg = prog("000000001111111100000000111111110000000000", 18); /*    clap   */
	let hProg = prog("000000111111111100000011111111101111000000", 18); /*    hat    */
	let lProg = prog("111111111111111111111111111111111111111100", 18); /*   lead    */
	let nProg = prog("011111111111111111111111111111111111111000", 18); /*  harmony  */
	let aProg = prog("001111111111111111111111111111111111111000", 18); /* arpeggio  */
	let mProg = prog("001111111111333300111111111133331111332000", 18); /*   melody  */
	let cProg = prog("001111111111111111111111111111111111111100", 18); /*  chords   */
	let bProg = prog("001111111111111100001111111111111111111000", 18); /*   bass    */
	let iProg = prog("102000002000000020000000200000002000000010", 18); /*  impact   */
	let dProg = prog("000000000000000010000000000000000000000010", 18); /* bass drop */
	let eProg = prog("000000010000000100000001000000010000000000", 18); /*   riser   */
	let rProg = prog("000000010000000100000001000000010000000000", 18); /* breakdown */
	let fProg = prog("000000000000000000000000000000000000001122", 18); /* fade-out  */

	//===========//
	// sequences //
	//===========//
	
	let mIdx = (ts >> 14 ^ (ts >> 12 & 11));
	let lSeq = tt / 4 * 2 ** (parseInt("CJRCJQCJMCJOAHMQ8FO8FM8FK8FMAHMO"[mIdx & 31], 36) / 12); // lead
	let hSeq = tt / 4 * 2 ** (parseInt("QRYQRYQRWQRVQRYV"[mIdx & 15], 36) / 12); // harmony
	let bSeq = sli(tt * 2 ** (parseInt("CCCACCAC888A88A7"[ts >> 15 & 15], 16) / 12), 2500); // bass
	let mSeq = tt * 2 ** (parseInt("023702350237023A"[ts >> 12 & 15], 16) / 12); // melody
	let aSeq = tt * 2 ** (parseInt("JFC7"[ts >> 10 & 3], 36) / 12); // arpeggio
	let aPat = "1101101101101010"[ts >> 12 & 15];
	let cSeq = [[0, 7, 15], [-2, 5, 14], [-4, 3, 12], [-5, 2, 10]]["0001001022212213"[ts >> 15 & 15] | 0];

	/* chord with waveform replacement */
	chrd = (tone = t, chrdNotes = [0], trnsp = 0, wave = input => input) => {
		let idx = chr = 0;
		let maxPoly = 3;
		for (; idx < min(maxPoly, chrdNotes.length); idx++)
			chr += wave(tone * 2 ** ((chrdNotes[idx] + trnsp) / 12));
		return chr / maxPoly;
	};
	
	//=======//
	// drums //
	//=======//

	kick = (lr) => bbf(sin(sin(20 * cbrt(ts % 16384) ** .7 + rnd() * (.995 ** (ts % 16384) + .01))) * (1 - min(1, ts / 16384 % 1 * 2) ** 2), .085, .1, -.85) * gain(8.5);
	sc = (kProg ? (min(1, ts / 16384 % 1 * 2.55) ** 1.55 * .65 + .15) ** 1.55 : .8);
	clap = (lr) => bbf(bpf(bpf(rnd() * 32 * (ts >> 10 & 7 ? (1 - ts / 8192 % 1 + .25) ** 6 / 3 : (1 - (ts / (512 / 1.5)) % 1) ** 2.5 * .95 + .05) *! (ts >> 13 & 1) * (ts >> 14 & 1) * gain(2), .4, .5), .4, .5), .2, .5, -.3);
	hat = (lr) => bpf((rnd() + sin((t + sin(t / 1) * 24) * PI / 480 * 441) / 3) * (1 - (ts / 16384 + .5) % 1) ** 3 * gain(13), .75, .85) + bpf(rnd() * (1 - ts / 4096 % 1) ** 2 * gain(5), .6, .7);
	drop = () => sin(sin(log(ts % 262144 + 4e4) * 750) + rnd() / 32) * 10 ** ((1 - ts / 262144 % 1 * 64) / 20) * (1 - (ts / 262144 % 1) ** 2) * gain(-4.5);
	swell = () => bpf(bpf(rnd(), .3, .6), .3, .6) * (ts >> 19 ? min(1, max(0, (1 - (ts - 2 ** 19) / 131072))) : min(1, max(0, ((ts - 2 ** 19) / 65536) + 1)) ** 8) * gain(10);

	//=========================//
	// oscillators/instruments //
	//=========================//
	
	pwm = (phase, dutyCycle = 0, shapeMode) => phase ? sign((shapeMode ? sin(phase * pi / 128 + 1e-10) : asin(sin(phase * pi / 128 + 1e-10)) / pi * 2) - dutyCycle) / 2 + dutyCycle / 2 : 0;
	saw = (phase) => atan(tan(phase * pi / 256 + 1e-10)) / pi * 2;
	rsaw = (phase) => (saw(phase) + saw(phase * 60 / 64)) / 2;
	sinc = (phase) => sin(phase * pi / 128) + sin(phase * pi / 32) / 8;
	syn = supersaw = (phase, detune) => {
		let sum = 0; let phs = phase * detune;
		let primes = [2, 3, 5, 7, 11, 13, 17, 23];
		function saw(phase) {return ((1 + phase / 128) % 2 - 1) + (random() - .5) / 10};
		for (voices = 0; voices < 8; voices++){
			let octave = 1 + !(voices & 3);
			let prime = primes[voices];
			sum += saw(phs * octave * (1 + prime * (.0016 * ((~voices & 1) - .5) / octave)) + prime ** 2 * 71 + (voices & 1 ? cos : sin)(phs / 2e5 * prime / octave) * 41 / octave) *!! phase};
		return sum / voices;
	},
	bell = (phase, decay = 1) => ((sinc(phase) * decay + sinc(phase * 3.99) / 2 * decay ** 2 + sinc(phase * 10.025) / 3 * decay ** 3 + sinc(phase * 17.955) / 4 * decay ** 4) * gain(-5) || 0);

	/* this is here to add some 8-bit textures to the song */
	/* "combined xpansive's and varjohukka's stuff by viznut" - 2011/09/30 */
	btb = 10 * (ts >> 9 | tt >> 4 | ts >> 8) + 4 * (tt >> 4 & ts >> 15 | ts >> 8);
	
	//================//
	// mix and master //
	//================//
	
	master = lr => tanh((lpf2(
		(dly(dly((pwm(sli(lSeq, 128), sin(ts / 2e4 * 3) / 2) + bell(lSeq * 2, .9998 ** (ts % 4096)) + (pwm(sli(hSeq, 128), sin(ts / 2e4 * 3)) + bell(hSeq * 2, .9998 ** (ts % 4096))) / 2 * nProg) * lProg + saw(sli(mSeq, 128)) * .35 * (1 - ts / 4096 % 1 * cos(ts * PI / 2 ** 19 + PI / 2) ** 2) * mProg + pwm(aSeq / 2, (.5 - ts / 4096 % 1) * 2) * aPat * (1 - ts / 4096 % 1) * aProg * gain(2.5), chrsHeads[lr], .35, x => tanh(bpf(x, .025, .8) / 160) * 100) * gain(-4) + chrd(tt / 4, cSeq, 0, i => syn(i, lr ? 1.005 : .995)) * cProg * gain(3.35), rvrbHeads[lr], .45, x => tanh(bpf(x, .1, .95) / 160) * 100) + bpf(hpf((btb & 255) - 128, .05), .05, .75) / 128 * gain(-11.8) * (fProg == "0" ? 1 : fProg == "1" ? 1 - (ts / 2 ** 19 % 1) ** 2 : 0)) * gain(7.7) * sc
		
		+ (lpf(((saw(bSeq / (lr ? 8.04 : 7.96)) / 2 + saw(bSeq / 16)) + sin(bSeq * PI / 128 / 32) * gain(-3)), .01 + (1 - ts / 4096 % 1) ** 2 * .45)) * sc * gain(-3.5) * bProg + drop() * dProg
		
		+ (kick(lr) * kProg + clap(lr) * sProg + hat(lr) * hProg) * gain(-5.5) *!! (rProg ? ((ts >> 16 & 15) !== 15) : 1)
		
	, min(1, ts / 2 ** 19) * ((fProg == "0" ? 1 : fProg == "1" ? 1 - (ts / 2 ** 19 % 1) ** 2 : 0) * .85 + .15)) * min(1, ts / 2 ** 19) + bpf(bpf(rnd() * gain(1.5), .3, .7), .3, .7) * (.99998 ** (ts % 2 ** 18) + .9998 ** (ts % 2 ** 18)) * iProg + rsaw((ts % 262144) * 8.65 * (1 + (ts % 262144) / 1e6)) * gain(-4.5) * eProg * sc + swell()) * gain(-3)) * (t / sr < 307);

	//=============//
	// final sound //
	//=============//

	return [master(0), master(1)];
})()