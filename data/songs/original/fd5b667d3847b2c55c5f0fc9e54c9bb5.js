speed=.75,
tune=.66667,

T=t*tune,
þ=t*speed,

bt=beat=(len,spd)=>(þ>>spd)%len,
seq=(arr,spd)=>T*2**(arr[bt(arr.length,spd)]/12),
seq2=(arr,spd,T=t)=>arr[(T>>spd)%arr.length],
dec=(ramp,spd,vol)=>((þ*ramp)&(4096*spd)-1)/vol,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,

t2=t,
t?0:fx=r(4e4,0), // Effect Variable, by Greaserpirate

fxi=0, // Iterator, resets to 0 at every t

// Effects (Code by Greaserpirate)
rv=reverb=(x,len=16e3,feedb=.7,dry=.4,wet=1,dsp=2,T=t2)=>(
	ech=y=>fxi+(0|(y%len)/dsp),
	x=x*dry+wet*fx[ech(T)]||0,
	t2%dsp?0:fx[ech(t2)]=x*feedb,
	fxi+=0|(len/dsp),
	x
),

lp=lopass=(x,f)=>( // f ~= frequency, but not 1:1
	// fx[fxi] is the value of the last sample
	// You will need to change the 'x % 256' if you're using signed or floatbeat
	x=min(max(x%256,fx[fxi]-f),fx[fxi]+f), // Clamp the change since last sample between (-f, f)
	fx[fxi]=x,
	fxi++,
	x
),

// Sounds kinda off, and hipass+lopas=/=original when you use ^, but + sounds harsher
hp=hipass=(x,f)=>(x%256)^lp(x,f),

lim=limiter=(x,sp=.1)=>(
	x&=255,
	mi=fx[fxi]=min(fx[fxi]+sp,x,255),
	mx=fx[fxi+1]=max(fx[fxi+1]-sp,x,mi+9),
	fxi+=2,
	(x-mi)*255/(mx-mi)
),


a=PI/2,

mel=[
0,12,7,10,
3,7,5,10,
2,5,3,2,
-2,3,2,0],

mel2=[
-5,2,3,5,
0,2,2,5,
-2,0,0,-2,
-5,0,-2,-5],

melBass=[0,0,7,3,-4,-4,5,2],

ins=arr=>(sin(seq(arr,13)*a/64)*128+128^t*a/256^sin(seq(arr,13)*a/64.1)*128+128),

bass=(seq(melBass,16)^seq(melBass,16)/2+seq(melBass,16)+32*sin(seq(melBass,16)*PI/64)+32)/2,

// Breakbeat Drum Machine (by Greaserpirate), And Percussions
ls=sin(t2/9&t2>>5),
s=seq2([ls,0],9,þ),
S=seq2([ls,0],8,þ),
h=1&t2*441/480,

kseq=[1,,1,,1,,1,],

sseq=[,ls,,s,ls,s,],

hseq=[h,h,,h,h,,h,h],

dm=drum=(arr,spd,vel=2e4,vol=1,T=t,oct=0)=>
	m(vel/(T/4&(2**(spd-oct)/seq2(arr,spd,þ/4))-1),vol),

kick=dm(kseq,11,9e4,8,þ),

snare=dm(sseq,10,1.1e8,8,þ),

hihat=dm(hseq,10,6e3,8,þ),

//Formula

kmaster=m(lim(kick,.5),.5)+m(lp(kick,1),.4),

bascomp=(m(bass,.3)+m(bass*4,.3)+m(bass*2,.3)^m(seq(melBass,16),.2)),

perc=m(kick,.375)+m(snare,.25)+m(hihat,.4),

mxcomp_L=m(m(ins(mel),.45),.925)*dec(-1,1,3.6e3)+m(bascomp,.25),
mxcomp_R=m(m(ins(mel2),.375),.9)*dec(-1,1,3.5e3)+m(bascomp,.2),

[

m(mxcomp_L,.9)+m(perc,.75),
m(mxcomp_R,.9)+m(perc,.72),

]