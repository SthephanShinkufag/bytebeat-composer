// setup the lp+hp arrays and the echo arrays
// you can configure the delay decay here            v
t||(hp=lp=[0,0],ech1=ech2=Array(ez=12288).fill(0),DELAY_DECAY=1.5),

// the chords and all that stuff.
s=17,p=[1.042*t,1.043*t],w=t>>9&31,v=_=>p[_]*[.502,.4,.3,.448][3&t>>s],v2=_=>p[_]*[.75,.6,.452,.67][3&t>>s],v3=_=>p[_]*[.896,.796,.75,.896][3&t>>s],v4=_=>p[_]*[1.126,.896,.896,1.126][3&t>>s],

// the chords themselves
ch=_=>Array(2).fill(0).map((__,i)=>((v(i)/2&w)+(v2(i)/2&w)+(v3(i)/2&w)+(v4(i)/2&w))*min(32-t/512%32,1))[_],

// bass
b=sin((y=v(0)*PI/256*(1+(t>>13&1)))+sin(y)*2*(1-t/8192%1)),

// lp+hp
lp=lp.map((_,i)=>ch(i)*.01+lp[i]*.99),
hp=hp.map((_,i)=>(lp[i]-ch(i))/64),

// the two chord arrays
chout1=ech1[t%ez]=hp[0]+ech1[t%ez]/DELAY_DECAY,
chout2=ech2[t%ez]=hp[1]+ech2[t%ez]/DELAY_DECAY,

// drums
k=_=>tanh(sin(cbrt(t%16384)**.1*512+(random()-.5)*(kenv=(1-t/16384%1))**50)*2)*kenv**7,
h=(random()*2-1)/4*(1-t/8192%1)**5,
s=_=>tanh(((t*sin(t/2.5|0)+(_*40)&255)/128-1)*(1-t/16384%1)**5*(t>>14&1)*2)/2,
// master
mast=_=>k()+((_?chout1:chout2)+b/2+h+s(_))*min(4-kenv*4,1),
[mast(0),mast(1)]