/*
DRAX - Clarence, covered on bytebeat by Sychamis, March 2025.
Original: https://www.youtube.com/watch?v=SYtauTDqFOg

Done in a few hours because I was bored.

Filter code based on polyzium's code.
The visualizer from deepsid was very useful to find all the notes: https://deepsid.chordian.net/?file=/MUSICIANS/D/DRAX/Clarence.sid.

This is meant to be played on https://dollchan.net/bytebeat in Floatbeat mode at 48000Hz.
*/

t || (

sampleRate = 48000,
tempo = 125,
stepsPerBeat = 8,
mainPatternSize = 64,
slideDivider = 2 ** 22,
numberOfChannels = 3,

channelsInsts = Array(numberOfChannels).fill(0),
channelsCounters = Array(numberOfChannels).fill(0),
channelsFreqsSemitones = Array(numberOfChannels).fill(0),
channelsFreqCounters = Array(numberOfChannels).fill(0),
channelsEffects = Array(numberOfChannels).fill(0),
channelsVolumes = Array(numberOfChannels).fill(1),
channelsIsReleased = Array(numberOfChannels).fill(0),
channelsReleaseT = Array(numberOfChannels).fill(0),

adsr = (a, d, s, r, t, rt) => (v = (w = (t - rt) / sampleRate / a) < 1 ? w : (x = 1 - (t - rt - sampleRate * a) / sampleRate / d * (1 - s)) > s ? x : s, !rt ? v : max(v - (rt / sampleRate / r) * v, 0)),

// Oscillators

sqr = (p, d) => (p % sampleRate / sampleRate > d) - .5,
tri = p => abs(p % sampleRate - sampleRate / 2) / sampleRate,
noi = p => int(p) ** 9 % 255 / 255 - .5,

// Frequency modulators

mods = [

    T => sin(T / 1400) / 5,
    T => b64ToInt("MFA"[T / 1920 % 3 | 0]),
    T => b64ToInt("LEA"[T / 1920 % 3 | 0]),
    T => b64ToInt("MHA"[T / 1920 % 3 | 0]),
    T => b64ToInt("LHA"[T / 1920 % 3 | 0]),
    T => sin(T / 1400) / 2,
    T => 0,

],

// Instruments

insts = [

    [(T, p, n, rT) => (n = [sqr(T * b64ToHz("N") * 64, .5), sqr(p * 16, min(.25 + T / 55e3, .5))][+(T / 960 > 1)], T == 1 ? (a = b = 0, r = .55) : 0, c = max(.99 - sqrt(T / 42e3), .15), (b += c * ((a += c * (n - a + (r + r / (1 - c)) * (a - b))) - b)) * adsr(0, 1, 0, 0, T, rT)), 0],
    [(T, p, n, rT) => (n = [noi(T / 3), sqr(T * b64ToHz("I") * 128, .5), sqr(T * b64ToHz("G") * 128, .5), noi(T / 2)][min(T / 960, 3) | 0], T == 1 ? (a = b = 0, c = .85, r = .55) : 0, (b += c * ((a += c * (n - a + (r + r / (1 - c)) * (a - b))) - b)) * adsr(0, .2, 0, 0, T, rT))],
    [(T, p, n, rT) => (n = sqr(p * 16, min(.25 + T / 55e3, .5)), T == 1 ? (a = b = 0, r = .55) : 0, c = max(.99 - sqrt(T / 42e3), .15), (b += c * ((a += c * (n - a + (r + r / (1 - c)) * (a - b))) - b)) * adsr(0, 1, 0, .02, T, rT)), 0],
    [(T, p, n, rT) => (n = [sqr(T * b64ToHz("N") * 64, .5), sqr(p * 16, .25 + T / 55e3)][+(T / 960 > 1)], T == 1 ? (a = b = 0, r = .55) : 0, c = max(.99 - sqrt(T / 42e3), .15),((b += c * ((a += c * (n - a + (r + r / (1 - c)) * (a - b))) - b))) * adsr(0, 1, 0, 0, T, rT)), 0],
    [(T, p, n, rT) => sqr(p * 128 * "12"[+(T / 1920 % 2 > 1)], [.45, .5 + T / 2e5][+(T / 960 > 1)]) * adsr(0, .02, .3, .75, T, rT)],
    [(T, p, n, rT) => sqr(p * 128 * "12"[+(T / 1920 % 2 > 1)], [.45, tri(T * 1.25) / 2 + .25][+(T / 960 > 1)]) * adsr(0, .02, .3, .75, T, rT)],
    [(T, p, n, rT) => sqr(p * 128, T < 8e3 ? .35 + T / 2e4 : .75 + tri(T * 2) / 8) * adsr(0, .035, .45, 3, T, rT)],
    [(T, p, n, rT) => sqr(p * 64, T < 8e3 ? .35 + T / 2e4 : .75 + tri(T * 2) / 8) * adsr(0, .025, .65, .2, T, rT)],

],

/*
Pattern:

- First row: When to trigger an instrument, index in base64
- Second row: Notes in base64, '-' to stop the current note

- Effects:

    - Third row: Effect id in base64
    - Fourth row: First char of effect value
    - Fifth row: Second char of effect value (not always needed)

        - A: Pitch slide up (in (1 / slideDivider) of a semitone) so AAA is 0 semitone per cycle, AAB is 1 / slideDivider and A// is a lot.
        - B: Picth slide down; same as A except it slides down.
        - C: Picth slide up/down (auto) until target note is reached. First char is note and second char is speed. 
            Increases / decreases pitch in ([second char value] / (slideDivider / 128) of a semitone
        - D: Channel Volume from 0 to 1: DAA = 0; D// = 1. Is only effective until a new note or a new D command is triggered on the same channel.
        - E: Jump to specified row. 2-char number only. EAA goes back to start (row 0), EAJ goes to the tenth row (row 9). (Bugged)
        - F: Jump XX steps forward. 2-char number only.
        - G: Set modulator, 1-char number only: GA sets the modulator to id 0, GB sets it to id 1, etc...

Syntax:

Some effects can use two chars as a single value:        But can also work using only the most significant char:

A <- Effect id                                           A <- Effect id
f <- Most significant char                               H <- Most significant char
a <- Least significant char                              Space or no fifth row

Other effects need two chars:

C <- Effect id
p <- Note to reach
g <- Speed

*/
ch3a = [
    'A       B   A       A   B   A   A       B   A       C C B       ',
    'X                               T                    -f-        '
],
ch3b = [
    'A BD  B A BA AB ',
    'V       T  V    '
],
ch1a = [
    'E E E E E E E E E E E F     EEE ',
    'S-G-L-S-G-L-S-L-S-H-L-S-    TSO-'
],
ch1b = [
    'E E E E E E E E E E E F         ',
    'S-G-N-S-G-N-S-N-S-H-L-S-        '
],
ch2a = [
    'G     G     G   G     G     G   ',
    'G-    G-    G-  H-    H-    H-  ',
    'G     G     G   G     G     G   ',
    'B     B     B   C     C     C   '
],
ch2b = [
    'G     G     G   G     G         ',
    'G-    G-    G-  H-    G-        ',
    'G     G     G   G     G         ',
    'D     D     D   E     D         '
],
ch1c = [
    'H   H   H   H   H       H   H                   H           H   ',
    'L   S   X   Z - Z       e - X               V S-a       c   X   ',
    '                CC          G               G   CC      CC  CC  ',
    '                aa          F               G   cc      aa  ZZ  ',
    '                GG                              OO      OO  OO  '
],
ch1d = [
    '        H   H           H   H       H       H           H       ',
    '    a Z-X - Z       X - a - a       c   a - c       c   e   h   ',
    '            G       G       CC      G   G   CC                  ',
    '            F       G       cc      F   G   ee                  ',
    '                            OO              OO                  '
],
ch1e = [
    'H                               H       H   H   H       H H H   ',
    'h                           h f e       j - j   c       j-j e   ',
    'CCCCCCCCCCCCG               G               D   CC        D CCC ',
    'jjjjjjjjjjjjF               G               T   ee        T ccc ',
    'FFFFFFFFFFFF                                    OO          LLL '
],
ch1f = [
    '    H H   H H H H   H   H H H H ',
    '    a-c   V-c V-c   c eca V X X ',
    '        D       C               ',
    '        A       e               ',
    '                O               '
],
ch1g = [
    'H H H H H   H H   H   H     H H ',
    'X e j e-j   o-l   l-  h     l m-',
    '        C     C  C    CG    G   ',
    '        l     m  l    jF    G   ',
    '        O     O  G    O         '
],
ch1h = [
    'H     H     H               H   H         H     H     H         ',
    'm     l -   h               e   f     h   c     c     a         ',
    'CC                G         G   G       G CC          G        G',
    'oo                F         G   F       G ee          F        G',
    'OO                                        OO                    '
],
ch1i = [
    'H                               H                   H H H   H   ',
    'c                           c a-X                   Z-Z a - c - ',
    'CC          G               G       G               G D         ',
    'ee          F               G       F               G T         ',
    'OO                                                              '
],
ch1j = [
    'H       H   H       H       H           H   H       H           ',
    'c       h - c     - e       e       f e c   a   -   Z           ',
    'CC          CC      CCG     G                       G          G',
    'ee          ee      ccF     G                       F          G',
    'OO          OO      LL                                          '
],



patternOffset = 0, // With this you can play the tune starting from any row.
stepOffset = 0,


// Sequence
sequence = [

    [ch1a, ch2a, ch3a],
    [ch1b, ch2b, ch3b],
    [ch1a, ch2a, ch3a],
    [ch1b, ch2b, ch3b],
    [ch1c, ch2a, ch3a],
    [ch1d, ch2b, ch3b],
    [ch1e, ch2a, ch3a],
    [ch1f, ch2b, ch3b],
    [ch1c, ch2a, ch3a],
    [ch1d, ch2b, ch3b],
    [ch1e, ch2a, ch3a],
    [ch1f, ch2b, ch3b],
    [ch1a, ch2a, ch3a],
    [ch1b, ch2b, ch3b],
    [ch1a, ch2a, ch3a],
    [ch1b, ch2b, ch3b],
    [ch1g, ch2a, ch3a],
    [ch1h, ch2b, ch3b],
    [ch1i, ch2a, ch3a],
    [ch1j, ch2b, ch3b],
    [ch1i, ch2a, ch3a],
    [ch1j, ch2b, ch3b],
    [ch1i, ch2a, ch3a],
    [ch1j, ch2b, ch3b],
    [ch1i, ch2a, ch3a],
    [ch1j, ch2b, ch3b],

]

),

b64ToInt = n => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(n),
semitonesToHz = s => 2 ** ((s + .376) / 12),
b64ToHz = n => semitonesToHz(b64ToInt(n)),

// Engine
processChannels = () => {

    let output = 0;
    patternsRow = int(((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset) / mainPatternSize) + patternOffset) % sequence.length;

    // Checks if there is a jump command
    for (let ch = 0; ch < sequence[patternsRow].length; ch ++) {

        let pattern = sequence[patternsRow][ch];

        if (pattern.length == 5){

            let step = int((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset) / (mainPatternSize / pattern[1].length)) % pattern[1].length;
            let effectValue = b64ToInt(pattern[3][step]) * 64 + b64ToInt(pattern[4][step]);
            switch (pattern[2][step]){
                case 'E':
                    stepOffset += (effectValue - patternsRow) * mainPatternSize - int((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset)) % mainPatternSize;
                    break;
            
                case 'F':
                    stepOffset += effectValue
                    break;
            }
        }
    }

    patternsRow = int(((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset) / mainPatternSize) + patternOffset) % sequence.length;

    for (let ch = 0; ch < sequence[patternsRow].length; ch ++) {

        let pattern = sequence[patternsRow][ch];
        let step = int((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset) / (mainPatternSize / pattern[1].length)) % pattern[1].length;

        if ((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset) / (mainPatternSize / pattern[1].length) % 1 < ((t - 1) / ((sampleRate * 60) / (tempo * stepsPerBeat)) + stepOffset) / (mainPatternSize / pattern[1].length) % 1 || t == 0){ // New step, t == 0 is a cheap fix but it works...
            channelsEffects[ch] = 0; // Not very elegant but makes sure the effect is cleared if there is nothing.

            if (pattern.length > 2){ // Effect set
                if (pattern[2][step] != ' '){

                    channelsEffects[ch] = [pattern[2][step], b64ToInt(pattern[3][step]) * 64]; // Effect id and value

                    if (pattern.length == 5 && pattern[4][step] != ' '){

                        channelsEffects[ch][1] += b64ToInt(pattern[4][step]); // Effect value (second char)
                    }
                }
            }
            if (pattern[1][step] == '-'){ // Release note

                channelsIsReleased[ch] = 1;
            } else {
                if (pattern[1][step] != ' '){ // New note

                    channelsFreqsSemitones[ch] = b64ToInt(pattern[1][step]);
                }
            }

            if (pattern[0][step] != ' ') { // Instrument trigger

                channelsInsts[ch] = insts[b64ToInt(pattern[0][step])];
                channelsCounters[ch] = 0;
                channelsFreqCounters[ch] = 0;
                channelsVolumes[ch] = 1;
                channelsIsReleased[ch] = 0;
                channelsReleaseT[ch] = 0;
            }
        }
        if (channelsIsReleased[ch]){

            channelsReleaseT[ch]++;
        }

        let modifier = 0;

        if (channelsInsts[ch].length == 2) { // Applies the frequency modifier if there is one

            modifier = mods[channelsInsts[ch][1]](channelsCounters[ch]);
        }
        channelsCounters[ch] ++;
        channelsFreqCounters[ch] += semitonesToHz(channelsFreqsSemitones[ch] + modifier);

        if (channelsEffects[ch] != 0){ // Effect handling

            let effectId = channelsEffects[ch][0];
            let effectValue = channelsEffects[ch][1];

            switch (effectId){

                case 'A':

                    channelsFreqsSemitones[ch] += effectValue / slideDivider;
                    break;

                case 'B':

                    channelsFreqsSemitones[ch] -= effectValue / slideDivider;
                    break;

                case 'C':

                    let targetNote = effectValue >> 6;
                    let incrementStep = (effectValue - targetNote * 64) / (slideDivider / 128);

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

                case 'D':

                    channelsVolumes[ch] = effectValue / 4095;
                    break;

                case 'G':

                    channelsInsts[ch][1] = effectValue >> 6;
                    break;
            }
        }
        if (!(pattern[0][step] == ' ' && pattern[1][step] == ' ' && channelsInsts[ch] == 0)){

            output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch]),channelsReleaseT[ch]) * channelsVolumes[ch];
        }
    }
    return output;
},
processChannels() / numberOfChannels * 1.5