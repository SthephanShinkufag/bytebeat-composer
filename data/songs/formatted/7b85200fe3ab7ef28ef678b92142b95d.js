// feeshbread's Dead Data reverb - modified long release setup (PrincessPriscillaPT)

t||(wsin=(phase)=>(-cos(phase/256*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),nf=notchFilter=(a,hc,lc)=>(hpf(a,hc)+lpf(a,lc))/1.75,dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-floor(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),

fxi=0,

dt=t,

rvrbHeads=[[{t:1e3+wsin(t/180),m:.6,fb:.3},{t:1e4+wsin(t/300),m:.5,fb:.5},{t:17e3+wsin(t/380),m:.3,fb:.7},{t:37e3+wsin(t/420),m:.2,fb:.9},{t:6e3*1.005+wsin(t*1.005/256),m:.75,fb:.75}],[{t:11e2+wsin(t/200),m:.6,fb:.3},{t:13e3+wsin(t/320),m:.5,fb:.5},{t:14e3+wsin(t/320),m:.3,fb:.7},{t:4e4+wsin(t/450),m:.2,fb:.9},{t:5e3*.995+wsin(t*.995/256),m:.75,fb:.75}]],

// My Karplus-Strong Algorithm guitar configuration 

t || ((X = 0), ct = 6000, (bn1 = 392)), t > .1 || (
	
	DLY = Array(L = round(12288 * ct / 4096)).fill(0) // always delay at correct rate

),
  (Y = 0),
  (LP = (A, C) => ((X = Y++), (Z[X] ??= 0), (Z[X] += (A - Z[X]) * C))),
	Q=[0,0,-4,-2][floor(t/ct/32)&3],
  t % ct == 0
    ? (bn1 /
        (n1 =
          2 **
          ([Q,,7,,14,,10,,12,,7,3,,7,Q,,Q,,7,,14,,15,,17,,15,14,,,10,,][floor(t / ct) & 31] /
            12 + .25)), // melody of CORE, ripped from HydroCORE
      (A = Array((l = abs(round(bn1 / n1)) || 0)).fill(0)),
      (Z = []))
    : (X =
        ((X = (LP((random() - random()) * (t % ct < bn1 / n1), 0.3 + 
						
						cos(t * PI / ct / 64) / 4 // modulator 1 (initial)
					  
					  ) || 0) + A[t % l]), // delay
        (A[t % l] = LP(X, 0.6 +  // Lowpass for the actual guitar sound
							  
						sin(t * PI / ct / 64) / 4 // modulator 2 (post)
							 
							 )))),

  X1 = tanh(atan(X * 8)), // soft clipping

	x1 = (X1 / 2 || 0) + DLY[t % L] / 2, DLY[t % L] = x1, // delay guitar

kick = sin(PI * 14 * 1E-14 ** (t / ct / 4 % 1)) / 2,

ac = (t / ct & 3), // hat counting

ac = ac / ac || 0, 

	//           ^
	
	// return silence if undefined (if condition is not met), otherwise return 1 (if condition is met)

hat = _ => ((random()-random()) * (t/ct%1-1) ** 2 / 5) * ac,

bass = LP((t * bn1 / 1220 * 2 ** (Q / 12 + .25) & 255) / 512,
			 
			 abs(sin(t * PI / ct / 64) / 4) + .1
			
			),
	
	[ // stereo output
		
		(dly(x1,rvrbHeads[0],.4,x=>tanh(bpf(x,.01,.8) / 180) * 100) + bass) * // reverb header 1
		
		(t / ct / 2 & 1 ? 1 : t / ct / 2 % 1) // sc

		+kick+hat()-0.125,
		
		(dly(x1,rvrbHeads[1],.4,x=>tanh(bpf(x,.01,.8) / 180) * 100) + bass) *  // reverb header 2
		
		(t / ct / 2 & 1 ? 1 : t / ct / 2 % 1) // sc
		
		+kick+hat()-0.125
	
	];