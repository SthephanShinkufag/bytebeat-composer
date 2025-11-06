let realSampleRate=48000;
let sampleRate=realSampleRate/2;
class Envelope{
  constructor(attack=.1,decay=.1,sustain=.5,releaseTime=.1){
    Object.assign(this,{attack,decay,sustain,releaseTime});
    this.reset();
  }
  reset(){this.stage="attack";this.value=0;this.time=0;this.active=false;}
  trigger(){this.reset();this.active=true;}
  release(){if(this.active&&this.stage!=="release"){this.stage="release";this.time=0;}}
  process(dt){
    if(!this.active)return 0;
    this.time+=dt;
    switch(this.stage){
      case"attack":
        this.value+=dt/this.attack;
        if(this.value>=1){
          this.value=1;this.stage="decay";this.time=0;
        }
      break;
      case"decay":
        this.value=1-(1-this.sustain)*(this.time/this.decay);
        if(this.time>=this.decay){
          this.value=this.sustain;this.stage="sustain";
        }
      break;
      //case"sustain":break;
      case"release":
        this.value-=dt/this.releaseTime;
        if(this.value<=0){
          this.value=0;this.active=false;
        }
      break;
    }
    return this.value;
  }
}
class FMVoice{
  constructor(){
    this.operators=[];
    this.active=false;
    this.noteFrequency=0;
    this.modMatrix=[];
    this.carriers=[];
    this.ratios=[];
  }
  init(frequency,ratios,modMatrix,envelopes,carriers){
    this.noteFrequency=frequency;
    this.ratios=ratios;
    this.modMatrix=modMatrix;
    this.carriers=carriers;
    this.operators=ratios.map((ratio,i)=>({
      phase:0,envelope:new Envelope(...envelopes[i]),ratio:ratio,output:0
    }));
    this.active=true;
    this.operators.forEach(op=>op.envelope.trigger());
  }
  process(){
    if(!this.active)return 0;
    let output=0;
    const dt=1/sampleRate,
          modulation=new Array(this.operators.length).fill(0);
    //calculate modulation from each operator
    for(let i=0;i<this.operators.length;i++){
      const op=this.operators[i],
            env=op.envelope.process(dt);
      op.output=Math.sin(op.phase*Math.PI*2)*env;
      for(let j=0;j<this.operators.length;j++)
        modulation[j]+=op.output*this.modMatrix[i][j];
    }
    //update phases and sum carrier outputs
    for(let i=0;i<this.operators.length;i++){
      const op=this.operators[i],
            freq=this.noteFrequency*op.ratio+modulation[i];
      op.phase=(op.phase+freq*dt)%1;
      if(this.carriers.includes(i))
        output+=op.output;
    }
    //check if voice should deactivate
    if(this.operators.every(op=>!op.envelope.active))
      this.active=false;
    return output;
  }
}
class FMSynth{
  constructor(maxVoices=8,numOperators=4){
    this.maxVoices=maxVoices;
    this.numOperators=numOperators;
    this.voices=Array(maxVoices).fill().map(()=>new FMVoice(sampleRate));
    //default parameters
    this.ratios=Array(numOperators).fill(1);
    this.modMatrix=Array(numOperators).fill().map(()=>Array(numOperators).fill(0));
    this.envelopes=Array(numOperators).fill().map(()=>[.01,.1,.5,.3]);
    this.carriers=[numOperators-1];
  }
  noteOn(frequency,velocity=1){
    const voice=this.voices.find(v=>!v.active);
    if(!voice)return;
    //apply velocity sensitivity (simple implementation)
    const scaledEnvelopes=this.envelopes.map(env=>[
      env[0]*(2-velocity),
      env[1]*(2-velocity),
      env[2]*velocity,
      env[3]
    ]);
    voice.init(frequency,this.ratios,this.modMatrix,scaledEnvelopes,this.carriers);
  }
  noteOff(frequency){
    this.voices.forEach(voice=>{
      if(voice.active&&Math.abs(voice.noteFrequency-frequency)<.1)
        voice.operators.forEach(op=>op.envelope.release());
    });
  }
  process(){
    let output=0;
    this.voices.forEach(voice=>{
      output+=voice.process();
    });
    return output;
  }
  setAlgorithm(matrix,carriers){this.modMatrix=matrix;this.carriers=carriers;}
  setEnvelope(operator,attack,decay,sustain,release){this.envelopes[operator]=[attack,decay,sustain,release];}
  setFrequencyRatio(operator,ratio){this.ratios[operator]=ratio;}
  setModulationDepth(source,target,depth){this.modMatrix[source][target]=depth;}
}
let synth=new FMSynth();
synth.setAlgorithm([
  [.2,301.5,0,.3],
  [0,0,4,0],
  [300,0,0,2],
  [0,940,0,100]
],[1,3]);
synth.ratios=[.1,3.2,1.4,1];
let seq={
  notes:[ //[start,freq,length]
    [0,200,.3],[.25,1e3,.03],[.75,550,.2],
    [1,200,.1],[1.5,40,.1],[1.6,9e3,.05],
    [2,200,.1],[2.5,403,.1],[2.75,10e3,.1],
    [3.25,200,.3],[3.5,1e3,.01],[3.75,9e3,.05],
    [4,200,.3],[4.5,40,.1],[4.75,550,.2],
    [5,200,.1],[5.5,303,.01],
    [6,200,.2],[6.5,93,.1],[6.75,10e3,.1],
    [7.25,200,.3],[7.5,3e3,.01],
    
    [0,10,1.3],[2.25,43,2],[4,20,1.3],[6.5,30,1.3]
  ].sort((a,b)=>a[0]-b[0]),
  loop:8,speed:2.7,
  t:0,i:0,scheduled:[],
  process(){
    for(let i=this.i;i<this.notes.length;i++){
      const note=this.notes[i];
      if(this.t>=note[0]){
        synth.noteOn(note[1]);
        this.scheduled.push({freq:note[1],end:note[2],tick:0});
        synth.setEnvelope(Math.floor(Math.random()*synth.numOperators),(Math.random()**45)*.1,Math.random()*.2,Math.random(),(Math.random()**40)*4);
        this.i=i+1;
      }else{
        break;
      }
    }
    this.scheduled=this.scheduled.filter(({freq,end,tick},i)=>{
      if(tick>=end){
        synth.noteOff(freq);
        return false;
      }
      this.scheduled[i].tick+=1/sampleRate;
      return true;
    });
    this.t+=this.speed/sampleRate;
    if(this.t>=this.loop){this.t%=this.loop;this.i=0;}
  }
};
return(t,sR)=>{sampleRate=sR;
    seq.process();
    synth.modMatrix[0][0]=1+Math.sin(t*8.4)*200;
    synth.modMatrix[1][1]=200+Math.sin(t*2)*1e3;
    synth.modMatrix[3][1]=200+Math.sin(t*1.3)*3e3;
    return Math.tanh(synth.process()+((1-((seq.t*2)%1))**9)*Math.random()*.1);
};