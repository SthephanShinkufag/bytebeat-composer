fm = function(n, s) {
	return Math.sin(Math.sin(Math.sin(n * PI / 128) + n * PI / 64) + n * PI / 32) / (2 + t % (s * 4096) / (s * 128));
},

h = function(n) {
	return Math.sin(Math.random()) / (2 + t % 8192 / (n * 128));
},

k = function(n) {
	return Math.sin(Math.sqrt(t * (n + 1) & 32767) * 1.4) / 3;
},

bc = function(n) {
	return Math.sin(t % 8 ? a : a = Math.random()) / (2 + t % (n * 4096) / (n * 128));
},

mel = (t >> 13 & t >> 14) % 17 % 10,
sh = (t >> 14 & t >> 13) % 7,
kh = (t >> 14 & t >> 15) % 4,

fm(t / 2.9 * mel, 2) + h(sh) + k(kh) + bc(kh + 8) - .2