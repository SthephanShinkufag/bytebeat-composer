l=0, life=10, HQ=2, // Have a strong computer? Set HQ to 1. Really strong? 2!

S=Math.random()/(life+(t>>4&255))*life*2,
H=((t>>1)*PI&1)/(life+(t>>4&255))*life,

t||(			

r=(x,y)=>(Array(x).fill(y).flat(9)),
											// Set Arrays at only first t (song beginning and compilation) to avoid lag on
a=Array(n=24576).fill(0),			// chromium based browsers like Chrome and Edge
warble=Array(N=1023).fill(0),
warble2=Array(N3=1022).fill(0),
echo=Array(N2=n>>1).fill(0),
beg=n/(1<<16),
drumPat=[r(3,[0,NaN,1,NaN]),0,1,1,1].flat(), // NaN none; 0 snare; 1 hihat

											// ^--- Arrays | Functions ---V

proc=(x)=>(isNaN(x)?NaN:x==0?S:x==1?H:NaN),
merge=(v,w=Array(v.length).fill(1/v.length))=>{let s=0;for(i in v){s+=v[i]*w[i]} return s},
add=(...d)=>{x=0;for(i of d){x+=i}return x},
normal = (A) => {x=add(...A); return A.map((a) => a / x);},
barF=(x)=>(x*(1<<16)), //Bar Function
bt=(l,x,g)=>(x>l&&x<g)

),
barV=t>>16,


gate=(x,times={flips:[],activate:0},O)=>{
	if(O){return 0}
	const C=(barO)=>(bt(barF(barO),t,barF(barO+1)))
	let onFlip = false;
	times.flips.forEach(x=>{
		if(C(Number(x))) {
			onFlip = true;
		}
	})
	const Activated = (t)>=barF(times.activate)
	return O?0:(Activated^onFlip)?x:0
},

WARBLE=(x)=>(s=merge([warble[int(t%N)],x],normal([1,1.5])),warble[int(t%N)]=isNaN(s)?warble[int(t%N)]:s),
WARBLE2=(x)=>(s=merge([warble2[int(t%N3)],x],normal([1,1.5])),warble2[int(t%N3)]=isNaN(s)?warble2[int(t%N3)]:s),
ECHO=(x)=>(s=merge([echo[int(t%N2)],x],normal([1,1.5])),echo[int(t%N2)]=isNaN(s)?echo[int(t%N2)]:s),

this.f??=(z,v=0)=>sin(l++<z?f(z,v)-v:(l=0,v)),

x=a.shift(),
mel=(1*'0021002400210035'[t>>16&15]+10),
y=f(t>>13&7^t>>12&3,(z=t*mel/10)/16)*f(t>>14&7^t>>12&7,z/32)*(2-t/4096%4)*!!(-t>>14&3)/3.5+x,
a.push(y/3-a[n/2]/4+a[n/4]/4),

xXx=HQ==2?(()=>(
merge([
	gate(
		merge([
			8*(abs(x)**(y*x)-1)/6,
			f(t>>13&7^t>>12&3,(t*(mel/4)&((t*(mel/8))&256?192:128))/512),
			barV<=15?sin(t/256/(128/PI))+(1/3):0
		],[0.7,0.3,0.5])
	,{flips:[],activate:beg}),
	gate(
		((((z=t*mel/40)/16*(128/PI))&((barV&4)?192:128))/256)-((barV&4)?1/3:1/4)
	,{flips:[3,15,31],activate:7}),
	gate(
		(drum=(proc(drumPat[(t>>12)&15]))+(.003*(life+(t>>4&255))),drum=isNaN(drum)?0.32:drum-0.5)
	,{flips:[31],activate:16})
],[1.2,0.9,1])
))

:merge([
	gate(
		merge([
			8*(abs(x)**(y*x)-1),
			f(t>>13&7^t>>12&3,(t*(mel/4)&((t*(mel/8))&256?192:128))/512),
			barV<=15?sin(t/256/(128/PI))+(1/3):0
		],[0.7,0.3,0.5])
	,{flips:[],activate:beg}),
	gate(
		((((z=t*mel/40)/16*(128/PI))&((barV&4)?192:128))/256)-((barV&4)?1/3:1/4)
	,{flips:[3,15,31],activate:7}),
	gate(
		(drum=(proc(drumPat[(t>>12)&15]))+(.003*(life+(t>>4&255))),drum=isNaN(drum)?0.32:drum-0.5)
	,{flips:[31],activate:16})
],[1.2,0.9,1]),

t<(beg*65536)?0.2:HQ==2?
barV<=7?[WARBLE2(ECHO(WARBLE(xXx()))),WARBLE2(ECHO(WARBLE(xXx())))]:
barV<=15?[ECHO(WARBLE(xXx())),ECHO(WARBLE(xXx()))]:
[ECHO(xXx()),ECHO(xXx())]
:HQ?
barV<=7?WARBLE2(ECHO(WARBLE(xXx))):
barV<=15?ECHO(WARBLE(xXx)):
[ECHO(xXx),ECHO(xXx)]:ECHO(xXx)