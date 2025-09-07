//"Piece Stacker" by Blast_Brothers
//2025-02-16 to 2025-02-19, made for Winter Chip XX
//Commented version (the packed version fits into 1 KB!)


//-----------------------------------------------------------------------------------------
//Note array for 48kHz
//This was calculated by comparing a generated sine wave to a reference wave, and trying to match the pitch as closely as possible.

//Originally this was just a list of defined constants instead of an array.
//I changed it to an array because it lets us fake key changes by just offsetting the index we use to access this table. But, it makes everything else more complicated.
//Changing over to this was one of the last things I did for that reason - it makes the note sequences defined later very hard to read.
//See my bytebeat 'Sepulchre' for an example of using pitch constants.

//Arranged in descending order because the octave code just kind of worked out so that larger numbers have lower pitch.
noteArr=[
15.47,		//0	B
16.39,		//1	A sharp
17.36,		//2	A
18.39,		//3	G sharp
19.49,		//4	G
20.65,		//5	F sharp
21.87,		//6	F
23.17,		//7	E
24.55,		//8	D sharp
26.02,		//9	D
27.56,		//10	C sharp
29.2			//11	C
],
noteArrLen=noteArr.length, //If we precalculate this, we don't have to type .length all the time. This will save space when I eventually squeeze all this code to fit in 1024 bytes (which I do manually). Other tricks to save space: Renaming variables to be single characters, moving single-use constants and functions inline, and shoving everything into one line.


//-----------------------------------------------------------------------------------------
//In this song, t advances at a rate of 48000 per second. 
//Bytebeat will run all our code for every audio sample (as t increases). That's great for generating a saw wave, but less useful for sequencing song data. So, we define a new variable that increases more slowly:

spd=9100, //higher values are slower. Does not affect pitch, only sequencing speed.
songClock = t/spd,

const1=floor(songClock/512), //This is just a convenience function.

noteAdjust=(const1*(const1^2))-1&9, //we use this to schedule key changes. This showcases the primary technique of bytebeat: Stacking a bunch of math and bitwise operations to turn t, a variable that increases linearly, into a value that does not increase linearly, but jumps around between different values.


//-----------------------------------------------------------------------------------------
//sequencing part
//the arrays hold the note sequences. We read back note data by iterating through them in order (or not, so we can get different patterns from one array).

//for bass:
bassArray=[
12+5,5,12+2,12+7,12, ,12+2,7, //Adding multiples of 12 is how we control octave.
12+7,12+7,12+2,12+7,12, ,10, //We use a null value (empty space) to indicate different things, depending on the oscillator. In this song they're used exclusively to mean "no note", which is the default, but when we read the array later, we can check if the value we read is null, and do whatever we want with that information.
],
bassArrLen=bassArray.length,


//for everything else:
snareLUT = [2,,5,12+7,12+10,24+5,24+7,48+2,,12+10,5,,,12+2,10,7,2,], //It's called SnareLUT because this was originally used exclusively for the snare sound, but later I crammed more notes in and used it for the main melody too.
snareLUTlen = snareLUT.length,


//-----------------------------------------------------------------------------------------
//echo part
//If we have a function that outputs a series of notes with respect to t, we can make it play those notes with a delay if we subtract some number from t. We can do this over and over, with larger and larger delay values, and quieter and quieter volumes, to create something that sounds like reverb.
//This requires us to declare our oscillators as proper functions, and then pass them to this function, which unfortunately uses more bytes, but I felt like it was worth it in this case.
echoIterator = (func_to_call, iterations, delay_time) => {

	result = 0

	for (i = 1; i<=iterations; i++) {
		delayed_t = t - (delay_time*(i-1)<<10)
		delayed_song_clock = delayed_t/spd
		result += func_to_call(delayed_t, delayed_song_clock, i/32) / (i*2) //each function gets passed a delayed t, a delayed songClock, and a "detune" value used for chorus effects. Not all functions make use of all three values. The / (i*2) halves the volume of each iteration, giving us a proper echo. 
	};

	return result
},


//-----------------------------------------------------------------------------------------
//oscillator part - functions that take in t and the note value from the array, and return a waveform playing a note at a specified pitch.

//the sine function goes from 1 to -1. So if we subtract 1, we have 1/2 of the values up at 255 and the other half at 0 - giving us a square wave.
//We & this with the volume to cap it at that volume. This mangles the waveform a bit, but that can actually be desirable in some cases. You could also implement volume as a division, like the echo code does.

//(	(	sin(	t/p	)-1	)&v	) //sinsquare version. "p" would become noteArr[p%noteArrLen]*oct because we're using a pitch table instead of pitch constants, so we have to index into the note table and apply octave separately.

//There are many permutations of this concept.
//(	(	tan(	t/2/p	))&v	) //tansquare version.
//(	(	sin(	t/p	) + 1)*(v/2)	) //sine wave. Notice how volume is applied differently to avoid the clipping that turns it into a square wave.
//(	(	tan(	t/2/p	)&v)	) 	//tangent wave
//(	(	p/pw+ tan(	t/2/p	)&v)	) //thin pulse version. "pw" is pulse width

//(v >>	(	4*t/PI/	(p*pow(2,pw) + (t&c)/s)	<<pw	)) //Phaserpulse version. the /PI lets us reuse the pitch table from the sin/tan versions - this one isn't based on a trig function

//All of the oscillators are proper functions in this song, because that's how we pass them to the echoIterator.
//t and songClock have to be passed in, instead of these functions referencing the global versions, because that's how the echo works. 


//bass with lowpass effect.
bass = (local_t, localSongClock) => {
	noteIndex=bassArray[(localSongClock&(ceil(localSongClock&47))+localSongClock/128)&31]-noteAdjust //note that we are NOT reading from bassArray in order, and that the exact order changes as localSongClock increases. This is what gets us multiple basslines from an array that's only 16 entries long.

	octave=pow(2,floor(noteIndex/12))*4 //remember, we have to apply octave separately

	//using t for note indexing instead of local_t is key to lowpass effect. I think this is because it makes the wave interfere with itself in a way that sounds like the wave is being smoothed?
	note = sin((t/(noteArr[noteIndex%noteArrLen]*octave)))

	//Defining a volume envelope
	endvol = 1
	startvol = 64 - endvol
	decay = 64
	v=(startvol - (localSongClock*decay)&startvol-1) + endvol
	

	//I have yet to do the math on how this actually works
	//1 or below: No sound
	//+1 to 2: Pulse wave getting thicker
	//above 2: Some kind of resonance/feedback thing
	//When combined with echo, sounds like a lowpass filter!
	//The formula below is just a way to produce an interesting iteration over that range.
	filter = 1.5 + (sin(localSongClock*PI/6 + (0.5 - localSongClock*PI/32)))/2 //check out the use of the PI constant, precalculated in the JS math lib. This bytebeat player pre-imports the math lib, so we can write PI instead of Math.PI

	return ((note*filter)&v)
},

//Just a small regular bytebeat. Gets embellished when we throw echo on it later.
intro = (local_t, localSongClock) => {
	return(t**(1+sin(localSongClock/PI)/128) & (2*spd+localSongClock*sin(2*localSongClock))) & (24+localSongClock/32)*2
},

kick = () => { //This is a sine wave output that calculates a pitch sweep instead of reading notes from a table
	startpitch=9E5
	pitchspeed = 5E4
	speed = 32
	length=128
	volume=40

	pitch=startpitch/(spd+(pitchspeed/((spd+songClock)*speed%length)))

	return (sin(pitch) + 1)*volume
},

//Snare built off a noise generator. One of the few oscillators that actually reads its array in sequence.
snare = (local_t, localSongClock) => {
	delay = spd*4 //This shifts the clock values so the snare lands on every second beat

	local_t = local_t+delay
	localSongClock = local_t/spd

	volume=49

	noisepitch = snareLUT[floor(32*localSongClock&255)] //By ANDing this value with a number that's larger than the length of snareLUT, we create "dead time" where 0 is returned after the value exceeds the array bounds. This keeps the snare from triggering more frequently. If we wanted the snare to have a more interesting pattern, we could replace the 255 with some sequence that changes over time.

	//If our t value is a multiple of the noise pitch, we calculate the sin of t*pitch, which will effectively be a random number. If t is not a multiple of the pitch, we work backwards to find the last t value that *was* a multiple of the pitch, and plug that into the oscillator.
	//The result is a random number that holds its value for 'noisepitch' samples and then changes - which is what a noise generator is!
	//EDIT: It's not *exactly* the same function on both sides of the equation. I did this on accident but it actually doesn't sound all that different so I didn't notice.
	random_value = local_t%noisepitch==0
		?sin(local_t)*noisepitch
		//:sin(local_t-(local_t%noisepitch))*noisepitch
		:local_t-(local_t%noisepitch)
		
	noise = sin(random_value)+1

	return noise*volume&volume
},

//tansquare
lead = (local_t, localSongClock, detune) => {
	shiftedSongClock = localSongClock
	noteIndex=snareLUT[(localSongClock-(-ceil(shiftedSongClock/4))-shiftedSongClock)&31]-noteAdjust // the -noteAdjust is what gives us key changes.
	octave=pow(2,floor(noteIndex/12))/2

	endvol = 0
	startvol = 32 - endvol
	decay = 32
	v=(startvol - (shiftedSongClock*decay)&startvol-1) + endvol

	return ((tan((local_t)/((noteArr[noteIndex%noteArrLen]*octave)+detune/3))&v))
},

//Another tansquare
lead2 = (local_t, localSongClock, detune) => {

		localSongClock = localSongClock - 384
		
		noteIndex = snareLUT[floor(-localSongClock*(const1/8)&31)&((localSongClock/7&63)-32)-(const1&7)]-noteAdjust

		note = noteArr[noteIndex%noteArrLen] + (detune/6)
		noteOct = ((-songClock*(2+sin(localSongClock>>10)))&3)+1 //acts as arpeggiator

		v = 32
		return (	(	tan(	local_t/2/(note*noteOct) )&v)	)
},


//-----------------------------------------------------------------------------------------
//output part
+(songClock<254  ?  echoIterator(intro, 8, 8)  :  kick())
+(songClock>=128 ?  echoIterator(bass, 24, 1)  :  0)
+(songClock>=332 ?  echoIterator(lead, 12, 6)  :  0)
+(songClock>=512 ?  echoIterator(snare, 32, 1) :  0)
+(songClock>=736 ?  echoIterator(lead2, 6, 6)  :  0)



// <3