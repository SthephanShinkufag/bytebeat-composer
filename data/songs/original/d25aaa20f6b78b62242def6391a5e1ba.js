/*

 ██████╗ █████╗ ██╗      █████╗ ██████╗    █████╗ ██╗████████╗██╗   ██╗ ██████╗ █████╗  █████╗ ██████╗ ███████╗ ██████╗
██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗  ██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝
╚█████╗ ██║  ██║██║     ███████║██████╔╝  ██║  ╚═╝██║   ██║    ╚████╔╝ ╚█████╗ ██║  ╚═╝███████║██████╔╝█████╗  ╚█████╗ 
 ╚═══██╗██║  ██║██║     ██╔══██║██╔══██╗  ██║  ██╗██║   ██║     ╚██╔╝   ╚═══██╗██║  ██╗██╔══██║██╔═══╝ ██╔══╝   ╚═══██╗
██████╔╝╚█████╔╝███████╗██║  ██║██║  ██║  ╚█████╔╝██║   ██║      ██║   ██████╔╝╚█████╔╝██║  ██║██║     ███████╗██████╔╝
╚═════╝  ╚════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚════╝ ╚═╝   ╚═╝      ╚═╝   ╚═════╝  ╚════╝ ╚═╝  ╚═╝╚═╝     ╚══════╝╚═════╝ 
																																							v2
❀♪ Solar Cityscapes [PrincessPriscillaPT Remix] v2 ♪❀
>> Remix of "Solar Cityscapes V2" by MarioFan171 (Semuse)
by PrincessPriscillaPT. Feel free to remix it.

---

✦✧✦ Attribution / Credit ✦✧✦
- Original work: "Solar Cityscapes V2" by MarioFan171
- Remix & modifications: PrincessPriscillaPT
- License: CC-BY-SA-4.0 (https://creativecommons.org/licenses/by-sa/4.0)
- Changes made: remixed, enhanced using custom technology‌

vvv Other technologies are used and credited in the code below. vvv

*/

	//==============================//
	// Section 1 - Song Preferences //
	//==============================//

	/* 1.1. Metadata */
BPM=158,	/* Tempo */
sR=sampleRate=48e3, /* Quality */
sPB=samplesPerBeat=32768, /* Timing */
tt=(t/sR*256)*440*2**(-7/12),	/* Master Pitch | -7: Ebm */
ts=t*abs(BPM/(60*sR)*sPB), /* Master Speed */
vol=x=>min(100,max(0,x))/100, /* Volume */

	/* 1.2. Turn display on/off (Default: on/true/1 - This will cause lag on slower devices) */
dsp=1,
cdsp=consoleDisplay=a=>{throw a},

	/* 1.3. Mono/Stereo (Default: stereo/true/1) */
ms=1,
str=stereo=x=>(x?.995:1.005), /* Stereo Chorus */

	//===============================//
	// Section 2 - Signal Processors //
	//===============================//

	// Resets iterator counts to 0
fb=0,fxi=0,rndfxi=0,dlyfxi=0,vufxi=0,peakfxi=0,lprfxi=0,dt=t,vuMax=100,
t||(

	/* 2.1. Empty lists for filters & meters */
		// Filters
	fx=[],[lprfx,lprfx2]=[[],[]],
		// VU Meters
	[fxVU,fxVUdB,fxPeak,fxPeakHold,fxPeakVel,ticks]=[[],[],[],[],[],[]],
	   // Bit Crush
	rndfx=[],
		// Multi-tap Delay
	dlyfx=[],

	/* 2.2. feeshbread - Infinitely Instantiable 1-Pole Filters - Rolloff: 6dB/oct */
	lpf=lowPassFilter=(a,c)=>(
		lp_fxii=fxi++,
		fx[lp_fxii]??=0,
		fx[lp_fxii]+=(a-fx[lp_fxii])*c
	),
	hpf=highPassFilter=(a,c)=>a-lpf(a,c),
	bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),
	nof=notchFilter=(a,lc,hc)=>(hpf(a,hc)+lpf(a,lc))/1.75,
	lbf=lowBoostFilter=(a,c,v)=>a+lpf(a,c)*v,
	hbf=highBoostFilter=(a,c,v)=>a+hpf(a,c)*v,
	bbf=bandBoostFilter=(a,hc,lc,v)=>a+bpf(a,hc,lc)*v,

	/* 2.3a. Two2Fall - Low Pass Filter with Resonance - Rolloff: 12dB/oct*/
	lpr=lowPassResonance=(a,c,r)=>(
		lpr_fxii=lprfxi++,
		lprfx[lpr_fxii]??=lprfx2[lpr_fxii]??=0,
		lprfx[lpr_fxii]+=(a-lprfx[lpr_fxii]+(r+r/((1+.1e-9)-c))*(lprfx[lpr_fxii]-lprfx2[lpr_fxii]))*c,
		lprfx2[lpr_fxii]+=(lprfx[lpr_fxii]-lprfx2[lpr_fxii])*c
	),
	/* 2.3b. Filters Extended */
	hpr=highPassResonance=(a,c,r)=>a-lpr(a,c,r),
	bpr=bandPassResonance=(a,hc,lc,r)=>hpr(lpr(a,lc,r),hc,r),
	
	/* 2.4. feeshbread - Noise */
	n=noise=c=>(
		ni=fxi++,
		fx[ni]??=0,
		fx[ni]=fx[ni]+(random()-.5-fx[ni])*c
	),

	/* 2.5. feeshbread - Dead Data Reverb */
	dMax=1e5,
	wsin=phase=>(-cos(phase/128*PI)+1)*128-.5,
	dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{
		dryWet=dw,
		feedbackShaping=fbfn,
		dly_fxii=dlyfxi++;
		dlyfx[dly_fxii]??=Array(dMax).fill(0);
		dly_wi=dt%dMax;
		dly_feed=audio;
		dly_out=0;
		for(let head of heads) {
			dly_ri=(dMax+dt-floor(head.t))%dMax;
			dly_feed+=dlyfx[dly_fxii][dly_ri]*head.fb;dly_out+=dlyfx[dly_fxii][dly_ri]*head.m;
		} dlyfx[dly_fxii][dly_wi]=feedbackShaping(dly_feed);
		return audio*(1-dryWet)+dly_out*dryWet
	},

	/* 2.6. feeshbread - Async Low Pass + Compressor */
	alp=asyncLowPass=(a,cu,cd)=>(
		alp_fxii=fxi++,
		fx[alp_fxii]??=0,
		sr=fx[alp_fxii],
		fx[alp_fxii]+=(a-sr)*(sr<a?cu:cd)
	),
	cmp=compressor=(a,th,ra,at,rl,sc=a)=>(
		comp_fxii=fxi++,
		fx[comp_fxii],
		a/(alp(max(abs(sc)-th,0),at,rl)/th*ra+1)
	),

	/* 2.7. PrincessPriscillaPT - Bit-Crush Noise / Phase Randomizer */
	bcn=bitCrushNoise=(time,res)=>(
	rnd_fxii=rndfxi++,
	rndfx[rnd_fxii]??=0,
	rndfx[rnd_fxii]=
	res<1
		?(time?rndfx[rnd_fxii]:rndfx[rnd_fxii]=random()-.5)
		:(((time/res|0)!=((time-1)/res|0))
		?rndfx[rnd_fxii]=(random()-.5)
		:rndfx[rnd_fxii])
	),

	/* 2.8. PrincessPriscillaPT - VU Meters (RMS smoothing + scaling algorithm) + Peak + dBFS ruler */
	vu=vuMeter=(a,idx,smooth=.1,dBS=.2,bitDepth=32768,gravity=.025,peakHoldTime=1000)=>(
		vu_fxii=vufxi++,s=smooth,dep=bitDepth,hold=peakHoldTime,grav=gravity,
		fxVU[vu_fxii]??=fxVUdB[vu_fxii]??=fxPeak[vu_fxii]??=fxPeakHold[vu_fxii]??=fxPeakVel[vu_fxii]??=0,
		fxVU[vu_fxii]=sqrt((1-s)*fxVU[vu_fxii]**2+s*abs(a)**2),
		dBFS=20*log10(fxVU[vu_fxii]/dep+1e-12),
		vuMapped=max(0,min(vuMax,vuMax+dBFS)),
		fxVUdB[vu_fxii]+=dBS*(vuMapped-fxVUdB[vu_fxii]),
		isNaN(fxVUdB[vu_fxii])&&(fxVUdB[vu_fxii]=0),

		now=(typeof performance!='undefined'?performance.now():Date.now()),
		isNew=fxVUdB[vu_fxii]>fxPeak[vu_fxii],
		fxPeakHold[vu_fxii]=isNew?now+hold:fxPeakHold[vu_fxii],
		shouldDecay=now>fxPeakHold[vu_fxii],
		fxPeakVel[vu_fxii]=shouldDecay?fxPeakVel[vu_fxii]+grav/60:0,
		fxPeak[vu_fxii]=shouldDecay?max(fxVUdB[vu_fxii],fxPeak[vu_fxii]-fxPeakVel[vu_fxii]):max(fxPeak[vu_fxii],fxVUdB[vu_fxii]),

		fxVUdB[vu_fxii]
	),
	pk=peak=idx=>(
		peak_fxii=peakfxi++,
		p=floor(fxPeak[peak_fxii]||0),
		v=floor(fxVUdB[peak_fxii]||0),
		space=max(0,p-v),
		p>0?' '.repeat(space)+'│':''
	),
	dBFSRuler=_=>(
		(()=>{
		w=max(1,vuMax|0),
		a=Array.from({length:w},()=>'—');
		for(let d=-w;d<=0;d+=20)ticks.push(d);
		[-10,-5,-2,0].forEach(d=>{if(d>=-w&&d<=0&&ticks.indexOf(d)==-1)ticks.push(d)});
		ticks=Array.from(new Set(ticks)).sort((x,y)=>x-y);
   	for(let d of ticks){
			if (d==-100) continue;
      	label=String(d),
      	pos=floor((d+w)/w*(w-1)),
      	start=max(0,min(w-label.length,pos-floor(label.length/2)));
      	for(let i=0;i<label.length;i++)a[start+i]=label[i];
		};
			infLabel = "-∞";
			for (let i=0;i<infLabel.length;i++){if (i<a.length)a[i]=infLabel[i]};
			zeroLabel="0";
			let zeroPos=w-zeroLabel.length;
			for (let i=0;i<zeroLabel.length;i++){a[zeroPos+i]=zeroLabel[i];
			}
				return a.join('');
		})()
	),

	cen=stringCentering=(sym,inp,amo)=>(sym.repeat(amo).concat(inp).concat(sym.repeat(amo)))
),

	/* 2.9. Reverb Heads */
q=(30*sR)/(BPM*2/3),
rvrbHeads=[
	[
		{t:1e3+wsin(t/210),m:.6,fb:.3},
		{t:1e4+wsin(t/250),m:.5,fb:.5},
		{t:17e3+wsin(t/300),m:.3,fb:.7},
		{t:37e3+wsin(t/380),m:.2,fb:.9},
		{t:q*1.005+wsin(t*1.005/256),m:.75,fb:.75}
	],[
		{t:11e2-wsin(t/230),m:.6,fb:.3},
		{t:13e3-wsin(t/270),m:.5,fb:.5},
		{t:14e3-wsin(t/280),m:.3,fb:.7},
		{t:4e4-wsin(t/400),m:.2,fb:.9},
		{t:q*.995-wsin(t*.995/256),m:.75,fb:.75}
	]
],

rvrbPluck=[
	[
		{t:310+sin(t/81e2)*40,m:1,fb:0},
		{t:q/1.5*1.005,m:.75,fb:1}
	],[
		{t:290-sin(t/79e2)*40,m:1,fb:0},
		{t:q/1.5*.995,m:.75,fb:1}
	]
],

	//========================//
	// Section 3 - Sequencers //
	//========================//

mel='1 4 B RN I G F8BF G 8 B6 8 4 643',mel2='14BD6B86',
melC1='886688B8',
melC2='44114484',
melC3='IIGGFFI1',
melC4='NNLLKKRN',
melLead='B8FBBDDD        GFD88888        ',
bSeq='DD99BBGB',
plMel='   G  G  G  B  D   D  D  D  G  B   G  G  G  G  K   B  B  B  B  D',
grSeq=[,1,1,1,1,1,2,1],
grVol=[,1,1,1,1,1,1,],

	/* Song Progression (4 bars per iteration) - String */
ite=ts>>19, /* Iterator */

	/* Instruments */
sty='00111111000011111111111111111111000000'[ite], // Synth
st2='00001111000000111111000011011111000000'[ite], // Synth Mel 2
ldy='00111111000000010000000011111111111100'[ite], // Lead 
pdy='11111111111111111111000011111111111100'[ite], // Pads 
bly='11111111111111110000111111111111111100'[ite], // Bells 
bsy='00111111111111111111000011111111111100'[ite], // Bass 

	/* Sound Effects */
lsy='00010001000000010001000101000001000000'[ite], // Laser 
acy='00111111001111111111111111011111111000'[ite], // Acid 

	/* Drums & Percussions */
kty='00001111111111111111001111011111111000'[ite], // Kick 
sny='00001111111111110011000011011111000000'[ite], // Snare 
hty='00001111111111110011000011010000000000'[ite], // Hat 

	/* Noise */
rsy='0011'[ite], // Riser (Only once)
chy='00001100110011001100110011001100110011'[ite], // Crash 
nsy='00111111111111111111000011011111000000'[ite], // Noise (filler)

	/* Effects */
mty='11111111111111111111111111111111111111'[ite], // Master
vly='111111111111111111112222112111111111331'[ite], // Master Volume
qhy='00000101000100010001000100110001000000'[ite], // Quarter - Half Cut

	//=====================================//
	// Section 4 - Envelopes / Automations //
	//=====================================//

prog=songProgression=x=>(parseInt(x,2)||0?1:0), /* Song Progression Function */
prog2=x=>parseInt(x,9), /* Prog. Volume */
itr=(b,a,ti)=>(ts>>ti>1?b:a), /* Intro */
ts-=itr(((ts>>15&63)==63)*(ts&16384),0,20), /* Half Note Loop Roll */
kc=(1-ts/8192%1)*!(ts>>13&3),pt=ts%32768, /* Kick Volume Envelope */
sc=sideChain=((ts/32768%1*.8+.2)*(1-kc)**1.3**2), /* Sidechain Envelope */
qhs=quarterHalfSlice=(prog(qhy)?((ts>>16&7)==7?~ts>>(ts>>15&1?13:12)&1:1):1), /* Quarter - Half Note Cut */
lpfSweep=itr(1,1-1/(ts/12e5+1)**.5,20), /* Intro - Low-Pass Filter Sweep */
hpfSweep=itr(.001,(ts/2**21)**32*.75,20), /* Intro - High-Pass Filter Sweep */
filterRes=itr(0,(1-ts/2**21)**.5,20)*.5, /* Intro - Filter Resonance */

	//=========================//
	// Section 5 - Instruments //
	//=========================//

str2=x=>(x?2.01:1.99),
synMel=tt*2**(parseInt(mel[31&(11&ts>>13)+(ts>>15)],36)/12)||(prog(st2)?tt*2**(parseInt(mel2[7&ts>>16],36)/12):0),
syn=(x,d,d2)=>(((x&x/d2*d*2^x/d2*2)%256-128)+((x^x*2)%256-128)+(random()-.5)*24)/128*(x?1:0),

chrdLayer=(mel,d)=>bpf((((tt+bcn(t,0)*1e7)*2**(parseInt(mel[ts>>16&7],36)/12)*d/2)%256-128)/128,.05,.35)/2,
chrd=chords=j=>
	chrdLayer(melC1,j)+
	chrdLayer(melC2,j)+
	chrdLayer(melC3,j)+
	chrdLayer(melC4,j),

	/* Chasyxx - Pulse-Width Modulation (from The Unicode Show) */
pwm=pulseWidthModulation=(tone,level)=>tone?tone?(sin(tone*PI/128)>level)-0.5+level/2:0:0,
ld=j=>pwm(tt*2**(parseInt(melLead[ts>>15&31],36)/12)*j,cos(ts*PI/524288))*2.5,

wvBell=(x,env)=>(asin(sinc(sinc(x*PI/32)+cosc(x*PI/32*6)))*env)||0,

bsMel=tt*2**(parseInt(bSeq[ts>>16&7],36)/12)/8,
bsb=(bsMel%256-128)/128,

namco=x=>(parseInt('G808CEFGFEC842101248CFGFC8410148'[x>>4&31],17)-8)/8,

	/* Demonfong - Custom Sine & Cosine Wave Functions (sinc+cosc) */
sinc=x=>((x*64/PI*128+4096)+4096&8191)*(-(x*64/PI*128+4096)+4096&8191)*((((x*64/PI*128+4096)+4096&8192)>>12)-1)/16777215,
cosc=x=>sinc(x-256),

	/* My Custom Tangent Wave (tanc) */
tanc=x=>(_=(x+PI/2)%PI-PI/2,_2=_*_,(_*(105-10*_2))/(105-45*_2+_2*_2)),

	//=============================//
	// Section 6 - Mix & Mastering //
	//=============================//

master=x=>(
	lr=x=>atan(
		lbf(
			nof(
				bpr(
					atan(
						cmp(	
							dly((0
								+(synth=bbf(syn(synMel,str2(x),str(x))*1.2,.3,.8,.2)*130*prog(sty))
								+(lead=bpf((ld(1)+ld(str(x))/2),.01,.9)*150*prog(ldy))
								+(pads=bpf(chrd(str(x)),.01,.75)*250*prog(pdy))
								+(bell=dly(lpf(wvBell(tt/4*2**(parseInt(plMel[ts>>13&63],36)/12),itr(1,(ts/2**20%1)**6,19)*(1-ts/8192%1)**2*(plMel[ts>>13&63]?1:0)),.75),rvrbPluck[x],.45,x=>tanh(bpf(x,.01,.8)/180)*100)*450*prog(bly))
								+(laser=hpf((tt/2+.5*pow(7-(((ts/32768%16)%1)*(2+(ts/2**17%4)))%1,5)*-4)%256-128,.05)*itr(.1**(1e2/(ts%2**19)),.1**(1e3/(ts%2**19)),20)*1.5*prog(lsy))
	),rvrbHeads[x],.45,x=>tanh(bpf(x,.01,.8)/180)*100)*4*itr(sc,1,20)
							+(bass=(bbf(1.5*lpf(.7*hpf(((bsMel*(str(x))*2)%256-128)/128,.02)+bsb,itr((1-((ts/8192)%1))**2*.3+.02,.102,20)),.01,.2,-.5)*2.6+(namco(bsMel*2*str(x))+namco(bsMel))*1.2)*itr(sc,1,20)*270*prog(bsy))
							+(acid=hpf((bsMel*2%256*abs(sin(ts*PI/32768)/4)&8)*2,.005)*(1-ts*(grSeq[ts>>13&7])/8192%1)*(grVol[(ts>>13)%7])/(grSeq[ts>>13&7])*70*itr(sc,.5,20)*prog(acy)||0)
							+bbf(0
								+(kick=atan(sinc(7.5*sqrt(pt)**.6))*kc*500*(ts>>20>1)*prog(kty))
								+(snare=(atan(sinc((1e7+(pt)*8)*(1-(1/(pt*5+.1))*2)/80/8))*230*(max((1-pt/32768*2),0)**1.8)*(ts>>15&1)+(fb=bpf(fb*.5+n(.6)*575*(1-((ts/65536+.5)%1))**2,.301,.4)*.1**(256/pt)))*1.33*(ts>>20>1)*prog(sny))
								+(hat=bbf(min(.5,max(-.5,tanc(t*random()-.5)/10)),.2,.1,-.1)*230*.9995**(ts%8192)*(ts>>20>1)*prog(hty))
								,.025,.2,-.5)*6
							,50,1,.01,.1e-3)
						/50),hpfSweep,lpfSweep,filterRes)
				,.013,.04)
			,.05,1.0625)
		*itr(sqrt(2),(ts/2**21%1)**1.2+(.04+ts/2**21%1)**32*.75,20)
	+(riser=n(itr(0,itr((ts/1048576%1)**100,0,19),20))*1.2*itr(0,1,20)*prog(rsy))
	+(crash=bpf(n(itr((1-ts/1048576%1)**2*.55,0,20)),.25,((1-ts/1048576%1)**2*.55)+.55)*1.2*!(ts>>20&1)*prog(chy))
	+(noiseBD=hpf(n(itr(.5,(ts/2**21%1)**3*.5,20)),.25)*sc*itr(1.1,(ts/2**21%1)**5*.75,20)*prog(nsy)))*1.5*prog(mty)*qhs/prog2(vly),

	//=================================//
	// Section 7 - Display + VU Meters //
	//=================================//

	dsp>0?((t/8.15%1)?lr(x):cdsp(
		'\n┌────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ─────'+
		'\n│'
		+'  ██████╗ █████╗ ██╗      █████╗ ██████╗    █████╗ ██╗████████╗██╗   ██╗ ██████╗ █████╗  █████╗ ██████╗ ███████╗ ██████╗ '.slice(0,t/612)+'\n│'
		+' ██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗  ██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝ '.slice(0,t/562)+'\n│ '
		+'╚█████╗ ██║  ██║██║     ███████║██████╔╝  ██║  ╚═╝██║   ██║    ╚████╔╝ ╚█████╗ ██║  ╚═╝███████║██████╔╝█████╗  ╚█████╗  '.slice(0,t/512)+'\n│'
		+'  ╚═══██╗██║  ██║██║     ██╔══██║██╔══██╗  ██║  ██╗██║   ██║     ╚██╔╝   ╚═══██╗██║  ██╗██╔══██║██╔═══╝ ██╔══╝   ╚═══██╗ '.slice(0,t/512)+'\n│'
		+' ██████╔╝╚█████╔╝███████╗██║  ██║██║  ██║  ╚█████╔╝██║   ██║      ██║   ██████╔╝╚█████╔╝██║  ██║██║     ███████╗██████╔╝ '.slice(0,t/562)+'\n│'
		+' ╚═════╝  ╚════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚════╝ ╚═╝   ╚═╝      ╚═╝   ╚═════╝  ╚════╝ ╚═╝  ╚═╝╚═╝     ╚══════╝╚═════╝  v2'.slice(0,t/612)+'\n│\n│ '+
		'❀♪ Solar Cityscapes [PrincessPriscillaPT Remix] v2 ♪❀'.slice(0,t/5e2)+'\n│ '+'Remix of "Solar Cityscapes V2" by MarioFan171 (Semuse)'.slice(0,t/1e3)+'\n│ '+'by PrincessPriscillaPT. Feel free to remix it.'.slice(0,t/15e2)+
		'\n└────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ─────'+
		'\n\n- | T i | -- T i m e -- | '+(floor(abs(t)/sR/360/10))+(colon=[":"," "][floor(abs(t)/sR*2)&1])+(floor(abs(t)/sR/600)%6)+(floor(abs(t)/sR/60)%10)+colon+(floor(abs(t)/sR/10)%6)+((floor(abs(t)/sR))%10)+'.'+(floor(abs(t)/sR*10)%10)+(floor(abs(t)/sR*100)%10)+(floor(abs(t)/sR*1e3)%10)+(floor(abs(t)/sR)>4?'':' (hh:mm:ss.ms)')+
		'\n'+'- | B t | - B e a t s - | '+(floor(abs(ts)>>17)+1)+':'+floor((floor(abs(ts)>>13&15))/10%3)+((floor(abs(ts)>>13&15)+1)%10)+':'+floor((floor(abs(ts*6)>>11)%24)/10%3)+((floor(abs(ts*6)>>11)%24)%10)+(floor(abs(t)/sR)>4?'':' (bar:steps:ticks)')+
		'\n\n'+cen('~'," M A S T E R ",10)+
		'\n'+'- | d B | - S c a l e - |'+' '+dBFSRuler().slice(0,(t/16384)**.6*dBFSRuler().length/3.2)+
		'\n'+'- | L e | -- L e f t -- | '+'\u2588'.repeat(vu(lr(0)*49152,1))+pk(1)+
		'\n'+'- | R i | - R i g h t - | '+'\u2588'.repeat(vu(lr(1)*49152,2))+pk(2)+
		'\n\n'+cen('~'," I N S T R U M E N T S ",5)+
		'\n'+'- | 0 1 | - S y n t h - | '+'\u2588'.repeat(vu(synth*160,3))+pk(3)+
		'\n'+'- | 0 2 | -- L e a d -- | '+'\u2588'.repeat(vu(lead*160,4))+pk(4)+
		'\n'+'- | 0 3 | -- P a d s -- | '+'\u2588'.repeat(vu(pads*160,5))+pk(5)+
		'\n'+'- | 0 4 | -- B e l l -- | '+'\u2588'.repeat(vu(bell*192,6))+pk(6)+
		'\n'+'- | 0 5 | -- B a s s -- | '+'\u2588'.repeat(vu(bass*80,7))+pk(7)+
		'\n\n'+cen('~'," S O U N D - E F F E C T S ",3)+
		'\n'+'- | 0 6 | - L a s e r - | '+'\u2588'.repeat(vu(laser*160,8))+pk(8)+
		'\n'+'- | 0 7 | -- A c i d -- | '+'\u2588'.repeat(vu(acid*256,9))+pk(9)+
		'\n\n'+"D R U M S / P E R C U S S I O N S"+
		'\n'+'- | 0 8 | -- K i c k -- | '+'\u2588'.repeat(vu(kick*192,10))+pk(10)+
		'\n'+'- | 0 9 | - S n a r e - | '+'\u2588'.repeat(vu(snare*384,11))+pk(11)+
		'\n'+'- | 0 A | - H i h a t - | '+'\u2588'.repeat(vu(hat*640,12))+pk(12)+
		'\n\n'+cen('~'," N O I S E ",11)+
		'\n'+'- | 0 B | - R i s e r - | '+'\u2588'.repeat(vu(riser*32768,13))+pk(13)+
		'\n'+'- | 0 C | - C r a s h - | '+'\u2588'.repeat(vu(crash*32768,14))+pk(14)+
		'\n'+'- | 0 D | - N o i s e - | '+'\u2588'.repeat(vu(noiseBD*32768,15))+pk(15)+
		'\n\n┌─୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ'+
		'\n│ '+'© 2024-2025 PrincessPriscillaPT.'.slice(0,t/25e2)+'\n│ '+'Original work by © 2016-2025 Semaphore / Muse Labs.'.slice(0,t/3e3)+'\n│ '+'Licensed under CC-BY-SA-4.0 | https://creativecommons.org/licenses/by-sa/4.0'.slice(0,t/35e2)+
		'\n└─୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ────────୨ৎ'
		)
	):lr(x)
)*vol(100),

	//====================//
	// Section 8 - Output //
	//====================//

ms?[master(0),master(1)]:(master(0)+master(1))/2