// what you're looking at is feeshbread's Dead Data reverb and filters

t || (

wsin = phase => (- cos(phase / 128 * PI) + 1) * 128 - .5,

fx = [],

dMax = 1e6,

lpf = (audio, cutoff) => (lp_fxii = fxi ++, fx[lp_fxii] ??= 0, fx[lp_fxii] += (audio - fx[lp_fxii]) * cutoff),

hpf = (audio, cutoff) => audio - lpf(audio, cutoff),

bpf = (audio, highcutoff, lowcutoff) => hpf(lpf(audio, lowcutoff), highcutoff),

dly = (audio, heads, dw, fbfn = x => x) => {

	dly_fxii = fxi ++;
	
	fx[dly_fxii] ??= Array(dMax).fill(0);

	dly_wi = dt % dMax;

	dly_feed = audio;

	dly_out = 0;

	for (let head of heads) 
	
	{

		dly_ri = (dMax + dt - round(head.t)) % dMax;
		dly_feed += fx[dly_fxii][dly_ri] * head.fb;
		dly_out += fx[dly_fxii][dly_ri] * head.m;
	
	} 
	
	fx[dly_fxii][dly_wi] = fbfn(dly_feed);

	return audio * (1 - dw) + dly_out * dw;
	
	}
),

fxi = 0,

dt = t,

rvrbHeads = [
	[{t: 1000 + wsin(t / 210), m: .5, fb: .15},
	 {t: 10e3 + wsin(t / 250), m: .5, fb: .35},
	 {t: 17e3 + wsin(t / 300), m: .1, fb: .45},
	 {t: 37e3 + wsin(t / 380), m: .1, fb: .65}],
	[{t: 11e2 + wsin(t / 230), m: .5, fb: .15},
	 {t: 13e3 + wsin(t / 270), m: .5, fb: .35},
	 {t: 14e3 + wsin(t / 280), m: .1, fb: .45},
	 {t: 40e3 + wsin(t / 400), m: .1, fb: .65}]],

t *= 44100 / 48e3,
t *= 47412 / 48e3,

	lr = lr => (

		bpf(sin(cos(sin(t / 64 * (([8, 10, 9, 7.5, 8, 6.75, 7.5, 9][t >> 17 & 7] * 2) / 12)) * 2) * 4), .09, t < 1048576 ? abs(t / 65536 % 16) / 10 : 1.6) / 3 +
	
		(t > 1048576) * sin(cos(sin(t / 64 * (([8, 6, 6.75, 7.5][t >> 18 & 3] / 2) / 12)) * 4) * 2) / 4 +

		(t > 2097152) * hpf(tan(cos(sin(t / 64 * (([8, 7.5, 6.75, 5.75][t >> 18 & 3]) / 12)) * 8)) / 4, .4) * 10 + 

		(t > 4194304) * sin(cos(sin(t / 8 * (([8, 7.5, 6.75, 9][t >> 18 & 3] / 2) / 12)) * 5)) / 4 +

		lpf(lpf(random() - random(), t < 1048576 ? abs(t / 65536 % 16) / 10 : 1.6), .02) / 1.5

),
	[dly(lr(-.1), rvrbHeads[0], 1, x => tanh(bpf(x, .01, .1) / 50) * 50), 
	 dly(lr( .1), rvrbHeads[1], 1, x => tanh(bpf(x, .01, .1) / 50) * 50)]