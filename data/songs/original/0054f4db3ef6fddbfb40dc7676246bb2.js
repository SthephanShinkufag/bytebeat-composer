q=t/32e3,r=1.05946309,a=880,as=a*r,b=as*r,c=b*r,cs=c*r,d=cs*r,ds=d*r,e=ds*r,f=e*r,fs=f*r,g=fs*r,gs=g*r,

na=(q*[
//arp chords
a,c,e,
a,d,f,
a,c,f,
c,e,g,

g,b,d,
f,a,c,
a,c,g,
g,b,d,

][(int(q*1)%8)  *3+ (int(q*32)%3) ])%2,
nb=(q*[
//lead

a,b,c,e ,c,b,a,0
][int(q*4)%8]%2),

nc=(q*([
//BASS

a,a<<1,a,0,a,0,a,0, g>>1,g,g>>1,0,e>>1,0,c>>1,c 
][int(q*4)%16]>>2)%4),

kick=((q*(512 >> (q*64)))%2)<<6,
snare=((q*4)&3)>1?q*(8e3>>q*64)%2<<5<<((sin((q*2e5)>>5)*(q*2e5))<<(q*64)):0,
hihat=((q*64)%8)<1?((q*7040)%2)<<4:0,

//output channels
  (na<<4) 
+ (nb<<4) 
+ (nc<<4) 
+ kick + snare + hihat;