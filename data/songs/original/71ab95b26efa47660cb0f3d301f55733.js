function stringToSequence(str){
	//seq notes should be ordered by `at`
	let seq={notes:[],duration:str.length};
	for(let i=0;i<str.length;i++){
		if(str[i]!==".")
			seq.notes.push({type:str[i],at:i});
	}
	return seq;
}
function bp(freq,Q){let w0=2*PI*freq/SR;let alpha=sin(w0)/(2*Q);let b0=alpha,b1=0,b2=-alpha,a0=1+alpha,a1=-2*cos(w0),a2=1-alpha;let x1=0,x2=0,y1=0,y2=0;return x=>{let y=(b0/a0)*x+(b1/a0)*x1+(b2/a0)*x2-(a1/a0)*y1-(a2/a0)*y2;x2=x1;x1=x;y2=y1;y1=y;return y}};
let pattern=stringToSequence("k.h.sh.kh.khs.hkk.k.sh.kh.khs.hkk.h.sh.kh.khs.hkk.h.sh.kh.khskhk"),
    SR=32000,BPM=130,
    timer={t:0,i:0,f:null,ft:0},
    funcbeats={
	k:()=>{
		let f=()=>{
			let a=random()*.1,b=random()*.1
			return t=>tanh(tanh(sin(3/(t+.01+a))+random()*max(1-t*50,0))*(1/(t+.01+b)));
		},a=f(),b=f(),c=f(),bf=bp(100+random()*600,1);
		return t=>{
			return tanh(bf(a(t)*b(t)*-c(t))*10);
		};
	},
	h:()=>{
		let b=Array.from({length:5},()=>[bp(SR/(2.5+random()*10),30+random()*40),random()*20]);
		return t=>{
			return tanh(b.reduce((p,c)=>p+(c[0](random()*2-1)+(((t*2000*c[1])%1)-.5)*.2),0))*min(t/.002,1)*(1/(t*90+.1))
		}
	},
	s:()=>{
		let a=[random()*10,-44+random(),.4+random()*10],
		    b=t=>{
			return sin(tanh(a[2]+=sin((a[0]-=a[1])*a[2])*2)-a[1]);
		},d={a:Array(floor(10+random()*140)).fill(0),i:0};
		return t=>{
			d.a[d.i]=(d.a[d.i]+b(t))*.93;
			let o=d.a[d.i];
			d.i=(d.i+1)%d.a.length;
			return tanh((o%.4)*50);
		};
	}
};
for(let n of pattern.notes)
	n.at+=random()*.1;
let sam={rl:floor(pattern.duration*(SR/(BPM/2))),ri:0};
sam.r=Array(sam.rl);
return t=>{

	if(timer.i<pattern.notes.length&&timer.t>=pattern.notes[timer.i].at){
		if(pattern.notes[timer.i].type in funcbeats){
			timer.f=funcbeats[pattern.notes[timer.i].type]();
			timer.ft=0;
		}
		timer.i++;
	}

	timer.t+=(BPM/60)*4/SR;
	if(timer.t>=pattern.duration){timer.t%=pattern.duration;timer.i=0;}

	let o=timer.f!==null?timer.f(timer.ft+=1/SR):0;
	if(sam.ri<sam.rl)sam.r[sam.ri++]=o;
	return tanh(o-sam.r[floor((timer.t/32)*SR)%sam.rl]*.7);
};