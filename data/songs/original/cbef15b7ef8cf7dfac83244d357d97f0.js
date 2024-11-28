// Octave: 4 (Middle: C4)
C=261.63/255,
CH=277.18/255,
D=293.66/255,
DH=311.13/255,
E=329.63/255,
F=349.23/255,
FH=369.99/255,
G=392/255,
GH=415.30/255,
A=440/255,
AH=466.16/255,
B=493.88/255,

// Define some chord voicings with the notes
Cm7=[C,C*2,G*2,AH*2,DH*4],
Gm7=[G/2,G,F*2,AH*2,D*4],
Fm7=[F/2,F,DH*2,GH*2,C*4],

// Sequence the chord voicings
SEQ=[Cm7,Cm7,,Cm7,,,,,Gm7,Gm7,,Gm7,,,,,Fm7,Fm7,,Fm7,,,,,Fm7,Fm7,,,Gm7,Gm7,,,],

// Square <-> Saw synth with Sierpinski LFO
syn=f=>t*f&(128+127*sin(t*2*PI/8192)**2)&255,

// If the sequence element is an array, play each note in it; otherwise, play one note
(N=SEQ[(t>>12)%SEQ.length])instanceof Array?N.reduce((a,v)=>a+syn(v)/N.length,0):syn(N)