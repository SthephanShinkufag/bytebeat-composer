/*
=============================================================================================
N3 -
_____________________.___ _______  .________________________    _____    _______  ___________
\__    ___/\______   \   |\      \ |   \__    ___/\______   \  /  _  \   \      \ \_   _____/
  |    |    |       _/   |/   |   \|   | |    |    |       _/ /  /_\  \  /   |   \ |    __)_ 
  |    |    |    |   \   /    |    \   | |    |    |    |   \/    |    \/    |    \|        \
  |____|    |____|_  /___\____|__  /___| |____|    |____|_  /\____|__  /\____|__  /_______  /
                   \/            \/                       \/         \/         \/        \/ 

Entry for ByteBattle Season 6
=============================================================================================
*/

/* Integral Variables */

t2=t,

BPM=160,
sR=48e3,
sPB=32768,
tn=440,
tr=-3,

ts=t*abs(BPM/((120*sR)/sPB)),
tt=(t/sR*256)*tn*2**((tr-12)/12),
r=ts/2,
nj=2048,
n1=4096,
n2=8192,
n4=16384,
n8=32768,
bj=65536,
br=131072,
bn=262144,

/* Primary Functions */

f=(len=7,exp=1,rmp=0)=>
rmp?abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp)):
-abs(pow(atan(tan(ts/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp))+1
,

lfo=(x=9,y=0)=>abs(sin(ts*PI/pow(2,x)))+y,
env=(
al=14,ae=.2,dl=14,de=lfo(18,.3),st=0,sv=1)=>seq(
dl>-1?(al>-1?
[f(al,ae,1)].concat(r(st,sv),f(dl,de)):
r(st,1).concat(f(dl,de))):(al>-1?
[f(al,ae,1)].concat(r(st,sv)):r(st,1)),13),

r=repeat=(x,y)=>Array(x).fill(y).flat(9),

seq=(x,y=13,z=0)=>x[(z?(y)%x.length:(ts>>y))%x.length]||0,

mseq=(
x,y=13,z=0,mode="parse"
)=>{
var T = tt
if(mode=="parse"){
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0} else if(mode=="array"){
T=tt*2**((seq(x,y)/12)||0)} else {
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0};
return T},

/* Secondary Functions */

wf=(T=t,mode,amp=1,exp=1)=>{
var p=T
if(mode=="sin"){
	p=(ph=0)=>sin(T*(PI/128)+ph)} 
else if(mode=="tri"){
	p=(ph=0)=>asin(sin(T*(PI/128)+ph))/(PI/2)} 
else if(mode=="sth"){
	p=(ph=0)=>atan(tan((T-(main?127:(mn2?127:0)))/2*(PI/128)+(PI/2)+ph))/(PI/2)} 
else if (mode=="sqr"){
	p=(ph=0)=>((sin(T)<T&T+ph>>6)-0.5)*2} 
else if (mode=="bt"){
	p=(ph=0)=>((T)&255)/127-1}
else {
	p=(ph=0)=>sin(T*(PI/128)+ph)}
var wint = p
if(mode!=="sth"){
wint=pow((p()*amp),exp)||-pow((p(PI)*amp),exp)}
else{
wint=pow((p()*amp),exp)||pow((p(PI/2)*amp),1/exp)-1||0};
return wint},

rg=x=>(t-128)%n4/(1-(1/((t-128%(2**((t>>12&7)+14))>>x)+32))),
lt=x=>(x%256>127.5?asin(sin((x+64)*PI/128)):-atan(tan((x+64.5)*PI/128))/(PI/1.5))/(PI/2),

/* Effects: from Feeshbread (WARNING: May lag) */

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

/* Song Length Contants */

sta=ts>>15>1,
intro=ts>>17<9,
st1=ts>>16==17,
i_end=ts>>17>=9,
f1=t>>15<2?sin(sin(sin(ts*PI/br))):1,

bup=(ts>>17>8&ts>>17<17)|(ts>>17>40&ts>>17<49),
main=(ts>>17>16&ts>>17<25)|(ts>>17>48&ts>>17<57),
bridge=ts>>17>32&ts>>17<40,
mn2=ts>>17>24&ts>>17<33,
end=ts>>17>56,

ts-=i_end?br:0,
tt-=i_end?br:0,

/* Sequences */

a1=mseq('0357AC7E0235CEFA',(ts>>14^ts>>13^ts>>15),1),

!t&(
x1=(ts>>17)%4==3,
c1_1=[0,0,3,2,2,3,2,2],
c1_2=[2,2,5,5,5,5,3,3],
c1_3=[3,3,7,7,7,7,7,7],
c1_4=[5,5,10,10,10,10,10,10],
c1_5=[7,7,12,12,12,14,12,14],
c1_6=[14,12,14,15,17,17,19,19],

c2_1=[-4,2,0,5],
c2_2=[0,5,3,7],
c2_3=[3,7,7,10],
c2_4=[5,10,10,12],
c2_5=[10,12,14,15],
c2_6=[14,15,17,19],

c3_1=[0,2,0,0],
c3_2=[2,3,x1?2:3,x1?2:3],
c3_3=[3,5,5,5],
c3_4=[8,8,7,10],
c3_5=[10,10,14,14],
c3_6=[12,14,19,19]),

m1=(
a='07AC A7 5A7EA 75ACF7 CE 5A EA37A',
mseq(sta&ts>>15<8?(" ".repeat(8).concat(a)):a,ts&n2?ts>>13:(ts>>13)+(1+15&(ts>>13)),1)),
m2=(
t3=ts+1,
mseq('CFJ7EFACJMCF7JOM',t3>>13^t3>>12+(1+(5&(t3>>13))),1)*2),
m3=mseq('0357057A'),
m4=mseq('0357057A0ACE57CF',ts&n4?(ts>>13^ts>>12^ts>>((ts>>15)%4==3?10:15)):ts>>13,1),
mb=mseq('035C',17),
mb2=mseq('8ACF',16,0),
mb3=mseq('CF8A',16,0),
p1='1111    1 1 1  122 2  22 2 22 21 1  11 1 11 3 33  33  44 4 44 44',
ps=seq(p1,12),

c3=(x1,x2,x3,x4)=>(
ps=='1'?mseq([x1%n4],13,0,"array"):ps=='2'?mseq([x2%n4],13,0,"array"):
ps=='3'?mseq([x3%n4],13,0,"array"):ps=='4'?mseq([x4%n4],13,0,"array"):ps=='0'?0:0
),

// LFO

u1=(2**[14,12,14,15,13,15,11,11][ts>>12&7^ts>>14&5^ts>>13&5]),
u2=2**[13,12,13,12,14,15,11,11][ts>>13&7^ts>>12&5|5&(1+(ts>>13&7))],
u3=2**[12,15,13,12,14,13,11][(ts>>15&7^ts>>14&5)+3&(1+(ts>>13&7))]||0,
u4=2**[11,12,13,15,11,14,11,11][(ts>>13&7^ts>>16&5)+5&(1+(ts>>15&7))]||0,
u4_1=((ts%2**seq([14,15,13,14],12)>>8)+1),

/* Instruments */

ins=x=>(
u1=main?(ts>>14)%16==0:1,
(wf(m1*(!u1?ts>>12&3:1))*wf(m1>>2*24*(!u1?ts>>13&3:1))+wf((m1*16)>>3)+(wf(m1*19)+wf(m1*x+15))*wf(m1*x+16))*(st1|!u1?1:env(-1,0,13,.2))/(st1|!u1?(ts&nj?12:480):2))*(!u1?8:1),

pad=y=>{
var i=lfo(17)
var n=x=>random()*wf(mseq(x,16,0,"array")+mseq(x,16,0,"array")/y,"sth")/2
return lpf(
n(bup?c2_1:c1_1)+n(bup?c2_2:c1_2)+n(bup?c2_3:c1_3)+
n(bup?c2_4:c1_4)+n(bup?c2_5:c1_5)+n(bup?c2_6:c1_6)
,t>>15<2?(i**3)*.05:.05)*(bridge?env(seq([12,14,13,14]),1.5,-1):1)*(end?env(14,.5,-1):1)},

sb=(sta&!st1?(wf(mb/4)*wf(mb/8,"tri")*wf(mb/8))*3:0)*env(14,.7,-1),

k=rg(4)/8%32+rg(5)/8%32+rg(6)/8%32+rg(7)/8%32+rg(8)/8%32+rg(9)/8%32+rg(10)/8%32+ts/8%32,

i1=(ts&u3?128:k*k/(2**(ts>>([12,12,13,13,14,15,11,11][ts>>13&7])&7)+(2**[6,8,7,5,3,7,4,2][ts>>12&7^ts>>15&5])))%256/128-1,

w1=sta&!st1?(wf((ts&n4?a1:a1^a1>>seq([8,7,4,6],13))*(ts&(2**seq([13,14]))?(ts>>10&1^ts>>12&3):1),ts&(2**seq([15,16]))?"sin":"sqr")*env(-1,0,seq([13,15,12,14],[ts>>13&3^ts>>14&1],1))):0,

w2=(o=(ts>>14)%16,
i2=(ts>>15)%8,
o>0&o<3?((ts&2**11)?wf(m3*(ts>>10&3)&(m3*(ts>>11&7)),ts&n2?"sqr":"sin"):0):i2>2&i2<4?(wf(m3*4*(ts>>12&3)^m3*(ts>>10&3)>>1|ts>>seq([6,7,11,12]))*wf(m3*2*(ts>>11&3)^m3>>1&t>>seq([6,7,10,11])))*5:0),

l1=x=>(ts&2**seq([12,13,11,13])?(wf((m2^m2/2)/4%128+(m2^m2/2)/(x*2)%128,"sth")):0)*env(14,.5,-1),

bs1=(a1=main?mb3:mb2,(ts&u3?(sin((a1&a1*(ts>>12&3^ts>>14&5+(1+(ts>>12&7))))*PI/512)/2+atan(tan(tan(mb2*PI/512))/2)/7):0)||0),

dsp=x=>{
T=a1/(ts&u3?1:2);
h=0;a=1e-4;b=.002;
for(i=1;i<x;i++){
n=(2*PI)*b*i*T-a*(i*25)*(-i*35+((ts*u3>>8)%20));
h+=sin((n/1.04))/i}
return h*.5},

bs2=ts&u4?dsp(ts&u3?(32-u4_1):(32+u4_1)):0,

bs3=((ts>>16)%8==7?ts&nj:1)?(ts>>13)%4==3?wf(mb&mb/2|mb>>1^mb*(ts>>12&3^ts>>15&5+(9&(1+(ts>>13&7)))),ts&n4?"sth":"sin"):(ts>>16)%8==7?wf(tt/2^tt/4+tt*(ts>>seq([12,13])&3)):wf(t*seq([2,2,4,8])/(ts&nj?2:(ts>>13)%8==5?.5:1)*(ts>>(seq([12,11,14,13]))&1)/2&seq([ts>>2,210,243,ts>>8],15),ts&n8?"sin":(ts>>13)%16==15?"sqr":"sth"):0,

bs4=ts&u4?0:sin(((tt*(ts>>10&7^ts>>12&5^ts>>16&7))^ts>>1)*PI/128),

ss=x=>{
ka=((ts&(2**seq([11,12]))?.1:1)),
k3=(ts*seq([2,1,x1?.25:2,.5],x1?15:14)&(x1?u4:u3)?0:1),
T=a=>mseq(a,16,0,"array")
n=a=>wf(T(a)*2,"sth")+wf(T(a)*(2*x),"sth")
m=(n(mn2?c3_1:c2_1)/6+
n(mn2?c3_2:c2_2)/6+
n(mn2?c3_3:c2_3)/6+
n(mn2?c3_4:c2_4)/6+
n(mn2?c3_5:c2_5)/6+
n(mn2?c3_6:c2_6)/6)
return m*env(14,.5,-1)*(mn2?((ts>>17)%2==0?ka:k3):ka)},

ss2=x=>{
v=(ts>>14)%16==0|(ts>>16)%4==2?2:1,
n=(ts>>13)%32<2?(1+sin((ts%n4)*PI/bj)**4.75):1
T=(x=1)=>
(wf(c3(0,2,2,3)*x%n4/n,"sth")/6+
wf(c3(3,5,7,5)*x%n4/n,"sth")/6+
wf(c3(5,7,10,7)*x%n4/n,"sth")/6+
wf(c3(7,10,12,10)*x%n4/n,"sth")/6+
wf(c3(10,14,14,14)*x%n4/n,"sth")/6+
wf(c3(14,17,19,17)*x%n4/n,"sth")/6)
return (T(v)+T(x*v)+T(x*(v*2))/1.5+T((x*v)/2))/1.25*env(15,.1,-1)
},

sp=(wf(m4*(1+(ts>>seq([10,12,11,13],15)&3))&ts>>seq([6,7,8,8]),"sth")-((ts>>14)%4==3?0:.5))*env(14,ts-n4/4&u4?0:2,-1),

/* Percussions */

kk=(
s1=main?((ts>>14)%16==15?2:1):1,
bp=(ts>>16)%16<15?seq([1,1,1,1,2,2,4,8],17):0,
bp_p=(ts>>17)%8>6?(cbrt((1+(ts>>14)%8))):1,
sta&!st1?(atan(sin((main?30:20)*(bup?bp_p:1)*cbrt(ts*s1*(bup?bp:1)%n4)**.6))%256/(ts*s1*(bup?bp:1)%n4)*n2||0)*(intro?seq([,.1],14):1):1),

rd=((((t2*(441/480))&1)-.5)*sin(t>>2^t*.55>>1))%256/(ts%n4)*nj,

hh1=x=>sta&!st1?(((atan(tan((t2*x)^12>>1))+(t2*(441/480)&1)&1)-.5)*env(-1,0,main?13:12,.1)*(intro?1:seq([,1],13)))*(intro?.07:1):0,

hh2=x=>(((t2*(441/480)&1)-.5)*sin(t&1*t*x>>2))*env(-1,0,12,.1),

sn=x=>(wf(t*sin(t>>3)*tan(t>>4)-sin(t*t^.1>>5),"bt")*env(-1,0,14,.01))*sin((t+x)*PI/(8+x))*40*seq([,1],14)||0,

/* SFX */

s1=ts&n8?((sta&!st1?ts&u1?0:(sin(ts*PI/(ts%(u1)>>8)*8)):0)||0):0,

s2=sta&!st1?(ts&(2**seq([15,13,14,15]))?sin(ts*sin(ts*PI/u2/32)):0):0,

lsr=(ts>>19)%2==1?(
n=cbrt(ts*(1+(ts>>16&5))%n2),
lt(n/4)-lt(ts/2-lt(n*((ts>>15&3)+1)+lt(2*n*(1+(ts>>16&5))))*n8))*env(14,.5,-1):0,

rs=x=>(
g1=!i_end?(ts>>16)%32>14:bup?((ts>>17)%4==0):main|end?(ts>>17)%4==0:0,
(sta&ts>>16<3)|ts>>17>6&(!i_end?ts>>16!==17:1)&g1?wf(ts*sin(ts^(x)&(ts-br)>>1),"bt")**3||0:0),
rs_lfo=abs(i_end?sin((ts+br)*PI/bn):sin((-ts-bj)*PI/bn)**3),

/* Master and Mixing */

M=x=>(
z1=(ts>>16)%16>=15&bup?0:1,
z2=!intro?1:0,
z3=intro?1:0,
z4=main?((ts>>15)%32==15?0:1):1,
z5=(x=0,y=1,z=1)=>main?((ts>>16)%16==15?x:y):z,
z6=(ts>>14)%16==0,
z7=(ts>>16)%16==15?0:1,
z8=mn2?((ts>>17)%8==7?0:1):1,
h1=main?1:0,
h2=bup?1:0,
h3=!main?1:0,
h4=main|mn2?1:0,
h5=!bridge?1:0,
h6=mn2?1:0,
h7=bup|m2?1:0,
h8=end?1:0,
h9=!end?1:0,
h10=ts>>17<64?1:0,
h11=ts>>17<68?1:0,

tanh(atan(tanh(atan(dly(tanh(atan(
(ts>>17<69?
(sta?ins(x?2:5)*(bridge?3:1.5)*z5(1,0,intro?1:bridge?1:(end?1:0)):0)*h11*1.25+
(lpf(w1,.5)/(ts&n2?6:3)*z3*z1)

+(s1*h11*z1*z4*z5()*h5/(ts&n2?20:10))

+((pad(x?.99:1.01)*h10*2*h3)*(st1?0:1))*f1*
(sta?(ts&nj?(!intro?.45:.375):1):1)

+(((ins(x?6:4)+(kk*h10/16))+pad(x?.99:1.01)*2)*h8*h11)

+(ss(x?.99:1.01)/(mn2?.5:4)*z2*h7)

+(ss2(x?.99:1.01)/4+(sp/6+w2/16))*h4*h7
:0))),rvrbHeads[x],st1?0:.7,
x=>tanh(bpf(x,.01,.5)/180)*100)*h11)/2

+(bup|mn2?ss(x?.99:1.01)/(mn2?1:4)*z2*h7:main?(ss2(x?.99:1.01)*.8)*h1*z5():0)+(sp*h7*z5()*h4/4)

+((sb*z1*h11)/24+(kk/(intro?30:12)*(!i_end?1:0)))

+(tanh(atan(
l1(x?.99:1.01)*z2*h2/4+(hh1(x?1:1.1)*1.75+hh2(x?-1.1:1.1)*1.5*h1))*(z1*z4*z5()*z8)

+(kk*z7/(z6?4:2)+lpf(sn(x?8:0)*4,cos((ts%n4)*PI/n8))/2*h4*z8+
((ts>>14)%4==3?(bs4*h1)/2:0))/2)*z5()*h9

+(lpf(rs(x?33:67),rs_lfo)||0)/(main?4:6))*h5

+cmp(((ts>>14)%4<3>0?i1*(z4*z5()*h1*h7*(z6?0:1))/2:0),.3,.9,75,.1)

+(bs3/6*z7*z8*h4)

+(s2*h11*z1*z4*z5()*h3/(ts&n1?96:32)))/150

+(!intro?(!bridge?atan(tanh(bs1*(main&mn2?3:2)*(z6?0:1)+bs2*3+(w2/2)*h1+((lsr*h2)-.25)+(bs3/10*z7*h4))*z1*z4*z5()*z8*h9):0)/400:0)))*300)||0,

OUT=[M(0),M(1)]