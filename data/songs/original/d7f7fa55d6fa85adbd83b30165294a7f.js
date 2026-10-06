t || (fx = [], dlayfx = []), fxi = 0, dlayfxi = 0,
wsin = phase => (- cos(phase / 256 * PI) + 1) * 128 - .5,
dt = t, dlayMax = rvrbMax = 1e6,

// What you're seeing here is feeshbread's Dead Data Reverb code.
lpf = lowPassFilter = (a, c) => (
	lp_fxii = fxi ++,
	fx[lp_fxii] ??= 0,
	fx[lp_fxii] += (a - fx[lp_fxii]) * c
),
hpf = highPassFilter = (a, c) => a - lpf(a, c),
bpf = bandPassFilter = (a, hc, lc) => hpf(lpf(a, lc), hc),
rvrb = multiTapReverb = (audio, heads, dw, fbfn = x => x)=>{
	rvrb_fxii = fxi ++;
	fx[rvrb_fxii] ??= new Float32Array(rvrbMax);
	rvrb_wi = dt % rvrbMax;
	rvrb_feed = audio;
	rvrb_out = 0;
	for(let head of heads){
		rvrb_ri = (rvrbMax + dt - round(head.t)) % rvrbMax;
		rvrb_feed += fx[rvrb_fxii] [rvrb_ri] * head.fb;
		rvrb_out += fx[rvrb_fxii] [rvrb_ri] * head.m
	} fx[rvrb_fxii] [rvrb_wi] = fbfn(rvrb_feed);
	return audio * (1 - dw) + rvrb_out * dw},
rvrbHeads = [[
	{t:1e3 + wsin(t / 180), m:.6, fb:.3},
	{t:1e4 + wsin(t / 300), m:.5, fb:.5},
	{t:17e3 + wsin(t / 380), m:.3, fb:.7},
	{t:37e3 + wsin(t / 420), m:.2, fb:.9}
],[
	{t:11e2 + wsin(t / 200), m:.6, fb:.3},
	{t:13e3 + wsin(t / 320), m:.5, fb:.5},
	{t:14e3 + wsin(t / 330), m:.3, fb:.7},
	{t:4e4 + wsin(t / 450), m:.2, fb:.9}
]],

// Delay function from "PriscillaDSP".
dlay = (signal, time, dlayVol = .5, feedback = .5) => (
	dlay_fxii = dlayfxi ++,
	dlayfx[dlay_fxii] ??= {
		buf: new Float32Array(dlayMax),
		idx: 0
	},
	dLength = min(dlayfx[dlay_fxii].buf.length, max(1, time | 0)),
	out = dlayfx[dlay_fxii].buf [dlayfx[dlay_fxii].idx],
	dlayfx[dlay_fxii].buf[dlayfx[dlay_fxii].idx] = signal + out * feedback,
	dlayfx[dlay_fxii].idx = (dlayfx[dlay_fxii].idx + 1) % round(dLength),
	mix = min(1, max(0, dlayVol)),
	signal + out * mix
),

ji = justIntonation = (n, tr = 0) => (
	ratios = [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 45 / 32, 3 / 2, 8 / 5, 5 / 3, 16 / 9, 15 / 8],
	note = ((floor(n) % 12) + 12) % 12,
	transpose=((floor(tr) % 12) + 12) % 12,
	octave=floor(n / 12) + floor(tr / 12),
	ratios[note] * 2 ** octave * ratios[transpose]
),
tet12 = twelveEqualTemperament = (note, transpose = 0) => 2 ** ((note + transpose) / 12),

speed = (bpm, sr, spb) => t * abs(bpm / (sr * 60) * spb),
tune = (sr, freq, trsp = 0) => (t / sr * 256) * freq * 2 ** (trsp / 12),
dLen = delayLength = (sr, bpm, rhy = 1 / 4) => round((30 * sr) / (bpm / rhy / 2)),
ts = speed(bpm = 95, sr = 48e3, 16384),
tt = tune(sr, 440, -6),
midiNote = x => tt * 2 ** ((x - 69) / 12) * ( x >- 1 ? x < 128 ? 1 : 0 : 0),
wv = waveTable = (wave = '', tone) => (
	wLen = wave.length,
	nums = wave.split('').map(c => parseInt(c, 36)),
	mean = nums.reduce((s, n) => s + n, 0) / nums.length,
	maxAbs = max(...nums .map(n => abs(n - mean))) || 1,
	tone > 0 ? (nums[(tone * wLen >> 8) % wLen] - mean) / maxAbs : 0
),
pwm=(t,l,m)=>t?(sign((m?asin(sin(t*PI/128))/asin(1):sin(t*PI/128))-l)/2+l/2):0,

x=(d,h)=>(
mel=(e=a=>pwm(((tt+(h?cos:sin)(ts*PI/8192)*32)*a*tet12([3,3,3,3,3,3,3,3,,,,,,,,,,,,,,,,,,,,,,,,,5,5,5,5,5,5,5,5,7,7,7,7,,,,,8,8,8,8,8,8,,,10,10,8,8,7,7,,,3,3,3,3,3,3,,,,,,,8,10,10,10,8,8,8,8,7,7,7,7,5,5,,,3,3,3,3,2,2,2,2,,,8,8,8,8,,,7,7,7,7,11,11,11,11,17,19,19,19,15,17,17,17,15,15,15,15,14,14,14,14,,,10,10,10,10,,,7,7,7,7,7,7,7,7,,,,,3,3,3,3,5,5,5,5,6,6,6,6,,,,,12,12,12,12,10,10,10,10,,,,,14,15,15,15,15,15,15,15,,,,,8,8,8,8,8,8,8,8,,,,,,,,,,,,,3,3,3,3,8,8,8,8,10,10,10,10,11,11,11,11,,,,,10,10,10,10,8,8,8,8,,,,,10,10,10,10,,,,,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,,,,,,,,,,,,,,7,7,5,5,4,4,4,4,4,4,,,5,5,,,7,7,7,7,,,,,0,0,0,0,,,,,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,,,,,,,,,,,5,5,5,5,3,3,3,3,2,2,2,2,,,,,3,3,3,3,,,,,5,7,7,7,,,,,5,5,5,5,7,7,5,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3][ts>>11],-3)),sin(ts*PI/16384)*.75,1)/2,e(1)+e(2*d)/2+e(4*d)/4+e(6*d)/6)*1.675,

Melody=dlay(mel,dLen(sr,bpm,3/4)*d,.5,.6),

Kick=tanh(sin(6*sqrt(ts%4096)**.6)*!(ts>>12&15))*(1-ts%4096+4096)/5e3,

Snare=(tanh(sin(asin(sin(8*cbrt(ts%4096)))))+(((t*sin(t*5*d>>4))&255)/255-.5)*cbrt(-ts%4096+250)/20)*(1-ts%4096+4096)/5e3*'00001000'[ts>>12&7],

cho=(
c=Ch=>(Ss=(tt+2**27+(h?cos:sin)(ts*d*PI/2e4)*256)/2*tet12(Ch[ts>>16],-3)||0,((((Ss*d%127+Ss*d%127.5+Ss%128+Ss*d%128.5+Ss*d%129)-(128*2.5))+((Ss*d%255+Ss%256+Ss*d%257)-(256*1.5))/3)/4)+((((Ss*2.005*d&127)+16)&128)+(((Ss*1.99*d&127)+16)&128)-32)/4),cho=(((c([-9,-7,-9,-9,-9,-9,-9,-7,-9,-8,-7,-4,-9,-10])+c([-4,-4,-5,-5,-5,-5,-4,-4,-5,-5,-4,-1,-5,-5])+c([0,-1,-2,-1,0,1,0,-1,-2,0,0,3,-2,-2])+c([3,5,3,3,3,3,3,3,3,4,5,ts>>15&1?7:5,3,2]))/128))*((ts+131072)>>20<1)),Chords=-lpf(dlay(cho,dLen(sr,bpm,3/4)*d,.5,.6),.33),

b=((tt*tet12([8,8,3,[2,7][ts>>15&1],[0,0,0,0,0,0,0,-1][ts>>13&7],[-2,3][ts>>15&1]][ts>>16],-3)/4)||0),Bass=bpf(atan(10*((((((((sin(sin(cos(((b*d*PI/129)))))/4+sin(cos(cos(((b*PI/128)))))-0.7)+sin(b*d*PI/127)/4)+sin(b*d*PI/130)/4)/2+sin(b*PI/131)/4)+sin((b*PI/128)/128)/4)+sin(b*PI/252)/4)/1.2)+(sin(b*PI/256)/4)+sin(b*PI/260)/4)),.005,.05)/PI*3*(b?1:0),

Arpeggio=lpf((Ap1=d*tet12([[0,3,7,12],[-1,3,7,11]][ts>>16&1][ts>>12&3],-3)/2,(((tt*Ap1&255)/256-.5)/((ts%4096)+512)+((tt*Ap1*8&255)/256-.5)/((ts%4096)+128)/3)*1200),.33),

(rvrb((Melody+Chords/1.25),rvrbHeads[h],.5,x=>tanh(bpf(x,.01,.8)/200)*100)*2+Bass+(Kick+Snare)*(ts<2**17)*3+Arpeggio*(ts<2**17))/2*!(ts>>20)
)/1.125/2,[x(1.005,0)+x(1.01,0),x(.995,1)+x(.99,1)]