sid=(pat,notes,speed=16)=>(

	notes = [0,...(notes.map(e=>e[(t>>speed)%e.length]))],

	T=q=>2**(q/12),
	S=(p,t)=>t*p&255,
	C=t=>notes.reduce((a,b)=>a+S(T(b),t)),
	C( t-(2**pat[int((t/((2**speed)))*pat.length)%pat.length] ))>C(t)?64:0),

sid([5,4.5,4,3.5,3,2.5,2,1.5],
	[
		[0,0,-2,-2,0,0,0,0,0,0,-2,-2,0,0,1,1],
		[4,3, 3, 2,4,4,5,5,4,3, 3, 2,4,4,4,4],
		[7,7, 6, 6,7,8,8,7,7,7, 6, 6,7,8,8,8]
	]
)