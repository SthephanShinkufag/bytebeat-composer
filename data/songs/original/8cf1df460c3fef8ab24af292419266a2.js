/*
Harold Faltermeyer - Axel F, covered on bytebeat without samples by Sychamis, January 2025.

It was a pain to emulate all the instruments, but I got something I'm satisfied with using different ways of synthesizing sounds.
Patterns are scrambled around in the sequence to avoid issues where instruments played on previous patterns will continue to play if a following one doesn't trigger a new instrument instantly.

This is meant to be played on https://dollchan.net/bytebeat in floatbeat mode at 48000Hz.
*/

t || (

sampleRate = 48000,
tempo = 60,
stepsPerBeat = 16,
mainPatternSize = 128,
slideDivider = 2 ** 22,
numberOfChannels = 17,

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

synthWf = (nT, T) => (nT % sampleRate / sampleRate > (.5 - T / 4e5)) * .4 + (nT % sampleRate / sampleRate) * .6 -.5,
synthWf2 = (nT, T) => (nT % sampleRate / sampleRate > (.5 - T / 35e3)) -.5,
synthWf3 = (nT, T) => nT % sampleRate / sampleRate -.5,
synth = (nT, T) => (synthWf(nT, T) + synthWf(nT * 1.0025, T) * .5 + synthWf(nT * .9981, T) * .5 + synthWf(nT * 1.0017, T) + synthWf(nT * .9987, T)) / 4,
synth2 = (nT, T) => (synthWf3(nT, T) + synthWf3(nT * 1.0025, T) * .5 + synthWf3(nT * .9981, T) * .5 + synthWf3(nT * 1.0017, T) + synthWf3(nT * .9987, T)) / 4,
noise = nT => int(nT) ** 9 % 255 / 255 - .5,
bass = (nT, T) => sin((nT * PI) + max(1, (4 - ((T / 80) ** 2) / 4e3)) * sin(nT * PI / 2)),
sine = nT => sin(nT * PI),
karplusStrong = (n, d, T) => (f = round(sampleRate / n), T == 1 ? b = Array.from({length: f}, () => random()) : 0,  (b[T % f] = b[T % f] * d + b[(T - 1) % f] * (1 - d)) * 2 - 1),
tri = nT => abs(nT % sampleRate - sampleRate / 2) / sampleRate * 2 - .5,

// Frequency modulators

mods = [

    T => T / 768,
    T => -cbrt(T) * 3.8,
    T => -cbrt(T) * 2.75,
    T => sin(T / 1200) * .2,
    T => -cbrt(T) * 1

],

// Instruments
insts = [

    [(T, nT, n, rT) => synth(nT * 64, T) * adsr(.04, .04, .8, .2, T, rT)],
    [(T, nT, n, rT) => synth(nT * 64, T) * adsr(.04, .04, .8, .2, T, rT) / 3],
    [(T, nT, n, rT) => noise(nT / 64) * adsr(1, .2, 0, 4, T, rT), 0],
    [(T, nT, n, rT) => bass(nT / 256 / 1.46485, T) * adsr(0, .6, 0, 0, T, rT) / 2],
    [(T, nT, n, rT) => noise(nT / 64) * adsr(1, .2, 0, 0, T, rT) / 3, 0],
    [(T, nT, n, rT) => noise(nT) * adsr(.035, .035, 0, 0, T, rT) / 2.5],
    [(T, nT, n, rT) => (noise(nT / 5) + noise(nT / 5.01)) / 2.5 * adsr(.02, .1, 0, 0, T, rT)],
    [(T, nT, n, rT) => sine(nT / 16) * adsr(0, .3, 0, 0, T, rT) / 1.5, 1],
    [(T, nT, n, rT) => sine(nT / 32) * adsr(0, .3, 0, 0, T, rT) + (noise(T / 2) * adsr(.01, .32, 0, 0, T, rT) ** 2) / 1.5, 2],
    [(T, nT, n, rT) => synthWf2(nT * 64, T) * adsr(.02, .08, .0, .15, T, rT) / 3],
    [(T, nT, n, rT) => synthWf2(nT * 64, T) * adsr(.02, .08, .0, .15, T, rT) / 8],
    [(T, nT, n, rT) => karplusStrong(n * 256, 0.5, T) * adsr(0, .1, .0, 0, T, rT) / 2.5],
    [(T, nT, n, rT) => synth2(nT * 128, T) * adsr(.04, 3, 0, 1.25, T, rT) / 1.5],
    [(T, nT, n, rT) => (sine(nT / 256 / 1.46485) * adsr(0, .5, 0, 0, T, rT) + sine(nT / 64 / 1.46485) * adsr(0, .1, 0, 0, T, rT) / 2 + sine(nT / 16 / 1.46485) * adsr(0, .025, 0, 0, T, rT) / 4) / 2.25, 3],
    [(T, nT, n, rT) => ((sine(nT / 256 / 1.46485) + sine(nT / 128 / 1.46485)) * adsr(0, .5, 0, 0, T, rT) + (sine(nT / 64 / 1.46485) + sine(nT / 32 / 1.46485)) * adsr(0, .1, 0, 0, T, rT) / 2 + (sine(nT / 16 / 1.46485) + sine(nT / 8 / 1.46485)) * adsr(0, .025, 0, 0, T, rT) / 4) / 4.5, 3],
    [(T, nT, n, rT) => tri(nT * 64) * adsr(.0, .3, 0, 0, T, rT) / 1.5],
    [(T, nT, n, rT) => (sine(nT / 128 / 1.46485) * adsr(0, .75, 0, 0, T, rT) / 2 + sine(nT / 32 / 1.46485) * adsr(0, .15, 0, 0, T, rT) / 2 + sine(nT / 8 / 1.46485) * adsr(0, .05, 0, 0, T, rT) / 4) / 3],
    [(T, nT, n, rT) => synth2(nT * 128, T) * adsr(.05, .05, .9, .1, T, rT) / 2],
    [(T, nT, n, rT) => ((sine(nT / 128) + sine(nT / 128 * 1.01)) * adsr(.0, .3, 0, 0, T, rT) + ((noise(T / 2) + noise(T / 2.002)) * adsr(.01, .32, 0, 0, T, rT) ** 2) / 1.5) / 1.5, 4],

],

/*
Pattern:

- First row: When to trigger an instrument, index in base64
- Second row: Notes in base64, '-' to stop the current note

- Effects:

    - Third row: Effect id in base64
    - Fourth row: First char of effect value
    - Fifth row: Second char of effect value (not always needed)

        - A: Pitch slide up (in (1 / slideDivider) of a semitone) so AAA is 0 semitone per cycle, AA1 is 1 / slideDivider and A// is a lot.
        - B: Picth slide down; same as A except it slides down.
        - C: Picth slide up/down (auto) until target note is reached. First char is note and second char is speed. 
            Increases / decreases pitch in ([second char value] / (slideDivider / 128) of a semitone
        - D: Channel Volume from 0 to 1: DAA = 0; D// = 1. Is only effective until a new note or a new D command is triggered on the same channel.
        - E: Jump to specified row. 2-char number only. EAA goes back to start (row 0), EAJ goes to the tenth row (row 9). (Bugged)
        - F: Jump XX steps forward. 2-char number only.

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

blank = [
    ' ',
    ' '
],
s1 = [
    'A   A  A AA A A A   A  A AA A A A A A AA AA A A                 ',
    'd - g -d di d b d - k -d dl k g d k p db  Y f d      -          '
],
s2 = [
    '  B   B  B BB B B B   B  B BB B B B B B BB BB B B               ',
    '  d - g -d di d b d - k -d dl k g d k p db  Y f d      -        '
],
n1 = [
    '                                                       C        ',
    '                                                       A        '
],
n2 = [
    '                                                         E      ',
    '                                                         A      '
],
n3 = [
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'puiyhvnpuipwnaayqhsdnyuogfavbayupihgenwgazuyiopswgheupiovauhezbn'
],
n4 = [
    '                                                         G G GGG',
    '                                                         A      '
],
n10 = [
    '     C          ',
    '     A          '
],
n8 = [
    '           E                    ',
    '           A                    '
],
n9 = [
    '      E         ',
    '      A         '
],
b1 = [
    'D   D  D DD D D D   D    DD D D D   D  D DD D D D        DD D D ',
    'F   R  D PB M D F   R    FM P R B   N  D PB D F R        PM K I ',
    '                                                  CCCC          ',
    '                                                  FFFF          ',
    '                                                  TTTT          '
],
b2 = [
    'D   D  D DD D D D   D  D DD D D D                               ',
    'F   R  D PB M D F   R  D PB M D F                               '
],
b3 = [
    'D   D  D DD D D D   D    DD D D D   D  D DD D D D        DD D D ',
    'F   R  D PB M D F   R    FM P R B   N  D PB D F R        FF F H ',
    '                                                  CCCC          ',
    '                                                  FFFF          ',
    '                                                  TTTT          '
],
b4 = [
    'D   D  D DD D D D   D           D   D  D DD D D D   D    DD D D ',
    'I      G IG I D F               G      F GF G B D        BD G D ',
],
b5 = [
    'D   D  D DD D D D   D        DD D   D  D DD D D D   D    DD D D ',
    'I      G IG I D F            DF G      F GF G B D        BD G D ',
],
b6 = [
    'D   D  D DD D D D   D        DD D   D  D DD D D D   D        DD ',
    'I      G IG I D F            DF G      F GF G B D            BD ',
],
jp = [
    '  ',
    '  ',
    'F ',
    'B ',
    'A '
],
k1 = [
    'H      H HH   H H        HH   H H   H  H HH H H H   H    HH H H ',
    'A                                                               '
],
n5 = [
    'GGGGGG                       GGGGGGGGGG                  G G GGG',
    'A                            A                           A      ',
    'DDDDDD                           DDDDDD                         ',
    '5ymaPD                           5ymaPD                         '
],
n6 = [
    'GGGGGG                                                          ',
    'A                                                               ',
    'DDDDDD                                                          ',
    '5ymaPD                                                          '
],
n7 = [
    'GGGGGG                       GGGGGGGGGG                     GGGG',
    'A                            A                              A   ',
    'DDDDDD                           DDDDDD                         ',
    '5ymaPD                           5ymaPD                         '
],
k2 = [
    'H      H HH   H H        HH   H H      H HH   H H        HH   H ',
    'A                               A                               '
],
k3 = [
    'H      H HH   H H        HH   H H                               ',
    'A                                                               ',
    '                                                E               ',
    '                                                A               ',
    '                                                J               '
],
sn1 = [
    ' I I I I I I I I',
    ' A       A      '
],
sn2 = [
    ' I I I I        ',
    ' A              '
],
s2ch1 = [
    '  J J JJ J JJ J   J J JJ JJ J     J J J JJ J JJJJ J J J JJ J    ',
    '  d    f    d     d    f  d       Z      b        d     bd      '
],
s2ch2 = [
    '  J J JJ J JJ J   J J JJ JJ J     J J J JJ J JJJJ J J J JJ J    ',
    '  h    i          h    i    h     d      f        h     fh      '
],
s2ch3 = [
    '  J J JJ J JJ J   J J JJ JJ J     J J J JJ J JJJJ J J J JJ J    ',
    '  k    n    m     k    n  m k     g      i        k     ik      '
],
s2che1 = [
    '    K K KK K KK K   K K KK KK K     K K K KK K KKKK K K K KK K  ',
    '    d    f    d     d    f  d       Z      b        d     bd    '
],
s2che2 = [
    '    K K KK K KK K   K K KK KK K     K K K KK K KKKK K K K KK K  ',
    '    h    i          h    i    h     d      f        h     fh    '
],
s2che3 = [
    '    K K KK K KK K   K K KK KK K     K K K KK K KKKK K K K KK K  ',
    '    k    n    m     k    n  m k     g      i        k     ik    '
],
kp1 = [
    'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'npvqxmlkztrpoiknwqzzmk9kl8m870mlk784typopn/54qmlppkownrtylrtky23'
],
kp2 = [
    'LLLLLLLLLLLLLLLLLLLL L L LLLLLLLLLLLLLLLLLLLLLLLLLLL L L LLLLLLL',
    'npvqxmlkztrpoiknwqz9 z o lm870mlk784typopn/54qmlppk9 z o lrtky23'
],
s3 = [
    '                               M',
    '                               k'
],
s4 = [
    '                                          M',
    '                                          i'
],
s5 = [
    '                                                               M',
    '                                                               d'
],
s6 = [
    'M',
    'p'
],
s7 = [
    '   M                            ',
    '   n                            ',
],
s8 = [
    '       M                        ',
    '       k                        '
],
s9 = [
    '           M                    ',
    '           i                    '
],
s10 = [
    '       M        ',
    '       g        '
],
s11 = [
    ' M',
    ' d'
],
s12 = [
    'N  N  N  N  N N N  N  N  N  NNN N  N  N  N  N N N  N  N  N  N N ',
    'g  b  g  b  g b g  b  g  b  g b g  b  g  b  g b g  b  g  b  g b '
],
s13 = [
    'N    N     N   NN    N     N    N    N     N    N    N     N    ',
    'U              PR               S               P               '
],
s14 = [
    'O  O  O  O  O O O  O  O  O  OOO O  O  O  O  O O O  O  O  O  O O ',
    'g  b  g  b  g b g  b  g  b  g b g  b  g  b  g b g  b  g  b  g b '
],
s16 = [
    '                                R               R               ',
    '                                K               I              -'
],
s17 = [
    '                                R                               ',
    '                                N                              -'
],
s18 = [
    '                                R                               ',
    '                                P                              -'
],
s19 = [
    '                                R                               ' ,
    '                                U                              -'
],
tr1 = [
    'P P  P  P   P   P P  P  P   P   P P  P  P   P   P P  P  P   P   ',
    'n i     n   i   n i     n   i   n i     n   i   n i     n   i   '
],
tr2 = [
    ' P P   P  P   P  P P   P  P   P  P P   P  P   P  P P   P  P   P ',
    ' k g   k      g  k g   k      g  k g   k      g  k g   k      g '
],
s15 = [
    'Q  Q  Q  Q  Q Q Q  Q  Q  Q  Q Q Q  Q  Q  Q  Q Q Q  Q  Q  Q  Q Q ',
    'g                                                           i k '
],
sn3 = [
    '                                                 S SS  S S SS SS',
    '                                                 O     L   J  B '
],


patternOffset = 0, // With this you can play the tune starting from any row.
stepOffset = 0,


// Sequence
sequence = [

    [s1, s2],
    [s1, s2, n1, n2],
    [b1, n3, n4, blank],
    [b1, n3, n5, k1],
    [b1, s1, s2, n3, n4, n6, k2, sn1],
    [b1, s1, s2, n3, n4, n6, k2, sn1],
    [b1, n3, n4, n6, k2, sn1, s2ch1, s2ch2, s2ch3, s2che1, s2che2, s2che3, kp1],
    [s3, s4, s5, b1, n3, n4, n6, k2, sn1, s2ch1, s2ch2, s2ch3, s2che1, s2che2, s2che3, kp1],
    [blank, blank, blank, b2, kp1, sn2, k3, n7, n10, n8, n9],
    [b1, kp2],
    [b1, n3, s7, s6, kp2, s8, s9, s10, s11],
    [b1, n3, kp2, s1, s2, k1, n4],
    [b3, n3, kp2, s1, s2, k1, sn1, n7],
    [b4, s12, s13, n6, kp1, k2, sn1, n3],
    [b5, s12, s13, s14, n6, kp1, k2, sn1, n3],
    [b4, s12, s13, s14, n6, kp1, k2, sn1, n3, tr1, tr2],
    [b6, s12, s13, s14, n6, kp1, k2, sn1, n3, tr1, tr2, s15],
    [jp, b4, tr1, tr2, s12, s13, s14, s15, n3, sn3, kp1, k2, sn1, s16, s17, s18, s19],
    [b1, n3, k2, sn1, s2ch1, s2ch2, s2ch3, s2che1, s2che2, s2che3, kp1],
    [b1, n3, n4, k2, sn1, s2ch1, s2ch2, s2ch3, s2che1, s2che2, s2che3, kp1],
    [b1, n3, n5, k2, sn1, s2ch1, s2ch2, s2ch3, s2che1, s2che2, s2che3, kp1, jp],
    [b1, s1, s2, n3, n5, k2, sn1, kp1],
    [b1, s1, s2, n3, n5, k2, sn1, kp1],
    [n6]

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
            if (pattern[1][step] == '-'){ // Stop note

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
            }
        }
        if (!(pattern[0][step] == ' ' && pattern[1][step] == ' ' && channelsInsts[ch] == 0)){

            output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch]),channelsReleaseT[ch]) * channelsVolumes[ch];
        }
    }
    return output;
},processChannels() / numberOfChannels * 4.5