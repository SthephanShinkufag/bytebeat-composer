SAMPRATE = 44100,
CIRBUFSIZE = int(SAMPRATE * 3),
TEMPOISH = SAMPRATE / 10,
SECOND = t / TEMPOISH,
BEAT = t % TEMPOISH / TEMPOISH,
NOTE = 70 *
	pow(1.5, int(SECOND / 8) % 4) *
	pow(1.122462, int((SECOND / 32) % 4)) *
	(int(SECOND % 3 + 1) + 1),
TAU = 2 * 3.141592 * NOTE / SAMPRATE,

CircularBuffer = (function makeCircularBufferCls() {
	const CircularBuffer = function(size) {
		this.buff = [];
		this.size = size;
	};
	CircularBuffer.prototype.get = function(idx) {
		return this.buff[idx % this.size] || 0;
	};
	CircularBuffer.prototype.set = function(idx, val) {
		this.buff[idx % this.size] = val;
	};
	return CircularBuffer;
})(),

buff = (function() {
	if(typeof glob === 'undefined' || glob == null) {
		glob = new CircularBuffer(CIRBUFSIZE);
	}
	return glob;
})(),

lfo = function(t, bottom, top, seconds) {
	const depth = top - bottom;
	const maX = depth;
	const range = depth * 2;
	const timeUnit = seconds * SAMPRATE;
	return top - abs(maX - range * (t % timeUnit / timeUnit));
},

ramplfo = function(t, bottom, top, seconds) {
	const depth = top - bottom;
	return bottom + depth * (t % (seconds * SAMPRATE) / (seconds * SAMPRATE));
},

wetsig = buff.get(t),
dry = sin(TAU * (
	sin(15 * TAU * t * (int(ramplfo(t, 0, 4, 16)) + 1)) * (1 - pow(BEAT, 0.5)) * lfo(t, 0.5, 1, 10) +
	wetsig * lfo(t, 0.25, 0.5, 100) + t
)) * (60 - pow(BEAT, 0.55) * 55) * min(1, t / 16 / SAMPRATE),
tot = dry + wetsig * lfo(t, 0, 0.4, 30),
buff.set(t, dry),
128 + tot;
