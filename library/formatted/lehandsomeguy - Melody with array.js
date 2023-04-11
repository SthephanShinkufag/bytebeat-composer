time = t / 32000,
fract = x => x % 1,
main = function(time) {
	speed = 1.5;
	pitch = 0;
	melody_notes = [
		[0, 4, 7, 4, 0, 4, 7, 4, -1, 4, 7, 4, -1, 4, 7, 9],
		[-12, -8, -12, -8, -12, -8, -12, -8, -13, -8, -13, -8, -13, -8, -13, -8],
		[12 + 12, 11 + 12, 9 + 12, 7 + 12, 4 + 12, 9 + 12, 11 + 12, 14 + 12]
	];
	melody = 0;
	for(i = 0; i < melody_notes.length; i++) {
		melody_tune = pow(
			pow(2, 1 / 12),
			(melody_notes[i][floor(time * speed) % melody_notes[i].length] + pitch) - 49
		) * 44100;
		melody += sin(time * melody_tune) * (1 - fract(time * speed));
	}
	return melody / melody_notes.length;
},
main(time);
