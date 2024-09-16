slide = min(1, t / 1024 % 8),
t ? (
	note += 2 ** (pitch = [
		-2,
		-2 + 5 * slide,
		3 - 5 * slide,
		-2 + 5 * slide,
		3 + 4 * slide,
		7 - 2 * slide,
		5 - 3 * slide,
		2 + slide,
		3 - (3 - (cycle_pitch1 = 5 * (t >> 17 & 1))) * slide,
		cycle_pitch1,
		cycle_pitch1,
		cycle_pitch1 + slide * ((cycle_pitch2 = 2 * cycle_pitch1 - 2) - cycle_pitch1),
		cycle_pitch2,
		cycle_pitch2
	][t >> 13 & 15] / 12),
	isNaN(pitch) ? note = 6e4 : 0
) : (
	note = 6e4,
	this.delay = Array(12288 /* This value is the amount of samples for the delay.
		In this case, I went with 3/4 of a beat, which is 16384 * 3 / 4 = 12288 samples.
		If you have a specific BPM on the song, you may have to tinker around with it for a while,
		be manually trying it or just using a formula. Songs which change BPM though is a different hassle...
		p.s. this has to be a non-negative integer to work */
	).fill(0 /* This is to prevent NaN-related issues. 0 should be fine for most purposes. */)
),
melody = (
	note % 64 + note % 63.8 + note % 64.15 +
	note % 64.35 + note % 63.5 /* This is just an example of unison. */
) / 3 - 52 + delay.shift(), /* Make sure the shift adds to the variable that you want the delay/echo
	effect for, or else it will sound a bit lacking. */
delay.push(melody / 3 /* Here you can set how loud the delay should be.
	Make sure the delay is sufficiently quiet enough, or else you'll have some problems or weird effects.
	You can also move the divisor to the shift function if need be. */),
melody + 128;

/*   a cheat sheet for stuff like this, i guess?
 *
 *   t ? 0 : delay = Array(<int>).fill(0),
 *   toDelay = <function> + delay.shift(),
 *   delay.push(toDelay / <value>),
 *   toDelay
 *
 */
