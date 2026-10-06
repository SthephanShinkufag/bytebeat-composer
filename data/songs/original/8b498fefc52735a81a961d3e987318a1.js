/*!
 *           •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · ❄️📼 Aurora Drive Through Equestria 🌌🦄
 *   ❄️ A Synthwave Remix of Winter Whispers of Equestria ❄️
 *           •───────────────•°•❀•°•───────────────•
 *  ※ Licensed under CC-BY-SA-4.0 ║ https://creativecommons.org/licenses/by-sa/4.0
 */

(() => {
	if (t === 0) {
		fx = [];
		rfx = [];
	};
	this.buf ??= {};
	buf = this.buf;

	/* filters */
	lpf = (inp, cut) => (
		lpf_fxii = fxi++,
		f = fx[lpf_fxii] ??= {f0: 0},
		f.f0 += (inp - f.f0) * cut
	);
	hpf = (inp, cut) => inp - lpf(inp, cut);
	bpf = (inp, hcut, lcut) => hpf(lpf(inp, lcut), hcut);
	bbf = (inp, hcut, lcut, boost) => inp + bpf(inp, hcut, lcut) * boost;

	lpf2 = (inp, cut) => lpf(lpf(inp, cut), cut);
	hpf2 = (inp, cut) => hpf(hpf(inp, cut), cut);

	lpr = (inp, cut, res) => (
		cut += 1e-14,
		lpr_fxii = fxi ++,
		rf = rfx[lpr_fxii] ??= {f0: 0, f1: 0},
		rf.f0 += rf.f1 += (inp - rf.f0 - rf.f1 * (1 - sqrt(res) ** .7) / cut) * cut
	);

	cosp = (a, b, m) => {
		mu = (1 - cos(m * PI)) * .5;
		return a * (1 - m) + b * m;
	};
	wsin = (phase) => (-cos(phase / 256 * PI) + 1) * 128 - .5;
	/* delay/reverb with tail continuity */
	dMax = 1e5;
	dly = multiTapDelay = (inp, heads, mix, fbfn = x => x) => {
		dly_fxii = dlyfxi++;
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

	var fxi = 0;
	var dlyfxi = 0;
	var filter = 0;
	this.delayClock ??= 0;
	var dt = this.delayClock++; /* persistent delay clock */
	var pi = PI;

	/* track settings */
	const bpm = 105;
	const sr = 22050;
	const spb = (60 / bpm) * sr;
	var sec = t / sr;
	var ts = sec * (bpm / 60) * 16384;
	var tt = sec * 256 * 445 * 2 ** (5 / 12);
	gain = (dB = 0) => 10 ** (dB / 20);

	/* reverb heads (6 taps =O_O=) */
	const rt = this.delayClock ?? 0;
	rvrbHeads = [[
		{t: 300 + sin(rt / 4e3) * 40, m: 1, fb: 0},
		{t: 500 + wsin(rt / 180), m: .6, fb: .3},
		{t: 5e3 + wsin(rt / 300), m: .5, fb: .5},
		{t: 85e2 + wsin(rt / 380), m: .3, fb: .7},
		{t: 17500 + wsin(rt / 420), m:.2, fb: .9},
		{t: spb / 1.99 + sin(rt / 35e3) * 175, m: .75, fb: .75}
	],[
		{t: 300 + cos(rt / 4e3) * 40, m: 1, fb: 0},
		{t: 550 + wsin(rt / 200), m: .6, fb: .3},
		{t: 65e2 + wsin(rt / 320), m: .5, fb: .5},
		{t: 7e3 + wsin(rt / 320), m: .3, fb: .7},
		{t: 2e4 + wsin(rt / 450), m: .2, fb: .9},
		{t: spb / 2.01 + cos(rt / 35e3) * 175, m: .75, fb: .75}
	]];
	
	/* hexadecimal string */
	/* decoded message: "Konnichiwa~ hi hi! I'm Priscilla-chan, a sparkling alicorn pony who adores all things magical. I'm a proud fan of My Little Pony and Uma Musume, sharing friendship, fun, and kirakira vibes wherever I go! Sparkle bright, shine on, and keep the magic alive~!" */
	let hex = "4b6f6e6e6963686977617e206869206869212049276d205072697363696c6c612d6368616e2c206120737061726b6c696e6720616c69636f726e20706f6e792077686f2061646f72657320616c6c207468696e6773206d61676963616c2e2049276d20612070726f75642066616e206f66204d79204c6974746c6520506f6e7920616e6420556d61204d7573756d652c2073686172696e6720667269656e64736869702c2066756e2c20616e64206b6972616b697261207669626573207768657265766572204920676f2120537061726b6c65206272696768742c207368696e65206f6e2c20616e64206b65657020746865206d6167696320616c6976657e21";

	/* sequencers */
	/* chords: im7-bIIImaj7-bVImaj7-bVII7 */
	let chSeq = ts >> 17 & 3;
	let mSeq = tt / 4 * 2 ** (parseInt(["07EFMQRY", "3AEJMQVT", "8CFJKORW", "AEFHMQRT"][chSeq][7 & ("0x" + hex[(ts >> 12) % hex.length])], 36) / 12);
	let gSeq = tt / 2 * 2 ** (parseInt("F  J  M   QR  M F EF  M   J H E "[ts >> 12 & 31], 36) / 12) || 0; /* priscilla's signature melody */
	let bSeq = tt * 2 ** (parseInt("CF8A"[chSeq], 36) / 12);
	let cSeq = [[0, 7, 15, 22], [3, 10, 19, 26], [-4, 3, 12, 19], [-2, 5, 14, 20]][chSeq];
	function chrd(tone = t, chrdNotes = [0], trnsp = 0, wave = input => input) {
		let idx = chr = 0;
		let maxPoly = 4;
		for (; idx < min(maxPoly, chrdNotes.length); idx++)
			chr += wave(tone * 2 ** ((chrdNotes[idx] + trnsp) / 12));
		return maxPoly ? chr / maxPoly : 0;
	};

	/* song progression */
	prog = (str = "", spd = 0) => {if (str === " ") return 0; return str[ts >> spd] | 0};
	let kProg = prog("000011112000111120000", 19); /*   kick    */
	let sProg = prog("000011110001111100000", 19); /*   snare   */
	let hProg = prog("000111110001111100000", 19); /*    hat    */
	let mProg = prog("111111111111111111110", 19); /*   melody  */
	let cProg = prog("001111110111111111110", 19); /*  chords   */
	let rProg = prog("000100000001000000000", 19); /*   riser   */
	let iProg = prog("100000001000000010001", 19); /*  impact   */
	let dProg = prog("000000001000000000001", 19); /* bass drop */
	let gProg = prog("000011110111111111110", 19); /* signature */
	let bProg = prog("01110111100", 20);           /*   bass    */
	let pProg = prog("00000111100", 20);           /*   percs   */
	let vProg = prog("10001000011", 20);           /*  volume   */
	let fProg = prog("02224222213", 20);           /*   filter  */

	/* instruments/oscillators */
	rnd = () => random() - .5;
	kick = () => bbf(sin(21.97 * log(ts % 4096 + 1) + rnd() * (.995 ** (ts % 4096) + .01) * 2), .05, .125, -1) * (1 - (ts / 4096 % 1) ** 4) *! (ts >> 12 & 3);
	snare = () => (pt = ts % 16384, (bbf(atan(sin((2e7 + pt * 2) * (1 - (1 / (pt * 100 + .1)) * 2) / 60 + rnd() * (.995 ** pt + .01) * 2)) * (1 - (pt / 4096 % 1) ** pi) *! (ts >> 12 & 3), .05, .2, -1) *! ((ts >> 19) == 11) * (ts >> 14 & 1) + (bpf(rnd() * 8 * (1 - ((ts / 32768 + .5) % 1) ** 1) ** 2, .45, .7) / 3) * (1 - (1 - min(1, pt / 4096 % 1) ** 2) ** pi *! (ts >> 12 & 3))));
	hat = () => hpf2(rnd() + sign(sin((t + sin((t / 12 | 0) ** 11)) * pi / 480 * 441)) / 8, .55) * (1 - ts / 4096 % 1) ** 2 * 1.5;
	drop = () => sin(sin(log(ts % 262144 + 4e4) * 1e3) + rnd() / 32) * 10 ** ((1 - ts / 262144 % 1 * 64) / 20) * (1 - (ts / 262144 % 1) ** 2) / 3;

	pwm = (phase, dutyCycle = 0, shapeMode) => phase ? sign((shapeMode ? sin(phase * pi / 128 + 1e-10) : asin(sin(phase * pi / 128 + 1e-10)) / (pi / 2)) - dutyCycle) / 2 + dutyCycle / 2 : 0;
	saw = (phase) => atan(tan(phase * pi / 256 + 1e-10)) / (pi / 2);
	rsaw = (phase) => (saw(phase * 2) + saw(phase * 120 / 64)) / 2.65;
	sinc = (phase) => sin(sin(phase * pi / 128) + sin(phase * pi / 32) / 8);
	bell = (phase, decay = 1) => ((sinc(phase) * decay + sinc(phase * 3.99) / 2 * decay ** 2 + sinc(phase * 10.025) / 3 * decay ** 3 + sinc(phase * 17.955) / 4 * decay ** 4) / 1.75 || 0);

	melody = (phase) => pwm(phase, sin(ts / 1e4 * 3) / 2);
	det = (lr, det) => lr ? 1 + det : 1 - det;
	detune = (lr) => ts >> 19 > 15 ? 1 : vProg ? 1 : det(lr, .005),
	chords = () => chrd(tt, cSeq, 0, i => saw(i / 4)) * 4;
	bass = (phase, lr) => saw(phase / (lr ? 32.08 : 31.92)) / 2 + saw(phase / 16) + saw(phase / (lr ? 8.04 : 7.96)) / 2;

	/* automations/envelopes */
	let kEnv = ts >> 14 & 31 *! (kProg & 1);
	let riser = (t % (spb * 16)) / sr * 256 * 600 * (1 + (ts % 262144) / 1e6);
	let iEnv = (1 - ts / 2 ** 18 % 1) ** 2;
	let pEnv = (1 - ts / 32768 % 1) ** 2
	if (fProg == 0) {
		filter += (ts / 2 ** 20 % 1) ** 1.25 /* intro */
	} else if (fProg == 1) {
		filter +=  (1 - (ts / 2 ** 20 % 1) ** 3) * .85 + .15 /* outro */
	} else if (fProg == 2) {
		filter += 1
	} else if (fProg == 3) {
		filter += .15 /* ending window */
	} else if (fProg == 4) {
		filter += .75 /* break */
	} else 0;
	let sc = kProg ? min(1, ts / 16384 % (1 + 31 * (kProg == 2)) * pi * .75 + .25) ** pi : 1;
	let end = ((ts >> 20) >= 10 ? (1 - min(1, ts / 2 ** 18 % 2)) ** 4 : 1) *! ((ts >> 20) >= 11);

	master = lr => tanh(lpf(lpr(((kick(lr) *! kEnv *!! kProg + snare(lr) * sProg + hat(lr) * hProg) * 2 + (dly(hpf(bpf(melody(mSeq * detune(lr)), .2, .75) * 1.2 + lpf2(bell(mSeq * detune(lr), exp(-ts % 4096 / 6e3)), .9), .001) * min(1, abs(sin(ts * PI / 4096)) * 24) * mProg + bell(gSeq * detune(lr), exp(-ts % 4096 / 4e3)) * 1.25 * gProg + bpf(chords(), .5, .25) * 1.75 * cProg, rvrbHeads[lr], .5 - (ts >> 19 >= 15 ? 0 : vProg) / 4, x => tanh(bpf(x, .1, .95) / 160) * 100) * 1.45 + bpf(sin((t / 2 * (lr ? 1.005 : .995) | ~ts >> 13 & 7) ** 4 * 2), .2, .9) * 1.2 * pEnv * pProg + lpf(bass(bSeq, lr), .01 + (1 - ts / 4096 % 1) ** 2 * .45) * bProg) * sc * 1.1 + rsaw(riser) * rProg * (ts >> 18 & 1)) * gain(-vProg * 8), filter ** 1.65, (1 - filter) ** .5 * .25), .9) * gain(-4) * end + (lpr(hpf(rnd(), .1), iEnv ** pi * .95 + .025, .6) * iEnv * (1 - (1 - iProg ** 2)) / 5 * (1 + !vProg * 2.5) + drop() * dProg) *! (ts >> 18 & 1) * sc);
	return [master(0), master(1)];
})()