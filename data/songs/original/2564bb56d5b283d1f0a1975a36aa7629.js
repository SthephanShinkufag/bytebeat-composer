tune=1.3,
speed=1.375,

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

mel='1 4 B RN I G F8BF G 8 B6 8 4 643',

melBass='DD99BBGB',
melC1='886688B8',
melC2='44114484',
melC3='IIGGFFI1',

t?0:fx=r(4e4,0), // Effect Variable, by Greaserpirate

fxi=0, // Iterator, resets to 0 at every t

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

deseq=[2,4,2,,1,4,2,],
devol=[5e2,1e3,5e2,,2e2,1e3,5e2,],
bass=((sin(pseq(melBass,16)*PI/512
+sin(pseq(melBass,16)*PI/1024))*
dec(-1,deseq[bt(deseq.length,13)],
devol[bt(devol.length,13)])))/2*
s(pseq(melBass,16),1/8,1,t)*s(pseq(melBass,16),1/7.97,1,t)||0,

sbsLayer=b(pseq(melBass,16)/8^3*
pseq(melBass,16)/16&pseq(melBass,16)/4),

sbass=subbass=w(pseq(melBass,16),.125)*
s(pseq(melBass,16),1/8,1/16,t)*sbsLayer,

leadLayer=mel=>
m(s(pseq(mel,16),.49),.5)+
m(s(pseq(mel,16),.495),.25)+
m(m(s(pseq(mel,16),.5),.5)+
m(s(pseq(mel,16),.505),.25)+
m(s(pseq(mel,16),.51),.5),.5),

lead=
leadLayer(melBass)*dec(1,8,2e4)+
leadLayer(melC1)*dec(1,8,2e4)+
leadLayer(melC2)*dec(1,8,2e4)+
leadLayer(melC3)*dec(1,8,2e4),

n=log(ts%32768),
kick=tanh(sin(w((2.5e3*n))))*tanh(sin(w((5e2*n)))),

sseq=[1,2,1,4,2,2,1,2],
snare=sn=b((1&(t*441/480))*random()*(t*tan(t)+128))/
-b((1&(t*441/480)))*1.5,

sseqR=[1,4,2,1,4,1,2,4],
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
(rv(ins,7e3,.5,.8,1,1)+
(m(lead,.25)+.2)+
((m(bass,.0875)+
m(sbass,4.5))-.2)+

m(kick,1.3)+
snc+
m(crc,1.675))
-.2,

(rv(ins,9e3,.675,.825,1,1)+
(m(lead,.225)+.15)+
((m(bass,.0875)+
m(sbass,4.25))-.15)+

m(kick,1.25)+
sncR+
m(crc,1.675))
-.15
]