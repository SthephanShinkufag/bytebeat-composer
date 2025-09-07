/*
4mat - Back Again, covered on bytebeat by Sychamis, June 2025.
Original: https://www.youtube.com/watch?v=K66HOo_vEbQ

I ran into some issues trying to make this sound as accurate as possible and music data here is a complete mess. But it's good enough I guess...

This is meant to be played on https://dollchan.net/bytebeat in Floatbeat mode at 48000Hz.
*/
t || (

sampleRate = 48000,
tempo = 124.96,
stepsPerBeat = 6,
mainPatternSize = 64,
slideDivider = 2 ** 22,
numberOfChannels = 6,

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
saw = (p, d) => p % sampleRate / sampleRate - .5,
tri_pwm = p => abs((p + sampleRate / 2) % sampleRate - sampleRate / 2) / sampleRate,
tri = p => abs(p % sampleRate - sampleRate / 2) / sampleRate * 2 - .5,
noi = p => int(p + 9e4) ** 9 % 255 / 255 - .5,

// Frequency modulators

mods = [

    T => 0,
    T => b64ToInt("AFD"[T / 960 % 3 | 0]), // 053
    T => b64ToInt("AFI"[T / 960 % 3 | 0]), // 058
    T => b64ToInt("AFJ"[T / 960 % 3 | 0]), // 059
    T => b64ToInt("AEJ"[T / 960 % 3 | 0]), // 049
    T => b64ToInt("AEH"[T / 960 % 3 | 0]), // 047
    T => sin(T / 1200) / 3, // 492
    T => sin(T / 1200) / 3.25,// 482
    T => sin(T / 1400) / 3, // 493
    T => b64ToInt("MA"[+(T / 960 > 1)]),
    T => b64ToInt("AWKA"[min(T / 960 | 0, 3)]),
    T => b64ToInt("AD"[+((T / 960) % 8 < 1 && T / 960 > 1)]),
    T => b64ToInt("AE"[+((T / 960) % 8 < 1 && T / 960 > 1)]),
    T => b64ToInt("ADKM"[T / 3840 % 4 | 0]),
    T => b64ToInt("ACHM"[T / 3840 % 4 | 0]),
    T => b64ToInt("ACHK"[T / 3840 % 4 | 0]),
    T => b64ToInt("AHIP"[T / 3840 % 4 | 0]),
    T => b64ToInt("AHIM"[T / 3840 % 4 | 0]),
    T => b64ToInt("ACFM"[T / 3840 % 4 | 0]),
    T => b64ToInt("ACFK"[T / 3840 % 4 | 0]),
    T => b64ToInt("ADH"[T / 960 % 3 | 0]), // 037
    T => b64ToInt("ADF"[T / 960 % 3 | 0]), // 035
    T => b64ToInt("ADI"[T / 960 % 3 | 0]), // 038
    T => b64ToInt("ACH"[T / 960 % 3 | 0]), // 027
    T => b64ToInt("AFH"[T / 960 % 3 | 0]), // 057
    T => b64ToInt("AEL"[T / 960 % 3 | 0]), // 04B
    T => b64ToInt("ADK"[T / 960 % 3 | 0]), // 03A
    T => b64ToInt("ACF"[T / 960 % 3 | 0]), // 025
    T => b64ToInt("AMA"[T / 960 % 3 | 0]),
    T => b64ToInt("ADJ"[T / 960 % 3 | 0]), // 039

],

// Instruments

insts = [

    [(T, p, n, rT) => sqr(p * 64, .2) * .175],
    [(T, p, n, rT) => sqr(p * 64, .125) * adsr(0, 0, 1, 2, T, rT) * .125, 1],
    [(T, p, n, rT) => sqr(p * 32, .45 - tri(T / 1.2) / 3) * adsr(2, 0, 1, 1.75, T, rT) * .25],
    [(T, p, n, rT) => sqr(p * 32, .45 - tri(T / 1.2) / 3) * adsr(1.5, 0, 1, 1, T, rT) * .125],
    [(T, p, n, rT) => tri(p * 256) * adsr(.3, 0, 1, .5, T, rT) * .235],
    [(T, p, n, rT) => tri(p * 256) * adsr(.1, 0, 1, .5, T, rT) * .235],
    [(T, p, n, rT) => tri(p * 256) * adsr(0, 0, 1, 1, T, rT) *.235],
    [(T, p, n, rT) => sqr(p * 64, .125) * .15],
    [(T, p, n, rT) => noi(p / 8) * adsr(1, 0, 1, 1, T, rT) * .2],
    [(T, p, n, rT) => [sqr(p * 16, .5), noi(T / 4)][+(T / 960 > 2)] * adsr(0, 0, 1, .15, T, T) * .6, 9],
    [(T, p, n, rT) => [noi(T / 4), sqr(p * 8, .5)][+(T / 960 > 1)] * adsr(0, 0, 1, .1, T, T) * .5 * (T / 960 < 3), 10],
    [(T, p, n, rT) => sqr(p * 16, .45 - tri(T / 1.2) / 3) * .2],
    [(T, p, n, rT) => [[noi(T / 4), sqr(p * 8, .5)][+(T / 960 > 1)] * adsr(0, 0, 1, .1, T, T) * .5 * (T / 960 < 3), sqr(p * 16, .45 - tri(T / 1.2) / 3) * .2][+(T / 960 > 4)], 10],
    [(T, p, n, rT) => [[noi(T / 4) / 1.5, sqr(p * 16, .15)][+(T / 960 > 1)] * .5, sqr(p * 16, .45 - tri(T / 1.2) / 3) * .2][+(T / 960 > 4)]],
    [(T, p, n, rT) => sqr(p * 64, .15) * .3],
    [(T, p, n, rT) => tri(p * 64) * adsr(3, 0, 1, 0, T, rT) * .2],
    [(T, p, n, rT) => saw(p * 32) * adsr(0, 0, 1, 3, T, T) * .4],
    [(T, p, n, rT) => saw(p * 64) * .8],
    [(T, p, n, rT) => sqr(p * 64, .2) * .12, 5],
    [(T, p, n, rT) => sqr(p * 64, .2) * .3, 3],
    [(T, p, n, rT) => sqr(p * 64, .45 - tri(T / 2.4) / 3) * (adsr(1.3, 0, 1, 1.3, T, rT) * .3 + .05)],
    [(T, p, n, rT) => sqr(p * 64, .125 + tri_pwm(T / 2.25 + sampleRate / 4.5) / 1.15) * (adsr(.5, 0, 1, 0, T, rT) * .15 + .35)],
    [(T, p, n, rT) => sqr(p * 64, .125 + tri_pwm(T / 2.25 + sampleRate / 2) / 1.15) * adsr(0, 0, 1, 5, T, rT) * .5],
    [(T, p, n, rT) => sqr(p * 64, .125 + tri_pwm(T / 2.25 + sampleRate / 4.5) / 1.15) * .5],
    [(T, p, n, rT) => sqr(p * 64, .125 + tri_pwm(T / 2.25) / 1.15) * adsr(0, 0, 1, 3, T, T) * .4],
    [(T, p, n, rT) => sqr(p * 128, .4 - tri_pwm(T / 1.2) / 2) * (adsr(0, 0, 1, .05, T, rT) * .15 + .15)],
    [(T, p, n, rT) => sqr(p * 64, .4) * .3],
    [(T, p, n, rT) => sqr(p * 64, .5 + tri_pwm(T / 2.4) / 3) * .3],
    [(T, p, n, rT) => sqr(p * 64, .125 + (.5 - tri_pwm(T / 2.25 + sampleRate / 4.5) / 1.15)) * .5],
    [(T, p, n, rT) => sqr(p * 64, .15) * .3, 28],
    [(T, p, n, rT) => saw(p * 64) * (adsr(0, 0, 1, .075, T, T) * .3 + .2)],
    [(T, p, n, rT) => sqr(p * 64, .5 + tri_pwm(T / .6) / 3) * adsr(0, 0, 1, .5, T, rT) * .3],
    [(T, p, n, rT) => sqr(p * 64, .125 + tri_pwm(T / 2.25 + sampleRate * 1.1) / 1.15) * .5],
    [(T, p, n, rT) => sqr(p * 64, .45) * .3],
    [(T, p, n, rT) => tri(p * 128) * adsr(.75, 0, 1, 0, T, rT) * .3],
    [(T, p, n, rT) => tri(p * 128) * adsr(0, 0, 1, 0, T, rT) * .5],
    [(T, p, n, rT) => sqr(p * 64, .45) * .2],
    [(T, p, n, rT) => saw(p * 64) * .5],
    [(T, p, n, rT) => sqr(p * 128, .25 + tri_pwm(T / 5) / 2) * .2],
    [(T, p, n, rT) => sqr(p * 128, .55) * .2],
    [(T, p, n, rT) => sqr(p * 64, .125 + tri_pwm(T / 1.625) / 1.15) * adsr(0, 0, 1, 1, T, rT) * .5],
    [(T, p, n, rT) => sqr(p * 64, .45) * adsr(0, 0, 1, .5, T, rT) *.2],
    [(T, p, n, rT) => saw(p * 64) * .3],
    [(T, p, n, rT) => sqr(p * 64, .25) * .375],
    [(T, p, n, rT) => sqr(p * 64, .4) * .4],

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
        - I: Set integer part of tempo. 2-char number only.
        - J: Set decimal part of tempo (in 1/4096ths). 2-char number only.

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
    'C       ',
    'c    -  '
],
ch1b = [
    'C       ',
    'Y   X-  '
],
ch1c = [
    'C       ',
    'd   Y-  '
],
ch1d = [
    'C                                                               ',
    'c                               X                               ',
    '                                          DDDDDDDD              ',
    '                                          840wsokg              '
],
ch1e = [
    '                                                      JJJ K LKL ',
    '                                        -             mmm c Xca ',
    '                                                      DD        ',
    '                                                      Tg        ',
    '                                                                '
],
ch1f = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'ccocmcococcomcocccocmcococcomcoc'
],
ch1g = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'ccocmcococcomcocXXjXmXjXjXXjmXjX'
],
ch1h = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNJ',
    'YYkYmYkYkYYkmYkYTTfTmTfTjXXjmXjm'
],
ch1i = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNJ',
    'YYkYmYkYkYYkmYkYTTfTmTfTfTTfmTfm'
],
ch1j = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'ddpdmdpdpddpmdpdccocmcococcomcoc'
],
ch1k = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNM',
    'ddpdmdpdpddpmdpdffrfmfrfrffrmfrf'
],
ch1l = [
    'MNNNJNNMNNMNJNNMMNNNJNNMNNMNJNNM',
    'ffrfmfrfrffrmfrfhhthmhththhtmhth'
],
ch1m = [
    'MNNNJNNMNNMNJNNMMNNNJNNMNNMNJNNJ',
    'ffrfmfrfrffrmfrfeeqemeqejXXjmXjm'
],
ch1n = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'YYkYmYkYkYYkmYkYddpdmdpdpddpmdpd'
],
ch1o = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'ccocmcocmaammamaffrfmfrfkYYkmYkY'
],
ch1p = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNJ',
    'ddpdmdpdpddpmdpdccocmcococcomcom'
],
ch1q = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'hhthmhththhtmhthccocmcococcomcoc'
],
ch1r = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNJ',
    'ddpdmdpdpddpmdpdYYkYmYkYkYYkmYkm'
],
ch1s = [
    'MNNNJNNMNNMNJNNNMNNNJNNMNNMNJNNN',
    'ddpdmdpdpddpmdpdYYkYmYkYkYYkmYkY'
],
ch1t = [
    'MNNNJNNMNNMNJNNMMNNNJNNMNNMNJNNJ',
    'YYkYmYkYkYYkmYkYYYkYmYkYkYYkmYkm'
],
ch2a = [
    'AHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH',
    'f X c e h X f e c X c e h X f e f X c e h X f e c X c e h X f e '
],
ch2b = [
    'AHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH',
    'c T j c h T e X f X j c h X e T e V h m a e l h e V h m a e l h '
],
ch2c = [
    'AHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH',
    'a V a h m h a V a V a h m h a V c T c f o f c T c T c f o f c T '
],
ch2d = [
    'AHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAH',
    'a T a f m f a T a T a f m f a T c V c h o h c V c V c h o h c V '
],
ch2e = [
    'OAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOA',
    'rejrfjcfqcjqfjcfocjofjcftcjtfjcftchtehaerahrehaeqahqehaeoahoehae'
],
ch2f = [
    'OAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOA',
    'oajofjcfqcjqfjcfrcjrfjcftcjtfjcftcmtjmfjrfmrjmfjtfntjnhjqhnqhneh'
],
ch2g = [
    'OAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOAOA',
    'oajofjcfqcjqfjcfrcjrfjcftcjtfjcftcmtjmfjrfmrjmfjtfmtjmfjrfmrjmfj'
],
ch2h = [
    'Y Y ',
    'h   ',
    'G GG',
    'N OP'
],
ch2i = [
    'Y Y ',
    'c h ',
    'GGGG',
    'QRST'
],
ch2j = [
    'aaOaOOOOaaOaOOOOaaOaOOOOaaOaOOOO',
    'dYVcYVTVaVRYVRTRQTYaQTYaQTYaQTYa'
],
ch2k = [
    'aaOaOOOOaaOaOOOOaaOaOOOOaaOaOOOO',
    'afhjafhjafhjafhjchjkchjkchjkchjk'
],
ch2l = [
    'dededededededededededededededededededededededededededededededede',
    'd Y V c Y V T V a V R Y V R T R Q T Y a Q T Y a Q T Y a Q T Y a '
],
ch2m = [
    'Z      Z        ',
    'T      S        ',
    'G  G   G   G    ',
    'F  X   d   D    '
],
ch2n = [
    'hAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhA',
    'rejrfjcfqcjqfjcfocjofjcftcjtfjcftchtehaerahrehaeqahqehaeoahoehae',
    'G                                                               ',
    'A                                                               '
],
ch2o = [
    'hAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhAhA',
    'fSXfTXQTeQXeTXQTcQXcTXQThQXhTXQThQVhSVOSfOVfSVOSeOVeSVOScOVcSVOS'
],
ch2p = [
    'hkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhk',
    'OQUOXUaXgajgmjommojmgjagXaUXQUOQQOVQYVcYhckhokpoopkohkchYcVYQVMQ'
],
ch2q = [
    'hkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhkhk',
    'QMTQWTcWfcifkiokkoikficfWcTWQTMQRMVRYVcYhckhokpoopkohkchYcVYQVMQ'
],
ch2r = [
    'm                               ',
    'hTZchZchhVadhadhjXadjafjiYcficYi'
],
ch2s = [
    'n                               ',
    'hcYVhcYVhcYVhcYVhcXQhcXQaXQOaXQO'
],
ch2t = [
    ' p p                   p     p     p                   p     p  ',
    ' j l                   j     h     f                   e     a  '
],
ch2u = [
    '   p                   p       p                               p',
    '   c                   a       T                           -   h'
],
ch2v = [
    '   p                                                            ',
    '   c                 d c d c a Y T               h     f     d  '
],
ch2w = [
    'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    'MRYdfdYRMRYdfdYRMRYdfdYRMRYdfdYRMQXcfcXQMQXcfcXQMQXcfcXQMQXcfcXQ',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'BDFHJLNPRTVXZbdfhjlnprtvxz13579//97531zxvtrpnljhfdbZXVTRPNLJHFDB'
],
ch2x = [
    'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsqqqqqsqqqqqsqqqqqqqqqqqqqqqqqqq',
    'YdkprpkdYdkprpkdYdkprpkdYdkprpkdocjoromcYcjokojcYcjorojcYcjorojc',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD DDDDD DDDDD DDDDDDDDDDDDDDDDDDD',
    'BDFHJLNPRTVXZbdfhjlnprtvxz13579/ 97531 xvtrp ljhfdbZXVTRPNLJHFDB'
],
ch2y = [
    'qqqqkkkkqqqqkkkkqqqqkkkkqqqqkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'YcjorojcYcjorojcYcjorojcYcjorojcYcjorojcYcjorojcYcjorojcYcjorojc',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'BDFHJLNPRTVXZbdfhjlnprtvxz13579//97531zxvtrpnljhfdbZXVTRPNLJHFDB'
],
ch3a = [
    'B',
    'j'
],
ch3b = [
    '  ',
    'jh',
    'GG',
    'CD'
],
ch3c = [
    '  ',
    'hf',
    'GG',
    'CE'
],
ch3d = [
    '  ',
    'fh',
    'GG',
    'FF'
],
ch3e = [
    '    ',
    '  h-',
    'F G ',
    'A F ',
    'g F '
],
ch3f = [
    'P                               Q                               ',
    'cjtv23tvcjtv23tvcjtv23tvcjtv23tvcjtv23tvcjtv23tvcjtv23tvcjtv23tv',
    'G                                                               ',
    'A                                                               '
],
ch3g = [
    'RHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHRHS       T       ',
    'f X T Q e X T Q c X T Q h X T Q h V S O f V S O m       m       ',
    'D D D D D D D D D D D D D D D D D D D D D D D D         D   D   ',
    'B D F H J L N P R T V X a b d f h h f d b a X V         t   /   '
],
ch3h = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    'c -   -  - -   -    -  - -    - a -   -  - -   -    -  - -    - ',
    'G           D                   G           D                   ',
    'X           g                   F           g                   '
],
ch3i = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    'c -   -  - -   -    -  - -    - a -   -  - -   -b   -  - -    - ',
    'G           D   G               G           D   G               ',
    'U           g   V               E           g   W               '
],
ch3j = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    'c -   -  - -   -    -  - -    - a -   -  - -   -    -  - -    - ',
    'G       G   D   G       G       G           D                   ',
    'U       Y   g   U       X       E           g                   '
],
ch3k = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    'c -   -  - -   -    -  - -    - a -   -  - -   -    -  - -    - ',
    'G           D   G               G           D                   ',
    'U           g   V               E           g                   '
],
ch3l = [
    'Z  Z Z  ZZ Z Z  Z  Z Z  ZZ Z Z  ',
    'V-  - -   - - - T-  - -   - - - ',
    'G DG G DGG G G DG DG G     G G D',
    'U gW U gXU W U gE gZ E     F E g'
],
ch3m = [
    'Z  Z Z  Z   Z   Z               ',
    'V-  - -    -   -X           -   ',
    'G DG G D    G   G       G     D ',
    'U gW U g    C   a       W     g '
],
ch3n = [
    'Z                               Z                           b   ',
    'V                               T                           e   ',
    'G           G                   G           G               CC  ',
    'U           b                   D           Y               ff  ',
    '                                                            OO  '
],
ch3o = [
    '                                                        Z       ',
    '                        Y   g                           T       ',
    '      G             GBBB    CC  G                       G       ',
    '      I             Aaaa    hh  I                       F       ',
    '                            OO                                  '
],
ch3p = [
    'Z       Z       ',
    'V       T       ',
    'G  G    G  G    ',
    'U  b    D  Y    '
],
ch3q = [
    'f                                                      W        ',
    'a                           b               e     -    h X f X e',
    '      G                     G   G           G          D        ',
    '      H                     A   H           A          M        '
],
ch3r = [
    '   j                                                            ',
    '   m               l               k               h            ',
    'D  D                                                            ',
    'A  T                                                            '
],
ch3s = [
    'l h   l h lhl h l h l h lhl h lhl h   l h lhl h l h l h lhl h l ',
    'Q               X       d       c                               '
],
ch3t = [
    'l h   l h lhl h l h l h lhl h lhl h   l h lhl h   l h lhl h l h ',
    'W               T               V                       Y       '
],
ch3u = [
    'l h l h   l h l h     l h lhl h l h l h   l h l h     l h lhl h ',
    'Z               a       c     acd   X   T   d   c   f   k   i   '
],
ch3v = [
    'l h l h lhl h l h l h lhl h l h l h l h lhl h lh  l h l h   lo o',
    'h                                             geg            c h',
    '      G                                       G              D D',
    '      H                                       A              T T'
],
ch3w = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    'Y -   -  - -   -    -  - -    -   -   -  - -   -    -  - -    - ',
    'G           D                   G           D                   ',
    'E           g                   F           g                   '
],
ch3x = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    'V -   -  - -   -    -  - -    - T -   -  - -   -    -  - -    - ',
    'G           D                   G           D                   ',
    'W           g                   E           g                   '
],
ch3y = [
    'Z   Z   Z Z   Z   Z   Z Z   Z   Z   Z   Z Z   Z   Z   Z Z   Z   ',
    '  -   -  - -   -    -  - -    - V -   -  - -   -    -  - -    - ',
    '            D                   G           D                   ',
    '            g                   D           g                   '
],
ch4a = [
    '  D             E               ',
    '  f         -   e       a       ',
    '                G       G  G    ',
    '                G       A  G    '
],
ch4b = [
    '                                                            F   ',
    'X                           X                             - U   ',
    'G     G                    GCCCC  G                         CCCC',
    'A     H                    AVVVV  I                         VVVV',
    '                            aaaa                            DDDD'
],
ch4c = [
    '                          G                                     ',
    '                          V V T                             S   ',
    '    G                    GCC        G                       G   ',
    '    I                    AXX        H                       A   ',
    '                          MM                                    '
],
ch4d = [
    '                            G                                   ',
    '                            O                                   ',
    '    G                      GCC      G                           ',
    '    H                      AQQ      H                           ',
    '                            MM                                  '
],
ch4e = [
    '             I  ',
    '          -  Y  '
],
ch4f = [
    '    ',
    '   -',
    'BBBB',
    'JJJJ'
],
ch4g = [
    'U               U            V  ',
    'j       -       m       -    Xce',
    'G               G               ',
    'L               M               '
],
ch4h = [
    '                                                                ',
    'f                 X c e h   f ce          fec a             e ac',
    '      G           G                 G     G         G       G   ',
    '      H           A                 H     A         H       A   '
],
ch4i = [
    '                                ',
    '      ac  a  Y  X Ya X Tb ce X  ',
    '  G   G    G G GG               ',
    '  H   A    H A HA               '
],
ch4j = [
    'W                                                               ',
    'f             hef X e V a   X   c e   c   e f          e  e a X ',
    'G     G       G                       CC  C C G       GCC       ',
    'A     H       A                       ee  f e H       Aff       ',
    '                                      OO  g g          OO       '
],
ch4k = [
    '                                                                ',
    'a       f     m       qom   o h                                 ',
    'CC        G  GCC  G   G   G G CC    G         G                 ',
    'cc        I  Aoo  H   A   I A jj    H         G                 ',
    'OO            OO              OO                                '
],
ch4l = [
    'X                                                               ',
    'j         j k h                       f       k     f   h   j   ',
    'G        GC C     G                   G   G  GCC  G G           ',
    'G        Ak j     I                   A   H  Amm  H A           ',
    '          O O                                 OO                '
],
ch4m = [
    '                                ',
    'h    ojh           f TaYV       ',
    'C G  G   G         G    C  G    ',
    'j H  A   I         A    X  I    ',
    'O                       O       '
],
ch4n = [
    '                                ',
    '      Y       T V     Y     f h ',
    '      G  G    G C G   G G   G C ',
    '      A  I    A X H   A H   A j ',
    '                O             O '
],
ch4o = [
    '                                                        W       ',
    '                        c   j                           m   m   ',
    'G                   GBBB    CC  G                       G   CC  ',
    'H                   Aaaa    kk  H                       A   oo  ',
    '                            OO                              OO  '
],
ch4p = [
    '                    c                                           ',
    '                    m   k   k               Y           f     jh',
    'G                   G       CC      G       G   G      GCC      ',
    'G                   A       ff      H       A   H      Ahh      ',
    '                            tt                          OO      '
],
ch4q = [
    '                        W                                       ',
    'f                       e   e           k   i       h X f X e b ',
    '    G                  GCC      G       G   CC                CC',
    '    H                  Aff      H       A   jj                cc',
    '                        OO                  OO                OO'
],
ch4r = [
    '                  g                                             ',
    '                  X c e h   f ce          f e a             e ac',
    '      G           G                 G     G         G       G   ',
    '      H           A                 H     A         H       A   '
],
ch4s = [
    'W                           i   ',
    'c  -                        m   '
],
ch4t = [
    'j                                                               ',
    'm               m               l               k               ',
    'D     G        GCC      G   D DGCCD G          GCC  G   D   D   ',
    'm     H        All      H   h cAkkh H          Ahh  H   m   r   ',
    '                OO              OO              aa              '
],
ch4u = [
    '                                ',
    'g        cgjm jj              ea',
    'G  G     G     C  G           GC',
    'A  H     A     k  H           Ac',
    '               O               O'
],
ch4v = [
    '                                ',
    '            a cX  XV            ',
    '   G        G  C      G       DD',
    '   H        A  Y      H       w1',
    '               O                '
],
ch4w = [
    '                                ',
    '     fcfdVcVaVYVXORXadcacQTWYfdc',
    '   DDG                          ',
    '   6/A                          '
],
ch4x = [
    '                                                          o o o ',
    'd               d               Y               X         c h j ',
    '      G        GCC    G        GCC    G        GCC    G   G     ',
    '      H        AYY    H        AXX    H        Aaa    H   A     ',
    '                tt              tt              tt              '
],
ch4y = [
    'o         o  o  o         o  o  ',
    'j         j  h  e         e  a  ',
    'C  G      G     C   G     G     ',
    'l  H      A     f   H     A     ',
    'O               O               '
],
ch4z = [
    'o         o   o               oo',
    'a         a   T             - hj',
    'C  G      G         G         G ',
    'c  H      A         H         A ',
    'O                               '
],
ch4A = [
    'o                                             o                 ',
    'a                 c           T           -   f     f     c     ',
    'CC    G          GC C C C C C                 CC          CC    ',
    'cc    H          Ad c d c a Y                 hh          dd    ',
    'OO                a a a a a a                 OO          OO    '
],
ch4B = [
    'o                                     r                         ',
    'a     a     Y                         Y                         ',
    'CC G  G                 DDDDDDDDDDD           G             D  G',
    'cc H  A                 /9865320zxw           H             6  A',
    'OO                                                              '
],
ch4C = [
    '                                                                ',
    'Y     c     a                                                   ',
    'CC    CC    CC      G   D       D       D       D       D      G',
    'cc    aa    YY      H   1       w       r       m       h      A',
    'TT    TT    TT                                                  '
],
ch4D = [
    '                                                                ',
    'Y     c     a                                                   ',
    'CC    CC    CC      G   D       D       D       D       D      G',
    'cc    aa    YY      H   c       X       S       N       I      A',
    'TT    TT    TT                                                  '
],
ch4E = [
    '                          I     ',
    'Y  c  a                   Y     ',
    'C  C  C   G D       D     G     ',
    'c  a  Y   H D       A     A     ',
    'T  T  T                         '
],
jump = [
    '',
    '',
    'E',
    'A',
    'F'
],
setA = [
    '',
    '',
    'I',
    'B',
    '/'
],
setB = [
    '',
    '',
    'J',
    '9',
    'Y'
],

tuneAcc = 0,

// Sequence
sequence = [

    [ch1a, ch2a, ch3a, ch4a],
    [ch1b, ch2b, ch3b, ch4b],
    [ch1c, ch2c, ch3c, ch4c],
    [ch1d, ch2d, ch3d, ch4d],
    [ch1e, ch2d, ch3e, ch4e],
    [ch1f, ch2e, ch3f, ch4f],
    [ch1f, ch2e, ch3g, ch4g],
    [ch1g, ch2e, ch3h, ch4h],
    [ch1h, ch2f, ch3i, ch4i],
    [ch1g, ch2e, ch3j, ch4j, setA, setB],
    [ch1i, ch2g, ch3k, ch4k],
    [ch1j, ch2h, ch3l, ch4l],
    [ch1k, ch2i, ch3m, ch4m],
    [ch1j, ch2j, ch3n, ch4n],
    [ch1l, ch2k, ch3o, ch4o],
    [ch1j, ch2l, ch3p, ch4p],
    [ch1m, ch2m, ch3q, ch4q],
    [ch1g, ch2e, ch3h, ch4r],
    [ch1h, ch2f, ch3i, ch4i],
    [ch1g, ch2e, ch3j, ch4j],
    [ch1i, ch2g, ch3k, ch4k],
    [ch1j, ch2h, ch3l, ch4l],
    [ch1k, ch2i, ch3m, ch4m],
    [ch1j, ch2j, ch3n, ch4n],
    [ch1l, ch2k, ch3o, ch4o],
    [ch1j, ch2l, ch3p, ch4p],
    [ch1m, ch2m, ch3q, ch4q],
    [ch1f, ch2n, ch3f, ch4s],
    [ch1f, ch2o, ch3r, ch4t],
    [ch1f, ch2p, ch3s, ch4u],
    [ch1n, ch2q, ch3t, ch4v],
    [ch1o, ch2r, ch3u, ch4w],
    [ch1p, ch2s, ch3v, ch4x],
    [ch1q, ch2t, ch3h, ch4y],
    [ch1r, ch2u, ch3w, ch4z],
    [ch1q, ch2t, ch3h, ch4y],
    [ch1r, ch2v, ch3w, ch4A],
    [ch1s, ch2w, ch3x, ch4B],
    [ch1s, ch2x, ch3x, ch4C],
    [ch1s, ch2x, ch3x, ch4D],
    [ch1t, ch2y, ch3y, ch4E],
    [jump]

]

),

b64ToInt = n => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(n),
semitonesToHz = s => 2 ** ((s + .2) / 12),
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

                case 'I':
                    tempo = tempo % 1 + effectValue;
                    break;

                case 'J':
                    tempo = int(tempo) + effectValue / 4096;
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
        if (channelsInsts[ch] != 0){

            output += channelsInsts[ch][0](channelsCounters[ch], channelsFreqCounters[ch], semitonesToHz(channelsFreqsSemitones[ch]),channelsReleaseT[ch]) * channelsVolumes[ch];
        }
    }
    tuneAcc += (tempo * stepsPerBeat) / (sampleRate * 60);
    return output;
},
processChannels() / numberOfChannels * 4.5