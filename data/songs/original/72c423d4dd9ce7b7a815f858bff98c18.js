const ef = [-7, -3, -2, 0];
const ev = [-3, 1, 2, 4];
const eg = [-7, -19, -10, -12];

//LPF (4-pole)
LPF = function(s = 48e3) {
   this.fs = s;
   this.cutoff = 1e3;
   this.resonance = 1;
   this.g = 0;
   this.stage = Array(4).fill(0);
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

Decay = function(sr = 48000, at = 1, rt = 1, freq = 1.0, mode = "inout", smooth = 001) {
   this.phase = 0;
   this.sampleRate = sr;
   this.rate = freq / this.sampleRate;
   this.attack = at;
   this.release = rt;
   this.mode = mode; // "inout", "in", "out"

   // smoothing state
   this.smooth = 0;
   this.alpha = smooth; // tweak: 001 → very smooth, 05 → snappier

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
         if (this.phase < 5) {
            let t = this.phase / 5;
            let raw = 1.0 - exp(-t / this.attack);
            let max = 1.0 - exp(-1.0 / this.attack);
            return raw / max;
         } else {
            let t = (this.phase - .5) / 5;
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

tune = function(notes = 0, divisor = 1) {
	return 480 * pow(2, notes / 12) / divisor;
}

return function(t, samplerate) {
	const BPM = 120;
	const v = BPM / 60;
	let time = t * v;
	if (time == 0) {
		lpf = new LPF(samplerate);
		lpf2 = new LPF(samplerate);
		env = new Decay(samplerate, .4, .01, v / 2, "in");
		env2 = new Decay(samplerate, .4, .58, v, "out");

		lpf2.setCutoff(1400);
	}
	lpf.setCutoff(2e3 - pow(exp(time % 1), 7.6));
	lpf.setResonance(abs(sin(time / 128)) * 4);
	const x = env2.process();

	const notes = tune(ef[d = 3 & time]);
	const notes2 = tune(ev[d]);
	const notes3 = tune(eg[d]);

	const bass = (t * notes2 / 4 % 1 - .5) * pow(env.process(), 2);
	const bass2 = lpf.process(bass / 2 + (t * notes / 8 % 1 - .5) + (t * notes / 4.01 % 1 - .5) * (1 & time)) / 2;
	const lead = sin(sin(r = t * notes * PI) * abs(9 + cos(time / 4) * 10) - r * 2);
	const lead2 = sin(sin(r = t * notes * PI * 1.5) * x * 8 - r * 2 - tanh(cos(r * 7))) / 4;
	const lead3 = sin((r = t * notes3 / 2.001) % .5 * 45 + sin(r = r * PI * 4.004) + tanh(cos(r * 2) - sin(r * 2))) / 2;
   return lpf2.process(tanh(bass2 * 2 + (lead + lead2 + lead3) / 4)) * 2
}