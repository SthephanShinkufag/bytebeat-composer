t?0:(v=2**17,X=Array(256).fill(0),Y=Array(18432).fill(0),song=rev=0),u=2,p=1,l=(t/=6)*u%(v*4),k=1,d=0,
synth = (speed, value, radix, bandWidth = 1) => {
	raw = parseInt((value2 = value.toString(radix))[speed % value2.length | 0], radix);
	X[++d] = (X[d] * bandWidth + raw) / (bandWidth + 1);
	d++;
	return X[--d]
},
pitch = (speed = t, transpose = 0) => {
	return speed*2**(transpose/12)
},
seq = (speed, value) => {
	j = ''
	for(i of value.split('')){
		j += k=parseInt(i,16).toString(2).padStart(4,'0')
	};
	return j[speed % j.length | 0]
},
insts = {bass:   k => synth(k, 0x831f720e, 4, 16) * 16,
			lead: k => synth(k, 0x7f07, 4, 5) * 16,
			strg: k => synth(k, 0x42fc3, 8, 16) * 12 + synth(k*3+l/65536, 0x42fc3, 8, 16) * 4,
			kick: (k, m) => synth(cbrt(l%k)*m, 0xff7f3f1f, 7, 32) * - (l % k - k) / k,
			drum: (k, m) => (l%(PI+(l%k))/E%1) * - (l / 4096 * m % 1 - 1) * 16},
a = [-3,-3,,4,4,,9,,-3,-3,,1,1,,4,,-3,-3,,4,4,,9,,-3,-3,,1,1,,4,,2,2,,6,6,,9,,-3,-3,,2,2,,6,,2,2,,6,6,,9,,-3,-3,,2,2,1,-1,1,-3,-3,,4,4,,9,,-3,-3,,1,1,,4,,-3,-3,,4,4,,9,,-3,-3,,1,1,,4,,2,2,,6,6,,9,,-3,-3,,2,2,,6,,2,2,,6,6,,9,,-3,-3,,2,2,6,4,2],
b = [[,-3,4,9],[,2,6,9]][l>>16&1],
c  = [1,,1,,1,,,4,4,4,4,,9,,9,,9,,,13,13,13,13,,11,,9,11,,13,11,9,6,4,,6,,9,6,9,14,9,14,18,,14,18,14,9,6,,9,,4,6,9,14,9,14,18,21,18,,16],
song = (song * k +
	insts.lead(pitch(t,a[l>>11&127]+p)/2)+
	insts.kick(-l&49152?8192:6144,l&8192?48:24)*32*(l>v)+
	insts.bass(pitch(t,b[l>>11&3]+p)/4)*2+
	insts.drum(32,2)*'44448448'[l>>11&7]/2*(l>v)+
	insts.strg(pitch(t,c[l>>11&63]-2.5+p)/4)*1.5*(l>v*2)+
	insts.bass(pitch(t,'05'[l>>16&1]-3+p)/8)*2
)
 / (k+1),  rev = song/128-1 + Y[Z=(t*6)%Y.length|0], Y[Z] = rev / -2, rev/4