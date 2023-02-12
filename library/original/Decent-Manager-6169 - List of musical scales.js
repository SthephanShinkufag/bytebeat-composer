c=1.047,cs=1.107,d=1.173,ds=1.243,e=1.319,f=1.393,fs=1.476,g=1.569,gs=1.655,a=1.755,as=1.862,b=1.978,

/* MAJOR */
Major=t*[c,d,e,f,g,a,b,c*2][t>>14&7], // Ionian

MajorBebop=t*[c,d,e,f,g,gs,a,b,c*2][(t>>14)%9],

MajorBulgarian=t*[c,d,f,fs,gs,a,b,c*2][(t>>14)%9],

MajorPentatonic=t*[c,d,e,g,a,c*2][(t>>14)%6],

MajorPersian=t*[c,cs,e,f,fs,gs,b,c*2][t>>14&7],

MajorPolymode=t*[c,d,ds,f,fs,g,as,b,c*2][(t>>14)%9],

Lydian=t*[c,d,ds,f,fs,gs,as,b,c*2][(t>>14)%9],

Mixolydian=t*[c,d,e,f,g,a,as,c*2][t>>14&7],

PhrygianDominant=t*[c,cs,e,f,g,gs,as,c*2][t>>14&7],


/* MINOR */
Minor=t*[c,d,ds,f,g,gs,b,c*2][t>>14&7],

MinorHungarian=t*[c,cs,d,ds,fs,g,gs,b,c*2][(t>>14)%9],

MinorMelodic=t*[c,d,ds,f,g,a,b,c*2][t>>14&7],

MinorNatural=t*[c,d,ds,f,g,gs,as,c*2][t>>14&7], // Aeolian

MinorNeapolitan=t*[c,cs,ds,f,g,gs,b,c*2][t>>14&7],

MinorPentatonic=t*[c,ds,f,g,as,c*2][(t>>14)%6],

MinorPolymode=t*[c,cs,d,e,f,g,gs,as,c*2][(t>>14)%9],

MinorRomanian=t*[c,d,ds,fs,g,a,as,c*2][t>>14&7],

Dorian=t*[c,d,ds,f,g,a,as,c*2][t>>14&7],

Phrygian=t*[c,cs,ds,f,g,gs,as,c*2][t>>14&7],

Locrian=t*[c,cs,ds,f,fs,gs,b,c*2][t>>14&7],

/* OTHER */

Chromatic=t*[c,cs,d,ds,e,f,fs,g,gs,a,as,b,c*2][(t>>14)%13],

Arabic=t*[c,cs,e,f,g,gs,b,c*2][t>>14&7],

Blues=t*[c,ds,f,fs,g,as,c*2][(t>>14)%7],

Diminished=t*[c,d,ds,f,fs,gs,a,b,c*2][(t>>14)%9],

DominantBebop=t*[c,d,e,f,g,a,as,b,c*2][(t>>14)%9],

Egyptain=t*[c,d,f,g,as,c*2][(t>>14)%6],

Enigmatic=t*[c,cs,e,fs,gs,as,b,c*2][t>>14&7],

Hirajoshi=t*[c,d,ds,g,gs,c*2][(t>>14)%6],

Iwato=t*[c,cs,f,fs,as,c*2][(t>>14)%6],

JapaneseInsen=t*[c,cs,f,g,as,c*2][(t>>14)%6],

LocrianSuper=t*[c,cs,d,e,fs,gs,as,c*2][t>>14&7],

Neapolitan=t*[c,cs,ds,f,g,a,b,c*2][t>>14&7],

WholeTone=t*[c,d,e,fs,gs,as,c*2][(t>>14)%7],Minor