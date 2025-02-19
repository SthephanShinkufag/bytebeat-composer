//logical && and || test
//by hcdphobe, date: 29-03-2023
volume=100, //the volume
x=volume>100?0:volume<0?0:volume/100, //check exceeds and below 0 and mute it
samp_rate=44100,
p=256,
beat=p*t/samp_rate,
v=beat/825,
//shortcuts for your plesure
p=pow,
l='length',
q=int,
//the notes
//meantone (81/80==1)
_1=1,
_2=2,
_3=p(5,0.25)*2, //uses p from shortcuts
_4=_2*_2,
_5=5,
_6=_2*_3,
_8=_4*_2,
_9=_3*_3,
_10=_2*_5,
_12=_4*_3,
_15=_3*_5,
_16=_8*_2,
a=110*beat,
e=a*_3/_4,
b=e*_3/_2,
fs=b*_3/_4,
cs=fs*_3/_4,
gs=cs*_3/_2,
d=a*_2/_3,
g=d*_4/_3,
c=g*_2/_3,
f=c*_4/_3,
as=f*_4/_3,
ds=as*_2/_3,
//the notes pitch
//note: the division is the low pitch and the multiplier is the high pitch
s2=2,
s3=4,
s4=8,
s5=16,
//two logical and
r1=[d,ds,f,ds],
r1=r1[q(v)%r1[l]]&192&&32,
r2=[a,as,d*s2,as],
r2=r2[q(v)%r2[l]]&128&&32,
//one logical or
r3=[fs,f,fs,f,fs,f,fs,f,a,gs,a,gs,a,gs,a,gs,d*s2,cs*s2,d*s2,cs*s2,d*s2,cs*s2,d*s2,cs*s2,as,as/s2,as,as/s2,as,as/s2,as,as/s2],
r3=((((r3[q(v*8)%r3[l]]/4)&31)+40&64||64-v*2**11)-64)&255,
(r1+r2+r3/4)*x