// removed SampleRate variable as it was set and not used anywhere

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
	kick:t=>sin(1/(t+.01))*exp(-t*5),
	hihat:t=>(((random()*2)-1)+sin(t*50e3))*exp(-t*1e2)*.5,
	snare:t=>tanh(((t<.01?pulse(t*270)*.5:((random()*2)-1)*exp(-t*1e2))+sin(1/(t+.02))*exp(-t*100))*40)*.9,
	lowTom:t=>sin(1e3*t)*exp(-35*t),
	midTom:t=>sin(2e3*t)*exp(-35*t),
	hiTom:t=>sin(4e3*t)*exp(-35*t),
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
return(t,SR)=>{sampleRate=SR;
	return expr[exprKeys[/*Math.floor(t/jmp)%exprKeys.length*/Math.floor(sinRnd(Math.floor(t/jmp))*exprKeys.length)]]((t%(jmp/(2**Math.floor((sinRnd(Math.floor(t/jmp))**12)*3))))*(.5+sinRnd(Math.floor(t/jmp))*2))*mix(.7,.9,sinRnd(Math.floor(t/jmp)));
};