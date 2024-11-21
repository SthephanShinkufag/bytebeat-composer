
/*!
 *
 * stagas - icecream
 *
 */

var sampleRate = 48000;
var bpm = 125;
var tuning = 440;
var transpose = 11;

// constants
var tau = 2 * Math.PI;

// time coefficients
var t, tt;

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

function slide(measure, seq){
  var pos = (t / measure / 2) % seq.length;
  var now = pos | 0;
  var next = now + 1;
  var alpha = pos - now;
  if (next == seq.length) next = 0;
  return seq[now] + ((seq[next] - seq[now]) * Math.pow(alpha, 7));
}

function sequence(measure, seq){
  return seq[(t / measure / 2 | 0) % seq.length];
}

function arp(measure, x, y, z){
  var ts = t / 2 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}

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

function note(n, octave){
  return Math.pow(2, (
    n + transpose - 33 + (12 * (octave || 0))
  ) / 12) * tuning; // A4 tuning
}

// patterns
var hat_pattern = [
  0.6, 0.3, 0.2, 0.1,  0.3, 0.1, 1.1, 0.4,
  0.6, 0.4, 0.1, 0.1,  0.3, 0.2, 1.2, 0.4,
];

var melody = [3, 5, 9, 12].map(function(n){
  return note(n, 0);
});

melody = melody.concat(melody.map(octave(2)));
melody = melody.concat(melody.slice().reverse());

var progression = [1, 1.05, 0.805, 0.746];

var mprogression = [128, 64, 32];

var hat_note = note(3, 5);

var osc = Oscillator('tri', 512);
var hat_osc = Oscillator('ramp', 512);

function dsp(t){
  clock(t);

  var noise = Noise();

  var p = sequence(2/1, progression);
  var m = sequence(8/1, mprogression);
  var n = slide(1/m, melody) * p;

  var synth_osc = osc.play(n);
  var synth = arp(1/6, synth_osc, 32, 10);

  var kick = arp(1/4, 60, 80, 3);

  var hat = sequence(1/12, hat_pattern)
    * arp(1/12, hat_osc.play(hat_note) + noise * 1.4, 180, 70);

  return 0.7 * (
    0.9 * synth
  + kick
  + 0.12 * hat
  );
}

return dsp;
