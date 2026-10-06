// What do you think about my chord progression
// Fmaj7 => Dmin => Gmaj => Emin7

t || (Buffer = []),
CallCount = 0,
LPF = LowPassFilter = function(Input, Frequency) {
	Call = CallCount++;
	Buffer[Call] ??= 0;
	Buffer[Call] += (Input - Buffer[Call]) * Frequency;
	return Buffer[Call]
},
HPF = HighPassFilter = function(Input, Frequency) {
	return Input - LPF(Input, Frequency)
},
Clamp = x => min(max(x,-128),127),
Song = _j => (
	j = _j - trunc(_j),
	Chords = [
		[5, 9, 12, 16],
		[2, 5, 9, 14],
		[7, 11, 14, 19],
		[4, 7, 11, 14]
	],

	Index = Chords[t >> 16 & 3],
	_Chord = Detune => Index.reduce(
		(Accumulator, NextItem) => 
				Accumulator + 
					(t * Detune * 2 ** (NextItem / 12) % 256)
			 / 4 + 
		HPF((random() - .5) * 32 + j, .5)
	),
	Chorus = _Chord(1) + _Chord(j + 1) + _Chord(j * 2 + 1),
	Chord = (LPF(Chorus, .3) - 340) * max(.25, t / 16384 % 1),
	Clamp(
	Chord  
	+ (3 * sin(5 * cbrt(t % 16384)) - .33) * (1 - t / 16384 % 1) ** 3 * 32 
	+ (
   	4 * sin(sin(14 * cbrt(t % 16384)) / 3 +
   	+ LowPassFilter(random() * 1.1 * (1 - t / 16384 % 1)
   	- random() * (1 - t / 16384 % 1), .3) * 3
   	* (1 - t / 16384 % 1) * 2)
   	* max(.5, (1 - t / 16384 % 1) ** .33) * 2 	
		* !!(t & 16384)
   ) * 8 + (
		HPF(
			(random() - .5) * 
			(1 - t / 8192 % 1) ** 4 * 8, 
		.1) * 12
	) / 1.5
	)
) ,
	

[Song(1.006), Song(1.004)]