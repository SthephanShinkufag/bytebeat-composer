Z = int,
P = pow,
T = sin,
I = parseInt,
S = [0, 2, 4, 7, 9, 5, 6, 19, 12, 1],
B = [0, 4, 5, 4, 0, -4, -5, -7],
a = (c, e) => c * e,
n = (c, e) => 127 * P(T(c * P(1.05946, e) / 15.9517), 3),
r = c => I(T(c).toString(16).substring(7, 9) || 0, 16) - 128,
X = c => I(T(c + 0.1).toFixed(6)[5]),
d = 5E3,
b = Z(t / d),
p = 1 - t % d / d,
W = 2 * d,
Y = Z(b / 2),
L = max(t - 3 * d, 0),
C = Z(L / W),
F = 1 - L % W / W,
N = B[Z(Y / 16) % 8],
G = 4 * d,
R = P(1 - t % G / G, 3),
a(r(t), P(p / 2, 3) + P(b % 4 === 2 && p, 0.5) / 7) +
	a(n(t, S[X(Y % 4 + Z(Y / 16))] + N), (1 - t % W / W) / 4) +
	a(n(L, S[X(C % 4 + Z(C / 16))] + B[Z(C / 16) % 8]), F / 16) +
	a(T(99 * R) > 0 ? 19 : -19, R) +
	a(r(Z(t / 4)), Z(t / G) % 2 && R / 4) +
	a(n(t, N - 48), 0.25) + 128;
