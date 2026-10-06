/*!
 *      •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · Echoes of the Crystal Heart ♪
 *      •───────────────•°•❀•°•───────────────•
 */

t || (fx = [],

	/* filters */
	lpf = (inp, cut) => (
		lpf_fxii = fxi++,
		fi = fx[lpf_fxii] ??= {f0: 0},
		fi.f0 += (inp - fi.f0) * cut
	),
	hpf = (inp, cut) => inp - lpf(inp, cut),
	bpf = (inp, hcut, lcut) => hpf(lpf(inp, lcut), hcut),

	/* cosine interpolation */
	cosp = (a, b, m) => {
		mu = (1 - cos(m * PI)) * .5;
		return a * (1 - mu) + b * mu;
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
	}
),
fxi = 0,
this.buf ??= {}, buf = this.buf, dlyfxi = 0,
/* --- persistent delay clock --- */ 
this.delayClock ??= 0,
dt = this.delayClock++,

	/* track settings */
bpm = 110,
sr = 48e3,
spb = (60 / bpm) * sr,
sec = t / sr,
ts = sec * (bpm / 60) * 16384,
/* --- track delay --- */
v = ts - 262144, T = v > 0 ? v : null,
_t = t,
tt = sec * 440 * 2 ** (5 / 12),
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

	/* shorthands */
pi = Math.PI,
tau = 2 * Math.PI,
S = Math.sin,

	/* tools */
n = x => 2 ** (x / 12),
b36 = x => parseInt(x, 36),
dec = (t, l, e = 1) => l > 0 ? (1 - t / 2 ** l % 1) ** e * min(1, abs(S(t * pi / 2 ** l)) * 2 ** l / 128) : 1,
dec2 = (t, l, e = 1) => l > 0 ? e ** (t % 2 ** l) * min(1, abs(S(t * pi / 2 ** l)) * 2 ** l / 128) : 1,

	/* waveforms */
t || (
/* --- cosine-sqrt --- */
	s = (t, l = -1, e = 1) => cos(sqrt(t * 256 % 256) * PI / 8) * dec2(ts, l, e) || 0,
/* --- fm piano --- */
	p = (t, l = -1, e = 1) => S(t * tau + S(t * tau + S(_t / 6e3)) / 2) * dec2(ts, l, e) || 0,
/* --- bell --- */
	b = (t, l = -1) => S(t * tau) * dec2(ts, l, .99995) + S(t * tau * 6) * dec2(ts, l, .99965) / 2 + S(t * tau * 10) * dec2(ts, l, .99935) / 4 + S(t * tau * 18) * dec2(ts, l, .99915) / 8 || 0
),

	/* sequencers */
mel1 = "02702702"[T >> 13 & 15],
mel2 = "0_4_5__40_4_2__4"[T >> 14 & 15],

lead = "47c___e_gc7"[T >> 14 & 31],
lead2 = "7777775422222222__7755440000222244444444"[T >> 13 & 63],
lEnv = ((T >> 19 & 3) / 3 | 0 ? "221033330111222244444444" [T >> 14 & 31] : 1) | 0,

arp = "0247bcegjnonjgecb742"[(T >> 11) % 20],

bass = "________________000000000000000004550422045504225555557700000000"[(T >> 15 & 63)],
bEnv = "00000000222222220101010122112222"[(T >> 16 & 31)] | 0,

	/* mastering */
out = lr =>
dly(
/* --- string accents --- */
(s(tt) + s(tt * n(7)) + s(tt * 2)) / 128 * min(1, t / 5e5)
+ (0
/* --- melody --- */
+ hpf(p(tt * 2 ** (mel1 / 12), 13, .9998) + p(tt * 2 ** (mel2 / 12) / 2, 14, .9998), .05) / 4
/* --- arpeggio --- */
+ s(tt * 2 ** (b36(arp) / 12), 11, .9997) / 32 * min(1, abs(sin(T * PI / 262144))) * (T >> 18 & 1)
/* --- lead --- */
+ b(tt * n(b36((T >> 19 & 3) / 3 | 0 ? lead2 : lead)), 13 + lEnv) / 8 *!! (T >> 19 & 3)
) *!! T
, rvrbHeads[lr], .45, x => tanh(bpf(x, .01, .8) / 180) * 100) * 1.5
/* --- bass --- */
+ s(tt * n(bass) / 8, 15 + bEnv, .99995) / 8 *!! T *!! (T >> 19 & 3)
,

	/* output */
[out(0), out(1)]