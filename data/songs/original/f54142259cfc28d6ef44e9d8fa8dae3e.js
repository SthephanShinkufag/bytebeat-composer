/*
    ████████████████   
  ████████████████████ 
  ██    ████    ██████ 
  ██    ████    ██████  	 ____               _           _   _                _   _____     _       
  ████████████████████  	|  _ \ _ __ ___  __| | ___  ___| |_(_)_ __   ___  __| | |  ___|_ _| |_ ___ 
  ████████████████████  	| |_) | '__/ _ \/ _` |/ _ \/ __| __| | '_ \ / _ \/ _` | | |_ / _` | __/ _ \
  ██            ██████  	|  __/| | |  __/ (_| |  __/\__ \ |_| | | | |  __/ (_| | |  _| (_| | ||  __/
  ████        ████████  	|_|   |_|  \___|\__,_|\___||___/\__|_|_| |_|\___|\__,_| |_|  \__,_|\__\___|
    ████████████████   
       ████████        									From VVVVVV
    ████████████████   
  ████████████████████ 			Written by: 
  ████████████████████ 				Souleye / Magnus  Pålsson  (http://souleye.se)
  ████████████████████ 
  ████████████████████ 
  ████  ████████  ████ 			Bytebeat adaption:	
  ████  ████████  ████ 				W-Mcode / Wiebe-Marten Wijnja (http://wmmusic.nl/wmcode)
      ████████████     
      ████    ████     
    ██████    ██████   
    ██████    ██████   
    ██████    ██████   


									Version 1.1
__________________________________________________________________________________



VVVVVV is one of my favourite games of all time. Because of the gameplay, but for a big part because of the music.
'Predestined Fate' is one of the best chiptunes I know of. Souleye is an amazing composer.

And thus, here is a bytebeat rendition of this song, compressing it to less than a kilobyte.
I hope you like it as much as I enjoyed making it.

~W-M

Oh, and feel free to reach me on Twitter ( @W_Mcode ) or send me a mail at ( W-M@gmx.us ).


FEATURES:
-The complete song, as written by Souleye
-Four different synthesizer shapes, as well as three kinds of percussion sounds.
-Looping, in the way it was intended by Souleye, by skipping the intro.






WHAT IS THIS?
Bytebeat is making music using only code.
Each sample, a function is run. This function(you're reading it now) outputs a speaker position(between -1 an 1) for each sample in the song.
This way, it is possible to make synthesizers using only a few (or many) lines of code.

More information on Bytebeat can be found at:
=My bytebeat cover of 'Please Exist' from Knytt Underground (written by Nifflas): http://tinyurl.com/pleaseexist
=My 2014 JS1K contest entry: http://js1k.com/2014-dragons/demo/1953  (and a mirror: http://wmmusic.nl/code/js1k/got/ )
=My earlier Bytebeat cover of 'Focus' from SuperHexagon (written by Chipzel): http://tinyurl.com/focushexagon1-4
=Kragen's long blog post with much info: http://canonical.org/~kragen/bytebeat/
=The original Bytebeat topic: http://www.pouet.net/topic.php?which=8357
=Blog article from Viznut, the re-introducer of Bytebeat: http://countercomplex.blogspot.nl/2011/10/algorithmic-symphonies-from-one-line-of.html





All right. That's all I have to say.

Below starts the source code.

Enjoy your day =)

*/
t*=5.6,
ratio= .78,//match the speed that the original song has.
t*=ratio, //ratio is multiplied here and removed again inside the get melody function, so the pitch wont increase.
v=t>>12, //v is used in many places to check how far we are in the song. It is incremented each 4096 samples, roughly.
v=(v%768)+(v>767?128:0),//Song looping. When past 768, repeat, skipping the first 128.

				//Get Melody function. This is the real synthesizer.
				/* 
				p = pitch offset.
				o = octave offset.
				q = current place in pattern. This is changed to change the speed at which the pattern is playing. (or play backwards, etc)
				m = the melody string used.
				s = the wave shape: 0=pulse, 1=saw, 2=triangle, 3=sine

				m2=second melody string (optional)
				j = jumpspeed (optional)
				*/
				M = function( p,o, q, m,s, m2, j){
					j=j||0x2000,
					r=m.charCodeAt(q)||0,
					q=(m2!=null)?m2.charCodeAt(q)||0:0,
					r=q==0?r:(r-q)*((t%j)/j)+q,
					g=r<33?0:((t%j)/ratio)*pow(2, (r+p)/12-o);//get absolute pitch from semitone.
					x=(g%255)/128-1;//This section is used by both saw and triangle wave (as tri is nothing more than abs(saw) )
						return (s?(s<2)?x:(s<3)?abs(x)*3:sin(PI*x):(g&128)/64-1);//The real magic: decide between pulse, saw and triangle and synthesize them.
				},
 
	m='5:=5:=5:<5:<5:<:16:18:161:168:68',//main arpeggio
	m2=': ',			//first bell-like sound.
	m3=': : 5 8 ::::: :<= < : 8 ::::::: ',//first melody
	m4b=':: 55 ::6666 6:<<<<<88AA66666   ',//second melody
         m4=':: 55 ::6666 6:<==<<::AA66666   ',//second melody
	m5='                        ?A? = < ',//fill in at end of second melody

	m6=':51...55:::::::<===<<<8811111111',//intermezzo melody
	m7=': ::: ::: ::: ::6 666 666 666 66',//intermezzo bass
	

	//basedrum
	btime=2<<12,
	bm=(80-40)*pow(1-(t%(btime))/(btime),10)-80,
	bm2=parseInt("01",2),
	bd=(bm2>>(t/btime)%2)&1?sin((PI*(t%btime)*pow(2,bm/12-1)))*pow(1-(t%btime)/btime,10):0,

	//high tom
	btime=2<<11,
	btm=(80-15)*pow(1-(t%(btime))/(btime),10)-80,
	btm2=parseInt("1111010111010111",2),
	bt=(btm2>>(t/btime)%16)&1?sin((PI*(t%btime)*pow(2,btm/12-1)))*pow(1-(t%btime)/btime,10)*.3:0,

0+
(v<640?M(6,5,(t>>12)%32,m,3)*.3+M(6,3,(t>>12)%32,m,3)*.01+(v<64?0:M(6,4,(t>>12)%32,m,2)*.05)//arpeggio
+(v<128?0:(M(6,3,(t>>16)%2,m2,2)+M(9,4,(t>>16)%2,m2,2)+M(13,4,(t>>16)%2,m2,2))*(1-(t%(65535))/(65535))*.05)//bell
+(v<196?0:M(6,4,(t>>12)%32,m3,((t>>17)%2?0:1))*.05)//first melody

//This part only between 256 and 480?, then a pause until 512 and then play again
+(v>255&&(v<448||v>511)?
+(v<256?0:bd+bt)//drums
+(v<20?0:M(6,3,(t>>13)%32,m4,2,m4b,0x8000)*.1+M(6,4,(t>>13)%32,m4,1, m4b,0x8000)*.05)//second melody
+(v<320?0:M(6,3,(t>>12)%32,((t>>17)%2?m5:' '),3)*.2):0)//fill in

://Outro
M(6,4,(t>>13)%32,m6,3)*.05//intermezzo melody
+M(6,5,(t>>12)%32,m7,2)*(1-(t%(2<<11))/(2<<11))*.05//intermezzo bass
+((t>>15)%4?0:((((sqrt(t%0x2000)<<6  &255)/127-1))/((t>>13)%4+1))*.15)//distorted drum effect
)