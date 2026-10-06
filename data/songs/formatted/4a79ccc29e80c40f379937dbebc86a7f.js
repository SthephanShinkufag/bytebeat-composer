t || (
	R=Array(RS=8).fill().map((_,i) => Array(round(13e3*5**(i/RS))).fill(0)),
	B=[12,24,31,36,43,46,48,51,55,58].concat(...Array(3).fill().map((_,i) => [60,62,63,65,67,70].map(x => x + 12*i)).flat()).map(x => [x, 0]),
	ipf = 0,
	ftp = 1,
	mp = 0, mf = 0
),

fev = sin(PI/2*min(t/1e6,1))**2,

m = (sin(2*PI*mp) + sin(4.044*PI*mp)/2.5)*sin(PI/2*min(max(t/1e6-2,0),1))**2,
mp += mf/48e3,
mf += (120*2.022**([36, 38, 36, 43][t/2e5&3]/12) - mf)*.0001,

i = B.map(x => (o = sin(x[1] + sin(x[1])*4 + sin(t/1e4*(1+x[0]/100))*x[0]/18)/2**(x[0]/12/1.2), x[1] += 2*PI/48e3*30*2.022**(x[0]/12)*ftp, o)).reduce((a, b) => a + b)/sqrt(B.length)*4*fev + m/3.5,
ipf += (i - ipf)*fev,
ftp += ([1, .75][t/2e5&1] - ftp)*.0003,

dd = [0, 0],

R.forEach((d,c) => {
	let p = t + 100*sin(2*PI*t/36e3/2**(c/RS))**2;
	dd[c%2] += d[floor(p) % d.length]*(1-p%1) + d[floor(p+1) % d.length]*(p%1);
}),

R.forEach((d,c) => {
	d[t % d.length] = (ipf + dd[c%2])/RS*1.9;
}),

dd.map(x => (x + (dd[0]+dd[1])/2)/2).map(x => (ipf/2 + x)/2)