function percVolume(t) {
	return ((1 - t) ** 3 * cos(cbrt(t) * PI) * 2) * 4;
};
function sharpVolume(t) {
	return ((1 - t) ** 10);
};
function kickDrum(t, p) {
	return cbrt(sin(cbrt(t * p) * p * PI * 2));
};
function noiseDrum(t, p) {
   d=sin(random()*.01*sin(t*p>>4)*sin(t*p>>3)*sin(t*p>>2)*(t*p%1666)*(t*p/256));
	return d<0?d+1.5:d-1.5;
};
function instrument(time, impulseRate, timeFunc, volFunc, pitch, impulseVolMultiplier = [1], impulseRateMultiplier = [1]) {
	let impulseTime = time % (60 / impulseRate / beatsPerMinute / impulseRateMultiplier[time / 60 * impulseRate * beatsPerMinute % impulseRateMultiplier.length | 0]);
	return timeFunc(impulseTime, pitch) * volFunc(impulseTime) * impulseVolMultiplier[time / 60 * impulseRate * beatsPerMinute % impulseVolMultiplier.length | 0];
};
function clamp(val, low, high) {
	return min(max(val, low), high)
}
return function(time, rate) {
	beatsPerMinute = 150;
	t = time / 15 * beatsPerMinute * 4096;
	kick = instrument(time, 2, kickDrum, percVolume, 8, [1,0,2,0,1,1,2,0,1,0,2,0,1,1,2,1], [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2]);
	hat = instrument(time, 2, noiseDrum, sharpVolume, 1e5, [.7,.5,1,.5], [1,2,1,2,2,1,2,1]) / 2;
	snare = kick * instrument(time, 2, noiseDrum, sharpVolume, 2e4, [0,0,1,0]) / 2;
	dubstep1 = sin(t * PI / 16384) / 2 + sin((t & t >> 12) * PI * t / 22050) / 3 - sin(((t & t >> 12) ^ (t & t >> 14)) * PI * t / 32768) / 3
	dubstep2 = cos(t * PI / 16384) / 2 + cos((t & t >> 12) * PI * t / 22050) / 3 - cos(((t & t >> 12) ^ (t & t >> 14)) * PI * t / 32768) / 3
	return [clamp(kick / 2 + hat + snare * 2, -1, 1) / 1.5 + dubstep1, clamp(kick / 2 + hat + snare * 2, -1, 1) / 1.5 + dubstep2].map(a=>a/1.5)
}