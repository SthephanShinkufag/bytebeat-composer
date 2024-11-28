T = t/1.3,

t ? 0 : (
	fx = Array(3e6).fill(0) // this array stores memory for the effects
),

t -= t%(2**(T>>14&3)*4), // downsample effect, "(2**(T>>14&3)*4)" is the strength of the effect

fxi = 0, // iterates over the fx array
// inp - input
lp = (inp,w) => { // lowpass function (w - strength of effect (0 is the minimum value))
	if (w == 0) return inp
	out = inp + fx[fxi] // remove the "%256" if you are using floatbeat
	fx[fxi] = out / (1+1/w)
	fxi++
	return fx[fxi-1] / w
},
m = n => 440/375*(2**(n/12)),
x = (n) => (
	tan(cos(lp(T%16384/16384*3,500)*sin(t*m(n)*PI/128)))/2
),

kick = tanh(sin(15*sqrt(T%16384)**.5))*(1-T%16384/16384)**5*2*(~T>>14&1),
hihat = (random()-.5)*(1-T%8192/8192)**4/1.5,
snare = tanh(sin(sqrt(T%16384+random()*45)*2))*(1-T%16384/16384)**5*(T>>14&1)*2,

((x((z=[5,3,2,0][T>>16&3]-12)-24)+x(z)+x(z+3)+x(z+7)+x(z+10))/6+lp(t*m(z-12)%256/256-.5,70/(T%16384/8192))) * min(1,T%16384/8192)
+ (kick+hihat+snare)/2