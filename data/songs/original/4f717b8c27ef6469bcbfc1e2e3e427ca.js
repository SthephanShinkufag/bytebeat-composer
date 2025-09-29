BPM=96,
SampleRate=48e3,
tf=abs(t/SampleRate/180*3*32768*BPM),

t?0:z1=[],
callCount=0,
lpf=lowPassFilter=(a,c)=>(
	call=callCount++,
	z1[call]??=0,
	z1[call]+=(a-z1[call])*c
),
hpf=highPassFilter=(a,c)=>a-lpf(a,c),

// Vibrato
vi=t+sin(t*PI/16384),
vi2=t+sin(t*PI/32768)*80,

// Pitch
p=-1.19,

// Echo Engine
t||(d=Array(D=round(2**21/BPM)).fill(0)),

// Melody & Chords
a=vi*2**(([0,[4,3][tf>>18&1],7,[11,10][tf>>18&1]][tf>>14&3]+p)/12)*2**([0,-1][tf>>18&1]/12),
b=vi2*2**(([0,[4,3][tf>>18&1],7,[11,10][tf>>18&1]][t>>0&3]+p)/12)*2**([0,-1][tf>>18&1]/12),

// Echo Input
c=
// Triangle
+hpf((asin(sin((a|7)*PI/128))/2.5*(1-tf/8192%1)**.1*.1**(10/(tf%16384)))/'14'[tf>>13&1],.009)

// Square 1
+(('1000'[a>>6&3]-.5)/'28'[tf>>13&1])*(1-tf/8192%1)**.1*.1**(10/(tf%16384))/1.5

// Square 2
+('1000'[b>>5&3]-.25)/2.5*abs(sin(tf*PI/2**18))

// Noise
+(random()-.5)/5*abs(asin(sin(tf*PI/2**19)))

// Echo Output
,m=c+d[t%D],d[t%D]=m/2,m/1.1