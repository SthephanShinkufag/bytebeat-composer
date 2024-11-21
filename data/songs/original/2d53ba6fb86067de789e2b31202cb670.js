t ? 0 : (SPEED = Y = 0, X = 'repeat', R = sin, G = Array(LEN = 28800).fill(0)),

	TEMPO = Y++ * .8,
	MEASURE = TEMPO / 65536 % 64,
	SPEED += I = .9 + (sin(Y / 131072) * .02),
	CLAMP = (x, y = 0, z = 255) =>
	min(max(x, y), z),
	CLAMP2 = (x, f) => (
		J = 0, x = min(max(x % 256, G[J] - f), G[J] + f), G[J] = x, J++, x
	),
	NAN = k => k == NaN ? 0 : k,
	PITCH = (k, MEL, q, z = TEMPO >> 12) => q(k * (NAN(MEL = MEL.charCodeAt(z % MEL.length)) <= 32 ? 0 : 2 ** ((MEL - 74) / 12))),
	t2 = Y,
	REVERB = (x, L, F, D, W) => (
		E = J + (Y % LEN), x = x * D + W * G[E], G[E] = x * F, J += L, x
	),
	TEMPO /= 4,
	ARP = abs(8 - (int((STEP = TEMPO / 8192) * 8)) % 16),
	S = STEP * 2 % 32,
	Arp = 'pmkhrnkirmkipmih',
	INCLUDES = (y, ...x) => [...x].includes(y),
	SONG = {
		BASS: (SPEED, u = (sqrt(111)*(TEMPO>>11)%43.7|E*sqrt(255)*(TEMPO>>13)%6)*1.4+(TEMPO>>14)*4%11.1, k = k =>
				k / 4 % 64 + (k / 4 + SPEED / 1600) % 64 ) =>
			PITCH(SPEED, 'EB JILIG', k, u),
		LEAD: PITCH(SPEED, ' ZX aXZ _X', k =>
			cbrt(R(k * PI / 64)) * 45, 1+(11.5*(TEMPO>>11)%51|E*7.1*(TEMPO>>13)%77.9)*3+(TEMPO>>14)*1.5%17.1) + 32,
		ARP: SPEED =>
			(PITCH(SPEED * 2 ** ((12 * -int(ARP / 4)) / 12), Arp, k =>
				(k / 8 & 31) * 1.5,
				ARP % 4 + (int(S / 8) * 4))),
		MEL: SPEED =>
			PITCH(SPEED, Arp, k => R(k * PI / 256) ** 3 * 32, (STEP * 2 | 0) * PI % 3.7 + (MEASURE | 0) * 4) * 2 * (STEP % 8 < 7)
	},
	INIT = {
		PITCH: (a, b, c) =>
			(REVERB(CLAMP2(
				SONG.BASS(SPEED) + (
					SONG.BASS(SPEED/2, (TEMPO >> 15 & 3) * 3, k => R(k * PI / 64)*64) + 
					SONG.BASS(SPEED * 1.5, (TEMPO >> 15 & 3) * 3, k => R(k * PI / 64)*64) + 
					SONG.BASS(SPEED * (TEMPO >> 15 & 1 ? TEMPO >> 16 & 1 ? 2.25 : 2.5 : TEMPO >> 16 & 1 ? 3 : 2.5), (TEMPO >> 15 & 3) * 3, k => R(k * PI / 64)*64)) / 3,
				R(t / 65536) * 4 + 8) + SONG.ARP(SPEED) + 
				(MEASURE > 8) * (INCLUDES(TEMPO >> 12 & 15, 0, 5, 7, 8, 11, 13) * cbrt(R(cbrt(TEMPO & (MEASURE > 14 ? 4095 : 16383)) * 24)) + (MEASURE > 14) * (TEMPO>>13&1) * (-TEMPO & 8191) / 4095 * random()) * 32 + 
				(MEASURE > 16) *  (SONG.LEAD + SONG.BASS(SPEED * 1.5)) +  
        		(MEASURE > 24) * SONG.MEL(SPEED) - 
				(MEASURE > 32) * (SONG.ARP(SPEED * 1.5) + (SONG.MEL(SPEED * 2) + SONG.MEL(SPEED / 2)) / 2), 12288, a, b, c) / 256 - 1.4) / (MEASURE > 16 ? 2 : 1.5)
	},

	FINAL = [
		CLAMP(INIT.PITCH(.4, .7 + R(SPEED / 67890) / 7, 1.2 + R(SPEED / 77777) / 10) + 1) - 1,
		CLAMP(INIT.PITCH(.4, .7 + R(SPEED / 95492) / 7, 1.2 + R(SPEED / 65500) / 10) + 1) - 1
	], FINAL