//Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
T = t,

//Change t here, not below, or it messes with the snare/hihat sounds
t *= r8 = 1 / 1.25,


//t -= 2048&t/4, //SWANG!

// Repeat x beats of y
// SUPER useful if you're writing complex beats/melodies
// Include this or the Fs won't work (or you could replace r(x, y) with Array(x).fill(y))
// r(1,[arrays]) also serves as a replacement for [arrays].flat()
r = repeat = (x, y) => Array( x ).fill( y ).flat( 9 ),

// Waveshaper distortion
// Assumes range is neatly between 0-255; use after limiter
// Negative values make it rounder (though after -.6 it goes beyond {0..255} so there are wraparound artifacts)
//ds = (x, amt) => x * (1 - amt) + 127 * ( ( ( x / 127 ) - 1 ) ** 3 + 1 ) * amt,
ds = (x, amt) => x * (1 - amt) - x ** 3 * amt, //floatbeat


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

mseq = ( ...x ) => (
	F[I++] += ( 1/1.25 * 2 ** ( ( seq(...x) )  / 12))||0
),



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
/*
rv = reverb = ( input, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 3, t2=T) => (
	input = input*dry + wet * seq( F, 0, I + ( t2 % len ) / dsp, 1 ) || 0,
	T % dsp ? 0 : F[ I + ( (T % len) / dsp )|0 ] = input * feedb,
	//F[ I + ( (T % len) / dsp )|0 ] = input * feedb ** (1/dsp), //higher dsp adds dampening
	I += 0|(len / dsp),
	input
),
*/

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
lim = limiter = (input, speed = .1, lookahead = 512, wet = 1, thresh = .1, bias = 9, iters = 8, saturate = 0, p = 0) => {
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
	//return ds( ( o - mi ) * 255/(mx-mi), saturate ) * wet + o * (1-wet)
	return ds( ( o - mi ) * 2/(mx-mi) - 1, saturate ) * wet + o * (1-wet) //for floatbeat

},

//-------------------

t || (

//kv1 = [9,8,3,1],

//kickvol = r(1, [
	//kv1, r(2, 0 ), kv1, r(6, 0)
	//kv1, kv1, 0, 0, kv1, 9, 8
//]),

bas = '8503',

kickvol = '98310000',

0
),

//------------

//rhy2 = t - ( 8192 & ( t/8 & t/4 ) ),

rhy2 = t,

rotate = ofs => sin( t / 2 ** 17 + ofs ),

t?0:a=0,p=mseq('25259474',13)/1.6,a=(a*24+((p%88+p%59*6/4)-64)/((t/'4142'[3&t>>13]%4096+128)**.7)*64)/32,

Master = pan => t < 2**18 ?

lim( lp( a/12, 2**13 / t ), .1, 5, 1, 3 ) * ( .2 + t / 2**20 )

:
 
lim(
	a/24 +
	lp( (mseq(bas,16)/4), .15 + rotate( pan ? 0 : PI )*.02 )/25 +
	lp( sin( 6 * cbrt( rhy2 % 2**14 ) ) * lp( seq( kickvol, 11, rhy2, 1 ), .001), 1) / 2,

.01, 512, 1, 2, 9, 9 ),

[ Master(0), Master(1) ]