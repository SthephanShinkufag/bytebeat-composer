TAU = 2 * Math.PI,
SAMPRATE = 44100,
CIRBUFSIZE = Math.floor(
	SAMPRATE * 3
),
TEMPOISH = SAMPRATE / 10,
SECOND = t / TEMPOISH,
BEAT = t % TEMPOISH / TEMPOISH,
MEASURE = (
	Math.floor(
		SECOND / 8
	)
) % 4,
FREQ = (
	70 * (
		Math.pow(
			1.5, MEASURE
		)
	)
),
FREQ = FREQ * Math.pow(
	1.122462, Math.floor(
		(
			SECOND / 32
		) % 4
	)
),
NOTE = Math.floor(
	SECOND % 3 + 1
) * FREQ + FREQ,

CircularBuffer = (function makeCircularBufferCls() {
  var CircularBuffer = function(
	  size
  ) {
    this.buff = [];
    this.size = size;
  };
  CircularBuffer.prototype.get = function(
	  idx
  ) {
    return this.buff[
		 idx % this.size
		 ] || 0;
  };
  CircularBuffer.prototype.set = function(
	  idx, val
  ) {
    this.buff[
		 idx % this.size
		 ] = val;
  };
  return CircularBuffer;
})(),
buff = (function() {
  if (typeof glob == "undefined" || glob == null) {
    glob = new CircularBuffer(
		 CIRBUFSIZE
	 );
  }
  return glob;
})(),
lfo = function(
	t, bottom, top, seconds
) {
  var depth = top - bottom;
  var maX = depth;
  var range = depth * 2;
  var timeUnit = SAMPRATE * seconds;
  return top - Math.abs(
	  maX - range * (
		  t % timeUnit / timeUnit
	  )
  );
},
ramplfo = function(
	t, bottom, top, seconds
) {
  var depth = top - bottom;
  return bottom + depth * (
	  t % (
		  seconds * SAMPRATE
	  ) / (
		  seconds * SAMPRATE
	  )
  )
},
FMFREQ = NOTE + Math.floor(
	(
		ramplfo(
			t, 0, 4, 16
		)
		)
) * NOTE,
wetsig = buff.get(t),
dry = Math.sin(
	(
		t + Math.sin(
			t * FMFREQ * TAU / SAMPRATE
		) * (
			15 - (
				Math.pow(
					BEAT, 0.5
				) * 15
			)
		) * lfo(
		t, 0.5, 1, 10
		) + wetsig * lfo(
			t, 0.25, 0.5, 100
		)
	) * NOTE * TAU / SAMPRATE
) * (
	60 - (
		Math.pow(
			BEAT, 0.55
		) * 55
	)
) * Math.min(
	1, t / 16 / SAMPRATE
),
tot = dry + wetsig * lfo(
	t, 0, 0.4, 30
),
buff.set(
	t, dry
),
128 + tot;