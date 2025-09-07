a=385, // base frequency
k=1.8, // tempo change coefficient
tempo=48,
echo=24, // echo count
delay=.35,
fdbk=.9,
mix=0.5,
dethz=3, // echo detune

// engine

t!=0?0:(fd=fdbk,e=echo,m=1+fd*(pow(fd,e)-1)/(fd-1)*mix,fq=Array(e).fill(0).map((_,i)=>a-dethz+2*dethz*random()),tk=t=>(pow(2,k-1)*sign((t/384e3+.5)%1-.5)*pow(abs((t/384e3+.5)%1-.5),k)+round(t/384e3))*tempo,fr=(b,x)=>b*pow(2,(x-69)/12),s=x=>sin(2*PI*x),w=x=>s(x)+.15*s(2*x)+.1*s(3*x)+.03*s(4*x)+.02*s(5*x)+.008*s(6*x)+.003*s(8*x),v=x=>x/pow(x,x)*min(3-x,1),f=(b,tm)=>w(fr(b,n[floor(tk(tm)/84)%n.length][floor(tk(tm))%7])*tm/48e3)*v(3*tk(tm)%3),n=[[68,61,80,76,73,71,63],[68,61,81,80,73,71,63],[68,61,80,76,73,71,63],[68,61,83,80,73,71,63],[68,61,85,83,76,71,63],[68,61,81,80,73,71,63],[68,61,80,76,73,71,63],[68,61,83,80,73,71,63],[68,61,78,75,73,71,63],[68,61,83,80,76,71,63],[68,61,87,83,80,71,63],[68,61,85,76,73,71,63],]),(f(a,t)+mix*Array(e).fill(delay*48e3).map((x,i)=>(t>=x*(i+1))?pow(fd,i+1)*f(fq[i],t-x*(i+1)):0).reduce((a,b)=>a+b))/m