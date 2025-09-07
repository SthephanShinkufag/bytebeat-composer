f=(keys)=>{
		if (!Array.isArray(keys)) {
			keys=[keys];
		}

		// Check for 'off' in the array
		if (keys.includes('off')) {
			const line1=
`┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐`
			const line2=
`| | || | | | || || | | | || | | | || || | | | || | | | || || | | | || | | | || || | | | || | | | || || | |`
			const line3=
`| └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ |`
			const line4=
`|  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |`
			const line5=
`└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘`
			return `\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}`;
		}

		let positions={
			c_0: ' ', d_0: ' ', f_0: ' ', g_0: ' ', a_0: ' ',
			c_1: ' ', d_1: ' ', f_1: ' ', g_1: ' ', a_1: ' ',
			c_2: ' ', d_2: ' ', f_2: ' ', g_2: ' ', a_2: ' ',
			c_3: ' ', d_3: ' ', f_3: ' ', g_3: ' ', a_3: ' ',
			c_4: ' ', d_4: ' ', f_4: ' ', g_4: ' ', a_4: ' ',

			c0: '  ', d0: '  ', e0: '  ', f0: '  ', g0: '  ', a0: '  ', b0: '  ', 
			c1: '  ', d1: '  ', e1: '  ', f1: '  ', g1: '  ', a1: '  ', b1: '  ', 
			c2: '  ', d2: '  ', e2: '  ', f2: '  ', g2: '  ', a2: '  ', b2: '  ', 
			c3: '  ', d3: '  ', e3: '  ', f3: '  ', g3: '  ', a3: '  ', b3: '  ',
			c4: '  ', d4: '  ', e4: '  ', f4: '  ', g4: '  ', a4: '  ', b4: '  '
		};

		for (let key of keys) {
			// Convert to 0-35 range
			let g=key>0?round(key)%60:60+round(key)%60;

			if (g%60 === 1) positions.c_0='█';
			if (g%60 === 3) positions.d_0='█';
			if (g%60 === 6) positions.f_0='█';
			if (g%60 === 8) positions.g_0='█';
			if (g%60 === 10) positions.a_0='█';
			if (g%60 === 13) positions.c_1='█';
			if (g%60 === 15) positions.d_1='█';
			if (g%60 === 18) positions.f_1='█';
			if (g%60 === 20) positions.g_1='█';
			if (g%60 === 22) positions.a_1='█';
			if (g%60 === 25) positions.c_2='█';
			if (g%60 === 27) positions.d_2='█';
			if (g%60 === 30) positions.f_2='█';
			if (g%60 === 32) positions.g_2='█';
			if (g%60 === 34) positions.a_2='█';
			if (g%60 === 37) positions.c_3='█';
			if (g%60 === 39) positions.d_3='█';
			if (g%60 === 42) positions.f_3='█';
			if (g%60 === 44) positions.g_3='█';
			if (g%60 === 46) positions.a_3='█';
			if (g%60 === 49) positions.c_4='█';
			if (g%60 === 51) positions.d_4='█';
			if (g%60 === 54) positions.f_4='█';
			if (g%60 === 56) positions.g_4='█';
			if (g%60 === 58) positions.a_4='█';

			if (g%60 === 0) positions.c0='██';
			if (g%60 === 2) positions.d0='██';
			if (g%60 === 4) positions.e0='██';
			if (g%60 === 5) positions.f0='██';
			if (g%60 === 7) positions.g0='██';
			if (g%60 === 9) positions.a0='██';
			if (g%60 === 11) positions.b0='██';
			if (g%60 === 12) positions.c1='██';
			if (g%60 === 14) positions.d1='██';
			if (g%60 === 16) positions.e1='██';
			if (g%60 === 17) positions.f1='██';
			if (g%60 === 19) positions.g1='██';
			if (g%60 === 21) positions.a1='██';
			if (g%60 === 23) positions.b1='██';
			if (g%60 === 24) positions.c2='██';
			if (g%60 === 26) positions.d2='██';
			if (g%60 === 28) positions.e2='██';
			if (g%60 === 29) positions.f2='██';
			if (g%60 === 31) positions.g2='██';
			if (g%60 === 33) positions.a2='██';
			if (g%60 === 35) positions.b2='██';
			if (g%60 === 36) positions.c3='██';
			if (g%60 === 38) positions.d3='██';
			if (g%60 === 40) positions.e3='██';
			if (g%60 === 41) positions.f3='██';
			if (g%60 === 43) positions.g3='██';
			if (g%60 === 45) positions.a3='██';
			if (g%60 === 47) positions.b3='██';
			if (g%60 === 48) positions.c4='██';
			if (g%60 === 50) positions.d4='██';
			if (g%60 === 52) positions.e4='██';
			if (g%60 === 53) positions.f4='██';
			if (g%60 === 55) positions.g4='██';
			if (g%60 === 57) positions.a4='██';
			if (g%60 === 59) positions.b4='██';
		}

const line1=`┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┐`;
const line2=`| |${positions.c_0}||${positions.d_0}| | |${positions.f_0}||${positions.g_0}||${positions.a_0}| | |${positions.c_1}||${positions.d_1}| | |${positions.f_1}||${positions.g_1}||${positions.a_1}| | |${positions.c_2}||${positions.d_2}| | |${positions.f_2}||${positions.g_2}||${positions.a_2}| | |${positions.c_3}||${positions.d_3}| | |${positions.f_3}||${positions.g_3}||${positions.a_3}| | |${positions.c_4}||${positions.d_4}| | |${positions.f_4}||${positions.g_4}||${positions.a_4}| |`;
const line3=`| └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ | └┬┘└┬┘ | └┬┘└┬┘└┬┘ |`;
const line4=`|${positions.c0}|${positions.d0}|${positions.e0}|${positions.f0}|${positions.g0}|${positions.a0}|${positions.b0}|${positions.c1}|${positions.d1}|${positions.e1}|${positions.f1}|${positions.g1}|${positions.a1}|${positions.b1}|${positions.c2}|${positions.d2}|${positions.e2}|${positions.f2}|${positions.g2}|${positions.a2}|${positions.b2}|${positions.c3}|${positions.d3}|${positions.e3}|${positions.f3}|${positions.g3}|${positions.a3}|${positions.b3}|${positions.c4}|${positions.d4}|${positions.e4}|${positions.f4}|${positions.g4}|${positions.a4}|${positions.b4}|`;
const line5=`└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘`;


		return `\n${line1}\n${line2}\n${line3}\n${line4}\n${line5}`;
},

/*f=(keys)=>{
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
},*/


t?0:(h11=1,i11=0,z=[],z1=[],z2=[]),callCount=0,
h11=1+(i11=0),
gen=(p11)=>(z[h11]??=0,z[i11]??=0,(z[h11]+=p11),h11+=2,i11+=2,z[h11-2]),
lpf=(a,c)=>(call=callCount++,z1[call]??=0,z1[call]+=(a-z1[call])*c),
hpf=(a,c)=>(call=callCount++,z1[call]??=0,a-(z1[call]+=(a-z1[call])*c)),

ff=(t,c='█',o='-',a=64)=>{
	return '|'+Array.from({length:a},(_,i)=>o.repeat(a-1-i)+c).reverse()[min(max(t*a/64|0,0),a-1)];
},

rms=(a,decayF)=>{call=callCount++;z2[call]??={var1:0,var2:0};z2[call].var1=(1-decayF)*z2[call].var1+decayF*a*a;return sqrt(z2[call].var1)},

g=(c, waveSelections, width, volumes, separate=false)=>{
	if (!Array.isArray(waveSelections)) {
			waveSelections=globalWaveSelections
	} else if (typeof waveSelections === 'number') {
			waveSelections=Array(c.length).fill(waveSelections)
	}

	if (!Array.isArray(volumes)) {
			volumes=Array(c.length).fill(volumes)
	} else if (typeof volumes === 'number') {
			volumes=Array(c.length).fill(volumes)
	}

	if (!Array.isArray(width)) {
			width=Array(c.length).fill(width !== undefined?width:128)
	} else if (typeof width === 'number') {
			width=Array(c.length).fill(width)
	}

	p=(key)=>typeof key === 'number'?2**((key-9)/12-3):0
	tf=1/48000*440*256

	const waveFunctions={
			saw: (key)=>gen(p(key)*tf)&255,
			Pulse: (key, width)=>((gen(p(key)*tf)^gen(p(key)*tf)-abs((width&255)-128))/2&128?0:255),
			triangle: (key)=>abs(-1+gen(p(key)*tf)/128%2)*255,
			sine: (key)=>(sin(gen(p(key)*tf)*PI/128)+1)*127.5,
	}

	h=(key, waveIndex, width)=>{
			const waveKeys=Object.keys(waveFunctions)
			return waveFunctions[waveKeys[waveIndex]](key, width)
	}

	inverse=(y)=>12*(log(y)/log(2))
	let keys=Array.isArray(c)?c:[c]

	let activeKeys=keys.filter(key=>key !== '')
	let hasoff=keys.includes('')
	let sum=0

	if (hasoff) {
			sum=0;
	} else {
			for (let i=0; i < activeKeys.length; i++) {
		let key=activeKeys[i]
		let waveIndex=waveSelections[i%waveSelections.length]
		let volume=volumes[i%volumes.length]
		let currentWidth=width[i%width.length]
		sum += h(key, waveIndex, currentWidth)*volume
			}
	}

	let litKeys=activeKeys.map((key)=>inverse(p(key))+9)
	result=(hasoff?0:(activeKeys.length>0?sum/activeKeys.length:0))
	meter=(20*log10(rms(abs(hpf(result, .001)), 1/500)))

	if (t&255) {
			return result
	} else {
		const waveLabel=waveSelections.map((index, i)=>{
		const waveName=Object.keys(waveFunctions)[index]
		const currentWidth=width[i%width.length]

		const formattedWidth=waveName === 'Pulse' && currentWidth !== undefined?
				abs((currentWidth&255)-128).toString().padStart(3, '0'):''

		return waveName === 'Pulse' && formattedWidth !== ''?
			`${waveName} [${formattedWidth}]`:
			waveName;
		}).join(', ')

	const globalLabel=(activeKeys.length>1)^(waveSelections.length>1)?' (global)':''

	let keyboardStr=''
	if (separate && Array.isArray(c)) {
		keyboardStr=activeKeys.map(key=>f([key])).join('\n')
	} else {
		keyboardStr=f(c)
	}

		throw `\nWave: ${waveLabel}${globalLabel}\nKeys: [${keys.map(key=>key.toFixed(3)).join(', ')}]\ \n${keyboardStr}` +
		'\n\n dB: '+meter.toFixed(3)+' '+['', '!'][(meter>30) | 0] +
		'\n\n'+ff(c=meter+10, '\\', '‾', 128) +
		'\n'+ff(c, '/', '_', 128)+'\n\0'
	}
},

f0=-12*100,
a=t*600/44100*120,
ah=a-10000,
g([
[-1,-6,-3,2,4,6,2,4,-1,-6,-3,2,4,6,4,2][(a>>20&1?(a^a*2):a)>>13&15]+36,
(ah>=0?[-1,-6,-3,2,4,6,2,4,-1,-6,-3,2,4,6,4,2][(ah>>20&1?(ah^ah*2):ah)>>13&15]:f0)+36,
(h=[-1,2,4,2][a>>18&3])+12+(max(12-(a&(at=2**17)-1)%(at*13/16)%(at*10/16)%(at*6/16)/1000,0)/10)**2*12,
h+11.9+(a>>14&1)*12
],
[1,1,2,1],
[a/256,ah/256,0,0],
[(1-(a>>5)/256%1/1.5)*.7,(1-(ah>>5)/256%1/1.5)*.7/3,1,sqrt((1-(a>>6)/256%1)*((a>>8)/256%1))],
1)


//2**([5,f0,0,f0,3,f0,0,f0,5,f0,0,f0,3,f0,0,f0,5,f0,0,f0,3,f0,0,f0,5,f0,0,f0,3,f0,0,f0,][t>>13&31]/12)*t