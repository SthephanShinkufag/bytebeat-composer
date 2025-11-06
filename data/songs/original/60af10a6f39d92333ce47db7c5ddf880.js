let nHz=n=>288*2**((n-12)/12),
    TAU=Math.PI*2,
    sine=x=>Math.sin(TAU*x),
    mod=(n,m)=>(n%m+m)%m,
    skew=(x,p)=>x<.5?((2*x)**p)*.5:1-(((2*(1-x))**p)*.5);
if(typeof sampleRate==="undefined")
    sampleRate=48000;
class Flanger{
  constructor(sampleRate,freq=.4,feedback=.75,depth=.33){
    this.sampleRate=sampleRate;
    this.buffer=new Float32Array(0);
    this.writeIndex=0;
    this.lfoPhase=0;
    this.lfoFrequency=freq;
    this.setDepth(depth); //0-1 modulation depth
    this.feedback=-feedback;
    this.mix=.66;
    this.updateBuffer();
  }
  updateBuffer(){
    const maxModulationMs=10, //max 10ms modulation
          fixedDelayMs=1, //fixed 1ms delay
          maxDelay=(fixedDelayMs+maxModulationMs)*this.sampleRate/1000;
    this.buffer=new Float32Array(Math.ceil(maxDelay)+1);
  }
  setDepth(depth){this.depth=Math.min(1,Math.max(0,depth));this.updateBuffer();}
  process(input){
    //update LFO
    this.lfoPhase=(this.lfoPhase+(this.lfoFrequency/this.sampleRate))%1;
    const lfoValue=Math.sin(this.lfoPhase*TAU);
    //calculate modulated delay
    const baseDelay=1, //1ms fixed delay
          modulation=(lfoValue*.5+.5)*this.depth*10, //0-10ms modulation
          totalDelayMs=baseDelay+modulation,
          delaySamples=totalDelayMs*this.sampleRate/1000,
    //read delayed sample with interpolation
          readPos=this.writeIndex-delaySamples,
          bufferSize=this.buffer.length,
          index1=Math.floor(readPos),
          index2=index1+1,
          frac=readPos-index1,
          wrapped1=((index1%bufferSize)+bufferSize)%bufferSize,wrapped2=((index2%bufferSize)+bufferSize)%bufferSize,
          sample=this.buffer[wrapped1]*(1-frac)+this.buffer[wrapped2]*frac;
    //update buffer with feedback
    this.buffer[this.writeIndex]=input+sample*this.feedback;
    this.writeIndex=(this.writeIndex+1)%bufferSize;
    return sample*this.mix+input*(1-this.mix);
  }
}

let L=[ //chords
  [8,11,15,18,22],
  [17,20,24,27],
  [10,13,17,20,24],
  [13,15,19,22]
],M=[
  29,11,34,18,17,15,17,20,
  32,27,29,24,25,18,17,15,
  ,,,18,17,15,17,20,
  ,,,,29,24,25,10,
  13,11,10,18,17,15,17,20,
  25,27,29,24,25,32,,,
  ,,,18,17,15,17,20,
  ,,,,29,24,25,10];
//voice management system
const MAX_VOICES=14;
let voices=Array(MAX_VOICES).fill().map(()=>({
  freq:0,
  phase:0,
  env:0,
  envState:0, //0=off, 1=attack, 2=decay, 3=sustain, 4=release
  envCounter:0, //samples counter for envelope stages
  velocity:0,
  age:0
})),
    attack=.0009,decay=.2,sustain=.4,release=1.5,
    arpDelaySamples=Math.round(.03*sampleRate),samplesSinceLastEvent=0,arpCounter=0,arpIndex=0;
//voice allocation function
function getFreeVoice(/*freq*/){
  let oldestReleased=-1,
      maxAge=-1;
  for(let i=0;i<MAX_VOICES;i++)
    if(voices[i].envState===0||voices[i].envState===4){
      if(voices[i].age>maxAge){
        maxAge=voices[i].age;
        oldestReleased=i;
      }
    }
  if(oldestReleased!==-1)return oldestReleased;
  let oldest=0;
  maxAge=voices[0].age;
  for(let i=1;i<MAX_VOICES;i++)
    if(voices[i].age>maxAge){
      maxAge=voices[i].age;
      oldest=i;
    }
  return oldest;
}
let activeNotes=new Set();
//play a note
function noteOn(freq,velocity=1){
  const i=getFreeVoice(freq);
  activeNotes.add(i);
  voices[i].freq=freq+((Math.random()*2)-1)*2;
  voices[i].phase=Array(3).fill(0);
  voices[i].envState=1; //attack
  voices[i].envCounter=0;
  voices[i].velocity=velocity;
  voices[i].age=0;
  return i;
}
//release a note
function noteOff(/*freq*/id){ //TODO: Why not keep track of IDs instead?
  /*for(let i=0;i<MAX_VOICES;i++)
    if(Math.abs(voices[i].freq-freq)<.1&&voices[i].envState!==0){
      voices[i].envState=4; //release
      voices[i].envCounter=0;
    }*/
  activeNotes.delete(id);
  if(id===-1)return;
  voices[id].lastEnv=voices[id].env;
  voices[id].envState=4;
  voices[id].envCounter=0;
}
//current playing notes
let currentChord=0,
    lastBeat=-1,
    lastMel=-1,lastMelID=-1,
    chordSet=new Set(),
    flanger=[new Flanger(sampleRate,.12,.9,.33),new Flanger(sampleRate,.16,.9,.36)];
flanger[1].lfoPhase+=.4;
return t=>{
  //update timing
  samplesSinceLastEvent++;
  arpCounter++;
  //update chord progression
  let beat=mod(t*.7,L.length*2),
      currentBeat=Math.floor(beat)%4,
      currentMel=mod(Math.floor(beat*8),M.length);
  if(currentMel!==lastMel){
    lastMel=currentMel;
    if(M[currentMel]!==undefined){
      noteOff(lastMelID);
      lastMelID=noteOn(nHz(M[currentMel]),.5);
    }
  }
  //check for chord change
  if(currentBeat!==lastBeat||mod(beat,1)>.6){
    lastBeat=currentBeat;
    //release all current notes
    for(let note of chordSet)
      noteOff(/*nHz(note)*/note);
    chordSet.clear();
    //reset arpeggio
    arpIndex=0;
    arpCounter=0;
  }
  //trigger arpeggiated notes
  const chordNotes=L[currentBeat];
  if(arpIndex<chordNotes.length&&arpCounter>=arpDelaySamples){
    const note=chordNotes[arpIndex];
    //activeNotes.add(note);
    chordSet.add(noteOn(nHz(note),.7+.3*Math.random()));
    arpIndex++;arpCounter=0;
  }  
  //process voices
  let out=0;
  for(let i=0;i<MAX_VOICES;i++){
    const voice=voices[i];
    voice.age++;
    voice.envCounter++;
    //update envelope
    switch(voice.envState){
      case 1: //attack
        if(attack>0){
          voice.env=Math.min(1,voice.envCounter/(attack*sampleRate));
          if(voice.env>=1){
            voice.envState=2;
            voice.envCounter=0;
          }
        }else{
          voice.env=1;
          voice.envState=2;
        }
      break;
      case 2: //decay
        if(decay>0){
          const decayProgress=voice.envCounter/(decay*sampleRate);
          voice.env=Math.max(sustain,1-decayProgress*(1-sustain));
          if(voice.env<=sustain)
            voice.envState=3;
        }else{
          voice.env=sustain;
          voice.envState=3;
        }
      break;
      case 3: //sustain
      //just maintain the level
      break;  
      case 4: //release
        if(release>0){
          voice.env=/*sustain*/voice.lastEnv*(1-Math.min(1,voice.envCounter/(release*sampleRate)));
          if(voice.env<=.001){
            voice.env=0;
            voice.envState=0;
          }
        }else{
          voice.env=0;
          voice.envState=0;
        }
        break;
    }
    //generate sound if active
    if(voice.env>0&&voice.freq>0){
      //add a bit of detune for richness
      let wave=0;
      for(let j=0;j<voice.phase.length;j++){
        let detune=j*.003+sin((t-j)*20)*.01;
    voice.phase[j]+=(voice.freq*(1+detune))/sampleRate;
        wave+=sine(skew(mod(voice.phase[j],1),0.4+(voice.age/sampleRate)*.4));
      }
      wave+=sine(voice.phase[0]*3);
      //apply envelope and velocity
      out+=wave*voice.env*voice.velocity;
    }
  }
  out+=((Math.random()*2)-1)*(1-mod(beat*4,1))**10;
  //soft clipping and output limiting
  return[Math.tanh(flanger[0].process(out*.05)),Math.tanh(flanger[1].process(out*.05))];
};