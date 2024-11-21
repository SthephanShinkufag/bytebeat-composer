// reverb function can only be used once because i suck at js
reverb = (input, gain, amountComb, valComb, subComb, amountAP, valAP, subAP, reverbVolume, inputVolume) => (
	loop = 0,
	loopHandler = (set, bound, var1, var2, var3) => loop++ < bound ? set(bound, var1, var2, var3) : loop = 0,
	initArray = (range, type, length, sub) => (
		type.push(Array(length - sub * loop).fill(0)),
		loopHandler(initArray, range, type, length, sub)
	),
	t ? 0 : (output = Array(), inputAP = Array(), outputAP = Array()) +
	initArray(amountComb, output, valComb, subComb) +
	initArray(amountAP, inputAP, valAP, subAP) +
	initArray(amountAP, outputAP, valAP, subAP),
	outShift = range => (
		output[loop].shift() +
		loopHandler(outShift, range)
	),
	outShift(amountComb),
	outPush = range => (
		output[loop].push(input - gain * output[loop][0]) +
		loopHandler(outPush, range)
	),
	outPush(amountComb),
	combineComb = range => (
		output[loop][output[loop].length - 1] +
		loopHandler(combineComb, range)
	),
	funcAllPass = range => (
		(inputAP[loop].shift(),
		inputAP[loop].push(loop ? outputAP[loop - 1][outputAP[loop - 1].length - 1] : combineComb(amountComb)),
		outputAP[loop].shift(),
		outputAP[loop].push(-gain * inputAP[loop][inputAP[loop].length - 1] + inputAP[loop][0] + gain * outputAP[loop][0])) +
		loopHandler(funcAllPass, range)
	),
	funcAllPass(amountAP),
	inputVolume * input + outputAP[amountAP][outputAP[amountAP].length - 1] / amountComb * reverbVolume
),
reverb((pitch = divisor => t * PI / divisor * '55545556'[t >> 16 & 7], '11011100'[t >> 13 & 7] * tan(PI / 2 ** (2 + (t >> 11 & 3)) * sin(PI * sin(pitch(250)) - pitch(4e4))) / 8), .95, 7, 8600, 750, 3, 1500, 200, 1, 1) + sin(1e3 / (t % 32768) ** .04) / 4