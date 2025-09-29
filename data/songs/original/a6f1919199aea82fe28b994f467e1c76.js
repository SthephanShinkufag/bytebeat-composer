// (s)Hush

// T things
T=t, // original T
t|=3, // bitcrush
p=(t/1.01)*1.22917, // pitch variable
// (detuned a bit)
s=t*1.22917, // speed variable

T||(a1=a2=a3=c1=c2=b1=b2=0,r=mem=>Array(mem).fill(0),chr=r(512),br=r(480),ar=r(512),ad=r(16384),ad2=r(16384)),
// variables, functions, etc
note=x=>2**(x/12), // note thingy

supsaw=x=>((x=note(x)*2,p*x%254.4+(p+128)*x%255.6+p*x%257+p*x%256.3)/512-1)||0,
// supersaw (for chords)

saw=(x,o)=>(atan(tan((p*note(x))/256*PI))/6*(1-((s/(2**14))-o)%1))||0, // saw (for "idk")
// (also oscillates)

arrs=[[-15,-13,-16,-11],[-11,-9,-13,-8],[-8,-6,-9,-6],[18,,,23,,,,,20,,,18,,,,,11,,,18,,,,,13,,,20,,,11],[,-13,-11,-1,,-8,-6,-8,,-9,-8,-1,,-4,-6,-8],[,-20,-18,-8,,-13,-11,-13,,-16,-13,-8,,-8,-11,-13],[,-15,-15,-15,,-13,-13,-13,,-11,-11,-11,,-8,-8,-8]],
// arrays

c=(supsaw(arrs[0][3&s>>17])+supsaw(arrs[1][3&s>>17])+supsaw(arrs[2][3&s>>17]))/4,f=((s/131072%1)**.5)*.15,z=.2+.2/(1-f),c1+=f*(c-c1+z*(c1-c2)),c2+=.3*(c1-c2),d=(d=c2+chr[T%512],chr[T%512]=d/2,d),ch=[c2,d],
// chords

b=saw(arrs[3][(sp=x=>int((((s/(2**14))-x)%32)))(0)],0)+saw(arrs[3][sp(1)],.5)/3+saw(arrs[3][sp(2)],0)/4+saw(arrs[3][sp(3)],0)/4,f=.5,z=.4+.4/(1-f),b1+=.3*(b-b1+z*(b1-b2)),b2+=f*(b1-b2),idk=(b2*1.2)*((s>2**20)&&(s<2**21)),
// idk

a=y=>(supsaw(arrs[4][(sp2=x=>(((s>>14)-x)+8)%16)(y)])+supsaw(arrs[5][sp2(y)])+supsaw(arrs[6][sp2(y)]))/5,a=a(0)+(a(1)/3+a(2)/4),f=(1-s/16384%1)*.4,z=.2+.2/(1-f),a1+=f*(a-a1+z*(a1-a2)),a3+=f*(a1-a3),a2+=f*(a1-a2),e=(a2=a2*(s>(2**21)+(2**17)),e=a2+ar[T%512],ar[T%512]=e/2,e),idk2=[a2,e],
// idk 2 (another set of chords, maybe?)

T||(x=y=0),T%4||(x=(random()-.5)*.01,y=(random()-.5)*.01),
// noise

[tanh(ch[0]+idk+idk2[0]+x)/1.25,tanh(ch[1]+idk+idk2[1]+y)/1.25]
// main