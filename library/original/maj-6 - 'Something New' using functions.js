beat=t>>13, // beat counter
bar=beat>>3,

tuning=.08, // adjust base frequency of scale
r=n=>(1<<n/7)*1.0594**(2*n%14-(n%7>3)),

// I've worked out the following formulas for differently tempered diatonic scales:

// just:        r=n=>(1<<n/7)*[1,9/8,5/4,4/3,3/2,5/3,15/8][n%7],
// pythagorean: r=n=>(1<<11-3*(n%7+1)%11+n/7)/3**(6-2*(n+4)%7),
// equal:       r=n=>(1<<n/7)*1.0594**(2*n%14-(n%7>3)),

// triangle wave using equal temperament formula. vp, vf = vibrato period, amplitude
// the "n+4" here is because my original pythagorean formula gives a lydian mode 
// while the equal and just formulas give a classic diatonic scale.

tri=(n,vp=600,va=5)=>abs(tuning*r(n+4)*(t+va*sin(t/vp))%64-32),

// four parallel thirds
chord=n=>tri(n)+tri(n+2)+tri(n+4)+tri(n+6),

//melody
m=(beat^bar+3)%12+14,

root=17-bar%4,

+tri(m,450,2)
+.3*chord(root)
+.5*tri(root-14)