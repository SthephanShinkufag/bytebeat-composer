t/=3,
T=t-(t&2048)/3,//SWANG
v=(t%8192)/8192,
s=x=>
(sin(PI*t/2*2**(parseInt('16ADID269E9EILQL48BGBGKNSNKNSNK6'[x>>11&31],36)/12-4))+1) * v * 32,
k = (sin(cbrt(t%8192+16)*8)+1)*64*(2-v),
//k = (sin(cbrt(t%8192+19)*9)+1)*640*(2-v) * min(v,.1),

[ s(T) + s(T-4096) + k, s(T) + s(T-6144) + k ]