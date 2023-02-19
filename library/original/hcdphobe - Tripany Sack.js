/*NOTES
the plus sign is a FM (Frequency Modulation)
and the multiplier is a AM (Amplitude Modulation)
*/
volume=60, //the volume
x=volume>100?0:volume<0?0:volume/100, //checks if the volume exceeds beyond 100 or less than 0 and if it does mute that
//some shortcuts
S=function(x){
return sin(x*PI/128)
},
C=function(x){
return cos(x*PI/128)
},
//the sample rate
samp_rate=96000,
p=256,
beat=p*t/samp_rate,
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
d1=S(random(beat))*(-beat*64/10&255)/12,
d1=[d1,0,d1/2,0][int(beat/40)%4],
t1=[a,0,a*s2,a*s2,g*s2,a*s2,0,a,0,a*s2,0,g*s2,a*s2,0,g,0][int(beat/40)%16],
(S(t1+S(t1/s2/1.002)*128)*(-beat*64/10&255)/768+d1/2+S(1000/(beat/10%16+.2))*(-beat*16/10&255)/768+S(a-C(a/2)*128+S(a/2)*128)*S(a)*S(64+beat/120)/9)*x