// Steps throug a sequence, interpolates if 'lerp' == 1
// 'exponent' controls the exponent of the lerp function (1 is linear)
seq = (arr, spd, T = t, lerp = 0, exponent = 1) => (
	i = T / 2 ** spd,
	j = i | 0, // Equivalent to floor(i)
	k = (i - j) ** exponent,
	L = arr.length,
	lerp ? (1 - k) * arr[j % L] + k * arr[(j + 1) % L] : arr[j % L]
),

// You can also use this not as a step sequencer but just as an interpolated array lookup with the following:
// seq(<array>, 0, <index>, 1)

// Another advantage over a simpler step-sequencer using t>>n is that the speed can be fractional

// Minified version
// seq=(r,s,T=t,l=0,x=1)=>(i=T/2**s,j=i|0,k=(i-j)**x,L=r.length,l?(1-k)*r[j%L]+k*r[(j+1)%L]:r[j%L]),

// Version where 'lerp' and 'exponent' args are combined -- if 'exponent' > 0, then interpolate
// seq=(r,s,T=t,x=0)=>(i=T/2**s,j=i|0,k=(i-j)**x,L=r.length,x?(1-k)*r[j%L]+k*r[(j+1)%L]:r[j%L]),

// Version that interpolates between i-1 and i, instead of i and i+1
// doesn't work as well for array lookups
// however, you save a small amount of chars when you combine 'lerp' and 'exponent' args
// seq=(r,s,T=t,x=0)=>(i=T/2**s,j=i|0,k=(i-j)**x,L=r.length,(1-k)*r[(j-1)%L]+k*r[(j+1)%L]),

// Version where interpolation is always linear
// seq=(r,s,T=t,l=0)=>(i=T/2**s,j=i|0,L=r.length,l?(1-i+j)*r[j%L]+(i-j)*r[(j+1)%L]:r[j%L]),

// Version that *always* interpolates (linearly)
// lerp=(r,s,T=t)=>(i=T/2**s,j=i|0,L=r.length,(1-i+j)*r[j%L]+(i-j)*r[(j+1)%L]),

// Normal step sequencer, never interpolates, can't use fractional speeds (but can use T=t*3 for example)
// seq=(r,s,T=t)=>r[(T>>s)%r.length],

// Melodic sequencer
// the downside is that, unless you want some pretty serious artefacts,
// you have to break the smooth interpolation into 'chunks'
// Example:
// mseq(<array>, 14, t, 1) ---> mseq(<array>, 4, t >> 10, 1)
// Even choosing 5 and t >> (speed - 5) would create artefacts
// This is because phase isn't taken into account
// With higher exponents, the aftefacts are somewhat less noticeable (but so is the interpolation)
mseq = (...x) => t * 2 ** (seq(...x) / 12),

// Cumulative version that avoids the artefacts and lets you use smooth interpolation
// however requires 't ? <varName> : 0' before other args
mseq = (input, ...x) => input + 2 ** (seq(...x) / 12),

b = mseq(t ? b : 0, [0, 12, 12, 0], 15, t, 1, 2) % 256,
// Equivalent using non-cumulative mseq:
// b = mseq([0, 12, 12, 0], 4, t >> 11, 1, 2) % 256,

speed = seq([15, 14], 18, t, 1, 16),

a = mseq(t ? a : 0, [12, 10, 12, 0, 7, 0], speed - log2(3), t, 1, 9) % 256,
// Equivalent using non-cumulative mseq (with more artefacts due to 'speed' being smooth):
// a = mseq([12, 10, 12, 0, 7, 0], speed - log2(3) - 10, t >> 10, 1, 9) % 256,

// This one gets out of sync:
// mSpeed2 = mseq(t ? mSpeed2 : 0, [0, 12], 16, t, 1, 2),

// This one stays in sync, becuse the cumulative value resets
mSpeed2 = mseq(t % 8192 ? mSpeed2 : 0, [0, 12], 16, t, 1, 2),

metronome2 = 9e3 / (mSpeed2 % 8192),
metronome = 9e3 / (t % 8192), // Just straight 4/4
// [metronome2, metronome]

[a / 3 + b / 8 + metronome, a / 5 + b / 4 + metronome];
