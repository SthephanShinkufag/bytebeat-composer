t || (
	fx = Array(3e6).fill(0)
),

Z = t/1.4,
b = Z>>13,
B = b>>3,

fxi = 0, // iterates over the fx array
// inp - input
lp = (inp,w) => { // lowpass function (w - strength of effect (0 is the minimum value))
	if (w == 0) return inp
	out = inp + fx[fxi] // remove the "%256" if you are using floatbeat
	fx[fxi] = out / (1+1/w)
	fxi++
	return fx[fxi-1] / w
},

dly = (inp,ti,fb) => { // delay function but stereo (ti - time (must be an integer), fb - feedback (min - 0, max - 1))
	this.dl ??= Array(ti).fill(0)
	this.dr ??= Array(ti).fill(0)
	if (fb == 0) return inp
	out = [(inp%256)+dl.shift(),(inp%256)+dr.shift()]
	dl.push(out[0]*fb)
	dr.push(dl[0])
	return out
},

// envelope function gergerhgkerjfvkdsahfsakfdlnk
env = (a,r,t) => ( // attack, release, time
	a_ = min(1,t/a),
	r_ = 1-(t-a)/r,
	max(0,(t>a?r_:a_))
),

BBtFB = (x) => x%256/128-1, // bytebeat to floatbeat
noise = t => sin(t**7),

sidechain = min(1,2*(Z/16384%1)),
T=(n,p=600,a=5)=>.08*(1<<(n+=4)/7)*1.0594**(2*n%14-(3<n%7))*(t+a*sin(t/p))%128,
c=n=>T(n)+T(n+2)+T(n+4)+T(n+6),
m=(b^B+3)%12+14,
r=17-B%4,+T(m,450,2)+.3*c(r)+T(r-14)/2,
mel = dly(BBtFB(lp(T(m+7),5/max(.1,env(1e3,7192,Z%8192))))+.5,D=12288*1.4|0,.5),
noi = lp(random()-.5,50)*2,
bas = dly((lp(BBtFB(T(r-7))/2,10)+.25)*2,D,.5),
chords = dly(lp(BBtFB(c(r)/2),5)*env(16284,100,Z%16384),D,.5),
kick = tanh(sin(sqrt(Z/16384%1)*150))*3*(1-Z/16384%1)**5*!(b/2&1),
snr = sin(sqrt(Z/16384%1+noise(t>>1)/1500)*400)*(1-Z/16384%1)**3*(b&2),
hat = noise(t)*(1-Z/8192%1)**2/7,
[(mel[0]+bas[0]+chords[0])*sidechain+noi+kick+snr+hat,(mel[1]+bas[1]+chords[1])*sidechain+noi+kick+snr+hat].map(x=>x/2)