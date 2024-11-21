// A collection of effects you can use on _ANY_ variable that changes

// Original t, increments one per sample. The reverb, harmonifier, hihat, and snare need this.
t2 = t,

// Change t here, not below, or it messes with the snare/hihat sounds
t *= 8 / 48,

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
hm = harmonify = (x, tone, waveTableSize = 256 * t2 / t | 0) => {
	// Play from the buffer
	if(t2 > waveTableSize) {
		o = fx[fxi + (x * t2 / t & waveTableSize - 1)];
		fxi += waveTableSize;
		return o;
	}
	// Fill the buffer
	for(i = 0; i < 8; i++) {
		fx[fxi + t2] ^= (1 & (tone >> i)) * (i + 1) / 2 * t;
	}
	fxi += waveTableSize;
	// Not strictly necessary unless the wavetable size is large enough to notice silence at the start
	// return x;
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

// ------------------ SEQUENCES -----------------------------------

// Do not take any of this out of the 't ? 0' statement
t ? 0 : (
	// Half-time
	// l1a = r(1, [
	//    r(6, 7), r(6, 3), r(6, 5), r(6, 10), 8, 8, 8, 8, 5, 5, 5, 5,
	//    r(2, [r(6, 7), 3, 3, 3, 3, 2, 2, 0, 0, 0, 0])
	// ]),
	l1a = r(1, [7, 7, 7, 3, 3, 3, 5, 5, 5, 10, 10, 10, 8, 8, 5, 5, r(2, [7, 7, 7, 3, 3, 2, 0, 0])]),
	l1b = [-4, -4, 0, 0, 2, 3, 3, 5],
	l1c = [3, 2, 2, 0, -5, -5, -5, -2],
	l1d = [7, 5, 7, 8, 10.5, 10.9, 11, 13],
	l1e = [3, 3, 3, 3, 5, 5, 5, 5, 7, 7, 8, 8, 10, 10, 11, 11],
	l1 = r(1, [r(4, l1a), l1b, l1c, l1b, l1d, r(16, 12), l1e]), // L1 velocity is actually double-time
	l1vela = r(1, [r(4, [1, 1 / 8, 1 / 8]), 1, .5, 1, .5]),
	l1velb = [1, 1 / 8, 1 / 8, 1, .5, 1, 1, .5],
	clave = [1, .5, 0, 1, .5, 0, 1, .5],
	l1velc = r(1, [
		r(2, [1, .5, 0, 1]),
		r(3, clave),
		r(2, [1, .5, 0, 1]),
		clave,
		r(4, [1, 0]),
		r(8, 1)
	]),
	l1vel = r(1, [
		r(8, [l1vela, r(2, l1velb)]),
		l1velc,
		r(8, 1 / 8), r(24, 0),
		r(16, 1 / 4), r(8, 1 / 2), r(8, 1)
	]),
	l2a = r(3, [-12, -5, -2, 0]),
	l2b = r(1, [l2a, 3, 3, 2, 2, l2a, 5, 3, 2, 3]),
	l2c = r(2, [0, 0, 0, 7, 7, 7, 5, 5, 5, 10, 10, 10, 7, 7, 7, 7]),
	l2d = r(1, [r(6, 8), 7, 5, 7, 7, 5, 5, 3, 3, 5, 5]),
	l2e = r(1, [7, 7, 7, 7, 5, 5, 5, 5, r(6, 0), 7, 7]),
	l2f = tra([7, 5, 3, 2, 5, 3, 2, 0, -1, 0, 2, 3, 5, 7, 8, 11], 12),
	l2g = r(1, [12, 12, 0, -2, 0, 0, -2, 0, 5, 7, 3, 2, 0, 0, -2, 0]), // Remember, the bass is copying this
	l2 = r(1, [
		r(4, [l2b, l2c]),
		l2d, l2e, l2d, l2f,
		r(32, 12),
		r(2, l2g)
	]),
	l2vela = r(1, [
		r(12, 1), r(4, 1 / 2), r(16, 1),
		r(2, [r(4, [1, 1 / 2, 1 / 4]), r(4, 1 / 4)])
	]),
	l2velb = r(1, [1, .5, .25, 0, 0, 1, 1, 1, r(8, .5)]),
	l2velc = r(1, [r(3, [1, 0, 0, 1]), 1, 0, 1, .5]),
	l2veld = [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
	l2vel = r(1, [
		r(4, l2vela),
		l2velb, l2velc, l2velb, r(16, 1),
		1, r(31, 0),
		r(2, l2veld)
	]),
	l3a = [-12, -12, 5, 7, 0, 0, -2, -2],
	l3b = [2, 2, 3, 3, 0, 0, 0, 0],
	l3c = [0, 0, -2, -2, -5, -5, -5, -5],
	l3d = [0, 0, 2, 2, 3, 3, 5, 5],
	l3e = r(1, [l3a, l3b, l3a, l3c]),
	l3 = r(1, [l3e, [l3a, l3b, l3a, l3d], l3e, l3e]),
	l3vel = r(8, [0, 0, 1, 1, r(10, .5), 0, 0]),
	l3vel[62] = l3vel[63] = .5,
	l3vol = r(1, [r(29, 0), r(11, 1), r(32, [0, 1])]),
	// l4a = ['7 + vibrato', 0, 12, 10, 7, 7, 7, 5, 3, 3],
	l4a = [7, 0, 12, 10, 7, 7, 7, 5, 3, 3],
	l4b = [3, 2, 0, 0, -2, -2],
	// l4c = [3, 5, 7, 10, '6.5 + vibrato, '6.9 + vibrato'],
	l4c = [3, 5, 7, 10, 6.5, 7],
	l4d = [0, 0, 2, 2, 3, 3, 2, -2, 0, 0, 0, 3, 0, 0, 0, 0],
	l4 = r(1, [l4a, l4b, l4a, l4c, l4a, l4b, l4d]),
	l4vela = r(1, [0, 0, r(3, [1, 1, 1, 0]), 1, 0]),
	l4velb = r(1, [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, .5]),
	l4velc = r(1, [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, .25, .25, .25]),
	l4vel = r(1, [l4vela, l4velb, l4vela, l4velc]),
	l4vol = r(1, [r(3, 0), r(6, 1)]),
	bs1a = r(1, [
		r(10, -4), 8, 3, -2, -2, -4, -4, r(10, -2), 10, 5, 0, 0, -2, -2,
		r(2, [r(10, -12), 12, 7, 3, 3, 2, 2])
	]),
	bs1b = r(1, [r(6, -7), 5, -7, r(6, -5), 7, 5]),
	// bs1c = r(1, [-7, -7, -5, -5, -9, -9, -10, -10, r(6, -12), 0, -12]), // Less fancy
	bs1c = tra([15, 3, 10, 5, 10, 3, 5, 2, 0, 2, 3, 7, 12, 14, 15, 14], -12), // More fancy
	bs1d = r(1, [r(6, -4), 8, -4, r(6, -1), 11, -1]),
	bs1e = tra(l2g, -12),
	bs1f = l2g,
	bs1 = r(1, [r(4, bs1a), bs1b, bs1c, bs1b, bs1d, r(3, bs1e), bs1f]),
	bs1vol = r(1, [
		r(128, 0),
		r(256, 1),
		r(128 + 256 + 128, 1),
		1, 1, 1, r(7, 0), r(9, 1), r(7, 0), r(9, 1), r(210, 0), r(11, 1)
	]),
	bs2a = r(1, [-2, r(7, 0), -2, 0, 0, 0, 3, 0, 0, 3]),
	bs2a1 = r(1, [r(14, 0), -2, -2, r(14, 0), 3, 3]),
	bs2a2 = r(1, [r(3, [0, 0, 12, 7]), 3, 3, 10, 7]),
	bs2b = r(1, [r(8, 3), r(8, 2), r(8, 0), r(8, -2), r(8, -4), r(8, -2), bs2a]),
	bs2b1 = r(1, [
		r(2, [3, 3, 15, 3]),
		r(2, [2, 2, 14, 2]),
		r(2, [0, 0, 12, 0]),
		r(2, [-2, -2, 10, -2]),
		r(2, [-4, -4, 8, -4]),
		r(2, [-2, -2, 10, -2]),
		bs2a
	]),
	bs2 = r(1, [r(16, bs2a), r(4, bs2a1), r(4, bs2a), bs2b, r(4, bs2a2), bs2b1]),
	bs2vel = r(1, [
		r(61, 1), 0, 0, 0,
		r(177, 1), r(15, 0),
		r(7, [r(3, [1, 0, 0, 0]), 1, 0, 1, 0]),
		1, r(15, 0),
		r(125, 1), 0, 0, 0,
		r(125, 1), 0, 0, 0
	]),
	bs2vol = r(1, [r(256, 1), r(128, 1.5), r(128, 1), r(64, [1, 1, .2, 1])]),
	bta = '1hh1sh1hhh',
	btb = '1hs1hh',
	btc = 'sh1hss',
	btd = bta + btb,
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
	btB = j(r(8, bty)) + j(r(6, btz)) + j(r(3, btC + btz)) + btA,
	btE = 's1s1s111',
	btF = 's1s1s112',
	btG = 's111',
	btH = 's1SS',
	btI = 'SSSSSSSS1SSS1S22',
	btJ = j(r(3, [btE + btF])) + j(r(8, btG)) + j(r(4, btH)) + btI + bto,
	bt1 = j(r(1, [r(4, btk), r(2, btl), r(4, btm), r(8, btn), bto])),
	bt2 = btd + bta + btc + btd,
	bt3a = bt2 + btd + bt2 + btf,
	bt3 = bt3a + bt2 + btg + bt2 + bti,
	bt4 = btr + btt + bts + btr + bth,
	bt5 = btv + btp + bts + btv + bte,
	drumPattern = bt1 + bt3 + btB + bt4 + bt4 + bt5 + bt5 + btJ,
	// bt3 = j(sp(drumPattern), '0') + '0', // Half-time
	// Necessary because 'eval' functionality removed:
	// replaces wanted char with '1' and everything else with '0'
	on = (str, wanted) =>
		str.replaceAll(RegExp('[^' + wanted + ']', 'g'), '0').replaceAll(RegExp(wanted, 'g'), '1'),
	hat = on(drumPattern, 'h'),
	sn1 = on(drumPattern, 's'),
	sn2 = on(drumPattern, 'S'),
	0
),

// ----------------- MIXER -----------

L1 = mseq(l1, 11),
L1 = (m(L1 * 16) / 3 + m(L1 * 16.2) / 3 + m(L1 * 15.6) / 3) * .9,
L2 = 16 * mseq(l2, 10),
// m(,.9) sounds better using old Harmonifier, no-m() sounds better using new/wavetable Harmonifier
L3 = m(32 * mseq(l3, 10), .9),
L4 = mseq(l4, 11),
L4 = m(L4 * 16) / 3 + m(L4 * 16.3) / 3 + m(L4 * 15.7) / 3,
B1 = 2 * mseq(bs1, 10),
B2 = mseq(bs2, 10),
L1s = synth(L1 * 2, l1vel, 10, 1.07, 0x71010599),
// L2s = sy(L2 / 2, l2vel, 10, 1.1, 0x0960E550), // Cool hi slapp bass thing
// L2s = sy(L2 | L2 / 2, l2vel, 10, 1.1, 0x96045509),
L2s = synth(L2 / 2, l2vel, 10, 1.1, 0x9634950A), // Piano 2
L3s = synth(L3 * 2, l3vel, 10, 1.1, 0x0071010F),
// L4s = sy(L4 * 2, l4vel, 11, 1.1, 0x30070F36), // Sorta 8bit toy pianoish
L4s = synth(L4 * 2, l4vel, 11, 1.5, 0x30070F26), // Sorta vocal
// max(0x58, L4s)
B2s = synth(B2, bs2vel, 10, 1, 0x22032599, 512 * t2 / t | 0),
L3s *= seq(l3vol, 15),
L3s *= .4, // I using the version of Harmonifier that uses a wavetable
L4s *= seq(l4vol, 17),
L1v = lim(reverb(L1s / 4, 3e3, 1.5, .5, .5, 1), .001),
L2v = lim(reverb(L2s / 4, 18e3, 1, .4, .9, 1), .01),
B1a = m(m(B1, .5) ^ (sinify(B1) / 16) ** 2, .5),
B1a *= seq(bs1vol, 10),
B2s *= seq(bs2vol, 10) + seq(bs1vol, 10) / 8,
B2a = min(sinify(B2), lp(beat(bs2vel, 10, 1, 2e4), .7)),
B2b = m(B2a * 1.4 + ds(B2a, 8) / 3),
B2b *= seq(bs2vol, 10),
B2c = sinify(B2) * lp(beat(bs2vel, 10, 1, 4e4) / 257, .001),
B2d = m(B2c / 4 + ds(B2c, 4) / 2),
DR = beat(drumPattern, 10, 2e5),
// Necessary because 'eval' functionality removed:
DR += beat([h], 10, 2e5) * seq(hat, 10),
DR += beat([s], 10, 2e5) * seq(sn1, 10),
DR += beat([S], 10, 2e5) * seq(sn2, 10),
leads = pan => pan ? L1s / 2 : L2s * .7,
lverb = pan => pan ? L2v * .4 : L2v / 4 + L1v / 4,
schain = pan => (hp(B1a, pan ? .1 : .082) * .4 + lverb(pan) * .3) +
	B2b / 4.5 + B2d / 5.5 + L3s / 2 + L4s / 11 + B2s / 14,

Master = pan => lim(.3 * schain(pan) + lp(DR, 1) * .3, .1) * .15 +
	DR * .1 + lp(DR, 2) * .3 + leads(pan) / 8 + B2d / 4 + L3s / 4,
[min(255, Master(0) * 1.4), min(255, Master(1) * 1.4)];

// Loudness war version:
// [Master(0) + 0.28 * lim( Master(0), .01) , Master(1) + 0.28 * lim( Master(1), .01) ];
