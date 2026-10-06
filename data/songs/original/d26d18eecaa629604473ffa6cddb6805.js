SR=44100,
TAU=PI*2,
t/=SR,
mtof=(n)=>440*2**((n-69)/12),

gate16=(t,seq)=>(
  (seq>>(t&15)&1)
),
seq16=(t,seq,spd)=>(seq>>((t*spd)&15)&1)*t,

kick = (t) => (
  x = t,
  env = 1 - min(max((x - 0.8) / 0.2, 0), 1),
  env *= 2^x,
  p = x
    -  12 * pow(2, -10 * x)
    -  7 * pow(2, -20 * x)
    -  3 * pow(2, -500 * x),
  w = sin(2 * PI * p),
  sat = tanh(2 * w),
  0.5 * env * sat
),
bass = (t,n) => (
  fq = mtof(n),
  env = min(max((t - 0.2) / 0.3, 0.1), 0.4),
  flt=16+10*sin(t),
  tanh(sin(fq*t*TAU)*flt)*env
),

hh = () => (
  spd=(t)%8>7.5?12:8,
  env=1-(t*spd)%1,
  random()**8*env**4
),

ride = (t) => (
  env = max(0.2, min(1.0, (t - 0.1) / 0.5)),
  random()*0.5*env
),

arp = (t,n) => (
  fq = mtof(n),
  env= 1-(t*8)%1,
  env *= min(max((t - 0.2) / 0.3, 0), 0.4),
  flt=5+2*sin(t+n),
  tanh(sin(fq*t*TAU)*flt)*env
),

arps=(t)=>(
+arp(seq16(t,0b0100100100100100,8),60+(2*((t/4)%2<1)))*0.2
+arp(seq16(t,0b1001001001001000,8),65-(2*((t/8)%2<1)))*0.25
+arp(seq16(t,0b1100101001000010,8),75-(8*((t/6)%2<1)))*0.3
),


T=t%0.5,
b=t>16,
c=t>32,
d=(t%32)<14||(t%32)>16,
kick(T)*0.5*d
+arps(t)
+arps(t+0.02)*0.7
+arps(t+0.246)*0.5
+arps(t+0.733)*0.3
+arps(t+0.502)*0.2
+arps(t+0.895)*0.2
+bass(seq16(t,0b1101101101101100,8),29+(7*((t/8)%2<1)))*0.5*b
+hh()*0.12*c
+ride(T)*0.08*c