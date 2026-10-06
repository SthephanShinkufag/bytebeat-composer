RATE=44100,

nt=t/RATE,
TEMPO=.6,
bn=floor(nt/TEMPO),
bp=nt%TEMPO,
mn=floor(bp*4),
mp=bp*4%1,

sw=(x,n)=>(sin(6.28*x*220*n)/2+.5),

P=[0,1,4,3,5,2,6,7],

bn<192?
(
(mp<.1?sw(t*t*t,9):0)*40+
(bn>32?(nt*110*P[(bn/8|0)%(P.length-1)+1])%256*30:0)+
((mn?sw(nt,mn+bn%4+P[(bn/4|0)%P.length]):sw(pow(bp,.2),.1)*.6))*220
):0
