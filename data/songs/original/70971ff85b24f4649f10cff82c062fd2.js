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



r=t*1.2,l=16384,u=8192,c=4096,
//r=(1<<20)*2+r,//(r%(1<<20)),
mn=(k,x,y)=>min(max(k,x),y),
//dly='1222111111'[(r>>20)%10],
snz=r>(1<<20)*2 && r<(1<<18)*9,
bs='0001111111'[(r>>20)%10],
hmd='0221111111'[(r>>20)%10],
mmd='1321111111'[(r>>20)%10],
lmd='1121111111'[(r>>20)%10],
kld='012121221'[(r>>20)%10],
kty='001110010'[(r>>20)%10],
kty=parseInt(kty),
mm=[1,.5,0,.5,.25, 0, 0, .25, 1][(r>>20)%10],
krpt=[
	'1',
	'11111112'[7&r>>13],
	'11111114'[7&r>>13],
	'11114242'[7&r>>13],
	'22111111'[7&r>>13],
	'11111202'[7&r>>13],
	//'22224222'[7&r>>13],
	//'14111214'[7&r>>13],
	//'22224224224224224'[15&r>>13],
	'12111112 22 2242'[15&r>>13],
	'12121212 22 2242'[15&r>>13],
	'2',
	'4'
][
	('        '+'        ' + '00010001'+'02012289' + '    0040'+'00000003' + '40000002'+'40000000' + '00010001'+'02022289')[[63&r>>16]]
],
kr=(r%(l/krpt))||0,
kick=(kir,mel)=>(kt=kir<1260,mn(20*((((200+400*kt)*sin(((kt?3:5)*cbrt(kir)))*max((1-(kir/l%1)*2),0)**2)+127&255)-126)+(((kir/l%1)>.5)*5*s(mel,8)&-50),-50,50)*1.3),

t?0:bpfb=0,
kick2=(baseT,mell)=>(
mn2=(a,mi,ma)=>max(min(a,ma),mi),
tr=((baseT)>800), 
trm=((baseT)>4000),
phase=trm?(t*2**(parseInt(mell, 36)/12)/4*.31):sqrt(1000*(baseT)**0.9),
env=(baseT/16384),
base=nf(abs(phase%128-64)+random()||0,.02,.1)*3,
dist=mn2(5*hbf(tanh(lbf(hpf(mn2((base*2&((baseT/256)%32+(tr?110:10))&250)*1+1*base*3*tr,0,250),.6)/80,.01, (1-env)**2*1e4)), .3, (1-env)**4*10000),-1,1)*100,
parallel=(dist^(dist<<3&200))/2,
bpfbon=((baseT)<4500),
bp=bpfb=bpf(dist+bpfb*(.9*bpfbon),.01, 1-env**.2),
baseT?hbf(tanh(hpf(mn2(3*lpf(
	1*tanh(sin(400*sqrt(baseT)**.05)*1000*(1-env)**500)*190
	+1*.01*(hpf(parallel,.3)**2)*env**.2
	+1*(base-56)*(env**.2)
	+1*.12*hbf(lbf(tanh(bp)*100, .2, (1-env)**6),.3, (1+env*10))
,(1-env**.05)+.03),-120,120),.01)/50),.6,5)*85:-65
),


dmnt=.005,
dtn=j=>1-dmnt+2*dmnt*j,
x=j=>mn(((s=(a,b)=>t*2**(parseInt(a,36)/12)/b*.31%64-32,
mn((w=r=>r>0&&(e=a=>s('G8F6D4B381B4D8FB'[15&(21&r>>13)+(r>>15)],a),mn(e(1)+e(mm||dtn(j)),-1,1)*100),w(r)),-32,31)+(L=a=>lmd*s('DFGI'[K=3&r>>17],a*2)+mmd*s(8,a)+hmd*s('DBDF'[K],a),L(.5)-L(dtn(j)))*(r/32768%1)*(1-r/u%1*.5)**3+bs*mn(hpf(-(b=a=>s('DD9B'[K],a)*8,b(8)+b(4/dtn(j)))*(r/l%2)*(1-.5*(r%u/1E4))**2,.1),-30,63)*(1-r/l*2%1/1.5)))*1.5+kld*(kty?kick2(kr,'DD9B'[K]):kick(kr,'DD9B'[K])),-128,127)/(2+snz),[x(1),x(0)]