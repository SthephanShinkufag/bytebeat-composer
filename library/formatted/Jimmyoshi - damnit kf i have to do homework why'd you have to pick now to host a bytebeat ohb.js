SAMP_RATE = 22050,
BPM = 150,
beat = BPM * (t / SAMP_RATE) / 60,
tick = int(beat * 48) % 384,

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
	(tick >= 0 && tick < 36) * B + (tick >= 36 && tick < 48) * Eb * 2 +
	(tick >= 48 && tick < 60) * Gb * 2 + (tick >= 72 && tick < 84) * B * 2 +
	(tick >= 94 && tick < 96) * Ab * 2 + (tick >= 96 && tick < 120) * A * 2 +
	(tick >= 120 && tick < 132) * Ab * 2 + (tick >= 144 && tick < 156) * Gb * 2 +
	(tick >= 168 && tick < 180) * EE * 2 + (tick >= 192 && tick < 216) * Eb * 2 +
	(tick >= 216 && tick < 228) * EE * 2 + (tick >= 240 && tick < 252) * F * 2 +
	(tick >= 264 && tick < 278) * Gb * 2,
chan1_amp = 32,
chan1_pulse = 50,

tick -= 24, // delay

chan2_freq =
	(tick >= 0 && tick < 36) * B + (tick >= 36 && tick < 48) * Eb * 2 +
	(tick >= 48 && tick < 60) * Gb * 2 + (tick >= 72 && tick < 84) * B * 2 +
	(tick >= 94 && tick < 96) * Ab * 2 + (tick >= 96 && tick < 120) * A * 2 +
	(tick >= 120 && tick < 132) * Ab * 2 + (tick >= 144 && tick < 156) * Gb * 2 +
	(tick >= 168 && tick < 180) * EE * 2 + (tick >= 192 && tick < 216) * Eb * 2 +
	(tick >= 216 && tick < 228) * EE * 2 + (tick >= 240 && tick < 252) * F * 2 +
	(tick >= 264 && tick < 278) * Gb * 2,
chan2_amp = 4,
chan2_pulse = 50,

tick += 24, // un-delay

chan3_freq =
	(tick >= 0 && tick < 24) * B / 8 + (tick >= 36 && tick < 60) * B / 4 +
	(tick >= 72 && tick < 84) * Gb / 4 + (tick >= 96 && tick < 120) * A / 8 +
	(tick >= 132 && tick < 156) * A / 4 + (tick >= 168 && tick < 180) * EE / 4 +
	(tick >= 192 && tick < 216) * B / 8 +
	(tick >= 228 && tick < 252) * B / 4 + (tick >= 262 && tick < 274) * Gb / 4 +
	(tick >= 286 && tick < 298) * A / 8 + (tick >= 310 && tick < 322) * A / 8 +
	(tick >= 334 && tick < 346) * A / 8 + (tick >= 358 && tick < 370) * A / 8,
chan3_amp = 32,

chan4_freq = (tick >= 312 && tick < 324) * Gb * 2 + (tick >= 336 && tick < 360) * Gb * 2,
chan4_amp = (tick >= 312 && tick < 324) * 24 + (tick >= 336 && tick < 360) * 24,
chan4_pulse = 25,

chan5_freq = (tick >= 312 && tick < 324) * Db * 2 + (tick >= 336 && tick < 360) * Db * 2,
chan5_amp = (tick >= 312 && tick < 324) * 24 + (tick >= 336 && tick < 360) * 24,
chan5_pulse = 25,

chan6_freq = (tick >= 312 && tick < 324) * A + (tick >= 336 && tick < 360) * A,
chan6_amp = (tick >= 312 && tick < 324) * 24 + (tick >= 336 && tick < 360) * 24,
chan6_pulse = 25,

chan7_freq = A,
chan7_amp = (tick % 12 < 3) * 32 * (6 - ((tick / 12) % 4)) / 6,

noiseFreq = int(t * (chan7_freq * 44100 / SAMP_RATE) / 440),

128 + chan1_amp * 2 * (int(chan1_freq * t / SAMP_RATE * 256) % 256 <= chan1_pulse * 256 / 100) - chan1_amp +
	3 / 4 * (chan1_amp / 64) * (abs(((255 * chan1_freq * 2 * t / SAMP_RATE + 128) & 255) - 128) - 64) +
	chan2_amp * 2 * (int(chan2_freq * t / SAMP_RATE * 256) % 256 <= chan2_pulse * 256 / 100) - chan2_amp +
	3 / 4 * (chan2_amp / 64) * (abs(((255 * chan2_freq * 2 * t / SAMP_RATE + 128) & 255) - 128) - 64) +
	(chan3_amp / 128) * (((255 * chan3_freq * t / SAMP_RATE) & 255) - 128) +
	chan4_amp * 2 * (int(chan4_freq * t / SAMP_RATE * 256) % 256 <= chan4_pulse * 256 / 100) - chan4_amp +
	chan5_amp * 2 * (int(chan5_freq * t / SAMP_RATE * 256) % 256 <= chan5_pulse * 256 / 100) - chan5_amp +
	chan6_amp * 2 * (int(chan6_freq * t / SAMP_RATE * 256) % 256 <= chan6_pulse * 256 / 100) - chan6_amp +
	(chan7_amp / 128) * (int(65536 * sin(noiseFreq * noiseFreq)) & 255) - chan7_amp;
