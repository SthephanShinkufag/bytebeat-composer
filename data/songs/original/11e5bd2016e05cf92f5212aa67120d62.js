const TAU=Math.PI*2;
let sampleRate=8e3,
    mod=(n,m)=>(n%m+m)%m,fract=x=>(x%1+1)%1,
    mix=(a,b,x)=>a+(b-a)*x,
    clamp=(x,mn,mx)=>Math.min(Math.max(x,mn),mx),
    read=(a,i)=>a[mod(Math.floor(i),a.length)],
    readLinear=(a,i)=>mix(a[mod(Math.floor(i),a.length)],a[mod(Math.floor(i)+1,a.length)],fract(i)),
    sinc=x=>x===0?1:Math.sin(x)/x,
    randRange=(a,b)=>a+(b-a)*Math.random(),
    sine=x=>Math.sin(x*TAU),
    saw=x=>(fract(x)-.5)*2,
    pulse=(x,c=.5)=>x<c?1:-1,
    tri=x=>1-4*Math.abs(x+.25-Math.floor(x+.25)-.5),
    pow2=(x,y)=>(Math.abs(x)**y)*Math.sign(x);
function sincInterpolate(array,x){
  let sum=0;
  for(let i=0;i<array.length;i++)sum+=array[i]*sinc(Math.PI*(x-i));
  return sum;
}
class RNG{
  constructor(seed){
    this.m=2**31;this.a=1103515245;this.c=12345;
    this.state=seed?seed:Math.floor(Math.random()*(this.m-1));
  }
  nextInt(){this.state=(this.a*this.state+this.c)%this.m;return this.state;}
  nextFloat(){return this.nextInt()/this.m;}
}
class RingBuffer{
  constructor(len){this.length=len;this.buffer=new Array(len).fill(0);this.i=0;}
  push(v){let old=this.buffer[this.i];this.buffer[this.i]=v;this.i=(this.i+1)%this.length;return old;}
  pushMultiple(...a){for(let v of a)this.push(v);}
  get(i){return this.buffer[mod(this.i+Math.floor(i),this.length)];}
  clear(v=0){for(let i=0;i<this.length;i++)this.buffer[i]=v;}
  orderedCopy(){let c=new Array(this.length);for(let i=0;i<this.length;i++)c[i]=this.get(i);return c;}
  //resize(s){/*figure out interpolation with boundaries*/}
  log(){console.log(`Buffer: [${r.buffer}]\nIndex: ${r.i}\nLength: ${r.length}\nChronological order: [${r.orderedCopy()}]`);}
}
class WaveDraw{
  constructor(len=256){this.buffer=new Array(len).fill(0);}
  draw(x0,y0,x1,y1){
    if(x1>x0)[x0,y0,x1,y1]=[x1,y1,x0,y0];
    if(x0===x1&&x0>=0&&x0<this.buffer.length)
      this.buffer[Math.floor(x0)]=y0;
    const m=(y1-y0)/(x1-x0),
          start=clamp(Math.floor(x0),0,this.buffer.length-1),
          end=clamp(Math.floor(x0),0,this.buffer.length-1);
    for(let i=start;i<=end;i++){
      const t=(i-x0)/(x1-x0);//if(t<0||t>1)continue;
      this.buffer[i]=y0+(i-x0)*m;
    }
  }
}
class ResoFilter{
  constructor(fOrFreq,reso,sps=sampleRate){
    this.f=/*fOrFreq*/2*Math.sin(Math.PI*fOrFreq/sps);
    this.reso=reso;this.fb=this.reso+this.reso/(1-this.f);
    this.y0=0;this.y1=0;
  }
  apply(s){
    this.y0+=this.f*(s-this.y0+this.fb*(this.y0-this.y1));
    this.y1+=this.f*(this.y0-this.y1);
    return this.y1;
  }
  setCutoffFreq(freq,sps){
    this.f=2*Math.sin(Math.PI*freq/sps);
    this.fb=this.reso+this.reso/(1-this.f);
  }
  setCutoff(f){this.f=f;this.fb=this.reso+this.reso/(1-f);}
  setResonance(r){this.reso=r;this.fb=r+r/(1-this.f);}
}
class Allpass{
  constructor(){this.feedback=0;this.buffer=[];this.bufsize=0;this.bufidx=0;}
  setbuffer(buf,size){this.buffer=buf;this.bufsize=size;this.bufidx=0;}
  process(input){
    const bufout=this.buffer[this.bufidx],
          output=-input+bufout;
    this.buffer[this.bufidx]=input+bufout*this.feedback;
    this.bufidx=(this.bufidx+1)%this.bufsize;
    return output;
  }
  mute(){this.buffer.fill(0);}
}
class Comb{
  constructor(){
    this.feedback=0;this.filterstore=0;
    this.damp1=0;this.damp2=1;
    this.buffer=[];this.bufsize=0;this.bufidx=0;
  }
  setbuffer(buf,size){this.buffer=buf;this.bufsize=size;this.bufidx=0;}
  process(input){
    const output=this.buffer[this.bufidx];
    this.filterstore=output*this.damp2+this.filterstore*this.damp1;
    this.buffer[this.bufidx]=input+this.filterstore*this.feedback;
    this.bufidx=(this.bufidx+1)%this.bufsize;
    return output;
  }
  mute(){this.buffer.fill(0);this.filterstore=0;}
  setDamp(v){this.damp1=v;this.damp2=1-v;}
  getDamp(){return this.damp1;}
}
class Revmodel{
  constructor(){
    //tuning constants
    this.stereospread=23;
    this.combtuningL=[1116,1188,1277,1356,1422,1491,1557,1617];
    this.combtuningR=this.combtuningL.map(t=>t+this.stereospread);
    this.allpasstuningL=[225,341,441,556];
    this.allpasstuningR=this.allpasstuningL.map(t=>t+this.stereospread);
    this.numcombs=8;this.numallpasses=4;
    //initialize comb filters
    this.combL=Array.from({length:this.numcombs},()=>new Comb());
    this.combR=Array.from({length:this.numcombs},()=>new Comb());
    this.combL.forEach((comb,i)=>comb.setbuffer(new Array(this.combtuningL[i]),this.combtuningL[i]));
    this.combR.forEach((comb,i)=>comb.setbuffer(new Array(this.combtuningR[i]),this.combtuningR[i]));
    //initialize allpass filters
    this.allpassL=Array.from({length:this.numallpasses},()=>new Allpass());
    this.allpassR=Array.from({length:this.numallpasses},()=>new Allpass());
    this.allpassL.forEach((allpass,i)=>{
      allpass.setbuffer(new Array(this.allpasstuningL[i]),this.allpasstuningL[i]);
      allpass.feedback=.5;
    });
    this.allpassR.forEach((allpass,i)=>{
      allpass.setbuffer(new Array(this.allpasstuningR[i]),this.allpasstuningR[i]);
      allpass.feedback=.5;
    });
    //parameter scaling constants
    this.scaleroom=.28;this.offsetroom=.7;this.scaledamp=.4;this.scalewet=3;this.scaledry=2;
    this.fixedgain=.015;this.muted=0;this.freezemode=.5;
    //initial parameters
    this.setwet(.5);this.setroomsize(.5);this.setdry(.5);this.setdamp(.5);this.setwidth(1);this.setmode(0);
    this.mute();
  }
  mute(){
    if(this.getmode()>=this.freezemode)return;
    this.combL.forEach(comb=>comb.mute());
    this.combR.forEach(comb=>comb.mute());
    this.allpassL.forEach(allpass=>allpass.mute());
    this.allpassR.forEach(allpass=>allpass.mute());
  }
  process(input){
    let output=[0,0];
    if(typeof input==="number")input=[input*this.gain,input*this.gain];
    this.combL.forEach(comb=>output[0]+=comb.process(input[0]));
    this.combR.forEach(comb=>output[1]+=comb.process(input[1]));
    this.allpassL.forEach(allpass=>output[0]=allpass.process(output[0]));
    this.allpassR.forEach(allpass=>output[1]=allpass.process(output[1]));
    output[0]=output[0]*this.wet1+output[1]*this.wet2+input[0]*this.dry;
    output[1]=output[1]*this.wet1+output[0]*this.wet2+input[1]*this.dry;
    return output;
  }
  update(){
    this.wet1=this.wet*(this.width/2+.5);
    this.wet2=this.wet*((1-this.width)/2);
    if(this.mode>=this.freezemode){
      this.roomsize1=1;
      this.damp1=0;
      this.gain=this.muted;
    }else{
      this.roomsize1=this.roomsize;
      this.damp1=this.damp;
      this.gain=this.fixedgain;
    }
    this.combL.forEach(comb=>comb.feedback=this.roomsize1);
    this.combR.forEach(comb=>comb.feedback=this.roomsize1);
    this.combL.forEach(comb=>comb.setDamp(this.damp1));
    this.combR.forEach(comb=>comb.setDamp(this.damp1));
  }
  setroomsize(value){this.roomsize=(value*this.scaleroom)+this.offsetroom;this.update();}
  setdamp(value){this.damp=value*this.scaledamp;this.update();}
  setwet(value){this.wet=value*this.scalewet;this.update();}
  setdry(value){this.dry=value*this.scaledry;}
  setwidth(value){this.width=value;this.update();}
  setmode(value){this.mode=value;this.update();}
  getroomsize(){return(this.roomsize-this.offsetroom)/this.scaleroom;}
  getdamp(){return this.damp/this.scaledamp;}
  getwet(){return this.wet/this.scalewet;}
  getdry(){return this.dry/this.scaledry;}
  getwidth(){return this.width;}
  getmode(){return this.mode>=this.freezemode?1:0;}
}
let r=new RNG(24),oG=()=>{
  let wd=new WaveDraw(),ot=[0,0],t=0,init=()=>{
    for(let i=0;i<wd.buffer.length;i++)
      wd.buffer[i]=sine(i/wd.buffer.length);
  };init();
  let randArr=n=>{
    let a=[];for(let i=0;i<n;i++)a.push(r.nextFloat());return a;
  },pl=3+(r.nextInt()%5),p=[randArr(pl),randArr(pl)],rf=new ResoFilter(1/sampleRate,.8);
  return pitch=>{
    ot[0]=fract(ot[0]+(pitch/sampleRate));ot[1]=fract(ot[1]+((pitch+.1)/sampleRate));
    wd.draw(
      sincInterpolate(p[0],t)*wd.buffer.length,(sincInterpolate(p[1],t)*2)-1,
      sincInterpolate(p[0],t+(1/sampleRate))*wd.buffer.length,(sincInterpolate(p[1],t+(1/sampleRate))*2)-1
    );
    rf.setCutoff((900+sincInterpolate(p[0],pl-t)*780)/sampleRate);
    t+=1/sampleRate;
    if(t>pl){t%=pl;init();}
    return rf.apply(readLinear(wd.buffer,ot[0]*wd.buffer.length)-readLinear(wd.buffer,ot[1]*wd.buffer.length));
  };
},o=[oG(),oG(),oG(),oG()],fr=[mix(150,500,r.nextFloat()),mix(150,500,r.nextFloat()),mix(150,500,r.nextFloat()),mix(150,500,r.nextFloat())],s=new RingBuffer(sampleRate*2),rm=new Revmodel();
rm.setroomsize(.85);rm.gain=.4;
return(t,sR)=>{sampleRate=sR;
  let otp=(o[0](fr[0])+o[1](fr[1]+30*o[3](fr[2]))+o[2](fr[3]))*.3;
  s.push(otp);
  otp=(read(s.buffer,t*sR)+read(s.buffer,t*sR*.75)+read(s.buffer,t*sR*.33))*.4;
  let so=rm.process(read(s.buffer,t*sR*2)*pow2(sine(t*.2),20)*.12);
  return[so[0]*.4+otp*.5,so[1]*.4+otp*.5];
};