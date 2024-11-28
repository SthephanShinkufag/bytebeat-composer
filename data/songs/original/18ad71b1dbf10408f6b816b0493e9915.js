t?0:a=Array(n=12288).fill(0),
SAMP_RATE = 44100,
ts = t/SAMP_RATE,
d = 261.63,
rb = 277.18,
r = 293.66,
mb = 311.13,
m = 329.63,
f = 349.23,
sb = 369.99,
s = 392.00,
lb = 415.30,
l = 440.00,
sib = 466.16,
si = 493.88,
nn=x=>(ts*x*128),
mel1=nn([d*2,d*2,d*2,d*2,d*2,d*2,d*2,d*2,si,si,si,si,si,si,si,si,l,l,l,l,l,l,0,0,0,0,l,lb,l,si,d*2,r*2,m*2,m*2,m*2,0,m*2,m*2,m*2,0,m*2,m*2,m*2,0,m*2,m*2,m*2,0,m*2,m*2,m*2,m*2,m*2,m*2,m*2,m*2,m*2,m*2,r*2,r*2,m*2,m*2,f*2,f*2,f*2,f*2,f*2,f*2,f*2,f*2,si,si,si,si,d*2,d*2,r*2,r*2,m*2,m*2,m*2,m*2,m*2,m*2,m*2,m*2,l,l,l,l,l,l,si,si,d*2,d*2,d*2,d*2,d*2,d*2,r*2,r*2,si,si,si,si,si,si,d*2,d*2,l,l,l,l,l,l,l,l,l,l,l,l,l,l][t>>12&127]),


mel2=nn([l,l,l,l,l,l,l,l,lb,lb,lb,lb,lb,lb,lb,lb,m,m,m,m,m,m,m,m,0,0,0,0,0,0,0,0,d*2,d*2,d*2,0,d*2,d*2,d*2,0,si,si,si,0,si,si,si,0,s,s,s,s,s,s,s,s,s,s,0,0,0,0,d*2,d*2,d*2,d*2,d*2,d*2,d*2,d*2,lb,lb,lb,lb,0,0,0,0,d*2,d*2,d*2,d*2,d*2,d*2,d*2,d*2,sb,sb,sb,sb,0,0,0,0,l,l,l,l,l,l,0,0,lb,lb,lb,lb,lb,lb,0,0,m,m,m,m,m,m,m,m,m,m,m,m,m,m][t>>12&127]),


mel3=nn([m,m,m,m,m,m,m,m,m,m,m,m,m,m,m,m,d,d,d,d,d,d,d,d,0,0,0,0,0,0,0,0,l,l,l,0,l,l,l,0,l,l,l,0,l,l,l,0,d*2,d*2,d*2,d*2,d*2,d*2,d*2,d*2,d*2,d*2,0,0,0,0,l,l,l,l,l,l,l,l,m,m,m,m,0,0,0,0,l,l,l,l,l,l,l,l,r,r,r,r,0,0,0,0,mb,mb,mb,mb,mb,mb,0,0,r,r,r,r,r,r,0,0,d,d,d,d,d,d,d,d,d,d,d,d,d][t>>12&127]),

ev=(mel1%256+mel2%256+mel3%256)/6+a[t%n]||0, a[t%n]= ev/2,ev/1.5