/*
FΛDE - Cocktail Hour, covered on bytebeat by Sychamis, October 2024. Update 1.
Original: (https://www.youtube.com/watch?v=ucL0NTdKdb4)

As far as I'm aware this is the most accurate cover of this tune on bytebeat. It's not perfect though, some effects are a bit off, it doesn't slow down at the end (I may add this in the future).

I didn't manage to find all the chords on my own, so I used the source file of Esteban Trujillo's C64 cover to get them all. It can be found here: https://csdb.dk/release/?id=233361

This engine is not well optimized yet and I will add other features if I ever reuse it for other tunes. You may try to use it but I don't guarantee everything will work as it should.
*/

t == 0 ? (

    sampleRate = 48000,
    b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    updateSpeed = 50,
    mainPatternSize = 32,
    stepSpeed = 6, // Number of cycles taken for each step on a pattern the length of mainPatternSize
    numberOfChannels = 3

) : 0,

counterToCycle = (c) => int(c / (sampleRate / updateSpeed)),
cycle = counterToCycle(t),

b64ToInt = (n) => b64.indexOf(n),
semitonesToHz = (s) => 2 ** ((s + 1) / 12),
b64ToHz = (n) => semitonesToHz(b64ToInt(n)),

// Oscillators
sqr = (nT) => (nT % sampleRate) < (sampleRate / 2),
sine = (nT) => parseInt("FFFEDCB9864321000001234679BCDEFF"[int(nT % 32)], 16) / 16,
wf1 = (nT) => parseInt("F708BDEFEDB742101247BEFEB7310158"[int(nT % 32)], 16) / 16,
wf2 = (nT) => parseInt("8DB8BD96ADB79A637B84573248513631"[int(nT % 32)], 16) / 16,
wf3 = (nT) => parseInt("8ABC8EE8F8EE8CBA8684828180818284"[int(nT % 32)], 16) / 16,
wf4 = (nT) => parseInt("BCDDEEFFFEEDDCB00000000000000000"[int(nT % 32)], 16) / 16,
saw = (nT) => parseInt("00112233445566778899AABBCCDDEEFF"[int(nT % 32)], 16) / 16,
wf5 = (nT) => parseInt("08F718E728D738C748B758A768977887"[int(nT % 32)], 16) / 16,

// Frequency modulators
mods = [

    (T) => b64ToInt("KIGECA"[counterToCycle(T)]), // Kick
    (T) => b64ToInt("ADH"[counterToCycle(T) % 3]), // Arp 037
    (T) => b64ToInt("ADI"[counterToCycle(T) % 3]), // Arp 038
    (T) => b64ToInt("ADG"[counterToCycle(T) % 3]), // Arp 036
    (T) => b64ToInt("ADF"[counterToCycle(T) % 3]), // Arp 035
    (T) => 12 * int(counterToCycle(T) == 0) + sin(T / 1024) / 10 * int(counterToCycle(T) > 3), // Lead1
    (T) => b64ToInt("AGJ"[counterToCycle(T) % 3]), // Arp 069
    (T) => b64ToInt("nkhebYVSPMJG"[counterToCycle(T)]), // Snare
    (T) => 12 * int(counterToCycle(T) == 0), // Lead2
    (T) => b64ToInt("AEJ"[counterToCycle(T) % 3]), // Arp 049
    (T) => b64ToInt("AADD"[counterToCycle(T) % 4]), // Saw arps 03
    (T) => b64ToInt("AAEE"[counterToCycle(T) % 4]), // Saw arps 04
    (T) => b64ToInt("AAFF"[counterToCycle(T) % 4]), // Saw arps 05
    (T) => b64ToInt("AFJ"[counterToCycle(T) % 3]), // Arp 059
    (T) => b64ToInt("gUSQOMKIGECA"[counterToCycle(T)]), // Square kick
    (T) => - counterToCycle(T) / 2,
],

// Instruments
insts = [

    [(T, nT, n) => wf1(nT / 32) * (1 - T / 16384)], // Bass
    [(T, nT, n) => [sqr(nT * 64), sine(nT / 32)][int(counterToCycle(T) > 0)] * (1 - T / 32768), 0], // Kick
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 1], // Arps 037
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 2], // Arps 038
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 3], // Arps 036
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 4], // Arps 035
    [(T, nT, n) => wf2(nT / 32), 5], // Lead1
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 6], // Arps 069
    [(T, nT, n) => wf3(nT / 128) * (1 - T / 14336), 7], // Snare
    [(T, nT, n) => wf4(nT / 32) * int(counterToCycle(T) < 2) * .6, 8], // Lead2
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 9], // Arps 049
    [(T, nT, n) => saw(nT / 32) * .7, 10], // Saw arps 03
    [(T, nT, n) => saw(nT / 32) * .7, 11], // Saw arps 04
    [(T, nT, n) => saw(nT / 32) * .7, 12], // Saw arps 05
    [(T, nT, n) => saw(nT / 32) * .7], // Saw no arp
    [(T, nT, n) => wf1(nT / 64) * (.5 - T / 32768), 13], // Arps 059
    [(T, nT, n) => sqr(nT * 32) * max(0, .65 - T / 32768), 14], // Square kick
    [(T, nT, n) => wf5(nT / 32) * .5, 15], // wf5
    [(T, nT, n) => wf5(nT / 32) * .4, 15], // wf5 quieter
    [(T, nT, n) => wf1(nT / 64)], // Bass no volume

],

/*
Pattern:

- First element: When to trigger an instrument, index of the instrument in base64
- Second element: Notes in base64
- Dictionarry of effects:
    - Syntax: |[Trigger step] : "Ag8"| (Three-char code, first b64 char is effect id, the two other are its value)
    - Effects:
        - A: Pitch slide up (in 1/2048ths of a semitone) so A00 is 0 semitone per cycle, A01 is 1/2048 and A// is a lot.
        - B: Picth slide down; same as A except it slides down.
        - C: Picth slide up/down (auto) until target note is reached. First char is note and second char is speed.
        - D: Channel Volume from 0 to 1: DAA = 0; D// = 1. Is only effective for the triggered note.
*/

pat1 = [
    "BACABCACBACABCACBACABCACBACABCAC",
    "AJtJAtVtAJtJAtVtAJtJAtVtAMtMAtHt",
],
pat2 = [
    "B                            BBB",
    "A                            AAA",
    {
        0: "DAA" // A pattern can't be started without a note being triggered so here I mute it, but this causes a pop.
    }
],
pat3 = [
    "BADABDADBADABDADBAEABEAEBAFABFAF",
    "ACtCAtOtACtCAtOtAEvEAvQvAEvEAvHv"
],
pat4 = [
    "G     G G  G  G             G G ",
    "n     m-o  k- m-            m n-",
    {
        0: "CpG",
        1: "CpG",
        2: "CpG",
        3: "CpG"
    }
],
pat5 = [
    "BACABCACBACABCACBAHABHAHBAHABHAC",
    "AJtJAtVtAJtJAtVtAJrJArVrAMrMArHt"
],
pat6 = [
    "G   G   G  G  G  GG G G G G G G ",
    "o   m-  k  j- k- kj-h f-h k-m o-"
],
pat7 = [
    "G     G G  G  G         G G G G ",
    "p     q-r  o- m-        o m-k m-"
],
pat8 = [
    "G   G   G   G   G   G   G   G   I I I   I   I I   I   III I I I ",
    "o   m - o   m - o   m - o   m - A A A   A   A A   A   AAA A A A ",
    {
        8: "DgA",
        12: "DgA",
        16: "DQA",
        20: "DQA",
        24: "DIA",
        28: "DIA"
    }
],
pat9 = [
    "JJJJIJJJJJJJIJJJJJJJIJJJJJJJIJJI",
    "fhkhAfhfmfhkAhkhfhkhAhkhmhmoAmkA"
],
pat10 = [
    "BACABCACBACABCACBACABCACBACABCAC",
    "AFtFAtRtAFtFAtRtAFtFAtRtAHtHAtIt"
],
pat11 = [
    "BACABCACBACABCACBACABCACBACABCAC",
    "AFtFAtRtAFtFAtRtAFtFAtRtAEtEAtQt"
],
pat12 = [
    "I                            III",
    "A                            AAA",
    {
        0: "DAA"
    }
],
pat13 = [
    "BADABDADBADABDADBAKABKAKBAKABKAK",
    "ACtCAtOtACtCAtOtAErEArQrAErEArHr"
],
pat14 = [
    "L M N NN NN N M L M N M L  L  O ",
    "h f-c ac-ca-c f-h f-c f-j- h  h ",
    {
        30: "BOA",
        31: "BOA"
    }
],
pat15 = [
    "L M N NN NN N M L M N M L M L M ",
    "h f-c ac-ca-c f-h f-c f-j k-j f-"
],
pat16 = [
    "L M N NN NN N M L M N M L  L  L ",
    "h f-c ac-ca-c f-h f-c f-j- h  j-"
],
pat17 = [
    "BACABCACBACABCACBAKABKAKBACABCAC",
    "AFtFAtRtAFtFAtRtAHrHArTrAJtJAtVt"
],
pat18 = [
    "JJJJIJJJJJJJIJJJJJJJIJJJJJJJIIII",
    "fhkhAfhfmfhkAhkhfhkhAhkhmhmoAAAA"
],
pat19 = [
    "L M L M L M L L L  M  N M N N N ",
    "j k-j k-j k-j h-h  f- c-f c-a c-",
    {
        4: "DgA",
        6: "DgA",
        8: "DQA",
        10: "DQA",
    }
],
pat20 = [
    "IJJJIJJJIJJJIJIJIJJJIJJJIIJIIJJJ",
    "AhkhAfhfAfhkAhAhAhkhAhkhAAmAAmkh"
],
pat21 = [
    "BACABCACBACABCACBAKABKAKBAPABPAP",
    "AFtFAtRtAFtFAtRtAHrHArTrAMrMArHr"
],
pat22 = [
    "BACABCACBACABCACBA A  A BA A  A ",
    "AFtFAtRtAFtFAtRtAH-H- T-AE-E- Q-"
],
pat23 = [
    "IJJJIJJJIJJJIJIJII I IIIQQ Q QQQ",
    "AhkhAfhfAfhkAhAhAA A AAAQQ M MHH"
],
pat24 = [
    "R     R   R  R  R           R   ",
    "y     y   y  y  y           y   "
],
pat25 = [
    "S     S   S  S  S           S   ",
    "0     0   0  0  0           0   "
],
pat26 = [
    "G           G   G     G     GG      G       G       G   G   G   ",
    "n           m - o     k -   qr-     o -     m -     k - m   k - ",
    {
        0: "CpG",
        1: "CpG",
        2: "CpG",
        3: "CpG",
        4: "CpG",
        5: "CpG",
        6: "CpG",
        7: "CpG"
    }
],
pat27 = [
    "G   G   G  G  G      GGGGGGGGGGG",
    "o   m-  k  j- h-     fhfkjkjmkmk"
],
pat28 = [
    "G     G G  G  G   G   G   G   G ",
    "n     m-o  k- t-  r-  o-  m-  k-",
    {
        0: "CpG",
        1: "CpG",
        2: "CpG",
        3: "CpG"
    }
],
pat29 = [
    "BACABCACBACABCACB   B   B   B   ",
    "AJtJAtVtAJtJAtVtA-  A-  A-  A-  "
],
pat30 = [
    "S     S   S  S  S               ",
    "0     0   0  0  0               "
],
pat31 = [
    "L M L M L M L L L  M  N M N N N ",
    "j k-j k-j k-j h-h  f- c-f c-a c-",
    {
        4: "DgA",
        6: "DgA",
        8: "DQA",
        10: "DQA",
    }
],
pat32 = [
    "T                               ",
    "J                               ",
    {
        4: "D6A",
        5: "D1A",
        6: "DvA",
        7: "DqA",
        8: "DlA",
        9: "DfA",
        10: "DaA",
        11: "DVA",
        12: "DPA",
        13: "DKA",
        14: "DFA",
        15: "DAA",
    }
],
pat33 = [
    "N                               ",
    "c                               ",
    {
        4: "D6A",
        5: "D1A",
        6: "DvA",
        7: "DqA",
        8: "DlA",
        9: "DfA",
        10: "DaA",
        11: "DVA",
        12: "DPA",
        13: "DKA",
        14: "DFA",
        15: "DAA",
    }
],
pat34 = [
    "QQ QQ QQ QQ                     ",
    "FF CC AA AA                     ",
    {
        3: "DtA",
        4: "DtA",
        6: "DeA",
        7: "DeA",
        9: "DZA",
        10: "DZA"
    }
],

patternOffset = 0, // With this you can play the tune starting from any row.

// Main sequence
main = [

    [pat1],
    [pat1],
    [pat1],
    [pat1, pat2],
    [pat3, pat4],
    [pat5, pat6],
    [pat3, pat7],
    [pat1, pat8],
    [pat1, pat9],
    [pat10, pat9],
    [pat1, pat9],
    [pat11, pat9, pat12],
    [pat13, pat9, pat14],
    [pat11, pat9, pat15],
    [pat13, pat9, pat16],
    [pat17, pat18, pat19],
    [pat13, pat20, pat14],
    [pat21, pat20, pat15],
    [pat13, pat20, pat16],
    [pat22, pat23, pat19],
    [pat1, pat24, pat25],
    [pat1, pat24, pat25],
    [pat1, pat24, pat25],
    [pat1, pat24, pat25],
    [pat3, pat26, pat25],
    [pat5, pat27, pat25],
    [pat3, pat28, pat25],
    [pat29, pat8, pat30],
    [pat13, pat9, pat14],
    [pat11, pat9, pat15],
    [pat13, pat9, pat16],
    [pat17, pat18, pat19],
    [pat13, pat20, pat14],
    [pat21, pat20, pat15],
    [pat13, pat20, pat16],
    [pat22, pat23, pat19],
    [pat32, pat34, pat33]
],

patternsRow = int(cycle / (stepSpeed * mainPatternSize) + patternOffset) % main.length,

t == 0 ? ( // Initializing everything a channel needs.
	
    channelsInsts = Array(numberOfChannels).fill(0),
    channelsCounters = Array(numberOfChannels).fill(0),
    channelsFreqsSemitones = Array(numberOfChannels).fill(0),
    channelsFreqCounters = Array(numberOfChannels).fill(0),
    channelsEffects = Array(numberOfChannels).fill(0),
    channelsVolumes = Array(numberOfChannels).fill(1)

): 0,


// The guts
processChannels = () => {

    let output = 0;

    for (let ch = 0; ch < main[patternsRow].length; ch ++) {			

        let pattern = main[patternsRow][ch];
        let step = int(cycle / (stepSpeed / (pattern[1].length / mainPatternSize))) % pattern[1].length;

        if (cycle % (stepSpeed / (pattern[1].length / mainPatternSize)) == 0 && cycle == t / (sampleRate / updateSpeed)){ // New step
            
            channelsEffects[ch] = 0; // Not very elegant but makes sure the effect is cleared if there is nothing.

            if (pattern.length == 3){
                if (step in pattern[2]){
                    channelsEffects[ch] = [pattern[2][step][0], b64ToInt(pattern[2][step][1]) * 64 + b64ToInt(pattern[2][step][2])]; // Adds the letter of the effect id and its decimal value.
                }
            }
            if (pattern[1][step] != " "){ // New note
                channelsFreqsSemitones[ch] = b64ToInt(pattern[1][step]);
            }
            if (pattern[1][step] == "-"){ // Stop note
                channelsVolumes[ch] = 0;
            }
        }

        if (cycle % (stepSpeed / (pattern[1].length / mainPatternSize)) == 0 && cycle == t / (sampleRate / updateSpeed) && pattern[0][step] != " ") { // Instrument trigger

            channelsInsts[ch] = insts[b64ToInt(pattern[0][step])];
            channelsCounters[ch] = 0;
            channelsFreqCounters[ch] = 0;
            channelsVolumes[ch] = 1;

        }

        let modifier = 0;

        if (channelsInsts[ch].length == 2) { // Applies the frequency modifier if there is one
            modifier = mods[channelsInsts[ch][1]](channelsCounters[ch]);
        }
        channelsCounters[ch] ++;
        channelsFreqCounters[ch] += semitonesToHz(channelsFreqsSemitones[ch] + modifier);

        if (channelsEffects !== 0 && cycle == (t / (sampleRate / updateSpeed))){ // Effect handling

            let effectId = channelsEffects[ch][0];
            let effectValue = channelsEffects[ch][1];

            switch (effectId){

                case "A":
                    channelsFreqsSemitones[ch] += effectValue / 2048;
                    break;

                case "B":
                    channelsFreqsSemitones[ch] -= effectValue / 2048;
                    break;

                case "C":

                    let targetNote = effectValue >> 6;
                    let incrementStep = (effectValue - targetNote * 64) / 32;

                    if (channelsFreqsSemitones[ch] < targetNote) { // Increase
                        channelsFreqsSemitones[ch] += incrementStep;
                    }
                    if (channelsFreqsSemitones[ch] > targetNote) { // Decrease
                        channelsFreqsSemitones[ch] -= incrementStep;
                    }
                    if (abs(channelsFreqsSemitones[ch] - targetNote) <= incrementStep){ // If difference smaller than step, set freq to value
                        channelsFreqsSemitones[ch] = targetNote;
                    }
                    break;

                case "D":
                    channelsVolumes[ch] = effectValue / 4095;
                    break;  
            }
        }
        
        output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch])) * channelsVolumes[ch];
    }
    return output;
},
processChannels() * 255 / numberOfChannels