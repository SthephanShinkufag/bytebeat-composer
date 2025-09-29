// What you're seeing is Feeshbread's Dead Data Reverb
t||(wsin=(phase)=>(-cos(phase/256*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),nf=notchFilter=(a,hc,lc)=>(hpf(a,hc)+lpf(a,lc))/1.75,dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),fxi=0,dt=t,rvrbHeads=[[{t:1e4+wsin(t/180), m:.6, fb:.3},{t:16e3+wsin(t/300), m:.5, fb:.5},{t:21e3+wsin(t/380), m:.3, fb:.7},{t:28e3+wsin(t/420), m:.2, fb:.9}],[{t:98e2+wsin(t/200), m:.6, fb:.3},{t:15e3+wsin(t/320), m:.5, fb:.5},{t:22e3+wsin(t/320), m:.3, fb:.7},{t:27e3+wsin(t/450), m:.2, fb:.9}]],

Q=lpf((
bpm=90,sr=44100,r=abs(t/sr/180*3*32768*bpm)/2,
n=(1/48e3*256)*440*2**(-3/12),
vi=64+(sin(t/640)+sin(t/2101)+sin(t/1234))*4,

Ch=(Ch,N)=>sin(t*PI/32*(C=n/2**N*2**((Ch[r>>16&3]+(a=1))/12))+sin(t*PI/32*C)/2)/8+tanh(2*(sin(((t+vi)*PI/64*C)+sin((t+vi)*PI/64*C)/2)))/2,(Ch([-1,-1,-1,-1],1)+Ch([3,3,4,4],1)+Ch([6,6,6,6],1)*(r>2**18)+(Ch([-999,8,8,7],1)+Ch([-1,-4,-8,-8],3)*4)*(r>2**19)+Ch([15,20,18,(r>>19>1?(r>>18&1?([16,16,16,16,16,16,18,16][r>>13&7]):16):16)],1)*(r>786432)+(Ch([10,18,15,13],0)/2+Ch([6,15,11,11],3)/2)*(r>2**20)+lpf(((t*n*2**(([-1,-4,-8,-8][r>>16&3]+a)/12-2))%256-128)/128,.05)*max(0,min(1,r/2**19)))*min(1,abs(((r+32768)/256)%256-128)/5)/2
),.125),
[dly(atan(Q/16)*12*max(0,min(1,(r/2**18)**.5)),rvrbHeads[0],.75,x=>tanh(bpf(x,.01,.5)/180)*80),dly(atan(Q/16)*12*max(0,min(1,(r/2**18)**.5)),rvrbHeads[1],.75,x=>tanh(bpf(x,.01,.5)/180)*80)]