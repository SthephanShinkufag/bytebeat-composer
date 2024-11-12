
/*!
 *
 * potasmic - afternoon walk
 *
 */

var transpose = 2;
var bpm = 240; // Beats per minute
var spb = 60/bpm; // Second per beat

function note(n, octave){
  n += transpose;
  return Math.pow(2, (n - 33 + (12 * (octave || 0))) / 12) * 440;
}

var melodies = [
  [note(3,2), note(7,2), note(10,2), note(2,3), note(3,3), note(7,3), note(3,3), note(2,3)],
  [note(0,2), note(3,2), note(7,2), note(10,2), note(0,3), note(7,2), note(3,2), note(7,2)],
  [note(8,1), note(0,2), note(3,2), note(7,2), note(8,2), note(7,2), note(8,2), note(7,2)],
  [note(5,1), note(10,2), note(2,2), note(5,2), note(10,3), note(2,3), note(5,3), note(2,3)]
];

var bassline = [
  [note(3,1),note(3,1),note(3,1),note(3,1),note(3,1),note(3,1),note(3,1),note(2,1)],
  [note(0,1),note(0,1),note(0,1),note(0,1),note(0,1),note(0,1),note(0,1),note(-2,1)],
  [note(8,0),note(8,0),note(8,0),note(8,0),note(8,0),note(8,0),note(8,0),note(7,0)],
  [note(5,0),note(5,0),note(5,0),note(5,0),note(8,0),note(5,0),note(8,0),note(2,1)]
];

var counter;

function dsp(t) {
  counter = Math.floor(t/spb); //How many beats have passed

  return sqr(t,melodies[Math.floor(counter/16)%4][counter%8],0.11)
  +      sqr(t,bassline[Math.floor(counter/16)%4][counter%8],0.11) ; //Changes note every 8beat, alter chord every 16 beats
}

function sin(t,f,a) {
  return a * Math.sin( 2 * Math.PI *  t * f);
}

function sqr(t,f,a) {
  return  ((sin(t,f,a)>0) *2-1) *a;
}

return dsp;
