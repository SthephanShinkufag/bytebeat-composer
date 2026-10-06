/* Sylenth1 · "001: ARP 303 Saw" Preset Remake */

/* initializations */
t||(m=0,fx=[],rfx=[],buf=[]),rfxi=0,fxi=0,dlyfxi=0,dMax=1e5,dt=t,

/* filters */
lp=(a,c)=>(
	lp_fxii=fxi++,
	fx[lp_fxii]??=0,
	fx[lp_fxii]+=(a-fx[lp_fxii])*c
),
hp=(a,c)=>a-lp(a,c),
bp=(a,hc,lc)=>hp(lp(a,lc),hc),

lpr=(a,c,r)=>(
	r_fxii=rfxi++,
	rfx[r_fxii]??=[0,0],
	rfx[r_fxii][1]+=(
		(rfx[r_fxii][0]+=(a-rfx[r_fxii][0]+(r+r/((1+.1e-10)-c))*(rfx[r_fxii][0]-rfx[r_fxii][1]))*c)
	-rfx[r_fxii][1])*c
),

/* delay/reverb */
dly=(inp,heads,mix,fbfn=x=>x)=>{
	dly_fxii=dlyfxi++;
	buf[dly_fxii]??=new Float32Array(dMax);
	dly_wi=dt%dMax;
	dly_feed=inp;
	dly_out=0;

	for(let head of heads) {
		dly_ri=buf[dly_fxii][(dMax+dt-round(head.t))%dMax];
		dly_feed+=dly_ri*head.fb;
		dly_out+=dly_ri*head.m;
		};

	buf[dly_fxii][dly_wi]=fbfn(dly_feed);
	return inp*(1-mix)+dly_out*mix;
},

/* track settings */
bpm=128,
sr=48e3,
sec=t/sr,
spb=(60/bpm)*sr,
ts=sec*(bpm/60)*16384,
tt=1/sr*220*2**(4/12),

/* melody w/ pitch slides */
s=min(ts/4096%1*2,1),
m+=tt*2**(([12,0,12*s,12,0,12*s,0,17,17*(1-ts/4096%1),-12,0,-2,-2-10*s,-2,-2+2*s,-12][(ts>>12)%16])/12),
g="11 11 11 1111111"[ts>>12&15]|0,
g2="11 11 11 111 11 "[ts>>12&15]|0,

/* acid + delay */
x=lr=>
dly(
lpr((m%2-1)*(g2?1:min(1,3-ts/4096%1*3)),.2+(g?1-ts/4096%1+1:-ts/4096%1+1)*.2+(sin(ts*PI/65536)**2-.425)*.75,.9)
,[{t:300+(lr?cos:sin)(t/4e3)*40,m:.35,fb:0},{t:spb*(lr?3.001:2.999)/4+(lr?sin:cos)(t/2e4)*10,m:.5,fb:.55}],.55,x=>bp(x,.1,.25))
,

/* output */
[x(0),x(1)].map(f=>tanh(hp(tanh(f*1.5),1e-3)))