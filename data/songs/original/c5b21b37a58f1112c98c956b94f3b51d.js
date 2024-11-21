t ? 0 : d = 0, // this variable stores "memory" for the lowpass
b = int(t*1.5/16384), // beat
c = (n,x,y) => ( // function that creates the cowbell
	m = 440*(2**(1/12))**n/48e3,
	(x(y(t*4*m%4))+x(y(t*4*1.49*m%4)))/max(2,t*1.5%((b&7)>5?32768:16384)/499)
),
M = [0,0,0,0,-2,-2,-2,-2,-5,-7,-5,-3,-2,-2,-2,-2][b&15], // the melody
lp = (inp,w) => { // lowpass
	if (w == 0) return inp
	out = inp + d
	d = out / (1+1/w)
	return d / w
},
cb = c(M,asin,sin)*1.2, // cowbell
k = min(1,max(-1,tan(sin(sqrt(t*1.5%32768)/2))*(1-t*1.5%32768/32768)*2))/1.3, // kick
h = sin(t**7)/max(1,(t+32768)*1.5%32768/500)*(t*1.5&16384?1:0), // hihat
s = lp(sin((t>>2)**7),3)*(t*1.5&32768?.4:0)/max(.5,(t+65536)*1.5%65536/3000), // snare
b = min(1,max(-1,asin(sin(t*PI*110*(2**(1/12))**(t*1.5&131072?5:0)/48e3))*4))/2.5, // bass
((cb+b)*(t*1.5&16384?1:(t*1.5%32768/16384))+k+h+s)/1.1