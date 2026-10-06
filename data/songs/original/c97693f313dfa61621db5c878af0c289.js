t||(A=(()=>{
	let A = Array(100).fill(0).map((_,i)=>i+2);
	let i = 0;
	while(i<A.length) {
		let n = A[i];
		A = A.filter((x)=>{
			if(x<=n) return true;
			return (x/n%1)!==0;
		});
		i++;
	}
	return A;
})(),I=Array(A.length).fill(0),CI=5),
DU=2**13,
DE=1.002,
DIV=2,
(t%DU)||(
	S=(t/DU|0)+1,
	I=I.map((x,i)=>(S%A[i])===0?1:x)
),
(t&511)||(()=>{
	if(ceil(t/DU)%(A[CI])===1&&t>=DU*2) {
		CI++;
	}
	const p1 = A.slice(16,32).map((x,primeIndex)=>Array(48).fill("-").map((_,offset)=>{
	offset -= 24;
	let idx = ceil(t/DU+offset/DIV);
	if(idx<1) return "?";
	const n = x.toString(10);
	if((idx%x) === 0) return offset===0?"O":(n>9&&t/8000%1>0.5)?"/-\\|"[t/8000*2*4&3]:n[t/8000%n.length|0];
	return offset===0?"|":" ";
}).join("")).join("\n");
// .replace(/(\s)/g,"\u200c$1");
	const p2 = Array(48).fill("-").map((x,i)=>(oi=i,i=ceil((i-24)/DIV+(t/DU)),A.map(p=>i===p).reduce((a,b)=>a+b)===1?i=oi===24?"#":"!":oi===24?"U":"'")).join("");
	const p3 = Array(48).fill("-").map((x,i)=>(oi=i,i=ceil((i-24)/DIV+(t/DU)),A.map(p=>i===p).reduce((a,b)=>a+b)===1?i=oi===24?"#":":":oi===24?"A":".")).join("");
	throw ("\n"+p2+"\n"+p1+"\n"+p3).replace(/(\s)/g,"\u200c$1");
})(),
I=I.map((x,i)=>x/(DE**(1/A[i]))),
I.map((x,i)=>(NO=2*t*2**([0,2,4,5,7,9,11][0+i%7]/12+floor(i/7)),((NO&128?(255-NO&255):(NO&255))/63.5-1)*x)).reduce((a,b)=>a+b)/5
// t*2**([0,2,3,5,7,8,10][0]/12)/128&1