this.n??=[int(65356/3),int(65536/5),int(65356/2)],c=-1,r=(v,t)=>(Array(t).fill(v)),bar=t>>17,beat=t>>15&3,
barF=(x)=>(x*(1<<17)), //Bar Function
R = Number.NEGATIVE_INFINITY,
bt=(l,x,g)=>(x>l&&x<g),
dis=(1+sin(t/16384)/96/(t/12288)),
gate=(x,times={},O)=>{
	if(O){return 0}
	const C=(barO)=>(bt(barF(barO),t,barF(barO+1)))
	let onFlip = false;
	(times.flips??[]).forEach(x=>{
		if(C(+x)) {
			onFlip = true;
		}
	})
	const Activated = (t) >= barF((times.activate??0)) && (t) <= barF((times.deactivate??Number.POSITIVE_INFINITY))
	return O?0:(Activated^onFlip)?x:0
},
t||(
	b=[Array(n[0]).fill(0),Array(n[1]).fill(0),Array(n[2]).fill(0)],
	a1=[...r([0,3,7,10],4),...r([0,2,7,10],4),[0,3,10,8],"0387","0375",[0,3,7,12]]
),echo=(a,w=[1,1,2])=>(w[2]??=w[0]+w[1],a&=255,c++,b[c][t%n[c]]=((b[c][t%n[c]]*w[0])+(a*w[1]))/w[2]),
x=(p="047",sp=14,s=0,o=1)=>(t*2**(((+p[((t*p.length)>>sp)%p.length]+s)/12))/o),
a=((x(a1[(t>>17)%12],17,0,0.5)*dis)&128)*(((255-(t>>7))&255)/256),
bb=(t/(1<<3)*1.185*dis)%25,
cc=((x([0,3,10,0,3,10,3,7,
		  0,3,10,0,3,10,2,7,
	     0,3,10,0,3,10,3,7,
		  0,3,8,10,7,5,3,12],18,0,0.5)*dis)&128)*(((255-(t>>5))&255)/256),

O=echo(
	gate(
		a
		,{flips:[],activate:0}
	)
)+echo(
	gate(
		bb
		,{flips:[],activate:12}
	)
,[4,1,4.2])+echo(
	gate(
		cc
		,{flips:[],activate:16}
	)
),O*0.9