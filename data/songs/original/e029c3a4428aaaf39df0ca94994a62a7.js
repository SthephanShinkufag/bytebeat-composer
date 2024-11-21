i=int,z=sin,c='charCodeAt', //set up shortcuts for the int, sin, and charCodeAt functions for shorter code later
b=t/441e3*16, //scale the time variable by the sample rate (44.1kHz)
m=1<<((b/16)%16), //a one-hot variable to tell which measure the song is in, used to play different things in different measures
q=b%.5, //repeating variable from 0 to 0.5, used for kick drum and white noise for snare
h=x=>t/2210*2**(x/12-3), //sawtooth waveform and note frequency calculation
w=(x,y=0)=>h(x)%1-z(y*2+b*PI)/8>.5, //sine waveform, uses 'z' as a shortcut for 'sin' as defined on the first line
s=i(b*2)%32, //which count within the measure we are at
a=abs(8-i(b*8)%16), //which sub-count in the measure
p='pnkgrnkipmigpnkg', //a sequence of notes used in the arp and the last melody
99+27*( //multiply by 27 to make it loud enough and add a constant to avoid distortion
//to sequence the parts, the "m&0b0000011100111111" and similar only plays the part during certain measures. 1st measure is on the right
(m&0b0000011100111111&&0b10100110100001&1<<s%16?z(q/(q/241+2e-4))+z(t/140)/2:0)+ //kick drum. beats appear as 1's in "0b10100110100001" starting from the right
(m&0b0001110101011111?z(t**3/q)*5**(-3*((b+1)%2)):0)+ //snare drum. sin(t**3/q) creates white noise, and 5**(-3*...) makes the sound decay
(m&0b0010011011011000?w(s==6&&i(b*6%6)==1?85:s==14&&q<.25?78:'SSSSSSSQOOONNOLJLLLLLNLJIIIGGG'[c](s),s==5):0)+ //square wave melody with a twiddle
(m&0b0001110010011110?w('@@@@@@BCEEECCBCCEEEEECEEBBB@@@'[c](s)):0)+ //square wave bassline. the last few @'s are removed so it cuts out at the end of the measure
(m&0b0110111001111100?(h(p[c](a%4+i(s/8)*4)+12*-i(a/4))%1):0)+ //sawtooth arpeggiator, loops thru each sequence of 4 notes quickly twice before moving to the next 4
(m&0b0001001100110000?(z(PI*h(p[c](s*3%16))))**3:0) //slower sine wave arpeggiator. re-uses the same note list but plays every 3rd note and wraps around
)