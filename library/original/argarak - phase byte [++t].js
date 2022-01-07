/*
 * phase byte [++t]
 * by argarak
 * for battle of the bits - summer chip ix
 */

/* hello! */
/* -- static sequence data -- */

bass_seq = [0.1, 0.05, 0.1, 0.2, 0.2, 0.1, 0.2, 0.1],
pad_seq = [0.05, 0.1, 0.15, 0.2, 0.15],
lead_seq = [2,3,1,5,4,3,2,1,7,6,5,4],
chord_seq = [[0.2,0.4,0.1],[0.4,0.8,0.5],[0.6,1,0.65]],

key = 1,
mixer = [],

/* -- mixer default values --           */
/*          bdr snr hat bas plk pad lea */
/* mixer = [16, 4,  8,  4,  2,  10, 20] */

/* volume sequence */

(t>1300000?    mixer=[0, 0, 0, 0, 0, 0, 0,  6] :
 t>1150000?    mixer=[0, 0, 0, 0, 0, 0, 10, 6] :
 t>1000000?    mixer=[0, 0, 8, 0, 2, 0, 10, 6] :
 t>950000?     mixer=[0, 0, 8, 0, 2, 0, 10, 0] :
 t>750000?     mixer=[16,4, 8, 4, 2, 10,10, 0] :
 t>700000?     mixer=[0, 0, 0, 0, 0, 0, 10, 0] :
 t>600000?     mixer=[16,4, 8, 4, 2, 10,10, 0] :
 t>490000?     mixer=[0, 0, 0, 4, 2, 10,10, 0] :
 t>430000?     mixer=[0, 0, 0, 4, 2, 10, 0, 0] :
 t>150000?     mixer=[16,4, 8, 4, 2, 10, 0, 0] :
 t>110000?     mixer=[16,4, 8, 0, 2,  0, 0, 0] :
 t>75000?      mixer=[0, 4, 8, 0, 2,  0, 0, 0] :
 t>50000?      mixer=[0, 0, 8, 0, 2,  0, 0, 0] :

 /* plinky fade in section */
 t>45000?      mixer=[0, 0, 0, 0, 2,   0, 0, 0] :
 t>30000?      mixer=[0, 0, 0, 0, 1.5, 0, 0, 0] :
 t>10000?      mixer=[0, 0, 0, 0, 1,   0, 0, 0] :
 t>0?          mixer=[0, 0, 0, 0, 0.5, 0, 0, 0] : 0),

/* sequence sequence */

t>490000?plinky_seq=[0.5, 0.6, 0.3, 0.4, 0.1, 0.15, 0.4, 0.15]:plinky_seq=[0.35, 0.04, 0.2, 0.2, 0.45, 0.5, 0.4, 0.2],
t>850000?key=1:t>750000?key=2:t>430000?key=1:t>365000?key=2:t>300000?key=1:t>250000?key=2:0,

/* chord section fade out */

fade_out = [6,5,4,3,2,1,0],
t<1560000?(t>1500000?mixer[7]=fade_out[int(t/16000) % fade_out.length]:0):mixer[7]=0,

/* fix dc offset */
-64 +

/* -- drums -- */
/* bd [sine w/ volume+freq envelopes] */
(32 + sin(t * 0.01 * (((t)*0.001^3)%8)) * (((t)*0.001^3)%4) * mixer[0]) + 

/* snare [noise w/ envelope] */
(32 + Math.random() * (((t)*0.0005^3)%4) * mixer[1]) +

/* hihat [noise w/ shorter envelope] */
(32 + Math.random() * (((t)*0.002^3)%2) * mixer[2]) +

/* -- melodic -- */
/* bass [phase mod] */
(32 + sin(t * (key/2) * bass_seq[int(t/4000) % bass_seq.length] + ((32 + sin(t * 0.05)))) * (((t)*0.002^3)%8) * mixer[3]) +

/* plinky plonky sine thing */
(32 + sin(t * key * plinky_seq[int(t/4000) % plinky_seq.length]) * (((t)*0.004^3)%8) * mixer[4]) +

/* pad [phase mod w/ envelope] */
(32 + sin(t * key * pad_seq[int(t/16000) % pad_seq.length] + ((32 + sin(t * 0.05) * (sin(t * 0.0001) * 10)))) * mixer[5]) +

/* lead [phasemod w/ envelope, changes with frequency] */
(-8 + sin(t * (key / 10) * lead_seq[int(t/4000) % lead_seq.length] + (32 + sin(t * 0.1) * 0.2 * lead_seq[int(t/4000) % lead_seq.length] * (((t)*0.0005^3)%6))) * (((t)*0.001^3)%5) * mixer[6]) +

/* fadey-in phasemod chords [sine modulation + vol envelope] */
(4 + sin(t * chord_seq[0][int(t/16000) % chord_seq[0].length] + ((32 + sin(t * 0.1) * 3 * sin(t * 0.0001)))) * mixer[7] * ((sin(t * 0.1) * 3 * sin(t * 0.0001)))) +
(4 + sin(t * chord_seq[1][int(t/16000) % chord_seq[1].length] + ((32 + sin(t * 0.1) * 3 * sin(t * 0.0001)))) * mixer[7] * ((sin(t * 0.1) * 3 * sin(t * 0.0001)))) +
(4 + sin(t * chord_seq[2][int(t/16000) % chord_seq[2].length] + ((32 + sin(t * 0.1) * 3 * sin(t * 0.0001)))) * mixer[7] * ((sin(t * 0.1) * 3 * sin(t * 0.0001))))
