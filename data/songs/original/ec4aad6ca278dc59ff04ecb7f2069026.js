t?0:ec=Array(n=12288).fill(0),
SAMP_RATE = 32000,
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


nn=x=>((ts*x*256))&64%256,
nn1=x=>((wav=(ts*x*256))%256+wav%255)/2,

mel1=x=>nn([sib/2,rb,f,sib/2,rb,f,sib/2,rb,f,sib/2,f,rb,f/2,sib/2,rb,f/2,sib/2,rb,f/2,sib/2,rb,f/2,rb,d][(t>>13)%24]/2*x*[1,1,1.5,1.2][t/1.5>>17&3])*(~t/2&4095)/4096,
mel=(mel1(1)+mel1(1.01))/2,

bass1=x=> nn1([sib/2,f/2,f,rb][t/1.5>>17&3]/4*x)/4,

L=(ev=(bass1(1)+bass1(1.01)+bass1(0.99))+mel+ec[t%n], ec[t%n]=ev/2,ev)/2,
R=(ev=(bass1(0.98)+bass1(1.02)+bass1(1.03)/3)+mel+ec[t%n], ec[t%n]=ev/2,ev)/2,
[L,R]