t*=1.5,

t2=t,

bt=beat=(len,spd)=>(t>>spd)%len,
dec=(ramp,spd,sust)=>((ramp)-t%(8192/spd)/sust),
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,
seq=(arr,spd,T=t)=>arr[(T>>spd)%arr.length]||0,
pseq=(arr,spd,pitch=1)=>(t*pitch)*PI/256*2**(parseInt(arr[bt(arr.length,spd)],36)/12)*15.2795&255,

mel='C J MOC J Q R K C K KJF H J MOC ',

melBass=mB='CF7EJH8A',
melBass2=mB2='7A37CA57',

ins=pseq(mel,14)^3*pseq(mel,14)/2+pseq(mel,14)^3*pseq(mel,14)/2,

b=mel=>(pseq(mel,18)^pseq(mel,18)/2&6*pseq(mel,18)/2^pseq(mel,18)/4)&pseq(mel,18,1.01)*dec(1,1/2,2e4)^pseq(mel,18,1.01)*dec(1,1/2,2e4)/2,

bass=b(mB)/2+b(mB2)/2,

b2=mel=>(pseq(mel,18,.5)^3*pseq(mel,18,.5)/2)/2,

bass2=b2(mB)/2+b2(mB2)/2,

b3=mel=>((pseq(mel,18)^3*pseq(mel,18,.5)|pseq(mel,18)+pseq(mel,18)^pseq(mel,18,4)))/4^pseq(mel,18,
16)>>pseq(mel,18,.0625),

bass3=b3(mB)/2+b3(mB2)/2,

ls=sin(t2/9&t2>>5),
s=seq([ls,0],10),
h=1&((t2/1.5)*441)/960,
p=t/32,

drm=drum=(arr,spd,vel=2e4,vol=1,T=p,oct=0)=>
	m(vel/(T&(2**(spd-oct)/seq(arr,spd,p))-1),vol)||0,

kseq=[1,,1,1,,1,,1],
kick=x=>drum(kseq,x,7e5),

sseq=s=[,,ls,s,,,,s],
sseq2=s2=[s,ls,,,ls,,,],
snare=(x,y)=>drum(x,10,1e8),

hseq=[h,,h,h,,h,h,h],
hihat=hhat=(x=9)=>drum(hseq,x,2.5e4),

inscompL=((m(ins,.375)*dec(1,1/2,3e4)+m(bass,.45)-30*dec(1,1/2,3e4)+m(bass2,.275))-80),

inscompR=((m(ins,.375)*dec(1,1/2,3e4)+m(bass,.45)-30*dec(1,1/2,3e4)+m(bass3,.275))-80),

percompL=((m((m(kick(10),.4)+m(snare(s),.25)),.8)-25)+m(hhat(9),.475))-52,

percompR=((m((m(kick(9),.4)+m(snare(s2),.25)),.8)-25)+m(hhat(10),.475))-52,

[

m(inscompL,.6)+m(percompL,.75),

m(inscompR,.6)+m(percompR,.75)

]