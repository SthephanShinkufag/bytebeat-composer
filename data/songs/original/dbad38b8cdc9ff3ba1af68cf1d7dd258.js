const bassline = [1, 4];
const supersawline = [[1, 8], [4, 11]];
const key = 2;

//LPF (4-pole)
LPF = function(s = 48e3) {
   this.fs = s;
   this.cutoff = 1e3;
   this.resonance = 1;
   this.g = 0;
   this.stage = Array(8).fill(0);
   this.updateCoeffs = function() {
      this.g = 2 * sin((PI * this.cutoff) / this.fs);
   }

   this.setSampleRate = function(sr) {
      this.fs = sr;
      this.updateCoeffs();
   }

   this.setCutoff = function(freq) {
      this.cutoff = freq;
      if (this.cutoff < 20) this.cutoff = 20;
      if (this.cutoff > this.fs * .45) this.cutoff = this.fs * .45;
      this.updateCoeffs();
   }

   this.setResonance = function(res) {
      this.resonance = res;
      if (this.resonance < 0) this.resonance = 0;
      if (this.resonance > 4) this.resonance = 4;
   }

   this.process = function(input) {
      let x = input - this.resonance * this.stage[3];

      for (let i = 0; i < 4; ++i) {
         this.stage[i] += this.g * (tanh(x) - tanh(this.stage[i]));
         x = this.stage[i];
      }

      return this.stage[3];
   }

   this.updateCoeffs()
}

Decay = function(sr = 48000, at = 0.1, rt = 0.1, freq = 1.0, mode = "inout", smooth = 0.001) {
   this.phase = 0;
   this.sampleRate = sr;
   this.rate = freq / this.sampleRate;
   this.attack = at;
   this.release = rt;
   this.mode = mode; // "inout", "in", "out"

   // smoothing state
   this.smooth = 0;
   this.alpha = smooth; // tweak: 0.001 → very smooth, 0.05 → snappier

   this.setFreq = function(freq) {
      this.rate = freq / this.sampleRate;
   }

   this.setTimes = function(at, rt) {
      this.attack = at;
      this.release = rt;
   }

   this.setMode = function(mode) {
      this.mode = mode;
   }

   this.setSmooth = function(alpha) {
      this.alpha = alpha;
   }

   this.rawEnvelope = function() {
      this.phase += this.rate;
      if (this.phase >= 1) this.phase -= 1;

      if (this.mode === "inout") {
         if (this.phase < 0.5) {
            let t = this.phase / 0.5;
            let raw = 1.0 - exp(-t / this.attack);
            let max = 1.0 - exp(-1.0 / this.attack);
            return raw / max;
         } else {
            let t = (this.phase - 0.5) / 0.5;
            let raw = exp(-t / this.release);
            let min = exp(-1.0 / this.release);
            return (raw - min) / (1.0 - min);
         }
      } else if (this.mode === "in") {
         let t = this.phase;
         let raw = 1.0 - exp(-t / this.attack);
         let max = 1.0 - exp(-1.0 / this.attack);
         return raw / max; // 0→1 then reset to 0
      } else if (this.mode === "out") {
         let t = this.phase;
         let raw = exp(-t / this.release);
         let min = exp(-1.0 / this.release);
         return (raw - min) / (1.0 - min); // 1→0 then reset to 1
      }
   }

   this.process = function() {
      let raw = this.rawEnvelope();
      // smooth discontinuities
      this.smooth = this.alpha * raw + (1 - this.alpha) * this.smooth;
      return this.smooth;
   }
}

return function(t, samplerate) {
	BPM = 150;
	time = t * BPM / 120;
   if (time == 0) {
      filter = new LPF(samplerate);
		supersaw = new LPF(samplerate);
		clap = new LPF(samplerate);
		clap.setCutoff(6e3);
		clap.setResonance(.1);
   }
	supersaw_out = 0;

   filter.setCutoff(500 + abs(cos(time / 8)) * 1e3);
   filter.setResonance(abs(sin(time / 4)) * 4);

	supersaw.setCutoff(1 + abs(sin(time * 4 * PI)) * 5e3);
	supersaw.setResonance(.6);

	for (const y in supersawline[m = 1 & time >> 3]) {
		for (let x = 2; x < 5; x += 2) {
			supersaw_out += (t / 8 * 110 * pow(2, x) * pow(2, (supersawline[m][y] + key + x / 20) / 12) % 1 - .5) / 1.5 * (g = 0 < (3 & time * 4)) / 2
		}
	}
	const r = tan(random() * (1 / pow(exp((time+1)%2), 30) * 4 % 1) * 4)

   return (filter.process(-t * 220 * pow(2, (bassline[m] + key) / 12) / 2 % 2 + 1) / 1.5 + supersaw.process(supersaw_out * 1.2) + sin(350 * sqrt(time % 1)) / 4 + clap.process(r) + (random()-.5) / pow(exp(4 * time % 1), 12) * g) / 1.4
}