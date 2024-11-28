//Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
T = t,

t *= r8 = 36/48,

t -= t/4&2048, //swang

//seq = ( arr, spd, t2=t ) => arr[ (t2 >> spd) % arr.length ],
/*version that lerps:
	the 'x' argument controls the speed at which the slides happen (1=very slidy, 99=almost none, 0=none) */
seq=(r,s,t2=t,x=0)=>(i=t2/2**s,J=i|0,L=r.length,x?(k=(i-J)**x,(1-k)*r[J%L]+k*r[(J+1)%L]):r[J%L]),

//----SONG SETTINGS-----

//master pitch
mp = 2,



//-----TOOLS-----

/*
	Repeat x beats of y
	SUPER useful if you're writing complex beats/melodies
	Include this or the Fs won't work (or you could replace r(x, y) with Array(x).fill(y))
	r(1,[arrays]) also serves as a replacement for [arrays].flat()
*/
r = repeat = (x, y) => Array( x ).fill( y ).flat( 9 ),

sp = (str, sep='') => str.split( sep ),
j = (arr, sep='') => arr.join( sep ),

//tra = transpose = (arr, amt) => arr.map(x=>x+amt),
tra = transpose = (x, amt) => Array.isArray(x)? x.map( e => e + amt ) : j( sp(x).map( e => e + amt ) ),

//pretty much deprecated but used in bt()
m = mix = (x, vol=1, dist=0) => ( ( x * vol * ( 1 + dist ) ) % ( 256 * vol ) ) || 0,

/*
	F is the FX stack, stores memory for use in effects
	Automatically keeps track of what's stored where
	If you see red (NaNs), raise 2e3 higher, or adjust your reverbs' 'dsp' variable (and limiters' lookahead)
	Works best when effects are not inside conditionals (meaning the number of F in use changes)
	But even then, should only create a momentary click/pop (might be more severe for reverb)
*/
T ? 0 : F = r( 29e3, 0 ),
// Index of F, resets to 0 at every t
I = 0,

//melodic sequences without clicks/pops
//mseq = ( ...x ) => t * 2 ** ( seq(...x) / 12 ), //original
mseq = ( ...x ) => (
	F[I++] += ( r8 * 2 ** ( ( seq(...x) + mp ) / 12))||0
),

// Waveshaper distortion
// Assumes range is neatly between 0-255; use after limiter
// Negative values make it rounder (though after -.6 it goes beyond {0..255} so there are wraparound artifacts)
ds = (x, amt) => x * (1 - amt) + 127 * ( ( ( x / 127 ) - 1 ) ** 3 + 1 ) * amt,

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
s = seq( [ls, 0], 9), // Snare
h = 1 & T * 441/480, // long Hihat
h = seq( [h,h,h,0], 8), //quieter, faster attack

/*
	Stereo delay with multiple heads and a chorusey effect
	inspired by Feeshbread's Dead Data echo,
	but using the GAv2 reverb's downsampling
	(and some messy magic numbers to keep gain in line, save memory and chars, etc)
	single input, outputs an array size 2
	requires old lp(), new hp(), lim2(), r(), and slidy seq() to function
*/

rvs = reverbStereo = (
	input,
	len = 16e3,
	vibratoSpeed = [91,83,77,67,5], //must be 2 or larger
	dry = .4,
	wet = .6,
	feedb =.6, //best results between .6-.86
	downsamp = 3, //can be any float over 1
	lerpx=4, //0 = no interpolation, 1=linear, 2=quadratic, etc.
	highpass=.1,
	lowpass = .7,
	compAtk = 9,
	compRel = 1,
	compThresh = 9, //~9 for bytebeat range (0-255), adjust accordingly for smaller ranges
	vibratoDepth = 299, //best around 300, lower=feedbackier
	voices = vibratoSpeed.length,
	t2 = r(voices, T ), //array of all T the same size as vibratoSpeed[], could also be T/2 if specified in args
) => (
	x = y => I + voices*3 + ( (y % len) / downsamp )|0, //index within allocated fx memory
	fbh=[], out=[0,0], //can reuse fbh to save chars, but first 2 outputs will be double volume
	t2.map( (t2val,i)=> (
		t2val += vibratoDepth*3 + 9*downsamp*voices + vibratoDepth * sin(T*vibratoSpeed[i]/3e6),
		fbh[i] = hp( lp( seq( F, 0, x(t2val) - i*2, lerpx )||0 , lowpass), highpass)
	)),
	F[ x(T) ] = input * (1-feedb) + fbh.reduce((a,e,i)=> a=lim2(
				a+e, compAtk, compRel/voices, compThresh/voices*(1+i/2)
		) * feedb )
	,
	I += 0|(len / downsamp) + voices*3,
	//fbh.map((e,i)=>fbh[i%2]+=e*wet+input*dry/voices) //first 2 voices will be double volume
	fbh.map((e,i)=>out[i%2]+=e*wet+input*dry/voices),out
),


//bad lopass (turns things into triangles rather than sins) but good for compressor
lp2 = lopass = (input, freq, bias=1) => // f ~= frequency, but not 1:1
	// F[I] is the value of the last sample
	// You will need to change the 'x % 256' if you're using signed or floatbeat
	F[I] = min( max( input, F[I] - freq), F[I++] + freq * bias)||0 // Clamp the change since last sample between (-f, f)
,

//better lopass, especially for hi-pass
lp = (input,freq) =>
	F[I] = F[I++] * (1-freq) + input * freq
,

hp = (input,freq) => input - lp(input,freq),

//simple but bad limiter, uses the bad lopass
//release must be >0
lim2 = (input, atk, release, thresh) => (
	input * thresh / lp2(
		max( thresh, abs(input))
	,release, atk/release
	)||0
),


/*
This limiter is pretty complex
in most circumstances, a highpass + a simpler limiter will do the job
but this limiter preserves bass frequencies with minimal distortion
(though imo the grittyness is usually part of Bytebeat's charm)
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
lim = limiter = (input, speed = .1, lookahead = 512, wet = 1, thresh = 99, bias = 4, iters = 4, saturate = 0, p = 0) => {
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

// Version 1 of my Synth
// A new version is in development, but this is the one used in GAv2

//Basically just treat this like a black box and fiddle with the knobs at random
//For a more detailed exmplanation:
//	X, and the First 2 hexes of y, are the fun surprise knobs :)
//		Small changes in these values completely change the tone (most of the time)
//	The next 2 hexes of y control the harmonifier
// The next hex controls the *thump*/click/noise of the attack
// The next hex controls the decay
// The next 2 hexes control the lowpass
sy = synth = (melody, velTrack, speed, x, y, ...z)=>
	lp2(
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

//replaces wanted char with '1' and everything else with '0'
on = (str, wanted) =>
	str.replaceAll( RegExp( '[^' + wanted + ']', 'g' ), '0' ).replaceAll( RegExp( wanted, 'g'), '1' ),



t||(

m1= [-2,-2,0,0,3,3,3,-2,0,3,5,7,5,5,5,5],
m2= [7,7,7,3,5,5,7,8,7,7,5,3,0,0,0,0],
m3= [5,5,5,5,5,7,5,3,0,3,3,-2,0,0,-2,-2],
m2b=[7,7,7,3,5,5,10,8,7,8,7,3,0,0,0,0],
mvol=r(1,[r(15,1),0,r(15,1),0,r(15,1),0,1,0,1,0,r(11,1),0]),
mel=r(1,[m1,m2,m1,m3,m1,m2b,m1,m3]),
//pcs='1h1h1hh1h1h11hhh',
//k2 ='1010100101011000',
k2 ='1010100100011000',


//k2=on(pcs,'1'),
//hh=on(pcs,'h'),

//vibSpeeds = [91,7],
//vibSpeeds = [91,51,23,7],
//vibSpeeds = [91,83,77,67,7,5,3,2],
//vibSpeeds = r(16,299).map((e,i)=>e/1.618**(i/2)),
vibSpeeds = r(8,199).map((e,i)=>e/1.618**i),

0

),

M1 = mseq(mel,13,t,8)*4&255,
M2 = sy(M1,[1],13,1.07,0x7101055f)*2.5,
M = seq([ M1, s2s(M1)*.6, M2 ], 19, t*5, 1),
M*=seq(mvol,13,t,2)/4,

K = sin(mseq([-28])*PI/64)*lp(bt(k2,13,99,8),.1)*128, 
K *= 64 / max( 64, abs(K)),
H = bt([h],13),

sier=x=>5*x&t>>9|3*x&4*t>>12,

//t3=r(8).map((e,i)=>T+1e3*1.618**i),
//t3=r(8).map((e,i)=>T+16e4/1.618**(i/2+1)),
t3=r(8).map((e,i)=>T+4e4/1.272**i),

V=rvs( M * min(1,.25+T/4e5) + hp(sier(t*.45)&511,.1)/4, 3e4, vibSpeeds, .1, .9, .9, 1.1, 0, .05+sin(T/3e4)/32, .5, 9, 1, 9, 599, 8, t3 ),

//V=rvs( M, 7e3, vibSpeeds, .1, 1, .8, 4, 2, .1, .5, 9, 1, 9, 299 + cos(T/3e5)*99, 8,[T,T*3/4,T/2,T*3/2,T/2,T*2,T/2,T] ), //trippy octaving




//Master=ch=>tanh(
Master=ch=>lim(
	hp(
		V[ch] * 3 + K + (H&61) + hp(sier(mseq([-9],1))&511,.4)/8
		//V[ch] * 2
	,.001)
// /64),				//tanh floatbeat
///52)*128+128,	//tanh bytebeat
,.01),

[Master(0),Master(1)]



//,a=()=>{throw(I)},a() //Determine size of memory stack to initialize