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

mn=(a,mi,ma)=>max(min(a,ma),mi),



melSeq='aifh'[3&t>>17],
baseT=t%[16384,8192,4096]['00000000000000010000000001001012'[31&t>>14]],

mel=baseT*2**(parseInt(melSeq, 36)/12)>>4,
tr=((baseT)>800), 
trm=((baseT)>4000),
phase=trm?mel:sqrt(1000*(baseT)**0.9),
env=(baseT/16384),
base=nf(abs(phase%128-64)+random()||0,.02,.1)*3,
dist=mn(5*hbf(tanh(lbf(hpf(mn((base*2&((baseT/256)%32+(tr?110:10))&250)*1+1*base*3*tr,0,250),.6)/80,.01, (1-env)**2*1e4)), .3, (1-env)**4*10000),-1,1)*100,
parallel=(dist^(dist<<3&200))/2,
bpfbon=((baseT)<4500),
t?0:bpfb=0,
bp=bpfb=bpf(dist+bpfb*(.9*bpfbon),.01, 1-env**.2),
tanh(hpf(mn(3*lpf(
	1*tanh(sin(400*sqrt(baseT)**.05)*1000*(1-env)**500)*90
	+1*.01*(hpf(parallel,.3)**2)*env**.2
	+1*(base-56)*env**.2
	+1*.12*hbf(lbf(tanh(bp)*100, .2, (1-env)**6),.3, (1+env*10))
,1-env**.05),-120,120),.01)/50)*100