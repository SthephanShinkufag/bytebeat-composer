T=1.0594631,a=0.146666667,A=a*T,b=A*T,c=b*T,C=c*T,d=C*T,D=d*T,e=D*T,f=e*T,F=f*T,g=F*T,G=g*T,q=(s,S)=>(o=((t*eval('this.'+s[((t>>S)*2)%s.length])*(1<<s[((t>>S)*2+1)%s.length]))&255),isNaN(o)?0:o),
S=x=>cos(x/128*PI),
T=x=>tan(x/256*PI)*4,
s = (a,b,c=32,h=300)=>((q(a,b)+(1+(t&1&&t/h))&255)>240)*c,
ts=(a,b,c=32,h=1000)=>(T((q(a,b)+(1+(t&1&&t/h))&255)/1.8)&c),
beat=t>>15,
bar=(t>>17),
channels=[0],
channels[1]=[
	s('c2d2d2d2c2d2d2d2',17,48,300)||
	s('e2e2f2f2e2e2f2f2',17,48,400)||
	s('g2g2g2a3g2g2a3c3',17,48,500)
,0],

channels[2]=[
	-S(1e6/(t&65535))*48+48&96
,8],

channels[3]=[
	s(['c2e2g2e2','d2e2g2e2','d2f2g2f2','d2f2a3f2','c2e2g2e2','d2e2g2e2','d2f2a3f2','d2f2c3f2'][bar&7],13,32,1e9)
,16],

channels[4]=[
	ts('c3e3g3G3g3g3d3d3d3d3d3g3a4a4a4a4c3e3g3a4g3g3d3d3a4a4a4a4d3f3c4c4',15,63)*1.5
,24],

channels.reduce((a,b)=>
	a+(
		(bar>=b[1]) && b[0]
	)
)