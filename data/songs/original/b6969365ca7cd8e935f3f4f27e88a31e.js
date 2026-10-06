SR=24e3;
mod=(n,m)=>(n%m+m)%m;fract=x=>(x%1+1)%1;
prnd=x=>fract(fract(sin(x*9252.9492)*9153.1295)+fract(sin(x*6923.1525)*8921.0932));
mix=(a,b,t)=>a+(b-a)*t;bipolarize=x=>x*2-1;
prnddiv=(x,d)=>bipolarize(mix(prnd(floor(x*d)/d),prnd((floor(x*d)+1)/d),fract(x*d)));
powify=(x,y)=>sign(x)*(abs(x)**y)
samples={
 kick:{
  f:t=>(tanh(tanh(sin(1/(t+.025))*exp(t*-20)*3)+tanh(sin(t*250)*3)*exp(t*-10))*min(t*9e2,1))*max(min(1,(.4-t)/.1),0),
  s:.4 //length in seconds
 },
 clap:{
  f:t=>tanh(powify(prnddiv(t,3e3)*exp(t*-30)*(t<.09?fract(t*-65)**3:1)+prnddiv(t,12e3)*tanh(sin(t*15e3)*3)*exp(t*-30)+(prnddiv(t,6e3)*exp(t*-20)*(t<.08?fract(t*-55)**3:1))*2,1.1)),
  s:.35
 },
 hihat:{
  f:t=>powify(powify(sin(t*22e3),.4)*powify(sin(t*37e3),.5)*prnddiv(t,5e2)*exp(t*-40)+sin((t+93.2)*9.5e3+sin((t+.453)*11.2e20)*20)*exp(t*-20)*.2+sin(t*11.3e3+sin((t+.5292)*6e20)*30)*exp(t*-10)*.1,.7)*max(min(1,(.4-t)/.5),0)*.4,
  s:.4
 },
 tom:{
  f:t=>tanh(powify(sin(1215*t),.9)*min(1,t/.004)*exp(t*-41)+powify(sin(1110*t),2)*min(1,t/.004)*exp(t*-71)+powify(sin(610*t),4)*min(1,t/.003)*exp(t*-10)*.4+powify(prnddiv(t,1000),.4)*exp(t*-27)*.04)*max(min(1,(.3-t)/.5),0),
  s:.3
 }
};
read=(a,i)=>a[mod(floor(i),a.length)];
readlin=(a,i)=>mix(a[mod(floor(i),a.length)],a[mod(floor(i)+1,a.length)],fract(i))
for(let k in samples){
 let s=samples[k],
     b=new Float32Array(s.s*SR);
 for(let i=0;i<s.s*SR;i++){
  b[i]=s.f(i/SR);
 }
 s.b=b;
}
stretch=(x,space=.1,pitch=1,jump=.1)=>{
 let base=floor(space*x)*jump;
 return{
  a:base+mod(x,1/space)*pitch,
  b:(base+(mod(x,1/space)-(1/space))*pitch)+jump,
  t:fract(x*space)
 };
};
buf=new Float32Array(SR*12);
[..."khhhchhkhkkhchhtkhhkchhkhthkchhc".repeat(4)].map(
 c=>({k:"kick",h:"hihat",c:"clap",t:"tom"}[c])
).forEach((k,i,a)=>{
 let vel=mix(.2,.8,prnd(i)),
     sp=mix(.1,4.9,prnd(i+.6)),
     at=((buf.length/a.length)*i)+(prnd(i+.4)*500*(i%2)),
     len=mix(.1,1,prnd(i+.4)),
     e=mix(.8,1.1,prnd(i+.35)),
     layer=prnd(i+.34)<.5?1:0,add=mix(-.06,.06,prnd(i+.34)),
     stretchit=prnd(i+.24)<.3?1:0,params=[mix(1e-4,800,prnd(i+.22)**1.4),mix(.8,1.3,prnd(i+.12)),mix(.01,31,prnd(i+.25))**.4],
     iter=floor((samples[k].s/sp)*SR*len);
 for(let j=0;j<iter;j++){
  if(stretchit){
   let strParm=stretch(j/SR,params[0],params[1],params[2]);
   buf[mod(floor(at)+j,buf.length)]+=mix(readlin(samples[k].b,strParm.a*sp*SR),readlin(samples[k].b,strParm.b*sp*SR),strParm.t)*vel*min(1,(iter-j)/64);
  }else{
   buf[mod(floor(at)+j,buf.length)]+=readlin(samples[k].b,(((j/SR)*sp)**e)*SR)*vel*min(1,(iter-j)/64);
   if(layer)buf[mod(floor(at)+j,buf.length)]+=readlin(samples[k].b,(((j/SR)*(sp+add))**e)*SR)*vel*min(1,(iter-j)/64);
  }
 }
});
return t=>{
 t*=.82;
 return [tanh((readlin(buf,t*SR)+(readlin(buf,t*SR*.5)-readlin(buf,mod(t,buf.length/(SR*2))*SR*.5008))*.5)*2)*.5+read(buf,t*SR*.25)*.2,tanh((readlin(buf,t*SR)+(readlin(buf,t*SR*.5)-readlin(buf,mod(t,buf.length/(SR*2))*SR*.5004))*.5)*2)*.5+read(buf,(t*SR*.5)+buf.length*.5)*.4];
};