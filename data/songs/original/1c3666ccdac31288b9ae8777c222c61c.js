Octave = 0,
Pitch  = 3,
Detune = -15,
p      = (round(Pitch)+(Octave*12)+(Detune/100)),
BPM=175,SampleRate=48E3,tf=abs(t/SampleRate/360*3*32768*BPM),

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
s=r=>t*2**((parseInt(r,36)+p)/12),
a=(1-(tf/(512/1.75))%1)**1.5,
b=(1-(tf/16384)%1)**8*1.31,
c=(tf/4096%1)*(tf>>14&1)*252,
d=(1-tf/16384%1)**1.5*(tf>>14&1)*365,
e=s('13501358'[tf>>16&7]),
f=6*((tf/8192)%1)**3,
g=[f,1,1,1,f,1,1,1,1,1,f,1,f,1,1,1,f,1,1,1,f,1,f,1,1,1,f,1,f,1,1,1][tf>>12&31],
m=((t+t%[1,3,5,2][tf>>12&3])/2*2**(([0,1,3,5,7,8][(tf>>12)%6]+p)/12)<<(1.25*(tf>>[12,13][tf/3>>12&1])&3)),
x=j=>min(max((
(
+tanh(sin(100*(tf%4096)**.1)*(1-(tf/4096)%1)*!(tf>>12&1))*3*'1000010010010100'[tf>>13&15]
+hpf((sin(t*PI+(random()*6)-2)*6*(1-(tf/8192)%1)**4),.95)*2.5
+(((tanh(sin((8e6+tf%16384*sqrt(2))*(1-(1/(tf%16384*400+.4))*6)/75)*(max((1-tf%16384/8192*2),0)**1)*(1-tf/8192%1)*!(tf>>13&1))*(tf>>14&1)*440*(1-tf/16384%1)**.5)+nf(bpf(([c,d,d,d][(tf>>12)%4]/4-(random()*[c,d,d,d][(tf>>12)%4]/2)),.4,.4),.4,1)*25))/100
+-tanh(2*tanh(sin(((e/8*j%64*j+e/16%64*j*2.1+e/(4*1.33)*j%64/1.1*j))*PI/128)))/1.33*g
+(((((m/12*j%64*3*j)&63)+((m/4*j%64+m/4*j%64)&32)+((m/4*j%64+m/4%64.5)&32))*g/128)-g/2)*2
)),-1),1)/1.2
,[x(1.005),x(.995)]