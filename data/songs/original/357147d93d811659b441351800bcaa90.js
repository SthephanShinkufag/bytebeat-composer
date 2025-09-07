//by hcdphobe
slow=false //set this to true for slow BPM
const BPM=slow?125:165
let A=B=C=D=0,/*_A=Array(N=12288).fill(0) this reverb is impossible to make in funcbeat in my case*/
note=(a=0,b=0)=>{
	return (x,d)=>{
		return (a+=b+=(440*2**(x/12)-b)/20)/d
	}
}
const _a=note()
const _b=note()
return (t,s)=>{
	const b=t*BPM/60
	const e=60/BPM
	const KICK=sin(cbrt(t%e)*192)
	const HAT=(random()-.5+(t*2.08333333333*2**15&1?.25:-.25)/1.5)/exp(t%(e/2))**64*(b*2&1)
	const CLAP=(A+=B+=(random()-.5-A-B*3)/9)*(1/exp(t%(e))**36*3%1)*8*(b&1)
	const g=_a([6,6,6,6,2,2,2,1][b>>1&7],s)*PI/8
	const r=_b([-6,1,6,-6,1,6,-6,1,6,-6,1,9,8,9,4,-1,-10,-3,2,-10,-3,2,-10,-3,2,-10,-3,2,-11,-4,1,4][b*2&31],s)*PI
	const BAS=(sin(g)**256-sin(g+.1)**256)*4*(C+=(cbrt(b%1)**4-C)/8)
	const MEL=sin(r+cos(r+2*2+sin(r)))*(D+=((1/exp(b%.5)**4)-D)/8)
	return (KICK+HAT+CLAP+BAS+MEL)/4
}