/*
TheFatRat - Unity, covered on bytebeat without samples by Sychamis, February 2025.
Original: https://www.youtube.com/watch?v=n8X9_MgEdCg

Filter code based on polyzium's code.
This video helped me find the chords: https://www.youtube.com/watch?v=5fVEh-WmQP0

This is meant to be played on https://dollchan.net/bytebeat in Floatbeat mode at 48000Hz.
*/

t || (

sampleRate = 48000,
tempo = 105,
stepsPerBeat = 12,
mainPatternSize = 96,
slideDivider = 2 ** 22,
numberOfChannels = 14,

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

sqr = p => (p % sampleRate / sampleRate > .51) - .5,
noi = p => int(p + 9e6) ** 9 % 255 / 255 - .5,
sne = p => sin(p * PI),
saw = p => p % sampleRate / sampleRate - .5,
sps = (p, T) => (saw(p += 9e9) + saw(p * 1.0045) * .5 + saw(p * .9961) * .5 + saw(p * 1.0034) + saw(p * .9970) + saw(p * 1.0120) * .5 + saw(p * .9891) * .5) / 3,
ss2 = (p, T) => (saw(p += 9e9) + saw(p * 1.0080)) / 2,
esw = p => (p % sampleRate / sampleRate) ** 5 - .5,
sql = (p, T) => [noi(T), sqr(p)][+ (T / 400 > 1)],
kps = (n, T) => (f = round(sampleRate / n), T == 1 ? _z = Array.from({length: f}, (v, i) => noi(i * 9e6)) : 0, (_z[T % f] = _z[T % f] * .3 + _z[(T - 1) % f] * .7) * 2),

// Frequency modulators

mods = [

    T => -cbrt(T) * 6,
    T => T / 5e3,
    T => -cbrt(T) * 3,
    T => -cbrt(T) * 2.5,
    T => sin(T / 1000) / 10,
    T => T / 8700,
    T => -cbrt(T),
    T => -cbrt(T) * 1.7,
    T => -cbrt(T) * 2,
    T => -cbrt(T) * .8,
    T => -T / 900,

],

// Instruments

insts = [

    [(T, p, n, rT) => sql(p * 256, T) * adsr(0, .4, 0, 0, T, rT) ** 2],
    [(T, p, n, rT) => sql(p * 256, T) * adsr(0, 1, 0, .1, T, rT) / 1.7],
    [(T, p, n, rT) => sqr(p * 256) * adsr(0, 1, 0, .001, T, rT) / 2],
    [(T, p, n, rT) => sqr(p * 16) * adsr(0, .5, 0, .001, T, rT) / 1.5],
    [(T, p, n, rT) => sqr(p * 128) * adsr(0, 1.75, 0, .1, T, rT) ** 2 / 3.75],
    [(T, p, n, rT) => noi(p / .55) * (T / 960 < 1) / 1.5],
    [(T, p, n, rT) => (nA = noi(T / 4.5), T == 1 ? (_a = _b = 0, cA = .5, rA = .8) : 0, (nA - (_b += cA * ((_a += cA * (nA - _a + (rA + rA / (1 - cA)) * (_a - _b))) - _b))) * adsr(0, .25, 0, .001, T, rT) / 1.5)],
    [(T, p, n, rT) => sne(p / 8) * adsr(0, .1, 0, 0, T, rT) / 3 + (sqr(T * 82.41) + sqr(T * 82.6)) * adsr(.03, 0, 1, .001, T, rT) / 10 + noi(T / 2) * adsr(0, .005, 0, .001, T, rT) / 4, 0],
    [(T, p, n, rT) => noi(T / 37) * adsr(0, 1, 0, 0, T, rT) / 1.5],
    [(T, p, n, rT) => noi(p / 128) * adsr(0, 0, 1, 0, T, rT) / 1.75, 1],
    [(T, p, n, rT) => sps(p * 64) * adsr(0, 3.5, 0, 0, T, rT) / 1.25, 4],
    [(T, p, n, rT) => (sne(p / 32) * adsr(.005, .2, 0, 0, T, rT) + noi(T / 2) * adsr(0, .01, 0, 0, T, rT)), 2],
    [(T, p, n, rT) => sne(p / 40) * adsr(.01, .05, 0, 0, T, rT), 3],
    [(T, p, n, rT) => (noi(p / 3) + noi(p / 3.02)) / 1.5 * adsr(.01, .1, 0, 0, T, rT)],
    [(T, p, n, rT) => (nB = noi(T), T == 1 ? (_c = _d = 0, cB = .9, rB = .8) : 0, (nB - (_d += cB * ((_c += cB * (nB - _c + (rB + rB / (1 - cB)) * (_c - _d))) - _d)))  * adsr(.005, .2, 0, 0, T, rT) / 2)],
    [(T, p, n, rT) => noi(T / 1.5) * adsr(0, .03, 0, 0, T, rT) / 2],
    [(T, p, n, rT) => noi(T / (1 + T / 5e4)) * adsr(0, 1.5, 0, 0, T, rT) / 2],
    [(T, p, n, rT) => noi(T / 2) * adsr(0, .1, 0, 0, T, rT)],
    [(T, p, n, rT) => sps(p * 128) * adsr(18, 0, 0, 0, T, rT), 5],
    [(T, p, n, rT) => (sne(p / 128) * adsr(.005, .5, 0, 0, T, rT) + noi(T / 2) * adsr(0, .01, 0, 0, T, rT)), 6],
    [(T, p, n, rT) => ss2(p * 128) * adsr(.01, 0, 1, .02, T, rT) / 2],
    [(T, p, n, rT) => esw(p * 16) * adsr(.01, 0, 1, .05, T, rT)],
    [(T, p, n, rT) => sne(p / 80) * adsr(.005, .4, 0, 0, T, rT) + noi(T / 2) * adsr(0, .01, 0, 0, T, rT), 7],
    [(T, p, n, rT) => sne(p / 32) * adsr(.01, .1, 0, 0, T, rT), 8],
    [(T, p, n, rT) => (noi(p / 2) + noi(p / 2.002)) / 1.5 * adsr(.01, .15, 0, 0, T, rT)],
    [(T, p, n, rT) => (nC = noi(p), T == 1 ? (_e = _f = 0, cC = .5, rC = .5) : 0, (nC - (_f += cC * ((_e += cC * (nC - _e + (rC + rC / (1 - cC)) * (_e - _f))) - _f))) * adsr(0, .075, 0, 0, T, rT) / 1.5)],
    [(T, p, n, rT) => noi(p) * adsr(0, .1, 0, 0, T, rT) ** 7 / 1.5],
    [(T, p, n, rT) => (nD = noi(p), T == 1 ? (_g = _h = 0, cD = .5, rD = .5) : 0, (nD - (_h += cD * ((_g += cD * (nD - _g + (rD + rD / (1 - cD)) * (_g - _h))) - _h))) * adsr(0, .2, 0, 0, T, rT) / 1.5)],
    [(T, p, n, rT) => (noi(p / 1.5) + noi(p / 1.501)) * adsr(.01, 1.25, 0, 0, T, rT) ** 2 / 1.5],
    [(T, p, n, rT) => (nE = noi(T), T == 1 ? (_i = _j = 0, cE = .9, rE = .8) : 0, (nE - (_j += cE * ((_i += cE * (nE - _i + (rE + rE / (1 - cE)) * (_i - _j))) - _j))) * adsr(0, .25, 0, 0, T, rT))],
    [(T, p, n, rT) => sne(p / 88) * adsr(.01, .25, 0, 0, T, rT) + noi(T / 2) * adsr(0, .01, 0, 0, T, rT), 9],
    [(T, p, n, rT) => noi(p / 2) * adsr(0, 1, 0, 0, T, rT) ** 3 / 2.5],
    [(T, p, n, rT) => sps(p * 128) * (.5 + adsr(.25, 0, 1, .1, T, rT) / 2) / 1.75],
    [(T, p, n, rT) => sqr(p * 128) * adsr(0, .3, 0, 0, T, rT) / 1.75, 10],
    [(T, p, n, rT) => (nF = sql(p * 128, T), cF = max(.94 - T / 7000, .1), T == 1 ? (_k = _l = 0, rF = .5) : 0, (_l += cF * ((_k += cF * (nF - _k + (rF + rF / (1 - cF)) * (_k - _l))) - _l)) * adsr(0, .25, 0, 0, T, rT) / 1.5)],
    [(T, p, n, rT) => sql(p * 128, T) * adsr(0, 1, 0, .1, T, rT) / 1.7],
    [(T, p, n, rT) => (kps(n * 16, T) + sne(p / 1024 / 1.46485) / 1.5) * adsr(0, 2, 0, .1, T, rT)],
    [(T, p, n, rT) => ss2(p * 256) * adsr(0, .5, 0, 0, T, rT) ** 2 / 1.7],

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
s1 = [
    'K',
    'o'
],
s2 = [
    'S',
    'A'
],
s3 = [
    '  ',
    ' -'
],
d1 = [
    'L     O   M M     O     L     O     M   L O   L L     O   M M     L     L   R       M         RR',
    'A         E A                                             E A                                   ',
    '                                        D     D                   D         D                 DD',
    '                                        g     g                   p         g                 gg'
],
d2 = [
    '     NN           N          NN  O     O  N  O  ',
    '     EA                      EA                 '
],
d3 = [
    'Q',
    'A'
],
d4 = [
    '    P P   P P   PPP   P P   P P   P P   P P   P P   P P   P P   PPP   P P   P P   P P   P P     ',
    '    A                                                                                           '
],
d8 = [
    '                                                                                    R           ',
    '                                                                                    A           '
],
d5 = [
    'L         M M     L     L   R O   R R   L R   LLL     L     L     L     L         C C   C C   C ',
    'A         E A                                                                     X V   T Q   O ',
    '                                  D     D     DD                                                ',
    '                                  g     g     gg                                                '
],
d6 = [
    'R     O   N N     R                 R         RRR     R     R     R     R                       ',
    'A         E A                                                                                   ',
    '                                              DD                                                ',
    '                                              gg                                                '
],
d7 = [
    '    P P   R R   PPO   P P   P P   P P   P O   P T     T     T     T     T                       ',
    '    A                                                                                           '
],
d9 = [
    '     PP  P           P                          ',
    '     A                                          '
],
d10 = [
    'W    WX  W  W     X W  WW    WX  W  W     X     ',
    'A                                               ',
    '     D   D          D  D     D   D              ',
    '     g   g          g  g     g   g              '
],
d11 = [
    ' Y Y Y Y',
    ' A      '
],
d12 = [
    'b     Z   a b   a Z     b     Z   a b   a Z     b     Z   a b   a Z     b     Z   a b   a Z     ',
    'A      -  A        -    A      -  A        -    A      -  A        -    A      -  A        -    '
],
d13 = [
    'c              d',
    'A               '
],
d14 = [
    'W    WX  W  W     X W  WW    WX  W  W WW  X  e  ',
    'A                                               ',
    '     D   D          D  D     D   D    DD        ',
    '     g   g          g  g     g   g    gg        '
],
d15 = [
    '   f       f  ff  f  f     f       f  ff  f  f  ',
    '   A       M   A     M     A       M   A     M  '
],
d16 = [
    'W    WX  W  W     X W  WW  X  X  X  X           ',
    'A                                               ',
    '     D   D          D  D                        ',
    '     g   g          g  g                        '
],
d17 = [
    '  Y   Y YYYYY   ',
    '  A             '
],
d18 = [
    '   f       f  ff  f  f  W  W  W  W  W           ',
    '   A       M   A     M  A                       '
],



b1 = [
    'D  D D  DD  D  D D   D  D  D D   D  D  D D   D  ',
    'Q -c  - Qc -M -Y  -  Y -O -a  -  a -V -h  -  h -'
],
b2 = [
    'D  D D  DD  D  D D   D  D  D D   D  D DD  D  D  ',
    'Q -c  - Qc -M -Y  -  Y -O -a  -  a -V  T  S  Q  '
],
b3 = [
    'D  D D  DD  D  D D   D  D  D D   D  D  D D   D  ',
    'M -Y  - MY -M -Y  -  Y -O -a  -  a -O -a  -  a -'
],
b4 = [
    'D  D D   D  D  D D   D  D  D D   D  D  D D   D  ',
    'Q -c  -  c -Q -c  -  c -T -f  -  f -T -f  -  f -'
],
b5 = [
    'D  D D  DD  D  D D   D  D  D D   D  D  D D   D  ',
    'M -Y  - MY -M -Y  -  Y -N -Z  -  Z -N -Z  -  Z -'
],
b6 = [
    'D  D D   D  D  D D   D  D  D  D  D  D           ',
    'O -a  -  a -O -a  -  a -a -a -a -a -b -         '
],

b7 = [
    'V     V   V     V V     V     V   V     V V     V     V     V     V           V   V     V V   V ',
    'Q     c - c -   c-c   - M     Y     -   Y-Y   - a    -a    -a    -a     V     V   V-    V-V  -V-'
],
b8 = [
    'V         V     V V     V           V     V     V         V     V V     V           V     V     ',
    'M     Y - Y -   Y-Y   - M     Y    -Y    -Y    -O     a - a -   a-a   - O     a    -a    -a    -'
],
b9 = [
    'V         V     V V     V           V     V     V         V     V V     V           V     V     ',
    'Q     c - c -   c-c   - Q     c    -c    -c    -T     f - f -   f-f   - T     f    -f    -f    -'
],
b10 = [
    'V         V     V V     V           V     V     V         V     V V     V           V     V     ',
    'M     Y - Y -   Y-Y   - M     Y    -Y    -Y    -N     Z - Z -   Z-Z   - N     Z    -Z    -Z    -'
],
b11 = [
    'V         V     V V     V           V     V     V     V     V     V     V                       ',
    'O     a - a -   a-a   - O     a    -a    -a   - a   - a   - a   - a   - b   -                   '
],

b12 = [
    'k     k   k     k k     k     k   k     k k     k     k     k     k     k     k   k     k k   k ',
    'Q     c - c -   c-c   - M     Y     -   Y-Y   - a    -a    -a    -a     V          -    V-V  -V-'
],
b13 = [
    'k     k   k     k k     k     k     k     k     k     k   k     k k   k k     k     k     k     ',
    'M     Y - Y -   Y-Y   - M     Y    -Y    -Y    -O     a - a -   a-a   a-O     a    -f    -a    -'
],
b14 = [
    'k     k   k     k k   k k     k           k     k     k   k     k k   k k     k     k     k     ',
    'Q     c - c -   c-c   c-Q     Q          -Q    -T     f - f -   f-f   f-T     f    -e    -c    -'
],
b15 = [
    'k     k   k     k k     k     k     k     k     k     k   k     k k   k k     k     k     k     ',
    'M     Y - Y -   Y-Y   - M     Y    -Y    -Y    -N     Z - Z -   Z-Z   Z-N     Z    -Z    -Z    -'
],
b16 = [
    'k     k   k     k k     k     k   k     k k     k     k     k     k     k                       ',
    'O     a - a -   a-a   - O     a - a -   a-a   - a   - a   - a   - a   - b   -                   '
],

ch1a = [
    'EEEE',
    'OLON'
],
ch1b = [
    'EEEE',
    'QMQ '
],
ch1c = [
    'EEEE',
    'TQSV'
],
ch1d = [
    'EEEE',
    'XTVX'
],
ch1e = [
    ' E  ',
    ' Y  '
],
ch2a = [
    'EEEE',
    'OLO '
],
ch2c = [
    'EEEE',
    'TQS '
],
ch2d = [
    'EEEE',
    'YTV '
],
ch3a = [
    'EEEE',
    'O   '
],
ch3b = [
    'EEEE',
    'Q S '
],
ch3c = [
    'EEEE',
    'T   '
],
ch3d = [
    'EEEE',
    'X   '
],
ch4a = [
    'EEEE',
    'OLN '
],
ch4c = [
    'EEEE',
    'TQV '
],
ch4d = [
    'EEEE',
    'YTZ '
],
ch5a = [
    'E       E       E E E E E       ',
    'O                -O-O-O-P-      '
],
ch5b = [
    'E       E       E E E E E       ',
    'T               S-S-S-S-S-      '
],
ch5c = [
    'E       E       E E E E E       ',
    'X               V-V-V-V-X-      '
],
ch5d = [
    '                E E E E E       ',
    '                a-a-a-a-b-      '
],

ch6a = [
    'U                       U                       U     U     U     U     U                       ',
    'O           -           L           -           O    -O    -O    -O    -N           -           '
],
ch6b = [
    'U                       U                       U     U     U     U     U                       ',
    'Q           -           M           -           Q    -Q    -Q    -Q    -Q           -           '
],
ch6c = [
    'U                       U                       U     U     U     U     U                       ',
    'T           -           Q           -           S    -S    -S    -S    -V           -           '
],
ch6d = [
    'U                       U                       U     U     U     U     U                       ',
    'X           -           T           -           V    -V    -V    -V    -X           -           '
],
ch6e = [
    '  U     ',
    '  Y-    '
],
ch7a = [
    'U         U     U U     U         U     U U     U     U     U     U     U     U   U     U U   U ',
    'O       - O-    O-O   - L       - L-    L-L   - O    -O    -O    -O    -N          -    N-N  -N-'

],
ch7b = [
    'U         U     U U     U         U     U U     U     U     U     U     U     U   U     U U   U ',
    'Q       - Q-    Q-Q   - M       - M-    M-M   - Q    -Q    -Q    -Q    -Q          -    Q-Q  -Q-'
],
ch7c = [
    'U         U     U U     U         U     U U     U     U     U     U     U     U   U     U U   U ',
    'T       - T-    T-T   - Q       - Q-    Q-Q   - S    -S    -S    -S    -V          -    V-V  -V-'
],
ch7d = [
    'U         U     U U     U         U     U U     U     U     U     U     U     U   U     U U   U ',
    'X       - X-    X-X   - T       - T-    T-T   - V    -V    -V    -V    -X          -    X-X  -X-'
],
ch7e = [
    '                        U         U     U U                                                     ',
    '                        Y       - Y-    Y-Y   -                                                 '
],
ch8a = [
    'g g g g g g g g ',
    'O-O-L-L-O-O-O-O-'
],
ch8b = [
    'g g g g g g g g ',
    'Q-Q-M-M-Q-Q-Q-Q-'
],
ch8c = [
    'g g g g g g g g ',
    'T-T-Q-Q-S-S-S-S-'
],
ch8d = [
    'g g g g g g g g ',
    'Y-Y-T-T-V-V-V-V-'
],
ch8e = [
    '    g g         ',
    '    Y-Y-        ',
    'D       D       ',
    'A       A       '
],
ch9a = [
    'g g g g g g g g ',
    'O-O-O-O-O-O-O-O-'
],
ch9b = [
    'g g g g g g g g ',
    'Q-Q-Q-Q-S-S-S-S-'
],
ch9c = [
    'g g g g g g g g ',
    'T-T-T-T-T-T-T-T-'
],
ch9d = [
    'g g g g g g g g ',
    'X-X-X-X-X-X-X-X-'
],
ch10a = [
    'g g g g g g g g ',
    'O-O-L-L-N-N-N-N-'
],
ch10b = [
    'g g g g g g g g ',
    'Q-Q-M-M-Q-Q-Q-Q-'
],
ch10c = [
    'g g g g g g g g ',
    'T-T-Q-Q-V-V-V-V-'
],
ch10d = [
    'g g g g g g g g ',
    'Y-Y-T-T-Z-Z-Z-Z-'
],
ch11a = [
    'g     g     g     g     g  g  g  g  g           ',
    'O  -  O  -  O  -  O  -  O           P           ',
    '                          D  D  D  D  D         ',
    '                          A  A  A  A  A         '
],
ch11b = [
    'g     g     g     g     g  g  g  g  g           ',
    'T  -  T  -  T  -  T  -  S                       ',
    '                          D  D  D  D  D         ',
    '                          A  A  A  A  A         '
],
ch11c = [
    'g     g     g     g     g  g  g  g  g           ',
    'X  -  X  -  X  -  X  -  V           X           ',
    '                          D  D  D  D  D         ',
    '                          A  A  A  A  A         '
],
ch11d = [
    '                        g  g  g  g  g           ',
    '                        a           b           ',
    'D                         D  D  D  D  D         ',
    'A                         A  A  A  A  A         '
],
ch12a = [
    ' l l l l l l l l',
    ' O   M   O   N  '
],
ch12b = [
    ' l l l l l l l l',
    ' Q              '
],
ch12c = [
    ' l l l l l l l l',
    ' T       S   V  '
],
ch13a = [
    ' l l l l l l l l',
    ' O   M   O   Q  '
],
ch13b = [
    ' l l l l l l l l',
    ' Q           V  '
],
ch13c = [
    ' l l l l l l l l',
    ' T       S   X  '
],

noi1 = [
    ' F F F F F F F F',
    ' M              '
],
noi9 = [
    '   F F  FF     F F  FF     F F  FF     F F  FF  ',
    '   M A   M       A   M       A   M       A   M  ',
    '     D  D        D  D        D  D        D  D   ',
    '     g  g        g  g        g  g        g  g   '
],
noi10 = [
    '   F F  FF     F F  FF  H  H  H  H  H           ',
    '   M A   M       A   M  A- A- A- A- A-          ',
    '     D  D        D  D                           ',
    '     g  g        g  g                           '
],
noi2 = [
    '                                    F     H G  G',
    '                                    A      -A- A',
    '                                    D           ',
    '                                    g           '
],
noi3 = [
    'I',
    'A'
],
noi4 = [
    'H    HG  H  H     G H  HH    HG  H  H     G     ',
    'A-   A    - A-    A  - A -   A    - A-    A     ',
    '     D   D          D  D     D   D              ',
    '     g   g          g  g     g   g              '
],
noi5 = [
    'H    HG  H  H     G H  HH    HG  H  H HH  G     ',
    'A-   A    - A-    A  - A -   A    - A-A - A     ',
    '     D   D          D  D     D   D    DD        ',
    '     g   g          g  g     g   g    gg        '
],
noi6 = [
    'H    HG  H  H     G H  HG  G  G  G  G           ',
    'A-   A    - A-    A  - A                        ',
    '     D   D          D  D                        ',
    '     g   g          g  g                        '
],
noi7 = [
    'J',
    'A'
],
noi8 = [
    '  ',
    ' -'
],

l1a = [
    'C    CC CC CC    CC CC CC  C  C  C  C    CC CC C',
    'Q -  XV TQ OQ -  XV TQ OQ -T -V -X -V -  XV TQ O'
],
l2a = [
    'C    CC CC CC    CC CC CC  C  C  C  C    CC CC C',
    'Q -  XV TQ OQ -  QT VX ac -a -c -f -h -  jh fc a'
],
l3a = [
    'C    CC CC CC    CC CC CC  C  C  C  C    CC CC C',
    'c -  jh fc ac -  jh fc ac -f -h -j -h -  jh fc a'
],
l4a = [
    'C         C C   C C   C C         C C   C C   C C     C     C     C     C                      C',
    'c   -     j h   f c   a c   -     c f   h j   m o   - m   - o   - r   - t   -                  a'
],
l5a = [
    'C     C     C     C   C C   C C     C     C    CC     C     C     C   C C   C C     C     C     ',
    'c   - c   - c   - c   a c   f c     a     X    ac   - c   - c   - c   a c   o m     j     h     '
],
l6a = [
    'C     C     C     C   C C   C C     C     C    CC     C     C     C   C C   C C     C     C    C',
    'j   - j   - j   - j   h j   m j     h     f    hj   - j   - j   - j   h j   m j     h     f    a'
],
l7a = [
    'C  C  C CC CC  C  C CC CC  C  C  C  C    AA AA A',
    'j -j -j hf hj -j -j hf hj -j -j -j -j -  XV TQ O'
],
l1b = [
    'A    AA AA AA    AA AA AA  A  A  A  A    AA AA A',
    'Q -  XV TQ OQ -  XV TQ OQ -T -V -X -V -  XV TQ O'
],
l2b = [
    'A    AA AA AA    AA AA AA  A  A  A  A    AA AA A',
    'Q -  XV TQ OQ -  QT VX ac -a -c -f -h -  jh fc a'
],
l3b = [
    'A    AA AA AA    AA AA AA  A  A  A  A    AA AA A',
    'c -  jh fc ac -  jh fc ac -f -h -j -h -  jh fc a'
],
l4b = [
    'A    AA AA AA    AA AA AA  A  A  A  A           ',
    'c -  jh fc ac -  cf hj mo -m -o -r -t -         '
],
l5b = [
    'B  B  B  B BB BB  B  B  B  B  B  B BB BB  B  B  ',
    'a -c -c -c ac fc  a  X  a -c -c -c ac om  j  h  ',
    'C                       C                       ',
    'c                       c                       ',
    'a                       a                       '
],
l6b = [
    'B  B  B  B BB BB  B  B  B  B  B  B BB BB  B  B  ',
    'j -j -j -j hj mj  h  f  h -j -j -j hj mj  h  f  ',
    '                        C                       ',
    '                        j                       ',
    '                        a                       '
],
l7b = [
    'B  B  B BB BB  B  B BB BB  B  B  B  B    ii ii i',
    'h -j -j hf hj -j -j hf hj -j -j -j -j -  XV TQ O',
    'C                                               ',
    'j                                               ',
    'a                                               '
],
l1c = [
    'i    ii ii ii    ii ii ii  i  i  i  i    ii ii i',
    'Q -  XV TQ OQ -  XV TQ OQ -T -V -X -V -  XV TQ O'
],
l2c = [
    'i    ii ii ii    ii ii ii  i  i  i  i    ii ii i',
    'Q -  XV TQ OQ -  QT VX ac -a -c -f -h -  jh fc a'
],
l3c = [
    'i    ii ii ii    ii ii ii  i  i  i  i    ii ii i',
    'c -  jh fc ac -  jh fc ac -c -f -h -j -  jh fc a',
    '                           C  C  C  C           ',
    '                           f  h  j  h           ',
    '                           a  a  a  a           '
],
l4c = [
    'i    ii ii ii    ii ii ii  i  i  i  i           ',
    'c -  jh fc ac -  cf hj mo -o -m -o -r -         ',
    '                           C  C  C  C           ',
    '                           m  o  r  t           ',
    '                           a  a  a  a           '
],
l5c = [
    'j  j  j  j jj jj  j  j  j  j  j  j jj jj  j  j  ',
    'a -c -c -c ac fc  a  X  a -c -c -c ac om  j  h  ',
    'C                       C                       ',
    'c                       c                       ',
    'a                       a                       '
],
l6c = [
    'j  j  j  j jj jj  j  j  j  j  j  j jj jj  j  j  ',
    'j -j -j -j hj mj  h  f  h -j -j -j hj mj  h  f  ',
    '                        C                       ',
    '                        j                       ',
    '                        a                       '
],
l7c = [
    'j  j  j jj jj  j  j jj jj  j  j  j  j           ',
    'h -j -j hf hj -j -j hf hj -j -j -j -j -         ',
    'C                                               ',
    'j                                               ',
    'a                                               '
],

fx1 = [
    'hhhhhhhhhhhhhhhh',
    'UVWXYZabcdefghij'
],
fx2 = [
    'hhhhhhhhhhhhh   ',
    'klmnopqrstuvw   '
],
fx3 = [
    '   V',
    '   k',
    '   C',
    '   A', 
    '   O'
],


patternOffset = 0, // With this you can play the tune starting from any row.
stepOffset = 0,


// Sequence
sequence = [

    [s2   , s1   , d1   , d2   , d3   , d4   , d8],
    [s3   , d5   , d6   , d7   , d9   ],
    [b1   , l1a  , ch1a , ch1b , ch1c , ch1d , ch1e ],
    [b1   , l2a  , ch1a , ch1b , ch1c , ch1d , ch1e ],
    [b1   , l3a  , ch1a , ch1b , ch1c , ch1d , ch1e , noi1],
    [b2   , l4a  , ch1a , ch1b , ch1c , ch1d , ch1e , noi1 , noi2],
    [b3   , l5a  , ch2a , ch1b , ch2c , ch2d , ch1e , noi3 , noi4 , noi9],
    [b4   , l6a  , ch3a , ch3b , ch3c , ch3d , noi9 , noi5],
    [b5   , l5a  , ch4a , ch1b , ch4c , ch4d , ch1e , noi4 , noi7 , noi9],
    [b6   , l7a  , ch5a , ch5b , ch5c , ch5d , noi6 , noi10, noi8],
    [b7   , l1b  , ch6a , ch6b , ch6c , ch6d , ch6e , d10  , d11  , d12  , d13],
    [b7   , l2b  , ch6a , ch6b , ch6c , ch6d , ch6e , d14  , d11  , d12],
    [b7   , l3b  , ch7a , ch7b , ch7c , ch7d , ch7e , d10  , d11  , d12  , d13],
    [b7   , l4b  , ch7a , ch7b , ch7c , ch7d , ch7e , d14  , d11  , d12],
    [b8   , l5b  , ch8a , ch8b , ch8c , ch8d , ch8e , d10  , d11  , d13  , d15],
    [b9   , l6b  , ch9a , ch9b , ch9c , ch9d , d14  , d11  , d15],
    [b10  , l5b  , ch10a, ch10b, ch10c, ch10d, ch8e , d10  , d11  , d13  , d15  , fx1],
    [b11  , l7b  , ch11a, ch11b, ch11c, ch11d, d16  , d17  , d18  , fx2],
    [b12  , l1c  , ch6a , ch6b , ch6c , ch6d , ch6e , d10  , d11  , d12  , d13],
    [b12  , l2c  , ch6a , ch6b , ch6c , ch6d , ch6e , d14  , d11  , d12],
    [b12  , l3c  , ch6a , ch6b , ch6c , ch6d , ch6e , d10  , d11  , d12  , d13  , ch12a, ch12b, ch12c],
    [b12  , l4c  , ch6a , ch6b , ch6c , ch6d , ch6e , d14  , d11  , d12  , ch13a, ch13b, ch13c],
    [b13  , l5c  , ch8a , ch8b , ch8c , ch8d , ch8e , d10  , d11  , d13  , d15],
    [b14  , l6c  , ch9a , ch9b , ch9c , ch9d , d14  , d11  , d15],
    [b15  , l5c  , ch10a, ch10b, ch10c, ch10d, ch8e , d10  , d11  , d13  , d15  , fx1],
    [b16  , l7c  , ch11a, ch11b, ch11c, ch11d, d16  , d17  , d18  , fx2  , fx3],
    []

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
            }
        }
        if (!(pattern[0][step] == ' ' && pattern[1][step] == ' ' && channelsInsts[ch] == 0)){

            output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch]),channelsReleaseT[ch]) * channelsVolumes[ch];
        }
    }
    return output;
},processChannels() / numberOfChannels * 4.5