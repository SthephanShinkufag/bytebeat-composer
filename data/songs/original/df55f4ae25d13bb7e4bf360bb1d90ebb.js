/*
      ___           ___           ___           ___           ___       ___           ___     
     |\__\         /\  \         /\__\         /\  \         /\__\     /\  \         |\__\    
     |:|  |       /::\  \       /::|  |       /::\  \       /:/  /    /::\  \        |:|  |   
     |:|  |      /:/\:\  \     /:|:|  |      /:/\:\  \     /:/  /    /:/\:\  \       |:|  |   
     |:|__|__   /:/  \:\  \   /:/|:|__|__   /::\~\:\  \   /:/  /    /::\~\:\  \      |:|__|__ 
 ____/::::\__\ /:/__/ \:\__\ /:/ |::::\__\ /:/\:\ \:\__\ /:/__/    /:/\:\ \:\__\ ____/::::\__\
 \::::/~~/~    \:\  \ /:/  / \/__/~~/:/  / \/__\:\/:/  / \:\  \    \:\~\:\ \/__/ \::::/~~/~   
  ~~|:|~~|      \:\  /:/  /        /:/  /       \::/  /   \:\  \    \:\ \:\__\    ~~|:|~~|    
    |:|  |       \:\/:/  /        /:/  /         \/__/     \:\  \    \:\ \/__/      |:|  |    
    |:|  |        \::/  /        /:/  /                     \:\__\    \:\__\        |:|  |    
     \|__|         \/__/         \/__/                       \/__/     \/__/         \|__|    v2.0

XOMPLEX v2.5, Remix of Lyric Machine (Xongkoro) using PrincessPriscillaPT's technology

By Muse Labs (MarioFan171). Feel free to remix it.
*/

/* Turn Console On/Off */

disp=0,

/* Important Variables */

t2=t,

BPM=144, /*BPM: Beats Per Minute*/
sR=sampleRate=48e3, /*Samplerate*/
sPB=samplesPerBeat=32768, /*Timing*/
r=t*abs(BPM/((60*sampleRate)/samplesPerBeat)),
lm=(a,mn=50,mx=-50)=>min(mn,max(mx,a/100)),

tt=(t/sampleRate*256)*440*2**(-21/12), /*Overal Pitch*/
ts=r, /*Overall Speed*/

/* Main Variables */

bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
seq=(arr,spd=14)=>(arr[bt(arr.length,spd)])||0,
mseq=(arr,spd=14,pitch=2)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
b=bytebeat=code=>((code)&255)/127-1,
bsn=(T=tt,p=1)=>sin(T*PI/(128/p))*128+127.5,
s=saw=(T=tt,p=1)=>atan(tan(T*PI/(128/p))),
w=wave=(T,p=1,a=1)=>sin(T*PI/(128/p))/a,
tr=t=>(y=t%256,127>y?y:2*(256-y)), /* Specialized Wave from A New Dimension, for the growl effect */

p=ts%32768,
l=ts%4914304,

ms=int(ts/16384),

dec=(ramp,spd,vol)=>((ts*ramp)&(4096*spd)-1)/vol,
dec2=(spd=1)=>(1-ts/8192%1),
dec3=d3=(ramp=1,spd=1,spd2=13)=>(ramp-ts/(8192/spd)%1)*!(ts>>(spd2)&3),
pluck=plk=(amp,spd)=>(1.1+(ts)/spd%32)*amp,
sc=sideChain=((ts/32768%1*.8+.2)*(1-d3())**1.3**2),
lfo=(y=1,x=4)=>abs(sin(ts*PI/(32768/y))/x),

t?0:fx=r(29e3,0), // Effect Variable, by Greaserpirate

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

/* Sequences */

m1=[
7,7,10,14,12,,,,
12,seq([12,14],13),12,10,12,10,7,,
7,7,10,7,5,5,7,10,
7,,seq([3,],13),5,3,seq([0,],13),0,,
][bt(32,14)],
m1R=[
3,3,5,10,7,,,,
7,seq([7,10],13),7,5,7,5,3,,
3,3,5,3,0,0,2,3,
3,,seq([0,],13),0,0,seq([-5,],13),-5,,
][bt(32,14)],

m2=[
7,7,10,14,12,12,12,10,
12,14,12,10,12,10,7,,
7,7,10,7,5,seq([,5],13),5,3,
5,,5,7,10,12,12,,
][bt(32,14)],
m2R=[
3,3,5,10,7,7,7,5,
7,10,7,5,7,5,3,,
3,3,5,3,0,seq([,0],13),0,-2,
0,,0,3,5,7,7,,
][bt(32,14)],

m3=[
7,7,10,14,12,,12,10,
12,,12,10,12,10,7,,
7,7,10,7,5,,5,3,
5,,5,3,5,3,0,,
][bt(32,14)],
m3R=[
3,3,5,10,7,,7,5,
7,,7,5,7,5,3,,
3,3,5,3,0,,0,-2,
0,,0,0,0,0,-5,,
][bt(32,14)],

m4=[
7,7,10,14,12,,12,10,
12,,12,10,12,10,7,,
7,7,10,7,5,,5,3,
5,,5,7,10,12,12,,
][bt(32,14)],
m4R=[
3,3,5,10,7,,7,5,
7,,7,5,7,5,3,,
3,3,5,3,0,,0,-2,
0,,0,3,5,7,7,,
][bt(32,14)],

m5=[
12,12,12,12,10,12,12,,
12,12,15,12,10,12,12,,
5,5,5,5,3,5,5,,
7,7,7,7,5,7,7,,
][bt(32,14)],
m5R=[
7,7,7,7,5,7,7,,
7,7,7,10,7,5,7,7,,
0,0,0,0,0,0,0,,
3,3,3,3,2,3,3,,
][bt(32,14)],

m6=[
7,7,10,14,12,,12,10,
12,,12,10,12,10,7,,
7,7,10,7,5,,5,3,
5,,5,7,10,12,12,,
][bt(32,14)],
m6R=[
3,3,5,10,7,,7,5,
7,,7,5,7,5,3,,
3,3,5,3,0,,0,-2,
0,,0,3,5,7,7,,
][bt(32,14)],

c1=[0,0,0,-2,0,0,0,-2,0,0,0,-2,0,3,-2,-5,-7,-7,-7,-9,-7,-7,-7,-9,-5,-5,-5,-7,-5,-2,0,0,],

ch1=[
0,0,0,-2,
0,0,0,-2,
0,0,0,-2,
0,3,-2,-5,
-7,-7,-7,-9,
-7,-7,-7,-9,
-5,-5,-5,-9,
-2,3,0,0,
],
ch2=[
3,3,3,2,
3,3,3,2,
3,3,3,2,
3,0,2,0,
-4,-4,-4,-5,
-4,-4,-4,-5,
-2,-2,-2,-5,
-5,5,3,5,
],
ch3=[
7,7,7,5,
7,7,7,5,
7,7,7,5,
7,10,7,3,
3,3,3,2,
3,3,3,2,
5,5,5,7,
3,7,7,10,
],
ch4=[
10,10,10,7,
10,10,10,7,
10,10,10,7,
10,7,10,7,
7,7,7,5,
7,7,7,5,
10,10,10,10,
7,10,10,12,
],

/* Non-Melodic Arrays */

iv=[14,12,10,13,0,4,12,0],

apgt=[
1,1,1,,1,,1,1,
1,1,1,,1,,1,,
1,,1,1,1,,1,1,
1,,1,,1,,1,1,
1,1,1,,1,,1,,
1,,1,1,1,,1,1,
1,1,1,1,1,,1,1,
1,1,1,1,1,1,1,1,
],

imph=bt(6,seq(iv,14)),

a1=[
-5,0,3,7,10,12
][imph],

a2=[
-7,-4,0,3,7,10
][imph],

a3=[
-5,-2,2,5,10,12
][imph],

amph=[64,64,ts>>12,ts>>12,,,64,ts>>6,,,ts>>8,ts>>9],

arm=[1,1,1/2.5,1/1.75,,,1,1,,,1/5,1/3],

am=[a1,a1,a2,a3,a1,a1,a2,a3],

aBl=[1,1,1/1.5,1/4,,,1,1/3,,,1/2,1],

mel=melL=mL=[
m1,m2,,,m3,m4,m5,m5,,,,,
],

melR=mR=[
m1R,m2R,,,m3R,m4R,m5R,m5R,,,,,
],

lmel=[7,7,7,7,7,5,3,5,7,7,7,7,7,,12,,5,5,5,5,5,7,10,12,7,7,7,7,7,,,,7,7,7,7,7,0,7,7,5,5,5,3,3,,5,5,7,7,7,10,10,,7,,12,12,,,,,,,],

/* Balancing Sequences */

growlGate=gG=[
,,,,1,1,,,1,1,,,
],

sl=[
.3,.3,.5,.5,.3,.3,.25,.25,.15,.15,.5,.5,
],

lsl=[
,,,,,,,,1,1,,,
],

laserGate=lG=[
,,,1,,,,1,,,,1/2,
],

rvbStop=rvs=[1,1,,,1,1,,,1,1,1,1,1,,,,],

acGate=acG=[1,,1,,1,,1,,,,1,,1,,1,,][bt(16,12)],
acGate2=acG2=[,,,,,,,1,,1,,,,1,,1,1][bt(16,12)],

acGateM=acGM=[
,acG,,acG,,,acG2,,,acG,,,acG2,,acG,,,acG,,acG,,,acG2,,acG,acG,,acG,,acG,acG,,,acG,,acG,,,acG2,,,acG,,acG,,acG,,acG2
],

/* Percussive Sequences */

hseq=[,1,,1,,1,],

gdseq=gdS=[2,2,4,2],

gdVol=gV=[3e3,3e3,9e3,9e3],


/* Instruments */

ins1=(m,uni=2)=>(ch=m/(uni/2),((bpf(b((ch^ch/uni|ch/2)*2),.02,.5)))),

lead=(u=2)=>(kl=mseq(lmel,14,8),w(kl)*b(kl^kl/u|kl))*(seq(lsl,19))||0,

bass=bs=x=>(cm1=mseq(c1,14),hpf((((b(cm1^cm1/x|cm1/2))*(w(cm1)*w(cm1*4)/2))+b(cm1^cm1/x)/2),.01,.8))*dec2(-1,1/2,4e3),

subbass=sb=(cm1=mseq(c1,14,1/4),(b(cm1*4|cm1))),

chord=chrd=(m,u=2)=>(kc=mseq(m,14),b((kc^kc/2.01)|(kc^kc/u))*w(kc)),

ccomp=x=>(m(chrd(ch1,x),.25)+m(chrd(ch2,x),.25)+m(chrd(ch3,x),.25)+m(chrd(ch4,x),.25))*dec(1,8,10e3),

arp=(ka=mseq(am,17),(b(ka&seq(amph,19))+.55*1.375)*seq(apgt,14)),

acid=lpf(b((tt&256+100*sin((tt/1.005)/5.12))),.12,.25)*seq(acGM,17)*dec(1,8,16e3),

/* SFX */

noise=b(random()*(16-(ts%1048576/32768))**2/4)-.25,
growl=gr=(max(min((b(tr(tt/2+(tt/8192%1)*tr(tt*((ms)>>1&15))+tr(2*tt*(1+(ms>>4&3))))*dec(1,8,16e3)*.5+64)-.5)*seq(gG,19)*dec(-1,seq(gdS,14),seq(gV,14)),0),-1)||0),
laser=ls=min(b(tr(tt/8192+tr((7-(tt/16384%1)*(2+(ms>>3&3)+(ms>>4&1))%1)**5*3)/2)+128),0)*seq(lG,19),

/* Percussions */

kick=kk=atan(.05*sin(8*sqrt(p)**.6))*d3()*90,

h=t*441/480,
hat=hh=hpf(((h&1)*64)*random()-.5,.1)*60*(1-ts/8192%1)**4,

snare=sn=(atan(1.5*sin((1e7+(p)*8)*(1-(1/(p*5+.1))*2)/80/8))*90*(max((1-p/32768*2),0)**1.8)*(ts>>15&1)+(fb1=hpf(fb1*.5+n(.25)*320*(1-((ts/65536+.5)%1))**2,.2)*.1**(500/(p))))*.6*(ts>>14>1),

/* Mixing and Mastering */

M=x=>(
k1=mseq((x?mL:mR),19),
atan(cmp(cmp(dly(((0+
((m(ins1(k1*2,x?2.02:2.03),.875)*dec(1,8,36e3))*320+
(m(ins1(k1*2,x?1.98:1.97),.875)*dec(1,8,36e3))*320+
(lead(x?1.99:2.01)*dec(1,8,36e3))*300
)*70)||0)*150,

/*(*/rvrbHeads[x],.45*seq(rvs,19),/*)*/
/*(*/x=>tanh(bpf(x-2,.01,.8)/200)*300*sc/*)*/
),20,2,.01,.2e-3)*4+
bbf((m(bs(x?1.98:2.02),1.15)*dec(1,8,16e3))*67.5+
sb*75*sc
,.01,.2,-.5)-.5+
(bbf(gr*100,.01,.035,-.25)-2)*sc+
(bbf(ls*100,.01,.035,-.25)-2)*sc+
ccomp(x?1.99:2.01)*65+
((lpf((arp),lfo(1/2,2),.6)*seq(aBl,19))*120)-.25+
acid*125+
bbf(
0+m(kk,.9)*95+
(noise+.95)*sc+
m(hh,.2)+
m(sn,2.5)
,.025,.2,-.5)*2
,50,1,.01,.1e-3)/40)*1.55-(seq(sl,19))+.375
)||0,

/* Master Audio */ MM=[M(0),M(1)],

info = function(length) {
var Title = "// XOMPLEX Initiative - By Muse Labs (MarioFan171)\n**// Remix of Lyric Machine (Xongkoro)\n**// Using PrincessPriscillaPT's Technology"

B=x=>"#".repeat(round(x))
S=x=>"*".repeat(round(x))

var clock = "(" + ['┌','─','└','│','┘','─','┐','│'][bt(8,14)] + ") "
var sec = round(t/sR*1000)/1000

mk0=["","","","","","","","","","","","","","","",""
][bt(16,14)]

mk1=[
B(5),
S(5)+B(4),
S(10)+B(2),
S(12)+B(2),
S(15)+B(2),
S(15)+B(2),
S(15)+B(2),
S(19)+B(2),
S(21)+B(5),
S(21)+B(5),
S(27)+B(8)+S(1)+B(2),
S(39)+B(2),
S(41)+B(4),
S(46)+B(4),
S(50)+B(2),
S(60),
S(60),
][bt(16,14)]

mk2=[
B(2),
S(2)+B(2),
S(5)+B(4),
S(10)+B(2),
S(10)+B(2),
S(13)+B(2),
S(17)+B(4),
S(22)+B(6),
S(29)+B(6),
S(36)+B(4),
S(36)+B(4),
S(40)+B(2),
S(42)+B(2),
S(45)+B(2),
S(45)+B(2),
S(60),
][bt(16,14)]

mk3=[
B(2),
S(2)+B(2),
S(5)+B(1),
S(7)+B(4),
S(12)+B(4),
S(12)+B(4),
S(18)+B(2),
S(20)+B(3),
S(24)+B(3),
S(27)+B(3),
S(31)+B(2),
S(33)+B(2),
S(36)+B(2),
S(38)+B(3),
S(41)+B(2),
S(60),
][bt(16,14)]

mk4=[
B(3),
S(3)+B(3),
S(7)+B(2),
S(9)+B(2),
S(12)+B(6),
S(12)+B(6),
S(19)+B(3),
S(24)+B(3),
S(24)+B(3),
S(27)+B(3),
S(30)+B(3),
S(34)+B(2),
S(36)+B(2),
S(38)+B(2),
S(60),
S(60),
][bt(16,14)]

mk5=[
B(4),
S(4)+B(4),
S(9)+B(6),
S(9)+B(6),
S(9)+B(6),
S(17)+B(3),
S(20)+B(2),
S(23)+B(2)+S(1)+B(2),
S(29)+B(3),
S(32)+B(3),
S(35)+B(3),
S(39)+B(4),
S(39)+B(4),
S(43)+B(3),
S(43)+B(3),
S(60)
][bt(16,14)]

mk6=[
B(3),
S(3)+B(3),
S(7)+B(2),
S(10)+B(2),
S(12)+B(3),
S(12)+B(3),
S(15)+B(3),
S(20)+B(3),
S(23)+B(3),
S(23)+B(3),
S(26)+B(3),
S(26)+B(3),
S(30)+B(4),
S(30)+B(4),
S(34)+B(3),
S(60)
][bt(16,14)]

mk7=[
B(3),
B(3),
S(4)+B(2),
S(6)+B(3),
S(9)+B(2),
S(9)+B(2),
S(13)+B(2),
S(15)+B(3),
S(18)+B(3),
S(22)+B(3),
S(25)+B(3)+S(1)+B(2),
S(32)+B(2),
S(34)+B(3),
S(37)+B(2),
S(37)+B(2),
S(60),
][bt(16,14)]

mk8=[
B(2),
S(2)+B(2),
S(5)+B(2),
S(7)+B(3),
S(11)+B(4),
S(15)+B(2),
S(18)+B(4),
S(22)+B(4),
S(28)+B(2),
S(28)+B(2),
S(30)+B(2),
S(32)+B(3),
S(36)+B(3),
S(39)+B(2),
S(41)+B(2),
S(60),
][bt(16,14)]

mk9=[
B(4),
S(4)+B(5),
S(10)+B(2),
S(12)+B(2),
S(15)+B(4),
S(15)+B(4),
S(19)+B(4),
S(19)+B(4),
S(25)+B(2),
S(27)+B(3),
S(31)+B(3),
S(34)+B(3),
S(38)+B(3),
S(41)+B(3),
S(45)+B(2),
S(60)
][bt(16,14)]

mk10=[
B(4),
S(4)+B(5),
S(10)+B(2),
S(12)+B(1),
S(14)+B(4),
S(14)+B(4),
S(18)+B(4),
S(18)+B(4),
S(24)+B(2),
S(26)+B(3),
S(30)+B(3),
S(33)+B(3),
S(37)+B(3),
S(40)+B(3),
S(44)+B(2),
S(60)
][bt(16,14)]

var Marker = [
mk1,
mk2,
mk3,
mk4,
mk0,
mk0,
mk0,
mk0,
mk5,
mk6,
mk7,
mk8,
mk9,
mk10,
mk9,
mk10,
mk0,
mk0,
mk0,
mk0,
mk0,
mk0,
mk0,
mk0,
][bt(24,18)]

var Lyrics = [ //The lyrics of the song you want to be. Change the speed modifier of the bt() function to which length the line plays
"Xanggiyan alin de, gukiong nimanggi be fehume tuwaci,",
"Leli abka na de, mini deyere enduri xongkoro bi.",
"Weji i hafu yome, abkai mangga beri darambi.",
"Mangga beri darara age, coktolome yabuki.",
"",
"",
"",
"",
"Xongkoro deyeme, bolgo na be coktolome tuwambi.",
"Colkon be dasihime, coktolome iserakv.",
"Age sujumpi, boconggo gerhen be sihambi.",
"Batu katun kiriba mujingga, akdacun banjiha.",
"Xanggiyan Alin serengge, musei Manjui fulehe da.",
"Sahaliyan Ula serengge, musei Manjui fulehe da.",
"Xanggiyan Alin serengge, musei Manjui fulehe da.",
"Sahaliyan Ula serengge, musei Manjui fulehe da.",
"",
"",
"",
"",
"",
"",
"",
""
][bt(24,18)]

var leftMeter = '\u2588'.repeat(abs(lm(M(0)*128*64)))
var rightMeter = '\u2588'.repeat(abs(lm(M(1)*128*64)))
var insMeter = '\u2588'.repeat(abs(lm(ins1(k1)*128*64)))
var leadMeter = '\u2588'.repeat(abs(lm(lead()*128*64)))
var bassMeter =  '\u2588'.repeat(abs(lm(bs()*128*64)))
var sbassMeter =  '\u2588'.repeat(abs(lm(bs()*128*64)))
var chordMeter =  '\u2588'.repeat(abs(lm(ccomp()*128*64)))
var arpMeter =  '\u2588'.repeat(abs(lm(arp*128*64)))
var acidMeter =  '\u2588'.repeat(abs(lm(acid*128*64)))
var noiseMeter =  '\u2588'.repeat(abs(lm(noise*128*64)))
var grMeter =  '\u2588'.repeat(abs(lm(gr*128*64)))
var lsMeter =  '\u2588'.repeat(abs(lm(ls*128*64)))
var kkMeter =  '\u2588'.repeat(abs(lm(kk*128*64)))
var hhMeter =  '\u2588'.repeat(abs(lm(hh*128*64)))
var snMeter =  '\u2588'.repeat(abs(lm(sn*128*64)))

// Lyrics displayed in error console
throw Display =
"\n"+
Title+"\n\n"+
"[| "+clock+sec+"s |]"+"\n\n"+
"[|𝙇𝙮𝙧𝙞𝙘𝙨 +----------------------------------------------------]"+"\n"+
"[|"+Marker+"\n"+
"[|"+Lyrics+"\n"+
"[|"+Marker+"\n"+
"[|𝙈𝙖𝙨𝙩𝙚𝙧 +---------------------------------------------------]"+"\n"+
"["+"|Left ---|"+leftMeter+"]"+"\n"+
"["+"|Right --|"+rightMeter+"]"+"\n"+
"[|𝙄𝙣𝙨𝙩𝙧𝙪𝙢𝙚𝙣𝙩𝙨 +-----------------------------------------------]"+"\n"+
"["+"|Lead 1 -|"+insMeter+"]"+"\n"+
"["+"|Lead 2 -|"+leadMeter+"]"+"\n"+
"["+"|Bass ---|"+bassMeter+"]"+"\n"+
"["+"|Sub-Bass|"+sbassMeter+"]"+"\n"+
"["+"|Chord --|"+chordMeter+"]"+"\n"+
"["+"|Arp ----|"+arpMeter+"]"+"\n"+
"["+"|Acid ---|"+acidMeter+"]"+"\n"+
"[|𝙎𝙁𝙓 +------------------------------------------------------]"+"\n"+
"["+"|Noise --|"+noiseMeter+"]"+"\n"+
"["+"|Growl --|"+grMeter+"]"+"\n"+
"["+"|Laser --|"+lsMeter+"]"+"\n"+
"[|𝙋𝙚𝙧𝙘𝙪𝙨𝙨𝙞𝙤𝙣𝙨 +-----------------------------------------------]"+"\n"+
"["+"|Kick ---|"+kkMeter+"]"+"\n"+
"["+"|Hihat --|"+hhMeter+"]"+"\n"+
"["+"|Snare --|"+snMeter+"]"+"\n"


},

/* Meter Display */
disp>0||(t/8.15%1%1)?MM:info()