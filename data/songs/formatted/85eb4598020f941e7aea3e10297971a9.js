SampleRate = 22000,
delay = SampleRate * 4,
debug = 1,
t == 0 ? (notetbl = [], retrig = [], oldOutput = [], oldIndex = [], debugr = [], console = 0) : 0,


// byteCrusher by Bp103.
init = function() {
	// Generate note frequency lookup table.
	for(i = 0; i < 96; i++) {
		notetbl[i] = 440 * pow(pow(2, 1.0 / 12), i - 48);
	}
	notetbl[0] = 0;
	// Fill delay buffer with 0.
	for(i = 0; i < delay; i++) {
		oldOutput[i] = 0;
	}
},

ADSR = function(a, d, s, r, tr) {
	qq = tr / SampleRate; // It needs its own independent counter
	// Calculate ADSR envelope
	if(qq < a) {
		iadsr = qq / a;
	} else if(qq < a + d) {
		iadsr = 1 - (qq - a) / d * (1 - s);
	} else if(qq < a + d + r) {
		iadsr = s;
	} else {
		iadsr = s * (1 - (qq - a - d - r) / r);
	}
	return iadsr > 0 ? iadsr : 0; // ADSR runaway check
},

fmSynth = function(fmFreq, opA_mul, opB_mul, opA_vol, opB_vol, vol) {
	// opA modulates opB, opB is the output.
	opA = sin(q * (fmFreq * opA_mul)) * opA_vol;
	opB = sin(q * ((fmFreq * opB_mul)) + opA) * opB_vol;
	return opB * vol;
},

main = function(t) {
	t %= SampleRate / (22 / 141); // Song approximate loop point (lags to death otherwise)
	if(t == 0) {
		init();
	}
	q = t / SampleRate;

	channels = 10;
	arrayLen = [10 * 4, 8 * 4, 8 * 4, 8, 16, 8 * 4, 4, 36, 8 * 4, 16 * 2];
	// Format duration,note... A4 is 48, 0 is note cut and rest. 268
	notes = [
		[16, 48, 16, 0, 16, 48, 8, 48 + 12, 8, 0, 16, 48, 16, 0, 16, 48, 8, 48 + 24, 8, 0, 16, 48, 16, 0, 16,
			48, 8, 48 + 12, 8, 0, 16, 48 + 3, 16, 0, 16, 48 + 3, 8, 48 + 12 + 3, 8, 0],
		[16, 48 + 5, 16, 0, 16, 48 + 3, 16, 48 + 2, 16, 48 + 5, 16, 0, 16, 48 + 3, 16, 48 + 2, 16, 48 + 5, 16,
			0, 16, 48 + 3, 16, 48 + 2, 16, 48 + 5 + 3, 16, 0, 16, 48 + 3 + 3, 16, 48 + 2 + 3],
		[16, 48 + 8, 16, 0, 16, 48 + 8, 16, 48 + 7, 16, 48 + 8, 16, 0, 16, 48 + 8, 16, 48 + 7, 16, 48 + 8, 16,
			0, 16, 48 + 8, 16, 48 + 7, 16, 48 + 8 + 3, 16, 0, 16, 48 + 8 + 3, 16, 48 + 7 + 3],
		[4, 48 - 12, 4, 0, 4, 48, 4, 0],
		[8, 1, 8, 1, 8, 0, 8, 1, 8, 0, 8, 1, 8, 0, 8, 0], // Kick 5
		[8, 0, 8, 48, 8, 0, 8, 48 - 12, 8, 0, 8, 48, 8, 0, 8, 48 - 12,
			8, 0, 8, 48, 8, 0, 8, 48 - 12, 8, 0, 8, 48 + 3, 8, 0, 8, 48 - 12 + 3],
		[2, 48, 2, 0], // Hat 7
		[16, 0, 16, 48, 16, 0, 16, 48, 16, 0, 16, 48, 16, 0, 16, 48, 16, 0, 16, 48, 16, 0, 16, 48, 16, 0, 16,
			48, 16, 0, 8, 48, 4, 0, 4, 48], // Snare 8
		[24, 48, 8, 0, 24, 48, 8, 0, 24, 48, 8, 0, 24, 35, 8, 0, 24, 48, 8, 0, 24, 48, 8, 0, 24, 48, 8, 0, 24,
			40, 8, 0],
		[8, 53 - 12, 8, 0, 8, 51 - 12, 8, 0, 8, 48 - 12, 8, 48 - 12, 8, 46 - 12, 8, 43 - 12, 8, 48 - 12, 8, 0,
			8, 51 - 12, 8, 0, 8, 48 - 12, 8, 48 - 12, 8, 46 - 12, 8, 43 - 12]
	];
	// synthType: 0 normal, 1 kick, 2 noisy
	synthType = [0, 0, 0, 0, 1, 1, 0, 2, 0, 0];
	// fxType: 0 none, 1 blowout distortion, 2 fold distortion
	fxType = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2];
	// fm: opA multiplier, opA multiplier, opA vol, opB vol, Special Drum, fx var
	fm = [
		[1.0, 2.0, 2.0, 1.0],
		[2.0, 2.0, 1.0, 1.0],
		[3.0, 1.0, 0.5, 1.0],
		[1.0, 2.0, 2.0, 1.0],
		[0.1, 1, 0, 1, 6],
		[-3, 1, .5, 1, 6],
		[8, 2, 60, 1],
		[3, 0, -0.85, 2, -1.02],
		[8, 0.5, 2, 1.],
		[1, 1, .4, 1, .2]
	];
	adsrp = [
		[0.5, 0.8, 0.1, 0.4],
		[0.6, 0.8, 0.1, 0.4],
		[0.7, 0.8, 0.1, 0.4],
		[0.05, 0.7, 0.4, 0.5],
		[0.01, 0.2, 0.01, 0.2],
		[0.01, 0.2, 0.05, 0.5],
		[0.01, 0.01, 0.05, 0.05],
		[0.01, 0.2, 0, 0.05],
		[0.5, 0.2, 0.2, 0.4],
		[0.01, 0.25, 0.01, 0.02]
	];
	trim = [33, 64, 32, 0, 0, 0, 0, 0, 0, 0];
	vol = [.2, .2, .2, .2, .5, .02, .1, .2, .05, .6];
	tone = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
	// Debug F12 console (if supported)
	if((t % int(SampleRate / 8)) == 0 && console != 0 && debug == 1) {
		console.clear();
		console.log(t);
		console.log(debugr.join('  | '));
		for(let i = 0; i < notes.length; i += 2) {
			console.log(' array:' + i + ' = ' + notes[i].length +
				(!notes[i + 1] ? '    |' : '    |  array:' + (i + 1) + ' = ' + notes[i + 1].length));
		}
		console.log('notetbl:' + notetbl.length + '    | retrig:' + retrig.length + '    | oldOutput:' +
			oldOutput.length + '    | oldIndex:' + oldIndex.length);
	}
	out = [];

	// Sequence and Synth playing code.
	for(let i = 0; i < channels; i++) {
		durationSum = 0;
		noteIndex = 0;
		out[i] = 0;
		speed = 40;
		// debugr[i] = 'channel(' + i + ')=' + (durationSum + notes[i][noteIndex] * SampleRate / speed);
		while(durationSum + notes[i][noteIndex] * SampleRate / speed <= t) {
			durationSum += notes[i][noteIndex] * SampleRate / speed;
			noteIndex += 2;
			noteIndex %= arrayLen[i];
		}
		debugr[i] = 'channel(' + i + ')=' +
			String(int((durationSum + notes[i][noteIndex] * SampleRate / speed) - t)).padStart(6, ' ');
		// This sets up the counter for adsr on noteIndex changes.
		if(noteIndex != oldIndex[i]) {
			retrig[i] = 0;
			oldIndex[i] = noteIndex;
		} else {
			retrig[i]++;
		}
		// Apply the ADSR envelope to the synth.
		tremolo = 0.8 + sin(q * trim[i]) * 0.3;
		vadsr = ADSR(adsrp[i][0], adsrp[i][1], adsrp[i][2], adsrp[i][3], retrig[i]);

		switch(synthType[i]) {
		case 0: // FM synth
			out[i] = fmSynth(notetbl[notes[i][noteIndex + 1]] * tone[i], fm[i][0], fm[i][1], fm[i][2],
				fm[i][3], (vol[i] * tremolo) * vadsr);
			break;
		case 1: // Drum Type 1
			out[i] = fmSynth(notetbl[notes[i][noteIndex + 1]] << (vadsr * fm[i][4]), fm[i][0], fm[i][1],
				fm[i][2], fm[i][3], vol[i] * vadsr);
			break;
		case 2: // Drum Type 2
			out[i] = fmSynth(notetbl[notes[i][noteIndex + 1]], fm[i][0], fm[i][1],
				fm[i][2] > (vadsr * fm[i][4]) ? 2 : 970, fm[i][3], vol[i] * vadsr);
			break;
		default: out[i] = 0; // Nothing!
		}
		switch(fxType[i]) {
		case 1: out[i] = ((out[i] > fm[i][4]) * (vol[i] / 4)) - (vol[i] / 4); break;
		case 2: out[i] = (out[i] % fm[i][4]) * ((vol[i] + fm[i][4])); break;
		default:
		}
	}

	output = 0;
	for(let i = 0; i < channels; i++) {
		output += out[i]; // Very basic mixer
	}

	bypass = output;
	// Memory based delay effect.
	oldOutput[abs(t % delay)] = output / 4;
	for(let i = 1; i < 2; i++) {
		output += oldOutput[abs((((delay / (i * 2)) % delay) - t) % delay)] / (i * 2);
	}
	if(!output) {
		output = bypass; // Just a failsafe to keep it from outputting Null values.
	}

	return [output - (out[0] * .7), output - (out[2] * .7)];
},
main(t);
