A = 432, // Hz
// t /= 1.5,
// uncomment the line above to hear a slowed down version
s = (o,n) => max(-1,min(1,3*sin(PI*o/24e3*A*(2**(1/12))**(n-6))))/4*(1-o%8192/8192),
w = (o,n) => asin(sin(PI*o/24e3*A*(2**(1/12))**(n-6)))/4,
S = (o,n) => (A*(2**(1/12))**(n-6)*t/48e3%1)*(2-o%8192/4096)/3-.25,
q = (o,n) => floor(sin(o/7e3)*.25+sin(PI*o/24e3*A*(2**(1/12))**(n-6))/2)/2+.25,

r = repeat = (x, y) => Array(x).fill(y).flat(9),
t?(0):(fx=r(3e6,0)),
fxi=0,

lp = (x, f) => (
	x = min(max(x, fx[fxi] - f), fx[fxi] + f),
	fx[fxi] = x,
	fxi++,
	x
),

lim = (f) => {
	return max(min(f,1),-1)
},

h = (o=t) => {
	melody = o<0?0:s(o,[0,7,12,0,7,12,0,7,12,0,7,15,14,15,10,5,-4,3,8,-4,3,8,-4,3,8,-4,3,8,-5,2,7,10][(o>>13)%32])
	melody2 = o<0?0:s(o,[0,7,12,0,7,12,0,7,12,0,7,15,14,15,10,5,-4,3,8,-4,3,8,-4,3,8,3,7,8,10,7,2,-5][(o>>13)%32])
	melody3 = o<0?0:S(o,[0,7,12,0,7,12,0,7,12,0,7,15,14,15,10,5,-4,3,8,-4,3,8,-4,3,8,-4,3,8,-5,2,7,10][(o>>13)%32])
	bass = floor(t/8192)<64?0:w(o,[0,0,0,0,-4,-4,-4,-5].map(x=>x-24)[(o>>15)%8])
	bass2 = q(o,[0,0,0,0,-4,-4,-4,-5].map(x=>x-24)[(o>>15)%8])
	return floor(t/8192)>191?bass2+melody3:(floor(t/8192)>160?melody2:melody)+(floor(t/8192)<187?bass:0)
},
kick = (t%8192>159?sin(sqrt(t%8192)):sin(2e3/(t%8192)))*'10000100'.charAt(t>>13&7)/(t%8192/900),
snare = (t%8192>159?sin(5*cbrt(t%8192))+random()*min(1,1-((159+t%8192)/8192)):sin(2e3/(t%8192)))*'00100010'.charAt(t>>13&7)/min(2,(t%8192/1100)),
hihat = random()/(1.5+(t%8192/1000)),
riser = random()*(t%32768/131072),
drums = (floor(t/8192)>191)?lim(kick+snare+hihat):(floor(t/32768)==47)?riser:0,

f = (w=1,o=t) => lp(h(o),w),
o = min(1,t/2**24),

sidechain = ((floor(t/8192)>191)?('10100110'.charAt(t>>13&7)==1?(t%8192/8192):1):1),
left = (f(o)+f(o,t-24576)/2+f(o,t-49152)/5)*sidechain+drums,
right = (f(o)+f(o,t-12288)/3+f(o,t-36864)/4)*sidechain+drums,
[left,right]