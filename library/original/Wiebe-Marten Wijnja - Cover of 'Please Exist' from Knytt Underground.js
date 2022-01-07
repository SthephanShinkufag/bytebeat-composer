/*
  _____  _      ______           _____ ______   ________   _______  _____ _______ 
 |  __ \| |    |  ____|   /\    / ____|  ____| |  ____\ \ / /_   _|/ ____|__   __|
 | |__) | |    | |__     /  \  | (___ | |__    | |__   \ V /  | | | (___    | |   
 |  ___/| |    |  __|   / /\ \  \___ \|  __|   |  __|   > <   | |  \___ \   | |   
 | |    | |____| |____ / ____ \ ____) | |____  | |____ / . \ _| |_ ____) |  | |   
 |_|    |______|______/_/    \_\_____/|______| |______/_/ \_\_____|_____/   |_|   
                                                                                  
					┬ ,┌┬┐  ┌─┐┌─┐┌─┐┬─┐┌─┐┌─┐┬┌─┐┌┬┐┌─┐  ┬┌┬┐
					│   ││  ├─┤├─┘├─┘├┬┘├┤ │  │├─┤ │ ├┤   │ │ 
					┴  ─┴┘  ┴ ┴┴  ┴  ┴└─└─┘└─┘┴┴ ┴ ┴ └─┘  ┴ ┴ 

__________________________________________________________________________________

		Written by:
			Nifflas / Nicklas Nygren  (http://nifflas.ni2.se/)

		Bytebeat adaption:
			WMcode / Wiebe-Marten Wijnja  (http://wmmusic.nl/code)


version 1.0
__________________________________________________________________________________

This was a lot of work to make, and I hope you enjoy.

Features:
-Full song written by Nifflas
-Additive synthesis Bell sound.
-Additive synthesis Bass sound.
-A fake delay-like effect used on the arpeggios and drums.
-Multiple sophisticated sine based drum sounds.


To be done:
-Making it smaller
-Making it faster


WHAT IS THIS?
Bytebeat is making music using only code.
Each sample, a function is run. This function(you're reading it now) outputs a speaker position(between -1 an 1) for each sample in the song.
This way, it is possible to make synthesizers using only a few (or many) lines of code.

More information on Bytebeat can be found at:
=The original Bytebeat topic: http://www.pouet.net/topic.php?which=8357
=My 2014 JS1K contest entry: http://js1k.com/2014-dragons/demo/1953  (and a mirror: http://wmmusic.nl/code/js1k/got/ )
=My earlier Bytebeat cover of 'Focus' from SuperHexagon (written by Chipzel): http://tinyurl.com/focushexagon1-4
=Kragen's long blog post with much info: http://canonical.org/~kragen/bytebeat/
=Blog article from Viznut, the re-introducer of Bytebeat: http://countercomplex.blogspot.nl/2011/10/algorithmic-symphonies-from-one-line-of.html


Oh, and feel free to reach me on Twitter ( @W_Mcode ) or send me a mail at ( W-M@gmx.us ).


All right. That's all I have to say.

Below starts the source code.

Enjoy your day =)

~W-M
____________________________________________________________________________________

*/



t*=0.95,//slows the song slightly to make it more or less in tune with Nifflas' original song.
t%=800e4,//loops the song

/*
======
SYNTHS
======
*/
	//get melody function. Returns the current pitch in frequency for a certain semitone.
	//input:
	//oc = octave offset
	//z  = current position in pattern
	//m  = melody pattern, a string of letters,numbers or other symbols. The ASCII code (see http://asciitable.com ) of this symbol will be used as semitone height.
	gm=function(oc,z,m){p=m.charCodeAt(z);return p<33?0:t*pow(2,(p||0)/12-oc)},


	//Bell
	d=16e4,
	k=4e4,
	m='5 38',//bells,   E   D G
	
	y=PI*gm(9,(t/d)%4,m),//this part is the same for all sine waves.
	//By detuning them slightly, one gets a bell-like sound. (see: http://computermusicresource.com/Simple.bell.tutorial.html )
	x=(sin(y*.5)+sin(y*2)+sin(y*3)+sin(y*4.2)+sin(y*5.4))*.2*(pow(1-(t%16e4/(16e4)),2)),

	//Choir. triangle waves on multiple octaves.
	o='1',
	q='5',
	s=(abs((gm(3,(t/4e4)%1,q)%128)/64-1)+abs((gm(3,(t/4e4)%1,q)%128)/64-1)+abs((gm(3,(t/4e4)%1,o)%128)/64-1)+abs((gm(4,(t/4e4)%1,o)%128)/64-1)+abs((gm(5,(t/4e4)%1,o)%128)/64-1))*.01,



	//PERCUSSION

	//snare
	sn=function(t){return sin((t>>2)*sin((t>>4)))*pow(1-(t%5e3)/5e3,8)*.01},
	m=983047,//this is "00000000000011110000000000000111" in reverse binary notation. As I don't need melody height info, I can use a binary code, and save space that way. (its about the only minification put in place this far...
	z=((m>>(t/5e3)%32)&1?sn(t)*8:0)+((m>>((t-15e3)/5e3)%32)&1?sn(t)*4:0),


	//base drum
	bm=(30-15)*pow(1-(t%15e3)/15e3,10)-80,
	bm2=parseInt("001111000111",2),
	bd=(bm2>>(t/15e3)%12)&1?sin((PI*(t%15e3)*pow(2,bm/12-1)))*pow(1-(t%15e3)/15e3,10)*.5:0,

	//floor tom

	fm=(30-20)*pow(1-(t%15e3)/15e3,10)-73,
	fm2=parseInt("000000001000",2),
	ft=(fm2>>(t/15e3)%12)&1?sin((PI*(t%15e3)*pow(2,fm/12-1)))*pow(1-(t%15e3)/15e3,10)*.5:0,



	perc=z+bd+ft,//add the different parts together


	//arpeggio
	a='.13:=AF',// A C D A C E A
	w=abs((gm(4,(t/1e4)%7,a)%128)/64-1)+//arpeggio
	abs((gm(4,((t-15000)/1e4)%7,a)%128)/64-1)*.5,//echo (faking a a delay effect)
	
	//BASS
	//a blend of square and triangle waves.
	//Uses multiple patterns as it is polyphonic.

	g='1:85....1:85..00',//Root: C A G E A A A A
	i='5=<811115=<81133',//3ds : E C B G C C C C
	h='8A?<55558A?<5588',//5th : G E D B E E E E
	
	n='5538', //bass 2(used later on), E E D G
	
	//bass, first part is attack, second part is sustain.
	z=( 
	 (((gm(5,(t/4e4)%16,g)&128)/64-1)*.1)*(1-(t%k/(k)))+abs((gm(6,(t/4e4)%16,g)%128)/64-1)
	+(((gm(5,(t/4e4)%16,h)&128)/64-1)*.1)*(1-(t%k/(k)))+abs((gm(6,(t/4e4)%16,h)%128)/64-1)
	+(((gm(5,(t/4e4)%16,i)&128)/64-1)*.1)*(1-(t%k/(k)))+abs((gm(6,(t/4e4)%16,i)%128)/64-1)
	+(((gm(4,(t/4e4)%16,g)&128)/64-1)*.1)*(1-(t%k/(k)))+abs((gm(5,(t/4e4)%16,g)%128)/64-1)
	)*.1,



	u=((((gm(5,(t/16e4)%16,g)&128)/64-1)*.1)*(1-(t%k/(k)))+abs((gm(6,(t/16e4)%4,g)%128)/64-1))*.3,//bass 2


//PUT TOGETHER SONG


+(t<256e4?z*(t<32e4?((t%32e4)/32e4):(t>128e4?(1-(t-128e4)/128e4):1)):0)//bass, play during first 128000 samples, fade out during next 128000 samples, dont play afterwards.


+(t>128e4&&t<448e4?(sin((t-128e4)*pow(2,-19))*w*.2):0)//arpeggio, fading in and out using a LFO (low-frequency oscillator)


+(t>128e4&&t<592e4?x*.1:0)//bells, play between 128000 and 5760000
//start bass2 from 320000 and onwards


+(t>320e4&&t<592e4?u*   (t<448e4?(t-320e4)/128e4:t<592e4?(1-(t-468e4)/128e4):1):0)//Bass 2,start 320000 and fade in until full volume at 448000. Fade out starting at 512000 until tacet from 5760000 onwards


+(t>320e4&&t<640e4?perc*(t<448e4?(t-320e4)/128e4:t<640e4?(1-(t-512e4)/128e4):1):0)//Percussion, start at 3200000 and fade in until full volume at 448000, fade out starting at 512000 until tacet from 5760000
+(t>384e4&&t<768e4?s*   (t<576e4?(t-384e4)/64e4:t<768e4?(1-(t-704e4)/64e4):1):0)//Choir, start at 3840000 and fade in until full volume at 5760000, fade out starting 7040000 until tacet from 7680000.

//extra noise to ensure that person keeps listening in the quiet part when the song loops. 
//Ambient noise is very Nifflas-ish. (see: http://www.youtube.com/watch?v=qvsoxmJqBww )
+random()*.002