BB=t=>(
r=t/1.35,p=parseInt,min(max((pcm=(a,b,c)=>p((s=a)[int(.692*t/c*2**(p(b,36)/12))%s.length],36)*4-72,pcm('0ZZ00Z00Z00ZZ0ZZ0ZZZZ000Z00Z00Z0Z00Z','5CH5CH5C5CH5CH5C5CH5CH5C8FK8FK8F18D18D1818D18D1807C07C074CG4CG4CG'[63&r>>12],[10,9.95][1&t*2**(p(b='CCCF887B'[7&r>>15],36)/12)>>8])*(1-r/4096%1/1.5)/3+(k=y=>pcm('02468ACEGJLNPRTVXZ',b,59.5*y),k(1)+k(.995))*(r/16384%1)*(1-r/4096%1)+sin(cbrt(r%8192)*8)*64*(1-r/8192%1)*!(r&8192)+(random()*48-24)*(1-r/2048%1)*!(r&2048)+((t*sin(t>>2)&32)-16)*(1-r/16384%1)*!(~r&16384)),-128),127)+128
),

SIZE=10,

X=o=>({r:cos(o),i:sin(o)}),M=(a,b)=>({r:a.r*b.r-a.i*b.i,i:a.r*b.i+b.r*a.i}),A=(a,b)=>({r:a.r+b.r,i:a.i+b.i}),FFT=(O,I,oi,ii,N,s)=>{if(N==1)O[oi]={r:I[ii],i:0};else{FFT(O,I,oi,ii,N/2,s*2);FFT(O,I,oi+N/2,ii+s,N/2,s*2);for(let j=0;j<N/2;++j){let T=M(X(-2*PI/N*j),O[oi+j+N/2]);O[oi+j+N/2]=A(O[oi+j],M(T,{r:-1,i:0}));O[oi+j]=A(O[oi+j],T)}}},IFFT=(O,I,oi,ii,N,s)=>{if(N==1)O[oi]=I[ii];else{IFFT(O,I,oi,ii,N/2,s*2);IFFT(O,I,oi+N/2,ii+s,N/2,s*2);for(let j=0;j<N/2;++j){let T=M(X(2*PI/N*j),O[oi+j+N/2]);O[oi+j+N/2]=A(O[oi+j],M(T,{r:-1,i:0}));O[oi+j]=A(O[oi+j],T)}}},SIZE=1<<SIZE,t||(I=Array.from({length:2},()=>Array(SIZE).fill(0)),O=Array(2)),t%(SIZE)||(B=Array(SIZE*1.5).fill(0).map((v,i)=>BB(t+i))),t%(SIZE/2)||(F=t&SIZE-1?1:0,S=F*SIZE/2,I[F]=B.slice(S,SIZE+S).map((v,i)=>((v&255)/128-1)*sin(i*PI/SIZE)**2),O[F]=Array(SIZE).fill({r:0,i:0}),
FFT(O[F],I[F],0,0,SIZE,1),
e=min(1,2**max(0,t/1E6-.34)-1),
C=2**(3+5*e),
Q=.9-.5*e,
O[F]=O[F].map((v,i)=>M(v,{r:(x=SIZE/2-abs(i-SIZE/2),1/((x/C)**2-2*Q*x/C+1)),i:0})),
IFFT(I[F],O[F],0,0,SIZE,1)),
(I[0][t&SIZE-1].r/SIZE+I[1][t-SIZE/2&SIZE-1].r/SIZE)/3*(1+2*e)
// ,(B[t&SIZE-1]&255)/128-1 // uncomment to hear original