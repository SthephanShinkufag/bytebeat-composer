// Adventure's began - Kouzerumatsukite
T = t * 6 / 32000,
sqd = [ // 7 Aug 2023 - v0.1
	'1118  8886 5668 865111111111330 ',
	'1118  8886 5668 8DC8888886A88865',
	'1018 188 655688 86511 1 13356653',
	'1008  8886 5668 8DC88 88 6A88 88',
	'DC8D CDD CDCFFDCC888DDCDCDCCFHCC',
	'DC8D  DDDCDCFDC88888DDCD DCDFHIH',
	'  D  D D  D DFCC  D DD D D DFHIH',
	'  D  D D  D DFDC666666  65568 8 '
],
chd = ['1113', '5556', '888A'],
bass = 'DDDDD8DDDCDDFFDCCDDDDDCCCDDDFFCC',
sfx = [ // +sfx 8 Aug 2023 - v0.2
	'6666  6EU6 66E6 66666EEEEEEE666 ',
	'66E6  6EE6 66E6 66666EEEE666EE66',
	'6666 66E U6E6U6 6666E 6 6MUEMU66',
	'6MU6  6EU6 66E6 6666E 6E 666E 6E',
	'1112 12E 121262241DD2612M12E112E',
	'2112  2EE1212012EDEE2E12 2M12222',
	'  3  3 3  3 366E  3 33 3 3 36662',
	'  3  3 3  3 366666EEEE  2MU66 6 '
],

f = x => 2 ** ((parseInt(x, 36) + 6.5) / 12) * 440,
sq = (x, y) => {
	y = parseInt(y, 36);
	x = t * f(x) / 256;
	if((T * 8 & 7) < 1) {
		if(((y >> 2) & 1) == 0) {
			x *= 2 ** (-1 / 12);
		}
	}
	switch(y >> 3 & 3) {
	case 1: x += sin(T * PI * 2) * 64; break;
	case 2:
		if((T * 2 & 1) == 0) {
			x = 0;
		}
		break;
	case 3:
		if((T * 2 & 1) != 0) {
			x = 0;
		}
		break;
	}
	switch(y & 3) {
	case 0: return ((x & 255) < 32) * 128;
	case 1: return ((x & 255) < 64) * 128;
	case 2: return ((x & 255) < 128) * 128;
	case 3: return ((T * 8 & 7) < 2 ? (x & 255) < 192 : (x & 255) < 128) * 128;
	default: return 0;
	}
},
tr = x => (x ^ -(x >> 8 & 2)) & 240,
noi = x => (sin(x ** 4) * 255) & 255,
(
	sq(sqd[T >> 5 & 7][T & 31], sfx[T >> 5 & 7][T & 31]) * 1.5 +
	sq(sqd[T - 1 >> 5 & 7][T - 1 & 31], sfx[T - 1 >> 5 & 7][T - 1 & 31]) * .75 +
	noi(((T & 3) == 2) * t >> 1) * (1 - (T % 1)) +
	noi(((T & 31) == 31) * t >> 1) * (1 - (T % 1)) +
	noi(((T & 127) == 61) * t >> 1) * (1 - (T % 1)) +
	noi(((T & 127) == 124) * t >> 1) * (1 - (T % 1)) +
	noi(((T & 255) == 220) * t >> 1) * (1 - (T % 1)) +
	1.4 * (
		(t * f(chd[0][T >> 2 & 3]) / 257 / 4 & 63) +
		(t * f(chd[1][T >> 2 & 3]) / 255 / 4 & 63) +
		(t * f(chd[2][T >> 2 & 3]) / 257 / 4 & 63) +
		(t * f(chd[2][T >> 2 & 3]) / 255 / 8 & 63)) +
	tr(t * f(bass[T & 31]) / 256 / 2)
) / 4;
