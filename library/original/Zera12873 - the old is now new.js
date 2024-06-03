const melodyarray = 'kkkor w uut rrp oop q r   r rr  ';
const ch1array = '                          m mm  ';
const ch2array = '                          i ii  ';
const bassarray = 'k kw wrriiiu upp';
const shakingshaker = 'z   ';

return function (time, sampleRate) {
	const melpitch = 2**((melodyarray.charCodeAt(time*10%32)-58)/12)*29;
	const ch1pitch = 2**((ch1array.charCodeAt(time*10%32)-58)/12)*29;
	const ch2pitch = 2**((ch2array.charCodeAt(time*10%32)-58)/12)*29;
	const basspitch = 2**((bassarray.charCodeAt(time*10%16)-58)/12)*29/8;
	const melody = time*melpitch%1;
	const ch1 = -1*time*ch1pitch%1;
	const ch2 = time*ch2pitch%1;
	const bass = -1*time*basspitch%1;
	const shaker = 0.01*random()*(shakingshaker.charCodeAt(time*40%4)-32);
	return melody+ch1+ch2+bass+shaker;
}