const melodyarray = 'kkkor w uut rrp oop q r   r rr  '; // melody and the upper part of chord
const ch1array = '                          m mm  '; // second part of chord
const ch2array = '                          i ii  '; // third part of chord
const bassarray = 'k kw wrriiiu upp'; // bassline
const shakingshaker = 'z   '; // add z to make the shaker shake

return function (time, sampleRate) {
	const melpitch = 2**((melodyarray.charCodeAt(time*10%32)-58)/12)*29; // pitch of melody
	const ch1pitch = 2**((ch1array.charCodeAt(time*10%32)-58)/12)*29; // pitch of second part of chord
	const ch2pitch = 2**((ch2array.charCodeAt(time*10%32)-58)/12)*29; // pitch of third part of chord
	const basspitch = 2**((bassarray.charCodeAt(time*10%16)-58)/12)*29/8; // pitch of bassline
	const melody = time*melpitch%1; // generate the melody
	const ch1 = -1*time*ch1pitch%1; // generate second part of chord
	const ch2 = time*ch2pitch%1; // generate first part of chord
	const bass = -1*time*basspitch%1; // generate bassline
	const shaker = 0.01*random()*(shakingshaker.charCodeAt(time*40%4)-32); // generate noise, multiply it by the last constant, and multiply by 0.01 so it doesn't take over other parts
	return melody+ch1+ch2+bass+shaker; // generate the song
}; // normally 783 characters (that is 22% of the original song!)
