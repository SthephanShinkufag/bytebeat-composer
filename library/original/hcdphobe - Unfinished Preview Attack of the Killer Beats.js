volume=100, //the volume
x=volume>100?0:volume<0?0:volume/100, //check exceeds and below 0 and mute it
samp_rate=44100,
p=256,
beat=p*t/samp_rate,
v=beat/415,
z=1.04729,
//shortcuts for your plesure
p=pow,
l='length',
q=int,
//the notes
c=65.41*beat,
cs=69.30*beat,
d=72.42*beat,
ds=77.78*beat,
e=82.41*beat,
f=87.31*beat,
fs=92.50*beat,
g=98*beat,
gs=103.83*beat,
a=110*beat,
as=116.54*beat,
b=123.47*beat,
//the notes pitch
//note: the division is the low pitch and the multiplier is the high pitch
s2=2,
s3=4,
s4=8,
s5=16,
//PWM function
pwm=function(x,b){
return ((x/2&127)+b*1.3&128)
},
r1=[a,a,a,a,a,a,a,b,c*s2,c*s2,c*s2,c*s2,c*s2,c*s2,c*s2,c*s2,f,f,f,f,f,f,f,f,a,a,a,a,gs,gs,gs,gs],
r1=z*r1[q(v*8)%r1[l]]*(1+v*2**4&1),
r2=[0,a,gs,a,c*s2,a,gs,a,e*s2,e*s2,e*s2,e*s2,e*s2,e*s2,e*s2,0,0,d*s2,c*s2,b,c*s2,d*s2,g*s2,f*s2,e*s2,e*s2,e*s2,e*s2,e*s2,e*s2,e*s2,0,0,d*s2,c*s2,b,c*s2,d*s2,g*s2,f*s2,e*s2,e*s2,e*s2,e*s2,d*s2,d*s2,d*s2,d*s2,e*s2,e*s2,e*s2,e*s2,e*s2,e*s2,d*s2,c*s2,b,b,b,b,d*s2,d*s2,d*s2,d*s2],
r2=z*s3*r2[q(v*4**2)%r2[l]],
(pwm(r1,75)/2+pwm(r2,50)/2)*x