// filter buffer
let filter = new Float32Array(131072);

// settings
var settings = {
  BPM: 240,
  SPD: 1,
  FRQ: 440
};

var length = 16;
var BPS = settings.BPM * settings.SPD / 60;


function P(time, note, pitch) {
  return 2 ** ((note - 69) / 12 + pitch) * settings.FRQ;
}

// oscillators
function Square(input, duty = 0.5) {
  return input % 1 > duty ? -1 : 1;
}

function Saw(input) {
  return 2 * input % 2 - 1;
}

function Sine(input) {
  return sin(4 * PI * input);
}

function Triangle(input) {
  return abs(input % 2 - 1) - 0.5;
}

function Noise(input) {
  return sin((255 * input | 0) ** 3);
}

// filters
function lowPass(buff, input, strength) {
  return filter[buff] += (input - filter[buff]) * strength;
}

function highPass(buff, input, strength) {
  return lowPass(buff, input, strength) - input;
}

function bandPass(buff, input, strength) {
  return highPass(buff + 1, lowPass(buff, input, strength), strength);
}


function MIDI(
  noFilter = 1, filt, buff, strength_,
  time, func, offset, note, pitch,
  strength, vol = 1
) {
  var code = (time * BPS - offset) > 0
    ? func(time * P(time, note, pitch))
        * strength ** ((time * BPS - offset) % length) ** 0.7
        / 8 * vol
    : 0;

  return !noFilter ? filt(buff, code, strength_) : code;
}


return function(time) {
  return [
    // melody
    [1, null, null, null, time, Square, 0,  -4, 5, 0.5, 2],
    [1, null, null, null, time, Square, 1,   3, 5, 0.5, 2],
    [1, null, null, null, time, Square, 2,  10, 5, 0.5, 2],
    [1, null, null, null, time, Square, 3,  11, 5, 0.5, 2],
    [1, null, null, null, time, Square, 4,  15, 5, 0.4, 2],
    [1, null, null, null, time, Square, 6,   8, 5, 0.4, 2],
    [1, null, null, null, time, Square, 7,  10, 5, 0.4, 2],
    [1, null, null, null, time, Square, 8,  -1, 5, 0.5, 2],
    [1, null, null, null, time, Square, 9,   3, 5, 0.5, 2],
    [1, null, null, null, time, Square, 10,  4, 5, 0.5, 2],
    [1, null, null, null, time, Square, 11,  8, 5, 0.2, 2],
    [1, null, null, null, time, Square, 12, 10, 5, 0.5, 2],
    [1, null, null, null, time, Square, 13,  6, 5, 0.2, 2],
    [1, null, null, null, time, Square, 14,  1, 5, 0.4, 2],
    [1, null, null, null, time, Square, 15,  3, 5, 0.4, 2],

    // bass
    [1, null, null, null, time, Saw,  0, -4, 3, 0.7, 3],
    [1, null, null, null, time, Saw,  8, -8, 3, 0.7, 3],
    [1, null, null, null, time, Saw, 12, -6, 3, 0.7, 3],

    // triangle blips
    [1, null, null, null, time, Triangle,  4,   -4, 9, 0.01, 8],
    [1, null, null, null, time, Triangle,  4.25,-4, 9, 0.01, 8],
    [1, null, null, null, time, Triangle,  4.5, -4, 9, 0.01, 8],
    [1, null, null, null, time, Triangle,  4.75,-4, 9, 0.01, 8],
    [1, null, null, null, time, Triangle,  5,   -4, 9, 0.01, 8],
    [1, null, null, null, time, Triangle,  5.25,-4, 9, 0.01, 8],

    [1, null, null, null, time, Triangle, 12,   -6, 9, 0.01, 8],
    [1, null, null, null, time, Triangle, 12.25,-6, 9, 0.01, 8],
    [1, null, null, null, time, Triangle, 12.5, -6, 9, 0.01, 8],
    [1, null, null, null, time, Triangle, 12.75,-6, 9, 0.01, 8],
    [1, null, null, null, time, Triangle, 13,   -6, 9, 0.01, 8],
    [1, null, null, null, time, Triangle, 13.25,-6, 9, 0.01, 8],
  ]
  .map(([noFilter, filt, buff, strength_, time, func, offset, note, speed, strength, vol]) =>
    MIDI(noFilter, filt, buff, strength_, time, func, offset, note, speed, strength, vol)
  )
  .reduce((a, b) => a + b);
};