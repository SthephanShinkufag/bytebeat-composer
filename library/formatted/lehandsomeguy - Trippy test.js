time = t / 44100,
fract = function(x) {
	return x % 1;
},
mod = function(a, b) {
	return a % b;
},
tri = function(x) {
	return 2 * asin(sin(x)) / PI;
},
noise = function(x) {
	return sin((x + 10) * sin(pow(x + 10, fract(x) + 10)));
},
main = function(x) {
	s = 0;
	for(i = 0; i < 10; i++) {
		s += tri(time * (1000 + i + (mod(floor((time + (i * 0.02)) * 8), 16) * (250 + (i * 3)))));
	}
	s /= 9;
	s += sin(time * 250) * 0.5;
	s += sin(pow(1 - fract(time * 2), 10) * 100);
	s += noise(time) * (1 - pow(fract(time * 8), 0.2 + (0.2 * (mod(time, 4) < 0.5)))) * 0.5;
	return s * 0.7;
},
main(time);
