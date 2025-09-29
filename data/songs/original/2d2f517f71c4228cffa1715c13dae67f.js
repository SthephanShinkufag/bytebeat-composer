/* ---- Important Variables  ---- */

BPM=172, /*BPM: Beats Per Minute*/
sR=sampleRate=48e3, /*Samplerate*/
sPB=samplesPerBeat=32768, /*Timing*/
r=t*abs(BPM/((60*sR)/sPB)), 
// Extract Speed
lm=(a,mn=50,mx=-50)=>min(mn,max(mx,a/100)), // Limiter

tune=.7, // Master Tuning
speed=1, // Master Speed

tt=(t/sR*256)*440*2**(-33/12), // Overall Pitch
ts=r, // Overall Speed

/* ---- Functions ---- */

w=wave=( // Sine Wave
T=tt, // "T" Variable Substitute
p=1, // Pitch
a=1 // Amplitude
)=>sin(T*PI/(128*p))/a, 

s=saw=( // Saw Wave
T=tt, // "T" Variable Substitute
p=1, // Pitch
a=1 // Amplitude
)=>atan(tan(T*PI/(128/p)))/((PI/2)/a),

b=bytebeat=code=>((code)&255)/127-1, // Convert Floatbeat to Bytebeat

r=repeat=(
x, // Repeat Instances of the array
y // The value to fill the array
)=>Array(x).fill(y).flat(9), // Repeat Instances in Array (credit to Greaserpirate)

seq=a=(
x, // Array
y=13 // Speed, using the ">>" dividend which gets slower every powers of 2, so it means that a lesser number is faster
)=>
x // Array
[(ts>>y) // The constant gets divided by "y" in the powers of 2, which will get slower for every power of 2
%x.length // Gets the length of the array
], // Non-Melodic Sequence

mseq=( // Melodic Sequence, comes in 2 modes:
x, // Array Melody
y=13, // Speed by powers of 2
m=0, // Switch Modes (0 = Array Mode, 1 = parseInt Mode),
T=tt // The "T" Variable that can be used
)=>
(m>0?(T*2**(parseInt(seq(x,y),36)/12)||0):
T*2**((seq(x,y)/12)||0)
), // Melodic Sequence

f=(len=7,exp=1,rmp=0)=> // "f" function: A special kind of wave that its formant can be adjusted
rmp?abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp)): // Condition added to prevent NaN values from appearing in negative numbers
-abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp))+1
,

p=(x1=1,x2=16384)=>(t%((x2)/x1))>>8, // Legacy Delay

lfo=(
x=9, // Speed, gets 2x slower by each powers of 2 (2^x)
y=0 // Amplitude (minimum value)
)=>abs(sin(ts*PI/pow(2,x)))+y, // LFO Function: Used to automate certain variables

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

/* ---- Melodies ---- 
> Main Melodies
*/

mel='BPIFKDMKFIHAHIHD', // Primary Melody: Uses "parseInt()"

mel2='356ADFHDIHDA8651', // Secondary Melody: Uses "parseInt()"

/* Chord Melodies */

c1=[-1,1,3,6], // First Voice, Base

c2=[3,5,6,10], // Second Voice, Third

c3=[6,8,10,13], // Third Voice, Seventh

c4=[10,13,15,17], // Fourth Voice, Tenth

/* ---- Instruments ---- */

ins=-((pow(sin(mseq(mel,14,1)*PI/64),(abs(lfo(17)*(lfo(20)*512))*sin(ts%16384/131072)))||0)-.5)*env(-1,0,14,lfo(19,.25)), // Primary Instrument

ins2=x=>(mb=mseq(mel2,14,1,tt*4),b(mb^mb/x|mb*2)*w(mb)/x)*env(-1,0,14,lfo(19,.25)), // Secondary Instrument

c=x=>w(mseq(x,16))*b(mseq(x,16)^mseq(x,16)*1.995)/5, // Chord Function: Adds voices from different sequences to create a chord effect
chrd=c(c1)+c(c2)+c(c3)+c(c4), // Main Chord 

bs=x=>(m2=mseq(c1,16),(w(m2)*s(m2)+w(m2)*b(m2^m2/x+m2|m2)*5)/4), // Bass

/* ---- Percussions ---- */

kk=atan(.05*sin(8*sqrt(ts%32768)**.55))*64*env(-1,0,15,.45)||0, // Kick

h=t*(441/480), // This variable will get the crispy 44.1kHz Bell Sound
hseq=[1,0,0,0], // Hihat Sequencing, using multiplier by subtracting the ">>" dividend to make it 2x faster

sseq=[,1,
a([,1/2],14) /*An additional sequence with the "n-1" speed divident is made for sub-melodies that don't fit the grid*/
,1], // Snare Sequencing

hh=(((h&1)/4)-.125)*b(ts*sin(-ts)&127)*env(-1,0,14-a(hseq,14),.12)*100, // Hihat, the bell and the sin() noise is combined

sn=((b(t*tan(t>>1)*tan((t*2)>>3))*env(15,.2,15,2)*seq(sseq,15)||0)+(asin(tanh(w(t)))*env(-1,0,15,.5))*seq(sseq,15)||0)/2, // Snare, tan() noise and sinewave combined, envelope has attack to recreate the transient

/* ---- Master ---- */

M=x=> // Mixing
atan(cmp(cmp(dly( // In order to prevent distortion that makes the mix bass-boosted

(ins*4)*256+ins2(x?1.995:2.005 /*x?Right:Left*/)*4*256,

rvrbHeads[x],.6,
x=>tanh(bpf(x,.06,.8)
/100)*50)
,2,.08,.2,.001)*75+

lpf(chrd*22,lfo(19,.25),.1)*200*env(15,.75)+

bbf(lpf(bs(x?1.995:2.005),.3,.1),.2,.1,-.5)*384+

bbf(hh*45+kk*128+sn*256,.2,.1,-.5)*20

,50,1,.06,1e-3)/200)*3.5,

[M(0),M(1)] // Overall Master