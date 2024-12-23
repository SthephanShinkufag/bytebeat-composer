[min(max((

Multiplier = 2**(0/12),
BeatsPerMinute=117.19*Multiplier,
SampleRate=32000*Multiplier,
ArraySpeed=abs(t/SampleRate/180*3*32768*BeatsPerMinute),

z=t*2**(([0,12,19,24,26,27,31,36][(ArraySpeed>>14)%8]-22.95)/12),
z2=t*2**(([0,2,3,5][(ArraySpeed>>18)%4]-23)/12),
v=x=>sin(x*PI/255+sin(x*PI/128)),
l=0,t?0:a=Array(n=24576).fill(0),
f=(z,z2,v)=>sin(l++<z?f(z,z2,v)-v:(l=0,v)),
x=a.shift(),
y=64*v(4*z)+0,
y2=64*v(4*z2)+64,
a.push(y/3+y2-2-a[n/2]/4+a[n/4]/3),x+64

),0),255)-128,

min(max((

Multiplier = 2**(1/12),
BeatsPerMinute=117.19*Multiplier,
SampleRate=32000*Multiplier,
ArraySpeed=abs(t/SampleRate/180*3*32768*BeatsPerMinute),

z=t*2**(([0,12,19,24,26,27,31,36][(ArraySpeed>>13)%8]-23.05)/12),
z2=t*2**(([0,2,3,5][(ArraySpeed>>18)%4]-23)/12),
v=x=>sin(x*PI/255+sin(x*PI/128)),
l=0,t?0:a=Array(n=24576).fill(0),
f=(z,z2,v)=>sin(l++<z?f(z,z2,v)-v:(l=0,v)),
x=a.shift(),
y=64*v(4*z)+0,
y2=64*v(4*z2)+64,
a.push(y/3+y2-2-a[n/2]/4+a[n/4]/3),x+64

),0),255)-128

]