S=f=>sin(t/48000*2*PI*f),  // sine wave generator
stretch=.06,  // harmonic series stretch factor
W=(f,e=2,i=1)=>i<24&&S(f*i)+W(f*(1+stretch),e,i+1)/e,  // bell waveform generator
env=.99998**(t%1E5)*(1-.995**(t%1E5)),  // amplitude envelope
rolloff=1.7-cbrt(env)/2,  // harmonic rolloff factor curve
(
  W(118,rolloff)
 +W(117.7,rolloff)
 +W(118.5,rolloff)
)*.15*env