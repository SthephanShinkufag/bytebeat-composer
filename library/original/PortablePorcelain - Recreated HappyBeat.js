t?0:(u=2.5,v=2**17,X=Array(256).fill(0),Y=Array(15360).fill(0),song=rev=0),l=(t/=6)*u,k=-6,d=0,
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
			strg: k => synth(k*1.95, 0x42fc3, 8, 16) * 12 + synth(k*3+l/65536, 0x42fc3, 8, 16) * 4,
			kick: (k, m) => synth(cbrt(l%k)*m, 0xff7f3f1f, 7, 32) * - (l % k - k) / k,
			drum: (k, m) => synth(((l*(l%k))**2%k), 0xf0f949f0, 7, 16) * - (l / 4096 * m % 1 - 1) * 16},
a = [[12,7,4,0],[12,7,4,0],[9,5,0,-3],[11,7,2,-1]][l>>15&3],
b = [12,0,,0,,0,,-5,12,0,,0,,0,,14],
c = [,,4,,5,7,-5,0,,,2,0,,,,,,,7,5,7,9,,-5,0,0,2,0,,,,,,,4,,5,7,-5,0,,,2,0,,,,,,,7,7,9,7,9,,12,9,12,,,,,,],
song = (song * 3 +
	insts.lead(pitch(t,a[l>>12&3]+1)/2)+
	insts.kick(8192,8)*16*(l>v)+
	insts.bass(pitch(t,b[l>>12&15]+1)/16)*(l>v*2)+
	insts.drum(1.4,1)*'4484'[l>>12&3]*(l>v*3)/1.2+
	insts.strg(pitch(t,c[l>>12&63]-1)/4)*(l>v*4)
)
 / 4,  rev = song/128-1 + Y[Z=(t*6)%Y.length|0], Y[Z] = rev / 2 * -1, rev/2