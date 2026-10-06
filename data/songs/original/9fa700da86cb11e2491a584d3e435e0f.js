// What you're seeing is feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:4096+wsin(t/100),m:.5,fb:.15},{t:8192+wsin(t/250),m:.5,fb:.35},{t:12288+wsin(t/300),m:.1,fb:.45},{t:16384+wsin(t/380),m:.1,fb:.65}],[{t:4e3+wsin(t/230),m:.5,fb:.15},{t:8e3+wsin(t/270),m:.5,fb:.35},{t:12e3+wsin(t/280),m:.1,fb:.45},{t:16e3+wsin(t/200),m:.1,fb:.65}]],

Q=(

Hz=128/60*16384,
t/=48e3/Hz,
n=440/Hz*128*2**(3/12),
vi=63+sin(t/840)*2,
Dl=1250,

Mel=(N,P,Ar,V)=>((exp(tanh(sin(sin((t+63+sin(t/V)*6)*PI/256*n*2**P*2**(N[((t-Ar)>>17)%4]/12)))))/3-.4)||0)*min(1,(t-Ar)/1024%128)/2**((t-Ar)%2**17/19e3),(Mel(A=[-8,-4,-3,-3],1,0,700)+Mel([-4,0,1,0],1,Dl,900)+Mel([-1,3,4,4],1,Dl*2,1100)+Mel('3686',1,Dl*3,1200)+Mel(A,0,0,1300)*.7*(t>2**19))*(t<6422528)+((exp(tanh(atanh(sin((t+vi)*PI/64*n*2**([[3,4,8,4,3,4,11,8,3,4,8,4,3,4,6,4],[3,4,-1,-3,-4,-3,-4,-1,3,4,6,4,8,9,8,4]][-t>>20&1][(t>>15)%16]/12)))))/4-.4)||0)*min(1,abs(asin(sin(t*PI/32768)))*20)/2**(t%2**15/8e3)*(t>2**20)*(t<2**20*5)


)*1.3,

[dly(Q,rvrbHeads[0],.45,x=>tanh(bpf(x,.01,.33)/180)*80),dly(Q,rvrbHeads[1],.45,x=>tanh(bpf(x,.01,.33)/180)*80)]