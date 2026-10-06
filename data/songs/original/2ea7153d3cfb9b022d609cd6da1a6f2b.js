// What you're seeing is feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:5e3+wsin(t/300),m:.4,fb:.15},{t:15e3+wsin(t/310),m:.3,fb:.25},{t:25e3+wsin(t/320),m:.2,fb:.35},{t:35e3+wsin(t/330),m:.1,fb:.25}],[{t:10e3+wsin(t/340),m:.4,fb:.15},{t:20e3+wsin(t/350),m:.3,fb:.25},{t:30e3+wsin(t/360),m:.2,fb:.45},{t:40e3+wsin(t/370),m:.1,fb:.35}]],

Q=(

Hz=96/60*16384,
t/=48e3/Hz,
n=450/Hz*128*2**(3/12),
vi=63+sin(t/840)*2,
Dl=8192,
G=(t<2**22),
E=(t<5373952),
Mel=(N,P,Ar,V,A,B)=>((exp(tanh(sin(sin((t+63+sin(t/V)*6)*PI/256*n*2**P*2**(N[((t-Ar)>>17)%8]/12)))))/3-.4)||0)*min(1,(t-Ar)/1024*A%32*B)*(1-(1*min(1,(t-Ar)/16384*A%2*B))),(Mel([5,9,10,9,5,9,6,6],0,0,700,1,1)+Mel([8,12,13,13,8,12,10,9],0,Dl,900,1,1.2)+Mel([12,15,17,15,12,15,13,13],0,Dl*2,1100,1,1.4)+Mel([13,17,18,17,13,17,18,[18,18,17,15][(t-Dl*3)>>15&3]],0,Dl*3,1200,1,1.6)+Mel(D=[13,17,18,18,13,17,18,18],-2,0,1200,1,0.5)*2.5)*E+(((exp(3*sin(2*tanh(sin((t+vi)*PI/128*n*2**([8,6,5,3,6,5,3,5,-2,,1,3,5,,3,,8,6,5,13,12,8,6,5,5,,1,,6,5,3,1][(t>>15)%32]/12)))))/4-.4)||0)/12-.3)*min(1,abs(asin(sin(t*PI/32768)))*20)/2**(t%2**15/8e3)*(t>2**20)*G+lpf(((exp(sin(atanh(sin((t+vi)*PI/64*(!(-t>>17&3)+1)*n*2**([C=[5,1,8,5],C,C,[13,12,8,5]][t>>15&3][(t>>13)%4]/12)))))/4-.4)||0)*min(1,abs(asin(sin(t*PI/8192)))*2)/2**(t%2**13/2e3),.11)*(t>2**21)*G)*1.3,

[dly(Q,rvrbHeads[0],.65,x=>tanh(bpf(x,.01,.33)/125)*135),dly(Q,rvrbHeads[1],.65,x=>tanh(bpf(x,.01,.33)/125)*135)]