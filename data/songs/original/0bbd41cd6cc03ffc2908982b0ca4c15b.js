F=2*PI/48000,
G=t%(1<<16),
OS=1+sin(F*t*5)/t/F/700*(1-.5**(G/2E4)), // Fundamental frequency scale (vibrato for naturality)
FF=77*256/48000*OS,	// Fundamental frequency
FS=t*FF%256,  // Saw wave at fundamental frequency
S=f=>sin(f*FS/FF*F), // Sine wave at a given frequency, hard-synced with fundamental
PH=[ // (DC + Formant1 + Formant2 + ...)
	(2+S(780)*2+S(1600)*3+S(2170)*3+S(3600)/4+S(9600)/6)*.8, // [A]pp   (æ)
	(2+S(760)*3+S(1160)*2+S(2800)  +S(3600)/5+S(7300)/8),    // [A]h    (ä)
	(2+S(740)*2+S(920)*3 +S(2600)*2+S(3200)/4+S(5300)/9),    // [O]n    (ɑ)
	(2+S(400)*3+S(2200)*2+S(2630)/2+S(4300)/8),              // F[a]ce  (e)
	(2+S(450)*3+S(1980)  +S(2580)  +S(4500)/16),             // S[e]t   (ɛ)
	(2+S(400)*2+S(1750)*3+S(2350)*2+S(3300)/2),              // S[i]t   (ɪ)
	(1+S(210)*3+S(2640)  +S(2900)/2+S(4500)/2),              // M[ee]t  (i)
	(2+S(500)*3+S(1000)*2+S(2300)  +S(4000)/16),             // V[o]id  (ɔ)
	(2+S(400)*3+S(700)*2 +S(2700)/9),                        // Gr[o]w  (o)
	(1+S(230)*4+S(920)*1.4+S(3500)/16+S(9600)/2),            // L[oo]t  (ʉ)
	(2+S(400)*3+S(1000)*2+S(2300)/2+S(9600)/8),              // P[u]sh  (ʊ)
	(2+S(600)*3+S(1240)*2+S(2700)/2+S(3500)/5),              // B[u]t   (ʌ)
	(2+S(400)*3+S(1500)*2+S(2800)/2+S(3700)/8),              // T[o]day (ə)
	(1+S(280)*3+S(1650)*2+S(2100)  +S(3000)/2+S(7600)/8)     // Ros[e]s (ᵻ)
],
PH[(t>>16)%PH.length] // Rotate phonemes
*(.99**FS*(1.1-.9**FS)) // Periodic excitation (ring mod w/ formants)
/6*log(E-(E-1)*(t/(1<<16)%1))*(1-.997**G) // Phoneme envelope