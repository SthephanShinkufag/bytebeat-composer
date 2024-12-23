/*
I learned javascript for this lol
16-11-2024 Nothing is real

9 DAYS TO MAKE THIS LOL
*/

let sample_rate =33000; // sample rate
let r = 1024; // for decay

// Sequence function
function seq(sequence, speed, t) {
  return sequence[(t >> speed) % sequence.length]
};
// Get note function
function getNote(note) {
  const splitednote = [...note.toUpperCase()];
  if (splitednote[1] === "-") {
     const scalenote = notes[splitednote[0]]
     return 2 ** (scalenote[splitednote[2]] / 12) 
  } 
  if (splitednote[1] === "#") {
     const twoNoteLength = `${splitednote[0]}#`;
     const scalenote = notes[twoNoteLength]
     const octave = parseInt(splitednote[2], 10)
     return 2 ** (scalenote[octave] / 12)
  } else {
     return 0;
  }
};

function addHarmony(x, y, z) {
  return ((x % 85) + (y % 85) + (z % 85)) / 1.25;
};

// Extract Harmony function
function extractHarmony(obj, key) {
  let sequence = obj[key];
  let [fst, snd, trt] = [sequence[0], sequence[1], sequence[2]];
  fst = fst.map(note => getNote(note));
  snd = getNote(snd);
  trt = trt.map(note => getNote(note));
  return [fst, snd, trt];
};	

//Notes and scales
let notes = {"C": [-36, -24, -12, 0, 12, 24, 36, 48], "C#": [-35, -23, -11, 1, 13, 25, 37, 49], "D": [-34, -22, -10, 2, 14, 26, 38, 50], "D#": [-33, -21, -9, 3, 15, 27, 39, 51], "E": [-32, -20, -8, 4, 16, 28, 40, 52], "F": [-31, -19, -7, 5, 17, 29, 41, 53],"F#": [-30, -18, -6, 6, 18, 30, 42, 54], "G": [-29, -17, -5, 7, 19, 31, 43, 55], "G#": [-28, -16, -4, 8, 20, 32, 44, 56], "A": [-27, -15, -3, 9, 21, 33, 45, 57], "A#": [-26, -14, -2, 10, 22, 34, 46, 58], "B": [-25, -13, -1, 11, 23, 35, 47, 59]};

// Channel 1 sequences
let channel1 = {
  "MELODY-1": ["G-3", "C-4", "G-3", "D#4", "G-3", "C-4", "G-3", "F-4", "G-3", "C-4", "G-3", "G-4", "G-3", "C-4", "G-3", "A#4", "G#3", "C-4", "G#3", "D#4", "G#3", "C-4", "G#3", "F-4", "G#3", "C-4", "G#3", "G-4", "G#3", "C-4", "G#3", "A#4"],
  "MELODY-3": ["C-3", "D#3", "F-3", "G-3", "C-3", "D#3", "F-3", "G#3", "C-3", "D#3", "F-3", "A#3", "C-3", "D#3", "F-3", "C-4", "C-3", "D#3", "F-3", "C-3", "C-3", "D#3", "F-3", "A#2", "C-3", "D#3", "F-3", "G#2", "C-3", "D#3", "F-3", "F-2"]
  
};
// Channel 2 sequences 
let channel2 = {
  "SEQUENCES-1": [["G-2", "G#2"], "C-3", ["D#3", "D#3", "F-3", "G-3"]],
  "SEQUENCES-2": [["G-2", "G-2", "F-2", "D#2"], "C-3", ["D#3", "D#3", "F-3", "G-3"]],
  "SEQUENCES-3": [["F-2", "G-2", "G#2", "A#2"]]
};

// channel 3 sequence
let channel3 = [["F-2", "F-2", "A#2", "G-2"], ["A#1", "A#1", "D#2", "C-2"]];

let [semitunes1, semitunes3] = [channel1["MELODY-1"].map(note => getNote(note)), channel1["MELODY-3"].map(note => getNote(note))];

function echo(t, func) {
  return func(t) + (func(t - 12288) / 2)
};
let sc1 = channel3[0].map(note => getNote(note));
let sc2 = channel3[1].map(note => getNote(note));
function song(time) {
  let t = (time * sample_rate);
  
	function kick(length, scale) {
  		return 128 + (sin(sqrt(t & (length * r)-1))) * scale
   };
   function filter(f) {
     return (f & 255) / 128 - 1
   }
  let t2 = int(t / 4) * 4, 

  melfunc1 = t => (t * (seq(semitunes1, 13, t)) & 224) % 256 * (1 - t % 8191 / 12e3) / 2;
  melfunc3 = t => (t * (seq(semitunes3, 13, t)) & 224) % 256 * (1 - t % 8191 / 12e3) / 2;
  let arrayharmony = extractHarmony(channel2, "SEQUENCES-1");
  let arrayharmony2 = extractHarmony(channel2, "SEQUENCES-2");
  let T = t / 3;
  const [fst, snd, trt] = [seq(arrayharmony[0], 17, t), t / 3 * arrayharmony[1], seq(arrayharmony[2], 15, t)];
  const [fst1, snd2, trt3] = [seq(arrayharmony2[0], 15, t), t / 3 * arrayharmony2[1], seq(arrayharmony2[2], 15, t)];
  const firstchannel = 64 + (echo(t, melfunc1) / 2);
  const secondchannel = addHarmony(fst * T,snd,trt * T);
   const firstPart = 64 + (echo(t, melfunc1) / 2);
   const secondPart = (32 + ((addHarmony(fst * T,snd,trt * T) / 2) + 64 + (echo(t, melfunc1) / 2)) / 2);
   const thirdPart = (32 + ((addHarmony(fst * T,snd,trt * T) / 2) + 64 + ((echo(t, melfunc1) / 2)) / 2) + ((seq(sc1, 16, t) * t % 127) + (seq(sc2, 16, t) * t % 127)) / 12) - 32
   const fourthPart = (addHarmony(fst1 * t / 3, snd2, trt3 * t / 3) / 2) + echo(t, melfunc3);
	output = [
	  firstPart,
     secondPart,
     thirdPart,
     (thirdPart + kick(32, 64)) / 2,
     (thirdPart + kick(32, 64)) / 2,
     ((thirdPart * (([1, 2, 3, 4][(t >> 12) % 4]) / 1.5) + kick(16, 64)) + 128) / 4,
      32 - ((thirdPart * (([1, 2, 3, 4][(t >> 12) % 4]) / 1.5) + kick(16, 64) + random() * (-t & 8191) / 128 * (1 - (3 & t >> 12))) + ((t * sin(t >> 2)) & 255 * (-t & 8191) / 2e4 * "00100100100100111" [(t >> 13) % 17]) + 128) / 3,
      32 - ((thirdPart * (([1, 2, 3, 4][(t >> 12) % 4]) / 1.5) + kick(16, 64) + random() * (-t & 8191) / 128 * (1 - (3 & t >> 12))) + ((t * sin(t >> 2)) & 255 * (-t & 8191) / 2e4 * "00100100100100111" [(t >> 13) % 17]) + 128) / 3,
  (((t2 * 128 >> (t2 >> 9)) * (t2 < 16160 ? 1 : 0) * t2) % 256 / 3) + (addHarmony(fst1 * t / 3, snd2, trt3 * t / 3) / 2) + echo(t, melfunc3),
  (addHarmony(fst1 * t / 3, snd2, trt3 * t / 3) / 2) + echo(t, melfunc3),
   (fourthPart * (([1, 2, 3, 4][(t >> 12) % 4]) / 1.5) + kick(16, 64) + random() * (-t & 8191) / 128 * (1 - (3 & t >> 12))) / 3,
   (fourthPart * (([1, 2, 3, 4][(t >> 12) % 4]) / 1.5) + kick(16, 64) + random() * (-t & 8191) / 128 * (1 - (3 & t >> 12))) / 3,
  (fourthPart * (([1, 2, 3, 4][(t >> 13) % 4]))) / 5,
  firstPart
]

  return filter(t < 111.2 * 33e3 ?output[(t >> 18) % output.length] : 0)
};
return song