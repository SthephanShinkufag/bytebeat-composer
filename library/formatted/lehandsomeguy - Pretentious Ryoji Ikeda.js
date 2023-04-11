time = t / 32000,
fract = x => ((x % 1) + 1) % 1,
puls = x => (floor(sin(x)) + 0.5) * 2,
hash = x => fract(sin(x * 1342.874 + sin(5212.42 * x)) * 414.23),
main = function(time) {
	time *= 0.93 + ((sin(time) * 0.01) / time);
	a = sin(time * 99000) * pow(1 - fract(time * 0.5), 100);
	a += sin(time * 300) * [1, 1, 0, 0, 1, 0, 0, 0, 1][floor(time) % 9] * 0.5;
	a += sin(time * 200) * [0, 0, 0, 0, 0, 0, 1, 1][floor(time) % 8] * 0.5;
	a += puls(time * 80000) * [1, 1, 0, 0, 1, 0, 0, 0, 1][floor(time * 2) % 9] * pow(1 - fract(time * 8), 90);
	a += puls(time * 80000) *
		[0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1][floor(time * 2) % 15] * pow(1 - fract(time * 16), 90);
	for(i = 0; i < 5; i++) {
		a += sin(time * (200 + ((1 + hash(i + 0.3 + floor(time * 0.25))) * 1100))) * 0.02;
	}
	a += sin(pow(1 - fract(time * 32), 5) * 20) *
		[0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0][floor(time * 4) % 16] * 0.06;
	a += (sin(time * 9000) + sin(time * 9060)) * pow(1 - fract(time * 0.125), 100) * 0.2;
	return a * 0.8;
},
main(time);
