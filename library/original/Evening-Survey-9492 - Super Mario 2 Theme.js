HZ=32000,
BPM=200,
pulse=(BPM/60),
tick=(pulse*HZ)/32,

ntone=-999,
a=0.875,
aa=0.95,
b=1,
c=1.05,
cc=1.1,
d=1.18,
dd=1.25,
e=1.33,
f=1.4,
ff=1.5,
g=1.56,
vol1=(([15][floor((t+1)/(tick/1))%1])/15)*0.5,
type1=([2,2,2,2,2,2,2,2][floor((t+1)/tick)%8])*8,
tone1=([g+g,ntone,c+c,e+e,ntone,g+g,g+g,g+g,c+c,e+e,ntone,g+g,b+b,dd+dd,g+g,b*4,ntone,a*4,a*4,a*4,a*4,a*4,a*4,ntone,g+g,ntone,aa+aa,d+d,ntone,g+g,g+g,g+g,aa+aa,d+d,ntone,g+g,cc+cc,e*2,g+g,b*4,ntone,a*4,a*4,a*4,a*4,a*4,ntone,b*4,c*4,ntone,b*4,c*4,ntone,a*4,a*4,a*4,c*4,b*4,ntone,a*4,g*2,ntone,ff*2,g*2,ntone,e*2,e*2,e*2,c*2,d*2,ntone,e*2,f*2,ntone,e*2,f*2,ntone,b*2,b*2,b*2,e*2,d*2,ntone,c*2,c*2,c*2,c*2,c*2][floor((t+1)/tick)%(48*2)])/(HZ/8000),


vol2=(([15][floor((t+1)/(tick/1))%1])/15)*0.5,
type2=([2,2,2,2,2,2,2,2][floor((t+1)/tick)%8])*8,
tone2=([c+c,ntone,e,g,ntone,c+c,c+c,c+c,e,g,ntone,c+c,dd,g,b+b,dd+dd,ntone,b*2,b*2,b*2,b*2,b*2,b*2,ntone,aa*2,ntone,d,g,ntone,aa*2,aa*2,aa*2,d,g,ntone,aa*2,e,a*2,cc*2,e*2,ntone,cc*2,cc*2,cc*2,cc*2,cc*2,ntone,e*2,a*4,ntone,g*2,a*4,ntone,f*2,f*2,f*2,a*4,g*2,ntone,ff*2,e*2,ntone,dd*2,e*2,ntone,c*2,c*2,c*2,a*2,b*2,ntone,c*2,d*2,ntone,c*2,d*2,ntone,g,g,g,c*2,b*2,ntone,g,g,g,g,g][floor((t+1)/tick)%(48*2)])/(HZ/8000),


vol3=(([15][floor((t+1)/(tick/1))%1])/15)*0.25,
tone3=([c,0,0,g,0,0,c,0,0,g,0,0,b,0,0,g,0,0,b,0,0,g,0,0,aa,0,0,g,0,0,aa,0,0,g,0,0,a,0,0,g,0,0,a,0,0,g,0,0,f/2,0,0,f,0,0,ff/2,0,0,ff,0,0,g/2,0,0,g,0,0,a,0,0,a*2,0,0,d,0,0,f,0,0,g/2,0,0,d,0,0,c,0,0,g/2,0,0,c,0,0,0,0,0][floor((t+1)/(tick))%(48*2)])/(HZ/8000),


vol4=(([0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,15,0,15,0,15,0,15,0,0,15,0,0][floor((t+1)/(tick/2))%48])/15)*0.5,

Pulse1=(((t*tone1)%32<(type1)?(vol1*1):0)-1),

Pulse2=(((t*tone2)%32<(type2)?(vol2*1):0)),

Wave=(((((abs(((((t*tone3)/2)/8)%4)-2))-0))*(vol3*1))+0),

Noise=(Math.random()*vol4),

Pulse1+Pulse2+Wave+Noise