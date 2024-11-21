t %= 2621440,

reverbSet = 0,
reverb = (input, gain, amountComb, valComb, subComb, amountAP, valAP, subAP, reverbVolume, inputVolume) => (
	loop = 0,
	loopHandler = (set, bound, var1, var2, var3) => loop++ < bound ? set(bound, var1, var2, var3) : loop = 0,
	initArray = (range, type, length, sub) => (
		type.push(Array(length - sub * loop).fill(0)),
		loopHandler(initArray, range, type, length, sub)
	),
	t ? 0 : (this.output ??= [], this.inputAP ??= [], this.outputAP ??= [],
	output[reverbSet] = [], inputAP[reverbSet] = [], outputAP[reverbSet] = []) +
	initArray(amountComb, output[reverbSet], valComb, subComb) +
	initArray(amountAP, inputAP[reverbSet], valAP, subAP) +
	initArray(amountAP, outputAP[reverbSet], valAP, subAP),
	outShift = range => (
		output[reverbSet][loop].shift() +
		loopHandler(outShift, range)
	),
	outShift(amountComb),
	outPush = range => (
		output[reverbSet][loop].push(input - gain * output[reverbSet][loop][0]) +
		loopHandler(outPush, range)
	),
	outPush(amountComb),
	combineComb = range => (
		output[reverbSet][loop][output[reverbSet][loop].length - 1] +
		loopHandler(combineComb, range)
	),
	funcAllPass = range => (
		(inputAP[reverbSet][loop].shift(),
		inputAP[reverbSet][loop].push(
			loop ?
			outputAP[reverbSet][loop - 1][outputAP[reverbSet][loop - 1].length - 1] :
			combineComb(amountComb)
		),
		outputAP[reverbSet][loop].shift(),
		outputAP[reverbSet][loop].push(
			-gain * inputAP[reverbSet][loop][inputAP[reverbSet][loop].length - 1] +
			inputAP[reverbSet][loop][0] + gain * outputAP[reverbSet][loop][0]
		)) +
		loopHandler(funcAllPass, range)
	),
	funcAllPass(amountAP),
	inputVolume * input +
	outputAP[reverbSet][amountAP][outputAP[reverbSet++][amountAP].length - 1] / amountComb * reverbVolume
),

chords = '55545556'[t >> 16 & 7],
pitch = divisor => t * PI / divisor * chords,
cut = t < 1572864,

reverb(
	'11011100'[t >> 13 & 7] * tan(PI / 2 ** (2 + (t >> 11 & 3)) * sin(PI * sin(pitch(250)) - pitch(4e4))) /
	8 * (t > 2 ** 19 && t < 2 ** 21),
.95, 7, 8600, 750, 3, 1500, 200, 1, 1) -
reverb(
	(sin(pitch(124) - pitch(89)) + sin(pitch(125) - pitch(100)) + sin(pitch(126) - pitch(105))) /
	12 * (t / 2 ** 16 % 1) * cut,
.95, 3, 9600, 1600, 3, 3900, 250, 1, .5) +
reverb(
	[, , hat = (1 - t / 8192 % 1) * sin(t ** 3) / 12 * (t > 2 ** 20 && cut), , , hat, , hat][t >> 12 & 7] ??
	sinh(PI / 2 * sin(chords ** 4 ** (1 - t / 2048 % 2)) % (PI / 4)) / 6 * cut,
.8, 3, 1500, 320, 1, 900, 270, .5, 1);