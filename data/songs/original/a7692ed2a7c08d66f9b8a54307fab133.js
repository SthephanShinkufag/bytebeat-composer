
// justaboutdead - YAY!

function dsp(t, sampleRate){
  var n = sampleRate / 500;

  var bass_osc =
    0.24 * tri(n, t)
  + 0.052 * sin(n * 32, t)
  ;

  var bass_sub =
     sub(bass_osc, (1 + sin(1.1337, t)) * (2 + (1 + sin(0.42, t)) * 15), t)
  ;

  return 0.3 * bass_sub;

}


var tau = 2 * Math.PI;

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
