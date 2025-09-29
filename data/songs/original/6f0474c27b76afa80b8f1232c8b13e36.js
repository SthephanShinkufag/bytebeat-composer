// Time measurements
sampleRate = 48000,
bpm = 100.5,
bps = bpm / 60,
T = 4 * t * bps / sampleRate,
b = T / 64 % 30 /* Song length */,
m = b > 14,
p = PI * b,
// Notes
notesBass = 'CHFA'[2 * b & 3],
notesMain = ['057A57AC', '5ACHCHJO', '8CHKHKOT', '5AEHEHMQ'][2 * b & 3],
// Generators
gen = (char, octave, vibr) => 110 /* A2 note in Hz */ * 48E3 / bps *
	(T + 1E-4 * vibr * sin(5 * T)) * 2 ** (octave + (parseInt(char, 36) + 2) / 12),
sqr = (note, octave, vibr) => 128 * ((gen(note, octave - 1, vibr) >> 8 & 255) > 128),
tri = (note, octave, vibr) => (x = gen(note, octave, vibr) >> 8, (x ^ -(x >> 8 & 1)) & 240),
// Effects
rise = (start, len, vol = 1) => b < start ? 0 : b < start + len ? (b - start) / len : vol,
fade = (start, len) => b < start ? 1 : b < start + len ? 1 - (b - start) / len : 0,
drop = (freq, fall = 1) => 1 - T / freq % 1 * fall,
pan = (ch, freq, pan, vol) => vol * (abs((T / freq + 4 * ch) % 8 / 4 - 1) - pan) + 1,
// Delay function
dLen = [x = 10922 * sampleRate / 48E3 | 0, 2 * x],
t ? 0 : dArr = [Array(dLen[0]), Array(dLen[1])],
delay = (i, fading, input) => (
	output = (dArr[i][t % dLen[i]] | 0) + input,
	dArr[i][t % dLen[i]] = output * fading,
	output),
// Instruments
arpeggio = ch => delay(0, 1 / (2 + cos(2 * p) / 2), rise(0, 2, fade(23, 3)) / 7 * (
	sqr(notesMain[T & 7], 1, ch ? -10 : 15) * (1 - cos(p / 4)) * drop(1, .7) +
	tri(notesMain[T & 7], 1, ch ? 15 : 10) * (1 + cos(p / 4)))),
synth = ch => delay(1, .7, rise(2, 3) / 9 * (
	sqr(notesMain[T / 8 & 3], +m, ch ? 35 : 20) * (1 + sin(p / 8)) +
	tri(notesMain[T / 2 & 7], 0, ch ? 20 : 25) * (1 - sin(p / 8)))),
bass = ch => (m ? rise(13, 3, fade(25, 4)) : rise(1, 2, fade(12, 3))) *
	sqr(notesBass, -3, ch ? 25 : -15) * ((T / 2 & 1) + (x = b > 16 ? 1 : .4)) / (1 + x) / 5,
noise = (m ? rise(14, 4, fade(24, 4)) * (T & 3) * drop(1) / 2 : rise(4, 2) * drop(8, .6) * drop(2)) *
	25 * (1E6 * sin(2300 * T | T / (m ? 8 : 4) & 7) & 1),
kick = ch => b > 8 & !m | b > 18 & b < 26 && 30 * sin(190 * (2 * (T + (2 * ch - 1) / 200) % 2 ** (
	b > 18 ? 3 - 2 * !(~T >> 1 & 7) - !(~T >> 1 & 15) :
	4 - (T / 2 & 7 ^ 1) % 3 - (b < 13 && 3 * !(~T >> 2 & 7))
)) ** .3),
// Low Pass and High Pass filters
t ? 0 : (lpArr = [x = [0, 0, 0, 0], [...x]], hpArr = [[...x], [...x]]),
lpFilter = (arr, cutoff, input, count = 0) => (
	arr[count] += cutoff * ((count ? arr[count - 1] : input) - arr[count]),
	++count > 3 ? arr[3] : lpFilter(arr, cutoff, input, count)),
hpFilter = (arr, cutoff, input) => input - lpFilter(arr, cutoff, input),
// Output
out = ch => hpFilter(hpArr[ch], 5E-3 /* HP cutoff to center the waveform */,
	lpFilter(lpArr[ch], (3 - cos(p)) * (1 + 9 * rise(0, 8, fade(28, 2))) / 40 /* LP cutoff */,
		arpeggio(ch) + synth(ch) +
		bass(ch) * pan(ch, 4, .2, rise(0, 16)) +
		noise * pan(ch, 2, .8, 1) + kick(ch))) / 128,
[out(0), out(1)];
