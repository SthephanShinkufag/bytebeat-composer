/*
Alex Winston - Scroll Block, covered on bytebeat by Sychamis, May 2025.
Original: https://www.youtube.com/watch?v=Yas0wbcVxKw

Loops at 2:00.

An attempt to faithfully cover a simple-ish AY tune in bytebeat.
Also my sequencer is now able to change tempos and has stable jump commands!

This is meant to be played on https://dollchan.net/bytebeat in Floatbeat mode at 48000Hz.
*/

t || (

sampleRate = 48000,
tempo = 782.55,
stepsPerBeat = 6,
mainPatternSize = 256,
slideDivider = 2 ** 22,
numberOfChannels = 3,

tuneAcc = 0,

channelsInsts = Array(numberOfChannels).fill(0),
channelsCounters = Array(numberOfChannels).fill(0),
channelsFreqsSemitones = Array(numberOfChannels).fill(0),
channelsFreqCounters = Array(numberOfChannels).fill(0),
channelsEffects = Array(numberOfChannels).fill(0),
channelsVolumes = Array(numberOfChannels).fill(1),
channelsIsReleased = Array(numberOfChannels).fill(0),
channelsReleaseT = Array(numberOfChannels).fill(0),
channelsLastAcc = Array(numberOfChannels).fill(-.9e-9),

adsr = (a, d, s, r, t, rt) => (v = (w = (t - rt) / sampleRate / a) < 1 ? w : (x = 1 - (t - rt - sampleRate * a) / sampleRate / d * (1 - s)) > s ? x : s, !rt ? v : max(v - (rt / sampleRate / r) * v, 0)),

// Oscillators

sqr = (p, d) => (p % sampleRate / sampleRate > d) - .5,
tri = p => abs(p % sampleRate - sampleRate / 2) / sampleRate,
noi = p => (int(p + 9e4) ** 9 % 255 / 255 > .5) - .5,
saw = p => int(p % sampleRate / sampleRate * 16) ** 2 / 256,

// Frequency modulators

mods = [

    T => b64ToInt("ADHMPT"[T / 960 % 6 | 0]),
    T => b64ToInt("AEHMQT"[T / 960 % 6 | 0]),
    T => -(int(T / 960) * 960) / 600,
    T => -(int(T / 960) * 960) / 800,
    T => b64ToInt("tna"[min(T / 960 | 0, 2)]),
    T => b64ToInt("tnf"[min(T / 960 | 0, 2)]),
    T => b64ToInt("tni"[min(T / 960 | 0, 2)]),
    T => b64ToInt("tnV"[min(T / 960 | 0, 2)]),
    T => b64ToInt("tta"[min(T / 960 | 0, 2)]),
    T => b64ToInt("tti"[min(T / 960 | 0, 2)]),
    T => b64ToInt("UTAMYkw"[T / 960 < 2 ? T / 960 | 0 : ((T / 960 | 0) - 2) % 5 + 2]),
    T => b64ToInt("vthlo"[min(T / 960 | 0, 4)]),

],

// Instruments

sawBass = (p, m) => saw(p * m) * (sqr(p * 16, .5) > 0) - .5,
squareNoise = (p, nP) => sqr(p, .5) > 0 ? noi(nP) : -.5,
kickSawBass = (p, m, T) => [squareNoise(p * 16, T / 2), sqr(p * 16, .5), sawBass(p, m)][min(int(T / 960), 2)],
squareNoiseIns = (p, T) => [squareNoise(p * 64, T), sqr(p * 64, .5)][+(T / 960 > 1)],

insts = [

    [(T, p, n, rT) => sawBass(p, 48.75)],
    [(T, p, n, rT) => sawBass(p, 32.3)],
    [(T, p, n, rT) => sawBass(p, 48.5)],
    [(T, p, n, rT) => squareNoiseIns(p, T) * adsr(0, 0, 1, 1, T, T)],
    [(T, p, n, rT) => squareNoiseIns(p, T) * .5],
    [(T, p, n, rT) => squareNoiseIns(p, T) * adsr(0, 0, .5, .5, T, rT), 0],
    [(T, p, n, rT) => squareNoiseIns(p, T) * adsr(0, 0, .5, .5, T, rT), 1],
    [(T, p, n, rT) => [squareNoise(p * 64, T / 2), sqr(p * 64, .5)][+(T / 960 > 1)] * adsr(0, 0, 1, 1, T, T), 2],
    [(T, p, n, rT) => noi(T) * adsr(.5, 0, 1, 0, T, rT)],
    [(T, p, n, rT) => [squareNoise(p * 40, T / 2), sqr(p * 40, .5), sqr(p * 40, .5) > 0 ? noi(T / 4) : -.5][min(int(T / 960), 2)] * adsr(0, 0, 1, .35, T, T), 3],
    [(T, p, n, rT) => kickSawBass(p, 48.75, T), 4],
    [(T, p, n, rT) => kickSawBass(p, 32.3, T) , 5],
    [(T, p, n, rT) => kickSawBass(p, 48.5, T) , 6],
    [(T, p, n, rT) => kickSawBass(p, 64.4, T) , 7],
    [(T, p, n, rT) => kickSawBass(p, 48.75, T), 8],
    [(T, p, n, rT) => kickSawBass(p, 48.5, T) , 9],
    [(T, p, n, rT) => [squareNoise(p * 16, T), sqr(p * 16, .5), squareNoise(p * 128, T)][min(int(T / 960), 2)] * adsr(0, 0, 1, .6, T, T), 10],
    [(T, p, n, rT) => sqr(p * 128, .5) * (rT > 0 ? .65 : 1)],
    [(T, p, n, rT) => squareNoiseIns(p, T) * adsr(0, 0, 1, 1, T, T), 2],
    [(T, p, n, rT) => [squareNoise(p * 16, T / 2), sqr(p * 16, .5) * .95, sqr(p * 64, .5) > 0 ? noi(T / 2) * .2 : -.1, sqr(p * 64, .5) * .2][min(T / 960 | 0, 3)], 11],
    [(T, p, n, rT) => [squareNoise(p * 512, T), sqr(p * 256, .5), sqr(p * 128, .5)][min(T / 960 | 0, 2)]],
    [(T, p, n, rT) => squareNoiseIns(p, T) * 1],
    [(T, p, n, rT) => [squareNoise(p * 512, T), sqr(p * 256, .5), sqr(p * 512, .5), sqr(p * 128, .5)][min(T / 960 | 0, 3)]],
    [(T, p, n, rT) => sqr(p * 128, .5) * .65],
    [(T, p, n, rT) => sqr(p * 128, .5) * adsr(0, 0, .5, .3, T, T)],
    [(T, p, n, rT) => [squareNoise(p * 32, T), sqr(p * 32, .5), sqr(p * 32, .5) * .5][min(T / 960 | 0, 2)]],
    [(T, p, n, rT) => [squareNoise(p * 32, T) * .75, sqr(p * 32, .5) * .75, sqr(p * 32, .5) * .5][min(T / 960 | 0, 2)]],
    [(T, p, n, rT) => kickSawBass(p, 32.5, T) , 7],
],

/*
Pattern:

- First row: When to trigger an instrument, index in base64
- Second row: Notes in base64, '-' to stop the current note

- Effects:

    - Third row: Effect id in base64
    - Fourth row: First char of effect value
    - Fifth row: Second char of effect value (not always needed)

        - A: Pitch slide up (in (1 / slideDivider) of a semitone) so AAA is 0 semitone per cycle, AAB is 
                1 / slideDivider and A// is a lot.
        - B: Picth slide down; same as A except it slides down.
        - C: Picth slide up/down (auto) until target note is reached. First char is note and second char is speed. 
            Increases / decreases pitch in ([second char value] / (slideDivider / 128) of a semitone
        - D: Channel Volume from 0 to 1: DAA = 0; D// = 1. Is only effective until a new note or a new D command
                is triggered on the same channel.
        - E: Jump to specified row. 2-char number only. EAA goes back to start (row 0), EAJ goes to the tenth row
                (row 9).
        - F: Jump XX steps forward. 2-char number only.
        - G: Set modulator, 1-char number only: GA sets the modulator to id 0, GB sets it to id 1, etc...
        - H: Change number of steps per beat. 2-char number only.

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
mute = [
    'A',
    'A',
    'D',
    'A' 
],
ch1a = [
    'F   F   G   G   ',
    'a  -f  -i  -h  -' 
],
ch1b = [
    'F       F       G       G     I ',
    'a     - f     - i      -h   ioA ' 
],
ch1c = [
    'F   F   G   G   ',
    'a  -f  -i  -h  -',
    'H               ',
    'A               ',
    'G               '
],
ch1d = [
    'F       F       G       G   HGTT',
    'a     - f     - i     - h   MhAA' 
],
ch1e = [
    'F       F       G       G SS HHH',
    'a     - f     - i     - h YX UTP' 
],
ch1f = [
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'ypmypmtp3tr3trutuuiupirptrhtohpo',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'wgwgwgwgwgwgwgwgwgwgwgwgwgwgwgwg'
],
ch2a = [
    'ABCB',
    'afih',
    'H   ',
    'A   ',
    'F   ',
],
ch2b = [
    'A       B       C       B   HHHH',
    'a       f       i       h   YYYY',
    '                H   H   H    D  ',
    '                A   A   A    g  ',
    '                E   D   F       '
],
ch2c = [
    'K   J O L L J L M   J P N b J NS',
    'A   Z A A A Z A A   Z A A A Z AY'
],
ch2d = [
    'K JOLLJLM JPNbJN',
    'A ZAAAZAA ZAAAZA'
],
ch2e = [
    'K   J O L L J L M   J P N b J NH',
    'A   Z A A A Z A A   Z A A A Z AY'
],
ch2f = [
    'K   J O L L J L M   J P N b J JJ',
    'A   Z A A A Z A A   Z A A A Z ZZ'
],
ch3a = [
    'DEDEDEDEDEDEDEDEDEDEDEDEDEDEDEDE',
    'aVhaahdafdmffmgfhgfhdffdifhihhVh'
],
ch3h = [
    'VEVEVEVEVEVEVEVEVEVEVEVEVEVEVEVE',
    'aVhaahdafdmffmgfhgfhdffdifhihhVh'
],
ch3b = [
    'VEVEVEVEVEVEVEVEVEVEVEVEVEVEVEVE',
    'aVhaahdafdmffmgfhgfhdffdifmiompo'
],
ch3c = [
    'Q     R R   R R R RR  R R       ',
    'a     Y-d adfddfidhihiihhihihihi',
    '      CC  D  D D D  D  D D D D D',
    '      aa  g  g g g  g  g g L I G',
    '      LL                        '
],
ch3d = [
    '     YX R   R R R RR  R R   R R ',
    'hihihYY d adfddfmdihihfhd adfddf',
    ' D D  CC  D  D D D  D  D  D  D D',
    ' F E  aa  g  g g g  g  g  g  g g',
    '      LL                        '
],
ch3e = [
    '     YX R   R R R RR  R R R R   ',
    'hihihYY d adfddfmdihihfhdhahY  Z',
    ' D D  CC  D  D D D  D  D D DCCD ',
    ' F E  aa  g  g g g  g  g g gaag ',
    '      LL                    LL  '
],
ch3f = [
    'VEVEVEVEVEVEVEVEVEVEVEVEVEVEVEV ',
    'aVhaahdafdmffmgfhgfhdffdiffihfk ',
    '                               C',
    '                               m',
    '                               L'
],
ch3g = [
    'V  V VUUUUUUUUUUUUUUUUUUUUUUUUUU',
    'm  m mVOdVcdcdcdhcfhfhffdfadcaca',
    ' BBDBD D D  DD D D  DD D D D DDD',
    ' uuvuZ g g  gg g g  gg g g g vgZ'
],
ch3i = [
    'Q     UUUUUUUUUUUUUUUUUUUUUUUUUU',
    'a     VOdVcdcdcdhcfhfhffhhffhfhf',
    '       D D  DD D D  DD D D D DDD',
    '       g g  gg g g  gg g g g vgZ'
],
ch3j = [
    'Q     UUUUUUUUUUUUUUUUUUUUUUUUUU',
    'a     VOdVcdcdcdhcfhfhffdfadcaca',
    '       D D  DD D D  DD D D D DDD',
    '       g g  gg g g  gg g g g vgZ'
],
ch3k = [
    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU',
    'OJVOOVROTRaTTaUTVUTVRTTRWTVWVVJV',
    ' D D D D D D D D D D D D D D D D',
    ' g g g g g g g g g g g g g g g g'
],
ch3l = [
    'UUUUUUUUUUUUUUUUUUUUUUUUUUWWW V ',
    'OJVOOVROTRaTTaUTVUTVRTTRWTTWV k ',
    ' D D D D D D D D D D D D D D   C',
    ' g g g g g g g g g g g g g g   m',
    '                               T'
],
ch3m = [
    'Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     Z     a     ',
    'y hmptp hmptm hmpty hmptp hmptm hmptt hmptp hmpt3 mruyt mruyr mruy3 mruyt mruyr mruyu mruyt mruyu puy1u puy1i puy1u puy1p puy1i puy1r puy1p puy1t otx0r otx0h otx0t otx0o otx0h otx0p otx0o otx0'
],
ch3n = [
    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU',
    'OJVOOVROTRaTTaUTVUTVRTTRWTaWcadc',
    ' D D D D D D D D D D D D D D D D',
    ' g g g g g g g g g g g g g g g g'
],
loop = [
    ' ',
    ' ',
    'E',
    'A',
    'I'
],
tuneAcc = 0,

// Sequence
sequence = [

    [ch1a, ch2a, ch3a],
    [ch1a, ch2a, ch3a],
    [ch1a, ch2a, ch3a],
    [ch1b, ch2b, ch3a],
    [ch1c, ch2c, ch3h],
    [ch1c, ch2c, ch3h],
    [ch1c, ch2c, ch3h],
    [ch1c, ch2c, ch3b],
    [ch1c, ch2d, ch3c],
    [ch1c, ch2d, ch3d],
    [ch1c, ch2d, ch3c],
    [ch1d, ch2e, ch3e],
    [ch1c, ch2c, ch3h],
    [ch1c, ch2c, ch3h],
    [ch1c, ch2c, ch3h],
    [ch1e, ch2f, ch3f],
    [ch1c, ch2c, ch3g],
    [ch1c, ch2c, ch3i],
    [ch1c, ch2c, ch3j],
    [ch1c, ch2c, ch3i],
    [ch1c, ch2c, ch3k],
    [ch1c, ch2c, ch3k],
    [ch1c, ch2c, ch3k],
    [ch1e, ch2f, ch3l],
    [ch1f, ch2c, ch3m],
    [ch1f, ch2c, ch3m],
    [ch1f, ch2c, ch3m],
    [ch1f, ch2c, ch3m],
    [ch1c, ch2c, ch3j],
    [ch1c, ch2c, ch3i],
    [ch1c, ch2c, ch3j],
    [ch1c, ch2c, ch3i],
    [ch1c, ch2c, ch3k],
    [ch1c, ch2c, ch3k],
    [ch1c, ch2c, ch3k],
    [ch1c, ch2c, ch3n],
    [loop]
    
]

),

b64ToInt = n => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(n),
semitonesToHz = s => 2 ** ((s + .6) / 12),
b64ToHz = n => semitonesToHz(b64ToInt(n)),

// Engine
processChannels = () => {

    let output = 0;
    patternsRow = int(tuneAcc / mainPatternSize) % sequence.length;

    // Checks if there is a jump or tempo command
    for (let ch = 0; ch < sequence[patternsRow].length; ch ++) {

        let pattern = sequence[patternsRow][ch];

        if (pattern.length == 5){

            let step = int((tuneAcc % mainPatternSize) / (mainPatternSize / pattern[1].length));
            let effectValue = b64ToInt(pattern[3][step]) * 64 + b64ToInt(pattern[4][step]);
            switch (pattern[2][step]){
                case 'E':
                    tuneAcc = effectValue * mainPatternSize;
                    break;
            
                case 'F':
                    tuneAcc += effectValue
                    break;

                case 'H':
                    stepsPerBeat = effectValue;
                    break;
            }
        }
    }

    patternsRow = int(tuneAcc / mainPatternSize) % sequence.length;

    for (let ch = 0; ch < sequence[patternsRow].length; ch ++) {

        let pattern = sequence[patternsRow][ch];
        let step = int((tuneAcc % mainPatternSize) / (mainPatternSize / pattern[1].length));

        if (((tuneAcc % mainPatternSize) / (mainPatternSize / pattern[1].length)) % 1 < ((channelsLastAcc[ch] % mainPatternSize) / (mainPatternSize / pattern[1].length)) % 1 || t == 0){ // New step
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
        channelsLastAcc[ch] = tuneAcc;
        if (!(pattern[0][step] == ' ' && pattern[1][step] == ' ' && channelsInsts[ch] == 0)){

            output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch]),channelsReleaseT[ch]) * channelsVolumes[ch];
        }
    }
    tuneAcc += (tempo * stepsPerBeat) / (sampleRate * 60);
    return output;
},
processChannels() / numberOfChannels * 1.5