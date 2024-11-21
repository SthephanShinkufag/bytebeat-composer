
/*!
 *
 * stagas - rooftop unvisited
 *
 */

var sampleRate = 48000;
var bpm = 129;
var tuning = 440;
var transpose = 11;

// constants
var tau = 2 * Math.PI;

// time coefficients
var t, tt;

function sin(freq, phase){
  return Math.sin((t * freq + (2 - (phase || 0) / 2)) * tau);
}

function saw(freq){
  return 1-2 * (t % (1 / freq)) * freq;
}

function tri(freq){
  return Math.abs(1 - (2 * t * freq) % 2) * 2 - 1;
}

function sqr(freq){
  return sin(freq, t) > 0 ? 1 : -1;
}

function Noise(){
  return Math.random() * 2 - 1;
}

function Oscillator(type, size, alias){
  if (!(this instanceof Oscillator)) return new Oscillator(type, size, alias);
  this.pos = 0;
  this.size = size || sampleRate;
  this.coeff = this.size / sampleRate;
  this.table = new Float32Array(this.size);
  this.alias = alias === false ? false : true;
  this.build(type);
}

Oscillator.prototype.build = function(type){
  switch (type) {
    case 'sin':
      var scale = 2 * Math.PI / this.size;
      for (var i = 0; i < this.size; i++) {
        this.table[i] = Math.sin(i * scale);
      }
      break;

    case 'saw':
      for (var i = 0; i < this.size; i++) {
        var x = (i / this.size);
        this.table[i] = +2.0 * (x - Math.round(x));
      }
      break;

    case 'ramp':
      for (var i = 0; i < this.size; i++) {
        var x = (i / this.size);
        this.table[i] = -2.0 * (x - Math.round(x));
      }
      break;

    case 'tri':
      for (var i = 0; i < this.size; i++) {
        var x = (i / this.size) - 0.25;
        this.table[i] = 1.0 - 4.0 * Math.abs(Math.round(x) - x);
      }
      break;

    case 'sqr':
      var half = this.size / 2;
      for (var i = 0; i < this.size; i++) {
        this.table[i] = i < half ? +1 : -1;
      }
      break;
  }
};

Oscillator.prototype.play = function(freq){
  this.pos += freq * this.coeff;
  if (this.pos >= this.size) this.pos -= this.size;
  this.index = this.pos | 0;
  if (!this.alias) return this.table[this.index];
  this.alpha = this.pos - this.index;
  this.next = this.table[this.index == this.size - 1 ? 0 : this.index + 1];
  this.curr = this.table[this.index];
  return this.curr + (this.next - this.curr) * this.alpha;
};

function clock(_t){
  t = _t;
  t *= bpm / 120;
  tt = tau * t;
}

function octave(o){
  return function(n){
    return n * o;
  };
}

function slide(measure, seq, speed){
  var pos = (t / measure / 2) % seq.length;
  var now = pos | 0;
  var next = now + 1;
  var alpha = pos - now;
  if (next == seq.length) next = 0;
  return seq[now] + ((seq[next] - seq[now]) * Math.pow(alpha, speed));
}

function sequence(measure, seq){
  return seq[(t / measure / 2 | 0) % seq.length];
}

function arp(measure, x, y, z){
  var ts = t / 2 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}


function DiodeFilter(){
  this.k = 0;
  this.A = 0;
  this.z = [0,0,0,0,0];
  this.ah;
  this.bh;
  this.fc;
  this.set_q(0);
  this.set_hpf(0.5);
  this.set_fc(.5);
}

DiodeFilter.prototype.set_hpf = function(fc){
  var K = fc * Math.PI;
  this.ah = (K - 2) / (K + 2);
  this.bh = 2 / (K + 2);
};

DiodeFilter.prototype.reset = function(){
  if (this.k < 17) this.z = [0,0,0,0,0];
};

DiodeFilter.prototype.set_q = function(q){
  this.k = 20 * q;
  this.A = 1 + 0.5 * this.k;
};

DiodeFilter.prototype.set_fc = function(cutoff){
  cutoff = (cutoff * cutoff);
  this.fc = cutoff <= 0
    ? .02
    : (cutoff >= 1.0 ? .999 : cutoff);
};

DiodeFilter.prototype.run = function(x){
  var a = Math.PI * this.fc;
  a = 2 * Math.tan(0.5*a); // dewarping, not required with 2x oversampling
  var ainv = 1 / a;
  var a2 = a*a;
  var b = 2*a + 1;
  var b2 = b*b;
  var c = 1 / (2*a2*a2 - 4*a2*b2 + b2*b2);
  var g0 = 2*a2*a2*c;
  var g = g0 * this.bh;

  // current state
  var s0 = (a2*a*this.z[0] + a2*b*this.z[1] + this.z[2]*(b2 - 2*a2)*a + this.z[3]*(b2 - 3*a2)*b) * c;
  var s = this.bh*s0 - this.z[4];

  // solve feedback loop (linear)
  var y5 = (g*x + s) / (1 + g*this.k);

  // input clipping
  var y0 = clip(x - this.k*y5);
  y5 = g*y0 + s;

  // compute integrator outputs
  var y4 = g0*y0 + s0;
  var y3 = (b*y4 - this.z[3]) * ainv;
  var y2 = (b*y3 - a*y4 - this.z[2]) * ainv;
  var y1 = (b*y2 - a*y3 - this.z[1]) * ainv;

  // update filter state
  this.z[0] += 4*a*(y0 - y1 + y2);
  this.z[1] += 2*a*(y1 - 2*y2 + y3);
  this.z[2] += 2*a*(y2 - 2*y3 + y4);
  this.z[3] += 2*a*(y3 - 2*y4);
  this.z[4] = this.bh*y4 + this.ah*y5;

  return this.A*y4;
};



/*
    converts bipolar (-1, +1) signal to unipolar (+0, +1) signal.
 */
function unipolar(v) {
  return v * 0.5 + 0.5;
}

function bipolar(v) {
  return v * 2.0 - 1.0;
}

/*
    converts midi note to frequency
*/
function midi(inp) {
  return Math.pow(2, (inp - 69)/12) * 440;
}

/*
    linear interpolation between samples
 */
function mix(a, b, t) {
  t = clamp(t, 0.0, 1.0);
  var u = 1 - t;
  return a*u + b*t;
}

/*
    clip the value between minima and maxima.
 */
function clamp(x, mi, ma) {
  return Math.max(mi, Math.min(ma, x));
}

/*
    supposed to reset the phase with an another signal
 */
function Sync() {
  var previous = 0;
  var start = 0;
  return function(signal, t) {
    if ((previous < 0) && (signal >= 0)) {
      start = t;
    }
    previous = signal;
    return t - start;
  };
}

/*
    butterworth filters, copied from http://basicsynth.com
 */
var sqr2 = 1.414213562;

function LowPass() {
  var dlyOut2 = 0, dlyOut1 = 0;
  var dlyIn2  = 0, dlyIn1  = 0;
  return function (x, cutoff_freq) {
    var c  = 1.0 / Math.tan((Math.PI / sampleRate) * cutoff_freq);
    var c2 = c*c;
    var csqr2 = sqr2 * c;
    var d = c2 + csqr2 + 1;
    var In0 = 1 / d;
    var In1 = In0 + In0;
    var In2 = In0;
    var Out1 = (2 * (1 - c2)) / d;
    var Out2 = (c2 - csqr2 + 1) / d;
    
    var out = (In0 * x)
            + (In1 * dlyIn1)
            + (In2 * dlyIn2)
            - (Out1 * dlyOut1)
            - (Out2 * dlyOut2);
    dlyOut2 = dlyOut1; dlyOut1 = out;
    dlyIn2  = dlyIn1;  dlyIn1  = x;
    return out;
  };
}

function HighPass() {
  var dlyOut2 = 0, dlyOut1 = 0;
  var dlyIn2  = 0, dlyIn1  = 0;
  return function (x, cutoff_freq) {
    var c  = Math.tan((Math.PI / sampleRate) * cutoff_freq);
    var c2 = c*c;
    var csqr2 = sqr2 * c;
    var d = c2 + csqr2 + 1;
    var In0 = 1 / d;
    var In1 = -(In0 + In0);
    var In2 = In0;
    var Out1 = (2 * (c2 - 1)) / d;
    var Out2 = (1 - csqr2 + c2) / d;
    
    var out = (In0 * x)
            + (In1 * dlyIn1)
            + (In2 * dlyIn2)
            - (Out1 * dlyOut1)
            - (Out2 * dlyOut2);
    dlyOut2 = dlyOut1; dlyOut1 = out;
    dlyIn2  = dlyIn1;  dlyIn1  = x;
    return out;
  };
}

function BandPass() {
  var dlyOut2 = 0, dlyOut1 = 0;
  var dlyIn2  = 0, dlyIn1  = 0;
  return function (x, cutoff_freq) {
    var c = 1 / Math.tan((Math.PI / sampleRate) * cutoff_freq);
    var d = 1 + c;
    var In0 = 1 / d;
    var In1 = 0;
    var In2 = -In0;
    var Out1 = (-c*2*Math.cos(2*Math.PI*cutoff_freq/sampleRate)) / d;
    var Out2 = (c - 1) / d;
    
    var out = (In0 * x)
            + (In1 * dlyIn1)
            + (In2 * dlyIn2)
            - (Out1 * dlyOut1)
            - (Out2 * dlyOut2);
    dlyOut2 = dlyOut1; dlyOut1 = out;
    dlyIn2  = dlyIn1;  dlyIn1  = x;
    return out;
  };
}

/*
    triangle waveporm used to be modulated with square signal in c64
    this thing reduce the precision of the samples and invert the bits if
    the modulator signal is positive (figured it's same as if most significant bit set)
 */
function bit8(signal, modulator) {
  modulator = modulator || -1;
  if (modulator >= 0) {
    return bipolar((~Math.floor(unipolar(signal)*255)) / 255);
  } else {
    return bipolar(Math.floor(unipolar(signal)*255) / 255);    
  }
}

/*
    an envelope generator, converts the amplitudes and durations into line functions.
 */
function Envelope(amps, durs) {
  var xs = [];
  var ks = [];
  var cs = [];
  var x  = 0;
  var a  = 0;
  for (var i = 0; i < durs.length; i++)
  {
    var a1, a2, d, k;
    d = durs[i];
    a1 = amps[i];
    a2 = amps[i+1] || 0;
    
    if (d > 0.0)
    {
      k = (a2 - a1) / d;
      cs.push(a1 - k*x);
      ks.push(k);
      xs.push(x+d);
    }
    x += d;
    a  = a2;
  }
  var envelope = function(t) {
    var i;
    for (i = 0; i < xs.length; i++)
    {
      if (t < xs[i]) return ks[i]*t + cs[i];
    }
    return a;
  };
  envelope.duration = x;
  return envelope;
}

/*
  Calls several 'mini'-dsp functions in rising time sequence. "restarts" the sequence if called with lower a.
*/
function Sequencer(seq) {
  var b = 0;
  var k = 0;
  var live = [];
  return function (t, a) {
    var sum = 0.0;
    if (a < b) {
      for (k = 0; k < seq.length; k++) {
        if (a <= seq[k][0]) break;
      }
    }
    b = a;
    var pos, func, dur, args;
    while((k < seq.length) && (seq[k][0] < a)) {
      pos = seq[k][0];
      func = seq[k][1];
      dur = 1.0 / seq[k][2];
      args = [pos - a + t, dur].concat(seq[k].slice(3));
      live.push(func.apply(null, args));
      k++;
    }
    var resp, surv = [];
    for(var i = 0; i < live.length; i++) {
      func = live[i];
      resp = func(t);
      if (resp === undefined) continue;
      sum += resp;
      surv.push(func);
    }
    live = surv;
    return sum;
  };
}

function note(n, octave){
  return Math.pow(2, (
    n + transpose - 33 + (12 * (octave || 0))
  ) / 12) * tuning; // A4 tuning
}

function clip(x){
  return x / (1 + Math.abs(x));
}

// patterns

var hat_pattern = [
  0.1, 0.4, 0.8, 0.7,
];

var melody = [
  1, 1+12, 2, 2+12,
  5, 4+12, 7+12, 4,
].map(function(n){
  return note(n, 2);
});

melody = melody.concat(melody.slice().reverse());

var hat_note = note(16, 6);

var bass_osc = Oscillator('saw', sampleRate);
var osc = Oscillator('sin', 14, false);
var hat_osc = Oscillator('ramp', 32, false);

var filter = new DiodeFilter();

filter.set_q(0.74);
filter.set_hpf(.0026);

var hp = new HighPass();

function dsp(t){
  clock(t);

  var noise = Noise();

  var n = slide(1/4, melody, 52);

  var synth_osc = osc.play(n / 3 + tri(34) * 8)// + tri(n / 10000);
  var synth = sequence(1/16, [0, 1, 1, 0,  0, 0, 1, 0]) * arp(1/16, synth_osc, 0, 0);

  filter.set_fc(0.5 + (tri(1/4) * 0.49));
  var b = slide(1/4, melody, 16);
  var bass = bass_osc.play(b / 12);
  bass = clip(bass * 7);
  bass = filter.run(bass * 0.7);
  bass = clip(bass * 39);
  bass = bass * (0.8 - ((saw(2) * 0.5)));

  var kick = arp(1/4, 46, 45, 0);

  var hat = sequence(1/16, hat_pattern)
    * arp(1/16, hat_osc.play(hat_note) + noise * 1.1, 2, 200 + (saw(4) > 0 ? -120 : 0));

  hat = hp(hat, 6500);

  return 0.8 * (
    1.2 * synth
  + 1.5 * kick
  + 2.3 * hat
  + 0.85 * bass
  );
}

return dsp;
