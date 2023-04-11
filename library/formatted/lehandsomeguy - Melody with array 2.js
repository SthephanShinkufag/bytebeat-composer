time = t / 44100,
fract = x => x % 1,
puls = x => (floor(sin(x)) + 0.5) * 2,
main = function(time) {
	speed = 2;
	pitch = 0;
	melody_notes = [
		[2, 4, 5, 9, 2, 4, 5, 9, -2, 4, 5, 9, -2, 4, 5, 9],
		[-10, -10, -10, -10, -10, -10, -10, -10, -14, -14, -14, -14, -14, -14, -12, -12],
		[-22, -19, -22, -19, -22, -19, -22, -19, -26, -22, -26, -22, -26, -22, -24, -20]
	];
	melody = 0;
	for(i = 0; i < melody_notes.length; i++) {
		melody_tune = pow(
			pow(2, 1 / 12),
			(melody_notes[i][floor(time * speed) % melody_notes[i].length] + pitch) - 49
		) * 44100;
		melody += puls(time * melody_tune) * (1 - fract(time * speed));
	}
	return melody / melody_notes.length;
},
main(time);
