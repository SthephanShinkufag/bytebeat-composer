return (T,S)=>{
	let o = 0;
	let t = T * 4096;
	let I = (T/2);
	let J = max(I,T);
	for(let i = 1; i < min(16,I)+1; i++) {
		o+=((t/i)%1)*(1-(J*i*8)%1)*"10001011"[int(J*i*8)&7]/i;
	}
	let PR= (o/E)%1;
	let D = (1000/((1+((T*((((T*2)&3)<=(T/2&3))?4:2))%1))**64))%1;
	let B = (t/24&1)*((T*4)&1&&(T*4)%1);
	return (PR+(T>16&&(D+B)))-1;
}