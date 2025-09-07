/*f=(keys)=>{
    if (!Array.isArray(keys)) {
			keys=[keys];
    }

    // Check for 'off' in the array
    if (keys.includes('off')) {
			const line1=`┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐`
			const line2=`| | || | | | || || | | | || | | | || || | | | || | | | || || | | | || | | | || || | |`
			const line3=`| └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ |`
			const line4=`|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |`
			const line5=`└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘`
			return `\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}`;
    }

    let positions={
			c_0: ' ', d_0: ' ', f_0: ' ', g_0: ' ', a_0: ' ',
			c_1: ' ', d_1: ' ', f_1: ' ', g_1: ' ', a_1: ' ',
			c_2: ' ', d_2: ' ', f_2: ' ', g_2: ' ', a_2: ' ',
			c_3: ' ', d_3: ' ', f_3: ' ', g_3: ' ', a_3: ' ',

			c0: '  ', d0: '  ', e0: '  ', f0: '  ', g0: '  ',
			a0: '  ', b0: '  ', c1: '  ', d1: '  ', e1: '  ',
			f1: '  ', g1: '  ', a1: '  ', b1: '  ', c2: '  ',
			d2: '  ', e2: '  ', f2: '  ', g2: '  ', a2: '  ',
			b2: '  ', c3: '  ', d3: '  ', e3: '  ', f3: '  ',
			g3: '  ', a3: '  ', b3: '  '
    };

    for (let key of keys) {
			// Convert to 0-35 range
			let g=key>0?round(key)%48:48+round(key)%48;

			if (g%48 === 1) positions.c_0='█';
			if (g%48 === 3) positions.d_0='█';
			if (g%48 === 6) positions.f_0='█';
			if (g%48 === 8) positions.g_0='█';
			if (g%48 === 10) positions.a_0='█';
			if (g%48 === 13) positions.c_1='█';
			if (g%48 === 15) positions.d_1='█';
			if (g%48 === 18) positions.f_1='█';
			if (g%48 === 20) positions.g_1='█';
			if (g%48 === 22) positions.a_1='█';
			if (g%48 === 25) positions.c_2='█';
			if (g%48 === 27) positions.d_2='█';
			if (g%48 === 30) positions.f_2='█';
			if (g%48 === 32) positions.g_2='█';
			if (g%48 === 34) positions.a_2='█';
			if (g%48 === 37) positions.c_3='█';
			if (g%48 === 39) positions.d_3='█';
			if (g%48 === 42) positions.f_3='█';
			if (g%48 === 44) positions.g_3='█';
			if (g%48 === 46) positions.a_3='█';

			if (g%48 === 0) positions.c0='██';
			if (g%48 === 2) positions.d0='██';
			if (g%48 === 4) positions.e0='██';
			if (g%48 === 5) positions.f0='██';
			if (g%48 === 7) positions.g0='██';
			if (g%48 === 9) positions.a0='██';
			if (g%48 === 11) positions.b0='██';
			if (g%48 === 12) positions.c1='██';
			if (g%48 === 14) positions.d1='██';
			if (g%48 === 16) positions.e1='██';
			if (g%48 === 17) positions.f1='██';
			if (g%48 === 19) positions.g1='██';
			if (g%48 === 21) positions.a1='██';
			if (g%48 === 23) positions.b1='██';
			if (g%48 === 24) positions.c2='██';
			if (g%48 === 26) positions.d2='██';
			if (g%48 === 28) positions.e2='██';
			if (g%48 === 29) positions.f2='██';
			if (g%48 === 31) positions.g2='██';
			if (g%48 === 33) positions.a2='██';
			if (g%48 === 35) positions.b2='██';
			if (g%48 === 36) positions.c3='██';
			if (g%48 === 38) positions.d3='██';
			if (g%48 === 40) positions.e3='██';
			if (g%48 === 41) positions.f3='██';
			if (g%48 === 43) positions.g3='██';
			if (g%48 === 45) positions.a3='██';
			if (g%48 === 47) positions.b3='██';
    }

const line1=`┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐`;
const line2=`| |${positions.c_0}||${positions.d_0}| | |${positions.f_0}||${positions.g_0}||${positions.a_0}| | |${positions.c_1}||${positions.d_1}| | |${positions.f_1}||${positions.g_1}||${positions.a_1}| | |${positions.c_2}||${positions.d_2}| | |${positions.f_2}||${positions.g_2}||${positions.a_2}| | |${positions.c_3}||${positions.d_3}| | |${positions.f_3}||${positions.g_3}||${positions.a_3}| |`;
const line3=`| └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ |`;
const line4=`|${positions.c0}|${positions.d0}|${positions.e0}|${positions.f0}|${positions.g0}|${positions.a0}|${positions.b0}|${positions.c1}|${positions.d1}|${positions.e1}|${positions.f1}|${positions.g1}|${positions.a1}|${positions.b1}|${positions.c2}|${positions.d2}|${positions.e2}|${positions.f2}|${positions.g2}|${positions.a2}|${positions.b2}|${positions.c3}|${positions.d3}|${positions.e3}|${positions.f3}|${positions.g3}|${positions.a3}|${positions.b3}|`;
const line5=`└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘`;


    return `\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}`;
},*/

f=(keys)=>{
    if (!Array.isArray(keys)) {
			keys=[keys]
    }

    if (keys.includes('off')) {
			const line1=`┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐`
			const line2=`| | || | | | || || | | | || | | | || || | |`
			const line3=`| └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ |`
			const line4=`|  |  |  |  |  |  |  |  |  |  |  |  |  |  |`
			const line5=`└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘`
			return `\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}`
    }

    let positions={
			c_0: ' ', d_0: ' ', f_0: ' ', g_0: ' ', a_0: ' ',
			c_1: ' ', d_1: ' ', f_1: ' ', g_1: ' ', a_1: ' ',
			c0: '  ', d0: '  ', e0: '  ', f0: '  ', g0: '  ',
			a0: '  ', b0: '  ', c1: '  ', d1: '  ', e1: '  ',
			f1: '  ', g1: '  ', a1: '  ', b1: '  '
		}
    
   	for (let key of keys) {
			let g=key>0?round(key)%24:24+round(key)%24
			
			if (g%24===1) positions.c_0='█'
			if (g%24===3) positions.d_0='█'
			if (g%24===6) positions.f_0='█'
			if (g%24===8) positions.g_0='█'
			if (g%24===10) positions.a_0='█'
			if (g%24===13) positions.c_1='█'
			if (g%24===15) positions.d_1='█'
			if (g%24===18) positions.f_1='█'
			if (g%24===20) positions.g_1='█'
			if (g%24===22) positions.a_1='█'
			
			if (g%24===0) positions.c0='██'
			if (g%24===2) positions.d0='██'
			if (g%24===4) positions.e0='██'
			if (g%24===5) positions.f0='██'
			if (g%24===7) positions.g0='██'
			if (g%24===9) positions.a0='██'
			if (g%24===11) positions.b0='██'
			if (g%24===12) positions.c1='██'
			if (g%24===14) positions.d1='██'
			if (g%24===16) positions.e1='██'
			if (g%24===17) positions.f1='██'
			if (g%24===19) positions.g1='██'
			if (g%24===21) positions.a1='██'
			if (g%24===23) positions.b1='██'
		}
    
   const line1=`┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐`
   const line2=`| |${positions.c_0}||${positions.d_0}| | |${positions.f_0}||${positions.g_0}||${positions.a_0}| | |${positions.c_1}||${positions.d_1}| | |${positions.f_1}||${positions.g_1}||${positions.a_1}| |`
   const line3=`| └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ |`
   const line4=`|${positions.c0}|${positions.d0}|${positions.e0}|${positions.f0}|${positions.g0}|${positions.a0}|${positions.b0}|${positions.c1}|${positions.d1}|${positions.e1}|${positions.f1}|${positions.g1}|${positions.a1}|${positions.b1}|`
   const line5=`└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘`
    
   return `\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}`
},


t?0:(h11=1,i11=0,z=[]),callCount=0,
h11=1+(i11=0),
gen=(p11)=>(z[h11]??=0,z[i11]??=0,(z[h11]+=p11),h11+=2,i11+=2,z[h11-2]),

g=(c,waveSelections,w,volumes)=>{
  if (!Array.isArray(waveSelections)) {
    waveSelections=globalWaveSelections;
  } else if (typeof waveSelections === 'number') {
    waveSelections=Array(c.length).fill(waveSelections);
  }

  if (!Array.isArray(volumes)) {
    volumes=Array(c.length).fill(volumes);
  } else if (typeof volumes === 'number') {
    volumes=Array(c.length).fill(volumes);
  }

  p=(key)=>typeof key === 'number'?2**((key-9)/12-1):0;
  tf=1/48000*440*256;

  const waveFunctions={
    saw: (key)=>gen(p(key)*tf)&255,
    square: (key)=>((gen(p(key)*tf)^gen(p(key)*tf)+w+128)/2&128)+64,
    triangle: (key)=>abs(-1+gen(p(key)*tf)/128%2)*255,
    sine: (key)=>(sin(gen(p(key)*tf)*PI/128)+1)*127.5,
  };

  h=(key, waveIndex)=>{
    const waveKeys=Object.keys(waveFunctions);
    return waveFunctions[waveKeys[waveIndex]](key);
  };

  inverse=(y)=>12*(log(y)/log(2));
  let keys=Array.isArray(c)?c:[c];
  
  // Filter out 'off' and process remaining keys
  let activeKeys=keys.filter(key=>key !== 'off');
  let hasoff=keys.includes('off');
  let sum=0;

  if (hasoff) {
    sum=0;
  } else {
    for (let i=0; i<activeKeys.length; i++) {
      let key=activeKeys[i];
      let waveIndex=waveSelections[i%waveSelections.length];
      let volume=volumes[i%volumes.length];
      sum += h(key, waveIndex)*volume;
    }
  }
  
  let litKeys=activeKeys.map((key)=>inverse(p(key))+9);
  
  if (t&255) {
    return hasoff?0:(activeKeys.length>0?sum/activeKeys.length:0);
  } else {
    const waveLabel=waveSelections.map(index=>Object.keys(waveFunctions)[index]).join(', ');
    const globalLabel=(activeKeys.length>1)^(waveSelections.length>1)?' (global)':'';
    throw `\nWave: ${waveLabel}${globalLabel}\nKeys: [${keys.join(', ')}]\n`+f(c);
  }
},


f0='off',
ft=t*1.6,
g([
[12,10,7,6,5,3,0,7,12,10,7,6,5,3,0,6,12,10,7,6,5,3,0,5,12,10,7,6,5,3,0,3][(ft)>>14&31]+12,

h=[7,6,5,3][ft>>17&3],
h+.1,
h+.17,
h+.14,

h=0,
h+.1,
h+.17,
h+.14
],[1,0,0,0,0,0,0,0,0],ft/256,[3,.7,.7,.7,.7,.7,.7,.7,.7])


//2**([5,f0,0,f0,3,f0,0,f0,5,f0,0,f0,3,f0,0,f0,5,f0,0,f0,3,f0,0,f0,5,f0,0,f0,3,f0,0,f0,][t>>13&31]/12)*t