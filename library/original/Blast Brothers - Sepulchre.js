//'Sepulchre' by Blast_Brothers, for a 1k bytebeat compo on battleofthebits.org. When 'unrolled' like this, it's way more than 1k.

//----------------------------------------------------------------
//Note table for 48kHz
//We get octaves by multiplying/dividing by powers of 2. We could use bit-shifts but this takes less space.
//We also bake an octave shift into the oscillator sometimes so we don't have to use products as much

C=29.2,
Cs=27.56,
D=26.02,
Ds=24.55,
E=23.17, //unfortunately this prevents us from using the mathematical constant E
F=21.87, //But we can use all of these values as constants now, which can save space
Fs=20.65, //...except that in the contest version I commented out C since I never used it as a note. Whoops!
G=19.49, //I also ended up manually defining some octaves here (and some other common constant values) to save space.
Gs=18.39,
A=17.36,
As=16.39,
B=15.47,

//----------------------------------------------------------------
//sequencing part

songlength=1024, //needs to be a power of 2. Defines max songClock value.

spd=9E3, //higher values are slower
songClock=(t/spd)&(songlength-1), //The song's 'clock signal' - we use this for note length and stuff that needs to sync with note length, like channel volume. Decimal version for array indexing.
songClockfloat=t/spd, //float version of the song clock


//arrays that hold the notes. Leave entry blank for silence.


//intro arp
arr=[
D, , F, ,
A, , G, ,

Cs, , F, ,
F/2, , G, F,

A*2, , F, ,
A, , G, ,

As*2, , F, ,
As/2, , A/2, ,
],
len=arr.length,

loopcount=songClock/len, //how many times we've gone through the array
//j = t%spd==0 ? 1 : 0, //produces a click pulse in sync with song speed.

p=arr[songClock%len], //p is our pitch value from the array. We use t as the index into the array, and %len caps it to available values.

//We build an echo out of the same array of notes, by offsetting the index we're looking at.
//The "-delay" actually increases the array index for some reason. 
//The &(len-1) on the end solves the problem that results from this, of trying to read past the end of the array.
delay=3,
detune=0.01, //to prevent phasing issues
p2=arr[(songClock%len-delay)&(len-1)] + detune,


p3=arr[(songClock>>4%(len/3))&6], //for bass. Reusing the array we have already


//melody. Has to be 16 lines long b/c comes in after 16 'patterns'.
arr4=[
D,D,F,E,D,D,A*2,A,
D,D,F,G,D,D,A*2,,
D,D/2,F/2,A/2,D/2,D,A*2,A,
D/2,A,F/2,G/2,D/2,Cs/2,A,,
D,F,A,G,Cs,F,F/2,G,
A*2,F,A,G,As*2,F,As/2,A/2,
D,E,F,,D,Cs,A*2,,D,D/2,F,,Cs,E,A,,
],
len4=arr4.length,

p4=arr4[(songClock+4>>3)%len4],
p4prev=arr4[(songClock>>3)%len4], //echo main channel, but also used to help with pitch slides
p4prev2=arr4[(songClock-4>>3)%len4], //just for echo


nl=min(((t/spd*4)&15),8)/8,	//length of time spent on this note. From 1 to 16 over the course of one quarter note. Making nl more precise actually ruins the sound because the wave period doesn't line up across pitch changes.
isHeldNote=p4==p4prev, //Is the note the same as the last one?

//if p4 is null, we want to do a note dive. We prep for this by setting the 'current note' to one octave lower than the last note.
p4null=(p4==null),
p4=(p4null?p4prev*2:p4),



//We calculate the delta from p4prev to p4, and add a fraction of it to our pitch value as nl increases... unless isHeldNote is true, in which case we apply vibrato.
p4=isHeldNote?(p4-sin(songClockfloat*6)/2E4):(p4prev+((p4-p4prev)*nl)),


//The same as above, but for the echo
isHeldNoteprev=p4prev==p4prev2,
p4prevnull=(p4prev==null),
p4prev=(p4prevnull?p4prev2*2:p4prev),
p4prev=isHeldNoteprev?(p4prev):(p4prev2+((p4prev-p4prev2)*nl)),


//----------------------------------------------------------------
//oscillator part


//volumes. 0 to 255
v=min(songClock/3,27), //arp
v2=min(songClock/6,11), //arp echo
v3=72, //bass
v4= (-songClock*8+31)&31, //noise & sine drum. Also controls bitcrush factor.
V=24, //this saves space
i=12,
vm=(p4null?(V-(V*nl)):V), //for melody. Conditional controls what happens when we're doing a note slide.
vm2=(p4prevnull?(i-(i*nl)):i), //for melody echo


//custom parameters for each instrument
pw=1+sin(songClock)*C, //thinpulse width. Smaller numbers are thinner.
	
w = (2^songClock/8)&3, 		//Phaserpulse width. int from 0 to 4. 	0=3.125%	1=6.25%		2=12.5%		3=25%		4=50%
s=4, 				//Phaserpulse speed. Higher values are slower.
c=1, 				//Phaserpulse crustiness. Powers of 2 are best. Set to 0 to disable phaser effect. At 48 kHz, c = 1 is the only speed where the crustiness is above the audible frequency.

//for noise drum
noiseClock=songClockfloat*8,
noisePitch=4+((noiseClock+32)&(45+(songClock/8&3))),

//for bass pattern
oct=(loopcount>=8 && loopcount<=28 ? 2 + 2*(songClock>>2&1) : 2),

//for sine drum. A repeating pitch slide calculation.
size=90, //scale of the slide
len=16, //how frequently it occurs
slidingPitch=size/(songClockfloat*4%len), //This is a log slide
sinp=192+(sqrt(slidingPitch)/64), 



//sin is from 1 to -1. So if we subtract 1, we have 1/2 of the values up at 255 and the other half at 0 - giving us a square wave.
//tan works similarly in this context, but sounds a little different which is nice.
//We & this with the volume to cap it at that volume. This mangles the waveform a bit, but this is a square so it doesn't matter.
//(	(	sin(	t/p	)-1	)&v	) //sinsquare version.

//There are many permutations of this concept. Some of them play in different octaves, but the general idea is the same.
//(	(	tan(	t/2/p	))&v	) //tansquare version.
//(	(	sin(	t/p	) + 1)*(v/2)	) //sine wave.
//(	(	tan(	t/2/p	)&v)	) 	//tangent wave
//(v >>	(	4*t/PI/	(p*pow(2,w) + (t&c)/s)	<<w	)) //Phaserpulse version. the /PI lets us reuse the pitch table from the sin/tan versions.
(	(	p/pw+ tan(	t/2/p	)&v)	) //thin pulse version.

//echo
+((p2/pw + tan(	t/2/p2	)	)&v2)

//bass
+(loopcount>=4 ? v3 >>	(	oct*t/PI/	(p3*pow(2,w) + (t&c)/s)	<<w	) :0) //Phaserpulse version. the /PI lets us reuse the pitch table from the sin/tan versions. Conditional makes the part come in later.

//sine drum and noise 
+(loopcount>=12 ? 
( 0
+((tan(	(t/noisePitch^(songClockfloat*128))	))&v4) //noise drum
+ ((	sin(t/sinp) + 1)*v4)	//sine drum
+ (random()*(-songClockfloat*32&(15-9*sin(C*songClock)))) //additional hihat thing
) : 0)


+(loopcount>=16 && loopcount<=32 ?
(0
+(	(	sin(	t*2/p4)-1	)&vm	) //lead
+(	(	sin(	t*2/p4prev)-1	)&vm2	) //echo
):0) 