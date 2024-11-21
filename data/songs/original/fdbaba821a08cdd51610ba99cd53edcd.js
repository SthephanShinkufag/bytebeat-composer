q=t/32e3,r=1.05946309,a=880,as=a*r,b=as*r,c=b*r,cs=c*r,d=cs*r,ds=d*r,e=ds*r,f=e*r,fs=f*r,g=fs*r,gs=g*r,
//Coded and Composed by Bp103

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
][(int(q*1)%8)  *3+ (int(q*32)%3) ]),

tr=((int(q*4)%128)<64)?0:1,
nb=(q*[
//arp chords
a<<(tr),c         ,e<<(tr),c<<(tr<<1),
a<<(tr),d<<(tr<<1),f<<(tr),d         ,
a<<(tr),c         ,f<<(tr),a<<(tr<<1),
c<<(tr),e<<(tr<<1),g<<(tr),e         ,
g<<(tr),b         ,d<<(tr),b         , //phrase 2
f<<(tr),a<<(tr<<1),c<<(tr),a<<(tr<<1),
a<<(tr),c         ,g<<(tr),c         ,
g<<(tr),b<<(tr<<1),d<<(tr),b<<(tr<<1),

][int((q*4)%32)])/2,

nc=(q*[
//Lead
a,b,c,e ,c,b,a,0]
[int(q*4)%8]),

nd=q*([
//BASS
a,a<<1,a,0,a,0,a,0, g>>1,g,g>>1,0,e>>1,0,c>>1,c 
][int(q*4)%16])/4,

//kick = tan(sin( (q* ((0.4/((q*4)%2)))/200)) ) * (32- (((q*32)%32)) )/1.5,
kick=((q*(512 >> (q*64)))%2)<<6,
snare=((q*4)&3)>1? (q*(8e3>>q*64)%2<<5<<(((q*2e5)>>5*(q*2e5))<<(q*64)))&127:0,
hihat=((q*64)%8)<1?((q*7040)%2)<<4:0,

//output channels

//kick+
((kick+snare+hihat)/2)+
(((sin(nc*1)*3) * (sin(nc*4.0)*4) * (sin(nc*1.02)*2))/2) + 
((tan(sin(nd/2)*tan(cos(nd*1.5)*1.03))+4)*3) +
((sin(na*4)<cos(q*6))*4.5) +
((tan(sin(nb*2.00)*1.5)/2.39) * (sin(nb*3.00)*3) * (cos(nb*1.013)*2)/2) +96;