r=repeat=(x,y)=>Array(x).fill(y).flat(9),

t?(0):(fx=r(3e5,0)),
//iterator, resets to 0 at every t
fxi=0,

t2=t,
rv = reverb = (x, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 0, T=t2) => (
	ech = y => fxi + ((y % len) >> dsp),
	x = x * dry + wet * fx[ech(T)],
	fx[ech(t2)] = x * feedb,
	fxi += len >> dsp,
	x
),

//sp = speed
lim = limiter = (x, sp = .1) => (
	x &= 255,
	mi = fx[fxi] = min( fx[fxi] + sp, x, 255),
	mx = fx[fxi + 1] = max( fx[fxi + 1] - sp, x, mi+9),
	fxi+=2,
	(x-mi)*255/(mx-mi)
),


t*=8/48,

mel=t*2**([0,3,5,7,8,7,10,7][(t>>12)%8]/12),



re=rv(mel&63,49152,.9,.2, 1, 0, t2*2),



lim(re, .005)/2


//original without limiter:
//,re