BB=t=>((63+64*sin(t*(t&t>>12)/164))*(t>>13<60)+t*random()%((-t>>8)%128+128)*(t>>13<64)+(63+64*sin(t*(t&t>>12)*50/22050/164)+(3E5/(t&32767)&90)+(3E6/(t+16384&32767)&100))*(t>>13>63)),

SIZE=10,

X=o=>({r:cos(o),i:sin(o)}),M=(a,b)=>({r:a.r*b.r-a.i*b.i,i:a.r*b.i+b.r*a.i}),A=(a,b)=>({r:a.r+b.r,i:a.i+b.i}),FFT=(O,I,oi,ii,N,s)=>{if(N==1)O[oi]={r:I[ii],i:0};else{FFT(O,I,oi,ii,N/2,s*2);FFT(O,I,oi+N/2,ii+s,N/2,s*2);for(let j=0;j<N/2;++j){let T=M(X(-2*PI/N*j),O[oi+j+N/2]);O[oi+j+N/2]=A(O[oi+j],M(T,{r:-1,i:0}));O[oi+j]=A(O[oi+j],T)}}},SIZE=1<<SIZE,t%(SIZE)||(B=Array(SIZE).fill(0).map((v,i)=>BB(t+i)),I=B.map((v,i)=>(v%256/128-1)*sin(i/SIZE*PI)**2),O=Array(SIZE).fill({r:0,i:0}),FFT(O,I,0,0,SIZE,1)),[B[t&SIZE-1],sqrt(O[(t>>1&SIZE/2-1)+2].r**2+O[(t>>1&SIZE/2-1)+2].i**2)*4]