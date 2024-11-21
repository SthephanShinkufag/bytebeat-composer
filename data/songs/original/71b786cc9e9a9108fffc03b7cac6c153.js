const melodyarray = 'mkpookmkrppkwtpomutprppk';
const chordarray = 'ptwtwtkororokororoptwtwtptwtwtimpmpmptwtkoptwtwt';
const snarearray = ' zz';
let freq = 600;

return function (time, sampleRate) {
	const melpitch = 2**((melodyarray.charCodeAt(time*2%24)-58)/12)*(23/440)*freq;
	const chordpitch = 2**((chordarray.charCodeAt(time*4%48)-58)/12)*(23/440)*freq/4;
	const melody = time*melpitch%1;
	const chord = time*chordpitch%1;
	const snare = 0.01*random()*(snarearray.charCodeAt(time*2%3))*(1-(time*2%1));
	return melody-chord+snare;
}