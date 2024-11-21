
/*!
 *
 * subwah
 *
 */

var tau = 2 * Math.PI;

function dsp(t, sampleRate){
  var n = sampleRate / 341.5;

  var bass_osc =
    0.8 * tri(n/3, t)
  + 0.05 * sin(n*2, t)
  ;

  var lfo = sin(0.18, t);
  var lfo_mul = sin(0.04, t);
  var bass_sub =
    0.8 * sub(bass_osc, 2 + ((1 + lfo) * (2 + (1 + lfo_mul) * 12) ), t)
  + 0.7 * sin(n, t)
  ;

  return 0.4 * bass_sub;
}

function sub(wave, mul, t){
  return Math.sin(wave * mul + tau * t);
}

function sin(x, t){
  return Math.sin(tau * t * x);
}

function tri(x, t){
  return Math.abs(1 - (2 * t * x) % 2) * 2 - 1;
}

return dsp;
