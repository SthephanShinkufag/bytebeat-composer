let f=[
	"37a",
	"38c",
	"58e",
	"7af"
];
f.forEach((s,i)=>{
	let p=[];
	s.split('').forEach(l=>{
		let v=parseInt(l,36);
		if(v){
			p.push(v);
		}
	});
	f[i]=p;
})
c=(t,a,b)=>t*440*2**(a/12)%1*128+b&128?.7:-.7;
return t=>c(t,f[t/2&3][t*2**5%3|0]-12,t*2**6)*(2-t*2**(t/8|0)%2)/2