
/*!
 *
 * stagas - unexpected token
 *
 */

var sampleRate = 48000;
var transpose = 0;

// patterns
var bassline = [
  [ 7, 7, 7, 12, 10, 10, 10, 15 ],
  [ 7, 7, 7, 15, 15, 17, 10, 29 ],
  [ 7, 7, 7, 24, 10, 10, 10, 19 ],
  [ 7, 7, 7, 15, 29, 24, 15, 10 ]
];

var melody = [
  7, 15, 7, 15,
  7, 15, 10, 15,
  10, 12, 24, 19,
  7, 12, 10, 19
];

var chords = [ [ 7, 12, 17, 10 ], [ 10, 15, 19, 24 ] ];

// filters
var lp_a = Moog();
var lp_b = Moog();
var lp_c = Moog();
var fastlp_a = FastLP(240);
var fastlp_b = FastLP(30);
var fasthp_a = FastHP(1.7);
var fasthp_b = FastHP(1.5);
var fasthp_c = FastHP(0.5);

function dsp(t){
  // lfo
  var lfo_a = sin(2, t);
  var lfo_b = sin(1/32, t);
  var lfo_c = sin(1/128, t);

  var cutoff =
    300
  + (lfo_a * 60)
  + (lfo_b * 300)
  + (lfo_c * 250)
  ;

  // bass
  var bm = bassline[(t / 2 | 0) % bassline.length];
  var bn = note(bm[(t * 4 | 0) % bm.length], 0);

  var bass_osc =
      saw(bn, t) * 1.9
    + sqr(bn/2, t) * 1
    + sin(bn/2, t) * 2.2
    + sqr(bn*3, t) * 3
  ;

  var bass =
    ( // vcf
      lp_a(
        1050 + (lfo_b * 140),
        0 + (sin(1/2, t + 3/4) * 0.2),
        perc(bass_osc/3, 48, t % (1/8), t) * 1
      )
    )
  ;

  // synth
  var mn = note(
    melody[(t * 3 | 0) % melody.length],
    2 - (t * 3 | 0) % 4
  );

  var synth_osc =
    saw(mn, t+1)
  + sqr(mn*2.02, t) * 0.4
  + sqr(mn*3, t+2)
  ;

  var synth_wave =
    ( // vcf
      lp_b(1800 + (lfo_a * 400), 0.1 + (sin(1/8, t + (1/3)) * 0.1),
        perc(synth_osc, 1.6, t % (4), t) * 1.7
      )
    ) * 1.8
  ;

  var synth_degrade = synth_wave * sin(note(5, 2), t);

  var synth = // effect dry / wet mix
    0.4 * synth_wave
  + 0.1 * synth_degrade
  ;

  // pad
  var p = chords[(t / 4 | 0) % chords.length];

  var pad_osc =
    5.1 * saw(note(p[0], 1), t)
  + 3.9 * saw(note(p[1], 2), t)
  + 4.0 * saw(note(p[2], 1), t)
  + 3.0 * sqr(note(p[3], 0), t)
  + noise() * 0.7
  ;

  var pad =
    ( 1.0 - ((sin(2, t) * 0.28) + 0.5) ) * // vca
    fasthp_c(lp_c(1100 + (lfo_a * 150), 0.05, pad_osc * 0.03))
  ;

  // drums
  var kick_osc =
    clip(0.37, sin(note(7,-1), t)) * 2
  + clip(0.07, saw(note(7.03,-1), t * 0.2)) * 4.00
  ;

  var kick =
    saw(2, t) * 0.054 // click
  + fastlp_a( // vcf
      perc(clip(0.6, kick_osc), 54, t % (1/2), t)
    ) * 2
  ;

  var snare_osc =
    sqr(note(17, 0), t+3) * 0.156
  + noise() * 0.73
  ;

  var snare = // vcf
    fastlp_b(perc(snare_osc, 119 - (t % 2 > 1 ? 14 : 0), (t + 1/2) % (1), t) * 0.6)
  ;

  var hihat_osc =
    saw(note(15,9), t) * 0.4
  + noise()
  ;

  var hihat =
    fasthp_a(perc(hihat_osc, 266 - ( (t + 2/4) % (1/2) > 1/4 ? 160 : 0), t % (1/4), t))
  ;

  var shaker_osc =
    noise()
  ;

  var shaker =
    fasthp_b(perc_b(shaker_osc, 230 - ( (t + 2/4) % (1/2) > 1/4 ? 80 : 0), t % 1/8, t))
  ;

  // mixer
  return 0.4 * ( // gain
    0.77 * clip(0.65, bass)
  + 0.018 * synth
  + 0.66 * pad
  + 3.6 * kick
  + 12.0 * clip(0.17, snare)
  + 0.21 * hihat
  + 0.72 * shaker
  );
}

function clip(n, x){
  return x > n
    ? n
    : x < -n
    ? -n
    : x
  ;
}

function sin(x, t){
  return Math.sin(2 * Math.PI * t * x);
}

function saw(x, t){
  return 1-2 * (t % (1/x)) * x;
}

function sqr(x, t){
  return sin(x, t) > 0 ? 1 : -1;
}

function noise(){
  return Math.random() * 2 - 1;
}

function perc(wave, decay, o, t){
  var env = Math.max(0, 0.889 - (o * decay) / ((o * decay) + 1));
  return wave * env;
}

function perc_b(wave, decay, o, t){
  var env = Math.min(0, 0.950 - (o * decay) / ((o * decay) + 1));
  return wave * env;
}

function FastLP(n){
  var value = 0;
  return function(x){
    return value += (x - value) / n;
  };
}

function FastHP(n){
  var value = 0;
  return function(x){
    return value += x - value * n;
  };
}

function Moog(){
  var y1, y2, y3, y4, oldx, oldy1, oldy2, oldy3;

  y1 = y2 = y3 = y4 = oldx = oldy1 = oldy2 = oldy3 = 0;

  var p, k, t1, t2, r, x;

  return function(cutoff, res, input){
    cutoff = 2 * cutoff / sampleRate;
    p = cutoff * (1.8 - (0.8 * cutoff));
    k = 2 * Math.sin(cutoff * Math.PI * 0.5) - 1;
    t1 = (1 - p) * 1.386249;
    t2 = 12 + t1 * t1;
    r = res * (t2 + 6 * t1) / (t2 - 6 * t1);

    x = input - r * y4;

    // four cascaded one-pole filters (bilinear transform)
    y1 =  x * p + oldx  * p - k * y1;
    y2 = y1 * p + oldy1 * p - k * y2;
    y3 = y2 * p + oldy2 * p - k * y3;
    y4 = y3 * p + oldy3 * p - k * y4;

    // clipper band limited sigmoid
    y4 -= (y4 * y4 * y4) / 6;

    oldx = x; oldy1 = y1; oldy2 = y2; oldy3 = y3;

    return y4;
  };
}

// gets note `n` frequency of `octave`
function note(n, octave){
  n += transpose;
  return Math.pow(2, (n - 33 + (12 * (octave || 0))) / 12) * 440;
}

return dsp;
