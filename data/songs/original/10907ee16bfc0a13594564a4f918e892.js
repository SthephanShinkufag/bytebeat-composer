// "t ? " statement
t ? (T = t * s,
	E = t * s / 15 * BPM, // speed variable
	E ||= 0,
	p = t * 1.23 / (slow ? 1.5 : 1), // pitch variable
	stmel = det => (
		vib = slow ? 2e3 : 1e3,
		p1 = p + (13 * sin(t / vib) + 16),
		pi = x => (p1 * (slow ? 2 : 1)) * 2 ** (x / 12),
		mel = pi(parseInt(arrs.mel[15 & (21 & (E >> 1)) 
		+ (E >> 3)], 36) + det),
		pow2 = slow ? 256 : 64,
		mel = sign(sin(mel / 128 * PI) + 
		sin(mel / pow2 * PI)) / 4,
		r[t % 1e4] = .97 * (mel + (R(t) + R(t + 2192) + 
		R(t + 2828)) * .25),
		1.2 * R(t)
	), // arpeg
	mel = [stmel(0), stmel(.2)],
	stch = det => (
		ch = x => (x = ((x = 2 ** (x / 12), p1 / 2 * x 
		% 254.4 + (p1 + 128) / 2 * x % 255.6 + p1 / 2 * 
		x % 257 + p1 / 2 * x % 256.3) / 128 - 4), c1 += 
		.1 * (x - c1)) / 6,
		o = (ch(parseInt(arrs.ch[0][3 & E >> 5], 36)) +
		ch(parseInt(arrs.ch[1][3 & E >> 5], 36)) +
		ch(parseInt(arrs.ch[2][3 & E >> 5], 36))) / 
		[2, 1, 1, 1][3 & E >> 5],
		o = o * ((E / 4 % 1) ** .5),
		r1[t % 1e4] = .98 * (o + (R1(t) + R1(t + 2192) 
		+ R1(t + 2828)) * .2),
		R1(t) * 1.25
	), // cohrd
	ch = [stch(0), stch(.2)],
	bas = (
		pi = x => p / (slow ? 4 : 8) * 2 ** (x / 12),
		o = pi(parseInt(arrs.bass[3 & E >> 5], 36)),
		i = (atan(tan(o / 256 * PI))) / (slow ? 2 : 
		1.3),
		f = (1 - E / 2 % 1) * .1,
		// dollar store ADSR
		z = .4 + .4 / (1 - f),
		b1 += b2 += f * ((i - b1 + z * (b2 - b3)) - b2 
		* 6), b3 += f * (b1 - b3),
		b3 * 2
	), // bass
	n = D, D = 1 - (2 * E & 1),
	n = U, U = '0010'[3 & E >> 1], U - n > 0 ? 
	A = a = 0 : A += s,
	n = V, V = '1000'[3 & E >> 1], V - n > 0 ? B = 0 :
	B += s,
	n = I, I = '0101'[3 & E >> 1], I - n > 0 ? C = 0 :
	C += s,
	n = 2e3 * env(A, 50, 6) + 200 * env(A, 25, 2)
	+ 190,
	a = (a + n * s) % 1,
	n = 3e3 / (1 + B * 1200),
	b = (b + n * s) % 1,
	sn = () => (
		c = 2 * random() - 1,
		f = .2,
		q = .5,
		z = q + q / (1 - f),
		x += f * (c - x + x * (x - y)),
		y += f * (x - y),
		clip((c - y) * (env(A, 80, 3) / 3 +
		env(A, 9, 2) * min(A * 15, 1) ** 1.5) * 3.4 +
		sin(2 * a * PI) * env(A, 10, 2) * 2)
	), // snare
	hi = (
		n = 2 * random() - 1,
		f = 6880 * PI * s,
		q = .7,
		h = q + q / (1 - f),
		h1 += f * (n - h1 + h * (h1 - h2)),
		h2 += f * (h1 - h2),
		f = 19e3 * PI * s,
		h3 += f * (n - h3),
		clip((n - h3 + (h1 - h2) * .2) *
		env(C, 15, 4))
	), // hihats
	ki = sin(2 * b * PI) * 1.3 * env(B, 7, .5), 
	// kick
	dr = () => ki + (hi + sn()) * 2, // drums
	dr = [dr(), dr()],
	noi = () => (random() - .5) * .01, // ambient noise
	main = lr => atan(mel[lr] / 1.1 + ch[lr]
	+ clip(bas) / 1.1 + clip(dr[lr])) / 1.2,
	[main(0), main(1)]) :
	(samp = 48e3, // sample rate
	s = 1 / samp,
	slow = false, // slow down song (would recommend)
	BPM = 210 / (slow ? 1.5 : 1), // BPM 
	U = V = I = a = b = b1 = b2 = b3 = c1 = c2 = d = 
	h1 = h2 = h3 = x = y = 0, // variables 1
	A = B = C = D = 4, // variables 2
	clip = x => atan(2 * x) / 1.4, // clip func 1
	env = (a, b, c) => (1 - (a * b < 1 ? a * b : 1))
	** c, // envelope func
	arrs = {
		mel : 'G8F6D4B381B4D8FB',
		ch : ['DFGI', 'DBDF', 'DD9B'],
		bass : 'DD9B'
	}, // instrument arrays
	r = Array(1e4).fill(0), // array 1
	R = i => r[(i + 1e4 | 0) % 1e4],
	r1 = Array(1e4).fill(0), // array 2
	R1 = i => r1[(i + 1e4 | 0) % 1e4])