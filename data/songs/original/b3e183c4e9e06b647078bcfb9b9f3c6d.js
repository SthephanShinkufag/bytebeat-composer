tune=1.05,
speed=.88,

tt=t*tune,
ts=t*speed,

bt=beat=(len,spd)=>(ts>>spd)%len,
seq=(arr,spd,T=tt)=>T*2**(arr[bt(arr.length,spd)]/12)||0,
seq2=(arr,spd,T=tt)=>arr[(T>>spd)%arr.length]||0,
dec=(ramp,spd,sust)=>((ramp)-ts%(8192/spd)/sust),
dec2=(ramp,spd,vol)=>(ramp-ts&(8192/spd)-1)/vol,
pluck=(amp,spd)=>(1.25+(ts)/spd%32)*amp,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
b=by=bytebeat=code=>(((code)&255)/127)-1,


fm=(x,y,s1,s2)=>sin(PI/64*x+cos(PI/64*y)+3*cos(PI/64*x)*(1-ts/(16384/s1)%1)+4*sin(PI/64*y*2)*(1-ts/(32768/s2)%1)),

a=tt*PI/64,

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

m1=m1_a=[
0,,2,3,2,,-2,,-5,,-2,,-7,,,,
][bt(16,12)],

m1_b=[
,,-5,,,,-5,,-7,,-5,,-12,,,,
][bt(16,12)],

m2=m2_a=[
7,7,5,5,7,7,0,0,,,7,7,5,5,,,
][bt(16,12)],

m2_alt=[
7,7,5,5,7,7,0,0,,,0,0,7,7,,,
][bt(16,12)],

m2_a_1=[
7,7,5,5,7,7,0,0,,,7,7,3,3,,,
][bt(16,12)],

m2_a_2=[
7,7,5,5,7,7,0,0,,,7,7,7,8,8,8,
][bt(16,12)],

m2_b=[
5,5,3,3,5,5,-2,-2,,,5,5,3,3,,
][bt(16,12)],

m2_b_1=[
5,5,5,5,3,3,2,2,,,-2,-2,5,5,,
][bt(16,12)],

m2_b_2=[
10,10,10,5,5,,5,5,,,,,3,5,3,
][bt(16,12)],

m3=[
2,2,2,2,-2,-2,-2,-2,10,10,10,10,12,12,12,12
][bt(16,12)],

m3_b=[
2,2,2,2,-2,-2,-2,-2,10,10,10,10,5,5,7,7
][bt(16,12)],

m4=[8,8,8,8,7,7,5,5,5,5,5,5,,,10,10][bt(16,12)],

m4_a=[10,10,10,10,8,8,8,8,7,7,7,7,10,10,10,10][bt(16,12)],

m4_b=[10,10,10,10,10,10,12,12,12,12,12,12,12,12,12,12][bt(16,12)],

m4_b_2=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,][bt(16,12)],

m4_c=[14,15,15,15,15,15,14,14,14,14,14,14,10,10,10,10][bt(16,12)],

m4_d=[7,7,7,7,8,8,10,10,10,10,10,10,8,8,8,8][bt(16,12)],

m4_d_2=[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8][bt(16,12)],

m4_d_3=[7,7,7,7,7,7,7,7,7,7,,,5,5,7,7][bt(16,12)],

m4_d_4=[12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12][bt(16,12)],

mel=[
m1,m1_b,
m1,m1_b,

m1,m1_b,
m1,m1_b,

m1,m1_b,
m1,m1_b,

NaN,m2,
m2,m2_b,

m2_b_1,
m2_alt,m2_a_2,

m2_b_2,m3,
m2,m2,

m2_b,m2_b_1,
m2_alt,m2_a_2,

m2_b_2,m3_b,
m4,m4_a,

m4_b,m4_b_2,
m4_c,m4_d,

m4_d_2,m4_d_3,
m4,m4_a,

m4_b,m4_b_2,
m4_c,m4_d,

m4_d_4,m4_d_4


],

!t&&(
c1=[
-5,-5,-5,-5,
-5,-5,-5,-5,
-5,-5,-5,-5,
0,0,0,0,

0,0,0,0,
-4,-4,0,0,
-3,-3,-3,-3,
-4,-4,-4,-4,

0,0,-5,-5,
-4,-4,-4,-4,
-3,-3,-3,-3,
0,0,0,0,

,,,,

-5,-5,-5,-5,
-4,-4,-4,-4,
-7,-7,-7,-7,
-10,-10,-10,-10,

-5,-5,-5,-5,
-4,-4,-4,-4,
-7,-7,-7,-7,
-10,-10,-10,-10,

-5,-5,-5,-5,
-4,-4,-4,-4,
-7,-7,-7,-7,
-10,-10,-10,-10,

-5,-5,-5,-5,
-4,-4,-4,-4,
-7,-7,-7,-7,
-10,-10,-10,-10,

-4,-4,-4,-4,
-2,-2,-2,-2,
0,0,0,0,
-5,-5,-5,-5,

-4,-4,-4,-4,
-2,-2,-2,-2,
0,0,0,0,
0,0,0,0,

-4,-4,-4,-4,
-2,-2,-2,-2,
-4,-4,-4,-4,
-2,-2,-2,-2,

-4,-4,-4,-4,
-2,-2,-2,-2,
0,0,0,0,
2,2,2,2,

],
c2=[
0,0,0,0,
0,0,0,0,
0,0,0,0,
3,3,3,3,

3,3,3,3,
0,0,3,3,
0,0,0,0,
0,0,0,0,

7,7,3,3,
0,0,0,0,
0,0,0,0,
-5,-5,-5,-5,

,,,,

0,0,0,0,
0,0,0,0,
2,2,2,2,
-5,-5,-2,-2,

0,0,0,0,
0,0,0,0,
2,2,2,2,
-5,-5,-2,-2,

0,0,0,0,
0,0,0,0,
2,2,2,2,
-5,-5,-2,-2,

0,0,0,0,
0,0,0,0,
2,2,2,2,
-5,-5,-2,-2,

0,0,0,0,
2,2,2,2,
3,3,3,3,
0,0,0,0,

0,0,0,0,
2,2,2,2,
3,3,3,3,
4,4,4,4,

0,0,0,0,
2,2,2,2,
0,0,0,0,
0,0,0,0,

0,0,0,0,
2,2,2,2,
2,2,2,2,
7,7,7,7,

],
c3=[
3,3,3,3,
3,3,3,3,
3,3,3,3,
7,7,7,7,

7,7,7,7,
5,5,7,7,
5,5,5,5,
7,7,7,7,

10,10,7,7,
10,10,3,0,
5,5,5,5,
7,7,7,7,

,,,,

3,3,3,3,
3,3,3,3,
-2,-2,-2,-2,
-2,-2,2,2,

3,3,3,3,
3,3,3,3,
-2,-2,-2,-2,
-2,-2,2,2,

3,3,3,3,
3,3,3,3,
-2,-2,-2,-2,
-2,-2,2,2,

3,3,3,3,
3,3,3,3,
-2,-2,-2,-2,
-2,-2,2,2,

3,3,3,3,
5,5,5,5,
7,7,7,7,
3,3,3,3,

3,3,3,3,
5,5,5,5,
8,8,8,8,
7,7,7,7,

3,3,3,3,
5,5,5,5,
3,3,3,3,
5,5,5,5,

3,3,3,3,
5,5,5,5,
7,7,7,7,
11,11,11,11

]
),

b1=b1_a=[
0,,,7,,,10,12,12,12,7,,10,10,12,12,
][bt(16,12)],

b1_b=[
0,,,7,,,-2,0,0,0,-5,,0,0,7,7
][bt(16,12)],

b2=[
0,,,0,,,5,7,0,,,0,,,5,7
][bt(16,12)],

melBass=[
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b2,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
b1,b1_b,b1,b1_b,
],

Bg_1=[1,,,1,,,4,4,4,4,1,,2,2,2,2][bt(16,12)],
Bg_2=[1,,,1,,,1,1,1,,,1,,,1,1,1,][bt(16,12)],

Bgate=[
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_2,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
Bg_1,Bg_1,Bg_1,Bg_1,
],

ins=ins_L=sin(seq(mel,16,tt*PI/32)+cos(seq(mel,16,tt*PI/32)*6)),

ins=ins_R=(sin(seq(mel,16,tt*PI/32)+cos(seq(mel,16,tt*PI/32)*6)))*(cos(seq(mel,16)*PI/8
+sin(seq(mel,16)*PI/16))),

ins2=m((sin(seq(mel,16,tt*PI/32)-cos(seq(mel,16,tt*PI/32))*dec(-1,1,9e2))+
sin(seq(mel,16,tt*PI/32)+sin(seq(mel,16,tt*PI/32))
*dec2(-1,1,7e2))),.75)+.25,

ins3=b(seq(mel,16)^6*seq(mel,16)/2)*sin(seq(mel,16,tt*PI/32)+cos(seq(mel,16,tt*PI/32)))+.25,

insM=insM_L=[
ins,ins,
ins,ins,

ins,ins,
ins,ins,

ins,ins,
ins,ins,

ins,
ins2,ins2,

ins2,ins2,
ins2,ins2,

ins2,ins2,
ins2,ins2,

ins2,ins2,
ins2,ins2,

ins2,[ins2,ins2,ins3,ins3][bt(4,13)],

ins3,ins3,
ins3,ins3,

ins3,ins3,
ins3,ins3,

ins3,ins3,
ins3,ins3,

ins3,ins3,
ins3,ins3,
],

insM_R=[
ins_R,ins_R,
ins_R,ins_R,

ins_R,ins_R,
ins_R,ins_R,

ins_R,ins_R,
ins_R,ins_R,

ins_R,
ins2,ins2,

ins2,ins2,
ins2,ins2,

ins2,ins2,
ins2,ins2,

ins2,ins2,
ins2,ins2,

ins2,ins3,
],

inscompL=inscomp=
rv(m(insM[bt(insM.length,16)]
*dec(1,2,1e4),.5),5e3,.7,.4,1,1),

inscompR=
rv(m(insM[bt(insM.length,16)]
*dec(1,2,1e4),.5),5e3,.675,.65,1,1),

!t&&(
fgate=[
1,1,1,1,
1,1,1,1,

1,1,2,2,
1,1,1,1,

2,2,2,4,
1,1,1,1,

,,1,1,
1,1,1,1,

2,2,1,1,
1,1,1,1,

2,2,1,1,
1,1,1,1,

2,2,1,1,
1,1,1,1,

2,2,1,1,
1,1,1,1,

1,1,1,1,
1,1,1,1,

1,1,1,1,
1,1,1,1,

1,1,1,1,
1,1,1,1,

1,1,
]),

chf=mel=>((m(m(sin(seq(mel,14)*PI/64+sin(seq(mel,14)*PI/64)),.6)*dec(-1,(1/8)*fgate[bt(fgate.length,15)],2.5e3),.2))*m(sin(seq(mel,14)*PI/64+sin(seq(mel,14)*PI/64)),.55))+m(sin(seq(mel,14)*PI/64),.6),

chord=m(chf(c1),.33)+m(chf(c2),.33)+m(chf(c3),.33),

bass=fm(seq(melBass,16)/4,seq(melBass,16)/8,4*(1/Bgate[bt(Bgate.length,16)]),2*(1/Bgate[bt(Bgate.length,16)]))||0,

kseq=[1,1,1,1,1,1,1],
n=40*log(ts%16384/kseq[bt(kseq.length,12)]),
kick=tan(asin(tanh(tanh(sin(n*kseq[bt(kseq.length,12)])))))||0,

sseq=[1,2,1,2,1,2,1,1],
snare=snareL=(sin(t/2^t/3>>1^3*sin(t))||0)/pluck(.5,(256/sseq[bt(sseq.length,13)]))*dec(1,sseq[bt(sseq.length,13)],1e4)||0,

snareR=(sin(t/3^t/4>>3^5*sin(t))||0)/pluck(.5,(256/sseq[bt(sseq.length,13)]))*dec(1,sseq[bt(sseq.length,13)],1e4)||0,

cseq=[,,,,1,1,1,1],
clap=((round((sin(t*PI/256*cos(t>>3^6))))*dec2(cseq[bt(cseq.length,12)],1/2,8e3))/pluck(.5,512)),

hseq=[,,,1,,,,1],
hihat=hhat=(1&(t*441)/480)/pluck(.4,256*hseq[bt(hseq.length,13)])||0,

clap_comp=rv(clap,0,.5,.3,1,1)*tanh(sin(t*PI/16))/3,

mxcompL=
m(inscompL,.875)+
m(chord,.375)+
m(bass,.25),

mxcompR=
m(inscompR,.95)+
m(chord,.375)+
m(bass,.25),

percomp=percompL=
(m(m(kick,.7)-.3)+
m(snareL,.75)+
rv(clap,0,.5,.3,1,1))+
m(hihat,1.5),

percompR=
(m(m(kick,.7)-.3)+
m(snareR,.75)+
rv(clap,2,.6,.4,1,1))+
m(hihat,1.5),

[

m(mxcompL,.88)+
m(percompL,.95),
m(mxcompR,.92)+
m(percompR,.925)

]

// 2144897

// 3378946