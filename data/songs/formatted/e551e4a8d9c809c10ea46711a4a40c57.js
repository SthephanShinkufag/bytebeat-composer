// >> eslash - processing error

// >> for bytebattle season 5

// this song is a bit less than 5 minutes long.

// rushed asf, because i've been real busy, but what the hell. let's see how this does.

// my hands hurt. a lot.

// ----

	// variables for patterns and time counting

	drumPatterns = ['8888888888888844','8888888888884244','8888888888884121','8888888888882241','8888888888334211'],

	timing = drumPatterns[0] + drumPatterns[1] + drumPatterns[0] + drumPatterns[2] + 
				drumPatterns[0] + drumPatterns[3] + drumPatterns[0] + drumPatterns[4],

		timingPattern = timing[(t >> 12) % timing.length],

	length = 4,

t *= (t < 524288 ? (t % 524288) / 1048576 : 1),

t /= (t < (1572864 * length) ? (t > (1048576 * length) ? ((t - (1048576 * length)) / 256) + 4 : 1) : 1),

		// arrays
		
	t || (r = Array(24576).fill(0),

	 r2 = [0]),

		// stereo setup and main synths

		lr = lr => ((a = (t < 1572864 * length ? (round(sin((t + cos(t / (2048 + lr)) * 40) / (60 + lr) * [3, 3.5, 4, 4.5, 3, 4, 3.5, 4.5][t >> 13 & 7] * [2, 3, 2.125, 2.5][t >> 17 & 3])) * (t / 512 % 16 - 24) / 80 + (t > 524288) * (sign(sin((t + cos(t / (2048 + lr)) * 30) / (480 + lr) * [6, 9, 6.375, 7.5][t >> 17 & 3]))) / 10) : 0) + r.shift(),

	r.push(a / 2),

		a) +
			((b = (s = (sin(t / 64 / (t % 131072) + cos(t / 64 + lr)) * 10) / (60 + lr),

				 isNaN(s) ? 0 : s) + r2.shift(),
	
	r2.push(b / 1.05),
			 
		(t > 1048576) * b / 8) + 

			((t > 1572864) && (t < 4194304)) * sin(8 * cbrt(t % (1024 * timingPattern))) / 4 + 
			
			((t > 2097152) && (t < 4194304)) * (random() - random()) * (t / (1024 / timingPattern) % 16 - 24) / 100) +
 
			((t > 3145728) && (t < 4194304)) * (s = asin(tan(sin((t + cos(t / (2048 + lr)) * 30) / ([160, 120, 100, 80][t >> 12 & 3] + lr) * [6, 9, 6.375, 7.5][t >> 17 & 3]))) * (t / (2048 / timingPattern) % 16 - 16) * (t / (2048 / timingPattern) % 16) / 200, // don't ask how I discovered this synth i honestly have no idea :P

		 isNaN(s) ? 0 : s) // checks if s is not a number so we don't get excess NaN values when playing
	
) * (t < 6291456), 

	// song ends when t is greater than 6291456 

	// (honestly it was only because i couldn't get other numbers to work)

[lr(- .1), lr(.1)] // output with stereo width