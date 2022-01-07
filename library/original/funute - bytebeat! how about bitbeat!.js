S=1.059463094,
P=Math.pow,

X=[
	function(t) { return t<1e3&&(Math.sin(t*t)*1e8%2|0?1:3) },
	function(k,n,t) { return l=4410/44/P(S,n),t%l>(l/2-t*l*k)?1:3 },
	function(f,a,s,n,t) { return m=t%5292/882|0,k=m%3,z=(a&(0xf00>>(4*k)))>>(8-4*k),(!s||m%2)&&f(n+z,t) },
],

Y=[
	function(t) { return t<1e3&&(k=299/(t+1),k-(k|0)>.5?1:3) },
	0,
	X[0],
	X[2].bind(this,X[1].bind(this,7e-5)),
	function(t,f) { return t<2400&&(p=P(t+1,.8),t<200||t>900?X[0](p):(p/27|0)%2?1:3) },
],
Z=[
	function() { return 0 },
	function(s,n,t) { return l=4410/44/P(S,n),k=(t%(l*8)/l)|0,(!s||t/882%3|0)&&(((k==1)^!!(k&2))?1:3) },
	Y[3].bind(this,89),
	Y[3].bind(this,71),
],
A=t%6800,
B=t/6800|0,
C=B%320,
M=parseInt('68a68f00dba0ab0068a68f0hf0fdbdb080868bb0000068b080868d0bdbdf0d0068a68f00dba0ab0068a68f0hf0fdbdb080868bb0000068b080868d0bdbdfdfg0d0dbdg000000bdgdgi0gik0ikigdb86080680400000068b8bd00bdg6600g0dg0d0dbdg000000bdgdgi0gik0ikigdbdg0i0gi0d000000bdg0d0gdbd0gdb8641'[C-66]||0,36),
96+16*
(
	Y[B&3?2:B&4](A)||
	Z['1120320312032011'[B%16]](M,'24222222422222420022222222222202'[B%32]-2+5*(C>191)||0,A)||
	(M?X[1](0,M-6,t):1)
)