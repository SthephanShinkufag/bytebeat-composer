quality=6,
o=t/quality,
of=o*1.024,
SF=1.1,
counter=0,
t?0:(
rev=Array(delay=12288).fill(0),

// Filters from Feeshbread
buffer=[],
btf=f=>(f%256)/128-1, // Bytebeat to Floatbeat
lp=(a,c)=>(lp_counter=counter++,buffer[lp_counter]||=0,buffer[lp_counter]+=(a-buffer[lp_counter])*c), // Low-pass filter
hp=(a,c)=>a-lp(a,c) // High-pass filter
),
s=sin,
mn=f=>min(max(f,-1),1),
rand=o*random(),
randds=btf((sin((o>>0)**3)*128+128)&128),
decay=s=>btf((1.01**(-of/s%256))*255)+1,
intr=s=>btf((1.01**(of/s%256))*255/16)+1,
S=k=>s(o/(8e3/(2*PI))*k),
ncosw=k=>-cos(o/(8e3/(2*PI))*k),
mod=-btf((1.015**(-of*SF/32%256))*255)/2+.5,
sn=s=>(lp(lp(btf(rand),.5),.5)*decay(s/SF)/3),
d=f=>(of*SF&2048)?0:f,
b=p=>d(s(s(s(s(p*cbrt(of%(2048/SF)))))))*decay(8/SF),
b2=d(s(40*cbrt(512+of%(2048/SF))))*decay(8/SF),
f=lp((btf(o*1.75^o*7>>1)+btf(o*3.55)),.25)/4+(2+S(440)*3+S(520)*2+S(880)+S(2080)/3+S(3520)/7)/16,
cbs=n=>cbrt(s(o/(8000/(2*PI)/31.25)/n/[.5,1,2,4,8,16,32,64][of*SF>>8&7])),
rg=n=>s(o/1.015*n*2**(parseInt(['6ADI','6ADI','8FIK','8FIK','AFHM','AFHM','DHKP','HKOT'][of*SF>>13&7][of*SF>>10&3],36)/12))**3,

p=(f,k,m,m2,x)=>btf((f%m*abs(S(k)*64)/4)/6%m2^x)*4+3,
l=k=>2+S(440*k)*3+S(520*k)*2+S(880*k)+S(2080*k)/3+S(3520*k)/7,
sp='8448'[3&of*SF>>11],
n=k=>hp(lp(p((o*k&o*k/4),sp*SF,64,64,48)/2+p(o*k,sp*SF,64,64,48)/2,.75),.01)/1.5,
n2=k=>hp(lp(p((o*k&o*k/4),2*SF,64,64,48)/2+p(o*k,2*SF,64,64,48)/2,.75),.01)/1.5,
CB=k=>btf(((((o*k|o*k>>1)+4+o*k*4)&240/2)+128+(o*k*2|o*k*4>>1))+(o*k|o*k>>1)*8),
a4=f=>((of*SF)&4096)?(btf(o*3.1)+btf(o*1.54)+btf(o*6.24)+btf(o*12.55))/2:((s(16e3/(8e3/(2*PI))*l(1.375)/8)+l(1)/8)/2)*S(f*SF),
a21=k=>mn(n2(k)*1.5),
a1=k=>mn((btf(o*k)+btf(o*(2*k+.01))+btf(o*(4*k+.02)))/1.5*decay('24'[1&of*SF>>12]/SF)),
a3=k=>lp((btf(o*k*2^o*k*2>>1)+btf(o*k^o*k>>1))/2,ncosw(8*'1112'[3&of*SF>>11]*SF)/2+.5),

s1=2**(parseInt(['AMMMMMMM','AMMMMMKK'][of*SF>>14&1][of*SF>>11&7],36)/12),
s2=2**(parseInt(['AFHM','DHKP','FJMR','HLOT'][of*SF>>14&3][of*SF>>10&3],36)/12),
s3=[1.75,2.1,2.35,2.625][3&of*SF>>14],
s4=[5.55,6.2,6.95,8.3][of*SF>>14&3],
s5=2**(parseInt('MPTMPTMP'[of*SF>>10&7],36)/12),
s6=2**(parseInt('MMMMMMMN'[of*SF>>13&7],36)/12),
s7=2**(parseInt('68AA68AD'[of*SF>>14&7],36)/12),
st=k=>mn(((of*SF&8192)?a21(s3*k):a1(s3*k))+cb+be+lp(mn((btf(2*o/1.015*s2*k)+btf(2*o/1.025*s2*k))),(btf(of*SF>>11)/2+.5)/2)/2+lp(cb2(s3/2*k)/2,.5)),
cb2=k=>mn(btf(((o*4*k&o*4*k>>1)+5*o*2*k)&240+((o*4*k|o*4*k>>1)/2+o*2*k)&240+((o*4*k&o*4*k>>1)+5*o*2*k)|((o*4*k|o*4*k>>1)/2+o*2*k)&o*(k-.05))),
Sp=k=>S(31.5*k*s4),
Spp=k=>Sp(.25*k)**3+Sp(.51*k)/2+Sp(1.01*k)/4+Sp(2.01*k)/8,
H=k=>lp((cb2(s3/2*k)+cb2(s3*k))/4,.5)*'0111'[3&of*SF>>11],
K=k=>(((cbs(.126/k/'12'[of*SF>>16&1]/2**(parseInt('AAACDDAADDDHKKHHFFFJMMFFHHHLOOLL'[of*SF>>11&31],36)/12))/16))*((of*SF&65536)?1:'10111010101110101011101011111111'[of*SF>>11&31])*8),

RES=k=>([

[lp(btf(o*3.5*k)/2+btf(o*1.76*k)/2,ncosw(.01)/2+.5)/2+(snin=(lp(lp(btf(rand),.5),mod)/1.5))*(o*SF>(122880/1.024)),((cb=lp((CB(s1/2.03*k)+CB(s1/1.015*k))/4,.5))+(be=mn(((of*SF&4096)?b(12)+b(24)+sn(4)*3+randds*decay(16/SF)/2+b2+sn(16)*1.5:b(12)+sn(4)*3)/1.5))+[a1(1.75*k)+(snout=hp(lp(btf(rand),.5),mod)/1.5),a2=mn(n(1.75*k)*1.5),a3(7*k),a4(4),a1(1.75*k),btf(8192*'12'[1&of*SF>>16]*cbrt(64+of*SF%(1024*'2221'[3&of*SF>>12])))/2,a2,a4(2)][7&of*SF>>13]),st1=mn(((of*SF&8192)?a21(s3*k):a1(s3*k))+cb+be+lp(mn((btf(2*o/1.015*s2*k)+btf(2*o/1.025*s2*k))),(btf(of*SF>>11)/2+.5)/2)/2+lp(cb2(s3/2*k)/2,.5)),st(1*k)*decay(512/SF)/4+st(1*k)/1.75+mn((btf(o*s3*k)*2+btf(2*o*(s3+.025)*k))*intr(16/SF)*intr(512/SF))/2+snin*(o*SF>(516096/1.024))][3&of*SF>>17]
,
[snout+(j=lp(btf(o*3.5*k)/2+btf(o*1.76*k)/2,.25)*decay(256/SF)/2),j,j,j,j+(js=S(220*k)*decay(16/SF)*decay(128/SF)/8),j+js,j+js,j+js+((of*SF&4096)?lp(btf(o*10.6*k)/2+btf(o*5.35*k)/2,.25)*intr(16/SF)/2:0)][7&of*SF>>13]*(o*SF<(589824/1.024))+[
SP=(btf(o/2*s4*k)+btf(o/4.02*s4*k))/8+((Spp(1*k)+Spp(2*k)/2)*decay(64/SF)/4),SP,SP+(CBS=(((cbs(.126/k/'12'[of*SF>>16&1]/2**(parseInt(['IIIPRRIIKKKPRRKLMMPMTTPMPPTPWPTP','IIIPRRIIKKKPRRLLMMPPTTPPPPTTWWTT'][of*SF>>16&1][of*SF>>11&31],36)/12))/16))*((of*SF&65536)?1:'10111010111110111011101110111111'[of*SF>>11&31])*2)),SP+CBS,SP+CBS+(sq=lp((btf((o/4*s4*k)&128)*'01'[1&of*SF>>11])/3,.25))+(RG=(rg(.098*k)+rg(.099*k)+rg(.196*k)+rg(.1975*k))/12),SP+CBS+sq+RG,SP+CBS+sq+RG,SP+CBS+sq+RG+(btf(o/4*s4*k)+btf(o/1.975*s4*k))/4*intr(16/SF)*intr(256/SF)+snin*'00000001'[7&of*SF>>13]][7&of*SF>>16]*(o*SF>(589824/1.024))
,
[(k1=(mn(sq*2+CBS*2.5+RG*3)+be+(cb3=lp((CB(s4/8.01*k)+CB(s4/4*k))/4,.5))+[(b1=a1(s4/4*k)),(b2=a21(s4/4*k)),b1,(c=((s(16e3/(8e3/(2*PI))*l((s4/5.05))/8)+l(s4/5.55)/8)/2))*S('24'[1&of*SF>>12]*SF),b1,c*S('48'[1&of*SF>>12]*SF),b2,a3(s4*1.01*k)][7&of*SF>>13])),k1,(k2=mn(k1+(S(s4*47*k)*S(1*SF)*2)/3)),k2*decay(512/SF)/4+k2/1.75+(btf(o/2*s4*k)+btf(o/4.01*s4*k))*intr(16/SF)*intr(256/SF)/2+(snin*(o*SF>(1302528/1.024))),snout*(o*SF<(1318912/1.024))+(A=SP+S(s4*47*k)*S(1*SF)/4),A,A+snout/2,(of*SF&32768)?(of*SF&16384)?(of*SF&8192)?0:A:A:A+snout/2][7&of*SF>>16]
,
[(B=lp((btf(o/1.01*s1*k)+btf(o/1.02*s1*k))/2*decay('12'[1&of*SF>>13]*8/SF),.25)*intr(1024/SF)),B+(C=(btf(o/1.01*s5*k)+btf(o/1.02*s5*k))*'01'[of*SF>>15&1]/6),B+C+(D=(btf(o/2.01*s6*k)+btf(o/1.02*s6*k))/2*decay(4/SF)*intr(16/SF)),B+C+D+(btf(o*o/2048*k)+btf(o/1.01*o/2048*k))/2+snin*(o*SF>(1826816/1.024)),snout*(o*SF<(1843200/1.024))+st1,st1,st1+mn(H(1*k)+K(1*k)*1.5)/1.5,st1+mn(H(1)+K(1)*1.5)/1.5][7&of*SF>>16]
,
[st(1.05*k)+mn(H(1.05*k)+K(1.05*k))/1.5,st(1.05*k)+mn(H(1.05*k)+K(1.05*k))/1.5+((S(262*s2*k)+S(264*s2*k))**3)/10+snin*(o*SF>(2220032/1.024)),snout*(o*SF<(2236416/1.024))+lp((btf(o*1.825*k)+btf(o*3.67*k))/2,.1),(L=(O=lp((btf(o*2*s7*1.05*k)+btf(o*1.01*s7*1.05*k))/2,.1))+(S(132*s7*k)*S(1*SF))/2),L,0,0,O*intr(256/SF)/4][7&of*SF>>16]
]
[(of*SF>>19)%5]*(o*SF<(2621440/1.024)))+rev[t%delay]
,
[(rev[t%delay]=RES(1.005)/2,RES(1.005)/4),(rev[t%delay]=RES(.995)/2,RES(.995)/4)]