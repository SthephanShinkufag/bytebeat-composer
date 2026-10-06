// What you're seeing is feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:4096+wsin(t/100),m:.5,fb:.15},{t:8192+wsin(t/250),m:.5,fb:.35},{t:12288+wsin(t/300),m:.1,fb:.45},{t:16384+wsin(t/380),m:.1,fb:.65}],[{t:4e3+wsin(t/230),m:.5,fb:.15},{t:8e3+wsin(t/270),m:.5,fb:.35},{t:12e3+wsin(t/280),m:.1,fb:.45},{t:16e3+wsin(t/200),m:.1,fb:.65}]],

Q=(
t/=2,
n=(1/48000*256)*440*2**(4/12),
vi=63+sin(t/1536)*10,

Ch=(Ch,N)=>sin(t*PI/64*(C=n/2**N*2**(Ch[t>>16&3]/12)))/4+sin((t+vi)*PI/32*C)/12,(Ch([-1,-1,-1,-1],1)+Ch([3,3,4,4],1)+Ch([6,6,6,6],1)*(t>2**18)+(Ch([-999,8,8,7],1)+Ch([-1,-4,-8,-8],2))*(t>2**19)+Ch([15,20,18,(t>>19>1?([16,16,16,16,16,16,18,16][t>>13&7]):16)],1)/1.2*(t>786432)+(Ch([10,18,15,13],0)/2.5+Ch([6,15,11,11],3)/1.5)*(t>2**20))*min(1,abs(((t+32768)/256)%256-128)/5)/2+lpf(((t*n*2**([-1,-4,-8,-8][t>>16&3]/12-1))%256-128)/384+((t*n*2**([-1,-4,-8,-8][t>>16&3]/12-2))%256-128)/192,.1)*(max(0,min(1,(t/2**19)**3)))*min(1,abs(((t+32768)/256)%256-128)/5)/2
)*3.33,

[dly(Q,rvrbHeads[0],.75,x=>tanh(bpf(x,.01,.5)/180)*80),dly(Q,rvrbHeads[1],.75,x=>tanh(bpf(x,.01,.5)/180)*80)]