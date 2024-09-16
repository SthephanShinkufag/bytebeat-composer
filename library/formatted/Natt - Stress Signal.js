// Stress Signal
// by Natt / AYCE
//
// This is a commented write-up of a music piece originally written in only
// 254 characters of JavaScript expression for Lovebyte 2022 Bytebeat Music
// competition.
//
// Online player link:
// https://bytebeat.demozoo.org/#t=0&e=0&s=44100&bb=5d00000100fe00000000000000001461cc5f0043e1f0efcb8775f3c089dbea8c42192b9194efc43822f2c69420f6e6ccef2d2d6a67a7e615647d0e458781f3c67c7308b119843d158e603d5e22d1886e4587bafd60bab667a2e5244d35d62bfbc52dc89f26f7b41832bc6d876c7262e0c13fd09ca479a6857ca56c7ff31a8060776f62fd6c97126fcc8812dc6e9a149f5a6363b756a947c42a15f836377903ff9ad44720
// This entire file is also playable there, which you can comment out each line
// to mute its output.
//
// These techniques, pioneered by an ex-AYCE member, mainly based on an idea
// that each channels summing into the final output are structured as follows:
//
// [Phase generator] (* [Mute bit]) & [Volume/Filter]
//
// - Phase generator: This generates a tone based on input sample number t.
// - Mute bit:        This determines when to mute the channel for rest notes
//                    and silent bars by outputting 0 or 1.
// - Volume/Filter:   This limits the volume and modifies phase generator's
//                    sawtooth waveform by disallowing some bits through an
//                    AND mask. Resulting in some kind of bit-crush effect.
//                    Note that period, volume and octave are all affected
//                    by the highest bit position of this part's value.
//
// All 3 parts can be controlled by loops generated with this expression,
// which allows fitting short list of small numbers in only one number
//
// [Bit table] >> ([Counter] << [Width]) & ((1 << [Width]) - 1)
//
// Note the missing `& 31` needed to make the right shift periodic,
// since JS conveniently applies it for us already, somehow...

// Kick drum
// (Phase generator)
//       8th note period frequency sweep down
//       |              |  12.5% volume; #.... (square) wave
//        \            /   \  /
+ (((t / ((t >> 9) & 15)) & 32)
// (Mute bit)
// 64 bars period pattern of:
// ................#.#.#.#.#.#.#.#.################################
//|                                  masks 1 bar period pattern of:
// \   1 bar       16 bars     32 bars  /| ###.....#...###.....#...###.....
//  \\        /   \       /   \       // V \                      /
* ((((-t >> 16) & (t >> 20) | (t >> 21)) & (118518023 >> (t >> 11)) & 1)))

// Noise hats
// The phase generator part is essentially a very fast frequency sweep down
// with a period of a note frequency instead. Noise sounds are made as a result
// of different divisor values in each period, similar to how some PRNGs work.
// Different envelope speed, volume and patterns are a result of AND-ing the
// output with 3 counters running at different speeds. The selection of 128
// bars ramp up and volume mask of 63 was actually unintentional. But it was
// nice enough to keep it as the second half of the song.
//                   8th note period downward envelope
//                   |         |  1 bar period ramp up
//                   |         | |         | 128 bars period ramp up
//                   |         | |         | |         |  25% volume; full wave
//           -> D     \       /   \       /   \       /   \  /
+ ((t / (t % 152)) & ((-t >> 7) & (t >> 10) & (t >> 17)) & 63)

// Bass channels
// In the original submission, the last note had a frequency value of 199
// instead of 204 in both channels. It's been fixed now.
//           [152, 192, 228, 204] -> D, Bb, G, A
//           |            |    4 bars                 12.5% volume, #...## wave
//            \0xCCE4C098/    \       /  * 8           \  /
+ ((t * 4) / ((3437543576 >> ((t >> 18) << 3)) & 255) & 23)
// The second channel is same as the first, but plays at one octave higher and
// all frequency table entries are added by 1 to make it phase with the first.
//             0xCDE5C199
+ ((t * 8) / ((3454386585 >> ((t >> 18) << 3)) & 255) & 23)

// Arp channels
// Every channel has a maximum 6.25% volume and ##.# wave output, the actual
// octave and waveform is dynamically modified by AND masking with a counter.
//      -> D     8th note period
//     ~32/152   \       /
+ (t * (5/24) & ((-t >> 9) & 13))
//      -> A     16th note period
//     ~32/204   \       /
+ (t * (5/32) & ((-t >> 8) & 13))
// For the third channel, the frequency is selected between t/4 and 15t/64
// (= 32/128, 32/136 -> F, E) by toggling subtraction of t/64 with a 1-bit
// counter.
//|                         2 bars        |   3 16th notes period
// \                      \        /     /    \             /
+ (((t / 4) - (t / 64) * ((-t >> 17) & 1)) & (((-t / 3) >> 8) & 13))

+ 0;
