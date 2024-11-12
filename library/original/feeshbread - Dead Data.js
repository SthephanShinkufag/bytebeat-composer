t?0:(
	{u,p,w}=(()=>{
		const 
		avg=ar=>{
			let sum = 0;
			for (n of ar) sum += n;
			return sum / ar.length;
		},
	
		ph=(c)=>pt*2**(c/12),
		sq=(sz,ln,sp)=>parseInt(sz[(r>>sp)%ln],36),
		sph=(sz,ln,sp)=>ph(sq(sz,ln,sp)),
		
		sin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,
		saw=(phase)=>-phase&255,
		tri=(phase)=>256-abs(saw(phase)*2-256)-.5,
		pws=(phase,pw=.5)=>(saw(phase)>pw*255)*255,
		pwt=(phase,pw=.5)=>(tri(phase)>pw*255)*255
		return {u:{avg,sq},p:{ph,sph},w:{sin,saw,tri,pws,pwt}}
	})(),

	fx=[],
	
	lpf=lowPassFilter=(a,c)=>(
		lp_fxii=fxi++,
		fx[lp_fxii]??=0,
		fx[lp_fxii]+=(a-fx[lp_fxii])*c
	),
	hpf=highPassFilter=(a,c)=>a-lpf(a,c),
	bpf=bandPassFilter=(a,hc, lc)=>hpf(lpf(a,lc), hc),
	nf=notchFilter=(a,lc, hc)=>(hpf(a, hc)+lpf(a,lc)),
	lbf=lowBoostFilter=(a,c,v)=>a+lpf(a,c)*v,
	hbf=highBoostFilter=(a,c,v)=>a+hpf(a,c)*v,
	
	alpf=asyncLowPassFilter=(a,cu,cd)=>(
		alp_fxii=fxi++,
		fx[alp_fxii]??=0,
		alp_r = fx[alp_fxii],
		fx[alp_fxii]+=(a-alp_r)*(alp_r<a?cu:cd)
	),
	
	// DELAY 
	dMax=1e6,
	// heads: [{t: 0-dMax, m: 0-1, fb: 0-1},...]
	// t = time, m=direct out mix, fb = feedback mix
	dly=multiTabDelay=(audio, heads, dw, fbfn = x=>x)=>{
		dly_fxii = fxi++;
		fx[dly_fxii] ??= Array(dMax).fill(0);
		dly_wi	= dt%dMax;
		dly_feed = audio;
		dly_out = 0;
		for (let head of heads) {
			dly_ri = (dMax+dt-round(head.t))%dMax;
			dly_feed += fx[dly_fxii][dly_ri] * head.fb;
			dly_out += fx[dly_fxii][dly_ri] * head.m;
		}
		fx[dly_fxii][dly_wi] = fbfn(dly_feed);
		return audio*(1-dw) + dly_out*dw;
	},
	
	cmp=compressor=(a, th, ra, at, rl, sc=a)=>(
		cmp_fxii = fxi++,
		fx[cmp_fxii],
		a/(alpf(max(abs(sc)-th,0), at, rl)/th*ra+1)
	),
	
	mn=(a,mi=-127,ma=127)=>min(max(a,mi),ma),


	//Sequences:
	bseqs	= [
				'aaaaaaaa'+'aaaaaaa6'+'66666666'+'66688888'+'33333333'+'55555555'+'66666666'+'66688888',
				'aaaaaaaa'+'aaaaaaa8'+'aaaaaaaa'+'aaaaaaa8'+'aaaaaaaa'+'aaaaaaa8'+'66666666'+'66688888',
				'aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'
	],

	lseq1		='    haaf'+'f88dd665'+'555 haaf'+'f88ddiha'+'aaa haaf'+'f88dd665'+'555 h88a'+'aaa     ',
	lofseq1	='33330113'+'31133113'+'33330113'+'31133123'+'33330113'+'31133113'+'33330113'+'33333333',

	lseq2		='    haaa'+'a   d888'+'8   c555'+'5  36aah'+'hhh kccc'+'c   haa5'+'56688aad'+'dddccca5',
	lofseq2	='33330111'+'11110111'+'11110111'+'11130113'+'33330111'+'11110113'+'31133113'+'33322212',

	lseqs		= [0,lseq1,lseq2],
	lofseqs		= [0,lofseq1,lofseq2],

	arpseq	='afdfafdf'+'6fdh6fdh'+'3fdf5fdf'+'68di6dfm',

	tofsts=(s)=>(
		s === 0 ? [.5,.0][(r>>13)&1] : 
		s === 1 ? [.25,.75,.5,0,.25,.75,0,.25,.25,.75,.5,0,.25,.75,.5,.25][(r>>12)&15] :
		s === 2 ? [.5,.5,0,0,.5,.5,0,0,.5,.5,0,0,.5,.75,.5,.25][(r>>12)&15] :
		0
	),
	tseqs=(s)=>(
		s === 1 ? [0,0,0,0,0,0,0,1][(r>>16)&7] :
		s === 2 ? [2,0,0,0,0,0,0,0][(r>>16)&7] :
		0
	)
),

fxi=0,
dt=t,

speed=.5,r=(t*speed),
pt=t,

r32=r/4096%1,
r16=r/8192%1,
r8=r/(8192*2)%1,
r4=r/(8192*4)%1,
r2=r/(8192*8)%1,
r2b=r/(8192*8*8)%1,

rvrbHeads=[[
	{t:1e3+w.sin(t/210), m:.5, fb:.15}, 
	{t:1e4+w.sin(t/250), m:.5, fb:.35}, 
	{t:17e3+w.sin(t/300), m:.1, fb:.45}, 
	{t:37e3+w.sin(t/380), m:.1, fb:.65}
],[
	{t:11e2+w.sin(t/230), m:.5, fb:.15}, 
	{t:13e3+w.sin(t/270), m:.5, fb:.35}, 
	{t:14e3+w.sin(t/280), m:.1, fb:.45},
	{t:40e3+w.sin(t/400), m:.1, fb:.65}
]],

chrsHeads=[[
	{t:9e2+w.sin(t/300), m:1, fb:.2},
	{t:17e3+w.sin(t/310), m:.5, fb:.65},
],[
	{t:9e2-w.sin(t/300), m:1, fb:.2},
	{t:16e3+w.sin(t/340), m:.5, fb:.65},
]],

dbheaders = [
	[{t:100+sin(r/8000)*30, fb: -.5, m:1}],
	[{t:100+cos(r/8000)*30, fb: -.5, m:1}]
],

sel=[0,1,1,2,3,4,r2b<.125?6:5,5,7][(r>>19)],
lty=[1,1,2,2,0,1,1,1][sel],
agt=[0,0,0,1,1,0,0,0][sel],
bpg=[1,0,1,1,0,0,1,1][sel],
kgt=[0,1,2,2,1,1,0,1][sel],
ksq=[0,0,0,1,0,0,0,1][sel],
bty=[0,1,0,4,3,3,0,0][sel],
bsq=[0,0,0,1,1,0,0,2][sel],
hty=[0,1,0,0,1,1,0,0][sel],
tty=[1,0,0,0,0,0,2,0][sel],

tfs=tofsts(tseqs(tty)),

bgt=bty===3?mn(r8*40-10,0,1):mn(r8*10-2.5,0,1),

kdmp=kgt>1,
kon=!!kgt,
kgt2=!ksq|(r2b<.02),

lseq=lseqs[lty],
lofseq=lofseqs[lty],

bseq=bseqs[bsq],

biscon=kon&(bty<3)&kgt2,

bph=p.sph(bseq,64,12),
bsaw=w.saw(bph/8),
bsub=(
	.15*bsaw
		*(biscon?bgt*.6+.4:1)
	-.3*cos(bsaw/50)*255
		*(biscon?bgt**4:1)
),
bsOct=4+4*(r8<.5),
bside=lr=>.18*w.pwt(bph/(bsOct+.03*(lr*2-1)), r16*.2),
bEnv=.005+(1-r32)*(bty===1?.5:.0),
bty==2?bEnv=.005+(1-r32*.7)**5*.2:0,

bass=lr=>(mn(lpf(bsub+bside(lr),bEnv),0,255)+30),

lofs=u.sq(lofseq,64,13),
lenv=1-((r/32768-lofs/4)%1),
lph=p.sph(lseq,64,13),

lead=
	.4*(lph&128)*2
		*lenv**3
	+(lph&96)
		*lenv**1.2,
lead=lead*.55*!!lty,
sel===7&r2b>.3?lead=0:0,

arp=w.tri((p.sph(arpseq,32,13)*.5&255)*(3-r16*.1)&(210)),
arp=arp*agt*.1,

hh1env=(1-r16*.55),
hh2env=(1-r32*.9)**2.5,
hihats=()=>hpf(
	+1*(random()*14)
		*hh1env
	+1*(random()*24)
		*hh2env
,.4),

kick=(sin(3000*sqrt(r8)**.6/20))*93
	*(1-r8)**1.4
	*(1-bgt)
	*min(r8*20+.64,1),
ksq?kick=kick*(kgt2):0,
kick = lpf(kick, kdmp?.05:1),

clapenv=(r4)*(1-r8)*(r4>.5),
clap=()=>(
	bpf(random(),.2,.2)
		*180
		*clapenv
),

tomr=((r/16384+tfs)%1),
tom = atan((sin(tomr*(1000*(1-r2))+100*tomr**.02+150*tomr**.4)*10)*(1-tomr)**15)*80,
tom = cmp(tom,20,.5,1,.0002)*2,
sel===6?tom = tanh(tom/8*r8**2)*70:0,
tom = tom*.4,

sc = (
	min(r8*4,1)**2
	*min((1-r8)*200,1)
),
sc = kon?sc:1,
kgt2?0:sc=1,

drumThrsh=kdmp?10+(1-r2b)**2*20:60,
mixDiv=100-10*(bty===3),
fwRev=kon&!ksq,
rvHp=fwRev?.01:.1,
rvMix=fwRev?0.55:1,
dbLp=bty===4?r2b**4*.1+.01:1,

song=(lr)=>(
	__bass = bass(lr)*.93,
	_bass = __bass*(1-r32*.1), 
	bty===4|sel===6?_bass=0:0,
	sel===7?_bass=_bass*max(1-r2b*2,0)**2:0,
	
	_dbass = __bass,
	_dbass = atan((_dbass)/100)*200,
	_dbass = ((_dbass>>1^_dbass)/5+(_dbass>>(bty===4?3:2)^_dbass)/2)-128,
	_dbass = atan((_dbass)/100)*200,
	_dbass = dly(_dbass, dbheaders[lr],bty===4?1:.5, x=>lpf(x,.5)),
	_dbass = hpf(_dbass,.04),
	_dbass = atan((_dbass)/20)*33,
	_dbass = lpf(_dbass, dbLp),
	_dbass = bty>2?_dbass*bgt:0,
	
	_lead = lead,
	_arp = arp,
	
	_chrs = _arp,
	_chrs = dly(_chrs,chrsHeads[lr],.75, x=>tanh(x/200)*200),

	_reverb = _lead + 0.8*_chrs,
	_reverb = dly(_reverb,rvrbHeads[lr],rvMix, x=>tanh(bpf(x,rvHp,.8)/200)*200),
	_reverb = cmp(_reverb,40,.6,.01,.00001)*1.2,
	
	_synths = _bass+ _dbass + _reverb + _chrs,
	_synths = bpf(_synths,bpg?.01:.001,bpg?.2:1),
	_synths = nf(_synths,.02,.06),
	_synths = lbf(_synths,.0085,-.5),
	_synths = cmp(_synths,80,.7,.05,.0004),
	_synths = _synths*sc, 
	
	_clap = clap(),
	_hihats = hihats(),
	_hihats = lpf(_hihats, .5)*1.3,
	
	_drums = kon*kick+hty*(_clap+_hihats)+tom,
	_drums = nf(_drums,.01,.12),
	_drums = cmp(_drums,drumThrsh,1,1,.0002),

	_mix = _synths + _drums,
	_mix = lbf(_mix,.0065,-1),
	_mix = cmp(_mix,50,.3,1,.001)*1.6,
	_mix = tanh(_mix/mixDiv)*200,
	_mix = mn(_mix),
	_mix/128
),
[song(0),song(1)]