// 𝙄𝙣𝙛𝙞𝙣𝙞𝙩𝙚𝙡𝙮 𝙄𝙣𝙨𝙩𝙖𝙣𝙩𝙞𝙖𝙗𝙡𝙚 １ 𝙋𝙤𝙡𝙚 𝙁𝙞𝙡𝙩𝙚𝙧𝙨 - 𝙛𝙚𝙚𝙨𝙝𝙗𝙧𝙚𝙖𝙙
// [Help]: Use these filters to change your sound for ear candy!
t?0:z1=[],
callCount=0,
// Low-pass filter (LPF): Smooths a signal by averaging it with previous values.
lpf=lowPassFilter=(a,c)=>(
	call=callCount++,
	z1[call]??=0,
	z1[call]+=(a-z1[call])*c
),

// High-pass filter (HPF): Removes low-frequency content.
hpf=highPassFilter=(a,c)=>a-lpf(a,c),

// Band-pass filter (BPF): Allows frequencies within a certain range.
bpf=bandPassFilter=(a,hc, lc)=>hpf(lpf(a,lc), hc),

// Notch filter (NF): Removes frequencies in a certain range.
nf=notchFilter=(a,lc, hc)=>(hpf(a, hc)+lpf(a,lc))/1.75,

// Low-boost filter (LBF): Enhances low frequencies.
lbf=lowBoostFilter=(a,c,v)=>a+lpf(a,c)*v,

// High-boost filter (HBF): Enhances high frequencies.
hbf=highBoostFilter=(a,c,v)=>a+hpf(a,c)*v,

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

// 𝙋𝙞𝙩𝙘𝙝 𝙖𝙣𝙙 𝘽𝙋𝙈 𝙎𝙮𝙨𝙩𝙚𝙢 - 𝙋𝙧𝙞𝙣𝙘𝙚𝙨𝙨𝙋𝙧𝙞𝙨𝙘𝙞𝙡𝙡𝙖𝙋𝙏
// [Help]: Change the variables below to match how you want it to sound!
Octave  = -1,
Pitch   = -6,
Cents   = -21.4,
p       = round(Pitch)+(Octave*12)+(Cents/100), // Converts pitch to MIDI-like scale
BPM     = 210,                                  // Beats per minute
Samples = 48000,                                // Sample rate
tf      = abs(t/Samples/180*3*32768*BPM),       // Time-based frequency transformation
r=tf/2,l=16384,u=8192,c=4096,                   // Scaling constants

mn=(k,x,y)=>min(max(k,x),y),
dly='1222111111'[(r>>20)%10],
snz=r>(1<<20)*2&&r<(1<<18)*9,

// Instrument Mapping
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
kick=(kir,mel)=>(kt=kir<1260,mn(20*((((200+400*kt)*sin(((kt?3:5)*cbrt(kir)))*max((1-(kir/l%1)*2),0)**2)+127&255)-126)+(((kir/l%1)>.5)*5*s(mel,8)&-50),-50,50)*1.3), // Kick Drum / Hardstyle Kick Function

t?0:bpfb=0,
kick2=(baseT,mell)=>(
mn2=(a,mi,ma)=>max(min(a,ma),mi),
tr=((baseT)>800), 
trm=((baseT)>4000),
phase=trm?(t*2**((parseInt(mell,36)+p)/12)/4):sqrt(1000*(baseT)**0.9),
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
), // Kick Drum / Hardstyle Kick 2 (More Complex)


dmnt=.005,
dtn=j=>1-dmnt+2*dmnt*j,
xp=(x=j=>mn(((s=(a,b)=>t*2**((parseInt(a,36)+p)/12)/b%64-32,
mn((w=r=>r>0&&(e=a=>s('1 4 B RN I G F8BF G 8 B6 8 4 643'[31&r>>13],a)||0,mn((e(1)+e(mm||dtn(j)))*256,-1,1))*20,w(r)+w(r-(d=24576))/2+w(r-d*2)/3+w(r-d*3)/4+w(r-d*4)/5),-48,48)+(L=a=>lmd*s('DD99BBGB'[K=7&r>>16],a*2)+mmd*s('GGDDFFKF'[K],a*2)+hmd*s('KKGGIINI'[K],a*2),L(.5)-L(dtn(j)))*(r/32768%1)*(1-r/u%1*.5)**2/1.2+bs*mn(hpf(-(b=a=>s('DD99BBGB'[K],a)*8,b(8)+b(4/dtn(j)))*(r/l%2)*(1-.5*(r%u/1E4))**2,.1),-32,64)*(1-r/l*2%1/1.5)))*1.5+kld*(kty?kick2(kr,'DD99BBGB'[K]):kick(kr,'DD99BBGB'[K])),-128,128)/(1+snz)/128, // Song Generation
[x(1),x(0)]), // Stereo Output

info = function(length) {
	var Hz = Hz=48000
	var string3= "Duration: " + (floor(abs(t)/Hz/360)) + (floor(abs(t)/Hz/60)) // Timing Information
	var string2= [":"," "][(floor(abs(t)/Hz*2)&1)]+(floor(abs(t)/Hz/10)%6)
	var string8a= "." + (floor(abs(t)/Hz*10)%10)
	var string8b= (floor(abs(t)/Hz*100)%10)
	var string8c= (floor(abs(t)/Hz*1000)%10)
	var string9= "\nSamples: " + (floor(abs(tf)))
	var stringA= " / (" + Hz + "/s) \n ~~~~~~~~~~~~~~~~~~~~"
	var string7= "" + ((floor(abs(t)/Hz))%10)
	var string4= " | Bars/Beats/Steps: " + (floor(abs(r)>>16)+1) // Bars, Beats, and Steps (Music Structure)
	var string5= "/" + (floor(abs(r)>>14)%4+1)
	var string6= "/" + (floor(abs(r)>>12)%4+1)
	var string6b=  " | BPM: " + BPM + " | Key: C#m / E"
	var Display= "\n \n~~~~~~~~~~~~~~~~~~~~ \n Display by D3nschøt | \'Hardstyle Remix of a Zackx Song'\ by feeshbread | \'Sunset Road'\ Remix by PrincessPriscillaPT ♪ \n"+
					string3+string2+string7+string8a+string8b+string8c+string4+string5+string6 + string6b+string9+stringA // Final Display Message
	throw Display // Triggering the Display
},
(t/512000*1e3%1?xp:info()) // Execution Condition