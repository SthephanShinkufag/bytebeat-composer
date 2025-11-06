/* Important Variable */
T=t,

/* Variables you can change */
BPM = 132,
sR = sampleRate = 48e3,
sPB = samplesPerBeat = 32768,
r = t * abs(BPM / ((60 * sampleRate) / samplesPerBeat)),

tt=(t/sampleRate*256)*440 * 2 ** (-7 / 12),
ts=r,

t2=t,

/* Main Variables */
b=x=>atan(tan(asin(sin(x*(PI/128))))), /* Augmented Wave */
bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
pseq=(char,spd=13,pitch=1)=>(tt*pitch*tune)*2**
(parseInt(char[bt(char.length,spd)],36)/12)||0,
seq=(arr,spd=13,pitch=4)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
c=bytebeat=code=>((code)&255)/127-1,
cs=(T,pitch=64)=>sin(T*PI/pitch)*128+127.5,

dec=(ramp,spd,vol)=>((ts*ramp)&(4096*spd)-1)/vol,
dec2=(ramp,spd,vol,expn)=>((ts*ramp)&(4096/spd)-1)**expn/vol,
pluck=plk=(amp,spd)=>(1.1+(ts)/spd%32)*amp,

/* What you see here is Feeshbread's Dead Data Reverb Code */
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,q=(30*sampleRate)/(BPM*2/3),rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65},{t:q*1.005+wsin(t*1.005/256),m:1,fb:.5}],[{t:11e2-wsin(t/230),m:.5,fb:.15},{t:13e3-wsin(t/270),m:.5,fb:.35},{t:14e3-wsin(t/280),m:.1,fb:.45},{t:4e4-wsin(t/400),m:.1,fb:.65},{t:q*.995-wsin(t*.995/256),m:1,fb:.5}]],

/* Sequences */
morph=mp=[4,,8,,4,,8,4,,8,4,,4,,4,8][bt(16,13)],
morphR=mpR=[2,,4,,8,,2,4,,4,8,,8,,2,8][bt(16,13)],
morph2=m2=[2,4,1/2,1/4][bt(4,13)],

mel=[0,,7,,5,,2,3,,3,5,,7,,10,12],

melL=[
-5,0,3,2,3,2,3,5,
-5,0,3,2,3,2,3,5,
7,5,3,5,7,9,10,9,
7,9,10,12,9,10,7,9,
0,3,8,3,0,3,7,8,
5,7,2,3,0,2,-2,0,
-5,0,3,2,3,2,3,5,
-5,0,3,2,3,2,3,5,
],

melb=[0,0,0,2,2,2,-2,-2,-2,-4,-4,-4,-5,-5,-5,-5],

melC1=[0,0,0,0,0,0,-2,-2],
melC2=[3,3,5,5,3,3,2,2],
melC3=[7,7,9,9,8,8,5,7],

/* Instruments */
ins1=ins1L=(k=seq(mel),(b(k*(mp/m2)%8192/(k*mp%8192>>8))|b)/((ts%8192/1024)/4)||0),

ins1R=(k=seq(mel),(b(k*(mpR/m2)%8192/(k*mpR%8192>>8))|b)/((ts%8192/1024)/4)||0),

chrdLayer=mel=>
b((sin(seq(mel,17,2)*PI/256)*128+127.5)%(sin(seq(mel,17,2)*PI/255)*128+127.5)-128)/4+.0875,

chrd=chord=
chrdLayer(melC1)*dec(1,8,2e4)+
chrdLayer(melC2)*dec(1,8,2e4)+
chrdLayer(melC3)*dec(1,8,2e4),

lead=(kl=seq(melL,14,8),b((kl/4)&ts>>6))*dec(.5,4,2e4),

bass=((k2=seq(melb)/8,c(k2^k2/2|k2|ts>>5|k^k2)*c(k2^k2/2+k2&k2/2|ts>>5))-.5)*c(cs(k2/2)^cs(k2/2)/(ts%8192>>9))*dec(-.5,1,9e3),

bass2=((k2>>8&1?(k2>>~k2/8)-255:(~k2>>k2/8)+255)%256/128)*dec(.5,4,2e4),

/* Mix & Mastering */
master=h=>(
+dly(min(2,max(-2,ins1)),rvrbHeads[h],.5,x=>tanh(bpf(x,.01,.8)/200)*100)*3
+dly(bpf(m(lead,.55),.01,.8),rvrbHeads[h],.3,x=>tanh(bpf(x,.01,.8)/200)*100)*3
+dly(lpf(bass,.1)+lpf(m(bass2,.675),.2),rvrbHeads[h],.25,x=>tanh(bpf(x,.01,.8)/200)*100)*dec(1,8,12288)*1.5
+dly(bpf(chrd,.01,.5),rvrbHeads[h],.55,x=>tanh(bpf(x,.01,.8)/180)*100)*dec(1,8,12288)*2
+m(tanh(sin(7*sqrt(ts%32768)**.6))*(1-ts/32768%1)**2,.6)*13
+hpf(random()-.5,.2)*16*dec(-1,2,2e4)**2
+m(bpf(sin((t*(h?.995:1.005)>>2)**7),.5,.1)*50*dec(-1,(ts>>15&1?8:NaN),10e4),.5)*2.5
)/3,[master(0),master(1)]