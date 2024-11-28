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

BBtFB = (x) => x%256/128-1, // bytebeat to floatbeat
X = lp(BBtFB((o=t/6)*((o&4096?o%65536<59392?7:o&7:16)+(1&o>>14))>>(3&-o>>(o&2048?2:10))),o>>15>1?0:100/(t/1e4))/2,
kick = isNaN(q=cbrt(sin((o%4096)**.55))*(1-o%4096/4096)**5)?0:q/1.5,
hat = ((q=random()-.5)-lp(q,5))*(1-o%2048/2048)**5/2,
snare =
(cbrt(sin(((O=o*8)%16384)**(1/1.7)/1.8))/max(1,O%16384/500)*max(0,1-O%16384/8192)
+ cbrt((h=random())-lp(h,500/(O%16384/16384))+lp(h,O%16384/1638))*2/max(1,O%16384/1000))/3*((O>>14&3)==2),
riser = ((q=random()-.5)-lp(q,5))*(o%16384/16384)/3,
bas = BBtFB(o/4*((o&4096?7:16)+(1&o>>14))/(o&4096?1:2))/2*(1-o%4096/4096),

j = (X+(o>>14>15?bas:0))*min(1,(q=o>>16>1&&(o>>14<15||o>>14>15))?o%4096/2048:1),
(
(q?kick+hat+(o>>14>15?snare:0):0) +
(o>>14<15||o>>14>15?j:j-lp(j,5)+riser)
) / 1.5