BPM=176,
sR=48e3,
sPB=32768,
tn=442, 
tr=2,
edo=12,

gS=(BPM,sR,sPB)=>abs(BPM/((120*sR)/sPB)),
gP=(sR,tr,tn,edo)=>(1/sR*256)*tn*2**((tr-9)/12),

r=t*gS(BPM,sR,sPB),
p=t*gP(sR,tr,tn,edo),

s=(x,y,z=0)=>x[z?y:(r/2**y)%x.length|0],

ms=(...x)=>p*2**(parseInt(s(...x),36)/12)||0,

b=x=>(x)%256/128-1,

t || (lprfx=[],delayfx=[],cfx=[]),lprfxi=0,delayfxi=0,cfxi=0,

s=(x,y,z=0)=>x[(z?y:r/2**y)%x.length|0]||0,

ms=(...x)=>p*2**(parseInt(s(...x),36)/12)||0,

lpr = lowPassResonance = (a, c, r) => (
	lpr_fxii = lprfxi ++,
	lprfx[lpr_fxii] ??= [0, 0, 0, 0],
	lprfx[lpr_fxii][0] += (a - lprfx[lpr_fxii][0] + (r + r / ((1 + .1e-9) - c)) * (lprfx[lpr_fxii][0] - lprfx[lpr_fxii][1])) * c,
	lprfx[lpr_fxii][1] += (a - lprfx[lpr_fxii][1] + (r + r / ((1 + .1e-9) - c)) * (lprfx[lpr_fxii][1] - lprfx[lpr_fxii][2])) * c,
	lprfx[lpr_fxii][2] += (lprfx[lpr_fxii][1] - lprfx[lpr_fxii][2]) * c,
	lprfx[lpr_fxii][3] += (lprfx[lpr_fxii][2] - lprfx[lpr_fxii][3]) * c,
	lprfx[lpr_fxii][3]
),

delayMax = 1e6,
delay = (signal, time, feedback = .5, dryWet = .5) => (
	delay_fxii = delayfxi ++,
	delayfx[delay_fxii] ??= {
		buf: new Float32Array(delayMax),
		idx: 0
	},
	dLength = min(delayfx[delay_fxii].buf.length, max(1, time | 0)),
	out = delayfx[delay_fxii].buf[delayfx[delay_fxii].idx],
	delayfx[delay_fxii].buf[delayfx[delay_fxii].idx] = signal + out * feedback,
	delayfx[delay_fxii].idx = (delayfx[delay_fxii].idx + 1) % round(dLength),
	mix = min(1, max(0, dryWet)),
	out * mix + signal * (1 - mix)
),

cv=(tone = t, note = [[0]], trnsp = 0, wave = input => (input / 128 % 2 - 1 + input / 256 % 2 - 1)/1.6) => {
   let idx = chr = 0
   let poly = 5
   for (; idx < min(poly, note.length); idx++)
      chr += wave(tone * 2 ** ((note[idx] + trnsp) / 12))
   return poly ? chr / poly : 0
},

saw=x=>atan(tan(x*PI/512))/(PI/2),

m1=ms('FGNGFGBGFGNGGPNGFGNGFGBGFGNGKLKG',31&((21&r>>13)^(r>>15))+(r>>13&r>>14),1),

m2=ms("GGKIGGFBGGIGKLKF",15)/4,

mb=ms('9B8D',16)/4,

u1=s('112211324423123',14),

u2=s('121312243211243',14),

cm1=s([[-3,1,4,8,11],[-1,3,8,11,18],[-4,-1,3,8,15],[1,4,8,13,20]],16),

M=x=>(

i1=delay((saw((m1&(x?128:64)?m1^m1/(x?.99:1.01):m1))+saw((m1|(x?63.8:64.2)?m1|m1*(x?1.99:2.01):m1)))*cos(r%8192*PI/16384)**3,12288,x?.4:.3,x?.45:.4),

i2=delay(sin((m2^r>>12)*PI/2**((x?s([3,4,5],13):s([3,1,4,2],13))+(r>>13&3)))*cos(r/(ud=s('1121',14))%8192*PI/(16384*ud))**(s([3,5,3,9],13)+(x?.2:0)),12288,x?.5:.3,.4),

b1=(
dsp=x=>{
h=0;a=1e-4;j=.002;
for(i=1;i<x;i++){
n=(2*PI)*j*i*mb-a*(i*s([8,25,72,104],13))*(-i*s([50,25,42],(r&8192?14:12))+((r>>10^r>>13^r*3>>12)%16));
h+=sin((n/1.01))/i}
return h/2
},

ub1=((r*u1%2**s([14,15,13,14],(r&(r&65536?12288:16384)?13:14))>>8)+1),
dsp(r*u1&8192?((r*u1&8192?64:24)-ub1):(r*u1&8192?64:24+ub1))),

b2=lpr(saw(r*u2&8192?mb^mb*(1+(r*u2>>15&3)):mb)+saw(mb/(mb&(x?128:64)?2:1)),abs(sin(r*u2*PI/16384))**(x?1:3)+.005,abs(sin(r*PI/131072))*.95,.5),

d=(
dp=s('kkkk    rrrrs r s r kkkkrrrrs r kkkkkkkkrrrrs r s r kkkkrrrrs r ',11),
dp=='k'?tanh(sin((x?10:12)*cbrt((r+(x?0:128))%8192)**(x?.8:.75))/(r%8192)*1024*12)*16*cos(r%8192*PI/16384)**9:
dp=='r'?(b(t*(x?.97:1)*tan(t*(x?1.03:1)>>(x?3:2)&t)))*4*cos(r%8192*PI/16384)**3:
dp=='s'?(sin(t*(x?1.01:1)^t>>1)*2.5)*random():0),

h=((t*(441/480)&1)-.5)*random()*sin(t/(x?1.8:1.5))*cos(r%8192*PI/16384)**9*9,

cm=(random()-.5)*cos(r%8192*PI/16384)**.7,

c1=(cv(p*(x?.99:1.01),cm1)+cv(p,cm1)+cv(p*(x?.98:1.02),cm1)+cv(p/2,cm1))/3*cos(sin(r*u1*PI/16384))**(x?(r&16384?3.2:1.5):(r&16384?3:1.1)),

sw=lpr(atan(tan(t*(x?1.05:1)*t|t*(x?1.01:1)>>1))/4,abs(cos(r*PI/2**20)**11),.9)*sin(r%16384*PI/32768)**.7,

tanh((
min(max(atan(((i1*1.3+c1*1.75+b1*1.3+i2*1.24)*1.8)/64)*24,-.75),.75)*sin(r%16384*PI/32768)**.14*2.4
+atan(d)*2+h*1.6+sw*1.4
+atan(c1*6+b2*2+b1+i1)/1.7)
/64)*12
),

[M(0),M(1)]