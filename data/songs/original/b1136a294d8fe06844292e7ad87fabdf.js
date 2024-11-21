tune=0.78,
speed=0.85,
T=t*tune,
b=t*speed,

bt=(x,len,spd)=>(x>>spd)%len,

dec=(spd,vol)=>(b&(16384*spd)-1)/vol,

sinwave=(x,amp)=>amp*sin(x*PI/64)+amp,

seq=(arr,spd)=>T*2**(arr[bt(t*speed,arr.length,spd)]/12),

mel1=[0,3,7,10,14][bt(t,5,0)],
mel2=[3,7,10,12,15][bt(t,5,0)],
mel3=[5,8,10,15,19][bt(t,5,0)],
mel4=[7,10,12,15,22][bt(t,5,0)],

mel=[mel1,mel2,mel3,mel4],


kick=sinwave(150*cbrt(b%16384),64),

ins=((seq(mel,16)/2%128)*dec(1,1.6e4)),

ins+kick