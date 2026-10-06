// Infenitely instantiable 1 Pole Filters
// (every call = new filter instance)
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

//stuff

r=t*1.1,

p=t*2**('03202222222222270320222222233330'[31&r>>13]/12),
n=(p*(1+3*!(1&r>>18))^p>>2),
m=(-cos(r*PI/1024/['44882444'[7&r>>14],'4'][1&r>>18])+1),
sm=(hbf(n&255, m**2/3, .5+1.5*(1&r>>18))/127-1)*1.9,
sub=sin(1.2*asin(sin(p/512*PI))),

arp=(((t*2*2**('9522'[3&r>>12]/12))&100)/64-1)*(1-.75*((r%(2<<11)/(2<<11))))**3,

pl=2<<13,
pr=r%(pl),
kg='1000'[3&r>>14],
k=tanh(cos(sqrt(pr)-(.00003*pr*(1+(1/(pr/2+.1)))*3)+random()*4*(1/(pr/100+.1))**1.5)*((1-pr/pl))**2)*kg,
sg='0010'[3&r>>14],
sc=(kg|sg)?min(pr/(pl/2),1):1,

a=()=>(
s=tanh(6*cos((5000000+pr)*(1-(1/(pr*80+.1))*6)/70)*((1-pr/pl)**10) + (random()-.5)*1.5*(1-pr/pl))/2*sg,
h=tanh((random()-.7)*(1-(pr/pl*2)%1)**2*sin(cos(t/8)*sin(t+sin(t/'4631'[3&r>>13])))*(1-(pr/pl*2)%1)),
cy=(random()-.5)*(1-(pr/(pl*1.2)))**2,

mix=(
	lpf(k+s, .7)
	+hpf(h+cy*.5, .3)*sc**.4
	+(
		tanh(hbf(hpf(tanh(
			(sub*2.9*(2-m)
			+sm)
		)*.5, .03)+tanh(sub*(.1+.4*m)), 0.4, 1))*.75
		+arp*.1
	)*sc**2
),
tanh(.75*hbf(lbf(mix,.02,.5),.15, .75))
),
[a(),a()]