const BPM=130;
var KEYSHIFT;
const TUNING=432;
var e=[];
var a=b=g=gg=q=qq=0;
const j=[[3,6,11],[4,6,11],[6,15,11],[8,13,11]];
const ca=[[0,-12,12,12,10,12,-24,-12,-24,12,-12,10,12,12,-14,-12],[.5,.5,1,1,.5,.5,.5,.5,.5,.5,1,.5,.5,1,.5,.5]];
const ui=[0,-12,12,7];
t303=(t,c,y,k)=>{
	const r=-t*TUNING*2**((c+ui[k]-36+KEYSHIFT)/12)%1+.5;
	a+=b+=(r-a-b*3)/y;
	return a
}
epi=(t,c,y,n=0)=>{
	var v=0;
	p=(g,f)=>(
		f=128+f/2,
		sin(sin(sin(PI*g/8)/4*1e-5**(y)+PI*g/f)*1.3*.68**(y)+PI*g/f)
	);
	for(v=h=0;h<3;h++){
		o=b=>t*TUNING*2**((b+84+KEYSHIFT)/12);
		var r=o(c[h]);
		v+=p(r,n);
	}
	return v/4
}
ret=(t,c,d)=>{
	r=y=>sin(y+cos(y-1.5+exp(sin(y)*2)*1e-4**(d)));
	o=b=>t*TUNING*2**((b-13+KEYSHIFT)/12)*PI;
	return r(o(c))
}
return t=>{
	const c=t*BPM/60;
	KEYSHIFT=c&64?1:0;
	const bas=t303(t,-1,16+cos(t*1)*8,2*c&3)*(4*c+1&1);
	const kic=sin(cbrt(c%1)*128)/2;
	const hih=min(.07,(vv=random()-.5)*1e-11**((c+.5)%1)/2)*4;
	const sna=q+=qq+=((vv)*1e-5**((c+1)%2)-q-qq*3)/5;
	const yut=ret(t,ca[0][2*c&15],c%ca[1][2*c&15]);
	for(y=0;y<2;y++)
	e[y]=epi(t,j[c/4&3],c%4,-y);
	g+=gg+=((bas+(kic+hih+sna)*1.5)-g-gg*4)/5;
	return [(e[0]/1.5+g+yut/2)/2.5,(e[1]/1.5+g+yut/2)/2.5]
}