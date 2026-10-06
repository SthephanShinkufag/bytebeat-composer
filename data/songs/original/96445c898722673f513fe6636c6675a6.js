a=385, // base frequency
k=1.8, // tempo change coefficient
tempo=48,
echo=24, // echo count
delay=.35,
fdbk=.9,
mix=0.5,
det=10e-3, // echo detune

// engine

t!=0?0:(fd=fdbk,e=echo,m=1+fd*(pow(fd,e)-1)/(fd-1)*mix,fq=Array(e).fill(0).map(_=>a*pow(2,det*(2*random()-1))),tk=t=>(pow(2,k-1)*sign((t/384e3+.5)%1-.5)*pow(abs((t/384e3+.5)%1-.5),k)+round(t/384e3))*tempo,fr=(b,x)=>b*pow(2,(x-69)/12),s=x=>sin(2*PI*x),w=x=>s(x)+.15*s(2*x)+.1*s(3*x)+.03*s(4*x)+.02*s(5*x)+.008*s(6*x)+.003*s(8*x),v=x=>x/pow(x,x)*min(3-x,1),f=(b,tm)=>w(fr(b,[68,61,...n[floor(tk(tm)/84)%n.length],71,63][floor(tk(tm))%7])*tm/48e3)*v(3*tk(tm)%3),n=[[80,76,73],[81,80,73],[80,76,73],[83,80,73],[85,83,76],[81,80,73],[80,76,73],[83,80,73],[78,75,73],[83,80,76],[87,83,80],[85,76,73]]),[0,e/2].map(d=>(f(a,t)+mix*Array(e/2).fill(delay*48e3).map((x,i)=>(t>=x*(i+1))?pow(fd,i+1)*f(fq[i+d],t-x*(i+1)):0).reduce((a,b)=>a+b))/m)