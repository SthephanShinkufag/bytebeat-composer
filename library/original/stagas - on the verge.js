
/*!
 *
 * stagas - on the verge
 *
 */

var bpm = 125;
var tuning = 440;
var transpose = 12;

// constants
var tau = 2 * Math.PI;

// adjust tuning to bpm
tuning *= 120 / bpm;

// patterns
var chords = [
  [7, 9, 12, 16],
  [2, 5, 9, 12],
  [4, 7, 11, 14],
  [2, 5, 9, 12],
].map(function(chord){
  return chord.map(function(n){
    return note(n);
  });
});

var hat_pattern = [
  0.4, 0.0, 1.2, 0,  0.3, 0.0, 1.0, 0.5,
  0.4, 0.2, 1.1, 0,  0.3, 0.2, 1.2, 0.5,
];

var plucked = Pluck(60, 0.4, 0.7, 1.15, 0.8);

var hat_note = note(7, 6);
var kick_note = note(2, -1);

var bass_lp = LP2(1500);

function dsp(t, f) {
  t *= bpm / 120;

  var c = sequence(1, chords, t);

  var noise = Noise();

  var a = 0.9 * tri(.01, t / 2 % (1));
  var b = 0.8 * Math.sin(a * tau * t);

  var bass_osc =
    0.3 * tri(c[2 + (Math.floor(sin((9/6) * 2, t)))] * (4 + (Math.floor(tri(1/2, t) * 3))), t)
  ;

  bass_osc = bass_lp(bass_osc, 70);

  var bass = env(1/8, bass_osc, 2, 1, t);

  // chord synth
  var synth_osc =
    tri(c[0]*3, t)
  + tri(c[1]*2, t)
  + tri(c[2], t)
  + tri(c[3]*2, t)
  ;

  var synth = plucked(env(1/16, synth_osc, sin(0.2, t) * 10, 2, t));

  // drums
  var hat_osc =
    0.2 * tri(hat_note, t)
  + 0.4 * noise
  ;

  var hat =
    sequence(1/16, hat_pattern, t)
  * env(1/16, hat_osc, 87, 18, t)
  ;

  var kick_osc =
    1.0 * sin(kick_note, t)
  ;

  var kick = env(1/4, kick_osc, 10, 10, t);

  return 1 * (
    0.05 * synth
  + 0.26 * hat
  + 0.6 * kick
  + 0.22 * bass
  );
}

function Pluck(length, dry, wet, tail, cutoff){
  length = length || 40;
  var lp = LP();
  var rb = new RingBuffer(length);
  var sum;
  return function(sample){
    sum = rb.reduce(average, sample);
    sample =
      dry * sample
    + wet * lp(sum, cutoff)
    ;
    rb.push(sample * tail);
    return sample;
  };
}

function average(p, n){
  return (p + n) / 2;
}

function sequence(measure, seq, t){
  return seq[(t / measure / 2 | 0) % seq.length];
}

function env(measure, x, y, z, t){
  var ts = t / 2 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}

function sin(x, t){
  return Math.sin(tau * t * x);
}

function saw(x, t){
  return 1-2 * (t % (1/x)) * x;
}

function tri(x, t) {
  return Math.abs(1 - (2 * t * x) % 2) * 2 - 1;
}

function Noise() {
  return Math.random() * 2 - 1;
}

function sqr(x, t) {
  return sin(x, t) > 0 ? 1 : -1;
}

function LP(){
  var value = 0;
  return function(x, n){
    return value += (x - value) / n;
  };
}

function note(n, octave) {
  return Math.pow(2, (
    n + transpose - 33 + (12 * (octave || 0))
  ) / 12) * tuning; // A4 tuning
}

function RingBuffer(length){
  this.array = new Float32Array(length);
  this.length = length;
  this.pos = 0;
}

RingBuffer.prototype.push = function(el){
  this.array[this.pos++] = el;
  if (this.pos === this.length) {
    this.pos = 0;
  }
};

RingBuffer.prototype.forEach = function(fn){
  var i = this.pos;
  for (; i < this.length; i++) {
    fn(this.array[i]);
  }
  if (this.pos > 0) {
    for (i = 0; i < this.pos; i++) {
      fn(this.array[i]);
    }
  }
};

RingBuffer.prototype.reduce = function(fn, val){
  val = val || 0;
  this.forEach(function(el){
    val = fn(val, el);
  });
  return val;
};

function LP2(cutoff){
  var RC = 1 / (cutoff * 2 * Math.PI);
  var dt = 1 / 2048;
  var alpha = dt / (RC + dt);
  var prev = 0;
  var curr = 0;
  return function(freq, x){
    curr = prev + ( (dt / ( (1/ (freq * 2 * Math.PI)) + dt) ) * (x - prev));
    prev = curr;
    return curr;
  };
}

return dsp;
