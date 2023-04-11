time = t / 32000,
fract = x => ((x % 1) + 1) % 1,
clamp = (a, b, c) => max(min(a, c), b),
noise = x => sin((x + 10) * sin(pow(x + 10, fract(x) + 10))),
floattobyte = x => (clamp(x, -0.9999, 0.9999) * 128) + 128,
a = noise(time) * pow(1 - fract(time * 8), 4) * 0.25,
a += sin(pow(1 - fract(time * 2), 10) * 100),
floattobyte(a / 3);
