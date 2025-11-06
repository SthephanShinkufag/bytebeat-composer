let mod=(n,m=1)=>(n%m+m)%m,
    flr=Math.floor,TAU=Math.PI*2,
    read=(a,i)=>a[mod(floor(i),a.length)],
    mix=(a,b,x)=>a+x*(b-a),
    readLerp=(a,i)=>mix(a[mod(floor(i),a.length)],a[mod(floor(i)+1,a.length)],mod(i)),
    rand=(...a)=>a.length===2?mix(a[0],a[1],Math.random()):a.length?Math.random()*a[0]:Math.random(),
    nHz=n=>440*2**(n/12),
    sine=x=>Math.sin(TAU*x),
    saw=x=>(mod(x)*2)-1,
    tri=x=>4*Math.abs(x-flr(x+(3/4))+(1/4))-1,
    pulse=x=>mod(x)<.5?-1:1,
    smoothPulse=(x,m=30)=>Math.tanh(Math.sin(TAU*x)*m);

let sampleRate=22050;

class BiquadFilter{
  constructor(type,cutoff=1000,Q=1,sR=sampleRate){
    this.type=type.toLowerCase();
    this.sampleRate=sR;
    this.cutoff=cutoff;this.Q=Q;
    this.dbGain=0; //for peaking and shelving filters
    this.a0=1;this.a1=0;this.a2=0;
    this.b0=1;this.b1=0;this.b2=0;
    this.x1=0;this.x2=0;this.y1=0;this.y2=0;
    this.updateCoefficients();
  }
  updateCoefficients(){
    const A=Math.pow(10,this.dbGain/40),
          omega=TAU*this.cutoff/this.sampleRate,
          sn=Math.sin(omega),cs=Math.cos(omega),
          alpha=sn/(2*this.Q),beta=Math.sqrt(A+A);
    let a0,a1,a2,b0,b1,b2;
    switch(this.type){
      case"lowpass":case"lp":b0=(1-cs)/2;b1=1-cs;b2=(1-cs)/2;a0=1+alpha;a1=-2*cs;a2=1-alpha;break;
      case"highpass":case"hp":b0=(1+cs)/2;b1=-(1+cs);b2=(1+cs)/2;a0=1+alpha;a1=-2*cs;a2=1-alpha;break;
      case"bandpass":case"bp":b0=alpha;b1=0;b2=-alpha;a0=1+alpha;a1=-2*cs;a2=1-alpha;break;
      case"notch":b0=1;b1=-2*cs;b2=1;a0=1+alpha;a1=-2*cs;a2=1-alpha;break;
      case"peak":b0=1+(alpha*A);b1=-2*cs;b2=1-(alpha*A);a0=1+(alpha/A);a1=-2*cs;a2=1-(alpha/A);break;
      case"lowshelf":
        b0=A*((A+1)-(A-1)*cs+beta*sn);b1=2*A*((A-1)-(A+1)*cs);b2=A*((A+1)-(A-1)*cs-beta*sn);
        a0=(A+1)+(A-1)*cs+beta*sn;a1=-2*((A-1)+(A+1)*cs);a2=(A+1)+(A-1)*cs-beta*sn;
      break;
      case"highshelf":
        b0=A*((A+1)+(A-1)*cs+beta*sn);b1=-2*A*((A-1)+(A+1)*cs);b2=A*((A+1)+(A-1)*cs-beta*sn);
        a0=(A+1)-(A-1)*cs+beta*sn;a1=2*((A-1)-(A+1)*cs);a2=(A+1)-(A-1)*cs-beta*sn;
      //default:throw new Error("Unknown filter type: "+this.type);
    }
    this.a0=1;this.a1=a1/a0;this.a2=a2/a0;
    this.b0=b0/a0;this.b1=b1/a0;this.b2=b2/a0;
  }
  process(sample){
    const output=this.b0*sample+this.b1*this.x1+this.b2*this.x2-this.a1*this.y1-this.a2*this.y2;
    this.x2=this.x1;this.x1=sample;this.y2=this.y1;this.y1=output;
    return output;
  }
  setCutoff(frequency){this.cutoff=Math.max(1,Math.min(frequency,this.sampleRate/2));this.updateCoefficients();}
  setResonance(Q){this.Q=Math.max(.01,Q);this.updateCoefficients();}
  setGain(gain){this.dbGain=gain;this.updateCoefficients();}
}

let rangeArray=n=>[...Array(n).keys()],
    createArray=(n,v)=>typeof v==="function"?Array.from({length:n},(_,i)=>v(i)):Array(n).fill(v),
    generate=()=>{
  let dur=rand(.1,.3),
      pow=rand(1,10),
      sample=new Float32Array(sampleRate*dur),sL=sample.length,
      pitches=new Array(4).fill(0).map(()=>rand(100,900)),
      filters=Array.from({length:4},()=>new BiquadFilter("BP",rand(200,2e3),rand(10,30)));
  for(let i=0;i<sL;i++){
    let t=i/sampleRate;
    for(let p of pitches)
      sample[i]+=.3*sine(t*p)*(1-(t/dur))**pow;
    for(let f of filters)
      sample[i]-=f.process(rand(-1,1))*(1-(t/dur));
  }
  return sample;
},samples=createArray(10,generate);

class CloudGenerator{
  constructor(buffers){
    this.grains=[];
    this.buffers=buffers;
    this.grainParams={spread:.1,duration:.3};
  }
  process(){
    let output=[0,0];
    for(let i=this.grains.length-1;i>=0;i--){
      const grain=this.grains[i];
      grain.age++;
      if(grain.age>=grain.durationSamples){this.grains.splice(i,1);continue;}
      const buf=this.buffers[grain.bufferIdx],
            pos=(grain.pos+grain.speed*grain.age)%buf.length,
            env=Math.sin(Math.PI*grain.age/grain.durationSamples),
            pan=Math.sin(grain.panPhase+grain.age*.01)*.8,
            sample=buf[Math.floor(pos)]*env*grain.amp;
      output[0]+=sample*(1-pan);
      output[1]+=sample*(1+pan);
    }
    return output;
  }
  spawnGrain(modulation){
    this.grains.push({
      bufferIdx:Math.floor(rand(0,this.buffers.length)),
      pos:rand(0,sampleRate*this.grainParams.spread*2),
      speed:rand(.8,1.2)*(1+modulation),
      amp:rand(.05,.2)*(.5+modulation),
      panPhase:rand(TAU),
      age:0,
      durationSamples:sampleRate*(this.grainParams.duration*rand(.8,1.2))
    });
  }
}

let cloud=new CloudGenerator(samples);
return t=>{
  let o=0;
  if(Math.random()<.003)cloud.spawnGrain(Math.random()*2)
  return cloud.process();
};