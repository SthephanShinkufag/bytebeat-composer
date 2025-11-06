let sampleRate=32000,TAU=Math.PI*2,mod=(n,m=1)=>(n%m+m)%m,mix=(a,b,x)=>a+x*(b-a),
    cosPulse=x=>x>=0&&x<1?.5-.5*Math.cos(TAU*x):0;

class CombFilter{
  constructor(maxLength,gain){
    this.buffer=new Array(maxLength).fill(0);
    this.maxLength=maxLength;
    this.gain=gain;
    this.pos=0;
    this.currentLimit=maxLength;
  }
  setTime(time){this.currentLimit=Math.max(1,Math.floor(time*this.maxLength));}
  process(input){
    const read=this.buffer[this.pos];
    this.buffer[this.pos]=read*this.gain+input;
    this.pos=(this.pos+1)%this.currentLimit;
    return read;
  }
}
class AllpassFilter{
  constructor(maxLength,gain){
    this.buffer=new Array(maxLength).fill(0);
    this.maxLength=maxLength;
    this.gain=gain;
    this.pos=0;
    this.currentLimit=maxLength;
  }
  setTime(time){this.currentLimit=Math.max(1,Math.floor(time*this.maxLength));}
  process(input){
    const delayed=this.buffer[this.pos],
          output=delayed-this.gain*input;
    this.buffer[this.pos]=input+this.gain*output;
    this.pos=(this.pos+1)%this.currentLimit;
    return output;
  }
}
class Reverb{
  constructor(sampleRate){
    this.combs=[ //initialize comb filters with Schroeder parameters
      new CombFilter(6920+int(Math.random()*2),.805), //3460*2
      new CombFilter(5976+int(Math.random()*2),.827), //2988*2
      new CombFilter(7764+int(Math.random()*2),.783), //3882*2
      new CombFilter(8624+int(Math.random()*2),.764) //4312*2
    ];
    this.allpasses=[
      new AllpassFilter(960+int(Math.random()*2),.7), //480*2
      new AllpassFilter(322+int(Math.random()*2),.7), //161*2
      new AllpassFilter(92+int(Math.random()*2),.7) //46*2
    ];
    this.wet=1;
    this.time=1;
    this.updateTime();
  }
  setTime(time){this.time=Math.min(1,Math.max(0, time));this.updateTime();}
  setWet(wet){
    this.wet=Math.min(1,Math.max(0,wet));
  }
  updateTime(){
    this.combs.forEach(comb=>comb.setTime(this.time));
    this.allpasses.forEach(allpass=>allpass.setTime(this.time));
  }
  process(input){
    //process through parallel comb filters
    const combSum=this.combs.reduce((sum,comb)=>sum+comb.process(input),0)/4;
    //process through series allpass filters
    let allpassOut=combSum;
    for(const allpass of this.allpasses)
      allpassOut=allpass.process(allpassOut);
    return(1-this.wet)*input+this.wet*allpassOut;
  }
}
let mR=(n=3,w=.4)=>{
  let r=[];
  for(let i=0;i<n;i++){
    r.push(new Reverb(sampleRate))
    r[i].setTime(.3+Math.random()*.3);
    r[i].wet=w;
  }
  return x=>r.reduce((p,c)=>c.process(p),x)
},r=mR(),r2=mR(1,.3);

class MoogLadderFilter{
  constructor(sampleRate){
    this.sampleRate=sampleRate;
    this.fc=20000;this.resonance=0;this.gain=1;
    this.y=new Float32Array(5).fill(0);this.yprev=new Float32Array(5).fill(0);
    this.W=new Float32Array(3).fill(0);this.Wprev=new Float32Array(3).fill(0);
    this.Vt=.025; //Thermal voltage (25mV)
    this.Vtx2=.05; //2*Vt
    this.updateG();
  }
  setCutoff(fc){
    this.fc=Math.min(Math.max(fc,20),20000);
    this.updateG();
  }
  updateG(){
    //calculate g parameter from cutoff frequency
    const alpha=(-Math.PI/2)*(this.fc/this.sampleRate);
    this.g=1-Math.exp(alpha);
    this.Vtx2xg=this.Vtx2*this.g;
  }
  process(input){
    const Vtx2xg=this.Vtx2xg,resonance=this.resonance;
    for(let m=0;m<2;m++){
      let theta=input-4*resonance*this.yprev[4]/this.Vtx2;
      this.y[0]=this.yprev[0]+Vtx2xg*(Math.tanh(theta)-this.Wprev[0]);
      for(let k=0;k<3;k++){
        theta=this.y[k]/this.Vtx2;
        this.W[k]=Math.tanh(theta);
        if(k!==2)this.y[k+1]=this.yprev[k+1]+Vtx2xg*(this.W[k]-this.Wprev[k+1]);
      }
      theta=this.yprev[3]/this.Vtx2;
      this.y[3]=this.yprev[3]+Vtx2xg*(this.W[2]-Math.tanh(theta));
      this.y[4]=(this.y[3]+this.yprev[3])*.5;
      this.yprev.set(this.y.subarray(0,3),0);
      this.Wprev.set(this.W.subarray(0,3),0);
      this.yprev[3]=this.y[3];
      this.yprev[4]=this.y[4];
    }
    return this.y[4]*this.gain;
  }
}
/* FUCK YOU DOLLCHAN, THE CODE EDITOR SUCKS AND I HAD TO START FROM SCRATCH BECAUSE IT WOULDN'T COPY EVERYTHING WHAT I SELECTED
    while(readPos2<0)readPos2+=this.delayLineLength;
    const frac=offset-Math.floor(offset);
    this.delayLineOutput=this.delayLine[readPos]*(1-frac)+this.delayLine[readPos2]*frac;
    this.delayLineOutput=this.lp.tick(this.delayLineOutput,.95);
    this.delayLine[this.writePtr]=sample;
    this.writePtr=(this.writePtr+1)%this.delayLineLength;
    return this.delayLineOutput;
  }
}*/
class OnePoleLP{
  constructor(){this.outputs=0;}
  tick(sample,cutoff){
    const adjustedCutoff=cutoff*.98,p=adjustedCutoff**4;
    this.outputs=(1-p)*sample+p*this.outputs;
    return this.outputs;
  }
}
class Chorus{
  constructor(sampleRate,phase,rate,delayTime){
    this.sampleRate=sampleRate;
    this.rate=rate;
    this.delayTime=delayTime;
    this.lfoPhase=(phase*2)-1;
    this.lfoStepSize=(4*rate)/sampleRate;
    this.lfoSign=1;
    const baseDelaySamples=Math.floor((delayTime*sampleRate)/1e3);
    this.delayLineLength=Math.max(baseDelaySamples*2,1);
    this.delayLine=new Float32Array(this.delayLineLength).fill(0);
    this.writePtr=this.delayLineLength-1;
    this.lp=new OnePoleLP();
    this.z1=0;
  }
  process(sample){
    const lfoValue=this.nextLFO(),offsetSamples=(lfoValue*.3+.4)*(this.delayTime*this.sampleRate)/1e3,
          integerPart=Math.floor(offsetSamples),fractional=offsetSamples-integerPart,readPos=mod(this.writePtr-integerPart,this.delayLineLength),readPos2=mod(readPos-1,this.delayLineLength),
          val1=this.delayLine[readPos],val2=this.delayLine[readPos2],interpolated=val2+val1*(1-fractional)-(1-fractional)*this.z1;
    this.z1=interpolated;
    const filtered=this.lp.tick(interpolated,.95);
    this.delayLine[this.writePtr]=sample;
    this.writePtr=(this.writePtr+1)%this.delayLineLength;
    return filtered;
  }
  nextLFO(){
    if(this.lfoPhase>=1)
      this.lfoSign=-1;
    else if(this.lfoPhase<=-1)
      this.lfoSign=1;
    this.lfoPhase+=this.lfoStepSize*this.lfoSign;
    return this.lfoPhase;
  }
}

let cM=()=>{
  let c=[new Chorus(sampleRate,3,mix(.1,.4,Math.random()),23),new Chorus(sampleRate,0,mix(.1,.4,Math.random()),29),new Chorus(sampleRate,2,mix(.1,.4,Math.random()),30)];
  return x=>x-c[0].process(x)-c[1].process(x)-c[2].process(x);
};

let read=(a,i)=>a[mod(Math.floor(i),a.length)],
    readS=(a,i)=>mix(a[mod(Math.floor(i),a.length)],a[mod(Math.floor(i)+1,a.length)],mod(i)),
    rand=(a,b)=>mix(a,b,Math.random()),g=()=>{
  let smp=new Float32Array(sampleRate),
      a=()=>{
    let freq=[rand(200,1e3),rand(100,2e2)],
        start=Math.random(),
        p=rand(.01,.4);
    for(let t,i=0;i<smp.length;i++){
      t=i/sampleRate;
      smp[i]+=sin(TAU*t*freq[0])*sin(TAU*t*freq[1])*cosPulse(mod(t-start)**p);
    }
  };
  for(let i=0;i<25;i++)a();
  return smp;
};

let sH=(x,n,p)=>Math.sin(TAU*(x*n+p)),osc=(h=1)=>{
  let t=0,table=new Float32Array(8e3);
  for(let n=1;n<=h;n++){
    let p=Math.random(),a=Math.random();
    for(let i=0;i<table.length;i++){
      let x=i/table.length;
      table[i]+=sH(x,n,p)*a;
    }
  }
let[min,max]=[Math.min(...table),Math.max(...table)],r=max-min;
r&&table.forEach((v,i,a)=>a[i]=2*(v-min)/r-1);
  return p=>{
    t=mod(t+(p/sampleRate));
    return readS(table,t*table.length);
  };
};
let tmj=(()=>{
  let d=()=>{
    let F=()=>{let o=[osc(7),osc(3),osc(4),osc(2)],rv=[rand(100,600),rand(30,400),rand(1,1e3),rand(2,10)],f=t=>{return(o[0](rv[0]*mix(1,o[1](rv[1]),t))+o[2](rv[2])*o[3](40))*(1-t)**3;};return t=>f(mod(t,1+mod(sin(t+rv[3]*.5)**2)));},Fa=[F(),F(),F()];
    return t=>{return Fa[0](t+7)+
+Fa[1](t+9)+Fa[2](t+2);};},tm={mx:rand(5,11),t:0,cf:d()};
  return()=>{
    tm.t+=1/sampleRate;
    if(tm.t>=tm.mx){
      tm.t%=tm.mx;
      tm.cf=d();
    }
    return tm.cf(tm.t)*.3;
  };
})();

let f=new MoogLadderFilter(320),
    f2=new MoogLadderFilter(sampleRate)
    gS=g(),balancer=(p=1)=>{let m=0;return x=>x-(m=mix(m,x,p/sampleRate));},b=balancer(15),b2=balancer(15),c=[cM(),cM()];
f.resonance=1.4;
f2.resonance=.8;f2.gain=1e3;
return t=>{
  f.setCutoff(1200+Math.sin(t*1.4)*900);
  f2.setCutoff(2500+Math.sin(t*.5)*1200);
  let gl=r(f.process(Math.sin(t*.2)*.3)*2.6),o=b(f2.process(gl+readS(gS,t*sampleRate*.4)*.001+readS(gS,(t+sin(t*3)*.01)*sampleRate*.2)*.001))*2+Math.random()*.001;
  o-=b2(r2(tmj()))*.05;
  return[c[0](o),c[1](o)];
};