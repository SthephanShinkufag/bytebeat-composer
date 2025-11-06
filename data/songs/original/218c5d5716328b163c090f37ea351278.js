// What you're seeing is Feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:1e3+wsin(t/210),m:.5,fb:.15},{t:1e4+wsin(t/250),m:.5,fb:.35},{t:17e3+wsin(t/300),m:.1,fb:.45},{t:37e3+wsin(t/380),m:.1,fb:.65}],[{t:11e2+wsin(t/230),m:.5,fb:.15},{t:13e3+wsin(t/270),m:.5,fb:.35},{t:14e3+wsin(t/280),m:.1,fb:.45},{t:40e3+wsin(t/400),m:.1,fb:.65}]],

BPM=90,sampleRate=48e3,tf=abs(t/sampleRate/180*3*32768*BPM),r=tf,
v=sin(r*PI/32768)*64,
p=(1/sampleRate*256)*440*2**(-3/12),
x=j=>(w=r=>r>0&&(
sin(((t+v)*p*2**(([5,4,2,0][r>>15&3])/12+1))*PI/128+sin(((t+v)*p*2**(([5,4,2,0][r>>15&3])/12+1))*PI/256*j))/3*(1-r/32768%1)**.5*(r>>17<1)*.1**(10/(r%32768))
+(sin((a=((t+v)*p*2**(([4,0,0,-5][r>>17&3])/12)))*PI/128+sin(a*PI/256*j))/5*(1-r/2**17%1)**.1*.1**(40/(r%2**17))
+sin((b=((t+v)*p*2**(([9,5,4,2][r>>17&3])/12)))*PI/128+sin(b*PI/256*j))/5*(1-r/2**17%1)**.1*.1**(40/(r%2**17))
+sin((c=((t+v)*p*2**(([12,9,7,11][r>>17&3])/12)))*PI/128+sin(c*PI/256*j))/5*(1-r/2**17%1)**.1*.1**(40/(r%2**17))
+sin((d=((t+v)*p*2**(([16,12,12,14][r>>17&3])/12)))*PI/128+sin(d*PI/256))/5*('0001'[r>>15&3])*(1-r/32768%1)**.5)*(r>>16>1)*.1**(10/(r%32768))),w(r)+w(r-(de=24576+sin(r*PI/65536)*128))/2+w(r-de*2)/4+w(r-de*3)/8+w(r-de*4)/16
+sin((e=(t*p*2**(([-3,-7,-12,-5][r>>17&3])/12-2)))*PI/128+sin(e*PI/256))/3*(1-r/2**17%1)**.1*(r>>16>1)*.1**(40/(r%2**17))
+sin((e=((t+v)*p*2**(([-3,-7,-12,-5][r>>17&3])/12-1)))*PI/128+sin(e*PI/252*j))/3*(1-r/2**17%1)**.1*(r>>16>1)/2*.1**(40/(r%2**17))
)/1.5+(random()-.5)/64,

[dly(x(1.005),rvrbHeads[0],.55,x=>tanh(bpf(x,.01,.8)/200)*100)+lpf(random()-.5,.001)*4,dly(x(.995),rvrbHeads[1],.55,x=>tanh(bpf(x,.01,.8)/200)*100)+lpf(random()-.5,.001)*4]