// thingy sequencer by gdplayer
// code refactored by chatgpt
// ye
// version 1
function tone(t, freq) {
    return Math.sin(2 * Math.PI * freq * t);
}

function sawtooth(t, freq) {
    return (2 * (t * freq - Math.floor(t * freq + 0.5))) * 2; // Sawtooth wave
}

function noise() {
    return Math.random() * 2 - 1; // Random value between -1 and 1
}

const baseFreqs = {
    "C-": 261.63, "C#": 277.18, "D-": 293.66, "D#": 311.13, "E-": 329.63,
    "F-": 349.23, "F#": 369.99, "G-": 392.00, "G#": 415.30, "A-": 440.00,
    "A#": 466.16, "B-": 493.88
};

// Generate frequency map for octaves from 1 to 8
const freqMap = {};
for (let octave = 1; octave <= 8; octave++) {
    for (let note in baseFreqs) {
        const freq = baseFreqs[note] / Math.pow(2, 4 - octave);
        freqMap[`${note}${octave}`] = freq;
    }
}

const bpm = 113 * 2;
let voices = [];
const beatDuration = 60 / bpm;

// Map instrument types
const instrumentTypes = {
    0: tone, // Sine
    1: sawtooth // Sawtooth
};

function voice(t, freq, vol, isNoise = false, instrumentType = 0) {
    const wave = instrumentTypes[instrumentType] || instrumentTypes[0];
    return isNoise ? noise() * vol : wave(t, freq) * vol;
}

let maxVoices = 0;

function notamultiplexer(t) {
    let result = 0;
    if (voices.length > maxVoices) {
        maxVoices = voices.length;
    }
    for (let i = 0; i < voices.length; i++) {
        const v = voices[i];
        result += voice(t, v.freq, v.vol, v.isNoise, v.instrumentType);
        v.vol -= v.decay / 256;
    }
    removeSilent();
    return voices.length > 0 ? result / maxVoices : 0;
}

function pushVoice(freq, vol, decay, isNoise = false, instrumentType = 0) {
    voices.push({
        freq: freq,
        vol: vol,
        decay: decay,
        isNoise: isNoise,
        instrumentType: instrumentType
    });
}

function removeSilent() {
    for (let i = voices.length - 1; i >= 0; i--) {
        if (voices[i].vol <= 0) {
            voices.splice(i, 1);
        }
    }
}

let lastBeatIndex = -1; // To track the last processed beat

function processSong(t) {
    const beatIndex = Math.floor(t / beatDuration) % song.length; // Loop back to the start

    if (beatIndex !== lastBeatIndex) {
        lastBeatIndex = beatIndex;
        if (song[beatIndex].length > 0) {
            for (let note of song[beatIndex]) {
                const [noteStr, volume, decay, instrument = 0] = note.split(" ");
                const instrumentType = parseInt(instrument, 10);
                if (noteStr === "NSE") {
                    pushVoice(0, parseFloat(volume), parseFloat(decay), true, instrumentType);
                } else {
                    const freq = freqMap[noteStr];
                    if (freq) {
                        pushVoice(freq, parseFloat(volume), parseFloat(decay), false, instrumentType);
                    }
                }
            }
        }
    }
}

// Example song array, with empty arrays indicating no notes on that beat
const song = [
    ["F#5 1 0.01 1", "C#5 1 0.01 1", "A#4 1 0.01 1", "F-6 1 0.01 1", "C#6 1 0.01 1", "A#5 1 0.01 1", "C#7 4 0.05 0"],
    [],
    ["NSE 2 0.1"],
    ["D#6 1 0.01 1", "C-6 1 0.01 1 ", "G#5 1 0.01 0", "D#5 1 0.01 1", "C-5 1 0.01 1", "D#7 4 0.05 0"],
    [],
    [],
    ["NSE 2 0.1", "G#6 4 0.05 0"],
    [],
    ["D#6 1 0.01 1", "C-6 1 0.01 1 ", "G#5 1 0.01 0", "D#5 1 0.01 1", "C-5 1 0.01 1", "D#7 4 0.05 0"],
    [],
    ["NSE 2 0.1"],
    ["F-6 1 0.01 1", "C#6 1 0.01 1", "A#5 1 0.01 1", "F-5 1 0.01 1", "C#5 1 0.01 1", "G#5 1 0.01 1", "F-7 4 0.05 0"],
    [],
    [],
    ["NSE 2 0.1"],
    [],
    ["F#5 1 0.01 1", "C#5 1 0.01 1", "A#4 1 0.01 1", "F-6 1 0.01 1", "C#6 1 0.01 1", "A#5 1 0.01 1", "C#7 4 0.05 0"],
    [],
    ["NSE 2 0.1"],
    ["D#6 1 0.01 1", "C-6 1 0.01 1 ", "G#5 1 0.01 0", "D#5 1 0.01 1", "C-5 1 0.01 1", "D#7 4 0.05 0"],
    [],
    [],
    ["NSE 2 0.1", "G#6 4 0.05 0"],
    [],
    [],
    [],
    ["NSE 2 0.1"],
    [],
    [],
    [],
    ["NSE 2 0.1"],
    [],
];

return (t, sr) => {
    const m = Math.floor((t / beatDuration) / 4); // Measure
    const b = Math.floor((t / beatDuration) % 4); // Beat in measure

    // Log error at the start of each new beat
    if ((t * sr * 60 % sr / 60) === 0) {
        throw `\nMeasure: ${m + 1}, Beat: ${b + 1}\n` +
            voices.map(v => `Freq: ${v.isNoise ? "Noise" : v.freq.toFixed(2)}, Vol: ${v.vol.toFixed(2)}, Decay: ${v.decay}`).join("\n") + "\n";
    }
    processSong(t);
    return notamultiplexer(t);
};
