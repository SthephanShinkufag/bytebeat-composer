//"Slouch", a 48kHz bytebeat by Blast_Brothers designed to fit into 1 kilobyte when optimized.									9/19 to 9/22/2023
//This is not the optimized version, but a more readable version that I use to actually make the song.
//When the song is done, I'll go back and hand-optimize it (shorter variable names, getting rid of whitespace, moving single-use variables inline, turning repeated sections of code into variables, etc.)
//----------------------------------------------------------------

//Note array for 48kHz
//This was calculated by comparing a generated sine wave to a reference wave generated in Audacity, and trying to match the pitch as closely as possible.

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
29.2		//11	C
],

noteArrLen=noteArr.length,

//----------------------------------------------------------------
//song clock part.
//Bytebeat will run all our code for every audio sample (as t increases). That's great for generating a waveform, but less useful for sequencing song data.
//We need a way to break the audio into larger "ticks", similar to the pattern rows in a tracker

spd=6000, //higher values are slower. This affects the speed of everything, but not pitch (since the audio "oscillators" are based directly on t).
songClock =t/spd, //The song's 'clock signal' - we use this for note length and stuff that needs to sync with note length, like channel volume. Increases by 1 every "tick".

const1=floor(songClock/512), //Sometimes we don't want something to happen *every* tick, so we slow down songClock.
noteAdjust=(const1*const1)&15, //we use this for key changes.

//----------------------------------------------------------------
//sequencing part

//the arrays hold the note sequence. We read back note data by iterating through them in order (or not, so we can get different patterns from one array).

//for FM bass:
arr4=[
12+4,12+4,12+1,12+6,11, ,12+1,12+6, //Adding multiples of 12 is how we control octave
12+4,12+4,12+1,12+6,11, ,9,6, //We use a null value (empty space) to indicate different things, depending on the oscillator.
],

len4=arr4.length,

//We index into the above array based on songClock values.
//In turn, we will later use those values to index into the noteArr array that holds the actual pitch values... only necessary if you're keeping pitch values in an array
p4=arr4[(
		(songClock>>1) 	//The shift left slows down the speed at which we advance through the note array; our "ticks" become twice as long
	)%len4		//This keeps us within range of the array, even though songClock increases infinitely.
],


p4prev=arr4[((songClock>>1)-1 )%len4], //Same thing, but we read one position earlier into the table with that "-1"


//For the FM bass, a null note indicates that we want to sustain the previous note into this tick
p4Held=p4==null, //We save that status here...
p4=(p4Held?p4prev-noteAdjust:p4-noteAdjust), //and then assign the previous note on top of the current note if it's true, so the previous note continues

oct4=pow(2,floor(p4/12)), //We need to map increasing octaves to exponential shifts in pitch. Bit shifts are out because that would round pitch to an int. So, we do this.



//for square bass and lead:
arr2=[36+4,,36+1,24+11,24+9,24+4,24+1,12+11,12+9,12+4,12+1,11,9,4], //This is just an ascending scale... but we never read it in sequence
len2=arr2.length,

//array index for lead
shiftedSongClock = songClock+192,
p2=arr2[(shiftedSongClock&(ceil(shiftedSongClock/48)) + shiftedSongClock/32)&31]-noteAdjust, //At this point we're just trying to generate random sequences
oct2=pow(2,floor(p2/12)),

//for lead echo
shiftedSongClock = shiftedSongClock-3.1, //By shifting this, it's like we're reading the notes with a delay... which is what we want
p2e=arr2[(shiftedSongClock&(ceil(shiftedSongClock/48)) + shiftedSongClock/32)&31]-noteAdjust,
oct2e=pow(2,floor(p2e/12)),

//array index for square bass
p3=arr2[(((((songClock+3)/7))&37 - (songClock)/9))+512&len2],
p3prev=arr2[(((((songClock)/5)-1) & 37 - (((shiftedSongClock-3.9)/4)-1))+512)&len2], //Not really the "previous note" - just designed to mess stuff up


offset=-7,
p3Held=p3==p3prev,
p3=(p3Held?-1:p3-noteAdjust),
oct3b=pow(2,floor((p3+offset)/12)), //for second note of chord

oct3=pow(2,floor(p3/12)),


//For descending pulse
p5=arr2[floor(len2-(songClock%64)/2)%len2]-noteAdjust, //We're basically just reading the array backwards with some extra jazz thrown in.
oct5=pow(2,floor(p5/12)),

//----------------------------------------------------------------
//volume envelope calculation part

//for square chord
v3=(19-(16*(songClock/3%1))), //Goes down from 19 to 3 over 3 songClock ticks

//For descending pulse
v5=(16-(16*(songClock/2%1))),

//----------------------------------------------------------------
//oscillator part

//the sine function goes from 1 to -1. So if we subtract 1, we have 1/2 of the values up at 255 and the other half at 0 - giving us a square wave.
//tan works similarly in this context, but sounds a little different which is nice.
//We & this with the volume to cap it at that volume. This mangles the waveform a bit, but this is a square so it doesn't matter.
//(	(	sin(	t/p	)-1	)&v	) //sinsquare version. "p" would become noteArr[p%noteArrLen]*oct because we're using a pitch table instead of pitch constants

//There are many permutations of this concept. Some of them play in different octaves, but the general idea is the same.
//(	(	tan(	t/2/p	))&v	) //tansquare version.
//(	(	sin(	t/p	) + 1)*(v/2)	) //sine wave.
//(	(	tan(	t/2/p	)&v)	) 	//tangent wave
//(	(	p/pw+ tan(	t/2/p	)&v)	) //thin pulse version. "pw" is pulse width
//(v >>	(	4*t/PI/	(p*pow(2,w) + (t&c)/s)	<<w	)) //Phaserpulse version. the /PI lets us reuse the pitch table from the sin/tan versions - this one isn't based on a trig function



//2OP FM bass setup
//FM is really just the current value of a sine wave used to affect the current value of a second sine wave. Easy to replicate in bytebeat.

q2 = 1.5, //ending TL (volume)
q1 = 5, //starting TL (relative to q2)

//TL of modulator 1. If the note is held, TL is set to where it is at the end of one tick. So, it's like the modulator envelope has reached the "S" part of an ADSR envelope.
S = p4Held?(q2):(q1 - q1*(songClock/2%1) + q2), //Notice that this is very similar to the volume envelope for square chords 
M = .25, //MULT of modulator

s = 21, //TL = of carrier.
m = .5, //MULT of carrier.

//----------------------------------------------------------------
//Output part. This is where we add all the oscillators' outputs together.
//You can disable a channel by commenting out all the lines associated with it

//square chord. Note how p3 is used as an index into the note pitch array, and how the returned value is multiplied by the octave
+(songClock>768?(((sin(	t/((noteArr[p3%noteArrLen]*oct3/2))		)-sin(1.5*shiftedSongClock)-.5)&v3)	):0) 
+(songClock>768?(((sin(	t/((noteArr[(p3+offset)%noteArrLen]*oct3b/2))	)-sin(shiftedSongClock)-.5)&v3)	):0)


//descending square
+(songClock>1536?(((sin(t/((noteArr[p5%noteArrLen]*oct5/4)))-sin(2*shiftedSongClock&7)-1)&v5)):0) //Note how this part will be 0 until songClock exceeds a certain value


//lead output
+(songClock>128?((tan(t/(noteArr[p2%noteArrLen]*oct2)		)&20)):0) //The &20 is a crude volume scale
+(songClock>128?((tan(t/(0.05+(noteArr[p2e%noteArrLen]*oct2e))	)&12)):0) //The 0.05 acts as detune

//FM bass generator
//Note how the modulator code is basically just the carrier code nested inside itself
+(s*sin	(		
	t/(noteArr[p4%noteArrLen]*oct4)*m
		+S*sin	( 
					t/(noteArr[p4%noteArrLen]*oct4)*M
			)
)
+ s)

//Noise hihat generator. Basically a small regular bytebeat
+(songClock>64?(random()*4 >> (-songClock*2 & (-t/2>>songClock)) & ((spd-songClock)*4)&3)*4:0)

//Second noise hihat thing
+(songClock>512?(random()*8 >> (songClock*8 & (-(t/16)>>songClock)) & ((spd-songClock)*4)&3)*4:0)

//cowbell generator
+((songClock/2%1)<.12	// this cuts off sound after a certain point in the note
&&songClock>32? ((tan(t*21)/tan(-t/15)) &(((songClock))&3)*7):0)

//sine kick drum
+ (songClock>1280?((	sin(1E9/(spd+(8/(songClock*64%256)))) + 1)*11):0)	