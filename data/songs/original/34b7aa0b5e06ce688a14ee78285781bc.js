/* MarioFan171 - Hydroxide (Initiate) (PrincessPriscillaPT Remix) */

/* Variables you can change */
BPM=130,
sR=sampleRate=48e3,
sPB=samplesPerBeat=32768,
r=t*abs(BPM/((60*sampleRate)/samplesPerBeat)),

tt=(t/sampleRate*256)*440*2**(-7/12),
ts=r,

/* Main Variables */
b=x=>atan(tan(asin(sin(x*(PI/128))))), /* Augmented Wave */
bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
seq=(arr,spd=13,pitch=4)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
kc=(1-(ts/8192)%1)*!(ts>>13&3),pt=ts%32768,
sc=((ts/32768%1*.8+.2)*(1-kc)**1.3),

/* What you see here is Feeshbread's Dead Data Reverb Code */
t||(fb1=fb2=0,wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),bbf=bandBoostFilter=(a,hc,lc,v)=>a+bpf(a,hc,lc)*v,n=noise=c=>(ni=fxi++,fx[ni]??=0,fx[ni]=fx[ni]+(random()-.5-fx[ni])*c),dly=multiTapDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;},alpf=asyncLowPassFilter=(a,cu,cd)=>(si=fxi++,fx[si]??=0,sr=fx[si],fx[si]+=(a-sr)*(sr<a?cu:cd)),cmp=(a,th,ra,at,rl,sc=a)=>(ci=fxi++,fx[ci],a/(alpf(max(abs(sc)-th,0),at,rl)/th*ra+1))),fxi=0,dt=t,q=(30*sampleRate)/(BPM*2/3),rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65},{t:q*1.005+wsin(t*1.005/256),m:1,fb:.5}],[{t:11e2-wsin(t/230),m:.5,fb:.15},{t:13e3-wsin(t/270),m:.5,fb:.35},{t:14e3-wsin(t/280),m:.1,fb:.45},{t:4e4-wsin(t/400),m:.1,fb:.65},{t:q*.995-wsin(t*.995/256),m:1,fb:.5}]],

/* Sequences */
morph=mp=[4,,8,,4,,8,4,,8,4,,4,,4,8][bt(16,13)],
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

bseq=[0,0,0,2,2,2,-2,-2,-4,-4,-4,-4,-5,-5,-5,-5],

chrd1=[0,0,0,0,0,0,-2,-2],
chrd2=[3,3,5,5,3,3,2,2],
chrd3=[7,7,9,9,8,8,5,7],

/* Instruments */
bnj=banjo=(k=seq(mel),(b(k*(mp/m2)%8192/(k*mp%8192>>8))|b)/((ts%8192/1024)/4)||0),

chrdLayer=(mel,d)=>
b((sin(seq(mel,17,2)*PI/256*d)*128+127.5)%(sin(seq(mel,17,2)*PI/255+(sin(ts*PI/5e4)*4)*d)*128+127.5)-128)/4+.0875,

chrd=chords=j=>
chrdLayer(chrd1,j)+
chrdLayer(chrd2,j)+
chrdLayer(chrd3,j),

lead=j=>(kl=seq(melL,14,8)+(sin(ts*PI/8e3)*1e2),(((kl*j/16&127)-24&128)-24))/64,

bs=seq(bseq)/16,
bass=(bs%256-128)/128,

/* Mix & Mastering */
master=h=>cmp(cmp(dly(0
+min(1,max(-1,bnj))*2.5
+bpf(lead(1)+lead(h?.995:1.005)/2,.02,.6)*4*(1-ts/16384%1)**2
+bpf(chrd(h?.995:1.005),.01,.5)*2.5
,rvrbHeads[h],.55,x=>tanh(bpf(x,.01,.8)/200)*100)*2,20,1,.01,.2e-3)*sc/1.125
+bbf(1.5*lpf(.7*hpf(((bs*(h?.995:1.005)*2)%256-128)/128,.02)+bass,(1-((ts/8192)%1))**2*.3+.02),.01,.2,-.5)/1.5*sc*4
+tanh(sin(7*sqrt(pt)**.6))*kc*(1-ts/32768%1)*7*!(ts>>15&1)
+(atan(sin((8e6+(pt)*8)*(1-(1/((pt)*5+.1))*2)/70/8))*8*(max((1-pt/32768*2),0)**2)*(ts>>15&1)+(fb1=hpf(fb1*.5+n(.2)*32*(1-((ts/65536+.5)%1))**3,.2)*.1**(500/(pt))))*.6*(ts>>14>1)
+hpf(random()-.5,.2)*5*(1-ts/8192%1)**3*sc
,50,1,.01,.1e-3)/3,[master(0),master(1)]