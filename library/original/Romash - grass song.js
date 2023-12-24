tri=function (t,freq){return abs(((t*freq)%256) - 128)/128-0.5}
sq=function (t,freq){return ((t*freq/256)&1)-0.5}
melp=function (t){return 0.8-sin(t/100000)*0.00001}

mg=function (t,freq) {return abs(tri(t+1979,freq)-tri(t,freq/2)) - tri(t+1979,freq/3)}
mg2=function (t,freq) {return abs(tri(t+979,freq)-tri(t,freq/2)) - tri(t+2979,freq/3)}

plikif = function(t, leftpan) {
	if (t < 0) {return 0}
	let sqrs = sq(t,2*'2484'[(t>>14)&3]*melp(t))/8
	
	return (tri(t,[1.26,0.84][t>>15&1]*melp(t)*8))/1.6*(t>>16&1)*(t>>18&1)*(255-((t>>6)&255))/255*0.75 + sqrs*leftpan
}

return function (time, sampleRate) {
	let t = time * 36000
	
	let lpan = (tri(t, 0.001) + 1) / 2
	lpan = (lpan * 0.7 + 0.5 * 0.3)

	let plikil = plikif(t, lpan) + plikif(t - 16000, lpan*0.5) * 0.5 + plikif(t - 48000, lpan*0.5) * 0.25 + plikif(t - 80000, lpan*0.5) * 0.125
	lpan = 1 - lpan
	let plikir = plikif(t, lpan) + plikif(t - 32000, lpan*0.5) * 0.5 + plikif(t - 64000, lpan*0.5) * 0.25 + plikif(t - 96000, lpan*0.5) * 0.125

	let bass = (tri(t,[1,1.33][t>>18&1]*melp(t)*0.5))/2.1*[1,1,0,1,0,1,1,0][t>>14&7]

	let padl = (mg(t,[1,1.33][t>>18&1]*melp(t)*3+tri(t,0.0002)*0.001)+mg(t,[1,1.33][t>>18&1]*(melp(t)+1)*3+tri(t,0.0001)*0.001))/1.3/6
	let padr = (mg2(t,[1,1.33][t>>18&1]*melp(t)*3+tri(t,0.0002)*0.001)+mg2(t,[1,1.33][t>>18&1]*(melp(t)+1)*3+tri(t,0.0001)*0.001))/1.3/6
	
	return [plikil + padl + bass, plikir + padr + bass];
}
