/*
	  _   __           __        __      _         ____       ____                   __  __                 __              
	 / | / /___  _____/ /_____ _/ /___ _(_)____   / __ )___  / __/___  ________     / / / /___  ____  ___  / /__  __________
	/  |/ / __ \/ ___/ __/ __ `/ / __ `/ / ___/  / __  / _ \/ /_/ __ \/ ___/ _ \   / /_/ / __ \/ __ \/ _ \/ / _ \/ ___/ ___/
  / /|  / /_/ (__  ) /_/ /_/ / / /_/ / / /__   / /_/ /  __/ __/ /_/ / /  /  __/  / __  / /_/ / /_/ /  __/ /  __(__  |__  ) 
 /_/ |_/\____/____/\__/\__,_/_/\__, /_/\___/  /_____/\___/_/  \____/_/   \___/  /_/ /_/\____/ .___/\___/_/\___/____/____/  
                              /____/                                                       /_/                             
	♫ A song by Decent Manager — Ambient Remix by PrincessPriscillaPT ♪

 ────୨ৎ──── ────୨ৎ────
You stand at memory’s twilight, where fading light meets shadows of the past. Fragile chords tremble like broken promises, a soft ache stirring distant memories — muted laughter, fleeting hope. Time creeps by like sepia cinema, in the space between holding on and letting go, a quiet farewell to the light that once lit you.
 ────୨ৎ──── ────୨ৎ────
*/

// What you're seeing here is feeshbread's Dead Data Reverb code.
t||(wsin=(phase)=>(-cos(phase/256*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),nf=notchFilter=(a,hc,lc)=>(hpf(a,hc)+lpf(a,lc))/1.75,dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:1e3+wsin(t/180), m:.6, fb:.3},{t:1e4+wsin(t/300), m:.5, fb:.5},{t:17e3+wsin(t/380), m:.3, fb:.7},{t:37e3+wsin(t/420), m:.2, fb:.9}],[{t:11e2+wsin(t/200), m:.6, fb:.3},{t:13e3+wsin(t/320), m:.5, fb:.5},{t:14e3+wsin(t/320), m:.3, fb:.7},{t:4e4+wsin(t/450), m:.2, fb:.9}]],

bpm=80,sr=44100,r=abs(t/sr/180*3*32768*bpm),
n=(1/sr*256)*440*2**(-7/12),
vi=64+(sin(r/2048)+sin(r/3072))*1.25+sin(r/4096)*0.5,
Dl=((r>>20)>=6?8192:3072),rng=random()-.5,
str=x=>(x?.995:1.005),
masterVol=100,
modeAmbience=1,
modePan=0,
aud=z=>(
wv=x=>(((~x&255)*sin(x*PI/128))/195-.208935||0),
a=(N,P,Ar,V)=>(((t+(r%2**17?v:v=random()*1e7))+sin(t/V)*6+vi*4)/2*n*2**P*2**(N[((r-Ar)>>17)%4]/12)),
b=((t+(r%2**15?w:w=random()*1e7))+sin(t/1e4)*32)*(z?.995:1.005)*2*n*2**([[3,4,-1,-3,-4,-3,-4,-1,3,4,6,4,8,9,8,4],[3,4,8,4,3,4,11,8,3,4,8,4,3,4,6,4]][r>>20&1][(r>>15)%16]/12),
Mel=(N,P,Ar,V)=>(wv(a(N,P,Ar,V))||0)/4*min(1,abs(sin((r-Ar)*PI/131072))*128)*(1-(r-Ar)/131072%1)**.5,(Mel(A=[-8,-4,-3,-3],1,0,700)+Mel([-4,0,1,0],1,Dl,900)+Mel([-1,3,4,4],1,Dl*2,1100)+Mel('3686',1,Dl*3,1300)+(Mel([4,NaN,NaN,NaN],1,Dl*4,1500)+Mel([-1,NaN,NaN,NaN],2,Dl*5,1700))*!!(r>>20>5)+Mel(A,0,0,1500)*.7*(r>2**19))*(r<6422528)+(wv(b)+wv(b*str(z)*2)*(r/32768%1)**1.5)*min(1,abs(sin(r*PI/32768))*32)*(1-r/32768%1)**2*(r>2**20)*(r<2**20*5)/4)/2*min(1,abs(sin(r*PI/131072))*64)*5*masterVol/100,
amb=x=>(lpf(lpf(random()-.5,.05),.025)*2+bpf(bpf(random()-.5,.2,.1),.2,.1)*(sin((t+(t?u:u=random()*1e7))/8e4)/3+.7)*6)/2*(ambVol={i:abs(sin(r/2**19)),m:1,o:abs(cos((r-2**19)/2**19))},ambVol['immmmo'[r>>20]]||0)*modeAmbience*masterVol/100,
pan=(0.5*sin(t/5e4)+0.5*sin(t/9e4+2))*modePan,
[dly(aud(0),rvrbHeads[0],.625,x=>tanh(bpf(x,.01,.8)/180)*100)*((pan/3)+.667)*1.25+amb(0),dly(aud(.995),rvrbHeads[1],.625,x=>tanh(bpf(x,.01,.8)/180)*100)*((-pan/3)+.667)*1.25+amb(1)]