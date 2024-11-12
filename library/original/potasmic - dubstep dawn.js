/**
 *  potasmic - dubstep dawn 
 *  (because all other wavepot loops' names are part of the day hehehe)
**/

var sampleRate = 48000;
var bpm = 148;
var tuning = 440;
var transpose = 0;
 
// constants
var tau = 2 * Math.PI;
 
// time coefficients
var t, tt;
 
function Osc(type, octave, size, alias){
  if (!(this instanceof Osc)) return new Osc(type, size, alias);
  this.pos = 0;
  this.octave = Math.pow(2,octave) || 1;
  this.size = size || sampleRate;
  this.coeff = this.size / sampleRate;
  this.table = new Float32Array(this.size);
  this.alias = alias === false ? false : true;
  this.build(type);
}
 
Osc.prototype.build = function(type){
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
 
Osc.prototype.play = function(freq,oct){
  var octa = Math.pow(2,oct) || this.octave;
  this.pos += freq * this.coeff * octa;
  if (this.pos >= this.size) this.pos -= this.size;
  this.index = this.pos | 0;
  if (!this.alias) return this.table[this.index];
  this.alpha = this.pos - this.index;
  this.next = this.table[this.index == this.size - 1 ? 0 : this.index + 1];
  this.curr = this.table[this.index];
  return this.curr + (this.next - this.curr) * this.alpha;
};
 
 
function Syn(oscs, octs) {
  if(!(this instanceof Syn)) return new Syn(oscs);
  this.oscs = oscs;
  this.octs = octs;
}
 
Syn.prototype.setOcts = function(arr) {
  this.octs = arr;
}
 
Syn.prototype.mix = function(freq) {
  var sum = 0;
  var all = this.oscs.length;
  for(i=0; i< all; i++ ) {
    var oct = this.octs[i];
    sum += this.oscs[i].play(freq,oct) * 1/all;
  }
  return sum;
}
 
function clock(_t){
  t = _t;
  t *= bpm / 120;
  tt = tau * t;
}
 
 
function sequence(measure, seq){
  return seq[(t / measure / 2 | 0) % seq.length];
}
 
function ms2freq(ms) {
  return (ms)*60/bpm;
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
 
function clip(x){
  return x / (1 + Math.abs(x));
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
 
// -----------------------------------------------------------
var snare_patt = [
  0,0,0,0,0,0,0,0,
  .3,0,0,0,0,0,0,0,//-
  0,0,0,0,0,0,0,0,
  .3,0,0,0,0,0,0,0,//-
  0,0,0,0,0,0,0,0,
  .3,0,0,0,0,0,0,0,//-
  0,0,0,0,0,0,0,0,
  .3,0,0,.3,0,0,.3,0//-
  ];
var kick_patt = [
  1,0,0,0,0,0,0,0,
  1,0,0,0,0,0,0,0,//-
  1,0,0,1,0,0,1,0,
  1,0,0,0,0,0,0,0,//-
  1,0,0,0,0,0,0,0,
  1,0,0,0,0,0,0,0,//-
  1,0,0,1,0,0,1,0,
  1,0,1,1,0,0,1,0//-
  ];
var hat_patt = [
  0.01,0.1,0.5,0.01
  ];
  
var wob_state_init = [
  0,0,0,0,0,0,0,0,
  0,0,0.25,0.5,1,1,1,1,//-
  0,0,0,0,0,0,0,0,
  0.25,0.5,1,0.5,1,0.5,1,0.5,//-
  0,0,0,0,0,0,0,0,
  0,0,0.25,0.5,1,1,1,1,//-
  0,0,0,0,0,0,0,0,
  1,1,1,1,1,1,1,1//-
  ];
var wob_lfo = [
  8,8,8,8,16,16,16,16,8,8,8,8,4,4,16,8
  ].map( function(n) { return ms2freq(n);} );
var wob_note_init = [
 0,0,0,0,5,5,5,5,3,3,3,3,1,1,5,-2
 ].map( function(n) { return note(n,1) }); 
var wob_note_drop = [
 0,0,0,0,5,5,5,5,3,3,3,3,1,1,5,-2,
 0,0,0,0,-2,-2,-2,-2,-3,-3,-3,-3,-4,-4,-2,-2,
 0,0,0,0,-2,-2,-2,-2,3,3,3,3,2,2,3,2,
 0,0,0,0,-2,-2,-2,-2,7,7,7,7,5,5,2,2
 ].map( function(n) { return note(n,1) }); 
 
var pling_note = [
  0,3,7,12,0,3,7,12,0,3,7,12,0,3,7,12,
  5,9,12,17,5,9,12,17,5,9,12,17,5,9,12,17,
  3,7,10,15,3,7,10,15,3,7,10,15,3,7,10,15,
  1,5,8,13,1,5,8,13,1,5,8,13,1,5,8,13
  ].map( function(n) {return note(n,1) });
  
var fr8_note = [
  0,0,5,5,3,3,1,5
  ].map( function(n) {return note(n,1) });
var fr8_on = [
  0,0,1,0
  ];
var build_kick = [
  1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,
  1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,
  1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
  ];
  
  
// -------------------------------------------------------------
//wobble setup
var osc1 = Osc('sqr');
var osc2 = Osc('saw');
var osc3 = Osc('saw');
var fil = new DiodeFilter();
fil.set_hpf(0.0);
fil.set_q(0.07);
var wobble = new Syn([osc1,osc2,osc3],[-1,0,-1]);
 
//hat setup
var hat_note = note(21,6);
var hat_osc = Osc('ramp');
 
//pingplong setup
var arp1 = Osc('sqr');
var arp2 = Osc('sin');
var arp3 = Osc('saw');
var pling = new Syn([arp1,arp2,arp3],[3,5,1]);
 
//skwear
var skw = Osc('saw',2);
 
 

return function dsp(t) {
  clock(t);
  var beat = Math.floor(t/(60/bpm))%336;
  
  var noise = Noise();
  
  //ending
  var end_muter = beat >= 256? 0:1;
  
  //wibble wobble
  var wob_on = (beat >= 16 && beat < 320)? 1 : 0;
  var wob_vol = 1;
  fil.set_q(0.13 + sin(0.5)*0.13);
  fil.set_fc(0.29 + tri(sequence(1/4,wob_lfo))*0.289);
  if(beat > 95) { 
    wob_state=[1];
    wob_note = wob_note_drop;
    wob_vol = 0.75;
    wobble.setOcts([-1,3,2]);
  } else { // else clause prevent variables being sticky if you want to play it again
    wob_state = wob_state_init; 
    wob_note = wob_note_init;
    wob_vol = 1;
    wobble.setOcts([-1,0,-1]);
  }
  var wob =  fil.run(wobble.mix( sequence(1/4,wob_note) )) * sequence(1/16,wob_state) * wob_on;
  
  //spacey plingplongs
  var plings = pling.mix( sequence(1/16, pling_note )) * sqr(ms2freq(16));
  
  //4-8/16-skwr
  var fr8 = skw.play(sequence(1/2, fr8_note), (2 + Math.floor(beat/16)%2)) * sequence(1/8,fr8_on);
  fr8 = (fr8 > 0.85)? 1:0;
  
  //all le drums
  var drums_on = (beat >= 80 && beat < 96)? 0:1;
  var drums = arp(1/16,60,40,20) * sequence(1/16,kick_patt) + arp(1/16,60,80,3) * noise * sequence(1/16,snare_patt);
  var drums_build = arp(1/16,60,40 + (beat - 80)*2,20) * sequence(1/16,build_kick) * ( 1 - drums_on);
  var hats_on = beat >= 32? 1: 0;
  var hat = arp(1/16, hat_osc.play(hat_note) + noise * 1.4, 18, 70) * sequence(1/16,hat_patt) * hats_on;
  
  return (
     wob * wob_vol
    + drums * 0.9 * drums_on
    + drums_build * 0.9
    + hat * 0.7 * drums_on * end_muter
    + plings * 0.09 * end_muter
    + fr8 * 0.2 * drums_on* end_muter
    );
}
