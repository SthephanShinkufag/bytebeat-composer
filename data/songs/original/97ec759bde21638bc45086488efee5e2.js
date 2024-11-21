BB=t=>(
t>>=2,t>>6^t&37|t+(t^t>>11)-t*((t%24?2:6)&t>>11)^t<<1&(t&598?t>>4:t>>10)
),

SIZE=10,

X=o=>({r:cos(o),i:sin(o)}),M=(a,b)=>({r:a.r*b.r-a.i*b.i,i:a.r*b.i+b.r*a.i}),A=(a,b)=>({r:a.r+b.r,i:a.i+b.i}),FFT=(O,I,oi,ii,N,s)=>{if(N==1)O[oi]={r:I[ii],i:0};else{FFT(O,I,oi,ii,N/2,s*2);FFT(O,I,oi+N/2,ii+s,N/2,s*2);for(let j=0;j<N/2;++j){let T=M(X(-2*PI/N*j),O[oi+j+N/2]);O[oi+j+N/2]=A(O[oi+j],M(T,{r:-1,i:0}));O[oi+j]=A(O[oi+j],T)}}},IFFT=(O,I,oi,ii,N,s)=>{if(N==1)O[oi]=I[ii];else{IFFT(O,I,oi,ii,N/2,s*2);IFFT(O,I,oi+N/2,ii+s,N/2,s*2);for(let j=0;j<N/2;++j){let T=M(X(2*PI/N*j),O[oi+j+N/2]);O[oi+j+N/2]=A(O[oi+j],M(T,{r:-1,i:0}));O[oi+j]=A(O[oi+j],T)}}},SIZE=1<<SIZE,t||(I=Array.from({length:2},()=>Array(SIZE).fill(0)),O=Array(2)),t%(SIZE)||(B=Array(SIZE*1.5).fill(0).map((v,i)=>BB(t+i))),t%(SIZE/2)||(F=t&SIZE-1?1:0,S=F*SIZE/2,I[F]=B.slice(S,SIZE+S).map((v,i)=>((v&255)/128-1)*sin(i*PI/SIZE)**2),O[F]=Array(SIZE).fill({r:0,i:0}),
FFT(O[F],I[F],0,0,SIZE,1),
O[F]=O[F].map((v,i)=>M(v,{r:(abs(i-SIZE/2)<SIZE*.45?0:1),i:0})),
IFFT(I[F],O[F],0,0,SIZE,1)),
I[0][t&SIZE-1].r/SIZE+I[1][t-SIZE/2&SIZE-1].r/SIZE
// ,(B[t&SIZE-1]&255)/128-1 // uncomment to hear original