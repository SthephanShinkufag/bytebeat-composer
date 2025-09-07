// original; signed bytebeat mode, 54612Hz. runs best on dollchan.net/bytebeat

/* 
	╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏┓
	╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏┛┗┓
	┏━━┳┓┏┳━┓┏━━┳━┻┓┏┛
	┃━━┫┃┃┃┏┓┫━━┫┃━┫┃
	┣━━┃┗┛┃┃┃┣━━┃┃━┫┗┓
	┗━━┻━━┻┛┗┻━━┻━━┻━┛
*/

// you sit in silence on the warm beach, with the glorious knowledge that you finally have solitude...

// entry for summer chip xv on battle of the bits

// wanted to start strong, this sounds pretty good to me lmao

// for contest + entry information visit battleofthebits.com/arena/Battle/10329

// enjoy

// --------------------

floatbeat = false, // set to true or 1 if using floatbeat (better sound quality)

amp = floatbeat ? 1 : 128,

// infinitely instantiable 1-pole filters - by feeshbread

delayCount = 24576,
t || (delay1 = Array(leftLength = delayCount).fill(0), delay2 = Array(rightLength = delayCount).fill(0), z1 = []),
callCount = 0,
lpf = (a, c) => (
	call = callCount ++,
	z1[call] ??= 0,
	z1[call] += (a - z1[call]) * c
),

hpf = (a, c) => a - lpf(a, c),

bpf = (a, hc, lc) => hpf(lpf(a, lc), hc),

output = (stereo, delayFix, delayLength) => (

n = input => (isNaN(input) ? 0 : input),
count = t >> 20,
s1 = 'AELH  A97AHE  79AELH  H57AHE  ECAELH  A97AHE  79AELH  H57AHE  EC',
s2 = 'AAAAAAA9777777775555555733335555AAAAAAC9777777975555557533335599',
s3 = 'AHEMMLLMJJJHHHJJEEEFFFHH57AEEEEEEAELHMLMOMLMOLMLMMLLLLH57AHEHEEH',
f1 = '                                                               1',
kf = '                                                              11',
kv = '5 5  55 5 5  2345 5  55 5 5  3 45 5  55 5 5  5745 5  54 3 2 1234',
kv_ = '5   5   5  5  5 ',

a = Math.sqrt(Math.sin((t / (42 + stereo) + Math.sin(t / 1024) / 3) * 2 ** (parseInt(s1[t >> 14 & 63], 36) / 12))) * (t / 1024 % 16 - 32) / 128,

a = n(a) + delayFix[t % delayLength],

b = Math.cbrt(Math.cos((t / (84 + stereo) + Math.sin(t / 1024) / 3) * 2 ** (parseInt(s2[t >> 14 & 63], 36) / 12))) / 16,

b = n(b),

c = lpf(Math.sign(Math.sin((t / (42 + stereo) + Math.cos(t / 1024) / 2) * 2 ** (parseInt(s3[t >> 14 & 63], 36) / 12))) / 12, .25),

c = n(c),

f = bpf((2 * Math.random() & 1) / 30 * (t / 2048 % 4 - 8) * f1[t >> 14 & 63], .1, .4),

hihat = bpf((2 * Math.random() & 1) / 30 * (t / 2048 % 4 - 5), .1, .4),

snare = bpf((2 * Math.random() & 1) / 30 * (t / 512 % 16 - 16) * (t >> 13 & 3 ? 0 : 1) * (t >> 15 & 1 ? 1 : 0), .1, .3),

k = lpf(Math.tan(Math.sin(5 * Math.cbrt(t % 8192))) / 128 * (t / 512 % 16 - 16) * kv[t >> 13 & 63], .05),
kx = lpf(Math.tan(Math.sin(5 * Math.cbrt(t % 4096))) / 48 * (t / 512 % 8 - 8) * kv_[t >> 12 & 15], .05),

noiseSwell = bpf(Math.random() - Math.random(), (t / 1048576 % 1), (t / 1048576 % 1)) * (t / 1048576 % 1 - 1) / 3,
noiseDown = bpf(Math.random() - Math.random(), (t / 1048576 % 1), .01) * (t / 1048576 % 1 - 1) * 4,
noiseUp = lpf(Math.random() - Math.random(), (t / 524288 % 1)) * (t / 524288 % 1) / 16 * (t >> 19 & 1),

delayFix[t % delayLength] = a / 2,

a_ = lpf(a * (t / 1048576 % 1), (t / 1048576 % 1)),
b_ = lpf(b * (t / 1048576 % 1), (t / 1048576 % 1)),
k_ = k * kf[t >> 14 & 63],
ocean = (lpf(Math.random() - Math.random() * Math.sin(t / 5e4) * Math.cos(t / 2e4) * Math.sin(t / 6e4) - .5, .01) + lpf(Math.random() - Math.random() * Math.sin(t / 5e4) * Math.cos(t / 2e4) * Math.sin(t / 6e4) - .5, (Math.abs(Math.sin(t / 9e4) * Math.cos(t / 7e4) + Math.sin(t / 1e6) / 10) / 10) + .01)) / 5,

sc_1 = (kv[t >> 13 & 63] == 0 ? 1 : (t / 512 % 16) / 16),
sc_2 = (kv_[t >> 12 & 15] == 0 ? 1 : (t / 512 % 8) / 8),

sc = (input, pattern) => input * pattern,

n(
	[
	a_ + ocean * (t / 1048576 % 1 - 1) + noiseUp, 
	a + b_ + f + k_ + noiseDown + noiseUp, 
	sc(a + b + f + noiseDown, sc_1) + snare + k,
	sc(a + b + hihat + f + noiseUp + noiseSwell, sc_1) + snare + k,
	sc(c + b + hihat + noiseDown + noiseSwell, sc_1) + snare + k,
	noiseUp + noiseDown + c + b + hihat + f + k_,
	sc(c + b + hihat + noiseSwell, sc_2) + kx + f,
	sc(c + b + hihat + f + noiseUp, sc_2) + kx + snare + k_ * 2,
	sc(a + c + b + hihat + noiseDown + f, sc_2) + snare + kx + k_ * 2,
	sc(a + c + b + hihat + noiseUp + f, sc_2) + snare + kx + k_,
	sc(a + c + b + hihat + noiseSwell + noiseUp + f, sc_1) + snare + k,
	a + c + b + noiseDown + noiseSwell + noiseUp,
	a + c + noiseDown + noiseSwell,
	- (a + c) * (t / 1048576 % 1 - 1) + ocean * (t / 1048576 % 1),
	ocean * (t / 1048576 % 1 - 1)
	]
		[count]
	)
) * amp, // remove * 128 if playing in floatbeat mode.

	[Math.min(Math.max(output(- .25, delay1, leftLength), - 128), 127), Math.min(Math.max(output(.25, delay2, rightLength), - 128), 127)]