//Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
T = t,

t *= r8 = 8 / 57,


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
m = (x, vol=1, dist=0) => ( ( x * vol * ( 1 + dist ) ) % ( 256 * vol ) ) || 0,

/*
	F is the FX stack, stores memory for use in effects
	Automatically keeps track of what's stored where
	If you see red (NaNs), raise 2032 higher, or adjust your reverbs' 'dsp' variable (and limiters' lookahead)
	Works best when effects are not inside conditionals (meaning the number of F in use changes)
	But even then, should only create a momentary click/pop (might be more severe for reverb)
*/
T ? 0 : F = r( 2048, 0 ),
// Index of F, resets to 0 at every t
I = 0,

//melodic sequences without clicks/pops
//mseq = ( ...x ) => t * 2 ** ( seq(...x) / 12 ), //original
mseq = ( ...x ) => (
	F[I++] += ( r8 * 2 ** ( ( seq(...x) + mp ) / 12))||0
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

s = sin(T / 9 & T >> 5), // long snare
//s = sin(t>>5), // acoustic-sounding grungy snare
//s = seq( [ls, 0], 9), // Snare
h = 1 & T * 441/480, // long Hihat
//h = seq( [h,h,h,0], 8), //quieter, faster attack

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

cl = clip = x => min(1,max(-1,x-lp(x,.001))),


//replaces wanted char with '1' and everything else with '0'
on = (str, wanted) =>
	str.replaceAll( RegExp( '[^' + wanted + ']', 'g' ), '0' ).replaceAll( RegExp( wanted, 'g'), '1' ),

ht = halftime = arr => (
	arr = r(1,arr), //flatten
	r(arr.length * 2).map( (e,i) => arr[i/2|0] )
),


//------------------ SEQUENCES -----------------------------------

//Do not take any of this out of the 't || ( )' statement
t || (

pch = [0,0,.7,1],

gf1=tra([11.7, 11.8, 21, 6.9, 7, 7, 21, 7, 12, 6, 22, 6, 10, 9, 7, 2, 2, 2, 23, 3, 3, 3, 20, 4, 4, 16, 13, 14, 15, 16, 17, 18],-12),

garfSeq = tra(r(1,[
	r(96, -.1),
	r(3,gf1),
	r(64, 1.9),
	r(3,gf1),
]),0-mp),

bas = r(1,[
	[12,12,12,11,10,9,8,7,6,5,4,3,2,1], //14 beats
	r(16, 0),
	r(16, 8),
	r(12, 1),
	r(6, 6)
]),

bsv2 = "88080888808088880808808808808888",

bsv = j(r(1,[
	r(48,0),ht(sp("33445678")),
	r(128,8),r(128,0),r(2,sp(bsv2)),r(128,8),r(128,0),r(2,sp(bsv2))
])),

it = [-2,4,2,7],

intr = r(1,[
	ht(r(1,[ht(ht(it)), ht(it), it])), 9,2,3,7,9,3,9,10
]),

l1a = r(1,[
	0,0,0,1,1,1,1,r(8,4) //15 beats
]),

l1b = r(1,[
	r(8,3),r(9,1).map((e,i)=>e-i*.1) //17 beats
]),

l2b = r(1,[
	r(8,5),r(9,8).map((e,i)=>e-i*.1) //17 beats
]),

lv = "11100011000", 

ld = "04081040810",
//ld = "00841040810",

l1 = r(1,[intr,ht(r(26,[l1a,l1b]))]),
l2 = r(1,[intr,r(2,[ht([l1a,l1b,l1a,l2b,r(96,0)])])]),

l3 = r(1,[
	10,10,10,8, 8,8,8,7, 7,7,7,7, 5,7,7,8, 8,8,8,8, 7,8,8,10, 10,10,10,10, 8,10,10,10.3,
]),

drk1 = "10000000", drk2 = "10000010", drk3 = "00010000", drk4 = "11000100",
drs1 = "00001000", drs2 = "00001000", drs3 = "00001000", drs4 = "00211011",

drk = drk1 + j(r(3,[sp(drk2),sp(drk3)])) + drk4,
drs = drs1 + j(r(3,[sp(drs2),sp(drs3)])) + drs4,

hhv = "09933899338",

0),

//----------------- MIXER -----------


//T==(((4<<16)/r8)|0)&&(F[I+1]+=3e8),
//T==(((6<<16)/r8)|0)&&(F[I+1]-=6e8),


p = ( (F[I++] += 1) > 9 ? t>>15>1 ? mseq(pch,14,t,1) / t: mseq([0],9) / t: F[I++] = t), //desync protection, TODO: make better by doing integral

garf=x=>(sin(PI*(x/32 + sin(PI/32*x/(t?t:1)*(mseq(garfSeq,11)))))+sin(PI*x/128))*(-t>>4&63)**2/99,
og=(x,pn)=>garf(x)+garf(x*2)+garf(x*4)+garf(x*8)+garf(x*16)+garf(x*32)*pn/2,
G1=pn=>lp(lp2(cl(hp(og(p*t,1-pn),.02)*seq(ld,16,t,1)),.7),min(t/1e5,.7)),
G2=pn=>lp2(cl(hp(cl(lp(og(p*t,pn),.5)*(seq(ld,16,t,1)+.2)/9),.2)),min(t/2e6,.1)),

sw=x=>x%1+x*.99%1+x*1.01%1,
SW=(pn,t)=>hp(sw(mseq(pn?l1:l2,10,t,t>>13==7?0:4-pn)*(6+pn/8)/97),.25)*.6*seq(lv,16),
//SW=(pn,t)=>hp(sw(mseq(pn?l1:l2,10,t,4-pn)*(6+pn/8)/97),.25)*.6*seq(lv,16),
//SWs=pn=>t>>15>1?SW(pn,t):SW(pn,t)*.9+SW(pn,t-8192)*.6,
//SWs=pn=>t>>13>7?lp(SW(pn,t)*.8+SW(pn,t-512)*.4,1):lp(SW(pn,t)*.9+SW(pn,t-8e3)*.6,min(t/1e5,1)), //no glitch
SWs=pn=>t>>13>7?SW(pn,t)*.8+SW(pn,t-512)*.4:lp(SW(pn,t)*.9+SW(pn,t-8e3)*.6,min(t/1e5,1)), //uses different amount of memory, causing stereo glitch that sounds COOL AF


l3m=pn=>mseq(l3,11,t,pn)|mseq(l3,11,t,pn)/2,
L3=pn=>cl(sw(l3m(pn)*(6+pn/8)/97)*seq(lv,16)*64)*(t>>15>1?.1:0),

BS1 = x => x&0 + x&192,
BS = x => cl(((BS1(x)/2 + hp(BS1(x),.1)*(-t>>6&8))%99)/64) * seq(bsv,10)/8,

K = cl(((sin(sqrt(6*(t%1024)))*127+(t/2&127))*bt(drk,10,1)**.125)/16)*(t>>9>79?1:0),
SN = bt([s],9)*bt(drs,10,2,.4)*(t>>9>95?1:0),
H = bt([h],10,3*seq(hhv,16),1),

Mix = pan => (

BS(mseq(bas,10))*.6 + SWs(pan) + L3(pan) + hp(L3(pan),.4)*2 + K + SN + H +

G1(pan) * (.05 + pan/8) + G2(pan) * (.6 - pan/2)

),

Mas = p => t>>10==64?K*(1+p):cl(Mix(p)),

[Mas(0),Mas(1)]

//a=()=>{throw(I)},a() //Determine amount of memory to initialize