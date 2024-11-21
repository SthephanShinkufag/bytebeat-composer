// A collection of effects you can use on _ANY_ variable that changes
// Showcased in a remix of "Ganke" by Electronicos Fantasticos

// Repeat x beats of y
// SUPER useful if you're writing complex beats/melodies
// Include this or the FXs won't work (or you could replace r(x, y) with Array(x).fill(y))
// r(1,[arrays]) also serves as a replacement for [arrays].flat()
r = repeat = (x, y) => Array(x).fill(y).flat(9),

// Uses up a lot of chars and isn't /super/ readable, but a major timesaver when creating
// Particularly the NaN handing
m = mix = (x, vol = 1, dist = 0) => ((x * vol * (1 + dist)) % (256 * vol))||0,

// Waveshaper distortion
ds = (x, amt) => x * (1 - amt) + (128 * ((x / 128) - 1) ** 3 + 128) * amt,

// The Breakbeat drum machine. This is where the magic happens
// It sequences through an array and plays the corresponding number of beats
//    (1 = quarter note, 2 = 2 8th notes, etc)
// Something interesting happens when you don't use powers of 2, however:
//    You get strange and wonderful sounds
// the variables 's' and 'h' make it sound like a snare and a hihat, respectively
// most sounds are different timbres of the same note
// but if you replace 'T' with something other than T, such as any bytebeat melody,
// you can apply that timbre to the melody.
// Adding / &ing a breakbeat with a melody can also add attack to the notes of the melody
bt = beat = (arr, spd, vel = 2e4, vol = 1, T = t, oct = 0) =>
	m(vel / (T & (2 ** (spd - oct) / arr[(t >> spd) % arr.length]) - 1), vol),

s = sin(t / 9 & t >> 5), // Snare
// s = sin(t>>5), // acoustic-sounding grungy snare
// s = sin((t | t * .7) >> 4), // quieter snare
h = 1 & t * .9, // Hihat


// The FX rack, stores memory for use in effects
// Automatically keeps track of what's stored where
// If you see red (NaNs), raise 3e5 higher, or adjust your reverbs' 'dsp' variable
// Works best when FX are not inside conditionals (meaning the number of FX in use changes)
// But even then, should only create a momentary click/pop (might be more severe for reverb)
// I chose 3e6 because it's the size of Doom's sourcecode, you shouldn't be using more than that
// You can also set it to [] and modify the effects to read m(fx[stuff]) to get around NaN issues
//    ^(this gets rid of the lag when editing, but sparse arrays might be slower during runtime)
t ? 0 : fx = r(3e5, 0),
// Iterator, resets to 0 at every t
fxi = 0,

// NOTE: IF YOU ALTER T, DO IT AFTER THIS FUNCTION
t2 = t,
//dsp = downsample the bitrate of the reverb, dsp=1 cuts uses half as much space, 2 uses 1/4, etc
rv = reverb = (x, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 0) => (
	ech = fxi + ((t2 % len) >> dsp),
	x = x * dry + wet * fx[ech],
	fx[ech] = x * feedb, //shorter, but lower res = louder
	//t2 % (1<<dsp) ? 0 : fx[ech] = x * feedb,
	fxi += len >> dsp,
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

//downsample
dsp = downsample = (x, res) => (
	x = fx[fxi] = t2 & res ? x : fx[fxi],
	x
),

// Multi-voice melody: 'voices' is like a list of resonances
mvm = (melody, speed, voices) => (
	vcp = voices,
	vcp.reduce((sum, i) =>
		sum + m(i * t * 1.05946 ** melody[(t >> speed) % melody.length], .9 / vcp.length), 0)
),

t *= 41 / 48,
//t+=2e6,

// ------------ARRAYS------------

// Chrome lags when these are defined at every t
// weirdly though this isn't the case for functions
//note: any arrays with s or h must be outside the t||()
t || (
vcs = [16, 12, 16, 8],
trumpety = [8, 12, 4, 8, 8, 4, 8, 16],
chor = [4, 4.01, 3.99, 8, 7.94, 4.05],
vcv = [.5, .3, .1],
m1 = [-2, -2, 0, 0, 3, 3, 3, -2, 0, 3, 5, 7, 5, 5, 5, 5],
m2 = [7, 7, 7, 3, 5, 5, 7, 8, 7, 7, 5, 3, 0, 0, 0, 0],
m3 = [5, 5, 5, 5, 5, 7, 5, 3, 0, 3, 3, -2, 0, 0, -2, -2],
m2b = [7, 7, 7, 3, 5, 5, 10, 8, 7, 8, 7, 3, 0, 0, 0, 0],
mvol = [r(15, 1), 0, r(15, 1), 0, r(15, 1), 0, 1, 0, 1, 0, r(11, 1), 0].flat(),
mel = [m1, m2, m1, m3, m1, m2b, m1, m3].flat(),
ltone = [.3, 7, 7, 7.2], // [.3, .4, 3.5, 7], // [1.2],
beatTones = [4.3, 0, 0, 0, 4, 0, 0, 0, 9.3, 9.3, r(12, 1.4), r(10, 10.2)].flat(),
perc = [1, , 1, , 1, , , 1, 1, , , 1, 1,,,,]
),
hats = [, h, , h, , h, h, h],

fade = 1e4 / (t >> 10),

rotate = ofs => sin((t * 2 ** -16) + ofs) + 2,

//  ------------SONG------------

pc = beat(perc, 13, 9e4),
pc1 = m(beat(beatTones, 12, 1e4, pc)),

pcmel = mvm(perc, 13, [.23]),
pcmel = mvm(perc, 13, [.368, .184]),
pcmel = pcmel & pc1,
pcmel = lp(pcmel | rv(pcmel, 1554), fade), // The reverb is tuned to a specific note

// The original Ganke had a lofi kind of delay
//    but t-2e2 is too subtle to notice and larger numbers seem offputting
hh = dsp(beat(hats, 13, 2e4, 1, t - 2e2), (t >> 17) + 1),
hh *= .4 * ds(min(.2, 8 / fade), 1),

l1chorus = mvm(mel, 13, chor) & 255 * mvol[(t >> 13) % 64],
l2 = (l1chorus & beat(mvol, 13, 6e4)) / 2,
l3 = m((l2 | l2 / 2) & beat(ltone, 13, 4e4, 1, l2), .8, 2),

echobloop = lp(rv(l3, 2e4, .9, .4, 1, 1), 4),

lead = rv(l1chorus, 2e4, .8, .5, 1, 1) * .5,
lead *= min(5 / fade, .5),

[
	min(max(hh + .5 * pcmel + lead + .5 * echobloop * rotate(0), 0), 255),
	min(max(hh + .5 * pcmel + lead + .5 * echobloop * rotate(PI / 4), 0), 255)
]