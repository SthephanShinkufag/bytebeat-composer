t?0:{u,p,w}=(()=>{
	const 

	avg=ar=>{
		let sum = 0;
		for (n of ar) sum += n;
		return sum / ar.length;
	},

	ph=(c)=>pt*2**(c/12),
	sq=(sz,ln,sp)=>parseInt(sz[(r>>sp)%ln],36),
	sph=(sz,ln,sp)=>ph(sq(sz,ln,sp)),
	
	

	sin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,
	saw=(phase)=>-phase&255,
	tri=(phase)=>256-abs(saw(phase)*2-256)-.5,
	pws=(phase,pw=.5)=>(saw(phase)>pw*255)*255,
	pwt=(phase,pw=.5)=>(tri(phase)>pw*255)*255
	return {u:{avg,sq},p:{ph,sph},w:{sin,saw,tri,pws,pwt}}
})(),


mn=(a,mi=0,ma=255)=>min(max(a,mi),ma),

speed=.6,r=(t*speed)%(2<<17),
pt=t,

r32=(r/4096)%1,
r16=(r/8192)%1,
r8d=(r/(8192*3))%1,
r8=(r/(8192*2))%1,
r4=(r/(8192*4))%1,


//bseq='aaaaaaaa'+'aaaaaaaa'+'aaaaaaaa'+'aaaaa58d',
bseq='aaaaaaaa'+'aaaaaaa6'+'66666666'+'66668888', 
bph=p.sph(bseq,32,12),

lfo=w.tri(r),

chSeq=[
	'hh fffff'+'       d'+'ddd     '+'ddd fffo',
	'dd ccccc'+'       a'+'aaa     '+'aaa cccc',
	'aa 88888'+'       6'+'666     '+'666 8055'
],
ofs=[0,3,7,-1,4][
	u.sq('00011111'+'11111112'+'33333333'+'00004444',32,12)
],
cEnv=1-((r/32768)%1-ofs/8)*.4,
crds=u.avg(chSeq.map(seq=>w.pwt(p.sph(seq,32,12),cEnv*.96)))*cEnv,




mn(
	1*(
		1*.2*w.pwt(bph/(4.03+4*(r8<.5)), r16*.2)
			*(1-r32*.9)
		+1*.3*w.saw(bph/8, .2)
			*(1-r32*.8)
		+1*.5*crds
	)
		*min(r8*2,1)
	+1*(
		+(
			(r4>.01?3e3*sqrt(r16)**.4&64:random()*80)
			+random()*90*r4
		)
			*(1-r16)
			*(r8<.20)
		+1*(random()*40)
			*(1-r16)**3
		+1*(random()*20)
			*(1-r32)**3		
	)
)