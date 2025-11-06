// A remix of My Singing Monsters - Ethereal Workshop

BPM=140,

r = repeat = (x, y) => Array(x).fill(y).flat(9),

t ? 0 : fx = r(3e5, 0),
t ? 0 : vars = r(3e5, 1),
fxi = 0,

t?0:z1=[],
callCount=0,
lpf=lowPassFilter=(a,c)=>(
	call=callCount++,
	z1[call]??=0,
	z1[call]+=(a-z1[call])*c
),
hpf=highPassFilter=(a,c)=>a-lpf(a,c),
bpf=bandPassFilter=(a,hc, lc)=>hpf(lpf(a,lc), hc),
nf=notchFilter=(a,lc, hc)=>(hpf(a, hc)+lpf(a,lc))/1.75,
lbf=lowBoostFilter=(a,c,v)=>a+lpf(a,c)*v,
hbf=highBoostFilter=(a,c,v)=>a+hpf(a,c)*v,

lpr = (x,ct,res) => ((fxi++, // Lowpass with Resonance
	t?0:(this[fxi+'lp6']=0,this[fxi+'lp12']=0),
	CT=min(ct,0.999),
	R=res+res/(1-CT),
	this[fxi+'lp6']+=CT*(x-this[fxi+'lp6']+R*(this[fxi+'lp6']-this[fxi+'lp12']))),
	this[fxi+'lp12']+= CT*(this[fxi+'lp6']-this[fxi+'lp12'])
),

t2 = t,
SampleRate=48000,
Beat=t/48000/60*BPM,
DeNaN=x=>x==x&&x,
Note=(x,o=1)=>DeNaN((2**((x/12)+o))),
SlideNote=sn=(speed=2)=>(Beat*speed%1),
FastNote=fn=(x,y=NaN,Speed=8)=>(Beat*Speed&1?y:x),
pulse = pls = (x,y=128) => ((x/256%1+y/256)&1)-.5,

Saw=x=>atan(tan(x/128*PI))/PI*2,

Arrays=[
[ , ,8,8,5,fn(7,NaN,4),8,8, , ,fn(5,NaN,4),fn(7,NaN,4),fn(8,NaN,4),fn(7,NaN,4),5,5, , ,8,8,5,fn(7,NaN,4),8,8,7,7,fn(5,NaN,4),fn(1,NaN,4),0,0,0],

[fn(5,NaN,4),fn(7,NaN,4),8,8,fn(5,NaN,4),fn(7,NaN,4),8,8,fn(5,NaN,4),fn(7,NaN,4),8,10,fn(5,NaN,4),fn(7,NaN,4),8,8,fn(4,NaN,4),fn(7,NaN,4),5,5,fn(4,NaN,4),fn(5,NaN,4),7,7,fn(4,NaN,4),fn(5,NaN,4),7,8,fn(4,NaN,4),fn(5,NaN,4),7,7],

[5,3,2,1,1,0,1,4],[14,12,10,6,5,4,5,7],

[ , ,0,0,-4,-2,0,0, , ,-4,-2,0,-2,-4,-4, , ,0,0,-4,-2,0,0,1,1,-4,-5,-8,-8-(sn(1)**8*4),-12,-12],

[5,7,8,8,5,7,8,8,5,7,8,10,12,10,10,10,8,10,12,12,8,10,12,12,8,10,10,8,7,8,8,7]
],
Chord = x => [1,3,5,7,8,10,12][(x%7)]*2**floor(x/7),

vars[0] += Note(Arrays[0][((Beat*2%32)|0)],.985),

vars[1] += Note(Arrays[1][((Beat*2%32)|0)],.985),

vars[2] += Note(Arrays[2][((Beat/2%8)|0)],.985),

vars[3] += Note(Arrays[3][((Beat/2%8)|0)],.985),

vars[4] += Note(Arrays[4][(Beat*2%32|0)],-.015)/2,

vars[5] += Note([ ,-7,5,][(Beat*2%4|0)],-.015)/2,

vars[6] += Note(Arrays[5][((Beat*2%32)|0)],-.015),

// ALL MONSTERS


GaddzooksTrack1=atan([0,sin(1/(Beat*2%1+.1)**1.5+(random()*2-1)*(1-Beat*2%1)**8)*(1-Beat*2%1)**3/4,lpr(random()*2-1,.12,.8)/2**((Beat*2%1)*8)][[1,0,2,0,1,0,2,1,1,0,2,0,1,0,2,0][Beat*2%16|0]]*12)/PI*2,

GaddzooksTrack2=atan([0,sin(1/(Beat*4%1+.1)**1.5+(random()*2-1)*(1-Beat*4%1)**8)*(1-Beat*4%1)**3/4,lpr(random()*2-1,.12,.8)/2**((Beat*4%1)*8),sin(1/(Beat*4%1+.1)**1.5*2+(random()*2-1)*(1-Beat*4%1)**8)*(1-Beat*4%1)**3/4][[1,0,1,0,2,0,1,2,0,0,1,0,2,0,0,0,1,0,1,0,2,0,3,2,3,2,1,0,2,0,0,0][Beat*4%32|0]]*12)/PI*2,

YooreekTrack1 = atan(lpr(pls(vars[0]/4,atan(abs(sin(Beat*'0121022101211210'[(Beat%16)|0]*PI))*8)/PI*256+128),atan(abs(sin(Beat*'1121122111211210'[(Beat%16)|0]*PI))*8)/PI*.15,.9)*100)/PI+atan(lpr(pls(vars[0]/8*1.5,atan(abs(sin(Beat*'1121122111211210'[(Beat%16)|0]*PI))*8)/PI*128+128),atan(abs(sin(Beat*'0121022101211210'[(Beat%16)|0]*PI))*8)/PI*.1,.5)*10)/PI,

YooreekTrack2 = atan(lpf(atan(lpr(
pls(vars[6],128-atan(abs(sin((Beat/'1212111212121111'[Beat%16|0]*2*PI)))*8)/PI*200),
min((Beat*2%'1212111212121111'[Beat%16|0]/2)*3,1)/7,.92)),.3)*2)/PI*2,

BlarretTrack1 = atan((sin(vars[1]/64*PI+sin(vars[1]/128*PI)*8*lpf(1-(Beat/'1122112211111122'[Beat*2%16|0]*2%1),.001))/2+sin(vars[1]/128*PI)/2+sin(vars[1]/256*PI+sin(t/900)/4))*4)/PI*2,

MeebkinTrack1 = (sin(vars[2]/64*PI)*(sin(t/700))**7+sin(vars[3]/128*PI)*(sin(t/700+PI/2))**7)*min(atan(sin(Beat*PI+cos(Beat*PI*2)/2))/PI*2,0),

PentumbraTrack2 = (sin(vars[4]/16*PI+sin(t/300)+sin(vars[4]/31.6*PI))+sin(vars[4]/128*PI+sin(vars[4]/16.2*PI)))*atan(abs(sin(Beat*'0121022101211211'[(Beat%16)|0]*PI))*3)/PI,

PentumbraTrack1 = (sin(vars[5]/16*PI+sin(t/300)*'0020'[Beat*2%4|0]+sin(vars[5]/31.6*PI))+sin(vars[5]/128*PI+sin(vars[5]/16.2*PI)))*atan(abs(sin(Beat*'0220'[(Beat*2%4)|0]*PI))*3)/PI,

// ** SONG **

DeNaN(hpf([
YooreekTrack1+GaddzooksTrack1,
MeebkinTrack1+GaddzooksTrack1+PentumbraTrack1*(Beat/8&1),
YooreekTrack1+GaddzooksTrack1+PentumbraTrack2,
BlarretTrack1+GaddzooksTrack1+PentumbraTrack1*(Beat/8&1),][(Beat/16)|0],.01)/2)