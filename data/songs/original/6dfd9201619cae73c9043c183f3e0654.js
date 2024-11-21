/*
	PortablePorcelain's Tracker v1
	Cover: Zombie Nation - Kernkraft 400

	P   : Percussion - This is what you want for percussion. It is the first column, and it can do triplets, and be turned off with 0.

	DUTY: Duty cycle - This is the duty cycle. Self-explanatory if you have knowledge of computers and circutry

	PTC : Pitch      - This is the pitch. Also quite self-explanatory. However, it can support leading 0s and more than just 2-3 digit numbers, as shown here.

	CHD : Chord      - This is the "chord" (lack of a better term). Each number in the chord is represented in base 36. If you want negative numbers, then try moving the pitch down. If you want more than 36, move the pitch up. I know, it's limited, but it's the best I can do for now.
*/
song = [
 /* P   DUTY     PTC CHD   DUTY PTX CHD */
	'2 : 11011001 000 ___ : 1000 000 ___',
	'2 : 11011001 077 eqe : 1000 065 222',
	'2 : 11011001 080 eqe : 1000 000 ___',
	'2 : 11011001 082 eqe : 1000 065 227',
	'2 : 11011001 084 eqe : 1000 000 ___',
	'4 : 11011001 000 ___ : 1000 065 222',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'4 : 11011001 000 ___ : 1000 065 227',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'2 : 11011001 077 eqe : 1000 065 222',
	'2 : 11011001 080 eqe : 1000 000 ___',
	'2 : 11011001 082 eqe : 1000 065 227',
	'2 : 11011001 084 eqe : 1000 000 ___',
	'4 : 11011001 085 eqe : 1000 065 222',
	'2 : 11011001 084 eqe : 1000 000 ___',
	'4 : 11011001 080 eqe : 1000 065 227',
	'2 : 11011001 082 eqe : 1000 000 ___',
	'2 : 11011001 000 ___ : 1000 058 222',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'2 : 11011001 000 ___ : 1000 058 227',
	'2 : 11011001 080 eqe : 1000 000 ___',
	'4 : 11011001 000 ___ : 1000 060 222',
	'2 : 11011001 084 eqe : 1000 000 ___',
	'4 : 11011001 077 eqe : 1000 060 227',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'2 : 11011001 000 ___ : 1000 065 222',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'2 : 11011001 000 ___ : 1000 065 227',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'4 : 11011001 000 ___ : 1000 065 222',
	'2 : 11011001 000 ___ : 1000 000 ___',
	'4 : 11011001 000 ___ : 1000 065 227',
],
iter = 0,
f = (x,speed) => x[(t / speed / (2 ** 12)) % x.length | 0].split(':').map(j => j.split(' ').filter(k => k != '')),
parseTracks = (x,speed) => {
	x = f(x,speed);
   iter += 1 & (4e2 * (x[0] * 8 - 15)) / (t / speed / 8 * x[0] % 1024) / 16
   for(i=1;i<x.length;i++){
		for(j=0,l=x[i][2].length;j<l;j++){
			iter += x[i][0][t * 2 ** ((parseInt(x[i][1]) + parseInt(x[i][2][j], 36) - 79) / 12 + 1) / 32 % x[i][0].length | 0] / 2
		}
	}
   return iter * 16
},
parseTracks(song,.4)