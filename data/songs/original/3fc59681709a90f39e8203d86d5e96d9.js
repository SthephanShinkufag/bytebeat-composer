/* MarioFan171 - Hydroxide [PrincessPriscillaPT's HydroCORE Remix] */
/* Cover of #65. CORE [UNDERTALE Soundtrack] - Toby Fox */

/* Variables you can change */
BPM=131,	/* Tempo */
sR=sampleRate=48e3, /* Quality */
sPB=samplesPerBeat=32768, /* Timing */
tt=(t/sR*256)*440*2**(-7/12),	/* Master Tone | -7: Dm */
ts=t*abs(BPM/((60*sR)/sPB)), /* Overall Speed */
dsp=1,
lm=(a,mn=50,mx=-50)=>min(mn,max(mx,sqrt(cbrt(abs(a))**1.1)*9)),

/* Quarter Loop */
ts-=(ts>>19>1?((ts>>15&31)==31)*(ts&24576):0),

/* Main Variables */
b=x=>atan(tan(asin(sin((x)*PI/128+(ts&8191?v:v=random()*16+1)))))*4, /* Augmented Wave */
bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
seq=(arr,spd=13,pitch=4)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
thr=a=>{throw a},

/* What you see here is Feeshbread's Dead Data Reverb Code */
t||(fb1=fb2=0,wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),bbf=bandBoostFilter=(a,hc,lc,v)=>a+bpf(a,hc,lc)*v,n=noise=c=>(ni=fxi++,fx[ni]??=0,fx[ni]=fx[ni]+(random()-.5-fx[ni])*c),dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;},alpf=asyncLowPassFilter=(a,cu,cd)=>(si=fxi++,fx[si]??=0,sr=fx[si],fx[si]+=(a-sr)*(sr<a?cu:cd)),cmp=compressor=(a,th,ra,at,rl,sc=a)=>(ci=fxi++,fx[ci],a/(alpf(max(abs(sc)-th,0),at,rl)/th*ra+1))),fxi=0,dt=t,
q=(30*sR)/(BPM*2/3),rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65},{t:q*1.005+wsin(t*1.005/256),m:.75,fb:.5}],[{t:11e2-wsin(t/230),m:.5,fb:.15},{t:13e3-wsin(t/270),m:.5,fb:.35},{t:14e3-wsin(t/280),m:.1,fb:.45},{t:4e4-wsin(t/400),m:.1,fb:.65},{t:q*.995-wsin(t*.995/256),m:.75,fb:.5}]],

/* Sequences */
mel=[0,,7,,14,,10,,12,,7,3,,7,0,,0,,7,,14,,15,,17,,15,14,,,10,,],

bseq=[0,0,0,0,-4,-4,-2,-5],

chrd1=[0,0,0,0,0,0,-2,-2],
chrd2=[3,3,3,3,3,3,2,2],
chrd3=[7,7,7,7,8,8,5,7],

/* Automations */
kc=(1-ts/8192%1)*!(ts>>13&3),pt=ts%32768,
sc=sideChain=((ts/32768%1*.8+.2)*(1-kc)**1.3**2),
ch=sectionChop=(ts&32767?y:y=round((random()-.5)*32))==0?0:1,
qs=quadSlice=((ts>>15&15)==15?~ts>>12&1:1),

/* Instruments */
k=seq(mel),

bnj=banjo=((b(k*2*(8/4)%8192/(k*2*8%8192>>8))|b)/((ts%8192/1024)/4)||0)/4,

chrdLayer=(mel,d)=>
(((seq(mel,17,2)*d/2)%256-128)/128)/3,
chrd=chords=j=>
chrdLayer(chrd1,j)+
chrdLayer(chrd2,j)+
chrdLayer(chrd3,j),

pwm=(ts>>12&63)+1,
lead=j=>((k*j/16&127)+pwm&128)/64*(k?1:0),

bs=seq(bseq,17)/16,
bass=(bs%256-128)/128,

/* Mix & Mastering */
master=h=>(mst=h=>(atan(
	cmp(
		cmp(	
			dly((0
				+(Banjo=lpf(min(1,max(-1,bnj)),.75)*40)
				+(Lead=bpf((lead(1)+lead(h?.995:1.005)/2),.01,.9)*70*(1-ts/16384%1)**2)
				+(Chords=bpf(chrd(h?.995:1.005),.01,.75)*50)
			)*ch,rvrbHeads[h],(.1+.45*ch),x=>tanh(bpf(x,.01,.8)/200)*100),20,1,.01,.2e-3)*4*sc*qs
		+(Bass=bbf(1.5*lpf(.7*hpf(((bs*(h?.995:1.005)*2)%256-128)/128,.02)+bass,(1-((ts/8192)%1))**2*.3+.02),.01,.2,-.5)*sc*ch*qs*60)
			+bbf(0
				+(Kick=atan(1.5*sin(8*sqrt(pt)**.6))*kc*90*(ts>>18>1)/*!(ts>>15&1)*/)
				+(Snare=(atan(1.5*sin((1e7+(pt)*8)*(1-(1/(pt*5+.1))*2)/80/8))*54*(max((1-pt/32768*2),0)**1.8)*(ts>>15&1)+(fb1=bpf(fb1*.5+n(.5)*240*(1-((ts/65536+.5)%1))**2,.301,.4)*.1**(500/(pt))))*(ts>>19>1)*qs)
				+(Hat=bbf(min(.5,max(-.5,tan(t*random()-.5)/10)),.2,.1,-.1)*50*(1-ts/8192%1)**4)
	,.025,.2,-.5)*2,50,1,.01,.1e-3)/40))*1.1,

dsp>0?((t&1023)==0?thr(
	'\n-+ MarioFan171 - Hydroxide [PrincessPriscillaPT\'s HydroCORE Remix] +-'+
	'\n-+ Display by eSlashMachine +- \n\n'+
	'|T| TIME ---| '+(floor(abs(t)/sR/360))+(floor(abs(t)/sR/60))+[":"," "][(floor(abs(t)/sR*2)&1)]+(floor(abs(t)/sR/10)%6)+((floor(abs(t)/sR))%10)+'.'+(floor(abs(t)/sR*10)%10)+(floor(abs(t)/sR*100)%10)+(floor(abs(t)/sR*1e3)%10)+
	'\n\n-+ MASTER +-\n'+'|L| LEFT ---| '+'\u2588'.repeat(abs(lm(mst(0)*128*64)))+"│"+
	'\n'+'|R| RIGHT --| '+'\u2588'.repeat(abs(lm(mst(1)*128*64)))+"│"+
	'\n\n -+ INSTRUMENTS +-\n'+'|1| BANJO --| '+'\u2588'.repeat(abs(lm(Banjo*64)))+"│"+
	'\n'+'|2| LEAD ---| '+'\u2588'.repeat(abs(lm(Lead*60)))+"│"+
	'\n'+'|3| PADS ---| '+'\u2588'.repeat(abs(lm(Chords*80)))+"│"+
	'\n'+'|4| BASS ---| '+'\u2588'.repeat(abs(lm(Bass*80)))+"│"+
	'\n'+'|5| KICK ---| '+'\u2588'.repeat(abs(lm(Kick*56)))+"│"+
	'\n'+'|6| SNARE --| '+'\u2588'.repeat(abs(lm(Snare*128)))+"│"+
	'\n'+'|7| HIHAT --| '+'\u2588'.repeat(abs(lm(Hat*256)))+"│"
):mst(h)):mst(h)
),[master(0),master(1)]