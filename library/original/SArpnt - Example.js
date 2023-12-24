let lastSample = 0; // variables here are static and can always be accessed
let resonanceMomentum = 0;
const notedata = "$$$000,,,,,,,,''"; // this is a good place to store constants like note values because creating arrays and such constantly ruins performance
// note that this is a bad example, a string like this isn't an issue
// this is also a good place to do decompression calculations, for storing things like samples efficiently

return function (time, sampleRate) { // time is in secs, note that samplerate can still change the sound when static variables are used, this is why samplerate is given
	const pitch = 2 ** ((notedata.charCodeAt(time * 4.3 & 15) + 22) / 12); // grab values from string and convert semitones to hz
	const pulse = ((time * pitch % 1 > (time / 2 % 1) * .6 + .2) - .5) / 2; // generate pulse wave
	lastSample += resonanceMomentum += (pulse - lastSample - resonanceMomentum * 3) / (cos(time / 5) * 170 + 200); // lowpass with resonance, doesn't work on other samplerates
	const kick = (sin((time * 4.3 % 2 + .01) ** .3 * 180)) / 4;
	return lastSample + kick;
}