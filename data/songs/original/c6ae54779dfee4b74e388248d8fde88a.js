/*
Fantastic Dreams by Two2Fall

Started: 28-03-2025 16:14 (UTC-4)
Ended: 04-04-2025 14:44 (UTC-4)
*/

// Credits to Feeshbread for the filters!
// LowPass And HighPass Filters
t?0:z1=[],
callCount=0,
lpf=lowPassFilter=(a,c)=>(
	call=callCount++,
	z1[call]??=0,
	z1[call]+=(a-z1[call])*c
),
hpf=highPassFilter=(a,c)=>(a-lpf(a,c)),
mn=(x,m=-128,mx=127)=>min(max(x,m),mx),
r=t*.824,
k=int(r>>19),
st=int(k>=4),
mms=['EHLOSEHLCHLOSCHL','EHELEOEQCHCLCOCQAHAJAOAJCHCLCOCL'][st], 
mcs=[['ECA9','LLJG','OQTT'],['ECAC','LLJL','OQTQ']][st],
mls='ELOQ',
f=i=>i%256/2+(2**(7/12)*i%256/2), 
d=i=>i%256/2+(i*1.015%256/2),
pw=(i,x)=>(i%256/2+x)&128, 
p=a=>t*2**(parseInt(a,36)/12),  
x=j=>(
	w=r=>(e=a=>r>0&&((pw(a*p(mms[(r>>13)%mms.length]),16)%256-64)*(k==4||k==6||k==7?(r/16384%1)/1.2:(1-r/8192%1))/2),(e(1)+e(j))*(k>=2)*(k>=9?0:1)),
	c=a=>(wv=a=>(m=n=>(f(a*p(mcs[n][3&r>>16])/2))%256/3,m(0)+m(1)+m(2)),hpf((wv(1)+wv(a))/2,t>19.1*33500?.01:-t/5120%256/128+1)*(k==4||k==6||k==7?(r/16384%1)*2:1)+(16*random()*((r>>11&31)/10)*(t>17.1*33500&&t<19.2*33500))),
	l=a=>(d(a*p(mls[r>>15&3]))%256/4-28)*(k==3||k>=5&&k<=7)*(k==4||k==6||k==7?(r/16384%1)*2:.75),
	o=lpf(w(r)+w(r-12288)/2+w(r-24576)/3+w(r-38168)/4-(c(j)-(l(1)+l(j))),t>=171*33500?-t/10240%256/128+1:1)*!(t>196*33500)||0,
	dr=mn(128*(
		atan(sin(j*sqrt(r%16384)))*(1-r/16384%1)+
		(.5*random()-.25)*(1-r/4096%1)**4+
		((r*sin(r/.66/j>>2)&128)-64)%256/192*(1-r/16384%1)
		*(1&r>>14)
	))*(k==4||k==6||k==7),
	mn(dr+o*1.5)
),
[x(1.005),x(.995)]
