    mod=(n,m)=>(n%m+m)%m,fract=x=>(x%1+1)%1,
    TAU=Math.PI*2,sine=x=>Math.sin(TAU*x),
    mix=(a,b,t)=>a+(b-a)*t,
    pulse=x=>fract(x)<.5?1:-1,
    sinRnd=x=>fract(Math.sin(x*15345.733*Math.sin(x*2342.51))),
    dot=(a,b)=>a.map((x,i)=>a[i]*b[i]).reduce((m,n)=>m+n),
    clamp=(x,mn,mx)=>Math.min(Math.max(x,mn),mx),
    saturate=x=>Math.min(Math.max(x,0),1),
    cis=t=>[Math.cos(t),Math.sin(t)],
    expr={
	kick:t=>tanh(sin(1/(t+.01))*3)*exp(-t*5),
	hihat:t=>(((random()*2)-1)+sin(t*50e3))*exp(-t*1e2)*.5,
	snare:t=>tanh(((t<.01?pulse(t*270)*.5:((random()*2)-1)*exp(-t*1e2))+sin(1/(t+.02))*exp(-t*100))*40)*.9,
	clap:t=>
		tanh(mix(exp(-30*t),exp(-200*mod(t,.01)),exp(-100*max(0,t-.02)))**1.6*
		(perlin1(t*4e3,1,1)+perlin1(t*8e3,3,5)*.3)*3)
};
function xorshift32m(a){a^=a<<13;a^=a>>>17;a^=a<<5;return(Math.imul(a,1597334677)>>>0)/4294967296;}
function xorshift32amx(a){
	let t=Math.imul(a,1597334677);
	t=t>>>24|t>>>8&65280|t<<8&16711680|t<<24; //reverse byte order
	a^=a<<13;a^=a>>>17;a^=a<<5;
	return(a+t>>>0)/4294967296;
}
function linearStep(a,b,t){return saturate((t-a)/(b-a));}
function smootherStep(x){ //6x^5 - 15x^4 + 10x^3
	return x*x*x*(x*(x*6-15)+10);
}
function interpolate(v1,v2,v3,v4,x,y){return mix(mix(v1,v2,x),mix(v3,v4,x),y);}
function gradientDirection(hash){
	switch((hash*4)&3){
		case 0:return[1,1];
		case 1:return[-1,1];
		case 2:return[1,-1];
		case 3:return[-1,-1];
	}
}
function hash2D([x,y],seed){
	x=Math.floor(x);y=Math.floor(y);
	return fract((Math.sin(y*22345.733*Math.sin(y*(4342.51+seed))))+(Math.sin(x*26725.733*Math.sin(x*(2352.51+seed)))));
}
function perlin1(x,y,seed){
	let floored=[floor(x),floor(y)],
	    fracted=[x-floored[0],y-floored[1]],
	    v1=dot(gradientDirection(hash2D(floored,seed)),fracted),
       v2=dot(gradientDirection(hash2D([floored[0]+1,floored[1]],seed)),[fracted[0]-1,fracted[1]]),
       v3=dot(gradientDirection(hash2D([floored[0],floored[1]+1],seed)),[fracted[0],fracted[1]-1]),
       v4=dot(gradientDirection(hash2D([floored[0]+1,floored[1]+1],seed)),[fracted[0]-1,fracted[1]-1]);
	return interpolate(v1,v2,v3,v4,smootherStep(fracted[0]),smootherStep(fracted[1]));
}
function perlinNoise(x,y,freq,octaves,persistence,lacunarity,seed){
	let value=0,amp=1,cFreq=freq,cSeed=seed;
	for(let i=0;i<octaves;i++){
		cSeed=seed*sinRnd(seed)*100;
		value+=perlin1(x*cFreq,y*cFreq,cSeed)*amp;
		amp*=persistence;
		cFreq*=lacunarity;
	}
	return value;
}
let exprKeys=Object.keys(expr),jmp=.12;

function sineWindow(x){ //x: 0 to 1
	return Math.sin(TAU*(x-.25))*.5+.5;
}
function multiply(a,b){return{r:a.r*b.r-a.i*b.i,i:a.r*b.i+a.i*b.r};}
function add(a,b){return{r:a.r+b.r,i:a.i+b.i};}
function subtract(a,b){return{r:a.r-b.r,i:a.i-b.i};}
function FFT(a,invert=false){
	let n=a.length;
	if(n===1)return;
	if(Math.log2(n)%1!==0)throw new Error("Length isn't a power of 2.");
	let a0=new Array(n/2),a1=new Array(n/2);
	for(let i=0;2*i<n;i++){a0[i]=a[2*i];a1[i]=a[2*i+1];}
	FFT(a0,invert);FFT(a1,invert);
	let ang=TAU/n*(invert?-1:1),
	    wn={r:Math.cos(ang),i:Math.sin(ang)},
	    w={r:1,i:0};
	for(let i=0;i<n/2;i++){
		let even=a0[i],odd=multiply(w,a1[i]),
		    sum=add(even,odd),difference=subtract(even,odd);
		a[i]=sum;a[i+n/2]=difference;
		if(invert){
			a[i].r/=2;a[i].i/=2;
			a[i+n/2].r/=2;a[i+n/2].i/=2;
		}
		w=multiply(w,wn);
	}
}
let read=(a,i)=>a[mod(Math.floor(i),a.length)];
class realtimeFFT{
  constructor(size=11){
    this.FFT_SIZE=2**size;
    this.inputBuffer=[new Float32Array(this.FFT_SIZE).fill(0),new Float32Array(this.FFT_SIZE).fill(0)];
    this.outputBuffer=[new Float32Array(this.FFT_SIZE).fill(0),new Float32Array(this.FFT_SIZE).fill(0)];
    this.bufferIndex=[0,-(2**size)*.5];
  }
  process(x,t){
    //record input
    this.inputBuffer[0][this.bufferIndex[0]]=x;
    if(this.bufferIndex[1]>=0)
      this.inputBuffer[1][this.bufferIndex[1]]=x;
    //windowing
    let win=sineWindow,
        o=this.outputBuffer[0][this.bufferIndex[0]]*win(this.bufferIndex[0]/this.FFT_SIZE)+this.outputBuffer[1][this.bufferIndex[1]]*win(this.bufferIndex[1]/this.FFT_SIZE);
    for(let bI=0;bI<2;bI++){
    this.bufferIndex[bI]++;
    if(this.bufferIndex[bI]>=this.FFT_SIZE){
      let a=[...this.inputBuffer[bI]].map(x=>({r:x,i:0}));
      FFT(a,false);
      let b=a.map(x=>({r:x.r,i:x.i}));
      for(let i=0;i<a.length;i++){
        if(i<this.FFT_SIZE/2.5)a[i]=read(b,i*(1+sin(t*3)*1.1));
        a[i].r*=sin(i/(300*(sin(t/2.5)+1)))**3;
        a[i].i*=sin(i/(320*(sin(t)+1)))**3;
      }
      FFT(a,true);
      for(let i=0;i<a.length;i++){
        this.outputBuffer[bI][i]=a[i].r-a[i].i;//Math.sqrt(a[i].r**2+a[i].i**2);
      }
      this.bufferIndex[bI]=0;
    }
    }
    return o;
  }
}
let eff=new realtimeFFT(11);

return(t,SR)=>{sampleRate=SR;
	return tanh(eff.process(expr[exprKeys[Math.floor(sinRnd(Math.floor(t/jmp))*exprKeys.length)]]((t%(jmp/(2**Math.floor((sinRnd(Math.floor(t/jmp))**12)*2))))*(.5+sinRnd(Math.floor(t/jmp))*2))*mix(.7,.9,sinRnd(Math.floor(t/jmp)))+Math.random()*.1,t)*3);
};