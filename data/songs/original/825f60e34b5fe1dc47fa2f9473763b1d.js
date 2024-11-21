this.rvA??=[],rvI=0,
$A=t==0,
rv=(X,L)=>(
	(t&&!(rvA[rvI]==undefined))||(
		rvA.push(Array(L).fill(0))
	),
	//(()=>{throw rv})()
	rvA[rvI][t%L]=
		rvA[rvI++][t%L]/2+
		(X&255)/2
),
chord=(arr,$,_=2)=>arr.map(a=>isNaN(a)?0:((t/_*(2**((a+1)/12)))&$)).reduce((a,b)=>a+b),
Q=$=>$==' '?NaN:parseInt($,36)-12,
A=chord([
 [2,5,9],
 [0,5,9],
 [3,9,10],
 [-3,5,9],
 [2,5,9],
 [0,5,9],
 [5,9,10],
 [0,9,12]
][t>>16&7],32,4)*1.00002**(-t%65536),
B=chord([Q(
[
	'EHLHE   ',
	'CHL O   ',
	'AHL O   ',
	'9HL J   ',
	'EHLHE   ',
	'CHL Q   ',
	'AHL J   ',
	'CHL J H ',
][t>>16&7][t>>13&7])],64,.5)*1.0003**(-t%8192),
   (t>>19?rv(B,8192)*2:0)+A