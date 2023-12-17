l=0, life=15, // Have a strong computer? Set HQ to 1. Really strong? 2!

S=Math.random()/(life+(t>>4&255))*life*1.5,
H=((t>>2)*E&1)/(life+(t>>4&255))*life,


t||(	// To avoid lag, we only set arrays at first t
pointer=0,
r=(x,y)=>(Array(x).fill(y).flat(9)),
f=(z,v=0)=>sin(l++<z?f(z,v)-v:(l=0,v)),
a=Array(n=24576).fill().map((a,t)=>
	(f(t>>13&7^t>>12&3,(z=t*(1*'0021002400210035'[t>>16&15]+10)/10)/16)*f(t>>14&7^t>>12&7,z/32)*(2-t/4096%4)*!!(-t>>14&3)/3.5)/2),
warble=Array(N=1023).fill(0),
warble2=Array(N3=1022).fill(0),
echo=Array(N2=n>>1).fill(0),
beg=n/(1<<16),
drumPat=[r(3,[0,NaN,1,NaN]),0,1,1,1].flat(), // NaN none; 0 snare; 1 hihat

											// ^--- Arrays | Functions ---V

proc=(x,t)=>((isNaN(x)?NaN:x==0?S:x==1?H:NaN)-((t>>4)&255)/400)-0.2,
merge=(v,w=Array(v.length).fill(1/v.length))=>{let s=0;for(i in v){s+=v[i]*w[i]} return s},
add=(...d)=>{x=0;for(i of d){x+=i}return x},
normal = (A) => {x=add(...A); return A.map((a) => a / x);},
barF=(x)=>(x*(1<<16)), //Bar Function
bt=(l,x,g)=>(x>l&&x<g)

),
barV=t>>16,

gate=(x,times,O)=>{
	if(O){return 0}
	let on = false;
	times.forEach(x=>{
		if(t>=barF(x)) {
			on = !on;
		}
	})
	return on&&x;
},

WARBLE=(x)=>(s=merge([warble[int(pointer%N)],x],normal([1,1.5])),warble[int(pointer%N)]=isNaN(s)?warble[int(pointer%N)]:s),
WARBLE2=(x)=>(s=merge([warble2[int(pointer%N3)],x],normal([1,1.5])),warble2[int(pointer%N3)]=isNaN(s)?warble2[int(pointer%N3)]:s),
ECHO=(x)=>(s=merge([echo[int(pointer%N2)],x],normal([1,1.5])),echo[int(pointer%N2)]=isNaN(s)?echo[int(pointer%N2)]:s),

pointer++,

songFunc=()=>(

	x=a[pointer%n],
	mel=(1*'0021002400210035'[t>>16&15]+10),
	y=f(t>>13&7^t>>12&3,(z=t*mel/10)/16)*f(t>>14&7^t>>12&7,z/32)*(2-t/4096%4)*!!(-t>>14&3)/3.5+x,
	a[pointer%n]=(y/3-a[(pointer+(n/2))%n]/4+a[(pointer+(n/4))%n]/4),

merge([
	gate(
		merge([
			8*(abs(x)**(y*x)-1),
			f(t>>13&7^t>>12&3,(t*(mel/4)&((t*(mel/8))&256?192:128))/512),
			wavy=sin(t/256/(128/PI))+((barV>15?1.8:1)/3)
		],[0.7,0.3,barV>15?0.3:0.5])
	,[0]),
	gate(
		((((z=t*mel/40)/16*(128/PI))&((barV&4)?192:128))/256)-((barV&4)?1/3:1/4)
	,[3,4,7,15,16,31,32]),
	gate(
		(drum=(proc(drumPat[(t>>12)&15],t))+(.003*(life+(t>>4&255))),drum=isNaN(drum)?0:drum)*2
	,[16,31,32])
],[1.2,0.9,wavy>0?-1:1])
),

barV<=7?[WARBLE2(ECHO(WARBLE(songFunc()))),WARBLE2(ECHO(WARBLE(songFunc())))]:
barV<=15?[ECHO(WARBLE(songFunc())),ECHO(WARBLE(songFunc()))]:
[ECHO(songFunc()),ECHO(songFunc())]