// A collection of effects you can use on _ANY_ variable that changes

//Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
T = t,

//Change t here, not below, or it messes with the snare/hihat sounds
t *= r8 = 8 / 48,

//t = ( 1024 & t )/4 + t, //FAST SWANG! (drums sound scuffed)

// Repeat x beats of y
// SUPER useful if you're writing complex beats/melodies
// Include this or the Fs won't work (or you could replace r(x, y) with Array(x).fill(y))
// r(1,[arrays]) also serves as a replacement for [arrays].flat()
r = repeat = (x, y) => Array( x ).fill( y ).flat( 9 ),

sp = (str, sep='') => str.split( sep ),
j = (arr, sep='') => arr.join( sep ),

//tra = transpose = (arr, amt) => arr.map(x=>x+amt),
tra = transpose = (x, amt) => Array.isArray(x)? x.map( e => e + amt ) : j( sp(x).map( e => e + amt ) ),



// Uses up a lot of chars and isn't /super/ readable, but a major timesaver when creating
// Particularly the NaN handing
m = mix = (x, vol=1, dist=0) => ( ( x * vol * ( 1 + dist ) ) % ( 256 * vol ) ) || 0,

// Waveshaper distortion
// Assumes range is neatly between 0-255; use after limiter
// Negative values make it rounder (though after -.6 it goes beyond {0..255} so there are wraparound artifacts)
ds = (x, amt) => x * (1 - amt) + 127 * ( ( ( x / 127 ) - 1 ) ** 3 + 1 ) * amt,


// F is the FX stack, stores memory for use in effects
// Automatically keeps track of what's stored where
// If you see red (NaNs), raise 26e3 higher, or adjust your reverbs' 'dsp' variable (and limiters' lookahead)
// Works best when effects are not inside conditionals (meaning the number of F in use changes)
// But even then, should only create a momentary click/pop (might be more severe for reverb)
T ? 0 : F = r( 56e3, 0 ),
// Iterator, resets to 0 at every t
I = 0,


//seq = ( arr, spd, t2=t ) => arr[ (t2 >> spd) % arr.length ],
/*version that lerps:
	the 'x' argument controls the speed at which the slides happen (1=very slidy, 99=almost none, 0=none) */
//seq=(r,s,t2=t,x=0)=>(i=t2/2**s,J=i|0,k=(i-J)**x,L=r.length,x?(1-k)*r[J%L]+k*r[(J+1)%L]:r[J%L]),
/*v slight perf boost:*/
seq=(r,s,t2=t,x=0)=>(i=t2/2**s,J=i|0,L=r.length,x?(k=(i-J)**x,(1-k)*r[J%L]+k*r[(J+1)%L]):r[J%L]),



//mseq = ( ...x ) => t * 2 ** ( seq(...x) / 12 ), //original
mseq = ( ...x ) => t * 2 ** ( ( seq(...x) + ((t/9>>17)%3) )  / 12 ), //Trucker's Chorus version (specific to this song)
//mseq = (arr, spd, T=t) => t * 2 ** ( ( ((t/9>>17)&3) + arr[ ( ( T >> spd+4 ) + ( 21 & T >> spd ) ) % arr.length] ) / 12 ), //changes all the melodies
//smooth version, works well with seq lerp: (also features Trucker's Chorus)
mseq = ( ...x ) => (
	F[I++] += ( r8 * 2 ** ( ( seq(...x) + ((t/9>>17)%3) )  / 12))||0
),



/* The Breakbeat drum machine. This is where the magic happens
It sequences through an array and plays the corresponding number of beats
	(1 = quarter note, 2 = 2 8th notes, etc)
Something interesting happens when you don't use powers of 2, however:
	You get strange and wonderful sounds
the variables 's' and 'h' make it sound like a snare and a hihat, respectively
most sounds are different timbres of the same note
but if you replace 't2' with something other than t, such as any bytebeat melody,
you can apply that timbre to the melody.
Adding / &ing a breakbeat with a melody can also add attack to the notes of the melody
*/
bt = beat = (arr, spd, vel = 2e4, vol = 1, t2 = t, oct = 0) =>
	m(vel / (t2 & (2 ** (spd - oct) / seq( arr, spd ) ) - 1), vol),

ls = sin(T / 9 & T >> 5), // long snare
//s = sin(t>>5), // acoustic-sounding grungy snare
//s = (((t*8/48)>>9) & 1) ? 0 : sin(t / 9 & t >> 5), // Snare
s = seq( [ls, 0], 9), // Snare
S = seq( [ls, 0], 8), // double snare
//s = sin((t | t * .7) >> 4), // quieter snare
//h = 1 & t * 441/480, // long Hihat
h = 1 & T * 441/480, // long Hihat
h = seq( [h,h,h,0], 8), //quieter, faster attack

/*Has a tendency to 'wander', so use a limiter on the final mix
dsp = downsample the bitrate of the reverb, dsp=2 cuts uses half as much space, 3 uses 1/3, etc
	using values besides {1, 2, 3} can produce hi-pitch hum, however
*/
//rv = reverb = ( input, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 2, t2=T) => (
//	x = y => I + ( 0|(y % len) / dsp ),
//	bl = t2/dsp - (t2/dsp)|0, //how much to blend between this and next buffer
//	input = input*dry + wet * ( ( 1 - bl ) * F[ x(t2) ] + bl * F[ x( t2 + dsp )] ) || 0,
//	T % dsp ? 0 : F[ x(T) ] = input * feedb,
//	I += 0|(len / dsp),
//	input
//),

/*This reverb uses the lerping seq to save ~20 chars, but the lerp uses ~50 chars
Has a tendency to 'wander', so use a limiter on the final mix
dsp = downsample the bitrate of the reverb, dsp=2 cuts uses half as much space, 3 uses 1/3, etc
	using values besides {1, 2, 3} can produce hi-pitch hum, however
*/
rv = reverb = ( input, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 3, t2=T) => (
	input = input*dry + wet * seq( F, 0, I + ( t2 % len ) / dsp, 1 ) || 0,
	T % dsp ? 0 : F[ I + ( (T % len) / dsp )|0 ] = input * feedb,
	//F[ I + ( (T % len) / dsp )|0 ] = input * feedb ** (1/dsp), //higher dsp adds dampening
	I += 0|(len / dsp),
	input
),


lp = lopass = (x, f) => ( // f ~= frequency, but not 1:1
	// F[I] is the value of the last sample
	// You will need to change the 'x % 256' if you're using signed or floatbeat
	F[I] = min( max( x % 256, F[I] - f), F[I++] + f) // Clamp the change since last sample between (-f, f)
),

//For a hi-pass sound, m(x)^lp(x) sounds more harsh; lim(x, 9, <# under 256> ) sounds more natural, but is sosig


/*
The limiter is probably the most advanced effect here
Capable of turning /any/ input into Sosig with minimal distortion, if params are set right
Also eliminates offsets (very helpful for reverb)
Ratio is basically infinity and attack is basically instant
But as long as iters = ~3-8, it won't sound clipped
	(lower lookeahead does produce somewhat of a hi-pass sound)
For a subtler effect, lower speed and/or raise thresh
Latency = lookahead, so use 'wet' if you want parallel compression
If your input only has peaks going upward (like anything involving beat() or synth() ):
	then divide speed by 100 and set bias to 99
	(bias )
'p' changes how lookaheads affect the function:
	0, or very large: lower pitches dominate
	0..1: stacatto and trebly
Hum reduction is only really noticeable when speed > 9 and thresh is low
*/
lim = limiter = (input, speed = .1, lookahead = 512, wet = 1, thresh = 9, bias = 9, iters = 4, saturate = 0, p = 0) => {
	x = y => I + 2 + ( T + y|0 ) % lookahead;
	F[ x(0) ] = input; //newest in buffer, equivalent to F[ x(lookahead) ]
	o = F[ x(1) ]; //oldest in buffer
	mi = mx = o;
	for( i=1; i <= iters; i++) { //older to newest
		y = p ? ( i / (iters+1) ) ** p : 0;
		z = F[ x( ( i + sin(i)/2 ) * lookahead / iters ) ]; //sin(i) is for hum reduction
		mi = min( mi, z * (1-y) + o * y );
		mx = max( mx, z * (1-y) + o * y );
	}
	mi = F[ I ] = min( mi, F[ I ] + speed );
	mx = F[ I+1 ] = max( mx, F[ I+1 ] - speed * ( bias + 1 ), mi + ( t ? thresh : 255 ) ); //could probably be 99
	I += 2 + lookahead;
	return ds( ( o - mi ) * 255/(mx-mi), saturate ) * wet + o * (1-wet)
	//return ds( ( o - mi ) * 2/(mx-mi) - 1, saturate ) * wet + o * (1-wet) //for floatbeat

},

// ~5 chars shorter when minified:
/*
lim = limiter = (input, speed = .1, lookahead = 512, wet = 1, thresh = 9, bias = 9, iters = 4, saturate = 0, p = 0) => (
	x = y => I + 2 + ( T + y|0 ) % lookahead,
	F[ x(0) ] = input,
	o = F[ x(1) ], //oldest in buffer
	mx = mi = o,
	r(iters+1).map((e,i) => (
		y = p ? ( i / (iters+1) ) ** p : 0,
		z = F[ x( ( i + sin(i)/2 ) * lookahead / iters ) ], //sin(i) is for hum reduction
		mi = min( mi, z * (1-y) + o * y ),
		mx = max( mx, z * (1-y) + o * y ),
		e)
	),
	mi = F[ I ] = min( mi, F[ I ] + speed ),
	mx = F[ I+1 ] = max( mx, F[ I+1 ] - speed * ( bias + 1 ), mi + ( t ? thresh : 255 ) ),
	F[ x(0) ] = input,
	I += 2 + lookahead,
	ds( ( o - mi ) * 255/(mx-mi), saturate ) * wet + o * (1-wet)
),
*/

//shorter, worse performance, no 'p', no hum reduction
/*
lim2 = limiter = (input, speed = .1, lookahead = 512, wet = .99, thresh = 9, bias = 0, iters = 4, saturate = 0) => (
	x = y => I + 2 + ( T + y|0 ) % lookahead,
	o = F[ x(0) ], //oldest in buffer
	mx = mi = o,
	r(iters+1).map((e,i) => (
		mi = min( mi, F[ x( i * lookahead / iters) ] ),
		mx = max( mx, F[ x( i * lookahead / iters) ] ),
		e)
	),
	mi = F[ I ] = min( mi, F[ I ] + speed ),
	mx = F[ I+1 ] = max( mx, F[ I+1 ] - speed * ( bias + 1 ), mi + ( t ? thresh : 255 ) ),
	F[ x(0) ] = input,
	I += 2 + lookahead,
	ds( ( o - mi ) * 255/(mx-mi), saturate ) * wet + o * (1-wet)
),
*/


//XORs the input with its harmonics, controlled by the bits of a number ('tone')
//pretends it uses a wavetable, but doesn't
hm = harmonify = (x,tone, waveTableSize = 8) => (
	//waveTableSize *= 64 * T / t | 0,
	waveTableSize *= 64 / r8 | 0, //swing-proofed
	r(8).reduce((o,e,i)=>(
		y = (i+1)/2 * x,
		o ^ ( ( 1 & (tone>>i) ) * (i+1)/2 * x ) % waveTableSize
		//o ^ ( ( 1 & (tone>>i) ) * y ) % waveTableSize ^ ( abs( m( tone>>(i+8) * y ) - 128 ) * 2 ) % waveTableSize
		),0
	)
),

//Version with a for-loop instead of reduce(), ~10 chars more after minification
/*
hm = harmonify = (x,tone, waveTableSize = 8) => {
	waveTableSize *= 64 * T / t | 0;
	o = 0;
	//for (i=0; i < log2(tone) + 1; i++) { //flexible size of 'tone'
	for (i=0; i<8; i++) {
		y = (i+1)/2 * x,
		o ^= ( ( 1 & (tone>>i) ) * y ) % waveTableSize
		//o ^= ( ( 1 & (tone>>i) ) * y ) % waveTableSize ^ ( abs( m( tone>>(i+8) * y ) - 128 ) * 2 ) % waveTableSize
	}
	return o;
},
*/

// Instead of computing on the fly, this version computes a wavetable at the start
// Side effects: you can't start the song at any t, and output is always full-volume
// Might not actually improve performance due to how JS handles memory -- further testing needed
//hm = harmonify = (x, tone, waveTableSize = 4 ) => {
//	waveTableSize *= 64 * T / t | 0;
//	//play from the buffer
//	if( F[I] > waveTableSize ) {
//		o = F[ I + 1 + ( x * T / t & waveTableSize - 1) ];
//		I += 1 + waveTableSize;
//		return o
//	}
//	//fill the buffer
//	for (i=0; i<8; i++) {
//		F[ I + 1 + F[I] ] ^= ( 1 & (tone>>i) ) * (i+1)/2 * F[I] * t / T
//	}
//	F[I]++;
//	I += 1 + waveTableSize;
//	//return x //not strictly necessary unless the wavetable size is large enough to notice silence at the start
//},


// Version 1 of my Synth
// A new version has been developed, but

//Basically just treat this like a black box and fiddle with the knobs at random
//For a more detailed exmplanation:
//	X, and the First 2 hexes of y, are the fun surprise knobs :)
//		Small changes in these values completely change the tone (most of the time)
//	The next 2 hexes of y control the harmonifier
// The next hex controls the *thump*/click/noise of the attack
// The next hex controls the decay
// The next 2 hexes control the lowpass
sy = synth = (melody, velTrack, speed, x, y, ...z)=>
	lp(
		min(
			m(
				hm(
					beat( [x], 10, 6e4, 1, melody, .02* ( (y>>24) & 255 ) )
				, ( y>>16 ) & 255, ...z
				)
			, .9,1
			)
			+ beat( velTrack, speed, 1e3 * ( (y>>12) & 15) )
		, beat( velTrack, speed, 1, 2e4 * ( (y>>8) & 15 ) )
		)
	, y&255
	),


//saw 2 sine
s2s = sinify = x => sin( x*PI/64 ) * 126 + 128,

v = vibrato = sin(T>>10)/2,



//------------------ SEQUENCES -----------------------------------

//Do not take any of this out of the 't ? 0' statement
t ? 0 : (

//half-time
//l1a = r(1,[
//	r(6, 7), r(6, 3), r(6, 5), r(6, 10), 8,8,8,8, 5,5,5,5,
//	r(2,[
//		r(6, 7), 3,3,3,3, 2,2, 0,0,0,0,
//	])
//]),

l1a = r(1,[
	7,7,7,3,3,3,5,5,5,10,10,10,8,8,5,5, r(2, [7,7,7,3,3,2,0,0] )
]),

l1b = [-4,-4,0,0,2,3,3,5,],
l1c = [3,2,2,0,-5,-5,-5,-2],
l1d = [7,5,7,8,10.5,10.9,11,13],


l1e = [3,3,3,3, 5,5,5,5, 7,7,8,8, 10,10,11,11],

l1 = r(1,[
	r(4, l1a), l1b, l1c, l1b, l1d, r(16, 12), l1e
]),

//L1 velocity is actually double-time

l1vela = r(1,[
	r(4, [1, 1/8, 1/8] ), 1, .5, 1, .5,
]),

l1velb = [1, 1/8, 1/8, 1, .5, 1, 1, .5],

//clave = [1,.5, 0, 1, .5, 0, 1, .5], //too quiet
clave = [1,1,0,1,1,0,1,0],

l1velc = r(1,[
	r(2, [2,1,.25,1]),
	r(3, clave),
	r(2, [2,1,.25,1]),
	clave,
	r(4, [1,1]),
	r(8, 1)
]),

l1vel = r(1,[
	r(8, [l1vela, r(2, l1velb) ]),
	l1velc,
	r(8, 1/8), r(24, 0),
	r(16, 1/4), r(8, 1/2), r(8, 1) 
]),

l2a = r(3,[-12,-5,-2,0]),
l2b = r(1,[
	l2a, 3,3,2,2, l2a, 5,3,2,3
]),
l2c = r(2, [0,0,0,7,7,7,5,5,5,10,10,10,7,7,7,7] ),

l2d = r(1,[
	r(6, 8), 7,5,7,7,5,5,3,3,5,5
]),

l2e = r(1,[
	7,7,7,7, 5,5,5,5, r(6, 0), 7,7,
]),

l2f = tra( [
	7,5,3,2, 5,3,2,0, -1,0,2,3, 5,7,8,11
], 12),

//remember, the bass is copying this
l2g = r(1,[
	12,12,0,-2,0,0,-2,0,5,7,3,2,0,0,-2,0
]),


l2 = r(1,[
	r(4, [l2b, l2c]),
	l2d, l2e, l2d, l2f,
	r(32, 12),
	r(2, l2g)
]),

l2vela = r(1,[
	r(12, 1), r(4, 1/2), r(16, 1), 
	r(2,[
		r(4, [1,1/2,1/4]), r(4, 1/4)
	])
]),

l2velb = r(1,[
	1,.5,.25,0,0,1, 1,1, r(8, .5)
]),

l2velc = r(1,[
	r(3, [1,0,0,1]), 1,0,1,.5
]),

l2veld = [1,0,1,1, 1,0,1,1, 1,1,1,1, 1,0,1,1],

l2vel = r(1,[
	r(4, l2vela),
	l2velb, l2velc, l2velb, r(16, 1),
	1, r(31, 0),
	r(2, l2veld)
]),

l3a = [-12,-12,5,7,0,0,-2,-2],
l3b = [2,2,3,3,0,0,0,0],
l3c = [0,0,-2,-2,-5,-5,-5,-5],
l3d = [0,0,2,2,3,3,5,5],

l3e = r(1, [ l3a, l3b, l3a, l3c ]),

l3 = r(1, [ l3e, [ l3a,l3b,l3a,l3d ], l3e, l3e ]),


l3vel = r(8,[
	0,0,1,1, r(10, .5), 0,0,
]),
l3vel[62] = l3vel[63] = .5,

l3vol = r(1,[
	r(29, 0),
	r(11, 1),
	r(32, [0,1])
]),


//l4a = ['7 + vibrato',0,12,10,7,7,7,5,3,3],
l4a = [7,0,12,10,7,7,7,5,3,3],
l4b = [3,2,0,0,-2,-2],
//l4c = [3,5,7,10,'6.5 + vibrato,'6.9 + vibrato'],
l4c = [3,5,7,10,6.5,7],
l4d = [0,0,2,2,3,3,2,-2,0,0,0,3,0,0,0,0],

l4 = r(1, [l4a, l4b, l4a, l4c, l4a, l4b, l4d]),


l4vela = r(1,[
	0,0, r(3, [1,1,1,0]), 1,0,
]),
l4velb = r(1,[
	0,0, 1,1,1,0, 1,1,1,0, 1,1,1,1, 1,.5,
]),
l4velc = r(1,[
	1,0,1,0,1,0,1,1, 1,0,1,1,1,.25,.25,.25
]),

l4vel = r(1, [ l4vela, l4velb, l4vela, l4velc]),


l4vol = r(1,[
	r(3, 0),
	r(6, 1),
]),


bs1a = r(1,[
	r(10, -4),8,3,-2,-2,-4,-4,r(10, -2),10,5,0,0,-2,-2,
	r(2, [r(10, -12),12,7,3,3,2,2])
]),

bs1b = r(1,[
	r(6, -7), 5,-7, r(6, -5), 7,5
]),

//less fancy
//bs1c = r(1,[
//	-7,-7,-5,-5,-9,-9,-10,-10, r(6, -12), 0,-12
//]),

//more fancy
bs1c = tra( [
	15,3,10,5,10,3,5,2, 0,2,3,7,12,14,15,14
], -12),

bs1d=r(1,[
	r(6, -4), 8,-4, r(6, -1), 11,-1
]),


bs1e = tra(l2g, -12),
bs1f = l2g,


bs1 = r(1,[
	r(4, bs1a), bs1b, bs1c, bs1b, bs1d, r(3, bs1e), bs1f
]),

bs1vol = r(1,[
	r(128, 0),
	r(256, 1),
	r(128 + 256 + 128, 1),
	1,1,1, r(7, 0), r(9, 1), r(7, 0), r(9, 1), r(210, 0), r(11, 1)
]),




bs2a = r(1,[
	-2,r(7, 0),-2,0,0,0,3,0,0,3
]),
bs2a1 = r(1,[
	r(14, 0), -2,-2, r(14, 0), 3,3
]),
bs2a2 = r(1,[
	r(3, [0,0,12,7]), 3,3,10,7
]),
bs2b = r(1,[
	r(8, 3), r(8, 2), r(8, 0), r(8, -2), r(8, -4), r(8, -2), bs2a
]),
bs2b1 = r(1,[
	r(2, [3,3,15,3]), r(2, [2,2,14,2]), r(2, [0,0,12,0]), r(2, [-2,-2,10,-2]), r(2, [-4,-4,8,-4]), r(2, [-2,-2,10,-2]), 		bs2a
]),

bs2 = r(1,[
	r(16,bs2a), r(4,bs2a1), r(4,bs2a), bs2b, r(4,bs2a2), bs2b1
]),

bs2vel = r(1,[
	r(61, 1), 0,0,0,
	r(177, 1), r(15, 0), 
	r(7,[
		r(3, [1,0,0,0]), 1,0,1,0
	]),
	1, r(15, 0),
	r(125, 1), 0,0,0,
	r(125, 1), 0,0,0
]),

bs2vol = r(1,[
	r(256,1), r(128,1.5), r(128,1), r(64,[1,1,.2,.5])
]),

bta ='1hh1sh1hhh',
btb ='1hs1hh',
btc ='sh1hss',
btd = bta+btb,
bte = '2s11s1ss11s112s1',
btf = '11S1s11S1Ss1Ss12',
btg = '1hh1shhs2ss2h14s',
bth = '11s1s11s1s11s1SS',
bti = '1    111S1s12sS4', 

btj = '1  1            ',
btk = '1  1 hhh  hh hhh',
btl = '1       ',
btm = '1   ',
btn = '1 ',
bto = '11111111  hhs1SS', 

btp = '1hshh1sh',
btq = '1hshh2s1',
btr = btp + btq,
bts = '1hs1hs1S', 

btt = '1hs1hhs1',
btu = '1hs1h1s2',
btv = btt + btu,

btw = '1hhs1hsh1hhs1hs1',
btx = btw + btw + btw + bth,
bty = '1  h1hhh',
btz = '1hs1',
btC = '11s1',
btA = '11s111s122s1SS1s',
btB = j( r(8, bty)) + j( r(6, btz)) + j( r(3, btC + btz)) + btA,

btE = 's1s1s111',
btF = 's1s1s112',
btG = 's111',
btH = 's1SS',
btI = 'SSSSSSSS1SSS1S22',
btJ = j( r(3, [btE + btF])) + j( r(8, btG)) + j( r(4, btH)) + btI + bto,



bt1 = j( r(1, [ 
	r(4, btk ), r(2, btl ), r(4, btm ), r(8, btn ), bto
])),
bT = btd+bta+btc+btd,
bt2a = bT + btd + bT + btf,
bt2 = bt2a + bT + btg + bT + bti,
bt4 = btr + btt + bts + btr + bth, 
bt5 = btv + btp + bts + btv + bte,


drumPattern= bt1 + bt2 + btB + bt4 + bt4 + bt5 + bt5 + btJ,
//bt2=j(sp(drumPattern),'0') + '0', //half-time

//necessary because 'eval' functionality removed:

//replaces wanted char with '1' and everything else with '0'
on = (str, wanted) =>
	str.replaceAll( RegExp( '[^' + wanted + ']', 'g' ), '0' ).replaceAll( RegExp( wanted, 'g'), '1' ),
hat = on( drumPattern, 'h'),
sn1 = on( drumPattern, 's'),
sn2 = on( drumPattern, 'S'),

0
),



//----------------- MIXER -----------

L1 = mseq( l1, 11, t, 4 ),
L1 = ( m( L1*16 )/3 + m( L1*16.2 )/3 + m( L1*15.6 )/3 ) * .9,
L2 = 16*mseq( l2, 10 ),  // m( ,.9) sounds better using old Harmonifier, no-m() sounds better using new/wavetable Harmonifier
L3 = m( 32*mseq( l3, 10 ), .9),
L4 = mseq( l4, 11 ),
L4 = ( m( L4*16 )/3 + m( L4*16.3 )/3 + m( L4*15.7 )/3 ),
B1 = 2 * mseq( bs1, 10 ),
B2 = mseq( bs2, 10 ),



L1s = synth( L1*2, l1vel, 10, 1.07, 0x71010599),
//L2s = sy( L2/2, l2vel, 10, 1.1, 0x0960E550), //cool hi slapp bass thing
//L2s = sy( L2|L2/2, l2vel, 10, 1.1, 0x96045509),
L2s = synth( L2/2, l2vel, 10, 1.1, 0x9634950F), //piano 2
L3s = synth( L3*2, l3vel, 10, 1.1, 0x0071010F),
//L4s = sy( L4*2, l4vel, 11, 1.1, 0x30070F36), //sorta 8bit toy pianoish
L4s = synth( L4*2, l4vel, 11, 1.5, 0x30070F26), //sorta vocal
//max(0x58,L4s)
B2s = synth( B2, bs2vel, 10, 1, 0x22032599, 8),


L3s *= seq( l3vol, 15 ),
L3s *= .4, //if using the version of Harmonifier that uses a wavetable
L4s *= seq( l4vol, 17 ) * 1.1, //*1.1 if lverbs is not lim()'d

//L1v = lim( reverb( L1s, 3e3, 1.5, .5, .5, 1), .003, 512, 1, 9),
L1v = reverb( L1s/4, 3e3, 1.5, .5, .5, 1) * 7,
//L2v = lim( reverb( L2s,18e3, 1, .4, .9, 1), .01 + (2/t), 512, 1, 9),
L2v = reverb( L2s/4,18e3, 1, .4, .9, 1) * 7,

B1a = m( m( B1, .5 ) ^ ( sinify(B1)/16 ) ** 2, .5),
B1a *= seq( bs1vol, 10),

B2s *= seq( bs2vol, 10) + seq( bs2vol, 10) / 8,
B2a = min( sinify(B2), lp( beat( bs2vel, 10, 1, 2e4), .7) ),
B2b = m( B2a*1.4 + ds(B2a,8)/ 3),
B2b *= seq( bs2vol, 10),
B2c = sinify(B2) * lp( beat( bs2vel, 10, 1, 4e4)/257, .001),
//B2c = sinify(B2) * min(1,lp(beat( bs2vel, 10, 1, 4e4),.1)/257),
B2d = m( B2c/4 + ds(B2c,4)/2),

DR = beat( drumPattern, 10, 2e5),
//necessary because 'eval' functionality removed:
DR += beat( [h], 10, 2e5) * seq( hat, 10) * .9,
DR += beat( [s], 10, 2e5) * seq( sn1, 10) * .8,
DR += beat( [S], 10, 2e5) * seq( sn2, 10) * .8,


leads = pan => lim( pan ? L1s*.4 : L2s*.7, 0, 1, 0),
lverb = pan => pan ? L2v*.4 : L2v/4 + L1v/6,
schain = pan => ( B1a ^ lp(B1a, pan ? .1 : .082 ) ) *.35 + lverb(pan)*.2 + B2b/11 + B2d/5.5 + L3s/2 + L4s/9 + B2s/14,

Master = pan => lim(

 lim(.3 * schain(pan) + lp(DR,1)*.3, .1, 512, 1, 9, 0, 16, -.1, 1)*.1 +
 lim( DR*.14 + lp(DR,2)*.5 + lverb(pan)*.2 + leads(pan)*.16 + B2d*.35 + L3s*.35, 0, 512, 0, 9, 0, 0)/2 //just latency


,.01, 512, 1, 92 + 6e11/(t**2+9e9), 99, 16, 0, 0

)/128 - 1, //for floatbeat

[ Master(0), Master(1) ]