SAMP_RATE = 48000,
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


nn=x=>(((30*sin(t/2048)+ts*x*512)%256)<32?64:0),

mel1=nn([f,f,f,f,si,si,si,si,l,l,f,f,f,f,f,f,m,m,m,m,f,,s,,l,,m,m,m,m,m,m,f,f,f,f,s,s,l,l,si,si,f,f,f,f,r,r,m,m,f,f,si,si,s,s,m,m,l,l,f,f,,,d,d,,,s,s,f,f,m,m,l,l,s,s,f,f,si,si,l,l,s,s,d*2,d*2,si,si,l,l,si,si,l,l,m,m,f,f,s,s,r,r,m,m,f,f,m,m,f,f,s,s,l,l,f,f,f,f,f,f,l,l,m*2,r*2,d*2,r*2,d*2,si,l,d/2,d/2,d/2,d/2,si/4,si/4,d/2,d/2,d/2,d/2,s/4,s/4,l/4,l/4,si/4,si/4,s/4,s/4,si/4,si/4,l/4,l/4,m/4,m/4,s/4,s/4,s/4,s/4,m/4,m/4,f/4,f/4,m/4,m/4,r/4,r/4,d/4,d/4,d/4,d/4,m/4,m/4,d/4,d/4,f/4,f/4,f/4,f/4,r/4,r/4,m/4,m/4,f/4,f/4,l/4,l/4,l/4,l/4,s/4,s/4,l/4,l/4,l/4,l/4,d/2,d/2,si/4,si/4,l/4,l/4,r/2,r/2,d/2,d/2,si/4,si/4,m/2,m/2,r/2,r/2,d/2,d/2,f/2,f/2,m/2,m/2,r/2,r/2,l/2,l/2,s/2,s/2,f/2,f/2,r/2,r/2,m/2,m/2,f/2,f/2,l/2,l/2,l/2,l/2,si/2,si/2,m/2,m/2,f/2,f/2,l/2,l/2,d,si/2,l/2,s/2,l/2,s/2,f/2,m/2,r/2,r/2,r/2,r/2][t*1.2>>12&255])