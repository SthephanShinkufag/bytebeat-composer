t || (S=[44,,48,,39,,,35,,39,,30,,,26,,30,,17,,,13,,17,,-5], S2=[-22,13,22,13,0,13,22,-9-22,13,22,13,-9,13,22], P = 0, L=28, N=[], tm=0, i=0, DL=Array(DC=8).fill().map((_,i) => Array(round(4000*1.25**i)).fill(0))),

tm || (tm = 13e3, N = N.filter(x => x[0] < 2e5), S[i%28] == undefined || N.push([0, S[i%28] + [0, -3, 0, -9][i/56&3], 1]), S2[i%14]==undefined || N.push([0, S2[i%14] + [0, -3, 0, -9][i/56&3] - 22, 0]), i++),

s = N.length ? N.map(x => (p = 2*PI*x[0]/48e3*2**(x[1]/22)*333, o = sin(p + x[2]*sin(p)*sin(t + sin(t/1e5)*3e4)**2)*(.85+.1*(x[2]|(x[1]<-21)))**(x[0]/1e3)*sin(PI/2*min(x[0]/128,1))/20*1.5**(x[2]+x[1]<-21), x[0]++, o)).reduce((a, b) => a + b) : 0,
P += (s - P)*.2,

dd = [0, 0],

DL.forEach((_, c) => {
	let pos = t + 100*sin(2*PI*t/48e3/2**(c/DC))**2;
	dd[c&1] += DL[c][floor(pos) % DL[c].length]*(1-pos%1) + DL[c][floor(pos+1) % DL[c].length]*(pos%1)
}),

DL.forEach((_, c) => {
	DL[c][t % DL[c].length] = (P + dd[c&1]/DC)*1.9;
}),

tm--,

dd