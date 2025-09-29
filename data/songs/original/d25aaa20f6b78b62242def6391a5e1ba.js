/*

 ██████╗ █████╗ ██╗      █████╗ ██████╗    █████╗ ██╗████████╗██╗   ██╗ ██████╗ █████╗  █████╗ ██████╗ ███████╗ ██████╗
██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗  ██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝
╚█████╗ ██║  ██║██║     ███████║██████╔╝  ██║  ╚═╝██║   ██║    ╚████╔╝ ╚█████╗ ██║  ╚═╝███████║██████╔╝█████╗  ╚█████╗ 
 ╚═══██╗██║  ██║██║     ██╔══██║██╔══██╗  ██║  ██╗██║   ██║     ╚██╔╝   ╚═══██╗██║  ██╗██╔══██║██╔═══╝ ██╔══╝   ╚═══██╗
██████╔╝╚█████╔╝███████╗██║  ██║██║  ██║  ╚█████╔╝██║   ██║      ██║   ██████╔╝╚█████╔╝██║  ██║██║     ███████╗██████╔╝
╚═════╝  ╚════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚════╝ ╚═╝   ╚═╝      ╚═╝   ╚═════╝  ╚════╝ ╚═╝  ╚═╝╚═╝     ╚══════╝╚═════╝  v1.3
❀♪ Solar Cityscapes [PrincessPriscillaPT Remix] v1.3 ♪❀
>> Remix of "Solar Cityscapes v2.2" by MarioFan171 (Semuse)
by PrincessPriscillaPT. Feel free to remix it.

---

✦✧✦ Attribution / Credit ✦✧✦
- Original work: "Solar Cityscapes v2.2" by MarioFan171
- Remix & modifications: PrincessPriscillaPT
- License: CC-BY-SA-4.0 (https://creativecommons.org/licenses/by-sa/4.0)
- Changes made: remixed, enhanced using custom technology‌

vvv Other technologies are used and credited in the code below. vvv

*/

	//==============================//
	// Section 1 - Song Preferences //
	//==============================//

/* 1.1. Metadata */
BPM=155,	/* Tempo */
sR=sampleRate=48e3, /* Quality */
sPB=samplesPerBeat=32768, /* Timing */
tt=(t/sR*256)*440*2**(-7/12),	/* Master Pitch | -7: Ebm */
ts=t*abs(BPM/(60*sR)*sPB), /* Master Speed */
vol=x=>min(100,max(0,x))/100, /* Volume */

/* 1.2. Turn display on/off (Default: off/false/0 - Enabling this will cause lag on slower devices) */
dsp=true,
cdsp=consoleDisplay=a=>{throw a},
/* 1.3. Mono/Stereo (Default: stereo/true/1) */
ms=true,
str=stereo=x=>(x?.995:1.005), /* Stereo Chorus */

	//===============================//
	// Section 2 - Signal Processors //
	//===============================//

// Resets iterator counts to 0
fb=0,fxi=0,fxiVU=0,fxiPeak=0,fxiLPR=0,dt=t,
t||(

/* 2.1. Empty lists for filters & meters */
	// Filters
	fx=[],
	// VU Meters
	[fxVU,fxVUdB,fxPeak,fxPeakHold,fxPeakVel]=[[],[],[],[],[]],
	// Resonance Filters
	[fxLPR1,fxLPR2]=[[],[]],

/* 2.2. feeshbread - Infinitely Instantiable 1-Pole Filters - Rolloff: 6dB/oct */
	lpf=lowPassFilter=(a,c)=>(
		lp_fxii=fxi++,
		fx[lp_fxii]??=0,
		fx[lp_fxii]+=(a-fx[lp_fxii])*c
	),
	hpf=highPassFilter=(a,c)=>a-lpf(a,c),
	bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),
	bbf=bandBoostFilter=(a,hc,lc,v)=>a+bpf(a,hc,lc)*v,

/* 2.3a. Two2Fall - Low Pass Filter with Resonance - Rolloff: 12dB/oct*/
	lpr=lowPassResonance=(a,c,r)=>(
		lpr_fxii=fxiLPR++,
		fxLPR1[lpr_fxii]??=fxLPR2[lpr_fxii]??=0,
		fxLPR1[lpr_fxii]+=(a-fxLPR1[lpr_fxii]+(r+r/((1+.1e-9)-c))*(fxLPR1[lpr_fxii]-fxLPR2[lpr_fxii]))*c,
		fxLPR2[lpr_fxii]+=(fxLPR1[lpr_fxii]-fxLPR2[lpr_fxii])*c
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
		dly_fxii=fxi++;
		fx[dly_fxii]??=Array(dMax).fill(0);
		dly_wi=dt%dMax;
		dly_feed=audio;
		dly_out=0;
		for(let head of heads){
			dly_ri=(dMax+dt-floor(head.t))%dMax;
			dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;
		}fx[dly_fxii][dly_wi]=feedbackShaping(dly_feed);
		return audio*(1-dryWet)+dly_out*dryWet
	},

/* 2.6. feeshbread - Asynchronous Low Pass + Compressor */
	alpf=asyncLowPassFilter=(a,cu,cd)=>(
		si=fxi++,
		fx[si]??=0,
		sr=fx[si],
		fx[si]+=(a-sr)*(sr<a?cu:cd)
	),
	cmp=compressor=(a,th,ra,at,rl,sc=a)=>(
		ci=fxi++,
		fx[ci],
		a/(alpf(max(abs(sc)-th,0),at,rl)/th*ra+1)
	),

/* 2.7. VU Meters + RMS smoothing + RMS scaling algorithm + Seperate buffer + Peak */
	vuMeter=(a,idx,smooth=.1,dBS=.1,bitDepth=32768,vuMax=50,peakDecay=4,gravity=.02,peakHoldTime=1000,fps=60)=>(
		i=fxiVU++,s=smooth,dep=bitDepth,decay=peakDecay,hold=peakHoldTime,grav=gravity,
		fxVU[i]??=fxVUdB[i]??=fxPeak[i]??=fxPeakHold[i]??=fxPeakVel[i]??=0,
		fxVU[i]=sqrt((1-s)*fxVU[i]**2+s*abs(a)**2),
		dBFS=20*log10(fxVU[i]/dep+1e-12),
		vuMapped=max(0,min(vuMax,vuMax+dBFS)),
		fxVUdB[i]+=dBS*(vuMapped-fxVUdB[i]),
		isNaN(fxVUdB[i])&&(fxVUdB[i]=0),

		now=(typeof performance!='undefined'?performance.now():Date.now()),
		isNew=fxVUdB[i]>fxPeak[i],
		fxPeakHold[i]=isNew?now+hold:fxPeakHold[i],
		shouldDecay=now>fxPeakHold[i],
		fxPeakVel[i]=shouldDecay?fxPeakVel[i]+grav/fps:0,
		fxPeak[i]=shouldDecay?max(fxVUdB[i],fxPeak[i]-fxPeakVel[i]):max(fxPeak[i],fxVUdB[i]),

		fxVUdB[i]
	),

	peak=idx=>(
		i=fxiPeak++,
		p=floor(fxPeak[i]||0),
		v=floor(fxVUdB[i]||0),
		h=fxPeakHold[i]||0,
		space=max(0,p-v-1),
		p>0?' '.repeat(space)+'│':''
	)
),
/* 2.8. feeshbread - Reverb Heads */
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

rvrbHeadsPluck=[
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

	//=====================================//
	// Section 4 - Envelopes / Automations //
	//=====================================//

itr=(b,a,ti)=>(ts>>ti>1?b:a), /* Intro */
ts-=itr(((ts>>15&63)==63)*(ts&24576),0,20), /* Quarter Note Loop Roll */
kc=(1-ts/8192%1)*!(ts>>13&3),pt=ts%32768, /* Kick Volume Envelope */
sc=sideChain=((ts/32768%1*.8+.2)*(1-kc)**1.3**2), /* Sidechain Envelope */
ch=sectionChop=(ts&32767?y:y=round((random()-.5)*40))==0?0:1, /* Section Cutting (Not used) */
qs=quadSlice=((ts>>15&31)==31?~ts>>12&1:1), /* Quarter Note Slice */
lpfSweep=itr(1,1-1/(ts/12e5+1)**.5,20), /* Intro - Low-Pass Filter Sweep */
hpfSweep=itr(.001,(ts/2**21)**32*.75,20), /* Intro - High-Pass Filter Sweep */
filterRes=itr(0,(1-ts/2**21)**.5,20), /* Intro - Filter Resonance */

	//=========================//
	// Section 5 - Instruments //
	//=========================//

str2=x=>(x?2.01:1.99),
k=tt*2**(parseInt(mel[31&(11&ts>>13)+(ts>>15)],36)/12)||tt*2**(parseInt(mel2[7&ts>>16],36)/12),
syn=(x,d,d2)=>(((x&x/d2*d*2^x/d2*2)%256-128)+((x^x*2)%256-128)+(random()-.5)*24)/150,

chrdLayer=(mel,d)=>bpf((((tt+(t?z:z=random()*1e7))*2**(parseInt(mel[ts>>16&7],36)/12)*d/2)%256-128)/128,.05,.35)/2,
chrd=chords=j=>
chrdLayer(melC1,j)+
chrdLayer(melC2,j)+
chrdLayer(melC3,j)+
chrdLayer(melC4,j),

pwm=(ts>>12&63)+1,
ld=j=>((tt*2**(parseInt(melLead[ts>>15&31],36)/12)*j*8/16&127)+pwm&128)/56,

bl=(x,env)=>(asin(sinc(sinc(x*PI/32)+cosc(x*PI/32*6)))*env)||0,

bs=tt*2**(parseInt(bSeq[ts>>16&7],36)/12)/8,
bsb=(bs%256-128)/128,

namco=x=>(parseInt('G808CEFGFEC842101248CFGFC8410148'[x>>4&31],17)-8)/8,

/* Demonfong - Custom Sine & Cosine Wave Functions (sinc+cosc) */
sinc=x=>((x*64/PI*128+4096)+4096&8191)*(-(x*64/PI*128+4096)+4096&8191)*((((x*64/PI*128+4096)+4096&8192)>>12)-1)/16777215,
cosc=x=>sinc(x-256),
/* My Custom Tangent Wave (tanc) */
tanc=x=>(µ=(x+PI/2)%PI-PI/2,µ2=µ*µ,(µ*(105-10*µ2))/(105-45*µ2+µ2*µ2)),
cotc=x=>tanc(x-256),

	//=============================//
	// Section 6 - Mix & Mastering //
	//=============================//

master=x=>(
	lr=x=>bpr(
		tanh(
			cmp(	
				dly((0
					+(synth=bbf(syn(k,str2(x),str(x))*1.2,.3,.8,.2)*150*itr(1,0,19))
					+(lead=bpf((ld(1)+ld(str(x))/2),.01,.9)*150*itr(1,0,19))
					+(pads=bpf(chrd(str(x)),.01,.75)*250)
					+(bell=dly(lpf(bl(tt/4*2**(parseInt(plMel[ts>>13&63],36)/12),itr(1,(ts/2**20%1)**6,19)*(1-ts/8192%1)**2*(plMel[ts>>13&63]?1:0)),.75),rvrbHeadsPluck[x],.55,x=>tanh(bpf(x,.01,.8)/180)*100)*500)
					+(laser=hpf((tt/2+.5*pow(7-(((ts/32768%16)%1)*(2+(ts/2**17%4)))%1,5)*-4)%256-128,.05)*itr(.1**(1e2/(ts%2**19)),.1**(1e3/(ts%2**19)),20)*1.5*((ts>>19&3)==3?1:0))
	),rvrbHeads[x],.45,x=>tanh(bpf(x,.01,.8)/180)*100)*4*itr(sc,1,20)
				+(bass=(bbf(1.5*lpf(.7*hpf(((bs*(str(x))*2)%256-128)/128,.02)+bsb,itr((1-((ts/8192)%1))**2*.3+.02,.102,20)),.01,.2,-.5)*2.6*itr(1,0,20)+(namco(bs*2*str(x))+namco(bs))*1.2)*itr(sc,1,20)*270*itr(1,0,19))
				+(growl=hpf((bs*2%256*abs(sin(ts*PI/32768)/4)&8)*2,.005)*(1-ts*(grSeq[ts>>13&7])/8192%1)*(grVol[(ts>>13)%7])/(grSeq[ts>>13&7])*70*itr(sc,.5,20)*itr(1,0,19)||0)
					+bbf(0
						+(kick=atan(sinc(7.5*sqrt(pt)**.6))*kc*500*(ts>>20>1))
						+(snare=(atan(sinc((1e7+(pt)*8)*(1-(1/(pt*5+.1))*2)/80/8))*200*(max((1-pt/32768*2),0)**1.8)*(ts>>15&1)+(fb=bpf(fb*.5+n(.6)*450*(1-((ts/65536+.5)%1))**2,.301,.4)*.1**(256/pt)))*1.33*(ts>>20>1)*qs)
						+(hat=bbf(min(.5,max(-.5,tanc(t*random()-.5)/10)),.2,.1,-.1)*199*.9996**(ts%8192)*(ts>>20>1))
					,.025,.2,-.5)*6
				,50,1,.01,.1e-3)
			/50),hpfSweep,lpfSweep,filterRes)
		*itr(qs,1,20)*itr(sqrt(2),(ts/2**21%1)**1.2+(.04+ts/2**21%1)**32*.75,20)
	+(riser=n(itr(0,itr((ts/1048576%1)**100,0,19),20))*1.4*itr(0,1,20))
	+(crash=bpf(n(itr((1-ts/1048576%1)**2*.55,0,20)),.25,((1-ts/1048576%1)**2*.55)+.55)*1.41*!(ts>>20&1))
	+(noiseBD=hpf(n(itr(.5,(ts/2**21%1)**3*.5,20)),.25)*sc*itr(qs,1,20)*itr(1.1,(ts/2**21%1)**5*1.1,20)),

	//=================================//
	// Section 7 - Display + VU Meters //
	//=================================//

	dsp>0?((t/8.15%1)?lr(x):cdsp(
		'\n -+ ❀♪ MarioFan171 - Solar Cityscapes [PrincessPriscillaPT Remix] v1.3 ♪❀ +-'+
		'\n\n-|TI| TIME ---| '+(floor(abs(t)/sR/360/10))+(colon=[":"," "][(floor(abs(t)/sR*2)&1)])+(floor(abs(t)/sR/600)%6)+(floor(abs(t)/sR/60)%10)+colon+(floor(abs(t)/sR/10)%6)+((floor(abs(t)/sR))%10)+'.'+(floor(abs(t)/sR*10)%10)+(floor(abs(t)/sR*100)%10)+(floor(abs(t)/sR*1e3)%10)+(floor(abs(t)/sR)>4?'':' (hh:mm:ss.ms)')+
		'\n\n  -+ Master +-'+
		'\n'+'-|LE| Left ---| '+'\u2588'.repeat(vuMeter(lr(0)*49152,1))+peak(1)+
		'\n'+'-|RI| Right --| '+'\u2588'.repeat(vuMeter(lr(1)*49152,2))+peak(2)+
		'\n\n  -+ Instruments +-'+
		'\n'+'-|01| Synth --| '+'\u2588'.repeat(vuMeter(synth*160,3))+peak(3)+
		'\n'+'-|02| Lead ---| '+'\u2588'.repeat(vuMeter(lead*160,4))+peak(4)+
		'\n'+'-|03| Pads ---| '+'\u2588'.repeat(vuMeter(pads*160,5))+peak(5)+
		'\n'+'-|04| Bell ---| '+'\u2588'.repeat(vuMeter(bell*192,6))+peak(6)+
		'\n'+'-|05| Bass ---| '+'\u2588'.repeat(vuMeter(bass*80,7))+peak(7)+
		'\n\n  -+ Sound Effects +-'+
		'\n'+'-|06| Laser --| '+'\u2588'.repeat(vuMeter(laser*160,8))+peak(8)+
		'\n'+'-|07| Growl --| '+'\u2588'.repeat(vuMeter(growl*256,9))+peak(9)+
		'\n\n  -+ Drums/Percussions +-'+
		'\n'+'-|08| Kick ---| '+'\u2588'.repeat(vuMeter(kick*192,10))+peak(10)+
		'\n'+'-|09| Snare --| '+'\u2588'.repeat(vuMeter(snare*384,11))+peak(11)+
		'\n'+'-|10| Hihat --| '+'\u2588'.repeat(vuMeter(hat*640,12))+peak(12)+
		'\n\n  -+ Transitions +-'+
		'\n'+'-|11| Riser --| '+'\u2588'.repeat(vuMeter(riser*32768,13))+peak(13)+
		'\n'+'-|12| Crash --| '+'\u2588'.repeat(vuMeter(crash*32768,14))+peak(14)+
		'\n'+'-|13| Noise --| '+'\u2588'.repeat(vuMeter(noiseBD*32768,15))+peak(15)+
		'\n\n Copyright © 2024-2025 PrincessPriscillaPT, All Rights Reserved. \n When using any of my songs/remixes, please credit me first. \n Original work by © 2016-2025 Semaphore/Muse Labs. \n Licensed under CC-BY-SA-4.0 | https://creativecommons.org/licenses/by-sa/4.0'
		)
	):lr(x)
)*vol(100),

	//====================//
	// Section 8 - Output //
	//====================//

ms?[master(0),master(1)]:(master(0)+master(1))/2