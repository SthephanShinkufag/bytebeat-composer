tune=.6,
speed=1,

tt=t*tune,
ts=t*speed,

bt=beat=(len,spd)=>(ts>>spd)%len,
seq=(arr,spd,T=tt)=>T*2**(arr[bt(arr.length,spd)]/12)||0,
seq2=(arr,spd,T=tt)=>arr[(T>>spd)%arr.length]||0,
dec=(ramp,spd,sust)=>((ramp)-ts%(8192/spd)/sust),
dec2=(ramp,spd,vol)=>((ramp)*ts&(8192/spd)-1)/vol,
pluck=(amp,spd)=>(1.25+(ts)/spd%32)*amp,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,

mel=[0,0,3,5,5,7,3,3,0,,-5,-2,0,0,0,0],

melLead=[3,2,3,2,3,2,3,7,3,,0,,0,0,0,0,2,-2,2,-2,2,-2,2,5,-2,,-5,,-5,-5,2,2],

leadDec=lDec=[1,1,1,1,1,1,1,1,1,,1,,4,4,4,4,1,1,1,1,1,1,1,1,1,,1,,2,2,2,2],

leadVel=lVel=[2e3,2e3,2e3,2e3,2e3,2e3,2e3,2e3,2e3,,2e3,,8e3,8e3,8e3,8e3,2e3,2e3,2e3,2e3,2e3,2e3,2e3,2e3,2e3,,2e3,,8e3,8e3,8e3,8e3],

melBass=[0,0,-4,-7],

c1=[-5,-5,-7,-5],
c2=[0,0,-4,-2],
c3=[3,3,0,2],

ssaw=s=x=>atan(tan(seq(mel,13)*PI/x)),

ins=s(128)+s(127)+s(129)+s(127.5)/1.5+s(128.5)/1.5+s(129.5)+s(126),

basGate=[1,1/2,2,1,1/2,1,2,1],

bp=x=>sin(seq(melBass,16)*PI/(64*x)+sin((seq(melBass,16)*PI/(64*x)))*dec2(-1,1/basGate[bt(basGate.length,13)],1.5e3)),

bass=bp(2)+bp(2.02)+bp(4)+bp(2.04),

lead=m(atan(tan(seq(melLead,13)*PI/64))+atan(tan(seq(melLead,13)*PI/63))/2,.5),

c=x=>m(atan(tan(seq(x,16)*PI/128))+atan(tan(seq(x,16)*PI/127))/2,.5),

chord=m(c(c1)+c(c2)+c(c3),.5)*dec2(1,1/2,9e3),

n=65*log(ts%16384),
kick=tanh(tanh(sin(n))),

sseq=[1,1/2,2,1/2,1,2,1/2,1],
snare=(sin(t/2^t/3>>1^3*sin(t))||0)/pluck(.5,(256/sseq[bt(sseq.length,14)]))*dec(1,sseq[bt(sseq.length,14)],8e3)||0,

cseq=[,,,,1,1,1,1],
clap=((round((sin(t*PI/256*cos(t>>3^6))))*dec2(-1*cseq[bt(cseq.length,12)],1/2,6e3))/pluck(.5,512)),

inscomp=m(ins,.08)+
m(bass,.2)+
m(chord,.375)+
m(m(lead,.08)*dec2(-1,1/lDec[bt(lDec.length,13)],lVel[bt(lVel.length,13)])||0,1.5),
percomp=m(kick,.95)+
m(snare,.6)+
m(clap,.5),

percomp+inscomp