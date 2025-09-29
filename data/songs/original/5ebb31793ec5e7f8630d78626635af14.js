// Important Vairables

T=t,

tune=1.55,
speed=1.5,

tt=t*tune,
ts=t*speed,

t2=t,

// Main Vairables

b=x=>atan(tan(asin(sin(x*(PI/128))))), // Augmented Wave
bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
pseq=(char,spd=13,pitch=1)=>(tt*pitch*tune)*2**
(parseInt(char[bt(char.length,spd)],36)/12)||0,
seq=(arr,spd=13,pitch=4)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
c=bytebeat=code=>((code)&255)/127-1,
cs=(T,pitch=64)=>sin(T*PI/pitch)*128+127.5,

dec=(ramp,spd,vol)=>((ts*ramp)&(4096*spd)-1)/vol,
dec2=(ramp,spd,vol)=>((ts*ramp)&(4096/spd)-1)/vol,
pluck=plk=(amp,spd)=>(1.1+(ts)/spd%32)*amp,

t?0:fx=r(4e4,0), // Effect Variable, by Greaserpirate

fxi=F=0, // Iterator, resets to 0 at every t

// What you see here is Greaserpirate's Reverb Code
rv=reverb=(x,len=16e3,feedb=.7,dry=.4,wet=1,dsp=2,T=t2)=>(
	ech=y=>fxi+(0|(y%len)/dsp),
	x=x*dry+wet*fx[ech(T)]||0,
	t2%dsp?0:fx[ech(t2)]=x*feedb,
	fxi+=0|(len/dsp),
	x
),

// Sequences

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

sseq=[,8,,8],

// Instruments

ins1=ins1L=(k=seq(mel),(b(k*(mp/m2)%8192/(k*mp%8192>>8))|b)/((ts%8192/1024)/4)||0),

ins1R=(k=seq(mel),(b(k*(mpR/m2)%8192/(k*mpR%8192>>8))|b)/((ts%8192/1024)/4)||0),

chrdLayer=mel=>
b((sin(seq(mel,17,2)*PI/256)*128+127.5)%(sin(seq(mel,17,2)*PI/255)*128+127.5)-128)/4,

chrd=chord=
chrdLayer(melC1)*dec(1,8,2e4)+
chrdLayer(melC2)*dec(1,8,2e4)+
chrdLayer(melC3)*dec(1,8,2e4),

lead=(kl=seq(melL,14,8),b((kl/4)&ts>>6))*dec(.5,4,2e4),

bass=((k2=seq(melb)/8,c(k2^k2/2|k2|ts>>5|k^k2)*c(k2^k2/2+k2&k2/2|ts>>5))-.5)*c(cs(k2/2)^cs(k2/2)/(ts%8192>>9))*dec(-.5,1,9e3),

bass2=c(k2>>k2/8)*dec(.5,4,2e4),

// Percussions

h=(441/480)*T,

hihat=hh=((h&1)||sin(t*t>>5)/2)*dec(-1,2,4e4),

kick=kk=sin(cbrt(ts%32768)*6),

snare=sn=sin(t*t>>9*t)*dec(-1,sseq[bt(sseq.length,15)],10e4),

// Master

[
m(rv(m(ins1,.5),11E3,.7,.8,.6),.45)+m(lead,.55)+

(m(bass,.75)+m(bass2,.675))+(chrd+.125)+

m(kk,.6)+hh+m(rv(sn,16.5E3,.75,.95,.6),.5),
m(rv(m(ins1R,.5),5.5E3,.5,.9,.6),.55)+m(lead,.65)+

(m(bass,.75)+m(bass2,.75))+(chrd+.125)+

m(kk,.675)+hh+m(rv(sn,16.5E3,.8,.9,.6),.5)
]