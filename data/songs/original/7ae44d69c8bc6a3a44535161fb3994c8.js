/*!
 *      •───────────────•°•❀•°•───────────────•
 * PrincessPriscillaPT · Noontide Café in Maretime Bay
 *      •───────────────•°•❀•°•───────────────•
 */

t || (fx = {}), fxi = 0, T = t,

	/* Clipping */
clip = (signal, mode = 0) => mode ? min(1, abs(signal)) * sign(signal) : tanh(signal),

	/* High-pass */
hpf = (signal, id = "hpf") => (
	fx[id] ??= 0,
	signal - (fx[id] += (signal - fx[id]) * .0025)
),

	/* Delay Line */
dlay = (signal, length, feedback) => (
	length = round(length),
	buffer = fx[++fxi] ??= Array(length).fill(0),
	output = signal + buffer[T % length],
	buffer[T % length] = output * feedback,
	output
),

	/* Delta PCM */
presets = {
	default: {rate: 33143.94, steps: 32},
	portable: {rate: 48000, steps: 24},
	retropocket: {rate: 22050, steps: 16},
	nes: {rate: 12604, steps: 32}
},

dpcm = (signal, mix = 1, preset = "default", id = "default") => {

	// Resolve preset
	let config;

	if (typeof preset === "string") {
		config = presets[preset];
	} else {
		config = preset;
	}

	if (!config) {
		throw new ReferenceError(
			`Unknown DPCM preset: ${preset}`
		);
	}

	// Create state
	let state = fx[id];

	if (!state) {
		state = fx[id] = {
			output: 0,
			target: 0,
			frame: -1,
			gate: 0
		};
	}

	// Cache preset values
	const sampleRate = config.rate;
	const stepCount = max(1, trunc(config.steps));
	const stepSize = 1 / stepCount;

	// Clamp mix
	mix = max(0, min(1, mix));

	// Current sample frame
	const frame = (t * sampleRate / sr) | 0;

	// Input gate
	state.gate = abs(signal) > 0 ? 1 : 0;

	// Update once per DPCM sample
	if (frame !== state.frame) {

		state.frame = frame;

		const input = max(-1, min(1, signal));

		if (input > state.target) {
			state.target += stepSize;
		} else {
			state.target -= stepSize;
		}
	}

	// Slew toward target
	state.output += state.target - state.output;

	// Reflect at limits
	if (state.output > 1) {
		state.output = 1 - state.output;
	}

	if (state.output < -1) {
		state.output = -1 - state.output;
	}

	// Wet / dry mix
	return (
		state.output * state.gate * mix +
		signal * (1 - mix)
	);
},

	/* chords */
chrd = (tone = t, note = [0], trnsp = 0, wave = input => input % 2 - 1) => {
   let chr = 0; let poly = 4;

   if (typeof note == "string")
      note = [...note].map(x => parseInt(x, 36));

   for (let idx = 0; idx < min(poly, note.length); idx++)
      chr += wave(tone * 2 ** ((note[idx] + trnsp) / 12));

   return poly ? chr / poly : 0;
},

	/* Track Settings */
bpm = 140,
sr = 48e3,
spb = (60 / bpm) * sr,
sec = t / sr,
ts = sec * (bpm / 60) * 16384,
swg = 1, ts -= (ts / 4 & 2048) * swg, /* SWANG */
tt = sec * 440 * 256 * 2 ** (-6 / 12) / 2,
gain = (dB = 0) => 10 ** (dB / 20),

	/* Sequencers */
not = (string = "", index) => 2 ** (parseInt(string[index], 36) / 12),
seq = (string = "", index) => parseInt(string[index], 36),
rhm = max(((0xb1b6edbb >> (ts >> 12 & 30) & 3) - ts / 8192 % 1) / 4, 0),
rhb = max(((0xbefbdbdb >> (ts >> 12 & 30) & 3) - ts / 8192 % 1) / 4, 0),
snc = ((ts >> 13 & 15) > 6) + (ts >> 16 | 1) - 1,
grc = (string, index, speed) => 2 ** (parseInt(string[index] - string[index] *!! speed, 36) / 12),

	/* Melodics */
mel = tt * not("      9 ggeec eeee  ggee  7 bbc ee  ggee  cc  bb  ccbb99  7 99b cc  5 55  55  cc  bb7 77  55  55  443 4444444444    44445555777 99  9 99  99  gg  eec ee  7 bbc ee  jjee  ccb bb  ccbb99  bbc gg  hhggeeeeeeee            ccb cccccccccccccccccc", ts >> 12 & 255) / grc("00002000002000002000000200000000100000010000000000000000000000002000000200000000200000020000000200000000000000010000000000000", ts >> 13 & 127, ts >> 11 & 3),
bas = tt * not("554927cc55492500", snc & 15) * not("00    7 77    0 00    7 77  00", ts >> 12 & 31),
chrN = [
	"59cg", "58ce", "47be", "479c",
	"259c", "257b", "047b", "047a",
	"59cg", "58ce", "47be", "479d",
	"259c", "058c", "047b", "047b"
][((ts >> 17 & 7) > 6 ? 14 : snc & 15)],
arp = tt * not(chrN, ts >> 10 & 3),

	/* Waveforms */
/* 2A03 */
pul = (phase, id = "pul", width = 25.0) => hpf((phase / 256 % 1 < width / 100 ? 1 : -1) - (width / 50 - 1), id) / 2 || 0,
tri = (phase, id = "tri") => hpf(asin(sin((phase | 7) * PI / 128)) / PI, id) || 0,
noi = (level, id = "noi") => (
	hpf(sign(T % 2 ** (6 - (level % 7)) ? fx[++fxi] : fx[++fxi] = random() - random()) / 2, id) || 0
),
dmc = (signal, id = "dpcm") => hpf(dpcm(signal, 1, "default", id), id + " "),
/* VRC6 */
saw = (phase, id = "saw") => hpf(round((phase / 128 % 2 - 1 || 0) * 3.5) / 4, id),
/* OPLL */
fmw = (phase1, phase2, level) => sin((phase1 | 7) * PI / 128 + sin((phase2 | 7) * PI / 128) * level),

	/* Drums */
kik = tanh(sin(sqrt(ts % 8192)) * .9995 ** (ts % 8192)) * (1 - min(1, ts / 8192 % 1) ** 4) / 1.35,
rim = sin(t / 13 * 2 + sin(t / 5 * 2)) * .998 ** (ts % 8192) * 4,
drm = kik * seq("1001100100001000", ts >> 13 & 15) *!! (ts >> 19) + rim * seq("0010010010010010", ts >> 13 & 15),

	/* Channels */
/* 2A03 */
ch1 = lr => dlay((pul(mel, "pul", 12.5)) / 2.8 *!! (ts >> 20), spb * 3 / 4 * (lr ? .995 : 1.005), .45),
ch2 = lr => pul(arp * (lr ? 1.005 : .995), "pul2") * rhm / 2.85 *!! (ts >> 20),
ch3 = tri(bas / 4) * rhb ** 2 * 2,
ch4 = () => noi(seq("1535535535535535", ts >> 13 & 15)) * (1 - ts / 4096 % 1) *! (ts >> 12 & 1) / 4,
ch5 = dmc(drm, "dpcm"),
/* VRC6 */
ch6 = lr => dlay((pul(mel * 2 * (lr ? .997 : 1.003), "pul", 25)) / 6 *!! (ts >> 20), spb / 2, .2),
ch7 = lr => saw(bas / 2 * (lr ? .995 : 1.005)) * rhb ** 2 / 1.55,
/* OPLL */
ch8 = lr => chrd(tt, chrN, 0, inp => fmw(inp, inp * 3 * (lr ? .997 : 1.003), rhm ** 2 + .5) * (rhm ** 1.55 + .01)),

	/* Output */
out = lr => round(clip((ch1(lr) + ch2(lr) + ch3 + ch4(lr) + ch5 + ch6(lr) + ch7(lr) + ch8(lr)) * gain(-.65), 0) * 48) / 48 + (random() - .5) / 1e3,

[out(0), out(1)]