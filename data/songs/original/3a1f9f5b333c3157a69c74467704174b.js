SAMP_RATE = 11025,
BPM = 130,
beat = BPM * (t / SAMP_RATE) / 60,
tick = floor(beat * 48) % 3072,

C = 261.63,
Db = 277.18,
D = 293.66,
Eb = 311.13,
EE = 329.63,
F = 349.23,
Gb = 369.99,
G = 392.00,
Ab = 415.30,
A = 440.00,
Bb = 466.16,
B = 493.88,

chan1_freq = (tick >= 0 && tick < 12) * C + (tick >= 24 && tick < 36) * C + (tick >= 36 && tick < 48) * D + (tick >= 48 && tick < 72) * EE + (tick >= 72 && tick < 84) * C + 
(tick >= 96 && tick < 108) * F + (tick >= 120 && tick < 132) * EE + (tick >= 144 && tick < 168) * D + (tick >= 168 && tick < 180) * F + 
(tick >= 192 && tick < 204) * EE + (tick >= 216 && tick < 228) * C + (tick >= 240 && tick < 264) * G/2 + (tick >= 264 && tick < 276) * Gb/2 + (tick >= 288 && tick < 348) * F/2 + 
(tick >= 360 && tick < 372) * F/2 + (tick >= 372 && tick < 384) * Gb/2 + 
(tick >= 384 && tick < 396) * G/2 + (tick >= 408 && tick < 420) * G/2+ (tick >= 420 && tick < 432) * C + 
(tick >= 432 && tick < 456) * EE + (tick >= 456 && tick < 468) * C + 
(tick >= 480 && tick < 504) * D + (tick >= 504 && tick < 516) * C + (tick >= 528 && tick < 540) * Bb/2 + (tick >= 552 && tick < 564) * D + (tick >= 576 && tick < 672) * C + 
(tick >= 744 && tick < 756) * C + (tick >= 756 && tick < 768) * D + //pattern 0

(tick >= 768 && tick < 780) * EE + (tick >= 792 && tick < 804) * EE + (tick >= 804 && tick < 816) * F + (tick >= 816 && tick < 840) * G + (tick >= 840 && tick < 852) * C + 
(tick >= 864 && tick < 888) * Ab + (tick >= 888 && tick < 900) * G + (tick >= 912 && tick < 924) * F + (tick >= 936 && tick < 948) * Ab + 
(tick >= 960 && tick < 984) * G + (tick >= 984 && tick < 996) * EE + (tick >= 1008 && tick < 1020) * EE*2 + (tick >= 1032 && tick < 1044) * D*2 + (tick >= 1056 && tick < 1104) * C*2 + 
(tick >= 1128 && tick < 1140) * D + (tick >= 1140 && tick < 1152) * EE + 
(tick >= 1152 && tick < 1176) * F + (tick >= 1176 && tick < 1188) * D + (tick >= 1200 && tick < 1212) * F + (tick >= 1224 && tick < 1236) * A + 
(tick >= 1248 && tick < 1272) * Ab + (tick >= 1272 && tick < 1284) * EE + (tick >= 1296 && tick < 1308) * Ab + (tick >= 1320 && tick < 1332) * B + (tick >= 1344 && tick < 1440) * A + 
(tick >= 1512 && tick < 1524) * D + (tick >= 1524 && tick < 1536) * EE + //pattern 1

(tick >= 1536 && tick < 1560) * F + (tick >= 1572 && tick < 1584) * EE + (tick >= 1584 && tick < 1608) * D + (tick >= 1608 && tick < 1620) * C + 
(tick >= 1632 && tick < 1656) * B/2 + (tick >= 1656 && tick < 1668) * G/2 + (tick >= 1680 && tick < 1704) * G + (tick >= 1704 && tick < 1716) * F + 
(tick >= 1728 && tick < 1752) * EE + (tick >= 1752 && tick < 1764) * F + (tick >= 1776 && tick < 1800) * EE + (tick >= 1800 && tick < 1812) * D + 
(tick >= 1824 && tick < 1848) * C + (tick >= 1848 && tick < 1872) * B/2 + (tick >= 1872 && tick < 1908) * A/2 + 
(tick >= 1920 && tick < 1944) * F + (tick >= 1956 && tick < 1968) * EE + (tick >= 1968 && tick < 1992) * D + (tick >= 1992 && tick < 2004) * C + 
(tick >= 2016 && tick < 2040) * G + (tick >= 2040 && tick < 2052) * F + (tick >= 2064 && tick < 2088) * EE + (tick >= 2088 && tick < 2100) * D + (tick >= 2112 && tick < 2208) * EE + 
(tick >= 2280 && tick < 2292) * D + (tick >= 2292 && tick < 2304) * EE + //pattern 2

(tick >= 2304 && tick < 2328) * F + (tick >= 2340 && tick < 2352) * EE + (tick >= 2352 && tick < 2376) * D + (tick >= 2376 && tick < 2388) * C + 
(tick >= 2400 && tick < 2424) * G + (tick >= 2424 && tick < 2436) * F + (tick >= 2448 && tick < 2472) * EE + (tick >= 2472 && tick < 2484) * F + 
(tick >= 2496 && tick < 2520) * G + (tick >= 2520 && tick < 2532) * F + (tick >= 2544 && tick < 2568) * EE + (tick >= 2568 && tick < 2580) * D + 
(tick >= 2592 && tick < 2640) * C + (tick >= 2664 && tick < 2676) * D + (tick >= 2676 && tick < 2688) * EE + 
(tick >= 2688 && tick < 2712) * F + (tick >= 2712 && tick < 2724) * D + (tick >= 2736 && tick < 2760) * F + (tick >= 2760 && tick < 2772) * A + 
(tick >= 2784 && tick < 2808) * Ab + (tick >= 2808 && tick < 2820) * EE + (tick >= 2832 && tick < 2856) * Ab + (tick >= 2856 && tick < 2868) * B + (tick >= 2880 && tick < 2976) * A, //pattern 3

chan1_amp = 24,
chan1_pulse = (tick >= 0 && tick < 1512) * 12 + (tick >= 1512 && tick < 3072) * 50,

tick -= 36, // delay

chan2_freq = (tick >= 0 && tick < 12) * C + (tick >= 24 && tick < 36) * C + (tick >= 36 && tick < 48) * D + (tick >= 48 && tick < 72) * EE + (tick >= 72 && tick < 84) * C + 
(tick >= 96 && tick < 108) * F + (tick >= 120 && tick < 132) * EE + (tick >= 144 && tick < 168) * D + (tick >= 168 && tick < 180) * F + 
(tick >= 192 && tick < 204) * EE + (tick >= 216 && tick < 228) * C + (tick >= 240 && tick < 264) * G/2 + (tick >= 264 && tick < 276) * Gb/2 + (tick >= 288 && tick < 348) * F/2 + 
(tick >= 360 && tick < 372) * F/2 + (tick >= 372 && tick < 384) * Gb/2 + 
(tick >= 384 && tick < 396) * G/2 + (tick >= 408 && tick < 420) * G/2+ (tick >= 420 && tick < 432) * C + 
(tick >= 432 && tick < 456) * EE + (tick >= 456 && tick < 468) * C + 
(tick >= 480 && tick < 504) * D + (tick >= 504 && tick < 516) * C + (tick >= 528 && tick < 540) * Bb/2 + (tick >= 552 && tick < 564) * D + (tick >= 576 && tick < 672) * C + 
(tick >= 744 && tick < 756) * C + (tick >= 756 && tick < 768) * D + //pattern 0

(tick >= 768 && tick < 780) * EE + (tick >= 792 && tick < 804) * EE + (tick >= 804 && tick < 816) * F + (tick >= 816 && tick < 840) * G + (tick >= 840 && tick < 852) * C + 
(tick >= 864 && tick < 888) * Ab + (tick >= 888 && tick < 900) * G + (tick >= 912 && tick < 924) * F + (tick >= 936 && tick < 948) * Ab + 
(tick >= 960 && tick < 984) * G + (tick >= 984 && tick < 996) * EE + (tick >= 1008 && tick < 1020) * EE*2 + (tick >= 1032 && tick < 1044) * D*2 + (tick >= 1056 && tick < 1104) * C*2 + 
(tick >= 1128 && tick < 1140) * D + (tick >= 1140 && tick < 1152) * EE + 
(tick >= 1152 && tick < 1176) * F + (tick >= 1176 && tick < 1188) * D + (tick >= 1200 && tick < 1212) * F + (tick >= 1224 && tick < 1236) * A + 
(tick >= 1248 && tick < 1272) * Ab + (tick >= 1272 && tick < 1284) * EE + (tick >= 1296 && tick < 1308) * Ab + (tick >= 1320 && tick < 1332) * B + (tick >= 1344 && tick < 1440) * A + 
(tick >= 1512 && tick < 1524) * D + (tick >= 1524 && tick < 1536) * EE + //pattern 1

(tick >= 1536 && tick < 1560) * F + (tick >= 1572 && tick < 1584) * EE + (tick >= 1584 && tick < 1608) * D + (tick >= 1608 && tick < 1620) * C + 
(tick >= 1632 && tick < 1656) * B/2 + (tick >= 1656 && tick < 1668) * G/2 + (tick >= 1680 && tick < 1704) * G + (tick >= 1704 && tick < 1716) * F + 
(tick >= 1728 && tick < 1752) * EE + (tick >= 1752 && tick < 1764) * F + (tick >= 1776 && tick < 1800) * EE + (tick >= 1800 && tick < 1812) * D + 
(tick >= 1824 && tick < 1848) * C + (tick >= 1848 && tick < 1872) * B/2 + (tick >= 1872 && tick < 1908) * A/2 + 
(tick >= 1920 && tick < 1944) * F + (tick >= 1956 && tick < 1968) * EE + (tick >= 1968 && tick < 1992) * D + (tick >= 1992 && tick < 2004) * C + 
(tick >= 2016 && tick < 2040) * G + (tick >= 2040 && tick < 2052) * F + (tick >= 2064 && tick < 2088) * EE + (tick >= 2088 && tick < 2100) * D + (tick >= 2112 && tick < 2208) * EE + 
(tick >= 2280 && tick < 2292) * D + (tick >= 2292 && tick < 2304) * EE + //pattern 2

(tick >= 2304 && tick < 2328) * F + (tick >= 2340 && tick < 2352) * EE + (tick >= 2352 && tick < 2376) * D + (tick >= 2376 && tick < 2388) * C + 
(tick >= 2400 && tick < 2424) * G + (tick >= 2424 && tick < 2436) * F + (tick >= 2448 && tick < 2472) * EE + (tick >= 2472 && tick < 2484) * F + 
(tick >= 2496 && tick < 2520) * G + (tick >= 2520 && tick < 2532) * F + (tick >= 2544 && tick < 2568) * EE + (tick >= 2568 && tick < 2580) * D + 
(tick >= 2592 && tick < 2640) * C + (tick >= 2664 && tick < 2676) * D + (tick >= 2676 && tick < 2688) * EE + 
(tick >= 2688 && tick < 2712) * F + (tick >= 2712 && tick < 2724) * D + (tick >= 2736 && tick < 2760) * F + (tick >= 2760 && tick < 2772) * A + 
(tick >= 2784 && tick < 2808) * Ab + (tick >= 2808 && tick < 2820) * EE + (tick >= 2832 && tick < 2856) * Ab + (tick >= 2856 && tick < 2868) * B + (tick >= 2880 && tick < 2976) * A, //pattern 3

chan2_amp = (4),
chan2_pulse = (tick >= 0 && tick < 1512) * 12 + (tick >= 1512 && tick < 3072) * 50,

tick += 36, // un-delay

chan3_freq = (tick >= 0 && tick < 24) * C/4 + (tick >= 48 && tick < 72) * G/4 + (tick >= 96 && tick < 120) * Bb/8 + (tick >= 144 && tick < 168) * F/4 +
(tick >= 192 && tick < 216) * C/4 + (tick >= 240 && tick < 264) * G/4 + (tick >= 288 && tick < 312) * Bb/8 + (tick >= 336 && tick < 360) * F/4 +
(tick >= 384 && tick < 408) * C/4 + (tick >= 432 && tick < 456) * G/4 + (tick >= 480 && tick < 504) * Bb/8 + (tick >= 528 && tick < 552) * F/4 + 
(tick >= 576 && tick < 600) * C/4 + (tick >= 624 && tick < 648) * G/4 + (tick >= 672 && tick < 696) * G/8 +  //pattern 0

(tick >= 768 && tick < 792) * C/4 + (tick >= 816 && tick < 840) * G/4 + (tick >= 864 && tick < 888) * F/4 + (tick >= 912 && tick < 936) * C/2 +
(tick >= 960 && tick < 984) * C/4 + (tick >= 1008 && tick < 1032) * EE/4 + (tick >= 1056 && tick < 1080) * A/8 + (tick >= 1104 && tick < 1128) * EE/4 + 
(tick >= 1152 && tick < 1176) * D/4 + (tick >= 1200 && tick < 1224) * A/4 + (tick >= 1248 && tick < 1272) * EE/4 + (tick >= 1296 && tick < 1320) * B/4 + 
(tick >= 1344 && tick < 1368) * A/8 + (tick >= 1392 && tick < 1416) * EE/4 + 
(tick >= 1440 && tick < 1452) * G/8 + (tick >= 1464 && tick < 1476) * G/4 + (tick >= 1488 && tick < 1512) * G/4 + //pattern 1

(tick >= 1536 && tick < 1560) * F/8 + (tick >= 1584 && tick < 1608) * C/4 + (tick >= 1632 && tick < 1656) * G/8 + (tick >= 1680 && tick < 1704) * D/4 +
(tick >= 1728 && tick < 1752) * C/4 + (tick >= 1776 && tick < 1800) * B/8 + (tick >= 1824 && tick < 1848) * A/8 + (tick >= 1872 && tick < 1896) * EE/4 +
(tick >= 1920 && tick < 1944) * D/8 + (tick >= 1968 && tick < 1992) * A/8 + (tick >= 2016 && tick < 2040) * G/8 + (tick >= 2064 && tick < 2088) * D/4 +
(tick >= 2112 && tick < 2136) * C/4 + (tick >= 2160 && tick < 2184) * G/4 + (tick >= 2208 && tick < 2232) * Bb/8 + (tick >= 2256 && tick < 2280) * G/4 + //pattern 2

(tick >= 2304 && tick < 2328) * F/8 + (tick >= 2352 && tick < 2376) * C/4 + (tick >= 2400 && tick < 2424) * G/8 + (tick >= 2448 && tick < 2472) * D/4 +
(tick >= 2496 && tick < 2520) * C/4 + (tick >= 2544 && tick < 2568) * EE/4 + (tick >= 2592 && tick < 2616) * A/8 + (tick >= 2640 && tick < 2664) * EE/4 +
(tick >= 2688 && tick < 2712) * D/4 + (tick >= 2736 && tick < 2760) * A/4 + (tick >= 2784 && tick < 2808) * EE/4 + (tick >= 2832 && tick < 2856) * B/4 + 
(tick >= 2880 && tick < 2904) * A/8 + (tick >= 2928 && tick < 2952) * EE/4 + 
(tick >= 2976 && tick < 2988) * G/8 + (tick >= 3000 && tick < 3012) * G/4 + (tick >= 3024 && tick < 3048) * G/4,  //pattern 3

chan3_amp = (28),

chan4_freq = (tick >= 24 && tick < 36) * EE + (tick >= 72 && tick < 84) * EE + (tick >= 120 && tick < 132) * D + (tick >= 168 && tick < 180) * D + 
(tick >= 216 && tick < 228) * EE + (tick >= 264 && tick < 276) * EE + (tick >= 312 && tick < 324) * D + (tick >= 360 && tick < 372) * D + 
(tick >= 408 && tick < 420) * EE + (tick >= 456 && tick < 468) * EE + (tick >= 504 && tick < 516) * D + (tick >= 552 && tick < 564) * D + 
(tick >= 600 && tick < 612) * EE + (tick >= 648 && tick < 660) * EE + (tick >= 696 && tick < 708) * G + (tick >= 720 && tick < 744) * G*2 + //pattern 0

(tick >= 792 && tick < 804) * EE + (tick >= 840 && tick < 852) * EE + (tick >= 888 && tick < 900) * F + (tick >= 936 && tick < 948) * F + 
(tick >= 984 && tick < 996) * EE + (tick >= 1032 && tick < 1044) * EE + (tick >= 1080 && tick < 1092) * EE + (tick >= 1128 && tick < 1140) * EE + 
(tick >= 1176 && tick < 1188) * F + (tick >= 1224 && tick < 1236) * F + (tick >= 1272 && tick < 1284) * D + (tick >= 1320 && tick < 1332) * D + 
(tick >= 1368 && tick < 1380) * EE + (tick >= 1416 && tick < 1428) * EE + (tick >= 1464 && tick < 1476) * B/2 + (tick >= 1488 && tick < 1512) * B/2 + //pattern 1

(tick >= 1560 && tick < 1572) * F + (tick >= 1608 && tick < 1620) * F + (tick >= 1656 && tick < 1668) * D + (tick >= 1704 && tick < 1716) * D + 
(tick >= 1752 && tick < 1764) * EE + (tick >= 1800 && tick < 1812) * EE + (tick >= 1848 && tick < 1860) * C + (tick >= 1896 && tick < 1908) * C + 
(tick >= 1944 && tick < 1956) * F + (tick >= 1992 && tick < 2004) * F + (tick >= 2040 && tick < 2056) * D + (tick >= 2088 && tick < 2100) * D + 
(tick >= 2136 && tick < 2148) * EE + (tick >= 2184 && tick < 2196) * EE + (tick >= 2232 && tick < 2246) * EE + (tick >= 2280 && tick < 2292) * EE + //pattern 2

(tick >= 2328 && tick < 2340) * F + (tick >= 2376 && tick < 2388) * F + (tick >= 2424 && tick < 2436) * D + (tick >= 2472 && tick < 2484) * D + 
(tick >= 2520 && tick < 2532) * EE + (tick >= 2568 && tick < 2580) * EE + (tick >= 2616 && tick < 2628) * EE + (tick >= 2664 && tick < 2676) * EE + 
(tick >= 2712 && tick < 2724) * F + (tick >= 2760 && tick < 2772) * F + (tick >= 2808 && tick < 2820) * D + (tick >= 2856 && tick < 2868) * D + 
(tick >= 2904 && tick < 2916) * EE + (tick >= 2952 && tick < 2964) * EE + (tick >= 3000 && tick < 3012) * B/2 + (tick >= 3024 && tick < 3048) * B/2, //pattern 3

chan4_amp = (12),
chan4_pulse = 50,

chan5_freq = (tick >= 24 && tick < 36) * G + (tick >= 72 && tick < 84) * G + (tick >= 120 && tick < 132) * F + (tick >= 168 && tick < 180) * F + 
(tick >= 216 && tick < 228) * G + (tick >= 264 && tick < 276) * G + (tick >= 312 && tick < 324) * F + (tick >= 360 && tick < 372) * F + 
(tick >= 408 && tick < 420) * G + (tick >= 456 && tick < 468) * G + (tick >= 504 && tick < 516) * F + (tick >= 552 && tick < 564) * F + 
(tick >= 600 && tick < 612) * G + (tick >= 648 && tick < 660) * G + (tick >= 696 && tick < 708) * Gb + (tick >= 720 && tick < 744) * Gb*2 +  //pattern 0

(tick >= 792 && tick < 804) * G + (tick >= 840 && tick < 852) * G + (tick >= 888 && tick < 900) * Ab + (tick >= 936 && tick < 948) * Ab + 
(tick >= 984 && tick < 996) * G + (tick >= 1032 && tick < 1044) * Ab + (tick >= 1080 && tick < 1092) * A + (tick >= 1128 && tick < 1140) * A + 
(tick >= 1176 && tick < 1188) * A + (tick >= 1224 && tick < 1236) * A + (tick >= 1272 && tick < 1284) * Ab + (tick >= 1320 && tick < 1332) * Ab + 
(tick >= 1368 && tick < 1380) * A + (tick >= 1416 && tick < 1428) * A + (tick >= 1464 && tick < 1476) * G + (tick >= 1488 && tick < 1512) * G + //pattern 1

(tick >= 1560 && tick < 1572) * A + (tick >= 1608 && tick < 1620) * A + (tick >= 1656 && tick < 1668) * G + (tick >= 1704 && tick < 1716) * G + 
(tick >= 1752 && tick < 1764) * G + (tick >= 1800 && tick < 1812) * G + (tick >= 1848 && tick < 1860) * EE + (tick >= 1896 && tick < 1908) * EE + 
(tick >= 1944 && tick < 1956) * A + (tick >= 1992 && tick < 2004) * A + (tick >= 2040 && tick < 2056) * G + (tick >= 2088 && tick < 2100) * G + 
(tick >= 2136 && tick < 2148) * G + (tick >= 2184 && tick < 2196) * G + (tick >= 2232 && tick < 2246) * G + (tick >= 2280 && tick < 2292) * G + //pattern 2

(tick >= 2328 && tick < 2340) * A + (tick >= 2376 && tick < 2388) * A + (tick >= 2424 && tick < 2436) * G + (tick >= 2472 && tick < 2484) * G + 
(tick >= 2520 && tick < 2532) * G + (tick >= 2568 && tick < 2580) * Ab + (tick >= 2616 && tick < 2628) * A + (tick >= 2664 && tick < 2676) * A + 
(tick >= 2712 && tick < 2724) * A + (tick >= 2760 && tick < 2772) * A + (tick >= 2808 && tick < 2820) * Ab + (tick >= 2856 && tick < 2868) * Ab + 
(tick >= 2904 && tick < 2916) * A + (tick >= 2952 && tick < 2964) * A + (tick >= 3000 && tick < 3012) * G + (tick >= 3024 && tick < 3048) * G, //pattern 3

chan5_amp = (12),
chan5_pulse = 50,

chan6_freq = A/3,
// chan6_amp = (tick % 12 < 3) * 32 * (6 - ((tick / 12) % 4)) / 6,
chan6_amp = (tick >= 0 && tick < 684) * ((tick % 48 < 3) * 18 + ((tick+12) % 48 < 3) * 12 + ((tick+24) % 48 < 3) * 24 + ((tick+36) % 48 < 3) * 18) +
(tick >= 696 && tick < 723) * ((tick % 24 < 3) * 24) + //pattern 0
(tick >= 768 && tick < 1452) * ((tick % 48 < 3) * 18 + ((tick+12) % 48 < 3) * 12 + ((tick+24) % 48 < 3) * 24 + ((tick+36) % 48 < 3) * 18) +
(tick >= 1464 && tick < 1491) * ((tick % 24 < 3) * 24) + //pattern 1
(tick >= 1536 && tick < 2988) * ((tick % 48 < 3) * 18 + ((tick+12) % 48 < 3) * 12 + ((tick+24) % 48 < 3) * 24 + ((tick+36) % 48 < 3) * 18) +
(tick >= 3000 && tick < 3027) * ((tick % 24 < 3) * 24), //patterns 2 and 3

noiseFreq = floor(t * (chan6_freq * 44100 / SAMP_RATE) / 440),

128 + chan1_amp * 2 * (floor(chan1_freq * t / SAMP_RATE * 256) % 256 <= chan1_pulse * 256 / 100) - chan1_amp
+ chan2_amp * 2 * (floor(chan2_freq * t / SAMP_RATE * 256) % 256 <= chan2_pulse * 256 / 100) - chan2_amp
+ (chan3_amp / 128) * (((255 * chan3_freq * t / SAMP_RATE) & 255) - 128)
+ chan4_amp * 2 * (floor(chan4_freq * t / SAMP_RATE * 256) % 256 <= chan4_pulse * 256 / 100) - chan4_amp
+ chan5_amp * 2 * (floor(chan5_freq * t / SAMP_RATE * 256) % 256 <= chan5_pulse * 256 / 100) - chan5_amp
+ (chan6_amp / 128) * (floor(65536 * sin(noiseFreq*noiseFreq)) & 255) - chan6_amp