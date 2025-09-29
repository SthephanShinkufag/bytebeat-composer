//======================================================//
// - 6th Wave - by feeshbread (for ByteBattle season 3) //
//======================================================//


fi=0,
dt=t,

t?0:(

//===========//
// dsp stuff //
//===========//
f=[],
mn=(a,mi=0,ma=255)=>min(max(a,mi),ma),
B = (()=>{
	function Buffer (size,sd=1) {
		this.a = Array.from({length:size},x=>0);
		this.s = size;
		this.sd = sd;
	}
	Buffer.prototype.read = function (i, offs = 0) {
		i = (i+this.s*this.sd-offs)/this.sd;
		const ii = i|0;
		const d = i-ii;
		const r = this.a[ii % this.s]*(1-d) + this.a[(ii+1) % this.s]*d;
		return r;
	};
	Buffer.prototype.write = function (i, v) {
		this.a[(i/this.sd % this.s)|0] = v;
	};
	return Buffer;
})(),
PPD = (()=>{
	function PingPongDelay (size,sd=1) {
		this.b = [new B(size,sd), new B(size,sd)];
	}
	PingPongDelay.prototype.fn = function (lr, i, a, t, fb, dw) {
		const r = this.b[lr].read(i,t);
		this.b[lr^1].write(i, a*lr+r*(lr?fb:1));
		return a*(1-dw)+r*dw||0;
	}
	return PingPongDelay;
})(),

lp=lowPassFilter=(a,c)=>(
	lp_fi=fi++,
	f[lp_fi]||=0,
	f[lp_fi]+=(a-f[lp_fi])*c
),
hp=highPassFilter=(a,c)=>a-lp(a,c),
bp=bandPassFilter=(a,hc, lc)=>hp(lp(a,lc), hc),
nf=notchFilter=(a,lc, hc)=>(hp(a, hc)+lp(a,lc)),
lb=lowBoostFilter=(a,c,v)=>a+lp(a,c)*v,
hb=highBoostFilter=(a,c,v)=>a+hp(a,c)*v,
bb=bandBoostFilter=(a,hc,lc,v)=>a+bp(a,hc,lc)*v,

lp2=twoPoleLowPassFilter=(a,c)=>lp(lp(a,c),c),
hp2=twoPoleHighPassFilter=(a,c)=>hp(hp(a,c),c),

alp=asyncLowPassFilter=(a,cu,cd)=>(
	alp_fi=fi++,
	f[alp_fi]||=0,
	alp_r = f[alp_fi],
	f[alp_fi]+=(a-alp_r)*(alp_r<a?cu:cd)
),

cmp=compressor=(a, th, ra, at, rl, sc=a)=>(
	a/(alp(max(abs(sc)-th,0), at, rl)/th*ra+1)
),

acc=accumulate=(a)=>(
	acc_fi=fi++,
	f[acc_fi]||=0,
	f[acc_fi]+=a
),
hold=(a)=>(
	hacc_fi=fi++,
	f[hacc_fi]||=0,
	isNaN(a) || (f[hacc_fi]=a),
	f[hacc_fi]
),



//===========//
// sequences //
//===========//

//precalculates string sequences
strsq = (str, m = 1) => [...str].map(sq=>2**((parseInt(sq,36))/12)*m*.9),


cl_sq_a=[
	[0,0,.5,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
	[0,0,.5,0,0,0,0,0,1,0,0,0,0,0,0,0],
	[0,0,.0,0,0,0,0,0,1,.4,0,0,0,0,0,0],
	[0,0,.5,0,0,0,0,0,1,.4,0,0,0,0,0,0],
],
chord_sqs = [
	strsq('aehl'),
	strsq('7aej'),
	strsq('29eg'),
	strsq('07eg')
],
lead_sq_a=[
	0,
	strsq('   he ql           he ql           he ql           he ql        ').concat(
	strsq('   he ql           he ql           he ql                        ',2)),
	strsq('   he ql           he ql           he ql           he ql        '+
			'   he ql           he ql           he qt           he qs        '),
	strsq('   le  q           me  s           og  t           le  q        '),
	strsq('le     q       ome     s       qog     t       qle     q        '),
	strsq('   elqsttttsss  sqjea7ae   glqsqqq  lqsqqq elqsqqqvvvsss   elqst'+
			'tttsss  sqjea7ae29elqstxxx ljolqqq                           elq'),
	strsq('ttsxxxqsss  sqjsssqmmmtsssqmmmollll        loomlllqq         ejl'+
			'mmlqqqjlll  mljsssqmmmtsssqmmmqsssltttqvvvttqqssss              '),
	strsq('ttsxxxqsss  sqjsssqmmmtsssqmmmollll        loomlllqq         elq'+
			'ttsxxxqsss  sqjsssqmmmtsssqmmmollll        elmlqqqq             '),
	strsq('tttt    ttvvvvsss       ssttttqqq                               '+
			'tttt    ttvvvvsss       ssttttqqq                               '),
	strsq(' jlqqqqooo   eqlll jjj lll jjj gggooo        ljgggll            '+
			' jlqqqqooo   eqooo qqq lll jjj oooo            jjjj     sssstttt'),
	strsq(' jlqqqvsss   sqlll jjjelll jjjegggooo        ljgggll            '+
			' jlqqqsooo   sqooolqqqtssshjjjmlllll         ehjjjj     gggg    ',2),
	strsq('eeee            7777            9999            4444            '+
			'5555            7777            9999                            ',2),
	strsq('elqstttsvvqss  joljhllhjjj gsqjssqtsqtsqvtoxvthoooooohjsssssss  ')
],
blep_sq_a=[
	0,
	strsq('     9       9       9       9       9       9       9       9  ',1),
	strsq('    9               9               9               9           ',2),
	strsq('         40eg h          42eh j          74hj l          97ea c9'),
	strsq('   ea c9'),
],





//======================//
// switchable functions //
//======================//

off = () => 0,

	//--------//
	// sounds //
	//--------//

chord_v_fn = (m, t, lr) => (t*m*(.999+.002+m*.002)/2&255)*(.3+.7*lr)+(t*m*(1.001-.002-m*.002)/2&255)*(1-.7*lr),
chord_fns = [
	off,
	(lr) => {
		c=0;
		for (i in chord_sq) c += chord_v_fn(chord_sq[i], cl, lr);
		return lp2(c/chord_sq.length/510-.5,_c_env)
	}
],
bass_fns = [
	off,
	(lr) => (ph=chord_sq[0]*cl/4, lp2(((ph&205)+hp2(ph*(1.99+.02*lr)&255,.01)*.5)/1024,_b_env)),
],
lead_fns = [
	off,
	(m) => atan(sin(acc(lp(hold(m*spd),.1))/128*PI)*a_sy_l_i)*lp(!!m,.005)
],
dlead_fns = [
	off,
	(m,lr) => bp(tanh(sin(lr+cl*m/255/2*PI||0)*(.5+sin(cl/4096/4*PI)*.5)*5+bp(((cl*m/2*(1+lr*.001))&255)*(1.1+sin(cl/15e3)*.5)&127,.02,.015)),.05,.5)/2
],
blep_fns = [
	off,
	(m) => lp(tanh(hp((cl*m&(cl>>6)&127),.01)),.08),
	(m) => lp2(tanh(hp((cl*m&(cl>>6)&127),.01)),.2)*.5,
	(m) => lp(tanh(hp(((cl*m)&255)*(2+sin(cl/9e3)*.5-r16*.9)&127,.01)),.3)/3,
],

kick_fns = [
	off,
	() => sin(1e2*(r4)**.6)/(r4*11+.01)*.6*(1-_sc)
],
clap_fns = [
	off,
	(lr) => sin(cl*(.3+.01*lr)*sin(cl>>3))*_cl_env
],
hats_fns = [
	off,
	(lr) => (
		(sin(cl*(.3-.01*lr)*sin(cl>>3))
		*sin(cl*(.6-.001*lr)*sin(cl>>3)))*_ht_env
	)
],
fx_fns = [
	off,
	(lr) => (
		bp(random(),.1,.1)*_fx_env
	)
],





	//-------------------------------------//
	// envelopes / modulation / automation //
	//-------------------------------------//


sc_fns = [
	() => 1,
	() => min(r4*4,1)**1.5*(1-r4**3e2),
],


c_env_fns = [
	off,
	() => lp(1-(cl/256/256%2*8/3%1)**.5,.01)**2*(.2*r8b+.01)+r8b**2*.05,

	() => lp(1-(cl/256/256%2*8/3%1)**.5,.01)**2*.1,
	() => lp(1-(cl/256/256%2*8/3%1)**.5,.01)**2*.2,
	() => lp(1-(cl/256/256%2*8/3%1)**.5,.01)**2*.3,
	() => lp(1-(cl/256/256%2*8/3%1)**.6,.01)*.2,
	
	() => lp(1-r1b**.5,.01)*.03+0.01,
	() => lp(r8b**2*0.01, .001),
],
b_env_fns = [
	off,
	() => lp(1-(r16)**.15,.2)**1.5*.7+.015,
	() => lp(1-(r16)**.22,.2)**1.3*.7+.02,
	() => lp(1-(r16)**.3,.2)**1.3*.7+.02,
	
	() => lp(r8b**2*.1,1),
	() => lp(1-r1b**.5,.001)*.1+0.008,
	
	() => lp(0.02,1),
	() => lp(1-r1b**.5,.001)*.4+0.02,
	() => lp(r8b**2*0.008, .001),
],

cl_env_fns = [
	off,
	() => (2.5
			*(1-r4**.9)**2
			*cl_sq[cl>>12&15]
	)
],
ht_env_fns = [
	off,
	() => (
		(1-r16**.2)**1.3*3
		*(1-r8**.2)**1.3*3
	),
	() => (
		(1-r16**.2)**1.3*3
		*(1-r8**.2)*3
	),
	() => (
		(1-r16**.2)**1.5*3
	)
],
fx_env_fns = [
	off,
	() => (r8b)**15*.8,
	() => (1-r8b)**3.5,
	() => fx_env_fns[1]() + fx_env_fns[2](),
	() => (1-r8b)**9,
],





	//--------------------//
	// function switching //
	//--------------------//

chord = (ty,lr) => chord_fns[ty](lr),
bass = (ty,lr) => bass_fns[ty](lr),
lead = (ty,m) => lead_fns[ty](m),
dlead = (ty, m, lr) => dlead_fns[ty](m,lr),
blep = (ty, m, cl) => blep_fns[ty](m,cl),

kick = (ty) => kick_fns[ty](),
clap = (ty,lr) => clap_fns[ty](lr),
hats = (ty,lr) => hats_fns[ty](lr), 

fx = (ty,lr) => fx_fns[ty](lr), 



sc = (ty) => sc_fns[ty](),
c_env = (ty) => c_env_fns[ty](),
b_env = (ty) => b_env_fns[ty](),
cl_env = (ty) => cl_env_fns[ty](),
ht_env = (ty) => ht_env_fns[ty](),
fx_env = (ty) => fx_env_fns[ty](),





//=================//
// mix / rendering //
//=================//

// instanciating ping pong delays
ppd1=new PPD(3e4,3),
ppd2=new PPD(3e4,3),


// stereo song function
s=(t,lr)=>(
	c=chord(a_sy_c_ty,lr),
	c=ppd1.fn(lr, dt, c, (1<<13)/spd+sin(t/50000)*200, .6, .3),
	c=hp(c,.08),
	c=bb(c,.1,.1,-1),
	b=bass(a_sy_b_ty,lr),
	dl=dlead(a_sy_dl_ty,dlead_m,lr),
	l=_lead+_lead2+_blep+dl,
	l+=fx(a_fx_ty,lr)*.4*a_mt,
	l=ppd2.fn(lr, dt, l, (1<<13)/spd+sin(t/5000)*50, a_sy_l_d_fb, a_sy_l_d_mx),
	l=hp(l,.05),
	l+=dl*.5,
	l=cmp(l,.3,.5,.004,.005),
	mx=(c*7+b*1.3)*a_mt+l*a_mx_l,
	mx=hp(mx,.001),
	mx=cmp(mx,.25,1,.01,.001),
	mx=mx*(_sc**1.5),
	dr=lp(tanh(
		_kick*1.3
		+hp(
			clap(a_dr_cl_ty,lr)
			+hats(a_dr_ht_ty,lr)
				*a_mt
		,.8)
	)*.4,.2),
	dr=cmp(dr,.1,.1,.004,.005),
	a_dr_hp?(dr=hp(dr,a_dr_hp)):0,
	a_dr_lp<1?(dr=lp(dr,a_dr_lp)):0,
	mx=mx+dr*.7,
	a_mx_hp?(mx=hp(mx,a_mx_hp)):0,
	mx=bb(mx,.008,.09,-.3),
	mx=hb(mx,.4,6),
	mx=cmp(mx,.1,1,.0009,.001),
	mx=atan(mx*5)*1.2,
	mx
),





//================//
// song animation //
//================//

w=v=>()=>v,
l_is=[
	w(0),
	()=>(.1+r8b**3*1),
	()=>(1.5+r8b**8*3),
	w(3),
	w(4),
	w(6),
	w(8),
	()=>(.5+r8b**3*1),
	()=>(1.5+r8b**8*1.5),
	w(1.2),
	w(2.5),
],

mts=[
	w(1),
	()=>r8b<(0.96875)
],

ar_sy_b_ty=		[1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 , 1 ],
ar_sy_b_envty=	[4 ,1 ,2 ,3 ,3 ,6 ,3 ,3 ,4 ,5 ,7 ,7 ,5 , 8 ],

ar_sy_c_ty=		[1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 , 1 ],
ar_sy_c_envty=	[1 ,2 ,4 ,5 ,2 ,2 ,5 ,5 ,6 ,1 ,5 ,5 ,6 , 7 ],

ar_sy_l_d_mx=	[.5,.3,.3,.4,.3,.3,.3,.3,.3,.3,.3,.3,.4,.4 ],	
ar_sy_l_d_fb=	[.8,.8,.8,.8,.8,.8,.8,.8,.8,.8,.8,.8,.8,.8 ],	

ar_sy_l_i=		[1 ,2 ,5 ,6 ,2 ,3 ,6 ,6 ,7 ,8 ,10,10,9 , 9 ],		
ar_sy_l_ty=		[1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 , 1 ],
ar_sy_l_sq=		[1 ,2 ,3 ,2 ,5 ,4 ,4 ,5 ,6 ,7 ,7 ,7 ,8 , 0 ],
ar_sy_l2_ty=	[0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,1 ,1 ,1 ,1 , 1 ],
ar_sy_l2_sq=	[0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,9 ,10,10,11, 0 ],

ar_sy_dl_ty=	[0 ,0 ,0 ,0 ,1 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 , 0 ],

ar_sy_bl_ty=	[0 ,0 ,1 ,0 ,1 ,0 ,1 ,2 ,0 ,0 ,0 ,0 ,0 , 0 ],
ar_sy_bl_sq=	[0 ,0 ,3 ,0 ,2 ,0 ,3 ,1 ,0 ,0 ,0 ,0 ,0 , 0 ],


ar_dr_sc_ty=	[0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,0 ,1 ,1 ,0 , 0 ],

ar_dr_k_ty=		[0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,0 ,1 ,1 ,0 , 0 ],

ar_dr_ht_ty=	[0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,0 , 0 ],
ar_dr_ht_envty=[0 ,1 ,1 ,2 ,1 ,1 ,3 ,3 ,0 ,1 ,3 ,3 ,0 , 0 ],

ar_dr_cl_ty=	[0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,0 , 0 ],
ar_dr_cl_envty=[1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,0 , 0 ],
ar_dr_cl_sq=	[0 ,1 ,2 ,4 ,3 ,0 ,4 ,4 ,0 ,0 ,4 ,4 ,0 , 0 ],

ar_dr_hp=		[0 ,0 ,0 ,0 ,0 ,.1,0 ,0 ,0 ,0 ,0 ,0 ,0 , 0 ],
ar_dr_lp=		[1 ,.2,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,0 , 0 ],

ar_fx_ty=		[0 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,1 ,1 ,1 ,1 ,1 , 1 ],
ar_fx_envty=	[0 ,1 ,3 ,2 ,0 ,1 ,3 ,3 ,2 ,1 ,3 ,3 ,4 , 0 ],

ar_mt=			[0 ,1 ,0 ,0 ,0 ,1 ,1 ,1 ,0 ,1 ,0 ,0 ,0 , 0 ],	

ar_mx_hp=		[1 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,0 ,1 , 1 ],		mx_hps=[0,.04],
ar_mx_l=			[1 ,1 ,1 ,1 ,0 ,1 ,1 ,1 ,2 ,2 ,2 ,2 ,1 , 1 ],		mx_ls=[.09,.11, .14],

out=[]
),





//==================//
// per sample stuff //
//==================//

spd=.9,

cl=t*spd,

sel=cl>>20,
(sel === f[0] || sel > 12)?0:(f=[]),
f[0]=sel,
fi=1,

r2_180=r4=(cl/65536+.5)%1,

r32=(cl/4096%1),
r16=(cl/8192%1),
r8=(cl/16384%1),
r4=(cl/32768%1),
r2=(cl/65536%1),
r1b=(cl/131072%1),
r2b=(cl/262144%1),
r4b=(cl/524288%1),
r8b=(cl/1048576%1),
r16b=(cl/2097152%1),

a_sy_b_ty=ar_sy_b_ty[sel],
a_sy_b_envty=ar_sy_b_envty[sel],
a_sy_c_ty=ar_sy_c_ty[sel],
a_sy_c_envty=ar_sy_c_envty[sel],
a_sy_dl_ty=ar_sy_dl_ty[sel],
a_sy_l_d_mx=ar_sy_l_d_mx[sel],
a_sy_l_d_fb=ar_sy_l_d_fb[sel],
a_sy_l_ty=ar_sy_l_ty[sel],
a_sy_l_sq=ar_sy_l_sq[sel],
a_sy_l2_ty=ar_sy_l2_ty[sel],
a_sy_l2_sq=ar_sy_l2_sq[sel],
a_sy_l_i=l_is[ar_sy_l_i[sel]](),
a_sy_bl_ty=ar_sy_bl_ty[sel],
a_sy_bl_sq=ar_sy_bl_sq[sel],


a_dr_sc_ty=ar_dr_sc_ty[sel],
a_dr_k_ty=ar_dr_k_ty[sel],
a_dr_ht_ty=ar_dr_ht_ty[sel],
a_dr_ht_envty=ar_dr_ht_envty[sel],
a_dr_cl_ty=ar_dr_cl_ty[sel],
a_dr_cl_envty=ar_dr_cl_envty[sel],
a_dr_cl_sq=ar_dr_cl_sq[sel],

a_fx_ty=ar_fx_ty[sel],
a_fx_envty=ar_fx_envty[sel],

a_dr_hp=ar_dr_hp[sel],
a_dr_lp=ar_dr_lp[sel],

a_mt=mts[ar_mt[sel]](),

a_mx_hp=mx_hps[ar_mx_hp[sel]],
a_mx_l=mx_ls[ar_mx_l[sel]],



cl_sq = cl_sq_a[a_dr_cl_sq],

_sc=sc(a_dr_sc_ty),

_c_env=c_env(a_sy_c_envty),
_b_env=b_env(a_sy_b_envty),
_cl_env=cl_env(a_dr_cl_envty),
_ht_env=ht_env(a_dr_ht_envty),

_fx_env=fx_env(a_fx_envty),

lead_sq = lead_sq_a[a_sy_l_sq],
lead2_sq = lead_sq_a[a_sy_l2_sq],
blep_sq = blep_sq_a[a_sy_bl_sq],


chord_sq = chord_sqs[(cl>>17)%chord_sqs.length],

lead_m = lead_sq[(cl>>13)%lead_sq.length],
lead2_m = lead2_sq[(cl>>13)%lead2_sq.length],
dlead_m = lead_sq[(cl>>13)%lead_sq.length],
blep_m = blep_sq[(cl>>13)%blep_sq.length],


_lead = lead(a_sy_l_ty,lead_m),
_lead2 = lead(a_sy_l2_ty,lead2_m),
_blep = blep(a_sy_bl_ty,blep_m),
_kick = kick(a_dr_k_ty),


out[0]=s(cl,0),out[1]=s(cl,1),
out