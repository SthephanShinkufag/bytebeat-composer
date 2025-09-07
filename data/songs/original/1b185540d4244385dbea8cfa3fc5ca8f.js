/*
	Peer Gynt. Op. 23: IV - "In the Hall of the Mountain King"
	
	Cover by eSlashMachine
*/
SAMP_RATE = 48000,
BPM = 119,
beat = BPM * (t / SAMP_RATE) / 60,
tick = (beat * 200) % 3200,

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

chan1_freq =
	(tick >= 0 && tick < 100) * A / 2 + 
	(tick >= 100 && tick < 200) * B / 2 +
	(tick >= 200 && tick < 300) * C + 
	(tick >= 300 && tick < 400) * D +
	(tick >= 400 && tick < 500) * EE + 
	(tick >= 500 && tick < 600) * C +
	(tick >= 600 && tick < 800) * EE + 
	(tick >= 800 && tick < 900) * Eb +
	(tick >= 900 && tick < 1000) * B / 2  + 
	(tick >= 1000 && tick < 1200) * Eb  + 
	(tick >= 1200 && tick < 1300) * D  +
	(tick >= 1300 && tick < 1400) * Bb / 2  +
	(tick >= 1400 && tick < 1600) * D +
	(tick >= 1600 && tick < 1700) * A / 2 + 
	(tick >= 1700 && tick < 1800) * B / 2 +
	(tick >= 1800 && tick < 1900) * C + 
	(tick >= 1900 && tick < 2000) * D +
	(tick >= 2000 && tick < 2100) * EE + 
	(tick >= 2100 && tick < 2200) * C +
	(tick >= 2200 && tick < 2300) * EE + 
	(tick >= 2300 && tick < 2400) * A +
	(tick >= 2400 && tick < 2500) * G +
	(tick >= 2500 && tick < 2600) * EE +
	(tick >= 2600 && tick < 2700) * C +
	(tick >= 2700 && tick < 2800) * EE +
	(tick >= 2800 && tick < 3200) * G,
chan1_amp = 32,
chan1_pulse = 80,

tick -= 20, 

chan2_freq =
	(tick >= 0 && tick < 100) * A / 2 + 
	(tick >= 100 && tick < 200) * B / 2 +
	(tick >= 200 && tick < 300) * C + 
	(tick >= 300 && tick < 400) * D +
	(tick >= 400 && tick < 500) * EE + 
	(tick >= 500 && tick < 600) * C +
	(tick >= 600 && tick < 800) * EE + 
	(tick >= 800 && tick < 900) * Eb +
	(tick >= 900 && tick < 1000) * B / 2  + 
	(tick >= 1000 && tick < 1200) * Eb  + 
	(tick >= 1200 && tick < 1300) * D  +
	(tick >= 1300 && tick < 1400) * Bb / 2  +
	(tick >= 1400 && tick < 1600) * D +
	(tick >= 1600 && tick < 1700) * A / 2 + 
	(tick >= 1700 && tick < 1800) * B / 2 +
	(tick >= 1800 && tick < 1900) * C + 
	(tick >= 1900 && tick < 2000) * D +
	(tick >= 2000 && tick < 2100) * EE + 
	(tick >= 2100 && tick < 2200) * C +
	(tick >= 2200 && tick < 2300) * EE + 
	(tick >= 2300 && tick < 2400) * A +
	(tick >= 2400 && tick < 2500) * G +
	(tick >= 2500 && tick < 2600) * EE +
	(tick >= 2600 && tick < 2700) * C +
	(tick >= 2700 && tick < 2800) * EE +
	(tick >= 2800 && tick < 3200) * G,
chan2_amp = 10,
chan2_pulse = 68,
tick += 20,
chan3_freq =
	(tick >= 0 && tick < 800) * A / 8 + 
	(tick >= 800 && tick < 1200) * Ab / 8 +
	(tick >= 1200 && tick < 1600) * G / 8 +
	(tick >= 1600 && tick < 2400) * A / 8 + 
	(tick >= 2400 && tick < 2800) * C / 4 +
	(tick >= 2800 && tick < 3200) * G / 8,
chan3_amp = 40,

128 + chan1_amp * 2 * (int(chan1_freq * t / SAMP_RATE * 256) % 256 <= chan1_pulse * 256 / 100) - chan1_amp +
	3 / 4 * (chan1_amp / 64) * (abs(((255 * chan1_freq * 2 * t / SAMP_RATE + 128) & 255) - 128) - 64) +
	chan2_amp * 2 * (int(chan2_freq * t / SAMP_RATE * 256) % 256 <= chan2_pulse * 256 / 100) - chan2_amp +
	3 / 4 * (chan2_amp / 64) * (abs(((255 * chan2_freq * 2 * t / SAMP_RATE + 128) & 255) - 128) - 64) +
	(chan3_amp / 128) * (((255 * chan3_freq * t / SAMP_RATE) & 255) - 128)
