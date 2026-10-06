FMPiano = (Freq, Decay, HarmonicBase=256) => sin(
	sin(Freq * PI / HarmonicBase) * Decay + 
	sin(Freq * PI / HarmonicBase * 2)  +
	sin(Freq * PI / HarmonicBase * 4) * Decay +
	sin(Freq * PI / HarmonicBase * 16) * Decay / 2 +
	sin(Freq * PI / 1.001 / HarmonicBase * 2 + .25) * 2 * Decay + 
	cbrt(sin(Freq * PI / HarmonicBase) * 4) / 1.5 * Decay
) * max(.5, Decay), 

FMBell = (Freq, Decay) => (
	Decay = max(.5, Decay),
	cos(sin(sin(Freq * PI / 127) * Decay + Freq * PI / 64
	) + sin(Freq * PI / 8) * Decay * .35 - 2)
) * Decay,

FMBass = (Freq, Decay) => (
	sin(cos(sin(
		Freq * PI / 256)) * 8 * Decay +
		sin(Freq * PI / 128) +
		Freq * PI / 64 + cos(sin(Freq * PI / 32)) * Decay
	) * max(.5, Decay)
),
Parse = (Input, Modifier=0) => t * 2 ** ((parseInt(Input, 36) + Modifier) / 12),
Bass = FMBass(Parse('23'[1 & t >> 18], -12), 1 - t / 262144 % 1),
Melody = FMBell(Parse('25272527252925293537353735393539'[31 & t >> 14]), 1 - t / 16384 % 1),
(Bass + Melody) / 2,
Chord = ['23', '56', '9A', 'EF'].reduce((Accumulator, Section) => Accumulator + (FMPiano(Parse(Section[1 & t >> 18], 12), 1 - t / 262144 % 1)), 0) / 5,
(Chord + Melody + Bass) / 2 +
(sin(t ** 3) * (1 - t / 16384 % 1) ** 3.5 * (t >> 14 & 1) + sin(t ** 3) * (1 - t / 4096 % 1) ** 7 / 4 + sin(12 * cbrt(t %16384)) * max(.5, 1 - t / 16384 % 1)) / 2