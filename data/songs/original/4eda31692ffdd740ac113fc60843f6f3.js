//FOLDABLEBOLDFOLDS
//5th gen remix of deadfacebeef69, foldableboldface, 1fccccf1, ca98
//orig character size: 635



/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*\
| you cannot face the 9/4 rhythm that is mixed in with a 3/4 triplet-ish feeling~~~~~~~~~~~~~~~~~~~ |
| slighghtly calming vibes for me~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
| very slow song~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
| v variable is kept for reverb consistency while t is still used (reverb changes with sample rate) |
| doesn't lag chrome~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
| removes useless .split('').parseInt(x,2) and leaves the still-functioning x.toString(2)~~~~~~~~~~ |
| homage to foldableboldface with the hex code this time~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
| slightly dissonant tritone chord progression for spiciness~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
| made with love~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
| poorly formatted~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
\*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/



//side note: you can use this simple no-lag reverb method very easily
//the variables, in order, are the input, reverb delay, and the feedback amount.
//the input could be anything (but it distorts stuff like sine waves at values over 256)
//the delay can also be anything as long as your computer can handle a really large delay
//the feedback amount can be any value (0 to 1 works best, but negative values give a cool effect too)
//i hope you like this
this.v??=0,o=34,r=(w,s,i)=>(v++||(a=Array(round(o*s)).fill(0)),w=w%256+a[z=v%a.length],a[z]=w*i,w),

//time variables
w=t*2/o,y=w/9,

//pitch function
p=(w,i=0)=>w*2**(i/12),

//saw and triangle wave functions
saw=w=>w/64%1-.5,tri=w=>asin(sin(w*PI/8)),

//chord maker
c=(i,s=0,r=1,d=sin)=>(l=i.map(i=>p(w,i+s)),m=l.reduce((q,s)=>d(q*r)+d(s*r)/sqrt(i.length)),m/i.length),

//binary tracker
b=x=>x.toString(2),r(
//song
	//kick
	sin(3*sqrt(w%(b(15)[(w>>10)%9]?1024:512)))*b(139940)[(w>>9)%18]+
	//two note chord progression with in fade
	!!(y>>12)*r(c([[4,2],[0,-3]][y>>10&1],3,2,tri),1536,-.5)*(y%1024)/2E3+
	//snare ('100' takes more space so it doesn't really matter) 
	!!(y>>13)*b(4)[(w>>10)%3]*random()*(w/1024%1-1)-
	//facable bold folds melody
	saw(w*(0xfacab1eb01df01d5*((w>>13)+5)).toString(7)[(w>>9)%14]*2*p(.5,[3,-2][y>>10&1]))/2+
	//three note chord progression
	!!(y>>14)*c([[0,2,7],[-3,0,4]][y>>10&1],-1,0,sin),
//delay, feedback, volume
1536,.5)/3