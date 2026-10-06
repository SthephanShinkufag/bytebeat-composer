// TOO LARGE STRINGS AAAA
// Anyways this is a remix of "Infinite Insomnia" by eslashamchine
// Also eslash, your "Infinite Insomnia" is a really but really good song. Don't give up! Keep Learning About Bytebeat!
mel='5CACFCAC5CACHCAC5CACFCAC5CACHCAC3CACFCAC3CACHCAC3CACFCAC3CACHCAC5CACFCAC5CACHCAC5CACFCAC5CACHCAC3CACFCAC3CACHCAC3CACFCAC3CACHCAC',
bass='55555555555555555555555555555533111111111111111133333333333333335555555555555555555555555555555511111111111111113333333333333333',

// Song
s=(x,a=1)=>t*2**(parseInt(x,36)/12)*a,
x=j=>(
	w=t=>t>0&&((e=a=>(s(mel[127&t>>13],a)%256-128)*(1-t/8192%1)**2/1.5),e(1)/2+e(j)/2),
	b=a=>(s(bass[127&t>>13],a/4)%256-128)*(t/24576%1)*((1-t/8192%1)**.5)*1.25,
	min(max(w(t)+w(t-10240)/2+w(t-20480)/3+w(t-30720)/4+b(1)+b(j)+128*1.3*atan(sin(6*cbrt(t%16384)))*(1-t/16384%1)**.5*(1&-t>>14)+((64*j*random()%256-32)*(1-t/8192%1)**1.5)+(96*j*random()%256-48)*(1-t/32768%1)*(1&t>>15),-128),127)
),
[x(1.005),x(.995)]