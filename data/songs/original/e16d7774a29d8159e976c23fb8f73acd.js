// CRYSTALIZED CAVES
// By Sentle.
// You saw a planet full of caves with their unknown minerals while flying around the space. You're filling with curiosity and deciding to discover it with more detail. It was warm and the sun shined through the exoplanet. It seems it has to be summer there...
// Length: 4min 41sec.
// Performance: Slow, ~0.44 s/s.
// Supposed to be a song without any number written in this code, but yes. For one day left doing this would be very complicated.

t||(Bf=[],Ba=[],
// Filters are originally from Feeshbread.
// Low-pass filter
lp=(x,i)=>(c=Cn++,Bf[c]??=0,Bf[c]+=(x-Bf[c])*i),

// Low-pass filter with resonance
lpR=(x,i,r)=>(c=Cn++,Bf[c]??=Ba[c]??=0,Bf[c]+=Ba[c]+=(x-Bf[c]-Ba[c]*r)*i),

// High-pass filter
hp=(x,i)=>x-lp(x,i),

// += function for kick & snare
F=x=>(c=Cn++,Bf[c]??=0,Bf[c]+=x),

// Interpolation
I=(x,i)=>(c=Cn++,Bf[c]??=Ba[c]??=0,Bf[c]+=Ba[c]+=(x-Ba[c])/i),

// Sequence function
S=x=>2**(x/12)/1.015,
SeqP=x=>parseInt(x,36),

// Bytebeat to floatbeat
btf=f=>f%256/128-1,

// Beats per minute
Bpm=380,

// Sequences
_1='KPQWKPQWLPQXLPQXIUPUIPUIIUNUIPNU',
_2=['KWNWKTNQ','LXPXLUPT','IULUIQLP','IULUIQLP'],
_3='IIIJ',
_4='L',
_5='P',
_6=['KPQU','LPQU','IPQU','NPQU'],
_7='KULUIUNU',
_8='KNKTNKNLIPLQNTQN',
_9='GKGKGUNQLPKQLQPLIUILIUXQNPNUIPLN',
_A='NKPQTUTQNKNPNLNLIPLIKLNPNPQTNLIK'),

// Reverb function (comb-filter is originally from GreaserPirate)
Cb=(x,a,b,c,d)=>(Cno=Cn++,Bf[Cno+t%a]??=0,x=x*c+d*Bf[Cno+t%a],t%1?0:Bf[Cno+t%a]=x*b,Cn+=a,x),
Reverb=(x,c,a,d,w)=>(i=Cb(x,int(1500*a),.3,.5,1,1),(w*(Cb(i,int(10032*c),.9,.5,1,1)+Cb(i,int(13280*c),.9,.5,1,1)+Cb(i,int(6016*c),.9,.5,1,1)+Cb(i,int(5540*c),.9,.5,1,1))+x*d)/4),

// Counter
Cn=0,

// BPM applying function
T=t/180*Bpm,

// Tick function
tck=int(T/32768),

// Transpose
TRN=2+(tck>=584?4:tck>=520?2:tck>=456?0:tck>=296?1:0),

// Volume changing functions
env=x=>btf(T/x)/2+.5,
decay=(t,d,x)=>x**btf(-t/d)*x,
Y=atan(env(128)*1.5),

// Side functions
sdt=x=>x?cos:sin,
sd=x=>x?128:0,

// Instruments
N=x=>sdt(x)(T**20),
Nv=(x,d)=>sdt(x)((T>>d)**20),
s=(x,y,z)=>btf(I(x,y)+sd(z)),
U=(x,y,z)=>(s(x,y,z)+s(x*.985,y,z)+s(x*1.01,y,z)+s(x*.9975,y,z)+s(x*.999,y,z)+s(x*1.005,y,z)+s(x*1.001,y,z))/10,
D=(x,y,z)=>U(S(x+TRN),y,z),
RiserN=x=>atan(sdt(x)((T-262144)/4%262144*(1e4+(T-262144)/4%262144)/16384*PI/128)*PI*2)/2*decay(T,32,2)/4,
Riser=x=>hp(lpR(N(x)*abs(btf(T/1024)),.5,1),.5,1)/1.5,
Ambient=x=>N(x)/64+hp(Cb(btf((T+sd(x))*T/32768&-T*1.5>>6)*(tck>=849?0:1),12288,.5,1,1),.01)/16,
V=(x,z)=>btf((tan(I(S(x+TRN),512)*PI/256)*64+sd(z)&128)+64),
Kick=(x,y)=>atan(.99975**(T%x)*atan(sdt(y)(btf(F((decay(T,x/256,1e20)*5)+S(-17+TRN)))/2*2*PI)*PI/2+N(y)/16)*PI)/2*((T/(x/256))&256?0:1),
Snare=(x,y)=>atan(atan(atan(sdt(y)((btf(F((decay(T,x/256,1e10)*3)+S(6+TRN)))/2+.5)*2*PI))*decay(T,x/256,1e2)*((T/(x/256))&256?1:0)*2+(((T%x)/2048-1)**2*E**-((T%x)/2048-1))*lpR(N(y),.4,3)*2.5*((T/(x/256))&256?1:0)/2)*2)/2,
Hihat=(x,y)=>hp(N(y)*decay(T,x/256,1e5),.5)/1.25,
Ac=(x,y)=>lpR(btf(t*S(x+TRN)),Nv(y,13)/16+.07,1)*decay(T,32,2),
AC=(x,y)=>atan(Ac(x,y)+Ac(x+.05,y)+Ac(x-.05,y))/3,
Lg=(x,y,z)=>lpR(atan(hp(lpR(atan(sdt(z)((I(S(x+TRN),y)%256)*PI/128*-(sin(t*PI/4e4)**2+3))*PI*3*(btf(I(S(x+TRN),y))-1)),.1,1),.1)*PI*2),.25,1)/4,

// Stereo
Re=x=>atan(Riser(x)*(tck>=812?0:tck>=804?1:tck>=780?0:tck>=772?1:tck>=716?0:tck>=708?1:tck>=652?0:tck>=644?1:tck>=588?0:tck>=580?1:tck>=524?0:tck>=516?1:tck>=460?0:tck>=452?1:tck>=396?0:tck>=388?1:tck>=332?0:tck>=324?1:tck>=268?0:tck>=260?1:tck>=204?0:tck>=196?1:tck>=172?0:tck>=164?1:tck>=140?0:tck>=132?1:tck>=108?0:tck>=100?1:tck>=44?0:tck>=36?1:tck>=12?0:tck>=4?1:0)+(tck>=870?0:tck>=8?1:0)*atan((Ambient(x)+Cb(atan(lpR(sin(D(SeqP(_1[(T>>14)%32])-36,1024,x)*2*PI),.33,1)),12288,.5,.5,1,1)/2*(tck>=808?0:tck>=730?1:tck>=712?env(4096):1)+Reverb(lp(V(SeqP(_2[(T>>17)%4][(T>>13)%8])-12,x),.5)/2*(tck>=712?0:1)+lpR(atan(V(SeqP(_3[(T>>16)%4])-12,x)+V(SeqP(_3[(T>>16)%4]),x)+V(SeqP(_4),x)+V(SeqP(_5),x)),.3,2)*env(128)/2*(tck>=808?0:tck>=744?1:tck>=392?0:tck>=360?1:tck>=132?0:tck>=104?1:tck>=40?0:tck>=24?1:0)+sdt(x)((t>>2)*PI/32*S(SeqP(_6[(T>>17)%4][(T>>13)%4])+TRN))*decay(T,32,4)*(tck>=456?0:tck>=424?1:tck>=264?0:tck>=200?1:tck>=104?0:tck>=40?1:0)/2+(AC(SeqP(_7[(T>>16)%8])-12,x)+AC(SeqP(_7[(T>>16)%8])-36,x))*(tck>=456?0:tck>=392?1:tck>=264?0:tck>=200?1:tck>=136?0:tck>=72?1:0)+Lg(SeqP(tck>=456?_8[(T>>15)%16]:_9[(T>>14)%32])-24,512,x)*(tck>=713?0:tck>=456?1:tck>=392?0:tck>=328?1:tck>=200?0:tck>=168?1:0)/1.5+lpR(hp(btf(I(S(TRN+SeqP(_A[(T>>14)%32])),512)&128),.01),.25,3)*(tck>=713?0:tck>=488?1:0)/1.5+RiserN(x)*2*(tck>=808?0:tck>=776?1:tck>=264?0:tck>=232?1:0),1,1,1,1))*(tck>=808?1:tck>=776?Y:tck>=648?1:tck>=520?Y:tck>=456?1:tck>=392?Y:tck>=232?1:tck>=136?Y:tck>=104?1:tck>=40?Y:1)+atan(Hihat(32768,x)*(tck>=808?0:tck>=776?1:tck>=648?0:tck>=520?1:tck>=456?0:tck>=328?1:tck>=264?0:1)+(Kick(32768,x)+Snare(32768,x))*(tck>=808?0:tck>=776?1:tck>=648?0:tck>=520?1:tck>=456?0:tck>=392?1:tck>=232?0:tck>=136?1:tck>=104?0:tck>=40?1:0)))*.85),

// Output
[Re(0),Re(1)]