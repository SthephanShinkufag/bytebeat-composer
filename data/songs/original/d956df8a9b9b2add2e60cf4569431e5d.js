SR=48000,
TAU=2*PI,
T=t/SR,

t||(db=[],di=0),

dl=(v,len=20000,fb=.6,mix=.5)=>(
  d=db[p=(di-len)&65535]||0,
  db[di++&65535]=v+d*fb,
  v*(1-mix)+d*mix
),

kick=()=>(
mod=30*2**(-(T%2)*80),
env=1*(1.0+(-(T%2)))**6,
atanh(sin(10*sin(T*TAU*20+mod)*env))
),

snare = T => (
  env = exp(-25 * T),
  pitchEnv = exp(-560 * T),
  body =
    sin(400 * T - 40 * pitchEnv) * 0.6 +
    sin(300 * T - 20 * pitchEnv) * 0.2,

  mix = body + random() * 0.8,
  tanh(mix * env * 4)
),

pad = (t,n) => {
  let out=0;

  for (let i = 0; i < 8; i++) {
    let det = sin(i * 12.9898) * sin(t/1000)*0.6;
    let freq = n * pow(2, det);
    let ph = (t * freq + i * 0.123) % 1;
    let w = sin(6.28 * (ph + 0.4 * sin(6.28 * ph * 3)));
    out += w;
  }

  return out/8;
},

mix=d=>
  d.reduce(
    ([l,r], _, i) =>
      i%3
        ? [l,r]
        : [
            l+d[i]*d[i+1]*d[i+2],
            r+d[i]*(1-d[i+1])*d[i+2]
          ],
    [0,0]
  ),

mix([
// pad
(((T%48)<32)&&(T>16))?(T%1):1,
0.5,
dl(pad(T,52)*atanh(0.8*sin(T/2))),

// hihat
0.8,
0.5+sin(T/3)/4,
dl(random()*sin((T-0.1)*8)*max(0,(1-((T*8)%1)))*(0b11011011011>>((T*8)&15)&1)*(0.2+sin(T/5)*0.1)*min(1,T/96)),

0.8,
0.5,
kick()*((T%48)<32)*(T>16),

0.8,
0.5,
snare((T+1)%2)*((T%48)<40)*(T>16),

// bass
1,
sin(T/8),
dl(min(0.1,T/20)*(sin(0.8*atanh(sin(T*TAU*40)))*0.5*0b01100101001>>floor(T*8)&1)*(T>16)*((T%6)<2)),

// rainL
0.08*((((T%48)<32)&&(T>16))?(T%1):(T%16)/16),
0,
max(0,(v=random(),(v>0.5)?v*v:v)**10),

// rainR
0.08*((((T%48)<32)&&(T>16))?(T%1):(T%16)/16),
1,
max(0,(v=random(),(v>0.5)?v*v:v)**10)
])
