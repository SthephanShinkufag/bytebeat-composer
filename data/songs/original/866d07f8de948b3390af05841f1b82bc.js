t2=t,

BPM=172,
sR=sampleRate=48e3,
sPB=samplesPerBeat=32768,
u=t*abs(BPM/((120*sR)/sPB)),

tt=(t/sR*256)*440*2**(-14/12),
ts=u,

r=repeat=(x,y)=>Array(x).fill(y).flat(9), // Repeat Instances in Array (credit to Greaserpirate)

f=(len=7,exp=1,rmp=0)=> // "f" function: A special kind of wave that its formant can be adjusted
rmp?abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp)): // Condition added to prevent NaN values from appearing in negative numbers
-abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp))+1
,

seq=(
x, // Array
y=13, // Length
z=0 // Enable Dubstep Mode (uhhh...)
)=>x[(z?(ts&ts>>y):(ts>>y))%x.length], // Non-Melodic Sequence

mseq=(
x, // Array
y=13, // Length
mode="parse", // Mode: (Array = Number Array, Parse = parseInt() function)
z=0 // Enable Dubstep Mode (uhhh...)
)=>{

var T = tt

if(mode=="parse"){
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0
} else if(mode=="array"){
T=tt*2**((seq(x,y)/12)||0)
} else {
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0
};

return T

},

lfo=(x=9,y=0)=>abs(sin(ts*PI/pow(2,x)))+y,

env=(
al=14, // Attack Length
ae=.2, // Attack Formant
dl=14, // Delay Length
de=lfo(18,.3), // Delay Formant
st=0, // Sustain Length
sv=1 // Sustain Volume
)=>seq(

al>-1?
[f(al,ae,1)].concat(r(st,sv),f(dl,de)):
r(st,1).concat(f(dl,de))
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

t?0:fx=r(29e3,0), // Effect Variable, by Greaserpirate

fxi=F=0, // Iterator, resets to 0 at every t

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

// Arrays

mel='07A 07C 07CFEFAC'.repeat(4).concat('AA 55 77 33 237233 77 AA 88 ACFE'.repeat(2)),

melBass='0735078500738857',

c1=[0,7,3,5,0,7,8,5,0,0,3,2,8,8,5,7],

c2=[3,10,7,10,3,10,12,10,3,7,7,7,12,12,10,10],

c3=[7,12,12,14,7,12,15,14,7,8,12,10,15,15,15,14],

c4=[10,15,17,19,10,15,17,19,10,17,15,14,17,17,19,17],

/* Used for Variable Shortcuts */

v=mseq(mel)*2,

vB=mseq(melBass,16)/4,

// Instruments

chrd=(x,y)=>mseq(x,16,"array")/2%128+mseq(x,16,"array")/y%128,

sfx=x=>wf(((ts>>2)*((ts/4)>>5|(ts/4)>>8)>>((ts/4)>>16))&(255-x),"bt"),

sfx2=wf(mseq(mel,13,"parse",1),"sin",1,env(-1,1,13))/2*env(0,0,12,3),

ins=x=>(((wf(v^ts>>12,"bt")/2+wf((v^ts>>12)/x,"bt")/2)+((wf(v,"sth")/2+wf(v/x,"sth")/x)/2))),

bs=x=>wf(vB^vB/x,"tri"),

ccomp=x=>wf(chrd(c1,x)/4%64+chrd(c2,x)/4%64+chrd(c3,x)/4%64+chrd(c4,x)/4%64,"sth")*env(15,.4,15),

// Drums (credit to PrincessPriscillaPT)

kk=atan(sin(8*sqrt(u%4096)**.6)*(1-u/4096%1)*!(u>>12&1))*5*seq('1000010010010100',12),

sn=(((tanh(sin((8e6+u%16384*sqrt(2))*(1-(1/(u%16384*400+.4))*6)/75)*(max((1-u%16384/8192*2),0)**1)*(1-u/8192%1)*!(u>>13&1))*(u>>14&1)*440*(1-u/16384%1)**.5)+(fb1=bpf(fb1*.5+n(.6)*300*(1-((u/32768+.5)%1))**4,.301,.4)*.1**(1e3/(u%16384)))*6))/128,

hh=bbf((min(1,max(-1,tan(t*(random()-.5))/5)))*(1-(u/8192)%1)**5,.2,.25,-1)*1.5,

// Master

M=x=>
atan(cmp(cmp(dly(
(ins(x?.99:1.01)/2+ins(x?.98:1.02)/2)*250+
ccomp(x?1.99:2.01)*80,
rvrbHeads[x],.285,x=>tanh(bpf(x-2,.2,.125)/200)*500
)*4e3
,20,2,.01,.2e-3)*90
+
bbf(lpf(bs(x?.499:.501),.05,.7)*100+
cmp(ccomp(x?1.99:2.01),20,2,.01,.2e-3)*400+
+(sfx(x?0:28)*45+(sfx2*55)||0),
.01,.2,-.5)*30+
bbf((kk+sn)*150+hh*125,.2,.1,-.5)*25,
50,1,.01,.1e-3)/200)*7,

[M(0),M(1)]