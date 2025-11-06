settings={
	BPM:[40,60,63,68,73,79],
	transpose:0
},
sampleRate = 48000,
// memory
// useful for storing stuff that you need to change overtime (e.g. self-referring variables)
t||(mem=new Float32Array(4e6)), // 128 kibibytes of mem
callC=0, // for tracking how many times a function has been called

// self-explanatory
lp=simpleLowPass=function (x,c) {
	cca = callC++;
	mem[cca] = x*c+mem[cca]*(1-c);
	return mem[cca]
},
hp=simpleHighPass=(x,c)=>x-lp(x,c),
// https://www.musicdsp.org/en/latest/Filters/29-resonant-filter.html
lpr = lowPassResonance = function (x, c, q) {
	fb = q + q/(1-c);
	cca1 = callC++;
	cca2 = callC++;
	mem[cca1] = mem[cca1] + c * (x - mem[cca1] + fb * (mem[cca1] - mem[cca2])) || 0;
	mem[cca2] = mem[cca2] + c * (mem[cca1] - mem[cca2]) || 0;
	return mem[cca2];
},


// btw i have removed the readmem/setmem functions so uhhhhh

// sequence
seqnce=(x,idx)=>x[idx%x.length|0],

// assumes x is between -1 and 1
dist=function (x,amt,type) {
	if (type == "soft") {
		return tanh(x*amt)
	}
	else if (type == "hard") {
		return min(max(x*amt,-1),1)
	}
	else if (type == "sin") {
		return sin(x*amt)
	}
	else if (type == "" || type == null || type == 'undefined' || type == void 0) {
		throw new Error("dist: Bad distortion type!")
	}
	else {
		throw new Error("dist: Invalid distortion type! You passed: "+type)
	}
},

// wave generator
// the base for making most waveforms
wg=function (x,type,wavtab = "none") {
	wav = 0;
	switch (type) {
		case "saw":
			wav = ((x/512%1)-.5)*2
			break;
		case "sin":
			wav = sin(x*PI/256)
			break;
		case "squ":
			wav = ((x/256&1)-.5)*2
			break;
		case "tri":
			wav = (abs(x/512%1-.5)-.25)*4
			break;
		case "rand":
			wav = (random()-.5)*2;
			break;
		case "wavtabl":
			if (wavtab != "none" || wavtab != null || wavtab != 'undefined' || wavtab != void 0) {
				wav = wavtab[x/32%wavtab.length|0]
			}
			else {
				throw new Error("wg: Invalid wavetable!")
			}
			break;
		default:
			wav = 0;
			throw new Error("wg: Invalid type! You passed: "+type)
	}
	return wav
},

// same as above, but without the multiplication / division
// useful for drums
wga=function (x,type,wavtab = "none") {
	wav = 0;
	switch (type) {
		case "saw":
			wav = ((x%1)-.5)*2
			break;
		case "sin":
			wav = sin(x)
			break;
		case "squ":
			wav = ((x&1)-.5)*2
			break;
		case "tri":
			wav = (abs(x%1-.5)-.25)*4
			break;
		case "rand":
			wav = (random()-.5)*2;
			break;
		case "wavtabl":
			if (wavtab != "none" || wavtab != null || wavtab != 'undefined' || wavtab != void 0) {
				wav = wavtab[x/32%wavtab.length|0]
			}
			else {
				throw new Error("wga: Invalid wavetable!")
			}
			break;
		default:
			wav = 0;
			throw new Error("wga: Invalid type! You passed: "+type)
	}
	return wav
},

// self explanatory
echo=function (x,decay,buf,lowpass=false,lowpassfreq=.1) {
	if (!lowpass) {
		// we never know what the length will be so we just do buf.length
		o = buf[t%buf.length] = x+buf[t%buf.length]/decay;
	} else {
		// same comment as above
		o = buf[t%buf.length] = x+lp(buf[t%buf.length]/decay,lowpassfreq);
	}
	return o
},

// limiter
limiter = function(x, threshold, c) {
    let rmsIdx = callC++;
    mem[rmsIdx] = (1 - c) * (mem[rmsIdx] || 0) + c * (x * x);
    let rms = sqrt(mem[rmsIdx]);
    let gain = 1.0;
    if (rms > threshold) {
        gain = threshold / rms;
    }
    let gIdx = callC++;
    mem[gIdx] = (1 - c) * (mem[gIdx] || 1) + c * gain;

    return x * mem[gIdx];
},



// no note
nnt=-9e9,

// note to hz
not=x=>440*2**((x+settings.transpose)/12),


fArr=x=>x.flat(Infinity),

// creates a variable named T which is the amount of seconds passed. commonly used for BPMtoT, but has been removed in favor of the bpm changing
createInSecondT=(sr)=>(T=t/sr),

createInSecondT(sampleRate),

t||(
	st=0,
	thr=x=>{throw x}
),
bpIdx=st<80?st<64?st<48?st<32?st<15.5?0:1:2:3:4:5,
curBPM=settings.BPM[bpIdx],
st+=curBPM/sampleRate/60,
kik=_=>dist(wga(100*sqrt(st*2%1)**.05*10,"sin")*1e-15**(st*2%1),2,"soft")*4e3||0,
r=x=>lpr(wga((q=k=>k*not([[0,3,7,12],[-2,0,3,7],[-3,0,7,12],[0,7,12,-7]][st/2&3][t&3]*(x?1:1.01)))(T),"saw")+wga(q(T*1.01),"saw")+wga(q(T*.99),"saw")+wga(q(T*1.03),"saw")+wga(q(T)*PI,"sin"),.001**(st*8%1)/4+abs(st/16%1-.5)/4+.01,.4)/2||0,
d=x=>lp(wga(s=T*(x?1:1.01)*not([0,-2,-3,-7][st/2&3])/8,"saw")+wga(s+(T/8),"saw")+wga(s+(T/4),"saw")+wga(s+(T/2),"saw")+wga(s*4.01,"saw")+wga(s*PI/2,"sin"),.01)/3,
hh=_=>hp(random()-.5,.999)*400*!!(st*8&3)*1e-6**(st*8%1)||0,
o=_=>lpr(random()-.5,.2,.6)*min(st*32%16,1)*(1-st*2%1)*(st*2&1)||0,
ba2=_=>dist(lpr(wga(T/4*not([[0,3,7,12],[-2,0,3,7],[-3,0,7,12],[0,7,12,-7]][st/2&3][st*4&3]),"saw"),abs(st/4%1-.5)/4+.1,.9),4,"soft")/4,
m=x=>lpr(limiter((r(x)+(d(x))*min(st/16,1))*(st<15.5||st>16)+(kik(x))*(st>15.5)+hh()*10*(st>16)+o()*4*(st>32)+ba2()/2*(1-st*4%1/2)*(x?.5:1)*(st>64),1,.01)||0,st>64?.9999:min(st/64,1),.9-min(st/64,.9)||0),
[m(0),m(1)]