//GG runing it lmao at 44100Hz
base=(n,b=10)=> {
		const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const result = [];
		let sign = "";
		if (n<0) {
				sign = "-";
				n = -n;
		} do {
			const remainder = n % b;
			result.unshift(digits[remainder]);
			n = floor(n/b);
		} while (n>0);
		return sign+result.join('');
},

f=(t)=>t&128?255:0,
tt=t*140/(44100/65536*240),
sx=(r)=>{let s=1;for(let i=1;i<=8;i++)s*=(r/i/256+1e7)%256;return s/16777216%1},
ff = (t) => {
	return '|'+Array.from({length:64},(_, i) => '-'.repeat(63-i)+'█').reverse()[(abs(sin(((t-8/256))*PI))*63.99&63)];
},

xx=(mt,xt,vt,st)=> {
	let v=0;
	const th=xt.length-1;
	const p=xt.map(x=>2**((x-53)/12));
	const sx1=sx(1);
	const EvA = [];
	for(let i=0;i<=th;i++){
		const pitch=p[i];
		let saw=0;
		for(let j=1;j<=mt;j++) {
			const mc=(sx(j)/sx1-1)*8;
			saw+=(f(t*2*pitch*(0.005*mc/mt+1)+1e7*mc)&255)/mt;
		}
		const Ev = ((((~tt/st)*(1-(th-i)/vt)&255)/256)**3);
		v+=((saw&255)-128)/xt.length*Ev;
		EvA.push('^'+((((tt/st)*(1-(th-i)/vt)&255)|0)+1000));
	}
	if (t & 255) {
		return v;
	} else {
		x = EvA.map((line, index) => {
			const num = parseFloat(line.replace(/\^/g, "")) || 0;
			return xt[index]+ff((num+32)/256);
					//to keep track with the song during developing
		}); throw '[WIP] 0x'+base(tt>>0,16)+' ('+(tt>>0)+')'+'\n'+x.join("\n").replace(/\^1/g, '');
	}
},
x=[0,0,3,3,-7,-7,-4,-2][(tt>>17)&7],
pp=2**((x)/12)/4,
p=+sin(sqrt(tt&32767))*32+(sx(t/8&65535)*32-16)*max(0,1-((tt/256+128)/256%1*2)),

xx(4,[17+x,29+x,41+x,48+x,53,55,56,58,60,65,67,68,70,72,75,77],256,256)
+(((tt>>16&255)>(((tt>>18&31))==31?NaN:15))?p:0)
+((tt>>16&255)>15?(t*pp^t*pp*2)/4%64-32:0)*(tt/32768%1)*(1-tt/8192%1)*1.5