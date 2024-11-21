t2=t,
r=repeat=(x,y)=>Array(x).fill(y).flat(9),
t?0:fx=r(4e4,0),
fxi=0,

rv=reverb=(x,len=16e3,feedb=.7,dry=.4,wet=1,dsp=2,T=t2)=>(
	ech=y=>fxi+(0|(y%len)/dsp),
	x=x*dry+wet*fx[ech(T)]||0,
	t2%dsp?0:fx[ech(t2)]=x*feedb,
	fxi+=0|(len/dsp),
	x
),

m=mix=(x,vol=1,dist=0)=>((x*vol*(1+dist))%(256*vol))||0,

cseq=(arr,spd)=>t/2*2**((arr.charCodeAt((t>>spd)%arr.length)-58)/12)*63>>8%132,

mel='kotojokohogohotojokohogokokhpmjmjfokhomkjhggcckotojokohogohotojokohogokokhpmjmjfrmorokfjkkkkkkrpomkjkmokmpoprrjjkkoommoottqqhjkkjjhfecebccccccfffhihfdfcdahhhjkjhghegcmjcjmjpjojmjkhchkhohmhkhjhkhmhohphmhoomkjkhhhhhh',

A=a=x=>sin(cseq(mel,12)*PI/x),

ins=m((a(8)+a(16)+a(32)+a(64)+a(128)+a(256)),.125),

rv(ins,9e3,.475,.7,1,1)