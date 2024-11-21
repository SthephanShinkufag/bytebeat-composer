
/*!
 *
 * stagas - on the verge (tech mix)
 *
 */

var bpm = 125;
var tuning = 440;
var transpose = 12;

// constants
var tau = 2 * Math.PI;

// time coefficients
var t, tt;

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

var plucked = Pluck(120, 0.6, 0.87, 1.0, 0.9);

var hat_note = note(7, 6);
var kick_note = note(2, -1);

var bass_lp = LP2(6500);

function dsp(t) {
  clock(t);

  var c = sequence(1, chords);

  var noise = Noise();

  var a = 0.9 * tri(0.01, t / 2 % (1));
  var b = 0.8 * Math.sin(a * tau * t);

  var bass_osc =
    0.3 * tri(c[2 + (Math.floor(sin((9/6) * 2, t)))] * (3 + (Math.floor(tri(1/2, t) * 2))) / 3)
  ;

  bass_osc = bass_lp(bass_osc, 42);

  var bass = arp(1/8, bass_osc, 2, 1);

  // chord synth
  var synth_osc =
    tri(c[0]*3)
  + tri(c[1]*2)
  + tri(c[2]*4)
  + tri(c[3]*1)
  ;

  var synth = plucked(arp(1/12, synth_osc, sequence(1/12, [1, 1, 1, 1, 1, 0]) * 85 + (sin(0.4) * 10), 0.3));

  // hat
  var hat_osc =
    0.2 * tri(hat_note)
  + 0.4 * noise
  ;

  var hat =
    sequence(1/16, hat_pattern)
  * arp(1/16, hat_osc, 87, 18)
  ;

  var kick_osc =
    1.0 * sin(kick_note)
  ;

  var kick = arp(1/4, 70, 35, 3);

  return 0.8 * (
    0.07 * synth
  + 0.26 * hat
  + 0.6 * kick
  + 0.19 * bass
  );
}

function clock(_t){
  t = _t;
  t *= bpm / 120;
  tt = tau * t;
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

function Noise(){
  return Math.random() * 2 - 1;
}

function sqr(freq){
  return sin(freq, t) > 0 ? 1 : -1;
}

function LP(){
  var value = 0;
  return function(x, n){
    return value += (x - value) / n;
  };
}

function note(n, octave){
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
