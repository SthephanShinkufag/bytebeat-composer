let chordDic={ //integer notation excluding 0 (root)
  "":[4,7], //Major
  maj7:[4,7,11],maj9:[4,7,11,14],
  m:[3,7], //minor
  m7:[3,7,10],m9:[3,7,10,14],m11:[3,7,10,14,17],
  m7b5:[3,6,10],
  6:[4,7,9],
  7:[4,7,10], //dominant seventh
  "7b5":[4,6,10],"7#5":[4,8,10],
  5:[7], //fifth/power chord
  dim:[3,6],dim7:[3,6,9], //diminished
  aug:[4,8],aug7:[4,8,10], //augmented
  sus2:[2,7],sus4:[5,7],sus24:[2,5,7],"6sus2":[2,7,9],"7sus2":[2,7,10],"7sus4":[5,7,10],"9sus4":[5,7,10,14], //suspended
  maj7sus2:[2,7,11],
  mM7:[3,7,11],
  add2:[2,4,7],add9:[4,7,14],
  "6/9":[4,7,9,14],
  m6:[3,7,9],"m6/9":[3,7,9,14],
  m7b6:[3,7,8,10]
},noteDic={A:0,"A#":1,Bb:1,B:2,C:3,"C#":4,Db:4,D:5,"D#":6,Eb:6,E:7,F:8,"F#":9,Gb:9,G:10,"G#":11,Ab:11};
[",M,Maj,maj,△","m,min,-","7b5,7-5","7#5,7+5","dim,°","dim7,°7","aug,+","aug7,+7","mM7,mmaj7","m7b6,m7b13"].forEach(s=>{for(let a=s.split(","),i=1;i<a.length;i++)chordDic[a[i]]=chordDic[a[0]];});//console.log("Chords: "+JSON.stringify(chordDic));
function stringToChords(progStr){
  let list=progStr.split(/, *| +/gm),result=[];
  for(let str of list){
    let m=str.match(/^([2-8]?)([A-G][#b]?)(.*)/),shift=-2;
    //console.log(m);
    let root=noteDic[m[2]],
        c=[root,...chordDic[m[3]].map(n=>root+n)],
        times=m[1]?+m[1]:1;
    for(let i=0;i<times;i++)
      result.push([root-24,root-12,...c.map((n,i)=>(mod(n-shift,12)+shift)/*+(i%3===2)*12*/)]);
  }
  return result;
}
const TAU=Math.PI*2;
let nHz=n=>455*(2**(n/12)),
    mod=(n,m)=>(n%m+m)%m,fract=x=>(x%1+1)%1,
    sine=x=>Math.sin(x*TAU),
    prog=stringToChords("Bmaj7 D7 Gmaj7 Bb7 2Ebmaj7 Am7 D7 Gmaj7 Bb7 Ebmaj7 F#7 2Bmaj7 Fm7 Bb7 2Ebmaj7 Am7 D7 2Gmaj7 C#m7 F#7 2Bmaj7 Fm7 Bb7 2Ebmaj7 C#m7 F#7"/*"2Am11 2Em11 2Dm11 2G9sus4, 2Am11 2Em11 2Gm11 2Dm11"*//*"Bmaj7 Bm7 Bbm7 Ebm7 Abm7 Db7 Gbmaj7 Gb7, Bm9 Em11 Ebm7b6 Abm9 Dbm11 F#9sus4 Bmaj9 Am6/9, Abm11 Dbm9 F#9sus4 Bmaj7sus2 Bbm7b6 Ebm11 Dmaj9 Dbm7b6, 2Bmaj9 2Abm11 2Dbm11 E6sus2 F#7sus4 2Ebm7b6 Abm7b6 D7b5 2Dbm11 2F#9sus4"*/),
    waveExpr=[ //from 0 to 1
  sine,
  x=>1-2*Math.abs((2*x+.5)%2-1), //triangle wave
  x=>x<.5?1-x:x-1.5,
  //OPL3 waveforms
  x=>Math.max(sine(x),0), //half-sine
  x=>Math.abs(sine(x)), //abs-sine; two bumps
  x=>Math.abs(sine(x))*(x%.5<.25), //pulse-sine
  x=>x<.5?sine(x*2):0, //even-sine
  x=>x<.5?Math.abs(sine(x*2)):0, //even-abs-sine
  x=>x<.5?1:-1, //square
  x=>(Math.abs(1-x*2)**1.5)*(x<.5?1:-1), //log sawtooth
  //sines
  x=>(sine(x)+sine(x*2))/1.760173,
  x=>(sine(x)+sine(x*3))/1.539601,
  x=>(sine(x)+sine(x*4))/1.928208,
  x=>(sine(x)+sine(x*5))/2,
  x=>(sine(x)+sine(x*6))/1.966832
],mix=(a,b,x)=>a+(b-a)*x,
    read=(a,i)=>a[mod(Math.floor(i),a.length)],
    readLinear=(a,i)=>mix(a[mod(Math.floor(i),a.length)],a[mod(Math.floor(i)+1,a.length)],fract(i)),
    wavefold=x=>Math.abs(mod(x-1,4)-2)-1, //bounce from -1 to 1
    WT_SIZE=1024,wavetables=waveExpr.map(f=>{
  let a=new Float32Array(WT_SIZE);
  for(let i=0;i<WT_SIZE;i++)a[i]=f(i/WT_SIZE);
  return a;
}),
    randRange=(a,b)=>mix(a,b,Math.random()),
    pickRand=a=>a[Math.floor(Math.random()*a.length)],
    sampleRate=8e3;
class Voice{
  constructor(freq){
    this.freq=[freq+((Math.random()*2)-1)*7,freq*pickRand([1,.5,.25])+((Math.random()*2)-1)*3];
    this.oT=[0,0]; //oscillator time
    this.time=0;
    this.attack=randRange(.005,.1);
    this.duration=randRange(.0,.2);
    this.release=randRange(.1,1.5);
    this.lifespan=this.attack+this.duration+this.release;
    this.getAmp=t=>{
      if(t<this.attack){
        return t/this.attack;
      }else if(t<this.attack+this.duration){
        return 1;
      }else if(t<this.attack+this.duration+this.release){
        return 1-((t-(this.attack+this.duration))/this.release);
      }
      return 0;
    }
    this.sign=Math.random()<.5?1:-1;
    this.pan=Math.random();
    this.table=[pickRand(wavetables),pickRand(wavetables)];
    this.exp=randRange(.05,.6);
    this.useFM=Math.random()<.7;
    this.pitchShift=(Math.random()**3)*30*this.sign;
  }
  play(){
    let t=this.time,
        o=this.useFM?readLinear(this.table[0],(this.oT[0]+=(this.freq[0]*mix(readLinear(this.table[1],(this.oT[1]+=this.freq[1]/sampleRate)*WT_SIZE),0,(t/this.lifespan)**this.exp))/sampleRate)*WT_SIZE):readLinear(this.table[0],(this.oT[0]+=this.freq[0]/sampleRate)*WT_SIZE)+readLinear(this.table[1],(this.oT[1]+=this.freq[1]/sampleRate)*WT_SIZE);
    this.freq[0]+=this.pitchShift/sampleRate;
    this.time+=1/sampleRate;
    return o*this.getAmp(t)*this.sign;
  }
}
let voices=[],MAX_VOICES=150,genEvery,tick=0;
return(t,SR)=>{sampleRate=SR;
  genEvery=sampleRate/10;
  tick++;
  let c=read(prog,t*.6);
  if(tick>=genEvery){
    tick%=genEvery;
    for(let n of c)
      if(voices.length<MAX_VOICES)voices.push(new Voice(nHz(n)));
  }
  let o=0;
  for(let n of c)
    o+=sine(t*nHz(n-.06))+sine(t*nHz(n+.06));
  o=voices.reduce((prev,voice,i)=>{
    let o=voice.play();
    if(voice.time>voice.lifespan)voices.splice(i,1);
    return[prev[0]+o*voice.pan,prev[1]+o*(1-voice.pan)];
  },[o*.1,o*.1]);
  return[Math.tanh(o[0]*.1),Math.tanh(o[1]*.1)];
};