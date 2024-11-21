//							  ^
/*If you have a fast computer, set this to 44kHz__________|  */  hq=true, 
/*And set this to true____________________________________________^


====================================================================
====================================================================
		   /       _____       \
		  /       /     \       \
		 /       /       \       \
		(       (         )       )
		 \       \       /       /
		  \       \_____/       /
		   \                   /
			   FOCUS
			HEXAGONEST
		      SUPER HEXAGON
							      v1.4
====================================================================
====================================================================
Bytebeat version of "Focus", made by DoubleyouDashM  (Wiebe-Marten Wijnja)
	My site:  http://www.wmmusic.nl

Original song written by Niamh Houston (Chipzel)
	Her site: http://chipzelmusic.bandcamp.com/

for the game Super Hexagon, which was made by Terry Cavanagh
	His site: http://distractionware.com/

===

Note: Source is up on GitHub: https://github.com/Qqwy/ExtremeBytebeats

Why did I make this?
-> I love Super Hexagon
-> I love Chipzel's Music and Chiptune in general
-> I wanted to learn more about and Waveform creation in computers
-> I wanted to learn more about procedural content genration. (Yep, although the output from this code is deterministic, it is procedural)


Features:
->Speedup or slowdown as much as you want without losing quality
->Play backwards!
->When compressed, only 3452 bytes:  1/1000th of the size of Focus as .mp3(actually a lossy format) which is +- 2.5 Megabytes.
	(Note that further compression should also be easily possible. There's lots here that could be code-golfed)



==
This was lots of hard work. I hope you like it.
Now I'll go back to actually beating the game! ;D
~W-M

*/

//Some values for you to tamper with:

backwards = false,	//Enable this for sdrawkcab fun!
factor=1.055, 		//change this value to increase or decrease speed. 1.055 is the speed the original Hexagonest has.
speedup = true, 	//Song will increase its speed slightly while going on! :D



/*

*/



factor+=(speedup?t*.000000001:0),
//Ensure pitch correction:
!hq&&(t*=5.6),
//Play backwards when enabled
backwards&&(t=(8<<20)-t),


t*=factor,




t=t%(8<<20),//Song looping

//Pseudo random number generation using trigonometry
rand = function(t){
	with(Math){
		return cos(t*cos(t)); 
	}
},

//Used for Hihat and Snare
noise=function(ocshift, envelope, espeed, eshiftspeed, emod, gain){
	return ((rand(t>>ocshift)) *gain *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0);
},


//Saw wave, used for most Bass instruments
saw=function(melody, mspeed, mmod, ocshift, envelope, espeed, eshiftspeed, emod, gain){
	
	return ((((t/factor)*Math.pow(2, gm(melody, mspeed, mmod)/12-ocshift)%255)/127-1)*gain   *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0)
},


//Triangle wave, used for most melody instruments
tri=function(melody, mspeed, mmod, ocshift, envelope, espeed, eshiftspeed, emod, gain){
	return ((abs((t/factor)*Math.pow(2, gm(melody, mspeed, mmod)/12-ocshift)%4 -2)-1)*gain   *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0)
},


//Pulse wave, used for some of the instruments
pulse=function(melody, mspeed, mmod, ocshift, envelope, espeed, eshiftspeed, emod, gain){
	return ((((t/factor)*Math.pow(2, gm(melody, mspeed, mmod)/12-ocshift)&128)/128)*gain   *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0)
},


//Sine wave. Actually unused right now, but I thought i'd keep it here for documentation.
sine=function(melody, mspeed, mmod, ocshift, envelope, espeed, eshiftspeed, emod, gain){
	
	return (sin((t/factor)*Math.pow(2, gm(melody, mspeed, mmod)/12-ocshift))*gain   *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0)
},


//Sine wave with support for pitch-shifting. Used for some fill-in effects. Poiiiing!
jump=function(melody, melody2, jumpspeed, mspeed, mmod, ocshift, envelope, espeed, eshiftspeed, emod, gain){
	var d=gm(melody, mspeed, mmod);
	var e=gm(melody2, mspeed, mmod);
	var g=((e-d)*(((t)%(jumpspeed))/(jumpspeed)))  +d;
	var x=t;
	return (sin(((t)%jumpspeed)*Math.pow(2, g/12-ocshift)    	)*gain   *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0)
},

rkick=function(ocshift, envelope, espeed, eshiftspeed, emod, gain){
	return (((sqrt(t%0x2000)<<6  &255)/127-1) *gain *(envelope?ge(envelope, espeed, eshiftspeed, emod):1)||0);
},


//Get Melody function. Returns the proper current tone from the melody string.
	//Tone height in semitones is the ASCII value of the current char.

gm=function(m, speed, mod){//Get Melody
	var d=m.charCodeAt((t>>speed)%mod);
	return d==32?0:d;//Space is rest(although it has to be set in the envelope as well to prevent clicks)
},


//Get envelope function. Returns the proper current envelope speed from the envelope string.
	//All envelopes are simple Decay envelopes. The numbers indicate the time it takes to go from full volume to 0.
	//9 indicates to keep full volume the whole time.
	//0 indicates a rest.

ge=function(e, espeed, eshiftspeed, mod){
	en=e[(t>>eshiftspeed)%mod];
	var d=espeed * +en;
		return (en==9?.4:(1-(t%d/d)))
},

/*
========
PATTERNS
========
*/

m="ADCHAAAA", 
me="88424444",

b1m=   "AAAAYMAMAAAAYMAMAAAAYMAMAAAAYMAM====UM=M====UM=M????WM?M????WM?M",
b1e="88882222",

b2m="AAAAAAAC====????",
b2e=(t>>20==0?"99":"02"),

bell1m="AACCDDAAAACCDDAAAACCDDAAAACCDDAAAAHHKKFFAAHHKKFFFFHHMMKKKPOKMM  ",
bell1e="3030303030303030303030303030303030303030303030303030303033333300",

bell2m="ACDF",
bell2e="02202000",

m2= "=< 5 CD ",
m2e="22020220",

j= "####8888####8888####8888####8D#&",
jb="----DDDD----DDDD----DDDD----DQ&!",
je="2",

m3= "D5CD?5C5",
m3e="42224242",

b3m="AA=?AAAA",
b3e="2",

m4="AAHDDDDC",
m4e="40",

m5= "AHAM MHMAHAM MHMDKDP PDPCJCO OJO?F?K KFK?F?K KFKAHAM MHM<C<H HCH",
m5e="22240222",

b4m= "AA=?",
b4e="2221220000000000",

j2= "#",
j2b=")",
j2e="02000000",

m6= "HD A IM HD A IM HD A IM HD A IM DHCD?ACADHCD?ACADHCD?ACADHCD?ACA",
m6e="22 2 22 22 2 22 22 2 22 22 2 22 22222222222222222222222222222222",

m7="HAAA",
m7e="1",

m8="AAHDDDCC",
m8e="1000",

base= ((t>>20==0)||(t>>20==2)?"F F  F  ":(t>>20==1)?"F F F F ":(t>>20==3)?"        ":(t>>20==4)?"F   F   F F F   ":"F F  F  "),
basee=((t>>20==0)||(t>>20==2)?"20200200":(t>>20==1)?"20202020":(t>>20==3)?"00000000":(t>>20==4)?"2000200020202000":"20200200"),

//Extra fill in
base=(t>>18==15? "F       F       F   F   F F F   ":base),
basee=(t>>18==15?"20000000200000002000200020202000":basee),
basemod=(t>>18==15?32:(t>>20==4)?16:8),//Different pattern length depending on place in song.


snaree=(t>>20==3)?"00008880":(t>>20==4)||(t>>20==5)?"00002000":"00200020",
hihate=((t>>20==2)?"0000101010001000000001010100010000":(t>>20==3)?"10000000000010000000000000000000":(t>>20==4)?"0":"10001000100010001000100010001000"),


/*
===========
INSTRUMENTS
===========
*/

//Basic melody 1 (and 3 for intermezzo)
	((t>>20!=3)&&((t>>19!=14)&&(t>>19!=15))?tri(m,13,8,10,me, 0x1000, 13, 8, .18):0)
+//Bass 1
	((!(t>>20)||(t>>19==5))?pulse(b1m,13,64,7,b1e, 0x1000, 13,8, .2):0)
+//Bass 2 ( and 3 for intermezzo)
	((t>>20!=3)&&(t>>20!=6)&&(t>>20!=7)?saw(b2m,15,16,6,b2e, 0x2000, 13, 2, .3):0)
+//Bass 3
	((t>>20==3)||(t>>20==4)||(t>>20==5)?saw(b3m,17,8,6,b3e, 0x1000, 13,1, .15):0)
+//Bells 1
	((t>>20==1)||(t>>20==5)?tri(bell1m,13,64,9,bell1e, 0x300, 13,64, .15):0)
+//Bell 2
	((t>>20)==2?tri(bell2m,16,4,9,bell2e, 0x400, 13,8, .15):0)
+//Jump effect
	((t>>18==11)?jump(j,jb, 0x2000, 13,32,8,je, 0x1000, 13, 1, .2):0)

+//Melody 2
	((t>>20)==2?tri(m2,13,8,13,m2e, 0x1000, 13,8, .1):0)
+//Melody 3, intermezzo
	((t>>20==3||(t>>20==4))?saw(m3,13,8,4,m3e, 0x1000, 13, 8, .08):0)

+//Melody 4
	((t>>20)==3?tri(m4,16,8,9,m4e, 0x1000, 13,1, .1):0)
+//Melody 5 
	((t>>19==12)||(t>>19==13)?tri(m5,13,64,9,m5e, 0x1000, 13,8, .3):0)
+//Bass 4 (outro)
	((t>>19==14)||(t>>19==15)?saw(b4m,17,4,7,b4e, 0x1000, 13,16, .2):0)
+//Melody 6 (outro)
	((t>>19==14)||(t>>19==15)?saw(m6,13,64,4,m6e, 0x1000, 13,64, .2):0)
+
	((t>>20==6)?jump(j2,j2b, 0x2000, 14,1,8,j2e, 0x1000, 13, 8, .2):0)

+//Melody 7 (outro)
	((t>>19==14)||(t>>19==15)?tri(m7,12,4,9,m7e, 0x1000, 13,1, .1):0)
+//Melody 8 (outro)
	((t>>19==14)||(t>>19==15)?tri(m8,16,8,8,m8e, 0x1000, 12,4, .3):0)
+


//Hihat
	(((t>>19!=14)&&(t>>19!=15))?

	noise( 1, hihate, 0x800, 11, 32, .1)
+//Snare
	noise( 3, snaree, 0x1000, 13, 8, .2)

+//Bass Drum

	rkick(9,basee, 0x1000, 13,basemod, .3):0)