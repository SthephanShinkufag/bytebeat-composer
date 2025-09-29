t2=t,

BPM=195, /*BPM: Beats Per Minute*/
sR=sampleRate=48e3, /*Samplerate*/
sPB=samplesPerBeat=32768, /*Timing*/
r=t*abs(BPM/((60*sampleRate)/samplesPerBeat)),
lm=(a,mn=50,mx=-50)=>min(mn,max(mx,a/100)),

tt=(t/sampleRate*256)*440*2**(-18/12), /*Overal Pitch*/
ts=r, /*Overall Speed*/

bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
seq=(arr,spd=14)=>(arr[bt(arr.length,spd)])||0,
mseq=(arr,spd=14,pitch=2)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
b=bytebeat=code=>((code)&255)/127-1,
bsn=(T=tt,p=1)=>sin(T*PI/(128/p))*128+127.5,
s=saw=(T=tt,p=1)=>atan(tan(T*PI/(128/p))),
w=wave=(T,p=1,a=1)=>sin(T*PI/(128/p))/a,
a=triangle=(T,p=1,a=1)=>asin(sin(T*PI/(128/p)))/a,

f=(len=7,exp=1,rmp=0)=> // "f" function: A special kind of wave that its formant can be adjusted
rmp?abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp)): // Condition added to prevent NaN values from appearing in negative numbers
-abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp))+1
,

env=(
al=13, // Attack Length
ae=.2, // Attack Formant
dl=13, // Delay Length
de=lfo(18,.3), // Delay Formant
st=0, // Sustain Length
sv=1 // Sustain Volume
)=>seq(
al>-1?
[f(al,ae,1)].concat(r(st,sv),f(dl,de)):
r(st,1).concat(f(dl,de))
,13),


dec3=d3=(ramp=1,spd=1,spd2=13)=>(ramp-ts/(8192/spd)%1)*!(ts>>(spd2)&3),
pluck=plk=(amp,spd)=>(1.1+(ts)/spd%32)*amp,
sc=sideChain=((ts/32768%1*.8+.2)*(1-d3())**1.3**2),
lfo=(y=1,x=4)=>abs(sin(ts*PI/(32768/y))/x),

t?0:fx=r(29e3,0), // Effect Variable, by Greaserpirate

/* What you see here is Feeshbread's Dead Data Reverb Code */
t||(fb1=fb2=0,wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,
fx=[],
dMax=1e6,
lpf=lowPassFilter=(a,c)=>
(lp_fxii=fxi++,
fx[lp_fxii]??=0,
fx[lp_fxii]+=(a-fx[lp_fxii])*c),

hpf=highPassFilter=(a,c)=>a-lpf(a,c),
bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),
bbf=bandBoostFilter=(a,hc,lc,v)=>
a+bpf(a,hc,lc)*v,

n=noise=c=>(ni=fxi++,fx[ni]??=0,fx[ni]=fx[ni]+(random()-.5-fx[ni])*c),

dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;},alpf=asyncLowPassFilter=(a,cu,cd)=>(si=fxi++,fx[si]??=0,sr=fx[si],fx[si]+=(a-sr)*(sr<a?cu:cd)),
cmp=compressor=(a,th,ra,at,rl,sc=a)=>(ci=fxi++,fx[ci],a/(alpf(max(abs(sc)-th,0),at,rl)/th*ra+1))),fxi=0,dt=t,q=(30*sR)/(BPM*2/3),

rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65},{t:q*1.005+wsin(t*1.005/256),m:.75,fb:.5}],[{t:11e2-wsin(t/230),m:.5,fb:.15},{t:13e3-wsin(t/270),m:.5,fb:.35},{t:14e3-wsin(t/280),m:.1,fb:.45},{t:4e4-wsin(t/400),m:.1,fb:.65},{t:q*.995-wsin(t*.995/256),m:.75,fb:.5}]],

mel1=[0,3,2,3,,2,3,10,,15,14,10,12,7,10,7],

mel2=[0,-4,-7,-5],

c1=[0,0,-4,-4,-7,-7,-5,-2],
c2=[3,3,0,0,-4,-4,-2,2],
c3=[7,7,3,3,0,0,2,5],
c4=[10,10,7,7,3,3,5,10],
c5=[14,14,10,10,7,7,10,14],
c6=[17,17,14,14,10,10,12,17],


ins1=x=>(k1=mseq(mel1,14,4),lpf(b(k1|ts>>6)*(b(k1^k1/2)+b(k1^k1/x))/1.5,.375,.9)),

ins2=x=>(k2=mseq(mel2,18,1),((w(k2)+b(k2|k2/x+k2)-.5)))||0,

key=x=>(kc=mseq(x,17,1),hpf(abs(a(kc)*w(kc)),.05,.1)),

strum=str=(del=1,sust=16,spd=12,int=8)=>

t>0&&(seq(r(del,0).concat(r(sust-del,spd)),spd)),


keycomp=(
(key(c1)*str(1))/6+
(key(c2)*str(2))/6+
(key(c3)*str(3))/6+
(key(c4)*str(4))/6+
(key(c5)*str(5))/6+
(key(c6)*str(6))/6),


M=x=>(
dly(
ins1(x?2.005:1.995)+keycomp/8,
rvrbHeads[x],.55,x=>tanh(bpf(x,.06,.8)/100)*50
)+
(ins2(x?1.995:2.005)*env(-1,0,14,.5))*env(16,.5,16,0,4)
),

[M(0),M(1)]