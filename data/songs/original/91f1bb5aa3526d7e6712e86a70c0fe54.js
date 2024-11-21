A = 440,

t ? 0 : (
	fx = Array(3e6).fill(0) // this array stores memory for the effects
),

fxi = 0, // iterates over the fx array
// inp - input
lp = (inp,w) => { // lowpass function (w - strength of effect (0 is the minimum value))
	if (w == 0) return inp
	out = inp + fx[fxi] // remove the "%256" if you are using floatbeat
	fx[fxi] = out / (1+1/w)
	fxi++
	return fx[fxi-1] / w
},

s = (n,x=-t>>8&255) => (t/375*A*(2**(1/12))**n&x)/256,
c1 = -[2,4,2,9][t>>17&3],
c2 = [5,0,5,0][t>>17&3],
c3 = [8,7,8,5][t>>17&3],
cho = lp((s(c1)+s(c2)+s(c3))/2*(1-t%16384/16384),(t>>6&255)/9),
bas = s(c1-36,127)*(1-t%16384/2e4)*1.5,
kick = cbrt(sin((t%16384)**(1/5)*15))*(1-t%16384/16384)*((t>>14&3)==0)/1.5,
// why are snares so complicated :((((((
snare =
(cbrt(sin((t%16384)**(1/1.7)/1.8))/max(1,t%16384/500)*max(0,1-t%16384/8192)
+ cbrt((h=random())-lp(h,500/(t%16384/16384))+lp(h,t%16384/1638))*2/max(1,t%16384/1000))/1.5*((t>>14&3)==2),
hat = ((h=random())-lp(h,0.5))*min(1,1/((t+16384)%32768)*800)-.5,
((cho+bas)*min(1,t%32768/16384)*1.5+hat+kick+snare)/2-.3