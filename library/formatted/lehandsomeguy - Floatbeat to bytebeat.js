time = t / 32000,
fract = function(x) {
	return ((x % 1) + 1) % 1;
},
clamp = function(a, b, c) {
	return max(min(a, c), b);
},
noise = function(x) {
	return sin((x + 10) * sin(pow(x + 10, fract(x) + 10)));
},
floattobyte = function(x) {
	return (clamp(x, -0.9999, 0.9999) * 128) + 128;
},
a = noise(time) * pow(1 - fract(time * 8), 4) * 0.25,
a += sin(pow(1 - fract(time * 2), 10) * 100),
a /= 3,
floattobyte(a);
