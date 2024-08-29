const freq=500;
const keyshift=8;
const array=[0,0,-5,0,-2,-2,-7,-2,-4,-4,-9,-4,-5,-5,-10,-5];
const array2=[4,4,-2,4,2,2,-5,2,0,0,-5,0,-1,-1,-7,-1];
const array3=[24,22,20,19];
const array4=[28,26,24,23];

function pitchshifter(x) {
	return 2**((keyshift+x)/12);
}

function square(x) {
	return sign(sin(x));
}

function decay(x,y) {
	return x/exp(y);
}

function noise(x) {
	return sin((x|0)**3);
}

return function(t) {
	let song=(t>16)*decay(square(t*freq*pitchshifter(array[l=2*t&15])),c=t*(2+(2*t&2))%2);
	song+=(t>32)*decay(square(t*freq*pitchshifter(array2[l])),c);
	song+=(t>48)*(t&1)*decay(square(t*freq*pitchshifter(array3[p=t/2&3])),x=2*t%2)/2;
	song+=(t>48)*(t&1)*decay(square(t*freq*pitchshifter(array4[p])),x)/2;
	song+=decay(noise(t*[9e3,9e9,4e3,9e3][4*t&3]),16*t%4)*!(t*12&1);
	return song/4;
}