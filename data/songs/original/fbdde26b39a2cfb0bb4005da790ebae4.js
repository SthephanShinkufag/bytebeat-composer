/*
______  ___    ___ _______   _______   _______   __ _____ 
| ___ \/ _ \  / _ \_   _\ \ / / ___ \ |  ___\ \ / /|  ___|
| |_/ / /_\ \/ /_\ \| |  \ V /| |_/ / | |__  \ V / | |__  
| ___ \  _  ||  _  || |   \ / |    /  |  __| /   \ |  __| 
| |_/ / | | || | | || |   | | | |\ \ _| |___/ /^\ \| |___ 
\____/\_| |_/\_| |_/\_/   \_/ \_| \_(_)____/\/   \/\____/ 

EDM Remix of the Altai Folk Song "Baatyr's Words (Баатырдыҥ сӧӧзи)" by Muse Labs.

The original can be heard here: https://www.youtube.com/watch?v=gHIZWUcUFA4
*/

//Turn on/off the console
i=0, // 0 = On, 1 = Off

// Important Variables

T=t,
t2=t,

// Adjustables

tune=0.712,
speed=1,

tt=t*tune,
ts=t*speed,

// Main Variables

bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
pseq=(char,spd=13,pitch=1)=>(tt*pitch*tune)*2**
(parseInt(char[bt(char.length,spd)],36)/12)||0,
seq=(arr,spd=13,pitch=2)=>tt*pitch*2**(arr[bt(arr.length,spd)]/12)||0,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
b=bytebeat=code=>((code)&255)/127-1,
bsn=(T,p=1)=>sin(T*PI/(128/p))*128+127.5,
s=saw=(T,p=1)=>atan(tan(T*PI/(128/p))),

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

mel1=[
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,-2,-2,
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,-2,-2,
3,3,3,3,,,3,3,3,3,5,3,2,,2,2,
3,3,3,3,,,3,3,3,3,3,3,2,2,2,2,
-2,-2,-2,-2,,,-2,-2,-2,-2,-2,-2,-5,-5,-5,-5,
-2,-2,-2,-2,,,-2,-2,-2,-2,-2,-2,-5,-5,-5,-5,
0,0,0,0,,,0,0,0,0,2,0,-2,-2,-2,-2,
0,0,0,0,,,0,0,0,0,0,0,-2,-2,-2,-2,
][bt(128,12)],

mel2=[
0,0,7,7,7,7,7,7,7,7,7,7,8,7,5,7,
0,0,7,7,7,7,7,7,7,7,7,7,8,7,5,5,
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
0,0,0,0,0,0,0,0,0,0,0,0,2,0,-2,-2,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,
0,0,7,7,7,7,7,7,7,7,7,7,10,7,5,7,
0,0,7,7,7,7,7,7,7,7,7,7,10,7,5,7,
][bt(128,12)],

mel3=[
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
3,3,3,3,3,3,3,3,3,3,3,3,5,3,2,2,
0,0,0,0,0,0,0,0,0,0,0,0,2,0,-2,-2,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,
-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-7,-9,-7,-7,-7,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-3,-5,-5,
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,-2,-2,
0,0,-12,0,,,0,0,-12,0,0,0,-2,-2,,,
][bt(128,12)],

mel1R=[
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,0,-2,-2,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,0,-2,-2,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-2,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-2,-5,-5,
][bt(128,12)],

mel2R=[
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-5,-7,-7,
-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
-5,-5,0,0,0,0,0,0,0,0,0,0,5,3,2,3,
][bt(128,12)],

mel3R=[
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,0,-2,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-2,-5,-7,-7,
-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,-12,
-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,-10,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-5,-7,-7,-5,-5,
][bt(128,12)],

melLead=[
0,0,0,,0,,0,,0,0,0,,0,
0,0,,0,,0,,0,,0,,0,,0,,0,0,
,,3,,3,,3,,3,,3,,3,,3,3,
3,,3,,3,,3,,3,,3,,3,,3,3,
3,,5,,5,,5,5,5,5,,,,,5,,
3,,2,2,2,,,,,,2,,2,,2,
,2,,3,,2,,0,0,0,,,,,,
,,,,,,,,,,,,,,,,,,,,
][bt(128,12)],

melcomp=[mel1,mel1,mel2,mel3],

melcompR=[mel1R,mel1R,mel2R,mel3R],

mlComp=[NaN,NaN,melLead,melLead],

st1=[0,3,7,12][bt(4)],
st2=[3,7,10,15][bt(4)],
st3=[5,8,12,17][bt(4)],
st4=[7,10,14,19][bt(4)],
st5=[-2,2,5,10][bt(4)],

bsm=[
0,0,3,3,-2,-2,0,0,
0,0,3,3,-2,-2,0,0,
0,0,3,3,5,7,0,0,
0,0,3,3,5,7,0,0
],
b2=[
3,3,7,7,2,2,3,3,
3,3,7,7,2,2,3,3,
3,3,7,7,8,10,3,3,
3,3,7,7,8,10,3,3
],
b3=[
7,7,10,10,5,5,7,7,
7,7,10,10,5,5,7,7,
7,7,10,10,12,14,7,7,
7,7,10,10,12,14,7,7
],
b4=[
12,12,15,15,10,14,12,12,
12,12,15,15,10,14,12,12,
12,12,15,15,17,19,12,12,
12,12,15,15,17,19,12,12
],

stm=[
st1,st2,st5,st1,
st1,st2,st5,st1,
st1,st2,st3,st4,
st1,st2,st3,st4
],

lfo1=[128,,256,512],
lfo2=[1,,1,1],

kseq=[1,,1,,1,,1,1],
hseq=[,,2,4,,,1,2],
sseq=[,512,,512],

// These Variables act as shortcuts

k1=seq(melcomp,19),
k2=seq(melcompR,19),

// Instruments

ins=mel=>b((((mel/1.0075)&128)&(mel&128))^(((mel%16384)/(mel%128)%128)/2))/plk(.4,lfo1[bt(lfo1.length,12)])||0,

strings=str=s(seq(stm,17,1/2))*dec(1,4,32e3),

synth=mel=>syn=(ks=seq(mel,16,1),s(ks)/4+s(ks,1.01)/4+s(ks,.99)/4+s(ks,1.02)/4+s(ks,.98)/4),

syncomp=(synth(bsm)/4+synth(b2)/4+synth(b3)/4)*dec(1,4,12e3),

syn1=mel=>((atan(tan(mel*PI/128))+atan(tan(mel*PI/127))+atan(tan(mel*PI/126))+atan(tan(mel*PI/129)))*dec(-1,lfo2[bt(lfo2.length,12)],8e3)*dec(1,8,12e3)),

lead=(kl=seq(mlComp,20,4),b((kl^kl/2+kl+128*(sin((kl*PI/256)+(kl*PI/32768))+64))%128))+.5,

bass=(kb=seq(bsm,17,1),bs=b(kb^kb/2%127+kb|ts%64/2+s(kb))*(s(kb/2|s(kb*4))*s(kb/4))/2*dec(-1,2,8e3)*dec(1,8,12e3)),

// Percussions

snare=sn=(sin(t*PI/128)/2+sin(t&t>>2)*b(cos(t^t>>2)+cos(t>>1)))/plk(.4,sseq[bt(sseq.length,14)])||0,

kick=kk=atan(tan(tan(sin(cbrt(ts%8192)*5))))*kseq[bt(kseq.length,13)]||0,

h=T*(441/480),
closehhat=ch=(h&1)%(cos(t*t>>6))/plk(.4,256),
openhhat=oh=((h&1)*atan(tan(t*t>>5)))/4*dec(-1,hseq[bt(hseq.length,13)],12e3)||0,

// Master

lM=m(m(rv(syn1(k1)/2.2+(ins(k1)*7.2),12e3,.4,.9,1.2,1),.22)+
rv(ins(k1)*1.55,12e3,.4,.5,1.6,1)
+m(kk,.7)+sn+rv(ch*4+(oh*2.5),12e3,.4,.9,1.2,1)+
+m(rv(str,4e3,.4,.5,1.6,1),.875)+
m(syncomp,.75)+
m(lead,.8)+
bs*1.3,.9)
+.35,

rM=m(m(rv(syn1(k1)/2.4+(ins(k1)*7.5),12e3,.5,.9,1.2,1),.2)+
rv(ins(k2)*1.7,12e3,.4,.9,.8,1)
+m(kk,.65)+sn+rv(ch*3.7+(oh*2.8),9e3,.7,.75,.8,1)+
+m(rv(str,4e3,.4,.5,1.6,1),.875)+
m(syncomp,.675)+
m(lead,.83)+
bs*1.1,.9)
+.325,

M=[
lM
,
rM
],

// Infoboard for Lyrics:

info = function(length) {
var Title = "\nBaatyr.EXE - EDM Remix of Baatyr's Words (Баатырдыҥ сӧӧзи) by Muse Labs"

var Lyrics = [
"Кеен чӱмдӱ бу Алтайда,",
"Кеен чӱмдӱ бу Алтайда,",
"Кебис jараш бу jалаҥда,",
"Кебис jараш бу jалаҥда,",
"Ак тайганыҥ эдегинде,",
"Ак тайганыҥ эдегинде,",
"Ак талайдыҥ jарадында",
"Тегин эмес jӱрӱм jӱрген",
"Тегин эмес jӱрӱм jӱрген",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"",
"",
"",
"Ары кӧрзӧ, андый эмес,",
"Ары кӧрзӧ, андый эмес,",
"Бери кӧрзӧ, мындый эмес,",
"Бери кӧрзӧ, мындый эмес,",
"Ары кӧрзӧ - айудый,",
"Ары кӧрзӧ - айудый,",
"Бери кӧрзӧ - бӧрӱдий,",
"Коркор сӧс ол билбес",
"Коркор сӧс ол билбес",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"Баатырыс jуртаган.",
"",
"",
"",
"Алтайынаҥ алкышту:",
"Алтайынаҥ алкышту:",
"Аткан огы чике тийер,",
"Аткан огы чике тийер,",
"Эткен эдим эптӱзи",
"Эткен эдим эптӱзи",
"Минген ады jаражы,",
"Айткан сӧзи чечени.",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"Угыгар, угыгар, угыгар!",
"",
"",
"",
"Калганчыда баатыр айткан:",
"Калганчыда баатыр айткан:",
"Келер-келер бу чактарда",
"Келер-келер бу чактарда",
"Кебис jараш бу jалаҥда,",
"Кебис jараш бу jалаҥда,",
"Кеен чӱмдӱ бу Алтайда",
"Кеен чӱмдӱ бу Алтайда",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"Кубулар, кубулар, jӱрӱмис!",
"",
"",
"",
][bt(64,15)]

var Roman = [
"Keen chu̇mdu̇ bu Altaĭda,",
"Keen chu̇mdu̇ bu Altaĭda,",
"Kebis jarash bu jalan͡gda,",
"Kebis jarash bu jalan͡gda,",
"Ak taĭganyn͡g ėdeginde,",
"Ak taĭganyn͡g ėdeginde,",
"Ak talaĭdyn͡g jaradynda",
"Tegin ėmes ju̇ru̇m ju̇rgen",
"Tegin ėmes ju̇ru̇m ju̇rgen",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"",
"",
"",
"Ary kȯrzȯ, andyĭ ėmes,",
"Ary kȯrzȯ, andyĭ ėmes,",
"Beri kȯrzȯ, myndyĭ ėmes,",
"Beri kȯrzȯ, myndyĭ ėmes,",
"Ary kȯrzȯ - aĭudyĭ,",
"Ary kȯrzȯ - aĭudyĭ,",
"Beri kȯrzȯ - bȯru̇diĭ,",
"Korkor sȯs ol bilbes",
"Korkor sȯs ol bilbes",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"Baatyrys jurtagan.",
"",
"",
"",
"Altaĭynan͡g alkyshtu:",
"Altaĭynan͡g alkyshtu:",
"Atkan ogy chike tiĭer,",
"Atkan ogy chike tiĭer,",
"Ėtken ėdim ėptu̇zi",
"Ėtken ėdim ėptu̇zi",
"Mingen ady jarazhy,",
"Aĭtkan sȯzi checheni.",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"Ugygar, ugygar, ugygar!",
"",
"",
"",
"Kalganchyda baatyr aĭtkan:",
"Kalganchyda baatyr aĭtkan:",
"Keler-keler bu chaktarda",
"Keler-keler bu chaktarda",
"Kebis jarash bu jalan͡gda,",
"Kebis jarash bu jalan͡gda,",
"Keen chu̇mdu̇ bu Altaĭda",
"Keen chu̇mdu̇ bu Altaĭda",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"Kubular, kubular, ju̇ru̇mis!",
"",
"",
"",
][bt(64,15)]

var English = [
"On this beautifully enrobed Altai",
"On this beautifully enrobed Altai",
"On this plain, like a beautiful carpet",
"On this plain, like a beautiful carpet",
"On the slopes of the White Mountains",
"On the slopes of the White Mountains",
"On the shores of the White Sea",
"Life is not living in vain",
"Life is not living in vain",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"",
"",
"",
"Look there its not the same",
"Look there its not the same",
"Look at this, is it not so",
"Look at this, is it not so",
"Over there - it looks like a bear",
"Over there - it looks like a bear",
"Unknowing of the dreadful words",
"And here - it looks like a wolf",
"And here - it looks like a wolf",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"When Batyr lived",
"",
"",
"",
"This blessed Altai",
"This blessed Altai",
"His arrow strikes true",
"His arrow strikes true",
"His actions are quick",
"His actions are quick",
"His horse - beautiful",
"His words are elegant",
"Listen, listen, listen!",
"Listen, listen, listen!",
"Listen, listen, listen!",
"Listen, listen, listen!",
"Listen, listen, listen!",
"",
"",
"",
"Finally, Batyr said:",
"Finally, Batyr said:",
"In the future",
"In the future",
"On this plain, like a carpet",
"On this plain, like a carpet",
"On this beautifully enrobed Altai",
"On this beautifully enrobed Altai",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"Change, change our life",
"",
"",
"",
][bt(64,15)]


// The meter code is from D3schnot

Mst=(lM*25+rM*25)
ds=0 // Downsampling
vol=0 //Volume
	var l = comp => ds>=1?(abs(comp%256)-ft)/2:abs(comp%256)/(vol?2:1)+(vol?64:0)-128

   var meter = [
'                               ','█                              ','██                             ',
'███                            ','████                           ','█████                          ',
'██████                         ','███████                        ','████████                       ',
'█████████                      ','██████████                     ','███████████                    ',
'████████████                   ','█████████████                  ','██████████████                 ',
'███████████████                ','████████████████               ','█████████████████              ',
'██████████████████             ','███████████████████            ','████████████████████           ',
'█████████████████████          ','██████████████████████         ','███████████████████████        ',
'████████████████████████       ','█████████████████████████      ','██████████████████████████     ',
'███████████████████████████    ','████████████████████████████   ','█████████████████████████████  ',
'██████████████████████████████ ','███████████████████████████████'][(abs(l(Mst))/4&31)]
	var volume_meter = '\n\n              <Master>\n⧸|'+meter+'|⧹'+'\n⧹|'+meter+'|⧸\n '

throw Display =
Title +
"\n\n"+
"[------------] Lyrics [------------]"+
"\n"+
Lyrics+
"\n"+
Roman +
"\n" +
English +
"\n" +
"[----------------------------------]"+
"\n"+
volume_meter
},

i>0||(t/8.15%1%1)?M:info()