/* triangle wave base amplitude/period */
p=163, a=0.2,

/* beat length + counter */
bl=8000, b=int(t/bl),

/* chord pattern: four descending parallel thirds */
c1=5-int(b/8)%4, c2=7-int(b/8)%4,
c3=9-int(b/8)%4, c4=3-int(b/8)%4,

/* the whole melody is defined by this input to the pythagorean scale formula */
m=(b^int(b/8)+3)%12,

/* variations per beat in vibrato speed/d4epth */
k=6+(5<<b^7)%5, vf=5000+1000*((1<<b^9)%5),

/* pause chords at the end of the A pattern */
chord_mute = 1-int((b+64)%128/123),

/*----------------------------------------------------------------------------*/

/* melody. formulas: pythagorean scale exponents + triangle wave + vibrato + melody defined in m */
+2.2*a*((b|7)%2)*abs((int(1+(m+1)/8)*2**(((8-3*(m%7))%11+11)%11)*(t+1*k*sin(t/(0.14*vf)))/3**(((5-2*(m%7))%7+7)%7)%p-1)%p-p/2)

/* chords */
+a*chord_mute*abs((int(1+(c1+1)/8)*2**(((8-3*(c1%7))%11+11)%11)*(t+6*k*sin(t/vf))/3**(((5-2*(c1%7))%7+7)%7)%p-1)%p-p/2)
+a*chord_mute*abs((int(1+(c2+1)/8)*2**(((8-3*(c2%7))%11+11)%11)*(t+6*k*sin(t/vf))/3**(((5-2*(c2%7))%7+7)%7)%p-1)%p-p/2)
+a*chord_mute*(int(b/64)%2)*abs((int(1+(c3+1)/8)*2**(((8-3*(c3%7))%11+11)%11)*(t+6*k*sin(t/vf))/3**(((5-2*(c3%7))%7+7)%7)%p-1)%p-p/2)
+a*chord_mute*(int(b/64)%2)*abs((int(1+(c4+1)/8)*2**(((8-3*(c4%7))%11+11)%11)*(t+6*k*sin(t/vf))/3**(((5-2*(c4%7))%7+7)%7)%p-1)%p-p/2)
+int(1+b%2)*1.5*a*(int((b+1)/64)%2)*abs((int(1+(c4+1)/8)*2**(((8-3*(c4%7))%11+11)%11)*(t/2+k*sin(t/vf))/3**(((5-2*(c4%7))%7+7)%7)%p-1)%p-p/2)

/* snare */
+1.2*sin(t/24<<t/7)/((125/(32*(1+int((b+2)/64)%2))+t/8192)%(125/(16*(1+int((b+2)/64)%2))))**0.8

/* kick */
+7*(sin(t/(p/2)<<0/10)/((t+bl*(int(b/3)%2))/(2048*(1+(int((b+3)/64)+1)%2))%(125/8*(1+(int((b+3)/64)+1)%2)))**0.5)

/* cymbal*/
+(int(b/64)%2)*sin(t/32<<t/6)/((t/4+16*8000)%(32*bl)/(2<<13))**0.3

/* offset everything to avoid distortion from underflow */
+50

