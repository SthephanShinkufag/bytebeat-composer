t || (nt = _ => 2e3*16**(random()**.4)|0, tm = 0, S = [0.25, 0.5, 1, 3/2, 2, 9/4, 5/2, 8/3, 4], N = [], z = 1, DL = Array(DC=32).fill().map((_,i)=>Array(round(1e4*12**(i/DC))).fill(0)), l = [0, 0]),

tm || (
	N = N.filter(x => x[0] < 3e5),
	tm = nt(),
	random() >= 0.05 || (z = [2/3, 3/4, 8/9, 1, 9/8, 4/3, 3/2][random()*7|0]||1),
	N.push([0, z*(S[random()*9|0]||1)])
),

i = N.length ? N.map(x => (p = 2*PI*x[0]/48e3*200*x[1], p += sin(x[0]*x[1]/2e4)*6, o = sin(p + sin(p + sin(p*2)*.8**(x[0]/1e3) + sin(p))/6)*.95**(x[0]/1.5e3/x[1]**.5)*sin(PI/2*min(x[0]/1e4,1))**2/3, x[0]++, o)).reduce((a, b) => a + b)*sin(PI/2*min(t/1e6,1))**2 : 0,
tm--,

dd = [0, 0],

DL.map((x,c)=>{
let ps = t + 60*sin(2*PI*t/24e3/1.5**(c/DC))**2;
let ds = x[floor(ps)%x.length]*(1-ps%1) + x[floor(ps+1)%x.length]*(ps%1);
dd[c%2]+=ds;
dd[1-c%2]+=ds/2;
}),

DL.map((x,c)=>{
x[t%x.length]=(i+dd[c%2])/DC*1.99/1.5;
}),

dd.map((x,c) => (o = i/3 + x, l[c] += (o - l[c])*.001, o - l[c]))