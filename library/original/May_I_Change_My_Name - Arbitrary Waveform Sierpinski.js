T=t=>asin(sin(t*PI/128))*1.7/PI,
Q=t=>(t&128)/128-.5,
S=t=>sin(t*PI/128)*.68,
W=t=>(t&255)/256-.5,

V=[Q,T,W,S][t>>16&3],
G=(t,m)=>{
	let out = 0;
	for (let i=0; i<8; ++i)
		if (m>>(7-i)&1)
			out += V(t*(1<<i))/(1<<i);
	return out;
},

G(t,t>>8)