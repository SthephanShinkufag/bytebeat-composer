BPM=120,
sR=48e3,
r=abs(t/sR/180*3*32768*BPM),
p=(1/sR*256)*480,q=(30*sR)/(BPM*2/3),

// What you're seeing here is Feeshbread's Dead Data Reverb Code
t||(wsin=(phase)=>(-cos(phase/256*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),nf=notchFilter=(a,hc,lc)=>(hpf(a,hc)+lpf(a,lc))/1.75,dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-floor(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:1e3+wsin(t/180),m:.6,fb:.3},{t:1e4+wsin(t/300),m:.5,fb:.5},{t:17e3+wsin(t/380),m:.3,fb:.7},{t:37e3+wsin(t/420),m:.2,fb:.9},{t:q*1.005+wsin(t*1.005/256),m:.75,fb:.75}],[{t:11e2+wsin(t/200),m:.6,fb:.3},{t:13e3+wsin(t/320),m:.5,fb:.5},{t:14e3+wsin(t/320),m:.3,fb:.7},{t:4e4+wsin(t/450),m:.2,fb:.9},{t:q*.995+wsin(t*.995/256),m:.75,fb:.75}]],

m=midiNote=x=>(t/sR*256)*432*2**((x-64)/12)*(x>-1?x<128?1:0:0),
sinc=x=>((x*64/PI*128+4096)+4096&8191)*(-(x*64/PI*128+4096)+4096&8191)*((((x*64/PI*128+4096)+4096&8192)>>12)-1)/16777215,
cosc=x=>sinc(x-256),
mel=m([69,71,72,71,69,71,72,71,65,71,72,71,65,71,72,71,67,71,72,71,67,71,72,71,64,71,72,71,64,71,72,76][r>>14]),

Q=tanh(sinc(sinc(mel*PI/128)+cosc(mel*PI/128*6)*(1-r/16384%1)))*4*min(1,abs(sin(r*PI/16384))*64)*(1-r/16384%1)**2/2,
[dly(Q,rvrbHeads[0],.55,x=>tanh(bpf(x,.01,.8)/180)*100),dly(Q,rvrbHeads[1],.55,x=>tanh(bpf(x,.01,.8)/180)*100)]