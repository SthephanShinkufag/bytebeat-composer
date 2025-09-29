/*
 * the random background music you
 * hear in heaven
 * by troubleshoot
 * (credits to feeshbread for the 
 * reverb and filters)
 * (i like cheese)
 */

/* random variables + feeshbread's multi-tab delay & infinitely instantiable 1-pole filters */
t||(sa=48e3,samp=1/sa,BPM=97,wsin=(phase)=>(-cos(phase/128*PI)+1)*128-.5,fx=[],dMax=1e6,lpf=lowPassFilter=(a,c)=>(lp_fxii=fxi++,fx[lp_fxii]??=0,fx[lp_fxii]+=(a-fx[lp_fxii])*c),hpf=highPassFilter=(a,c)=>a-lpf(a,c),bpf=bandPassFilter=(a,hc,lc)=>hpf(lpf(a,lc),hc),dly=multiTabDelay=(audio,heads,dw,fbfn=x=>x)=>{dly_fxii=fxi++;fx[dly_fxii]??=Array(dMax).fill(0);dly_wi	=dt%dMax;dly_feed=audio;dly_out=0;for(let head of heads){dly_ri=(dMax+dt-round(head.t))%dMax;dly_feed+=fx[dly_fxii][dly_ri]*head.fb;dly_out+=fx[dly_fxii][dly_ri]*head.m;}fx[dly_fxii][dly_wi]=fbfn(dly_feed);return audio*(1-dw)+dly_out*dw;}),

/* reverb... heads?? */
fxi=0,dt=t,revHeads=[[{t:1e4+wsin(t/180),m:.6,fb:.3},{t:16e3+wsin(t/300),m:.5,fb:.5},{t:21e3+wsin(t/380),m:.3,fb:.7},{t:28e3+wsin(t/420),m:.2,fb:.9}],[{t:98e2+wsin(t/200),m:.6,fb:.3},{t:15e3+wsin(t/320),m:.5,fb:.5},{t:22e3+wsin(t/320),m:.3,fb:.7},{t:27e3+wsin(t/450),m:.2,fb:.9}]],

/* T crap */
T=t*samp/30*BPM, // time
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* bell function (works GREAT with delay and/or reverb) */
bell=x=>sin(note(x)/2*PI)/10*(1-T%1)**7+sin(note(x)/4*PI)/12*(1-T%1)**6+sin(note(x)/8*PI)/16*(1-T%1)**4+sin(note(x)/16*PI)/10*(1-T%1)**3+sin(note(x)/64*PI)/6*(1-T%1)**2,

/* saw function */
saw=x=>atan(tan(note(x)/64*PI)/4+tan(note(x)/128*PI)+tan(note(x)/256*PI)*2)/5,

/* fade-in */
fadeIn=(T<32?T/32%1:1),

/* ambient noise */
noi=(lpf(random()-.5,.1))/9,

/* main */
main=(bell([0,19,21,16,19,14,16,12,9][T%9|0])*4+lpf(saw(0)+saw(4)+saw(7),.05))*fadeIn+noi,

/* output */
[dly(main,revHeads[0],.75,x=>(bpf(x,.01,.5)/180)*80),dly(main,revHeads[1],.75,x=>(bpf(x,.01,.5)/180)*80)]