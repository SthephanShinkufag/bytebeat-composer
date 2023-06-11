/*
 *  == pcm.modshape.wv ==
 *  by argarak
 *  for:: t % 256 compo on battleofthebits.com!
 */

// two different clocks, one used nearer the end
s = t > 79e5 ? (abs(sin(t/90000)%2)/200)*(t/1000)*2 : (t/1000), 

// waveshape tuning
nC=2.97, nC_=3.14, nD=3.33, nD_=3.53, nE=3.735, nF=3.96, nF_=4.195, nG=4.445, 
nG_=4.71, nA=4.99, nA_=5.285, nB=5.595,

mixer=[0,0,0,0,0,0],
chord_index = t>60e5 ? 1 : 0,

// sequencing
// kick, snare, hihat, chord, arp, lead
(t>75e5?    mixer=[1, 1, 1, 1, 0, 0] :
 t>69e5?    mixer=[0, 0, 0, 1, 0, 0] :
 t>55e5?    mixer=[1, 0, 0, 1, 0, 1] :
 t>38e5?    mixer=[1, 1, 1, 1, 1, 1] :
 t>30e5?    mixer=[0, 0, 0, 1, 0, 1] :
 t>20e5?    mixer=[1, 1, 1, 1, 1, 0] :
 t>14e5?    mixer=[1, 1, 1, 1, 0, 0] :
 t>12e5?    mixer=[1, 1, 0, 1, 0, 0] :
 t>7e5?     mixer=[1, 0, 0, 1, 0, 0] :
 t>0?       mixer=[0, 0, 0, 1, 0, 0] : 0),

chord_seq = [
[nD_*3, nF*3, nG_*3, nC*1],
[nD_*3, nA_*3, nG*4, nC*2]
],

Cm_notes = [nC, nD, nD_, nF, nG, nG_, nA_],

// exponential snappy envelope
env = function(step, len, snap) {
return Math.floor((Math.exp(-((step%20)*snap)*len)) * 20)
},

// kick
128 + (Math.sin(Math.log(0.5+(s)%10)*40)*env(s, 1, 0.3) * 2)*mixer[0] +

// snare
((((Math.sin(t/15) + Math.sin(t/20))/7) + Math.random()) * 
env(s/(7/4)*(1 + Math.sin(s/80) < 1.9 ? 1 : 7), 1*(1 + Math.sin(s/40) < 1.5 ? 1 : 0.4), 0.8) * 3)*mixer[1] +

// phasemod hihats
(Math.sin(s*50 + (Math.sin(s*50)*4*env(-s, 1, 0.1)))*env(s*(1 + Math.sin(s/20) < 1.5 ? 2 : 4), 1, 0.5) +
Math.sin(s*20 + (Math.sin(s*50)*4*env(-s, 1, 0.01)))*env(s/(3/4), 1, 0.4))*mixer[2] +

// waveshaping chords
(Math.sin(Math.E+Math.abs(Math.sin(s/100)*4) ** (s*chord_seq[chord_index][0]%2))*1*env((s/4), 0.5, 0.2)*0.5+
Math.sin(Math.E+Math.abs(Math.sin(s/100)*4) ** (s*chord_seq[chord_index][1]%2))*1*env((s/4), 0.5, 0.2)*0.5+
Math.sin(Math.E+Math.abs(Math.sin(s/100)*4) ** (s*chord_seq[chord_index][2]%2))*1*env((s/4), 0.5, 0.2)*0.5+
Math.sin(Math.E+Math.abs(Math.sin(s/100)*4) ** (s*chord_seq[chord_index][3]%2))*1*env((s/4), 0.5, 0.2)*0.5)*mixer[3]+

// arp
Math.sin(1+
+Math.sin(5-Math.abs(Math.sin(s/10)*4) ** (s*2*chord_seq[chord_index][int((s/10)%4)]%2))*2+
Math.abs(Math.sin(s/10)*4) ** (s*1*chord_seq[chord_index][int((s/10)%4)]%2))*1*
env((s*(int((s/80)%2)==0 ? 4 : 2 )), 0.9, 0.3)*mixer[4]+

// leady lead
Math.sin(Math.E+Math.abs(Math.sin(s/80)*4) ** (s*3*Cm_notes[int(((s/50)<<3)%7)]%2)+
Math.sin(Math.E+Math.abs(Math.sin(s/40)*int((t/2000)%5)) ** (s*6*Cm_notes[int(((s/50)<<3)%7)]%2))
)*2*env((s/(int((s/20)%2)==0 ? (3/4) : (5/4) )), 0.5, 0.3)*mixer[5]