let f=(iter=1)=>{
  /*let p=0,v=0;
  return(x,s=1,m=.5)=>{
    v=(v+((x-p)*s))*m;
    return p+=v;
  }*/
  let p=Array(iter).fill(0),v=Array(iter).fill(0);
  return(x,s=1,m=.5)=>{
    let o=x;
    for(let i=0;i<iter;i++){
      v[i]=(v[i]+((o-p[i])*s))*m;
      o=p[i]+=v[i];
    }
    return o;
  }
},sampleRate=16e3,TAU=Math.PI,lf=f(4);//[...Array(5)].map(()=>f());
return t=>{
  let o=t*2%1<.005?1:0,
  m=.6,freq=1700+Math.sin(t*1.4)*1500,theta=TAU*freq/sampleRate,s=(-2*Math.cos(theta)*Math.sqrt(m)+m+1)/m;
  o+=(Math.random()-.5)*.2;
  o+=(t*33%1<.5+Math.sin(t)*.49?1:-1)*.2;
  o-=(t*32.6%1<.5+Math.sin(t)*.499?1:-1)*.2;
  o+=(t*330%1<.5?-1:1)*.02;
  /*for(let i=0;i<fL.length;i++)
    o=fL[i](o,s,m)*/
  return Math.tanh(lf(o,s,m));
};