/*!
 *    •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · Canterlot to the Cosmos ♪
 *    •───────────────•°•❀•°•───────────────•
 */

t || (fx = []), fxi = 0,
lpf = (inp, cut) => (
	lpf_fxii = fxi++,
	fi = fx[lpf_fxii] ??= {f0: 0},
	fi.f0 += (inp - fi.f0) * cut
),
hpf = (inp, cut) => inp - lpf(inp, cut),
bpf = (inp, hcut, lcut) => hpf(lpf(inp, lcut), hcut),

att = a => (
	att_fxii = fxi++,
	fx[att_fxii] ||= 0,
	fx[att_fxii] += a / max(1, t)
),

this.buf ??= {}, buf = this.buf,
cosp = (a, b, m) => {
	mu = (1 - cos(m * PI)) * .5;
	return a * (1 - m) + b * m;
},
wsin = (phase) => (-cos(phase / 256 * PI) + 1) * 128 - .5,
	/* delay/reverb with tail continuity */
dMax = 1e5,
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
},

dlyfxi = 0,
this.delayClock ??= 0,
dt = this.delayClock++, /* persistent delay clock */
pi = PI,

	/* track settings */
bpm = 100,
sr = 48e3,
spb = (60 / bpm) * sr,
sec = t / sr,
ts = sec * (bpm / 60) * 16384,
tt = sec * 432 * 2 ** (-8 / 12),
gain = (dB = 0) => 10 ** (dB / 20),

	/* reverb heads */
rt = this.delayClock ?? 0,
rvrbHeads = [[
	{t: 600 + sin(rt / 8e3) * 40, m: 1, fb: 0},
	{t: 5e3 + wsin(rt / 180), m: .6, fb: .3},
	{t: 1e4 + wsin(rt / 300), m: .5, fb: .5},
	{t: 19e3 + wsin(rt / 380), m: .3, fb: .7},
	{t: 35e3 + wsin(rt / 420), m:.2, fb: .9},
	{t: spb / 3.99 * 3 + sin(rt / 35e3) * 175, m: .75, fb: .75}
],[
	{t: 600 + cos(rt / 8e3) * 40, m: 1, fb: 0},
	{t: 11e2 + wsin(rt / 200), m: .6, fb: .3},
	{t: 13e3 + wsin(rt / 320), m: .5, fb: .5},
	{t: 14e3 + wsin(rt / 320), m: .3, fb: .7},
	{t: 4e4 + wsin(rt / 450), m: .2, fb: .9},
	{t: spb / 4.01 * 3 + cos(rt / 35e3) * 175, m: .75, fb: .75}
]],

f = min(1, t / 5e5), rnd = random, dec = (1 - ts / 8192 % 1),

	/* sequences */
arp = tt * 2 ** (parseInt("cfmhfhcfmhfecfmhfhcjmrqj8fmhfe8fmfmhafmqmjhmqrqo"[(ts >> 13) % 48], 36) / 12),
mel = tt * 2 * 2 ** (parseInt("c  f ej  hfea  f eh  hfef     c   efe    ca     h  feca    ca ca7ca fejjj hf ef   fhj   kjh"[(ts >> 13) % 96], 36) / 12),
bas = att(tt / 4 * 2 ** (parseInt("cc8acc8acf8a578a"[(ts / 3 >> 15 & 7) + !!(ts / 3 >> 18) * 8], 16) / 12) * (1 + (ts / 3 >> 19 ? ts / 3 >> 13 & 1 : 0))),
chrNotes = [[0, 3, 7, 10], [-2, 3, 7, 10], [-4, 3, 7, 10], [-2, 2, 5, 10]],

	/* chord function */
chrd = chord = (tone = t, note = [[0]], trnsp = 0, wave = input => input / 128 % 2 - 1) => {
   let idx = chr = 0
   let poly = 4
   for (; idx < min(poly, note.length); idx++)
      chr += wave(tone * 2 ** ((note[idx] + trnsp) / 12))
   return poly ? chr / poly : 0
},

wv = t => sin(sin(t * PI + sin(t * PI * 5)) + sin(t * PI * 2) * dec ** 2 + sin(t * PI * 3.002) * dec ** 3 + sin(t * PI * 4.997) * dec ** 5 + sin(t * PI * 7.007) * dec ** 7) * abs(sin(ts * PI / 8192 + .5)) ** 2,
bel = t => (sin(t * PI) + sin(t * PI * 4) * dec / 2 + sin(t * PI * 10) * dec ** 2 / 3 + sin(t * PI * 18) * dec ** 3 / 4) * .99975 ** (ts % 8192) || 0,

x = lr => tanh(dly(lpf(bpf((chrd(tt * 2, chrNotes[ts / 3 >> 15 & 3], 0, inp => sin(inp * PI + sin(inp * PI) / 2) + sin(inp * PI * 2 + sin(inp * PI * 2) / 2) / 2) *!! (ts / 3 >> 17)) * ((ts / 3 >> 13 & 31) < 30 || (ts / 3 >> 13 & 31) > 31) + wv(arp) *! (ts / 3 >> 19 & 1), .025, .1) + bel(mel) * (ts / 3 >> 18 & 1), f ** 2 * .45 + .05) * (1 - (1 - f) ** 5) + bpf((((t * t / 4096 | ts / 12) & 255) - (ts / 24 & 127)) / 128 - 1, .25, .25) / 2 * f ** 2, rvrbHeads[lr], (1 - f ** 2) * .35 + .65, x => tanh(bpf(x, .02, .6) / 200) * 100) / 2 + cos(sqrt(bas * 128 % 256) * PI / 8) *!! (ts / 3 >> 18) / 7 * ((ts / 3 >> 13 & 31) < 30 || (ts / 3 >> 13 & 31) > 31)) * (sin(t / 2e5 + (lr ? PI / 2 : 0)) ** 2 * .35 + .65) + lpf(rnd() - rnd(), min(abs(sin(t / 3e5 * (lr ? .995 : 1.005))), .25)) / 8,

[x(0), x(1)]