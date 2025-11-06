// Update on Oct 12, 2025 - Drums Revamp, Stereo Detuning, More Filters, Bitcrushed Noise

BPM=128,
sR=48e3,
sPB=32768,
tt=(t/sR*256)*440*2**(3/12),
ts=t*abs(BPM/(60*sR)*sPB),

t||(fx=[],[fxLPR1,fxLPR2]=[[],[]],fxrnd=[]),fxi=0,fxiLPR=0,fxirnd=0,
lpf=lowPassFilter=(a,c)=>(
	lp_fxii=fxi++,
	fx[lp_fxii]??=0,
	fx[lp_fxii]+=(a-fx[lp_fxii])*c
),
hpf=highPassFilter=(a,c)=>a-lpf(a,c),
bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),
nof=notchFilter=(a,lc,hc)=>(hpf(a, hc)+lpf(a,lc))/1.75,
lbf=lowBoostFilter=(a,c,v)=>a+lpf(a,c)*v,
hbf=highBoostFilter=(a,c,v)=>a+hpf(a,c)*v,
bbf=bandBoostFilter=(a,hc,lc,v)=>a+bpf(a,hc,lc)*v,

lpr=lowPassResonance=(a,c,r)=>(
	lpr_fxii=fxiLPR++,
	fxLPR1[lpr_fxii]??=fxLPR2[lpr_fxii]??=0,
	fxLPR1[lpr_fxii]+=(a-fxLPR1[lpr_fxii]+(r+r/((1+.1e-9)-c))*(fxLPR1[lpr_fxii]-fxLPR2[lpr_fxii]))*c,
	fxLPR2[lpr_fxii]+=(fxLPR1[lpr_fxii]-fxLPR2[lpr_fxii])*c
),
hpr=highPassResonance=(a,c,r)=>a-lpr(a,c,r),
bpr=bandPassResonance=(a,hc,lc,r)=>hpr(lpr(a,lc,r),hc,r),

bcn=bitCrushNoise=(time,res)=>(
	rnd_fxii=fxirnd++,
	fxrnd[rnd_fxii]??=0,
	fxrnd[rnd_fxii]=
	res<1?
		(time?fxrnd[rnd_fxii]:fxrnd[rnd_fxii]=random()-.5):
		(((time/res|0)!=((time-1)/res|0))?fxrnd[rnd_fxii]=random()-.5:fxrnd[rnd_fxii])
),

a=()=>{
	v=[0,0];

	gen=(detune)=>{
		let a=0;bass=0;
		for (let i=0;i<12;i++){
			let chordTone=[0,((ts>>16&3)==0?4:3),5,((ts>>16&3)==3?8:9)][i&3]
											+[-4,-2,-5,0][ts>>16&3]-5;

			let octave=2**~~(i/4);
			let base=tt*pow(2,chordTone/12-1)*octave*detune;

			a+=((base/128)%2-1)/2*0.05**(ts/(8192*(1+2*i))%1)*2
				*min(1,(ts/16384)%2)**2*(1-ts%8192/2e4);

			bass+=atan(tan(tt*2**([-4,-2,-5,0][ts>>16&3]/12-3)*PI/256))/12*min(1,(ts/16384)%2)**2*(1-ts%8192/15e3);
			bass+=hpf(atan(tan(tt*2*detune*2**([-4,-2,-5,0][ts>>16&3]/12-3)*PI/256))/12*min(1,(ts/16384)%2)**2*(1-ts%8192/15e3),.02);
		}
		return a; return bass;
	};

	v[0]=gen(1.005)+bbf(1.5*lpf(bass,(1-ts/8192%1)**2*.3+.02),.01,.2,-.5)*1.25;
	v[1]=gen(.995)+bbf(1.5*lpf(bass,(1-ts/8192%1)**2*.3+.02),.01,.2,-.5)*1.25;

	b=()=>{
		let kick=_=>(sin(sin(6*(ts%16384)**.333))*1.28*4+(random()-.5)/4)*(1-ts/8192%1)*!(ts>>13&7);
		let snare=_=>(sin(sin(18*sqrt(ts%32768)**.5))*1.28*4*(1-ts/32768%1)**6*min(1,abs(sin(ts*PI/32768)*256))+bpr(bcn(t,2.6)*(1-ts/32768%1)**3,.15,.6,.4)/1.5*10*min(1,(ts/16384)%2)*2)*(ts>>15&1);
		let hat=_=>bpr(random()-.5,.7,.9,.5)*(1-ts/16384%1)**4*(10/3)*(ts>>14&1);
		v[0]=lbf(nof(atan((v[0]+bbf(kick()+snare()+hat(),.025,.2,-.75)*1.25)/1.25)/1.25,.013,.04),.05,.5)*1.75;
		v[1]=lbf(nof(atan((v[1]+bbf(kick()+snare()+hat(),.025,.2,-.75)*1.25)/1.25)/1.25,.013,.04),.05,.5)*1.75;
		return v;
	};

	b();
	return v;
},

a()