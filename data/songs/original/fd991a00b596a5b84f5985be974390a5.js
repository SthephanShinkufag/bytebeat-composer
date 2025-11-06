t2=t, // Needed so the other "t" doesn't default to the melody

BPM=155,
sR=sampleRate=44.1e3,
sPB=samplesPerBeat=32768,
u=t*abs(BPM/((120*sR)/sPB)),

tt=(t/sR*256)*440*2**(-19/12),

lfo=(x=9,y=0)=>abs(sin(ts*PI/pow(2,x)))+y,

r=repeat=(x,y)=>Array(x).fill(y).flat(9), // Repeat Instances in Array (credit to Greaserpirate)

f=(len=7,exp=1,rmp=0)=> // "f" function: A special kind of wave that its formant can be adjusted
rmp?abs(pow(atan(tan(u/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp)): // Condition added to prevent NaN values from appearing in negative numbers
-abs(pow(atan(tan(u/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp))+1
,

seq=(
x, // Array
y=13, // Length
z=0 // Enable Custom Sequencing (great for making new melodies)
)=>z?x[y]:x[(u>>y)%x.length], // Non-Melodic Sequence

mseq=(
x, // Array
y=13, // Length
mode="parse", // Mode: (Array = Number Array, Parse = parseInt() function)
z=0 // Enable Custom Sequencing (great for making new melodies)
)=>{

var T = tt

if(mode=="parse"){
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0
} else if(mode=="array"){
T=tt*2**((seq(x,y)/12))||0
} else {
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0
};

return T

},

env=(
al=14, // Attack Length
ae=.2, // Attack Formant
dl=14, // Delay Length
de=lfo(18,.3), // Delay Formant
st=0, // Sustain Length
sv=1 // Sustain Volume
)=>seq(

dl>-1?(al>-1?
[f(al,ae,1)].concat(r(st,sv),f(dl,de)):
r(st,1).concat(f(dl,de))):(al>-1?
[f(al,ae,1)].concat(r(st,sv)):
r(st,1))

,13),

wf=(
T=t, // "t" Substitute
mode, 
/* Wave Modes:
sin = Sinewave
tri = Triangle Wave
sth = Sawtooth Wave
sqr = Square Wave
bt = Convert Floatbeat to Bytebeat
*/
amp=1, // Amplitude
exp=1 // Exponent Multiply, will work differently on Square and Bytebeat Mode
)=>{

var p=T // These functions will make sure that the mode you chosen had chose this wave
if(mode=="sin"){ // Sine Mode
	p=(ph=0)=>sin(T*(PI/128)+ph)
} 
else if(mode=="tri"){ // Triangle Mode
	p=(ph=0)=>asin(sin(T*(PI/128)+ph))/(PI/2)
} 
else if(mode=="sth"){ // Sawtooth Mode
	p=(ph=0)=>atan(tan(T/2*(PI/128)+(PI/2)+ph))/(PI/2)
} 
else if (mode=="sqr"){ // Square Mode
	p=(ph=0)=>((sin(T)<t&t+ph>>6)-0.5)*2
} 
else if (mode=="bt"){ // Convert Floatbeat to Bytebeat
	p=(ph=0)=>((T)&255)/127-1
}
else { // Will default to Sine if no waveform is chosen
	p=(ph=0)=>sin(T*(PI/128)+ph)
}

var wint = p
if(mode!=="sth"){
wint=pow((p()*amp),exp)||-pow((p(PI)*amp),exp) // "||" Gate to prevent NaN outputs from negative inputs
}
else{
wint=pow((p()*amp),exp)||pow((p(PI/2)*amp),1/exp)-1||0
};

return wint

},

/*Feeshbread's Effects (from the Dead Data reverb)*/
/* Reverb 2: Dead Data by Feeshbread */
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

mel='1 4 B RN I G F8BF G 8 B6 8 4 643',

mBass='DD99BBGB',

melC1='886688B8',
melC2='44114484',
melC3='IIGGFFI1',
melC4='NNLLKKRN',

lim1=(x,y)=>(max(min(x,y),-y)),

lfo=(x,y=0)=>y?-(abs(atan(tan(t%((2**x)/2)*PI/(2**x))))/(PI/2))+1:(abs(atan(tan(t%((2**x)/2)*PI/(2**x))))/(PI/2)),

sfx=wf(((tt*1.25/(u&131072?2:1))*(-t>>(u>>13^u>>16/(u&65536?(2**(u>>12&7+2&(u>>15)%(u>>8&2))):1))%8+2&(u&131072?u>>12|u>>10&7:u>>12)%256)/(u&16384?4:2))*(u&8192?[1,,1,,1,,1,1][u>>13&7^-u>>12&5]:[1,1,,1,1,,1,1][u>>12&7^t>>13&5])+128,"sth"),

sfx2 = x => {
t = (mseq(mBass,15)/2+mseq(mBass,15)/x)*2
return (wf((((t)^(t)/2)*(u&32768?u>>10&(u>>14&5):1))*(u>>12&(u>>13)%256)+(u>>12)|t,"sin"))*(u&32768?[,1,,,1,,,1][u>>17&5^-u>>15&7]:[,1,,,1,,1,1][u>>13&7^t>>16&5])||0

},

ins = (t, uni) =>{
t = mseq(mel,31&(11&u>>12)+(u>>14),"parse",1)*2
return lpf((wf(t&t*uni,"tri")+wf(t&t*round(uni),"tri"))*env(-1,0,12,3),env(-1,0,12,3))
},

bs = x => {
t = mseq(mBass,15)/4+mseq(mBass,15)/x
return lpf(wf((u&16384?(u&8192?t^t/2:t^t*2):t)-(wf(t*(2**round(sin(u>>12^u>>15))),"tri")*128),"sth",1,3),lfo(16))
},

bs2 = x =>{
t=mseq(mBass,15)/2;
h=0;a=1e-4;b=.002;
for(i=1;i<x;i++){
n=(2*PI)*b*i*t-a*(i*25)*(-i*35+((u>>8)%20));
h+=sin((n/1.04))/i}
return h*.5
},

l2=((u%seq([16384,32768,8192,16384],13)>>8)+1),
sb=bs2(t&16384?(32-l2):(32+l2)),

c = (x, y, z) =>{

t=mseq(x,15)*2

return wf(t,"sth")/4+wf(t/y,"sth")/4+wf(t/z,"sth")/4

},

ccomp=(x,y)=>(c(melC1,x,y)+c(melC2,x,y)+c(melC3,x,y)+c(melC4,x,y))*seq([1,1,,,,1,,,1,,,,,seq([1,],12),,seq([1,],12),],13)||0,


kk=atan(sin(16*cbrt(u%16384)**.7))%256/(u%16384)*2048||0,
hh=((((1&t2)-.5)*random())/(u%4096)*1024)*seq([,1,,1])||0,
rd=(((1&t2)-.5)*(sin(t2*t2>>6^1.2))*env(-1,0,12,2))*.5,
sn=(sin(t2>>2^.9*t2>>4^1.2))*env(13,.6,14,.2)/1.5+wf(t2*1.07)*env(-1,0,14,.2)/1.5*seq([,1,,1],14)||0,

M=x=>
tanh(atan(((cmp(tanh(
tanh(cmp(dly(ccomp(x?1.99:2.01,x?1.98:2.02),rvrbHeads[x],.2,x=>tanh(bpf(x-2,.2,.125)/8e3))
,100,.2,.4,.1e-3))*2+
sfx2(x?1.99:2.01)+
sfx+ins(t,x?1.99:2.01))
,50,.7,.01,.2e-3))*170
+((bs(x?3.99:4.01)*1.25+sb*2.25)*2.5+(sn*4.5+kk*6+hh*5+rd*4))*60)
/6e4)*250),

[M(0),M(1)]