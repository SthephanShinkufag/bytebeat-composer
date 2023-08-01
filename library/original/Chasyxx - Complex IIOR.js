// Complex IIOR

// Uses THE MOTHERLODE,a collection of effects you can use on _ANY_ variable that changes. This tool was made by Graserpirate.

// This song is a remix of "Inside Castle",by Rio Zack.

cap={length:106,active:1,loop:1},// Song length settings

ttt=t,tt=t==0,t-=65536,t=(cap.active&&cap.loop)?(t%((cap.length)<<16)):t,t=tt?0:t, // Loop handling

this.between ??= (MIN,MAX,includeBounds)=>(bar<(MAX+(includeBounds*0.0001))&&bar>(MIN-(includeBounds*0.0001))),

this.r ??= this.repeat ??= (x,y) => Array(x).fill(y).flat(9),
this.m ??= this.mix ??= (x,vol = 1,dist = 0) => ((x * vol * (1 + dist)) % (256 * vol))||0,

// Waveshaper distortion
this.ds ??= (x,amt) => x * (1 - amt) + (128 * ((x / 128) - 1) ** 3 + 128) * amt,


bt = beat = (arr,spd,vel = 2e4,vol = 1,T = t,oct = 0) =>
	m(vel / (T & (2 ** (spd - oct) / arr[(t >> spd) % arr.length]) - 1),vol),

s = sin(t / 9 & t >> 5),// Kick
h = (1 & (t>>2) * .9)*2,// Snare

// If you see red (NaNs),raise 3e5 higher,or adjust your reverbs' 'dsp' variable
// Works best when FX are not inside conditionals (meaning the number of FX in use changes)
// But even then,should only create a momentary click/pop (might be more severe for reverb)
// You can also set it to [] and modify the effects to read m(fx[stuff]) to get around NaN issues
t ? 0 : fx = r(3e5,0),

fxi = 0,// Iterator,resets to 0 at every t

t2 = t,
//dsp = downsample the bitrate of the reverb,dsp=1 cuts uses half as much space,2 uses 1/4,etc
this.rv ??= this.reverb ??= (x,len = 16e3,feedb = .7,dry = .4,wet = 1,dsp = 0) => (
	ech = fxi + ((t2 % len) >> dsp),
	x = x * dry + wet * fx[ech],
	fx[ech] = x * feedb,//shorter,but lower res = louder
	//t2 % (1<<dsp) ? 0 : fx[ech] = x * feedb,
	fxi += len >> dsp,
	x
),

this.lp ??= this.lopass ??= (x,f) => ( // f ~= frequency,but not 1:1
	x = min(max(x % 256,fx[fxi] - f),fx[fxi] + f),// Clamp the change since last sample between (-f,f)
	fx[fxi] = x,
	fxi++,
	x
),
this.hp ??= this.hipass ??= (x,f) => (x % 256) - lp(x,f),

//downsample
this.dsp ??= downsample = (x,res) => (
	x = fx[fxi] = t2 % res ? fx[fxi] : x,
	x
),

// Multi-voice melody: 'voices' is like a list of resonances
this.mvm ??= (melody,speed,voices) => (
	vcp = voices,
	vcp.reduce((sum,i) =>
		sum + m(i * t * 1.05946 ** melody[(t >> speed) % melody.length],.9 / vcp.length),0)
),

t *= 48 / 48,
//t+=2e6,

// ------------ARRAYS------------
s=(s+1)/2,
drumArray=[s,0,s,0,s,s,s,h],

t||(
mel1=[2,4,5,9,2,4,5,9,2,4,5,9,12,9,7,5,0,2,4,7,0,2,4,7,0,2,4,7,0,2,4,0,-2,0,2,5,-2,0,2,5,-2,0,2,5,-2,0,2,-2,-3,-1,1,4,-3,-1,1,4,-3,-1,1,7,-3,-1,1,9],
mel2=[2,4,5,9,2,4,12,14,2,4,5,9,2,4,12,14,0,2,4,7,0,2,11,12,0,2,4,7,0,2,11,12,-2,0,2,5,-2,0,9,10,-2,0,2,5,-2,0,9,10,-3,-1,1,4,-3,-1,7,9,-3,-1,1,7,9,11,12,14],
mel3=r(64,2)
),

rotate = ofs => sin((t * 2 ** -16) + ofs) + 2,
rRrR=max(0,t/(1<<16)),
bar=t>>16,
melody=bar<80?mel1:bar<96?mel2:mel3,
//  ------------SONG------------

this.a??=t=>(p=melody[(t>>13)%64],z=t*2**(p/12)*3.2,(z&128)/1.5)*(1-t%8192/12E3),
this.b??=(t,X=1)=>(p=melody[((t>>17)%4)*16],z=(t/(4/X))*2**(p/12)*3.2,(z&128)/1.5)*(32-t%65536/48E3),
this.bass??=(t,X)=>(b(t,X)+b(t-12168)/2+b(t-24336,X)/4+b(t-36504,X)/8+b(t-48672,X)/16)/32,
/*   Melody functions
-----------------------
	  Melody outputs  */
mel=lp(a(t)+a(t-12168)/2+a(t-24336)/4+a(t-36504)/8+a(t-48672)/16,rRrR),
/*   Melody outputs
-----------------------
	      Drums       */
drums=drumArray[(t>>12)%drumArray.length]*(64/(((t>>7)&31)+1)),drums=isNaN(drums)?0:drums*3,
drums2=bt([1,0,3,0,2,4,3,5],12),
/*       Drums
-------------------
	 Sequencing   */
subOutput=(
mel+ //Permanemt melody; likely to change
((bar>15&&bar!=31&&(bar<32||((bar+1)&15)))?bass(t,between(64,71,true)?1.5:1):0)*((bar<48)+(between(64,75,true)*0.5))+ //Low bass after bar 16
((bar>23&&bar!=31&&(bar<32||((bar+1)&15)))?bass(t,between(64,71,true)?3:2):0)*(bar<48?0.5:1.5) //High bass after bar 24
^(((bar>31)&&(bar<96))?((bar+1)&3?drums:drums2):0) //Drums after bar 32,extra mode every 4th bar
),
/*  Sequencing
----------------
	 Effects   */
subOutput2=(bar<31||bar>96)?rv(subOutput,16e2+(rRrR*64)):subOutput,//Reverb effect before bar 32; This also causes the "vinyl crackle" and the rising and falling pitch before the drop! These were unintended but left for effect :3
O=(bar<32||!((bar+1)&3)||bar>96)?dsp(subOutput2,(bar==31||(bar>31&&!((bar+1)&7)))?8:4):subOutput2,// Downsample before and on bar 32 and every 4th bar thereafter,extra mode on bar 32 and every 8th bar thereafter.
O/=((((max(96,rRrR))-96)*2)+1),
OO=(((bar>(cap.length-1))&&(!cap.loop)&&cap.active)?cbrt((random()-0.5)/64):((O&511)/256)-1), // Output divided by 512; Also handles song length
bar>104?-1:OO