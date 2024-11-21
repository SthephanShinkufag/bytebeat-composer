
/*!
 *
 * stagas - got some 303
 *
 */

var sampleRate = 48000;
var bpm = 125;
var tuning = 440;
var transpose = -1;

// constants
var tau = 2 * Math.PI;

// time coefficients
var t, tt;

function Oscillator(type, size){
  if (!(this instanceof Oscillator)) return new Oscillator(type, size);
  this.pos = 0;
  this.size = size || sampleRate;
  this.coeff = this.size / sampleRate;
  this.table = new Float32Array(this.size);
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

function clip(x){
  return x / (1 + Math.abs(x));
}

function sequence(measure, seq){
  return seq[(t / measure / 2 | 0) % seq.length];
}

function slide(measure, seq, speed){
  var pos = (t / measure / 2) % seq.length;
  var now = pos | 0;
  var next = now + 1;
  var alpha = pos - now;
  if (next == seq.length) next = 0;
  return seq[now] + ((seq[next] - seq[now]) * Math.pow(alpha, speed));
}

function arp(measure, x, y, z){
  var ts = t / 2 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}

function Noise(){
  return Math.random() * 2 - 1;
}

function note(n, octave){
  return Math.pow(2, (
    n + transpose - 33 + (12 * (octave || 0))
  ) / 12) * tuning; // A4 tuning
}

function octave(o){
  return function(n){
    return n * o;
  };
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

var osc = Oscillator('saw', 1024);
var lfo = Oscillator('sin', 512);
var lfo2 = Oscillator('sin', 512);

var melody = [5, 25, 5, 25, 4, 16, 13, 4 ].map(function(n){
  return note(n, 0);
});

var filter = new DiodeFilter();

filter.set_q(0.66);
filter.set_hpf(.0007);

function dsp(t){
  clock(t);

  filter.set_fc(0.001 + ((lfo.play(2.66) * 0.16 + 1) / 2) * (0.258 + lfo2.play(.02) * 0.12)) ;

  var n = slide(1/16, melody, 12);

  var synth_osc = osc.play(n);
  var synth = arp(1/16, synth_osc, 12, 7);

  synth = filter.run(synth * 0.5);
  synth = clip(synth * 12);

  var kick = arp(1/4, 48, 50, 8);

  // mixer
  return 0.7 * (
    0.6 * synth
  + kick
  );
}

return dsp;
