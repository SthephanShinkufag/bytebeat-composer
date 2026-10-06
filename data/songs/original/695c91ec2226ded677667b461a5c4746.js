t ? 0 : Buffer = [],
CallCount = 0,
LowPassFilter = function(Input, Frequency) {
	Call = CallCount++;
	Buffer[Call] ??= 0;
	Buffer[Call] += (Input - Buffer[Call]) * Frequency;
	return Buffer[Call]
},
HighPassFilter = function(Input, Frequency) {
	return Input - LowPassFilter(Input, Frequency)
},
Sawtooth = (Input, Amplitude) => atan(tan(Input * PI / 256)) / (PI / 2) * Amplitude + 128,
Square = (Input, Amplitude, PulseWidth) => (((Input % 256 / 2 + PulseWidth & 128) % 256 + (Amplitude / 2)) % 256 / 128 - 1) * Amplitude,
Parse = (Input, Transpose=0) => t * 2 ** ((parseInt(Input, 36) + Transpose) / 12),
Reverb = (Input, Level, Key=3E3, Divisor=2) => {
	Out = Input(t);
	for (i = 1; i <= Level; i++) {
		Out += Input(t - (Key * i)) / (i + Divisor)
	};
	return Out
},
BassSequence = '23',
MelodySequence = '25272527252925293537353735393539',
Song = j => (
	Melody = t => t > 0 && (
		Dissonant = Detune => Square(
			Detune * Parse(MelodySequence[t >> 13 & 31], 12), 
			128, (t >> 7 & 127)
		) * (1 - t / 8192 % 1) ,
		DissonantENV = 1 - t / 8192 % 1,
		(Dissonant(1) + Dissonant(j) * DissonantENV) / 2
	),
	Bass = t => (
		Fifth = Transpose => Sawtooth(j * Parse(BassSequence[t >> 17 & 1], -12 + Transpose), 48),
		((Fifth(0) + Fifth(7)) / 2 % 256 - 128) * 2
	),
	Kick = (3 * sin(5 * j * cbrt(t % 8192)) - .33) * (1 - t / 8192 % 1) ** 2 * 64,
	Snare = (
		4 * sin(14 * cbrt(t % 8192) 
		+ LowPassFilter(random() * 1.1 * (1 - t / 8192 % 1)
		- random() * (1 - t / 8192 % 1), .3) * 3 
		* (1 - t / 8192 % 1) * 2) 
		* max(.5, (1 - t / 8192 % 1) ** .33) * 2
	) * 32,
	Hihat = HighPassFilter(
		(random() - .5) * (1 - t / 4096 % 1)
		** 3.5 * 8, .1
	) * 16,
	Drums = ([Kick, Kick, Snare, Kick, Kick, Snare, Kick, Snare][7 & t >> 13] + Hihat) / 2,
	min(max(
		Bass(t) * 2
	 	+
		Reverb(Melody, 8) * 2
		+
		Drums * 1.4
	,-128), 127)
),
[Song(1.005), Song(.995)]