f0 = (t & t >> 9 & 1023 && 12) ^ 0x13e * ~!t >> '243'[(t >> 4) % 3],
f1 = x => x ^ x * 2 ^ x * 3,
f2 = x => x ^ x * 1.5 | x >> '0102'[t / 10.875 & 3],
f3 = x => x * 1.5 ** '@$$@#!!#'.charCodeAt(x & '13984522'[t >> 11 & 7]),
e = t * 1.125 ** '13248765132487651324867513248657'[t >> 18 & 31] / 24,
SFX1 = (
	t * '4536'[t >> 16 & 3] * ((-t >> 11 & 7) + 1) / 204.25 % 20 +
	t * '7289'[t >> 17 & 3] * ((-t >> 12 & 7) + 1) / 132.25 % 12
) * 1.25,
SFX2 = ((t * ((t * 1.25 & 1) + 1) * 6.75 | t >> 6 ^ t >> 8) & 224) / 15.375,
SFX3 = ((
	(t / (PI * '3436'[t >> 16 & 3] * 1.625) % 9 | t >> 10) &
	(t / (PI * '3436'[t >> 16 & 3] * 1.625) % 14 | t >> 13)
) * 2 & 63) * 1.125,
Drum1 = (t * 2.375 >> t / 256 & 32) * '1000'[t >> 13 & 3] / 1.25,
Drum2 = (
	sin(sqrt(t & 32767) * 4.625 >> 0) * ((-t >> 11 & 15) + 1) +
	cos(sqrt(t & 32767) * 2.75 >> 0) * ((-t >> 11 & 15) + 1) + 32
) * (-t >> 15 & 1) / 1.125,
Drum3 = (
	sin((t * 1.5 >> 2) * (t * 1.5 >> 2) * 1.01) * ((-t >> 8 & 15) + 1) +
	cos((t * 1.75 >> 3) * (t * 1.75 >> 3) / 1.01) * ((-t >> 8 & 15) + 1) + 32
) * (t >> 13 & 1 ? 1 : -t >> 12 & 1) / 2.125,
Synth1 = ((t * '14232534'[t >> 13 & 7] / 2.375 | t >> 11 ^ t >> 12) & 28) / 2.75,
Synth2 =
	abs(t * 1.25 ** '43526768'[t >> 16 & 7] % 256 - 128) / 11.375 +
	abs(t * 1.25 ** ('43526768'[t >> 16 & 7] * 1.01) % 256 - 128) / 11.375,
Synth3 = (t * 1.125 ** '1212131314141515'[t >> 15 & 15] * ((t >> 13 & 1) + 1) / 18 & 15) / 1.25,
u = t * 1.0625 ** '1324132434352136'[t >> 17 & 15] * 1.25,
Xylo = (
	int(sin(u / 5) * ((-t >> 11 & 3) + 1)) +
	int(cos(u / 3) * ((-t >> 11 & 3) + 1)) +
	int(sin(u / 1.375) * ((-t >> 11 & 3) + 1)) +
	int(cos(u / 7.5) * ((-t >> 11 & 3) + 1)) + 16
) * (t >> 16 & 1 ? 1 : -t >> 13 & 1) / 1.125,
Binary = t * '1001110101001010'[t >> [12, 13][t >> 16 & 1] & 15] / 0xe4,
Noise = ((
	f1(Binary * f2(Binary >> 5 | f3(Binary >> 6 | Binary >> 2))) +
	f1(Binary / Math.E * f2(Binary >> 7 | f3(Binary * 1.5 >> 8 | Binary / 1.125 >> 6)))
) & 255) / 41.875,
y = x => (gr = 1.61803399, nbn = random() * x,
nbn / 2 + nbn / 3 | x * gr ^ x * gr * 2 ^ x * gr * 3),
DrumNBN = (((y(t >> 7) & 12) + (y(t >> 3) & 6) + (y(t / 1.625) & 8) | t >> 9 | t >> 10) & 31) / 2.5,

(e & e * 1.01 & 32) + ((e * 3 & e * 3.005 & 8) + [
	[
		[
			[[0, SFX1][t >> 20 & 1], SFX1 + SFX2][t >> 21 & 1],
			[SFX2, SFX2 + SFX3, SFX3, SFX3][t >> 20 & 3]
		][t >> 22 & 1],
		[
			SFX1 + SFX2 + SFX3,
			SFX1 + SFX3,
			SFX1 + SFX2 + SFX3,
			SFX2 + SFX3,
			SFX1 + SFX2 + SFX3,
			SFX1 + SFX2 + SFX3,
			SFX1 + SFX2 + SFX3,
			SFX1 + SFX2 + SFX3
		][t >> 20 & 7]
	][t >> 23 & 1],
	SFX1 + SFX2 + SFX3
][t >> 24 & 1] / 1.125 + [
	[
		0,
		Drum1 + Drum2,
		Drum1 + Drum2,
		Drum1,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum3,
		Drum1 + Drum3
	][t >> 21 & 7],
	Drum1 + Drum2 + Drum3,
	Drum1 + Drum2 + Drum3,
	Drum1 + Drum2 + Drum3,
	Drum1 + Drum2 + Drum3,
	Drum1 + Drum2 + Drum3,
	Drum1 + Drum2 + Drum3,
	[
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1 + Drum2 + Drum3,
		Drum1
	][t >> 21 & 7]
][t >> 24 & 7] * 1.125 + [
	[
		[0, [Synth1, Synth1 + Synth2][t >> 21 & 1]][t >> 22 & 1],
		Synth1 + Synth3
	][t >> 23 & 1],
	[Synth3, Synth1 + Synth2 + Synth3][t >> 23 & 1],
	Synth1 + Synth2 + Synth3,
	Synth1 + Synth2 + Synth3,
	Synth1 + Synth2 + Synth3,
	Synth1 + Synth2 + Synth3,
	Synth1 + Synth2 + Synth3,
	Synth1 + Synth2 + Synth3,
	[
		Synth1 + Synth2 + Synth3,
		Synth1 + Synth2 + Synth3,
		Synth1 + Synth2 + Synth3,
		Synth1 + Synth2 + Synth3,
		Synth1 + Synth2 + Synth3,
		Synth1 + Synth2 + Synth3,
		Synth1 + Synth2 + Synth3,
		Synth1
	][t >> 21 & 7]
][t >> 24 & 7] * 1.25 + [
	[
		[
			[
				Noise / 4 + Noise / 5 + DrumNBN,
				0,
				0,
				0,
				Noise + DrumNBN * 1.375,
				0,
				Noise + DrumNBN * 1.375,
				0
			][t >> 19 & 7],
			[0, Xylo + Noise + DrumNBN * 1.375][t >> 21 & 1]
		][t >> 22 & 1],
		Xylo + Noise
	][t >> 23 & 1],
	Xylo + Noise + DrumNBN * 1.375,
	Xylo + Noise + DrumNBN * 1.375,
	Xylo + Noise + DrumNBN * 1.375,
	Xylo + Noise + DrumNBN * 1.375,
	Xylo + Noise + DrumNBN * 1.375,
	Xylo + Noise + DrumNBN * 1.375,
	[
		Xylo + Noise + DrumNBN * 1.375,
		Xylo + Noise + DrumNBN * 1.375,
		Xylo + Noise + DrumNBN * 1.375,
		Xylo + Noise + DrumNBN * 1.375,
		Xylo + Noise + DrumNBN * 1.375,
		Xylo + Noise + DrumNBN * 1.375,
		Xylo + Noise + DrumNBN * 1.375,
		Xylo
	][t >> 21 & 7]
][t >> 24 & 7]) / 1.14477;
