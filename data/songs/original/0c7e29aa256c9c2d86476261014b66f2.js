FMPiano = (Freq, Decay) => sin(
		sin(Freq * PI / 256) * Decay + 
		Freq * PI / 128 +
		sin(Freq * PI / 64) * Decay +
		sin(Freq * PI / 129) * 2 * Decay + 
		cbrt(sin(Freq * PI / 256) * 4) / 1.5 * Decay
	) ,
Waveform = (Freq, Decay) => (
	FMPiano(Freq, Decay) / 3 +
	FMPiano(Freq / 2 * 1.001, Decay) / 3 +
	FMPiano(Freq * 1.001, Decay ** .75) / 3
),
FMNote = (Frequence, Decay) => ((
		sin(Frequence * PI / 256 + 
		sin(Frequence * PI / 512) * 2 * Decay)
	) + tan(sin(Frequence * PI / 1024) * (Decay ** .15)) / 2
) / 3,
Parse = Data => t * (
	33.5 * 1e3 / 28e3) * 2 ** 
(parseInt(Data, 36) / 12),
NIRMelody = "7C7F7C7H7C7J7C7M8C8F8C8H8C8J8C8M",
NIRChords = ['FFHJ', 'CCCC', '7878'],
ChordsIndex = (IDX, Decay) => (
		Waveform(Parse(
			NIRChords[IDX]
			[IDX <= 1 ? 3 & t >> 16 : 3 & t >> 18]
		), Decay + .2) / 3
),
Melody = FMNote(
		4 * Parse(NIRMelody[31 & t >> 14]), 
		1 - t / 16384 % 1
) * ((1 - t / 16384 % 1) + .5),
ChordsIndex(0, 1 - t / [131072, 131072, 65536, 65536][3 & t >> 16] % 1) + 
ChordsIndex(1, (1 - t / 32768 % 1) + .3) + 
ChordsIndex(2, 1 - t / 262144 % 1) / 1.5 + 
Melody