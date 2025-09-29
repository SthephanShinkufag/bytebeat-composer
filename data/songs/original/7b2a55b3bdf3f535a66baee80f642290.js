// "У Батарей (At The Batteries)"
// Cover of У Батарей (At The Batteries) - nyan.mp3

BPM=124.38,
SampleRate=48e3,
r=abs(t/SampleRate/180*3*32768*BPM),
p=(1/SampleRate*256)*480,

// What you're seeing here is Feeshbread's Dead Data Reverb Code.
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65}],[{t:11e2+wsin(t/230),m:.5,fb:.15},{t:13e3+wsin(t/270),m:.5,fb:.35},{t:14e3+wsin(t/280),m:.1,fb:.45},{t:40e3+wsin(t/400),m:.1,fb:.65}]],
n=NaN,
ch=(a,b,c,d)=>[a,b,c,d][r>>18&3],
hl=a=>[n,n,n,a][r>>18&3],
Q=(((((t*p*2*2**(SEQ1=[4,hl(4),hl(4),hl(4),0,,,,2,hl(2),hl(2),hl(2),7,,6,,][r>>14&15]/12)&4095)**(1/sqrt(4+.01*(sin(r*PI/32768))*32)))&16)%256-8)*8*(SEQ1>-1e10?1:0)+((((t*p*4*2**(SEQ2=[ch(n,7,11,7),,7,,ch(6,6,6,16),,ch(7,7,7,14),ch(9,9,9,11),,,ch(7,7,7,n),,ch(6,6,6,n),,ch(7,7,7,n),ch(11,11,11,n),,,ch(7,7,7,n),,ch(6,6,6,n),,ch(7,7,7,n),ch(14,14,14,n),ch(14,14,14,n),,ch(14,16,14,n),,ch(12,11,12,n),,ch(11,12,11,n)][r>>13&31]/12)&4095)**(1/sqrt(4+.01*(sin(r*PI/8192))*16)))&16)%256-8)*5*(SEQ2>-1e10?1:0))/80,

[dly(Q,rvrbHeads[0],.55,x=>tanh(bpf(x,.01,.8)/200)*100),dly(Q,rvrbHeads[1],.55,x=>tanh(bpf(x,.01,.8)/200)*100)]