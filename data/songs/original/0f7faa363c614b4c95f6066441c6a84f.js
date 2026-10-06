// Meta

tune=.78,
speed=.91875,
T=t*tune,
b=t*speed,

r = repeat = (x, y) => Array(x).fill(y).flat(9),

t2=t,
t ? 0 : fx = r(4e4, 0),

fxi = 0, // Iterator, resets to 0 at every t

// Functions

m = mix = (x, vol = 1, dist = 0) => ((x * vol * (1 + dist)) % (256 * vol)) || 0,

bt=(len,spd,x)=>(x>>spd)%len,

dec=(gate,spd,vol)=>((b*gate)&(16384/spd)-1)/vol,

seq=(arr,spd)=>T*2**(arr[bt(arr.length,spd,b)]/12)||0,

// Effect

rv = reverb = (x, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 2, T = t2) => (
	ech = y => fxi + (0 | (y % len) / dsp),
	x = x * dry + wet * fx[ech(T)] || 0,
	t2 % dsp ? 0 : fx[ech(t2)] = x * feedb,
	fxi += 0 | (len / dsp),
	x
),

// Sequences

mel1=[0,3,7,10,14][bt(5,0,t)],
mel2=[3,7,10,12,15][bt(5,0,t)],
mel3=[5,8,10,15,19][bt(5,0,t)],
mel4=[7,10,12,15,22][bt(5,0,t)],

mel=[mel1,mel2,mel3,mel4],

melL_1=[,,3,2,,3,,2,0,,-5,-7,,-5,,,2,,3,2,,0,-2,0,,,,,,,,,][bt(32,13,b)],
melL_2=[,,3,2,,3,,2,0,,-5,-7,,-5,,,2,,3,2,,0,-2,,2,,3,5,,3,2,0,,][bt(32,13,b)],

melLead=[melL_1,melL_2],

melBass=[0,3,5,7],
melBass2=[-5,0,-4,-2],
melBass3=[3,-5,-9,2],

// Instruments

ins=atan(tan(seq(mel,16)*PI/256))/2*dec(1,1,2.25e4),

lead=sin(sin(sin(sin(seq(melLead,18)*PI/32+cos(seq(melLead,18)*PI/4))))*sin(seq(melLead,18)*PI/64+cos(seq(melLead,18))*PI/32)),

bassfunc=x=>sin(seq(x,16)/4*PI/64+sin(seq(x,16)/4*PI/64)*dec(-1,1/4,1e4)),

bass=(bassfunc(melBass)/2+bassfunc(melBass2)/3+bassfunc(melBass3)/4),

sawcomp_L=m(rv(m(ins,1.2),12e3,.7,.6,1,1)/2.2+rv(m(ins,1.2),12e3,.7,.6,1,0),.16)+m(ins,.7),
sawcomp_R=m(rv(m(ins,1.2),16e3,.8,.7,1,1)/1.8+rv(m(ins,1.2),16e3,.8,.7,1,0),.16)+m(ins,.7),

// Percussions

sseq=[1,1,,1,1,,1,1],
snare=sin(t2*sin(t)>>3*tan(t*t>>1))/5*dec(-1*sseq[bt(sseq.length,12,t2*speed)],4,5e3),

cseq=[,,1,,1,,,1],
crash=sin(t2*sin(t>>4)>>5+cos(t*t>>1))/3.5*dec(-1*cseq[bt(cseq.length,12,t2*speed)],4,5e3),

n=cbrt(b%16384),
kick=sin(15*n+sin(n))/2.5,

hseq=[1,,1,,1,,1,,],
hhat=(1&(t2*441)/480)*dec(-1*hseq[bt(hseq.length,12,t2*speed)],4,8.5e3),

// Formula

[
m(m(bass,.3)+
rv(sawcomp_L,6e3,.7,.6,1,1)+m(ins,.4)+
rv(m(lead,.4),15e3,.7,.6,1,1)
,.85)+
kick+snare+crash+hhat,

m(m(bass,.3)+
rv(sawcomp_R,6e3,.7,.6,1,1)+m(ins,.4)+
rv(m(lead,.42),13e3,.67,.62,1,1)
,.83)+
kick+snare+crash+hhat
]