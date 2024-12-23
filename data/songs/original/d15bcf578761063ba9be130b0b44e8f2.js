t*=1.15, 
d = t%1024,

// minor scale
bass = [0,0,7,0,0,0,2,3],
kick = [1,0,0,0,0,0,0,0],

limit = x =>
	x>1 ? 1 : (x<-1 ? -1 : x),
//byte = x => 
//	(int(255&x)/128)-1,
bytegate = x => 
	(int(255&x)/255),

o_bass =
limit(
	sin(t*2**(-5+(bass[int(t>>12)%bass.length]/12)))*4*(sin(PI*t/2048))
),

o_kick =
limit(
	sin(d/32*
		(2-((d/1024)%1))
	)
	*(bytegate(-d>>2)/2)
	*(kick[(t>>10)%kick.length])
	*4
),

o_hat = 
(2*random()-1)
*bytegate(-d>>3)
/(d**0.3)
,

o_snare =
random()
*(bytegate(-t>>5)**3)
*(1&t>>13)
,

(o_bass + o_kick + o_hat + o_snare)/4