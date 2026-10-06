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
Bass = FMBass(Parse('C5C8'[3 & t >> 17], -24), 1 - t / 131072 % 1),
Melody = FMBell(Parse('07BE749G67CJEB9B'[15 & t >> 13]) * 2 / '1325'[3 & t >> 17], 1 - t / 8192 % 1),
Drums = (sin(t ** 3) * (1 - t / 16384 % 1) ** 3.5 * (t >> 14 & 1) + sin(t ** 3) * (1 - t / 4096 % 1) ** 7 / 4 + sin(12 * cbrt(t %16384)) * max(.5, 1 - t / 16384 % 1)) / 2,
(Bass + Melody) / 2 + Drums / 2