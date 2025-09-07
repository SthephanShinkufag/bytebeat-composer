SAMP_RATE = 44100,
BPM = 100,
tsamp = t / SAMP_RATE,
beat = BPM * tsamp / 60,
tick = floor(beat * 48) % 776,


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
	(tick >= 0 && tick < 36) * G + 
	(tick >= 36 && tick < 48) * A + 
	(tick >= 48 && tick < 60) * B + 
	(tick >= 60 && tick < 72) * (C * 2) + 
	(tick >= 84 && tick < 120) * (D * 2) + 
	(tick >= 120 && tick < 132) * (EE * 2) + 
	(tick >= 144 && tick < 156) * (D * 2) + 
	(tick >= 168 && tick < 180) * (C * 2) + 
	(tick >= 192 && tick < 204) * B + 
	(tick >= 216 && tick < 228) * A + 
	(tick >= 240 && tick < 252) * G + 
	(tick >= 264 && tick < 276) * B + 
	(tick >= 288 && tick < 360) * A + 
	(tick >= 416 && tick < 428) * G + 
	(tick >= 428 && tick < 440) * B + 
	(tick >= 440 && tick < 452) * (D * 2) + 
	(tick >= 452 && tick < 464) * (G * 2) + 
	(tick >= 476 && tick < 512) * (EE * 2) + 
	(tick >= 512 && tick < 524) * (G * 2) + 
	(tick >= 536 && tick < 560) * (D * 2) + 
	(tick >= 560 && tick < 584) * B + 
	(tick >= 584 && tick < 608) * (C * 2) + 
	(tick >= 608 && tick < 632) * (D * 2) + 
	(tick >= 632 && tick < 656) * B + 
	(tick >= 656 && tick < 668) * (C * 2) + 
	(tick >= 668 && tick < 680) * (D * 2) + 
	(tick >= 680 && tick < 704) * (EE * 2) + 
	(tick >= 704 && tick < 728) * A + 
	(tick >= 728 && tick < 752) * Gb + 
	(tick >= 752 && tick < 776) * D,
chan1_amp = 32,
chan1_pulse = 60,

tick -= 36,

chan2_freq =
	(tick >= 0 && tick < 36) * G + 
	(tick >= 36 && tick < 48) * A + 
	(tick >= 48 && tick < 60) * B + 
	(tick >= 60 && tick < 72) * (C * 2) + 
	(tick >= 84 && tick < 120) * (D * 2) + 
	(tick >= 120 && tick < 132) * (EE * 2) + 
	(tick >= 144 && tick < 156) * (D * 2) + 
	(tick >= 168 && tick < 180) * (C * 2) + 
	(tick >= 192 && tick < 204) * B + 
	(tick >= 216 && tick < 228) * A + 
	(tick >= 240 && tick < 252) * G + 
	(tick >= 264 && tick < 276) * B + 
	(tick >= 288 && tick < 360) * A + 
	(tick >= 416 && tick < 428) * G + 
	(tick >= 428 && tick < 440) * B + 
	(tick >= 440 && tick < 452) * (D * 2) + 
	(tick >= 452 && tick < 464) * (G * 2) + 
	(tick >= 476 && tick < 512) * (EE * 2) + 
	(tick >= 512 && tick < 524) * (G * 2) + 
	(tick >= 536 && tick < 560) * (D * 2) + 
	(tick >= 560 && tick < 584) * B + 
	(tick >= 584 && tick < 608) * (C * 2) + 
	(tick >= 608 && tick < 632) * (D * 2) + 
	(tick >= 632 && tick < 656) * B + 
	(tick >= 656 && tick < 668) * (C * 2) + 
	(tick >= 668 && tick < 680) * (D * 2) + 
	(tick >= 680 && tick < 704) * (EE * 2) + 
	(tick >= 704 && tick < 728) * A + 
	(tick >= 728 && tick < 752) * Gb + 
	(tick >= 752 && tick < 776) * D,
chan2_amp = 10,
chan2_pulse = 30,

ts256 = tsamp * 256,
ts128 = 2 * tsamp + 128,

128 + chan1_amp * 2 * (int(chan1_freq * ts256) % 256 <= chan1_pulse * 256 / 100) - chan1_amp +
	3 / 4 * (chan1_amp / 64) * (abs(((255 * chan1_freq * ts128) & 255) - 128) - 64) +
	chan2_amp * 2 * (int(chan2_freq * ts256) % 256 <= chan2_pulse * 256 / 100) - chan2_amp +
	3 / 4 * (chan2_amp / 64) * (abs(((255 * chan2_freq * ts128) & 255) - 128) - 64);