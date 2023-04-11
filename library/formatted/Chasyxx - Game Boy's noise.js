t < 1 ? this.LFSR = 65535 : 0,
this.noise ??= function(t, o = 2, w = 0) {
	processLFSR = function(width = 0) {
		S = width ? 100000100000000 : 100000000000000;
		trade = (a, b) => (LFSR[a] = LFSR[b]);
		temp = LFSR & 1 ^ ((LFSR & 2) >> 1);
		LFSR >>= 1;
		LFSR = temp ? LFSR | S : LFSR & ~S;
	};
	if((t % (1 << o)) == 0) {
		processLFSR(w);
		v = LFSR & 1;
	}
	return v * 128;
},
noise(t, 3, 0);
