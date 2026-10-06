// What you're seeing is feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:6e3+wsin(t/100),m:.5,fb:.15},{t:10e3+wsin(t/250),m:.5,fb:.35},{t:14e3+wsin(t/300),m:.1,fb:.45},{t:2e4+wsin(t/380),m:.1,fb:.65}],[{t:8e3+wsin(t/230),m:.5,fb:.15},{t:12e3+wsin(t/270),m:.5,fb:.35},{t:16e3+wsin(t/280),m:.1,fb:.45},{t:24e3+wsin(t/200),m:.1,fb:.65}]],

Q=(
Hz=100/60*16384,
t/=48e3/Hz,
n=440/Hz*128*2**(3/12),
vi=63+sin(t/600)*2,

A=[a=min(1,t/256%8),1,1,1,1-(b=min(1,t/1024%2))][t>>11&31]||0,B=[a,1,1,1,1,1,1,1,1-b][t>>11&31]||0,C=[a,1,1,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,D=[a,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,E=[0,0,0,0,a,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,F=[0,0,0,0,0,0,0,0,a,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,G=[0,0,0,0,0,0,0,0,0,0,0,0,a,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,H=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,a,1,1,1,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,I=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,a,1,1,1,1,1,1,1,1,1,1-b][t>>11&31]||0,

Ch=(Ch,N)=>sin(t*PI/128*(c=n*2**N*2**(Ch[t>>16&3]/12)))/6+sin((t+vi)*PI/64*c)/18,(Ch([-6,-2,-1,-1],0)*A+Ch([-2,1,3,1],0)*B+Ch([-1,3,4,4],0)*C+Ch('3787',0)*D+Ch([-6,-2,-1,-1],1)*E+Ch([-2,1,3,1],1)*F+Ch([-1,3,4,4],1)*G+Ch('3787',1)*H+Ch([-6,-2,-1,-1],2)*I)+Ch([-1,3,4,4],-2)*min(1,abs(((t+32768)/256)%256-128)/5)*(t>2**19)
),

[dly(Q,rvrbHeads[0],.33,x=>tanh(bpf(x,.01,.5)/180)*100),dly(Q,rvrbHeads[1],.33,x=>tanh(bpf(x,.01,.5)/180)*100)]