// Beats per minute.
// Bars per beat.
// Measures per bar.
// Tuning frequency for A4.
// Volume bar size.
// Resolution of throw display. Set D to 1 to disable status info.
// Whether you have a 512px width display. (Off by default).
const SETTINGS = {BPM:130,BPB:2,MPB:8,A4:440,VBS:50,D:300,SMOL: 1};

let SONG,OUTPUT,t,t1,sr,CHANNELS,maxChCount=4,chCount;
let snare = 0;
const throwDisplay=true;

let mixer=
	{	
		channels: Array(maxChCount).fill(0),
		volumes: Array(maxChCount).fill(0),
		names: Array(maxChCount).fill(''),
		volumeBars: Array(maxChCount).fill(0)
	}

let FX = {
	echo: { arrays: [], count: 0 },
	pitchshift: { arrays: [], count: 0 }
}

class AudioChannel {
	/** @type number */wave;
	/** @type string */source;
	constructor(value, name) {
		this.wave = value;
		this.source = name;
	}

	echo(size,dry=0.5,wet=0.5,T=t,F=x=>x) {
		if (FX.echo.arrays[FX.echo.count]==undefined) {
			FX.echo.arrays.push(Array(size).fill(0)); 
		}
		
		this.wave = 
			FX.echo.arrays[FX.echo.count][int(T%size)]=
			F(new AudioChannel((FX.echo.arrays[FX.echo.count][int(T%size)]??0),'')).wave*wet+
			this.wave*dry;
		this.source = '[E]' + this.source;
		FX.echo.arrays.count++;
		return this;
	}

	pitchshift(shift,arrSize=1024,T=t) {
		if (FX.pitchshift.arrays[FX.pitchshift.count]==undefined) {
			FX.pitchshift.arrays.push(Array(arrSize).fill(0)); 
		}

		FX.pitchshift.arrays[FX.pitchshift.count][int(T%arrSize)] = this.wave;
		this.wave = FX.pitchshift.arrays[FX.pitchshift.count][int((T*shift)%arrSize)]??0;
		

		this.source = '[P]' + this.source;
		FX.pitchshift.count++;
		return this;
	}

	mult(x) { this.wave*= x; return this }

	/** 
	 * Adds to the mixer.
	 * @param {number} amp The amplitude of the output.
	 */
	add(amp) {
		chCount++;
		if(chCount>maxChCount) {
			maxChCount++;
			mixer.channels.push(this.wave);
			mixer.names.push(this.source);
			mixer.volumes.push(amp);
			mixer.volumeBars.push(abs(this.wave));
		} else {
			mixer.channels[chCount-1]=this.wave;
			mixer.names[chCount-1]=this.source;
			mixer.volumes[chCount-1]=amp;
		}
	}
}

const PATTERNS = {
	M : 'CCFE775033520023',
	A : '58C58C5858CEFEC73205327538538530',
	D : "SHH SH HS H SHHH",
	D2: "S  HS H SH HSH  "
}

const WAVETABLES = {
	SQUARE    : '01',
	TRISQUARE : '012',
	TRISQUARE2: '012321',
	HEXSQUARE : '012345',
	RETRO     : '01111010001010111101101001100000',
	RETRO2    : '0edea6d442d6a6988e5ea6d44ad62600',
	TRIANGLE  : "0123456789abcdeffedcba9876543210",
	BLANC     : "02345677789999877899998766654310"
}

// Convert MIDI pitch values into Hz frequency.
function MIDI2Hz(IN) {
	return SETTINGS.A4*(2**((IN-69)/12))
}

function SSR(z) {
	return int(z * (sr) / 48000);
}

function SSB(z, r=120) {
	return z * SETTINGS.BPM / r
}

function beatLength() {
	return int(sr * 60 / SETTINGS.BPM);
}

// Sawtooth oscilattor, can be used for indexing.
function SAW(FREQ,AMP=1){
	return (t1*FREQ%1)*AMP
};

// General purpose oscillator.
function WAVE(TABLE,FREQ,AMP){
	// Convert wave table to numbers.
	const OTABLE = TABLE;
	if(typeof TABLE == 'string') {
		TABLE = TABLE.split('');
	}
	TABLE = TABLE.map(k=>{
		if(typeof k == 'number') return k;
		try {
			return parseInt(k,16);
		} catch {
			return NaN;
		}
	})
	TABLE = TABLE.map(k=>{
		if (isNaN(k)) {
			return 0;
		} else {
			return k;
		}
	})

	// Get min and max for wave table.
	let min1 = 15;
	let max1 = 0;
	TABLE.forEach(k=>{
		min1=min(min1,k);
		max1=max(max1,k);
	});

	const offset = -min1;
	const divisor = max1-min1;

	if(divisor==0) return;

	return new AudioChannel( (TABLE[int(SAW(FREQ,TABLE.length))]-offset)/divisor-0.5,'Wave' + (typeof OTABLE == 'string'&&OTABLE.length<=32?'['+OTABLE+']':'')+" @ "+String(int(FREQ)).padStart(4,'.')+"Hz");
}

function SEQ(ARR,IDX){
	return ARR[int(IDX)%ARR.length];
}

function DRUMS(PAT,SPD,M) {
	let S=0,H=0;
	switch(M){
		case 0: case false: default:
			S=+(snare>0.5);
			H=(((t1*32e3*SETTINGS.A4/440)>>4)*PI)&1;
		break;
		case 1: case true:
			S=random();
			H=sin(SAW(2.3*SETTINGS.A4,PI*2))/2+0.5;
		break;
		case 2: // FROM https://dollchan.net/btb/res/3.html#1799
			H=(((t1*16800*SETTINGS.A4/440)%25^(t1*16800*SETTINGS.A4/440)%214)&28)/28
			S=(((t1*16800*SETTINGS.A4/440)%81^(t1*16800*SETTINGS.A4/440)%104)&64)/64;
		break;
	}
	let O = 0;
	let Q = SEQ(PAT,SONG.UNMOD.BEAT*SPD);
	if(Q=='H')
		O=H;
	if(Q=='S')
		O=S;
	O-=0.5;
	O*=1-((SONG.UNMOD.BEAT*SPD)%1);
	return new AudioChannel(O,PAT.length<20?'Drum'+(+M)+' ['+(PAT.slice(0,((SONG.UNMOD.BEAT*SPD)%PAT.length))+'|'+PAT.slice(((SONG.UNMOD.BEAT*SPD)%PAT.length)+1))+']':'Drum');
}

function RISE(){
	let S = +(snare>0.5);
	if(SONG.BAR==7) {
		return new
AudioChannel((SONG.UNMOD.BAR%1)*S-0.5,'Build');
	}
	return;
}

function generateVolumeBar(v) {
	return '['+'!'.repeat(abs(v*SETTINGS.VBS)).padEnd(SETTINGS.VBS,'.')+']'
}

function DISPLAY() {
	if((t%SETTINGS.D)==1){
		let String = "status at ["

		String += SONG.BEAT+":";
		String += SONG.BAR+":";
		String += SONG.MEASURE+"] ";
				if(SETTINGS.BPM<=4) String += "|/-\\"[SONG.UNMOD.BEAT*256&3];
		if(SETTINGS.BPM<=15) String += "|/-\\"[SONG.UNMOD.BEAT*64&3];
		if(SETTINGS.BPM<=60) String += "|/-\\"[SONG.UNMOD.BEAT*16&3];
		String += "|/-\\"[SONG.UNMOD.BEAT*4&3]+"\n\n";
		let i=0;
		for(; i<chCount; i++) {
			String+=SETTINGS.SMOL?(i+': ' + mixer.names[i]+", V="+(int(mixer.volumes[i]*100)/100)+" \n"+generateVolumeBar(mixer.volumeBars[i])+"\n\n"):(i+': ' + generateVolumeBar(mixer.volumeBars[i])+ ' ' + mixer.names[i]+", V="+(int(mixer.volumes[i]*100)/100)+" \n");
		}
		for(; i<maxChCount; i++) {
			String+=SETTINGS.SMOL?i+': ' + '---\n'+ generateVolumeBar(0) + '\n\n':i+': ' + generateVolumeBar(0)+" ---\n";
		}
		throw String.trim();
	}
}

function MSEQ(ARR,SPD=4,OFF=48){
	return MIDI2Hz(parseInt(SEQ(ARR,SONG.UNMOD.BEAT*SPD),36)+OFF)
}

// Either takes a total channel count, or
// automatically dermines it.
function MIXER(vol) {
	let volumesCombined = 0;
	for(let i=0; i<chCount; i++)
	{
		volumesCombined += mixer.volumes[i];
		OUTPUT += mixer.channels[i]*mixer.volumes[i];
		mixer.volumeBars[i]=max(mixer.volumeBars[i]-2/sr,abs(mixer.channels[i])*mixer.volumes[i]/min(vol??4,4));
	}
	OUTPUT/=vol??volumesCombined;
}

function THEHYPERSPHERE(T,SR){
	if(SR==undefined) {
		SR=32000;
	}
	chCount=0;
	OUTPUT=0;
	t = round(T*SR);
	sr = SR;
	t1 = T;
	CHANNELS=0;
	if(!T) {
		for (let i in FX) {
		try {
			FX[i].arrays = [];
		} catch {}
	}
	}
	for (let i in FX) {
		try {
			FX[i].count = 0;
		} catch {}
	}

	SONG={BEAT: null, BAR: null, MEASURE: null, UNMOD: {BEAT: null, BAR: null, MEASURE: null}};

	// Calculate progress.	
	SONG.UNMOD.BEAT = T*(SETTINGS.BPM/60);
	SONG.UNMOD.BAR = SONG.UNMOD.BEAT/SETTINGS.BPB;
	SONG.UNMOD.MEASURE = SONG.UNMOD.BAR/SETTINGS.MPB;

	SONG.UNMOD.MEASURE %= 26; // Looping

	SONG.BEAT = int(SONG.UNMOD.BEAT%SETTINGS.BPB);
	SONG.BAR = int(SONG.UNMOD.BAR%SETTINGS.MPB);
	SONG.MEASURE = int(SONG.UNMOD.MEASURE);

	snare=(((snare*((sr/1000)-1))+random())/(sr/1000));

	if (SONG.MEASURE != 13 && SONG.MEASURE != 19 && SONG.MEASURE < 25) WAVE(SONG.MEASURE>3?WAVETABLES.RETRO2:WAVETABLES.RETRO,MSEQ(SONG.BAR>=6?'07B07B07':'07C07C07',4,28+parseInt(SEQ('777A3337',SONG.UNMOD.BAR),16))).mult((1+(SONG.MEASURE>3))-(SONG.UNMOD.BEAT*4%1)).echo(int(beatLength()/3)).add(2);

	if(SONG.MEASURE == 0 || SONG.MEASURE == 3 || SONG.MEASURE == 13 || SONG.MEASURE == 19 || SONG.MEASURE == 23) RISE()?.add(1);

	if(SONG.MEASURE && !(SONG.MEASURE == 3 && SONG.BAR == 7) && SONG.MEASURE != 19 && !(SONG.MEASURE==23&&SONG.BAR>3) && SONG.MEASURE < 24) DRUMS(SONG.MEASURE<20?PATTERNS.D:PATTERNS.D2,4,(SONG.MEASURE>3)).echo(int(beatLength()/PI),0.6,0.4).add(2)

	if(SONG.MEASURE > 7 && SONG.MEASURE < 20) 
		WAVE(SONG.MEASURE&2?WAVETABLES.HEXSQUARE:WAVETABLES.TRISQUARE,MSEQ(PATTERNS.M,1/2,59)).add(1.00006**-((SONG.UNMOD.BEAT%2)*10000)*2);

		if (SONG.MEASURE > 13) WAVE('01020103',MSEQ(PATTERNS.A,4,42)).add(1.00006**-((SONG.UNMOD.BEAT%(1/4))*80000)*2);

	MIXER(7);
	DISPLAY();

	return OUTPUT*2;
};

return THEHYPERSPHERE;