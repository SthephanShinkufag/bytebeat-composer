volume=100, //the volume
x=volume>100?0:volume<0?0:volume/100, //check exceeds and below 0 and mute it
samp_rate=192E3,
p=256,
beat=p*t/samp_rate,
q=8.75,//used for kicks and hats
//some shortcuts
p=pow,
S=function(x){
return sin(x*PI/128)
},
C=function(x){
return cos(x*PI/128)
},
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
r1=[d,0,d,0,d,0,d,e,0,d,e,0,d,e,0,0],
r1=r1[int(beat/35)%r1.length]*s4,
r2=[d,e,fs,g],
r2=r2[int(beat/16/35)%r2.length]*s4,
r3=[a/s2,d,e,d],
r3=r3[int(beat/4/35)%r3.length]*s4,
//constructor
FmVar = {
synthesis : function(x){
this.CI??=0;
t=0?CI=0:CI=r1;
CI+=sin(21.99)*t;
return C(x/2+S(x/2)*18-C(CI*1)*128)*128
},
synthesis2 : function(x){
this.CI??=0;
t=0?CI=0:CI=r2;
CI+=sin(11.01)*t;
return C(x/2+S(x/2)*18-C(CI*1)*128)*128
},
synthesis3 : function(x){
this.CI??=0;
t=0?CI=0:CI=r3;
CI+=sin(87.96)*t;
return C(x/2+S(x/2)*18-C(CI*1)*128)*128
}
},
//drums
kick=S(1000/(beat/q%16+.2))*(-beat*16/q&255)/768,
hat=S(random(beat))*(-beat*64/q&255)/12,
hat=[hat,0,hat/2,0][int(beat/q/4)%4],
//main
((S(r1+FmVar.synthesis(r1))+S(r2+FmVar.synthesis2(r2))+S(r3+FmVar.synthesis3(r3)))/8+kick+hat)*x