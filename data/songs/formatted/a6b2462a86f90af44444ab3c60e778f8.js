time = t / 22050,
fract = x => ((x % 1) + 1) % 1,
hash = x => fract(sin(x * 1342.874 + sin(5212.42 * x)) * 414.23),
main = function(time) {
	time *= 0.46;
	/*  _   _       _   _   __
	 __|1|_|3|__ __|6|_|8|_|10|_
	|_0_|_2_|_4_|_5_|_7_|_9_|11_| ...

	[0,2,4,5,7,9,11,12,14,16,17,19,21,23,24]  WHITE KEYS
	[1,3,6,8,10,13,15,18,20,22,25]            BLACK KEYS
	*/
	melody_chord = [0, 2, 3, 5, 7, 9, 10, 12, 14, 16, 17, 19, 21, 22];
	speed = 3;
	s = 0;
	loops = 5;
	time_shift = 0.07;
	for(i = 0; i < loops; i++) {
		time += time_shift;
		melody_tune = pow(
			pow(2, 1 / 12),
			melody_chord[floor(hash((i * 0.24) + floor(time * speed)) * melody_chord.length)] - 49
		) * 44100;
		s += sin(time * melody_tune) * (1 - fract(time * speed));
	}
	return s / loops;
},
main(time);
