time = t / 11025,
fract = x => x % 1,
mix = (a, b, c) => (a * (1 - c)) + (b * c),
noise = x => sin((x + 10) * sin(pow(x + 10, fract(x) + 10))),
main = function(time) {
	a = 0;
	for(j = 0; j < 13; j++) {
		a += sin((2100 + (noise((j + 2) + floor(time)) * 2500)) * time) *
			(1 - fract(time * floor(mix(1, 5, noise((j + 5.24) + floor(time))))));
	}
	return a / 9;
},
main(time);
