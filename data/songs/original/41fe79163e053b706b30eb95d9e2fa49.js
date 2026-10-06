SR=8e3,
t/=SR,
t*=1.4,

mtof=(n)=>440 * 2 ** ((n - 69) / 12),

gate16=(t,seq)=>(
  (seq>>(t&15)&1)
),

seq16=(t,seq,spd)=>(seq>>((t*spd)&15)&1)*t,

kick = (t) => (
  env = 1 - min(max((t+0.1) * 2, 0), 1),
  env *= 2^t,
  p = t
    -  12 * pow(2, -5 * t)
    -  7 * pow(2, -50 * t)
    -  3 * pow(2, -800 * t),
  w = sin(2 * PI * p),
  sat = tanh(5 * w),
  0.5 * sat * env
),

snare = t => (
  env = exp(-25 * t),
  pitchEnv = exp(-200 * t),
  body =
    sin(600 * t - 40 * pitchEnv) * 0.6 +
    sin(500 * t - 80 * pitchEnv) * 0.2,

  mix = body + random() * 0.8,
  tanh(mix * env * 5)
),

bass = (t,n,m) => (
  fq = mtof(n),
  env = min(max((t - 0.2) / 0.6, 0.1), 0.4),
  flt=min(t/2-8,26)+3*sin(t*0.3),
  mod=m?sin(t*6900)*0.25:sin(t*1.25)*0.05,
  tanh(sin(fq*t*PI*2+mod)*flt)*env
),

noiz=t=>(
  n = sin((t * 8000 % 1) * 43758.5453123),
  noise = (n - sin((t - 0.0002) * 43758.5453123)) * 0.5
),

hh = () => (
  spd=(t)%8>7.5?12:8,
  env=1-(t*spd)%1,
  env=env**2,
  (noiz(t/16)+noiz(t/16-0.002)+noiz(t/18-0.003)+random()*0.7)*env**4
),

siren=(t)=>(
  p=(t/100)*(t>>2)%1,
  sin(max(t*100,t*250+sin(t*p*5000)))
),

del=(t,f)=>f(t)+f(t+1)/4+f(t+1.5)/8,

t_bass=(t>2**4),
t_hh=(t>2**5)&&(t>>5&1),
t_mod=(t>2**6),
t_sirenmod=(t>2**6)&&((t-0.5)>>3&1),

np=20+(3*((t/8)%2<1))+gate16(t*4,0b0000011100011100)*3,

b1=0b0010000100100001,
b2=0b0010100100100001,
bptr=(t>>2)%4,

T=t%0.5,
m=t_mod&&((t-0.5)>>3&1)
  ||(gate16(t*4,0b1000000000000000,4)&&(t>>3&1)),
kick(seq16(t,(bptr==3)?b2:b1,4)%0.25)*0.5
+del(t,(t)=>bass(seq16(t,0b1101101101101100,4),np,m)*0.6*t_bass)
+hh()*(0.08+sin(t*0.2)*0.1)*t_hh
+snare((t+0.5)%1)*0.6
+del(t,(t)=>siren(t_sirenmod?t%2**5:t)*(((t-0.5)>>3&1)?1:0.5))*0.05