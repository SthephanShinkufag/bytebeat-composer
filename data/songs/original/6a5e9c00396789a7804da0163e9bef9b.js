/*
Drax - Happy Happy Christmas, covered on bytebeat by Sychamis, December 2024.

Original on youtube: https://www.youtube.com/watch?v=UHUZiVXdaUI
Its source file here: https://modarchive.org/index.php?request=view_by_moduleid&query=37049

Made in my usual audio engine, with some improvements.

This is meant to be played on https://dollchan.net/bytebeat in floatbeat mode at 48000Hz.
*/
t || (

sampleRate = 48000,
b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
tempo = 187.5,
stepsPerBeat = 4,
mainPatternSize = 48,
slideDivider = 2 ** 22,
numberOfChannels = 9,

channelsInsts = Array(numberOfChannels).fill(0),
channelsCounters = Array(numberOfChannels).fill(0),
channelsFreqsSemitones = Array(numberOfChannels).fill(0),
channelsFreqCounters = Array(numberOfChannels).fill(0),
channelsEffects = Array(numberOfChannels).fill(0),
channelsVolumes = Array(numberOfChannels).fill(1),

// Oscillators

sine = (nT) => sin(nT * PI),
bass = (nT) => sin(nT * PI) + sin(nT * PI * 2) / 2,


// Frequency modulators

mods = [

    T => sin(T / 640) / 5,

],


// Instruments
insts = [

    [(T, nT, n) => sine(nT / 128) * 46 / 64, 0],
    [(T, nT, n) => bass(nT / 1024)],
    [(T, nT, n) => sine(nT / 128) * 7 / 64, 0],
    [(T, nT, n) => sine(nT / 128) * 5 / 64, 0],
    [(T, nT, n) => sine(nT / 128) * 1 / 64, 0],
    [(T, nT, n) => sine(nT / 64) * 6 / 64, 0],
    [(T, nT, n) => sine(nT / 128) * 26 / 64, 0],

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

lead1 = [
    'A AA AA  A  A  A  A  A  ',
    'f hj kk  f  m  r  k  j  ',
    ' D  D CD  D CD  D CD   D',
    ' M  M mM  M oM  M mM   M',
    '      R     R     R     '
],
lead1Echo1 = [
    ' C CC CC  C  C  C  C  C ',
    ' f hj km  f  o  r  m  j ',
    '  D  D  D  D  D  D  D   ',
    '  M  M  M  M  M  M  M   '
],
lead1Echo2 = [
    '  C CC CC  C  C  C  C  C',
    '  f hj km  f  o  r  m  j',
    'D  D  D  D  D  D  D  D  ',
    'M  M  M  M  M  M  M  M  '
],
lead2 = [
    'A AA AA AA AA AA AA  A  ',
    'k jk mj hf ah fh jf  a  ',
    ' D  D  D  D  D  D CD  D ',
    ' M  M  M  M  M  M hM  M ',
    '                  R     '
],
lead2Echo1 = [
    ' C CC CC CC CC CC CC  C ',
    ' k jk mj hf ah fh jh  a ',
    'D D  D  D  D  D  D  D  D',
    'M M  M  M  M  M  M  M  M'
],
lead2Echo2 = [
    '  C CC CC CC CC CC CC  C',
    '  k jk mj hf ah fh jh  a',
    ' D D  D  D  D  D  D  D  ',
    ' M M  M  M  M  M  M  M  '
],
leadO2 = [
    'F FF FF FF FF FF FF  F  ',
    'k jk mj hf ah fh jf  a  ',
    ' D  D  D  D  D  D CD  D ',
    ' M  M  M  M  M  M hM  M ',
    '                  R     '
],
lead3 = [
    'A   A A   A A     A   A A   A A   A A         A ',
    'c   a c   e f     a   j h kjh h   f g         a ',
    '  D     D     D     D  DC           CCC     D   ',
    '  M     M     M     M  Mj           hhh     M   ',
    '                        R           FFF         '
],
lead3Echo1 = [
    '  C   C C   C C     C   C C   C C   C C         ',
    '  c   a c   e f     a   j j kjh h   f h         ',
    '    D     D     D     D  D                      ',
    '    M     M     M     M  M                      ',
],
lead3Echo2 = [
    '    C   C C   C C     C   C C   C C   C C       ',
    '    c   a c   e f     a   j j kjh h   f h       ',
    '      D     D     D     D  D                    ',
    '      M     M     M     M  M                    '
],
lead4 = [
    'A   A A   A A   A A   A A A A A A A A   AAA     ',
    'k   j h   a f   h j   f e a V a e h f   jmr     ',
    '  D     D     D     D                      D    ',
    '  M     M     M     M                      M    '
],
lead4Echo1 = [
    '  C   C C   C C   C C   C C C C C C C C   CCC   ',
    '  k   j h   a f   h j   f e a V a e h f   jmr   ',
    'D   D     D     D     D                      D  ',
    'M   M     M     M     M                      M  '
],
lead4Echo2 = [
    '    C   C C   C C   C C   C C C C C C C C   CCC ',
    '    k   j h   a f   h j   f e a V a e h f   jmr ',
    '  D   D     D     D     D                      D',
    '  M   M     M     M     M                      M'
],
lead6 = [
    'A   A A   A A     A     A     A     A     A     ',
    'f   h j   k k     f     m     r     k     j     ',
    '  D     D  DC D     D   C D     D   C D       D ',
    '  M     M  Mm M     M   o M     M   m M       M ',
    '            R           R           R           '
],
leadO6 = [
    'F   F F   F F     F     F     F     F     F     ',
    'f   h j   k k     f     m     r     k     j     ',
    '  D     D  DC D     D   C D     D   C D       D ',
    '  M     M  Mm M     M   o M     M   m M       M ',
    '            R           R           R           '
],
lead7 = [
    'A   A A   A A     A   A A   A A   A A         A ',
    'c   a c   e f     a   j h kjh f   f f         a ',
    '  D     D     D     D  DC     C     C       D   ',
    '  M     M     M     M  Mj     h     h       M   ',
    '                        R     R     R           '
],
leadO7 = [
    'F   F F   F F     F   F F   F F   F F         F ',
    'c   a c   e f     a   j h kjh f   f f         a ',
    '  D     D     D     D  DC     C     C       D   ',
    '  M     M     M     M  Mj     h     h       M   ',
    '                        R     R     R           '
],
lead8 = [
    'A AA AA AA AAAAAAAA     ',
    'k jh af hj feaVaehf -   ',
    ' D  D  D  D             ',
    ' M  M  M  M             '
],
lead8Echo1 = [
    ' C CC CC CC CCCCCCCC    ',
    ' k jh af hj feaVaehf -  ',
    '  D  D  D  D            ',
    '  M  M  M  M            '
],
lead8Echo2 = [
    '  C CC CC CC CCCCCCCC   ',
    '  k jh af hj feaVaehf - ',
    '   D  D  D  D           ',
    '   M  M  M  M           '
],
leadO8 = [
    'F   F F   F F   F F   F F F F F F F F   CCC     ',
    'k   j h   a f   h j   f e a V a e h f   vy3     ',
    '  D     D     D     D                      D    ',
    '  M     M     M     M                      M    '
],
bass1 = [
    'BBBBBBBB',
    'TXafYQTX'
],
bass2 = [
    'BBBBBBBB',
    'YcTXVZaS'
],
bass3 = [
    'BBBBBBBB',
    'MQTXVZaS'
],
bass4 = [
    'BBBBBBBB',
    'aVTXaSTO'
],
bass5 = [
    'B  B  B  B  B  B  B BBBB',
    'Y  Q  T  X  V  Z  a OQRS'
],
bass6 = [
    'BBBBBBBB',
    'YcTXVZaO'
],
bass7 = [
    'B  B  B  B BB  B  B  B  ',
    'M  Q  T  X TV  Z  a  S  '
],
bass8 = [
    'BBBBBBBB',
    'aVTXaSTH'
],
arp1 = [
    'AAAAAAAAAAAAAAAAAAAAAAAA',
    'HLOHLOHLOHLOEHMEHMHLOHLO'
],
arp1Echo1 = [
    ' D D D D D D D D D D D D D D D D D D D D D D D D',
    ' H L O H L O H L O H L O E H M E H M H L O H L O'
],
arp1Echo2 = [
    ' DDDDDDDDDDDDDDDDDDDDDDD',
    ' HLOHLOHLOHLOEHMEHMHLOHL'
],
arp1Echo2b = [
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'JHLOHLOHLOHLOEHMEHMHLOHL'
],
arp2 = [
    'AAAAAAAAAAAAAAAAAAAAAAAA',
    'EHMEHMHLOHLOJNQJNQOSVSOM'
],
arp2Echo1 = [
    ' D D D D D D D D D D D D D D D D D D D D D D D D',
    ' E H M E H M H L O H L O J N Q J N Q O S V S O M'
],
arp2Echo2 = [
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'OEHMEHMHLOHLOJNQJNQOSVSO'
],
arp3 = [
    'AAAAAAAAAAAAAAAAAAAAAAAA',
    'AEHAEHCHLCHLBEJBEJCGJCOJ'
],
arp3Echo1 = [
    ' E E E E E E E E E E E E E E E E E E E E E E E E',
    ' A E H A E H C H L C H L B E J B E J C G J C O J'
],
arp3Echo2 = [
    'EEEEEEEEEEEEEEEEEEEEEEEE',
    'LAEHAEHCHLCHLBEJBEJCGJCO'
],
arp4 = [
    'AAAAAAAAAAAAAAAAAAAAAAAA',
    'GJMOJGHLOHLOGJOMSOHLOLTO'
],
arp4Echo1 = [
    ' D D D D D D D D D D D D D D D D D D D D D D D D',
    ' G J M O J G H L O H L O G J O M S O H L O L T O'
],
arp4Echo2 = [
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'OGJMOJGHLOHLOGJOMSOHLOLT'
],
arp5 = [
    'AAAAAAAAAAAAAAAAAAAAAAAA',
    'GJMOJGHLOHLOGJOMSOHLOTXa'
],
arp5Echo1 = [
    ' D D D D D D D D D D D D D D D D D D D D D D D D',
    ' G J M O J G H L O H L O G J O M S O H L O T X a'
],
arp5Echo2 = [
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'OGJMOJGHLOHLOGJOMSOHLOTX'
],
bc1 = [
    'G                    G  ',
    'XVXTSTO  L  QPQTSTX  O  ',
    '                      D ',
    '                      M '
],
bc2 = [
    'G                       ',
    'YXYcbcf  a XVTVQPQJOSOJG'
],
bc3 = [
    'G G G G G G G     G     G G G G G G G   GGG   G ',
    'Q P Q T S T X     T     V T V Z Y Z a   YVS   O '
],
bc4 = [
    'GGGGGGG  G  GGGGGGG  G  ',
    'XVXTSTO  L  QPQTSTX  O  ',
    '                      D ',
    '                      M '
],
bc5 = [
    'G G G G G G G     G     G G G G G G G   GGG     ',
    'Y X Y V U V X     O     V S O S V a X   afj     ',
    '                                           D    ',
    '                                           M    '
],



patternOffset = 0, // With this you can play the tune starting from any row.


// Sequence
sequence = [

    [bass1, lead1, lead1Echo1, lead1Echo2, arp1, arp1Echo1, arp1Echo2],
    [bass2, lead2, lead2Echo1, lead2Echo2, arp2, arp2Echo1, arp2Echo2],
    [bass1, lead1, lead1Echo1, lead1Echo2, arp1, arp1Echo1, arp1Echo2],
    [bass2, lead2, lead2Echo1, lead2Echo2, arp2, arp2Echo1, arp2Echo2],
    [bass3, lead3, lead3Echo1, lead3Echo2, arp3, arp3Echo1, arp3Echo2],
    [bass1, lead1, lead1Echo1, lead1Echo2, arp1, arp1Echo1, arp1Echo2],
    [bass4, lead4, lead4Echo1, lead4Echo2, arp4, arp4Echo1, arp4Echo2],
    [bass1, lead6, lead1Echo1, lead1Echo2, leadO6, arp1, arp1Echo1, arp1Echo2, bc1],
    [bass5, lead2, lead2Echo1, lead2Echo2, leadO2, arp2, arp2Echo1, arp2Echo2, bc2],
    [bass1, lead6, lead1Echo1, lead1Echo2, leadO6, arp1, arp1Echo1, arp1Echo2, bc1],
    [bass6, lead2, lead2Echo1, lead2Echo2, leadO2, arp2, arp2Echo1, arp2Echo2, bc2],
    [bass7, lead7, lead3Echo1, lead3Echo2, leadO7, arp3, arp3Echo1, arp3Echo2, bc3],
    [bass1, lead6, lead1Echo1, lead1Echo2, leadO6, arp1, arp1Echo1, arp1Echo2b, bc4],
    [bass8, lead8, lead8Echo1, lead8Echo2, leadO8, arp5, arp5Echo1, arp5Echo2, bc5]

]
),

b64ToInt = (n) => b64.indexOf(n),
semitonesToHz = (s) => 2 ** ((s + .5) / 12),
b64ToHz = (n) => semitonesToHz(b64ToInt(n)),

patternsRow = int((t / ((sampleRate * 60) / (tempo * stepsPerBeat)) / mainPatternSize) + patternOffset) % sequence.length,

// Engine
processChannels = () => {

    let output = 0;

    for (let ch = 0; ch < sequence[patternsRow].length; ch ++) {			

        let pattern = sequence[patternsRow][ch];
        let step = int((t / ((sampleRate * 60) / (tempo * stepsPerBeat))) / (mainPatternSize / pattern[1].length)) % pattern[1].length;

        if ((t / ((sampleRate * 60) / (tempo * stepsPerBeat))) / (mainPatternSize / pattern[1].length) % 1 < ((t - 1) / ((sampleRate * 60) / (tempo * stepsPerBeat))) / (mainPatternSize / pattern[1].length) % 1 || t == 0){ // New step, t == 0 is a cheap fix but it works...
            channelsEffects[ch] = 0; // Not very elegant but makes sure the effect is cleared if there is nothing.

            if (pattern.length > 2){ // Effect set
                if (pattern[2][step] != ' '){

                    channelsEffects[ch] = [pattern[2][step], b64ToInt(pattern[3][step]) * 64]; // Effect id and value

                    if (pattern.length == 5 && pattern[4][step] != ' '){

                        channelsEffects[ch][1] += b64ToInt(pattern[4][step]); // Effect value (second char)
                    }
                }
            }
            if (pattern[1][step] != ' '){ // New note

                channelsFreqsSemitones[ch] = b64ToInt(pattern[1][step]);
            }
            if (pattern[1][step] == '-'){ // Stop note

                channelsVolumes[ch] = 0;
            }

            if (pattern[0][step] != ' ') { // Instrument trigger

                channelsInsts[ch] = insts[b64ToInt(pattern[0][step])];
                channelsCounters[ch] = 0;
                channelsFreqCounters[ch] = 0;
                channelsVolumes[ch] = 1;
            }
        }

        let modifier = 0;

        if (channelsInsts[ch].length == 2) { // Applies the frequency modifier if there is one

            modifier = mods[channelsInsts[ch][1]](channelsCounters[ch]);
        }
        channelsCounters[ch] ++;
        channelsFreqCounters[ch] += semitonesToHz(channelsFreqsSemitones[ch] + modifier);

        if (channelsEffects !== 0){ // Effect handling

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

                    channelsVolumes[ch] = max(channelsVolumes[ch] - .001, effectValue / 4095) // Fast decay to prevent some of the popping sounds
                    //channelsVolumes[ch] = effectValue / 4095;
                    break;
            }
        }
        if (!(pattern[0][step] == ' ' && pattern[1][step] == ' ' && channelsInsts[ch] == 0)){

            output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch])) * channelsVolumes[ch];
        }
    }
    return output;
},processChannels() / numberOfChannels * 2