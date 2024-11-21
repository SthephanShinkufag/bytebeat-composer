// A collection of effects you can use on _ANY_ variable that changes

// Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
t2 = t,

// Change t here, not below, or it messes with the snare/hihat sounds
t *= 1.2 / 12,

// Repeat x beats of y
// SUPER useful if you're writing complex beats/melodies
// Include this or the FXs won't work (or you could replace r(x, y) with Array(x).fill(y))
// r(1, [arrays]) also serves as a replacement for [arrays].flat()
r = repeat = (x, y) => Array(x).fill(y).flat(9),

sp = (str, sep = '') => str.split(sep),
j = (arr, sep = '') => arr.join(sep),

// tra = transpose = (arr, amt) => arr.map(x => x + amt),
tra = transpose = (x, amt) => Array.isArray(x) ? x.map(e => e + amt) : j(sp(x).map(e => e + amt)),

// Uses up a lot of chars and isn't /super/ readable, but a major timesaver when creating
// Particularly the NaN handing
m = mix = (x, vol = 1, dist = 0) => ((x * vol * (1 + dist)) % (256 * vol)) || 0,

// Waveshaper distortion
ds = (x, amt) => x * (1 - amt) + (128 * ((x / 128) - 1) ** 3 + 128) * amt,

// seq = (arr, spd, T = t) =>
//    eval(arr[(T >> spd) % arr.length]), // More functionality, but drastic worse performance :(
seq = (arr, spd, T = t) => arr[(T >> spd) % arr.length],
mseq = (...x) => t * 2 ** (seq(...x) / 12),

// The Breakbeat drum machine. This is where the magic happens
// It sequences through an array and plays the corresponding number of beats
//    (1 = quarter note, 2 = 2 8th notes, etc)
// Something interesting happens when you don't use powers of 2, however:
//    You get strange and wonderful sounds
// the variables 's' and 'h' make it sound like a snare and a hihat, respectively
// most sounds are different timbres of the same note
// but if you replace 'T' with something other than t, such as any bytebeat melody,
// you can apply that timbre to the melody.
// Adding / &ing a breakbeat with a melody can also add attack to the notes of the melody
bt = beat = (arr, spd, vel = 2e4, vol = 1, T = t, oct = 0) =>
	m(vel / (T & (2 ** (spd - oct) / seq(arr, spd)) - 1), vol),

ls = sin(t2 / 9 & t2 >> 5), // Long snare
// s = sin(t >> 5), // Acoustic-sounding grungy snare
// s = (((t * 8 / 48) >> 9) & 1) ? 0 : sin(t / 9 & t >> 5), // Snare
s = seq([ls, 0], 9), // Snare
S = seq([ls, 0], 8), // Double snare
// s = sin((t | t * .7) >> 4), // Quieter snare
// h = 1 & t * 441 / 480, // Long Hihat
h = 1 & t2 * 441 / 480, // Long Hihat
h = seq([h, h, h, 0], 8), // Quieter, faster attack

// The FX rack, stores memory for use in effects
// Automatically keeps track of what's stored where
// If you see red (NaNs), raise 5e4 higher, or adjust your reverbs' 'dsp' variable
// Works best when FX are not inside conditionals (meaning the number of FX in use changes)
// But even then, should only create a momentary click/pop (might be more severe for reverb)
// You can also set it to [] and modify the effects to read m(fx[stuff]) to get around NaN issues
//    ^(this gets rid of the lag when editing, but sparse arrays might be slower during runtime)
t ? 0 : fx = r(4e4, 0),
// Iterator, resets to 0 at every t
fxi = 0,

// dsp = downsample the bitrate of the reverb, dsp=2 cuts uses half as much space, 3 uses 1/3, etc
rv = reverb = (x, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 2, T = t2) => (
	ech = y => fxi + (0 | (y % len) / dsp),
	x = x * dry + wet * fx[ech(T)] || 0,
	t2 % dsp ? 0 : fx[ech(t2)] = x * feedb,
	fxi += 0 | (len / dsp),
	x
),

lp = lopass = (x, f) => ( // f ~= frequency, but not 1:1
	// fx[fxi] is the value of the last sample
	// You will need to change the 'x % 256' if you're using signed or floatbeat
	x = min(max(x % 256, fx[fxi] - f), fx[fxi] + f), // Clamp the change since last sample between (-f, f)
	fx[fxi] = x,
	fxi++,
	x
),

// Sounds kinda off, and hipass+lopas=/=original when you use ^, but + sounds harsher
hp = hipass = (x, f) => (x % 256) ^ lp(x, f),

// sp = speed
lim = limiter = (x, sp = .1) => (
	x &= 255,
	mi = fx[fxi] = min(fx[fxi] + sp, x, 255),
	mx = fx[fxi + 1] = max(fx[fxi + 1] - sp, x, mi + 9),
	fxi += 2,
	(x - mi) * 255 / (mx - mi)
),

// Downsample
// dsp = downsample = (x, res) => (
//    x = fx[fxi] = t2 & res ? x : fx[fxi],
//    x
// ),

// Multi-voice melody: 'voices' is like a list of resonances
// mvm = (melody, speed, voices) => (
//    vcp = voices,
//    vcp.reduce((sum, i) =>
//    sum + m(i * t * 1.05946 ** melody[(t >> speed) % melody.length], .9 / vcp.length), 0)
// ),

// XORs the input with its harmonics, controlled by the bits of a number ('tone')
// Unoptimized version
// hm = harmonify = (x,tone) => {
//    o = 0;
//    //len=8;
//    len = log2(tone) + 1;
//    for (i=0; i<len; i++) {
//        o ^= ( 1 & (tone>>i) ) * (i+1)/2 * x
//    }
//    return o;
// },

// Instead of computing on the fly, this version computes a wavetable at the start
// Side effects: you can't start the song at any t, and output is always full-volume
hm = harmonify = (x, tone, waveTableSize = 256 * t2/t | 0 ) => {
	//play from the buffer
	if( fx[fxi] > waveTableSize ) {
		o = fx[ fxi + 1 + ( x * t2 / t & waveTableSize - 1) ];
		fxi += 1 + waveTableSize;
		return o
	}
	//fill the buffer
	for (i=0; i<8; i++) {
		fx[ fxi + 1 + fx[fxi] ] ^= ( 1 & (tone>>i) ) * (i+1)/2 * fx[fxi] * t / t2
	}
	fx[fxi]++;
	fxi += 1 + waveTableSize;
	//return x //not strictly necessary unless the wavetable size is large enough to notice silence at the start
},

// Basically just treat this like a black box and fiddle with the knobs at random
// For a more detailed exmplanation:
// X, and the First 2 hexes of y, are the fun surprise knobs :)
//    Small changes in these values completely change the tone (most of the time)
// The next 2 hexes of y control the harmonifier
// The next hex controls the *thump*/click/noise of the attack
// The next hex controls the decay
// The next 2 hexes control the lowpass
sy = synth = (melody, velTrack, speed, x, y, ...z) =>
	lp(min(
		m(hm(beat([x], 10, 6e4, 1, melody, .02 * ((y >> 24) & 255)), (y >> 16) & 255, ...z), .9, 1) +
		beat(velTrack, speed, 1e3 * ((y >> 12) & 15)), beat(velTrack, speed, 1, 2e4 * ((y >> 8) & 15))
	), y & 255),

// saw 2 sine
s2s = sinify = x => sin(x * PI / 64) * 126 + 128,

v = vibrato = sin(t2 >> 10) / 2,

// ------------------ SONG -----------------------------------

M1 = (t*2.1/1.2*2**([8,0,-7,5,0,-7,8,0,-7,5,0,-7,8,0,5,-7,10,0,-7,5,0,-11,10,1,-7,7,3,-2,10,3,-2,7,12,0,-7,8,0,-7,12,0,-7,8,0,-7,12,0,8,-7,12,0,-7,8,0,-7,12,0,10,1,3,7,-2,3,5,7,8,-4,-11,5,-4,-11,8,-4,-7,5,-4,-11,10,-4,5,-7,7,-2,-9,3,-2,-9,7,-2,-9,3,-9,-2,8,7,5,10,12,0,-7,8,0,-7,12,0,-7,8,0,-7,12,0,8,-7,12,0,-7,8,0,-7,12,0,10,1,3,7,-2,3,5,7,][t>>9&127]/12)&255),

//M1s = synth( sinify(M1/8|M1/2), [1], 10, .3, 0x34065299),
//M1s = synth( sinify(M1/8), [1], 10, 1.3, 0x34165299),
M1s = synth( sinify(M1), [1], 9, 1, 0x341692FF), //1.2-speed ver
//M1s = synth( sinify(M1), [1], 9, 1.1, 0x141601FF), //just square
//M1s = synth( sinify(M1), [1], 9, 1.1, 0x234301FF), //sorta 5th
M2s = synth( sinify(M1), [1], 9, 2.7, 0x230601FF), //another good bass
//M1s = synth( sinify(M1), [1], 9, 2.7, 0x230701FF), //another good bass

K = beat( "1000100010001001", 9, 6e4 ),
SN = beat( [0,0,s,0], 10, 6e4 ) * seq("0111",15),
H = beat( [0,h,h,h], 9),


//song = p => lim( m(K,.2) + lp(K, 1)*.5 + .3 * ( p ? M1s : M2s), .01),
comp = p => lim( m(K,.2) + .3 * ( p ? M1s : M2s), .01),

song = p => min( 255, H/3 + SN/2 + comp(p)/2.2 + lp(K,1) ),

[ song(0), song(1) ]



//[ lim( M1s, .01 ), lim( M2s, .01 ) ]
