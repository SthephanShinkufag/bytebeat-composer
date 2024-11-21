
/*!
 *
 * stagas - polytropon (astral mix)
 *
 */

var transpose = 0;

// patterns
var bassline = [ 6, 6, 6, 9, 12, 12, 12, 19 ];
var melody = [ 6, 9, 6, 9, 12, 19, 12, 19 ];

// filters
var lp_a = Moog();
var lp_b = Moog();
var lp_c = Moog();
var fastlp_a = FastLP(400);
var fastlp_b = FastLP(35);
var fasthp_a = FastHP(1.8);
var fasthp_b = FastHP(1.2);

function dsp(t){
  // lfo
  var lfo_a = sin(2, t);
  var lfo_b = sin(1/32, t);
  var lfo_c = sin(1/128, t);

  var cutoff =
    700
  + (lfo_a * 60)
  + (lfo_b * 300)
  + (lfo_c * 250)
  ;

  // bass
  var bn = note(bassline[Math.floor(t * 4) % bassline.length], 0);

  var bass_osc =
    saw(bn, t)
  + saw(bn/2, t+0.6) * 2
  + sin(bn/2, t-0.9) * 4
  ;

  var bass =
    sin(4, t) * // vca
    ( // vcf
      lp_a(cutoff, 0.2 + (sin(1/2, t + 3/4) * 0.8), bass_osc)
    )
  ;

  // synth
  var mn = note(
    melody[Math.floor(t * Math.pow(Math.floor(t * 8) % 3, 2)) % melody.length],
    -1 + (Math.floor(t * 4) % 5)
  );

  var synth_osc =
    sqr(mn, t-4)
  + saw(mn, t+0.5)
  ;

  var synth =
    sin(4, t) * // vca
    ( // vcf
      lp_b(900, 0.3 + (sin(1/8, t + (1/3)) * 0.3), synth_osc)
    )
  ;

  // pad
  var pad_osc =
    sqr(note(6 + 0.08, 1), t) * 0.9
  + saw(note(9 - 0.05, 0), t) * 2.9
  + sin(note(6 + 0.14, 2), t) * 1.2
  + sqr(note(13 + 0.05, 2 - (Math.floor(t * 2) % 2)), t) * 0.5
  + noise() * 1.1
  ;

  var pad =
    ( 0.8 - ((saw(2, t) * 0.5) + 0.5) ) * // vca bennassi
    fasthp_b(lp_c(1600, 0.45, pad_osc * 0.07))
  ;

  // drums
  var kick_osc = (
    saw(note(6,-1), t) * 0.24
  + sin(note(6,-1), t)
  );

  var kick =
    saw(2, t) * 0.098 // click
  + fastlp_a( // vcf
      perc(kick_osc, 78, t % (1/2), t)
    ) * 3
  ;

  var snare_osc =
    sin(note(9, 0), t) * 0.1
  + noise() * 0.7
  ;

  var snare = // vcf
    fastlp_b(perc(snare_osc, 80 - (t % 4 > 3 ? 20 : 0), (t + 1/2) % (1), t))
  ;

  var hihat_osc =
    saw(note(9,7), t) * 0.4
  + noise()
  ;

  var hihat =
    fasthp_a(perc(hihat_osc, 270 - ( (t + 2/4) % (1/2) > 1/4 ? 200 : 0), t % (1/8), t))
  ;

  // mixer
  return 0.4 * ( // gain
    0.84 * clip(0.69, bass)
  + 0.34 * synth
  + 1.8 * pad
  + 3.8 * kick
  + 10.4 * clip(0.05, snare)
  + 0.24 * hihat
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
  var env = Math.max(0, 0.95 - (o * decay) / ((o * decay) + 1));
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
    cutoff = 2 * cutoff / 48000;
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
  return Math.pow(
    2,
    (n + transpose - 33 + (12 * (octave || 0))) / 12
  ) * 440; // A4 tune
}

return dsp;
