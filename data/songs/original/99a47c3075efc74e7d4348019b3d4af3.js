// "Hide (KORG M1 Version)" by PrincessPriscillaPT | Nov 8, 2025 | Floatbeat - 48000 Hz
// Cover of "Dorian Concept - Hide (CS01 Version)"

BPM=100,sampleRate=48e3,r=abs(t/sampleRate/180*3*32768*BPM)/2,
m=midiNote=(note,transpose)=>(t/sampleRate*256)*432*2**((note-69+transpose)/12)*(note>-1?note<128?1:0:0)||0,

// What you're seeing here is Feeshbread's Dead Data Reverb code.
t||(
	wsin=phase=>(-cos(phase/128*PI)+1)*128-.5,
	fx=[],dMax=1e6,
	lpf=lowPassFilter=(a,c)=>(
		lp_fxii=fxi++,
		fx[lp_fxii]??=0,
		fx[lp_fxii]+=(a-fx[lp_fxii])*c
	),
	hpf=highPassFilter=(a,c)=>a-lpf(a,c),
	bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),
	dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{
		dly_fxii=fxi++;
		fx[dly_fxii]??=Array(dMax).fill(0);
		dly_wi=dt%dMax;
		dly_feed=audio;
		dly_out=0;
		for(let head of heads){
			dly_ri=(dMax+dt-round(head.t))%dMax;
			dly_feed+=fx[dly_fxii][dly_ri]*head.fb;
			dly_out+=fx[dly_fxii][dly_ri]*head.m;
		}fx[dly_fxii][dly_wi]=fbfn(dly_feed);
		return audio*(1-dw)+dly_out*dw
	}
),fxi=0,dt=t,q=(30*sampleRate)/(BPM*2/3),
rvrbHeads=
[
	[
		{t:1e3+wsin(t/210),m:.6,fb:.3},
		{t:1e4+wsin(t/250),m:.5,fb:.5},
		{t:17e3+wsin(t/300),m:.3,fb:.7},
		{t:37e3+wsin(t/380),m:.2,fb:.9},
		{t:q*1.005+wsin(t*1.005/256),m:1,fb:.75}
	],[
		{t:11e2-wsin(t/230),m:.6,fb:.3},
		{t:13e3-wsin(t/270),m:.5,fb:.5},
		{t:14e3-wsin(t/280),m:.3,fb:.7},
		{t:4e4-wsin(t/400),m:.2,fb:.9},
		{t:q*.995-wsin(t*.995/256),m:1,fb:.75}
	]
],

// Korg M1 - Patch 17 - PercOrgan
percOrgan=(a,j)=>(asin(sin(a))/asin(1)+sin(a*2)+sin(a*3)+sin(a*j*6)+sin(a*j)/2)*((1-r/4096%1)**4/2+1)*min(1,abs(sin(r*PI/4096))*32)+bpf(random()-.5,.2,.5)*(1-r/4096%1)**20*(a?1:0)*1.5,
bell=a=>sin(sin(a)+sin(a*6)),

// Progression: F#m — A — C#m — B — E
melo=m([43,50,53,57,58,60,65,46,53,57,62,65,67,69,65,62,50,57,60,64,65,67,72,53,60,64,74,72,70,69,65,62][r>>12&31],-1),
bass=m([31,31,31,31,31,31,31,34,34,34,34,34,34,34,34,34,38,38,38,38,38,38,38,36,36,36,36,36,36,36,36,36,
	  31,31,31,31,31,31,31,34,34,34,34,34,34,34,34,34,38,38,38,38,38,38,38,36,36,36,36,36,41,41,41,41][r>>12&63],-1),

master=j=>bpf(percOrgan(melo*PI/128,j)/2,.01,.8)/4+(tanh(2*sin(bass*PI/128+sin(bass*PI/128)))+bell(melo*PI/64)/4*(1-r/4096%1)**.5)*min(1,abs(sin(r*PI/4096))*32)/2*!!(r>>18),

[dly(master(1.005),rvrbHeads[0],.4,x=>tanh(bpf(x,.01,.8)/200)*100),dly(master(.995),rvrbHeads[1],.4,x=>tanh(bpf(x,.01,.8)/200)*100)]