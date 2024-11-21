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

// demo audio source
sw=t=>t&255,
ssw=(t,sp)=>(sw(t*2**sp)+sw(t)+sw(t*2**-sp))/3,
audio=ssw(t/4,.01)-127,

// demo modulation (0-1) and exponential, because c does respone kinda logarithmic
m=(sin(t/(2<<14))/2+.5)**2,

// use like this:

//lpf(audio, m) // low pass filter (a 'audio in', c 'cutoff (0-1)')
//hpf(audio, m) // high pass filter (a 'audio in', c 'cutoff (0-1)')
bpf(audio, m, m) // band pass filter (a 'audio in', hc 'high pass cutoff', lc 'low pass cutoff')
//nf(audio, m/3, m/3+.3) //notch filter (a 'audio in', lc 'low pass cutoff', hc 'high pass cutoff')
//lbf(audio, m/3, 2) /3 //low boost filter (a 'audio in', c 'cutoff', v 'volume boost (of low frequencies)')
//hbf(audio, m/3, 2) /3 //high boost filter (a 'audio in', c 'cutoff', v 'volume boost (of high frequencies)')