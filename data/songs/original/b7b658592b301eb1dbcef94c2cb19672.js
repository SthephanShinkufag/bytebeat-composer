n=1.01,

// What you're seeing is feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65}],[{t:11e2+wsin(t/230),m:.5,fb:.15},{t:13e3+wsin(t/270),m:.5,fb:.35},{t:14e3+wsin(t/280),m:.1,fb:.45},{t:40e3+wsin(t/400),m:.1,fb:.65}]],

Q=((((t*n*8*2**([2,,,,-2,,,,0,,,,5,,4,,][t>>13&15]/12)&4095)**(1/sqrt((4+.01*((sin(t*PI/16384))*32)))))&16)%256*8+(((t*n*16*2**([5,,5,,4,,5,7,,,5,,4,,5,9,,,5,,4,,5,12,12,,12,,10,,9][t>>12&31]/12)&4095)**(1/sqrt((4+.01*((sin(t*PI/4096))*16)))))&16*(t>8192))%256*5)/80-1.4,

[dly(Q,rvrbHeads[0],.55,x=>tanh(bpf(x,.01,.8)/200)*100),dly(Q,rvrbHeads[1],.55,x=>tanh(bpf(x,.01,.8)/200)*100)]