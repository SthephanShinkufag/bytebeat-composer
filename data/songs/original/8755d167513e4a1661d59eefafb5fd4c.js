song = t => (
s = (x, u) => (
  2 ** (parseInt(x[(t >> u) % x.length], 36) / 12)
),
h = (a, S, c) => (
  c <= 0 || (c != trunc(c)) ? 0 :
  (div = floor(255 / a.length),
  q = q =>t / c * (s(q[(t >> S) % q.length])) % div,
  a.length == 2 ? q(a[0]) + q(a[1]) :
  a.length == 3 ? q(a[0]) + q(a[1]) + q(a[2]) :
  a.length == 4 ?
  q(a[0]) + q(a[1])
  + q(a[2]) + q(a[3]) : 
  0)
),
t *= 1.05, r = 16383, u = 8192,
a = t => (
((t * s('JIGC9520259CGIJ2', 13)) * (s('0235', 17)) & 128) % 256 / 3 * (1 - t / u % 1) * 1.2
),
c = 128 * tanh(sin(2 * (t & 16383) ** .5)) * (1 - t / 16383 % 1) * (1 & -t >> 14) + (t * sin(t >> 2) & 255) * (-t & 32767) / 5e4 * (1 & t >> 15),
min(max((
((h(['79AC','0235'], 17, 4) / 2) * (t / r % 2) * (1 - t % (u = r / 2) / 1e4)) + a(t) + min(max(c, -128), 127) / 2) - 48, -64), 63) * 2
),
[song(t|7),song(t|3)]