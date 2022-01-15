G1 = 0.75,
A1 = 0.84,
B1 = 0.94,
C2 = 1,
D2 = 1.12,
E2 = 1.26,
F2 = 1.33,
G2 = 1.5,
A2 = 1.68,
B2 = 1.89,
C3 = 2,
E3 = 2.52,
RE = 0,
tfix = t / 4,
b = tfix / 2350,
r = int(b),
y = r % 16,
// a = bass
a = [C2, C2, RE, C2, RE, C2, RE, G1, C2, C2, RE, C2, RE, C2, RE, D2][r % 16],
// j = arp
j = [C3, G2, E2, C2, C3, G2, E2, C2, C3, G2, E2, C2, C3, G2, E2, C2, A2, F2, C2, A1, A2, F2, C2, A1, B2, G2,
	D2, B1, B2, G2, D2, B1],
// je = arp echo
je = [B1, C3, G2, E2, C2, C3, G2, E2, C2, C3, G2, E2, C2, C3, G2, E2, C2, A2, F2, C2, A1, A2, F2, C2, A1, B2,
	G2, D2, B1, B2, G2, D2],
// melody
mel = [RE, RE, E2, RE, F2, G2, G1, C2, RE, RE, D2, C2, RE, RE, RE, RE, RE, RE, G2, F2, G2, A2, RE, G1, C2, C2,
	D2, C2, RE, RE, RE, RE, RE, RE, E2, RE, F2, G2, G1, C2, RE, RE, D2, C2, RE, RE, RE, RE, RE, RE, G2, G2,
	A2, G2, A2, RE, C3, G2, C3, RE, RE, RE, RE],
// melody echo
melecho = [RE, RE, RE, E2, RE, F2, G2, G1, C2, RE, RE, D2, C2, RE, RE, RE, RE, RE, RE, G2, F2, G2, A2, RE, G1,
	C2, C2, D2, C2, RE, RE, RE, RE, RE, RE, E2, RE, F2, G2, G1, C2, RE, RE, D2, C2, RE, RE, RE, RE, RE, RE,
	G2, G2, A2, G2, A2, RE, C3, G2, C3, RE, RE, RE, RE],
z = 27.1,
(b < 64 ? 0 : sin(tfix * (a / z) + sin(tfix * a / z) * 4 * (2 - b % 2)) * 32 + 32) +
	(b < 0 ? 0 : tfix * j[r % 32] * 8 % 172 > 80 + abs(5 - (b * 24 % 12)) ? 20 : 0) +
	(b < 0 ? 0 : tfix * je[r % 32] * 8 % 172 > 80 + abs(5 - (b * 24 % 12)) ? 10 : 0) +
	(b < 32 ? 0 : sin(tfix * (1 / z) + sin(tfix * A1 / z) * 7 * (1 - b * 2 % 4 > 0 ? 1 - b * 2 % 4 : 0)) *
		(40 - b * 15 % 30) + 40) +
	(b < 96 ? 0 : random() * (24 - (b * 28 % 28))) +
	(b < 96 ? 0 : random() * (r % 4 === 2 ? 38 - (b * 32 % 32) : 0)) +
	(b < 128 ? 0 : tfix * mel[r % 64] * 8 % 172 > 80 + abs(5 - (b * 84 % 84)) ? 40 : 0) +
	(b < 128 ? 0 : tfix * melecho[r % 64] * 8 % 172 > 80 + abs(5 - (b * 84 % 84)) ? 10 : 0);
