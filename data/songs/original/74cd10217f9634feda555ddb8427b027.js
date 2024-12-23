bci=3.24551233566, //for modulation
volume=100, //the volume
x=volume>100?0:volume<0?0:volume/100, //check exceeds and below 0 and mute it
samp_rate=32000,
p=256,
beat=p*t/samp_rate,
v=beat/128,
o=1.0216,
k=beat*32,
//shortcuts for your plesure
p=pow,
l='length',
q=int,
S=function(x){
return sin(x*PI/128)
},
C=function(x){
return cos(x*PI/128)
},
T=tan,
X=exp,
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
fun=[a,d*s2*1.0460],
r1=fun[q(v/4)%fun[l]]/o/2,
G=S(r1+(X(C(r1))**sin(v/bci)*3.4)*sin(v/bci)*128+T(C(r1))*128)/6,
r2=2*fun[q(v/4)%fun[l]]/o*(3-((k>>9)%4)+((k>>8)%4))>>((-k>>(k&4096?2:16)&3)),
V=S(r2+T(C(r2))*128)/4*((-beat)%64+64)/63,
U=sin(random()*t)*(5000/(beat%32+3))/4096+sin(20*(beat%128)**.5)/3,
(G+V+U)*x