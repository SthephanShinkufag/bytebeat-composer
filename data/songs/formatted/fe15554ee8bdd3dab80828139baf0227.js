t || (p = 0, a = 0, l = 13e3, ns = 0, nsp = 0, nsf=8),

(t % nsf) || (nsp = ns, ns = 2*random() - 1),
nsq = (1 - cos(t%nsf/nsf*PI))/2,

((t % 65e2) || ("10000000".repeat(3) + "10010010")[floor(t/65e2) % 32] == "0") || (p = a = 0),

kenv = cos(PI*min(a/l, 1)),

out = min(max(
	atan(sin(2*PI*p/48e3)*(kenv + 1)*5/4)
	+ 1.25*(nsq*ns + (1 - nsq)*nsp)*max(((1 - t/26e3) % 2 + 2) % 2 - 1, 0)**3,
-1), 1),

p += 400*2**(-5.5*sqrt(a/l)),

bp = [100, 100, 79, 89][floor(t/208e3) % 4],

harm = [1, 1.5, [2, 2, 1.8, 1.6, 1.5, 1.5, 1.333, 2.25][floor(t/104e3) % 8]],
harm = harm.concat(harm.map(n => n*2)),

mus = p => tanh(
	250/bp*
		sin(bp*PI*t/48e3
			+ 0.7*sin((bp+.5)*PI*(t + p*100)/48e3
				+ 2.3*sin((bp+.5)*PI*(t - p*100)/48e3
					+ 6*sin((bp-.5)*PI*t/48e3)
				)
			)
		)

	+ min(t%26e3/13e3, 1)*harm.map(n =>
		1/1.25**n*sin(n*400*PI*t/48e3 + 3*sin(n*402*PI*t/48e3))
	).reduce((a, b) => a+b)
),

sc = (1 - abs(out))*(1 - kenv*min(a/64, 1))/2,
a++,

[out + sc*mus(0), out + sc*mus(1)]