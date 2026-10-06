// main functions
seqnote = x => t * 2 ** ((x) / 12),
addharmony3 = (ch1, ch2, ch3) => (ch1 % 85) + (ch2 % 85) + (ch3 % 85),
addharmony = (ch1, ch2) => (ch1 % 127) + (ch2 % 127),
reverse = (x, l, d) => x % 256 * (t & l) / d,
decay = (x, l, d) => x % 256 * (-t & l) / d,

T = t,
t *= r8 = 33/44.1,
//t *= 33/48,
r = repeat = (x, y) => Array( x ).fill( y ).flat( 9 ),
seq=(r,s,t2=t,x=0)=>(i=t2/2**s,J=i|0,L=r.length,x?(k=(i-J)**x,(1-k)*r[J%L]+k*r[(J+1)%L]):r[J%L]),
T ? 0 : F = r( 2e3, 0 ),
I = 0,
ds = (x, amt) => x * (1 - amt) + 127 * ( ( ( x / 127 ) - 1 ) ** 3 + 1 ) * amt,
//TODO: add hipass to limiter and make it abs-based instead of min/max based
lim = limiter = (input, speed = .1, lookahead = 512, wet = 1, thresh = 9, bias = 9, iters = 4, saturate = 0, p = 0) => {
	x = y => I + 2 + ( T + y|0 ) % lookahead;
	F[ x(0) ] = input; //newest in buffer, equivalent to F[ x(lookahead) ]
	o = F[ x(1) ]; //oldest in buffer
	mi = mx = o;
	for( i=1; i <= iters; i++) { //older to newest
		y = p ? ( i / (iters+1) ) ** p : 0;
		z = F[ x( ( i + sin(i)/2 ) * lookahead / iters ) ]; //sin(i) is for hum reduction
		mi = min( mi, z * (1-y) + o * y );
		mx = max( mx, z * (1-y) + o * y );
	}
	mi = F[ I ] = min( mi, F[ I ] + speed );
	mx = F[ I+1 ] = max( mx, F[ I+1 ] - speed * ( bias + 1 ), mi + ( t ? thresh : 255 ) ); //could probably be 99
	I += 2 + lookahead;
	//return ds( ( o - mi ) * 255/(mx-mi), saturate ) * wet + o * (1-wet)
	return ds( ( o - mi ) * 2/(mx-mi) - 1, saturate ) * wet + o * (1-wet) //for floatbeat
},
rv = reverb = ( input, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 3, t2=T) => (
	input = input*dry + wet * seq( F, 0, I + ( t2 % len ) / dsp, 1 ) || 0,
	T % dsp ? 0 : F[ I + ( (T % len) / dsp )|0 ] = input * feedb,
	//F[ I + ( (T % len) / dsp )|0 ] = input * feedb ** (1/dsp), //higher dsp adds dampening
	I += 0|(len / dsp),
	input
),
lp2 = (input, freq) => ( //freq is not the actual frequency, it's a number between 0-1
	F[I] = F[I++] * (1-freq) + freq*input
),
/*
lp = lopass = (x, f) => ( // f ~= frequency, but not 1:1
	// F[I] is the value of the last sample
	// You will need to change the 'x % 256' if you're using signed or floatbeat
	F[I] = min( max( x % 256, F[I] - f), F[I++] + f) // Clamp the change since last sample between (-f, f)
),
*/
hp = (input, freq) => input - lp2(input, freq),
mseq = (...x) => F[I++] += r8 * 2 ** (seq(...x) / 12),

t||(

c1 = [0, 2, 4, 6],
c2 = [5, 7, 9, 11],
c3 = [12, 14, 16, 18],
n1 = [4, 5, 7, 5, 4, 6, 7, 9, 6, 6, 4, 4, 4, 4, 4, 4, 6, 7, 9, 7, 6, 8, 9, 8, 8, 8, 8, 8, 8, 8, 8, 6],
n2 = [7, 9, 12, 9, 7, 9, 11, 14, 11, 9, 7, 7, 7, 9, 7, 11, 9, 11, 14, 11, 9, 11, 13, 16, 13, 13, 13, 13, 13, 13, 13, 13],
glitchdata = "1100101011100000101011001110101011101010111011001010111011101110",
l1 = r(1,[
	r(3,[ 19, 18, 11, 12, 18, 16, 9, 11 ]),
	24, 23, 21, 23, 21, 19, 21, 18
])

),

// notes from channel 1 
ch1 = mseq(c1,16,t,64)/2,
ch2 = mseq(c2,16,t,32)/2,
ch3 = mseq(c3,16,t,16)/2,
channel1 = reverse(addharmony3(ch1, ch2, ch3), 16383, 2e4),

//notes from main melody
nt1 = mseq(n1,13),
nt2 = mseq(n2,13),
rt1 = mseq([
				4, 6, 4, 4, //first part
            6, 7, 9, t&2**18?10:8 //second part
            ],15,t,16
),
rt2 = mseq([
            7, 9, 7, 11, //first part
            9, 11, 13, 15 //second part
            ],15,t,16
),

mainmelody1 = decay(addharmony(nt1, nt2), t & 131072 ? t & 65536 ? 65535 : 8191 : 8191, [1e4, 1e4, 1e4, 15e4][(t >> 16) % 4]),
mainmelody2 = reverse(addharmony(rt1, rt2), 16383, 16384),

//drums and others intruments parts
drum = ((5e6 / (t & 16383)) & 64) / 2 + random() * ((t&2**20?0:8192) - t & 16383) / 2e2,
glitch = random() * t * glitchdata[(t >> 11) % 32],
kick = (sqrt(2e3 * (t & [16383, 0][(t >> 13) % 2])) & 128) * (1 - (t/8192 % 1)),
//kick = (sqrt(700 * (t & [16383, 0][(t >> 13) % 2])) & 64),
bass1 = ch1/8 & 63,
bass2 = ch1/4 & 64,
//lead1 = sin(PI*mseq(l1,12,t)/16)*(t&512)/32,
lead1 = lp2(sin(PI*t*2**(l1[((t>>16)*3+(21&t>>13))%32]/12)/16)*(t&512)/28,.3),
//lead1 *= seq(glitchdata,11),
lead1 *= glitchdata[t>>12&31],
rot = (ch,spd=8192) => sin(t/spd+ch*PI),


sequence_song = ch =>
((t / 2**19) - 3) % 4 < 3 ?
t < 1838100 ?
t < 1572780 ?
t < 1440737 ? 
t < 1048521 ? 
t < 524700 ? 
//(min(76+(t>>14),rv(channel1,600 + (t&4096==ch?0:t>>13)))) : 
(lp2(rv(channel1,1650,.9,.35,.9,3,T-rot(ch,9e3-t>>11)),max(t/1e6,1-t/7e4))) :
(lp2(rv(channel1 + mainmelody1/1.2,1650,.9,t/15e5-.1,1.3-t/1e6,3,T-rot(ch,9e3-t>>11)),t/1e6)) :
(channel1 + mainmelody1 / 1.2) / 1.2 + rv(drum,1650,.8,t/3e5-4) + bass1 :
(channel1 + mainmelody1 / 1.2) : 
(channel1 + (mainmelody2 / 1.2)) / 2 + rv(glitch & 32,1650,.8,t/3e5-5,6-t/3e5) + kick + (ch?bass1:bass2/2) :
//(channel1 + (mainmelody2 / 1.2)) / 2 + lp((glitch & 32),rot(ch)*8+8) + kick + drum + (ch?bass1:bass2),
(channel1 + (mainmelody2 / 1.2)) / 2 +
	lp2((glitch & 32),rot(ch)/8+.3)*2 + kick + drum + (ch?bass1:bass2) +
	lead1 * (1.3 - 17e5 / t) :
rv(lead1,16500,.8,.4,1,30) * 3,


sng = ch => lim(hp(sequence_song(ch),.001),min(rot(ch)/4+.25,t/1e7),400,1,128 + 255 * (1 - 5e-7)**t),

[sng(0), sng(1)]