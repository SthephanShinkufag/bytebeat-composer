/*
HCDP DRUM BEAT PATTERN
NUMBERS - kick
x - hat
q - clap
c - hat+clap
y - hat+kick
k - clap+kick
*/
const BPM=160; //tempo
const dspd=4; //drum speed
drum=(w,a=0,b=0)=>{
   return (t,e=1)=>{
      const r=t*e*dspd%1/(e*dspd);
      i
      if(w=='clap')return a+=b+=((random()-.5)*(1/exp(r*4)**3.5*3%1)-a-b*4)/16;
      if(w=='kick')return min(.79,max(-.79,sin(256*cbrt(r))*(a+=(1/exp(r)**24-a)/3)))/3;
      if(w=='hiha')return (random()-.5)*(a+=(1/exp(r)**40-a)/128)/4;
   }
}
drmptn=(q=0)=>{
   this.e=0;
   this.c=drum('clap');
   this.i=drum('kick');
   this.j=drum('hiha');
   return (t,a)=>{
      if(a=='x')e=j(t);
      else if(a=='q')e=c(t);
      else if(a=='c')e=j(t)+c(t);
      else if(a=='y')e=j(t)+i(t);
      else if(a=='k')e=c(t)+i(t);
      else e=a==0?0:i(t,a);
      return q+=(e-q)/2;
   }
}
const dg=drmptn();
const df=drmptn();
//drum patterns
const d1='10k010c010k0111110q010q010q02222';
const d2='101q00q0103010q01y101300q01q1111';
const d3='1000q0100010q0q01000q01000100010';
const d4='1010001110100011q00q00q00q00q00q'
const l='length';
//MAIN
return t=>{
   t*=BPM/60;
   const drm=[d1,d2,d3,d4][(d=t*dspd)>>6&3];
   const w=(d)%drm[l]|0;
   return dg(t,drm[w])+df(t,'x0'[d&1]);
}