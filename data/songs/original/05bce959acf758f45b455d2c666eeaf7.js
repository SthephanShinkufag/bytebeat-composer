const BPM=125
let A=B=Q=0 //setup that for kick, hats and clap
tc808=(a,b,c)=>{
	const g=c[4*b%c.length|0]
	r=(c)=>a*440*2**((c+4)/12)%1-.5
	return (r(g)+r(g+7))/exp(b%.25)**14*(g!=-9e9)
}
return W=>{
	const T=W*BPM/60
	const N=-9e9
	const C=(A+=B+=(random()-.5-A*1-B*2)/8)*(1/exp((T+1)%2)**20*12%3)
	const V=atan(sin(cbrt(T%1)*128)/2)/1
	const R=(random()-.5)/exp(T%.25)**99/2+(random()-.5+T*2**15&1?-.25:.25)/exp((T+.5)%1)**32
	const Y=tc808(W,T,[N,N,0,N,N,N,0,N,N,N,0,N,N,N,3,1])
	return V+C+R+Y
}