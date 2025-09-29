//Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
T = t,

// Separate Variables
tune=1.55,
speed=1.8,

tt=t*tune,
ts=t*speed,

t2=t,

bt=beat=(len,spd,spd2=1)=>(ts*spd2>>spd)%len,
pseq=(char,spd=13,pitch=1)=>(t*pitch*tune)*2**
(parseInt(char[bt(char.length,spd)],36)/12)||0,
seq=(arr,spd)=>2**(arr[bt(arr.length,spd)]/12)||0,

r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,

b=bytebeat=code=>((code)&255)/127-1,
s=saw=(morph=t,pitch=1,amp=1,sq=1)=>
	atan(tan((morph+128)*(PI/256*pitch))*sq)/(PI/2)*amp,
w=wave=(morph=t,pitch=1,amp=1)=>sin(morph*(PI/128)*pitch)*amp,

dec=(ramp,spd,vol)=>((ts*ramp)&(4096*spd)-1)/vol,
dec2=(ramp,spd,vol)=>((ts*ramp)&(4096/spd)-1)/vol,
pluck=plk=(amp,spd)=>(1.1+(ts)/spd%32)*amp,

mel='1 4 B RN I G F8BF G 8 B6 8 4 643'[31&(11&ts>>13)+(ts>>15)],

melBass='DD99BBGB',
melBass2='KKGGDDFI',
melLead='B8FBBDDD        GFD88888        ',
stMel='   G  G  G  B  D   D  D  D  G  B   G  G  G  G  K   B  B  B  B  D',
melC1='886688B8',
melC2='44114484',
melC3='IIGGFFI1',
melC4='NNLLKKRN',

t?0:fx=r(4e4,0), // Effect Variable, by Greaserpirate
I = 0, // Index of F

fxi=F=0, // Iterator, resets to 0 at every t

rv=reverb=(x,len=16e3,feedb=.7,dry=.4,wet=1,dsp=2,T=t2)=>(
	ech=y=>fxi+(0|(y%len)/dsp),
	x=x*dry+wet*fx[ech(T)]||0,
	t2%dsp?0:fx[ech(t2)]=x*feedb,
	fxi+=0|(len/dsp),
	x
),

insLayer=b(pseq(mel)*4^3*pseq(mel)*4/2&pseq(mel))*b(pseq(mel)*2^pseq(mel)*2),

ins=
m((s(pseq(mel),1,1,dec(-1,2,4e3))+
s(pseq(mel),.99,1,dec(-1,2,4e3))+
s(pseq(mel),1.01,1,dec(-1,2,4e3))+
s(pseq(mel),.98,1,dec(-1,2,4e3))+
s(pseq(mel),1.02,1,dec(-1,2,4e3)))+
s(pseq(mel))*insLayer
,.125),

bsLayer=b(pseq(melBass,16)^6*
pseq(melBass,16)/8&pseq(melBass,16)/2^pseq(melBass,16)/8),
sbsLayer=b(pseq(melBass,16)/8^3*
pseq(melBass,16)/16&pseq(melBass,16)/4),

deseq=[,2,2,2,2,2,1,2],
deseqsb=[2,1,2,4,2,1,2,4],
devol=[,1e3,1e3,1e3,1e3,1e3,1e3,],
devolsb=[,1e2,,1e2,1e2,1e2,1e2,,1e2],

bass=(mel=melBass,pitch=8,mix=12)=>((b(-pseq(mel,16)/pitch*((ts>>13&1)+1)%256*((abs(sin(ts*PI/32768)/4)*mix)+1)&128)*
dec(-1,deseq[bt(deseq.length,13)],
devol[bt(devol.length,13)])))/8||0,

sbass=subbass=(mel=melBass)=>w(pseq(mel,16),.125)*
s(pseq(mel,16,2),1/8,1/16,t)*sbsLayer*dec(-1,deseqsb[bt(deseqsb.length,12)],
devolsb[bt(devolsb.length,13)]*4)||0,

chrdLayer=mel=>
b((sin(pseq(mel,16)*PI/256)*128+127.5)%(sin(pseq(mel,16)*PI/255)*128+127.5)-128)/4,

chrd=chord=
chrdLayer(melBass)*dec(1,8,2e4)+
chrdLayer(melC1)*dec(1,8,2e4)+
chrdLayer(melC2)*dec(1,8,2e4)+
chrdLayer(melC3)*dec(1,8,2e4)+
chrdLayer(melC4)*dec(1,8,2e4),

ls=[7,7,8,8,8,8,9,9,,,,,,,],
lead=(a=pseq(melLead,15,2),b(a^a/2|sin(a*PI/128)+a&a/2|ts>>ls[(ts>>15)&15])*w(a/2)),

sting=(a=pseq(stMel,13),atan(tan(asin(w((a>>4)*16))))/plk(1/2,256)),

n=log(ts%32768),
kick=asin(sin(tanh(tanh(sin(w((1.5e3*n)))))))*asin(tanh(sin(w((5e2*n))))),

sseq=[1,2,1,1,1,1,1,2],
snare=sn=b((1&(t*441/480))*random()*(t*tan(t)+128))/
-b((1&(t*441/480)))*1.5,

sseqR=[1,1,1,1,2,1,1,1],
snareR=snR=b((1&(t*441/480))*random()*(t*sin(t)+128))/
-b((1&(t*441/480)))*1.5,

snc=m(sn,.675)/plk(.75,
512/sseq[bt(sseq.length,13)])||0,

sncR=m(snR,.675)/plk(.75,
512/sseqR[bt(sseqR.length,13)])||0,

crash=cr=(b(t*sin(t>>3))*random()*b(t*sin(t>>2))*dec(-1,8,4e3))/2.5,

cseq=[,,,,1,1,1,1],
crc=cr/-plk(.75,1024/cseq[bt(cseq.length,13)])||0,


[
rv(m(lead,.5),7e3,.5,1,1,1)+
rv(m(sting,2),9e3,.5,1,1,1)+
(rv(ins,7e3,.5,1,1,1)+
(m(chrd,.75)+.2)+
(m((bass()*3**sbass()*3)||0,.525))-.3+

m(kick,1.6)+
snc+
m(crc,1.675))
+.3,
rv(m(lead,.5),8e3,.55,.95,1,1)+
rv(m(sting,2.4),9e3,.5,1,1,1)+
(rv(ins,9e3,.675,1.2,1,1)+
(m(chrd,.8)+.15)+
m(((m(bass(melBass2,16),.5)**m(sbass(melBass2,16),.55)||0))-1,.4)-.72+

m(kick,1.55)+
sncR+
m(crc,1.675))
+.25
]