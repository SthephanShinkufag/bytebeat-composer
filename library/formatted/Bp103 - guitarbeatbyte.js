// Coded by Bp103
sr = 44100,
q = t / sr,
// Workaround to make arrays work
t < 1 ? (notetbl = [], notetbl[48] = 440, ramp = [], ramp[0] = 0, hat = [], noise = []) : 0,

noteTable = function() {
	hat[0] = 256;
	for(i = 1; i < hat[0]; i++) {
		hat[i] = sin(i & 4) ^ (random() * 255);
	}
	notetbl[48] = 440;
	for(i = 49; i < 96; i++) {
		notetbl[i] = notetbl[i - 1] * pow(2, 1.0 / 12);
	}
	for(i = 47; i > 0; i--) {
		notetbl[i] = notetbl[i + 1] / pow(2, 1.0 / 12);
	}
	notetbl[0] = 0;
},

sampler = (sample, place, pitch, vol) =>
	(sample[int((place * (pitch * (sample[0] - 1))) % ((sample[0] - 1) + 1))] / 255) * vol,

main = function() {
	if(t < 1) {
		noteTable();
	}
	keyChange = (q / 2) % 16 > 8 ? 3 : 0;

	if(((q * 4) % 1) == 0) {
		rndnl = int(random() * 10);
	}
	if(((q * 8) % 1) == 0) {
		rndnr = int(random() * 10);
	}
	if((((q * 4) % 8) == 0) || (((q * 4) % 15) == 0)) {
		ramp[0] = 8;
	}
	ramp[0] -= 3 / sr;
	if(((q * 32) % 8) == 0) {
		ramp[1] = 13;
	}
	ramp[1] -= 30 / sr;
	if(((q * 16) % 8) == 0) {
		ramp[2] = 13;
	}
	ramp[2] -= 15 / sr;
	if(((q * 16) % 8) == 0) {
		ramp[3] = 64;
	}
	ramp[3] -= 640 / sr;
	if(((q * 32) % 8) == 0) {
		ramp[4] = 13;
	}
	ramp[4] -= 200 / sr;
	for(i = 0; i < 20; i++) {
		if(ramp[i] <= 0) {
			ramp[i] = 0;
		}
	}

	// F sharp minor scale
	scale = [45, 47, 48, 50, 52, 53, 55, 57];

	ch = sin(q * (notetbl[scale[((int(q / 2) % 8) < 4) * 2] + keyChange] * 4)) * ramp[0];
	ch -= sin(q * (notetbl[scale[((int(q * 2) % 8) < 4) + 4] + keyChange] * 4)) * ramp[0];
	ch &= sin(q * (notetbl[scale[((int(q * 1) % 8) < 4) + 6] + keyChange] * 4)) * ramp[0];
	ch *= (sin(q * 32) * .4) + .8;
	ch += sin(q * 440) * ramp[3];

	samples = sampler(hat, q, 110, ramp[4]);

	l = (sin(q * (notetbl[scale[rndnl] + keyChange] / 2) * 8) < 0.1) * ramp[1];
	r = (sin(q * (notetbl[scale[rndnr] + keyChange] / 2) * 8) < 0.8) * ramp[2];
	return [samples + l + ch + 127, samples + r + ch + 127];
},
main();
