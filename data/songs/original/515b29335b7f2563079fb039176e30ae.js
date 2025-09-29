/*
 * akimbo
 * by troubleshoot
 * (recreation of Isolation)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=200,K=H=S=k=h=s=b1=b2=b3=b4=h1=h2=m1=m2=s1=s2=s3=0,Ki=Hi=Sn=1,r=Array(m=16384).fill(0),R=i=>r[i%m],br=Array(m).fill(0),BR=i=>br[i%m],e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,e2=(a,b)=>1>a/b?(n=1-a/b)*n:0),

/* T crap */
T=t*samp/30*BPM, // speed
transpose=-.2, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* sidechain */
sch=([T*2%1,1]['0111'[3&T*2]])**1.5,

/* saw function */
saw=(x,o)=>atan(tan(note(x)/o*PI))/4,

/* mel */
melArr=[2,2,2,2,2,2,4,5,7,7,7,5,4,4,4,5,5,5,5,5,5,5,5,5,4,4,4,7,7,5,4,5],
// mel array

me=(saw(melArr[31&T],256)+saw(melArr[31&T],253)+saw(melArr[31&T],126))*.25,
f=.8,z=.4+.7/(1-f),
m1+=f*(me-m1+z*(m1-m2)),m2+=f*(m1-m2),
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.4*m2),
mel=[m2+R(t)+R(t+1),m2+R(t)+R(t+50)],

/* bass 1 (?) */
b1Arr=[2,[2,4][1&T/4],5,4],
// bass 1 array

b=(saw(b1Arr[3&T/8],512)+saw(b1Arr[3&T/8],255)+sin(note(b1Arr[3&T/8])/256*PI)*.5)/1.25*((1-T*'21'[1&T]%1)**2),
f=.7,z=.4+.7/(1-f),
b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2),
br[t%m]=.97*(.4*BR(t)+.3*BR(t+2192)+.2*BR(t+2828)+.4*b2),
bass1=[b2+BR(t)+BR(t+1),b2+BR(t)+BR(t+50)],

/* bass 2 */
ba=saw([2,2,-2,0][3&T/8],512)*.8,
f=(1-T%1)*.15,z=.4+.7/(1-f),
bass2=(b3+=f*(ba-b3+z*(b3-b4)),b4+=f*(b3-b4)),

/* drum things */
n=K,K='1000'[3&T],K-n>0?Ki=0:Ki+=samp,
n=H,H='1010'[3&T*[2,2,2,2,2,2,2,[2,4][1&T]][7&T/2]],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=0:Sn+=samp,

/* kick */
c=1e3*e(Ki,50,6)+90*e(Ki,25,2)+100,k=(k+c/sa)%1,
// snare structure bcuz yes

kick=pan=>((pan?cos:sin)(2*k*PI)*2*e(Ki,6,2)+(random()-.5)*.1*e(Ki,7,2)),
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=.7,z=.1+.1/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
hihat=(n-h2)*.5*sch*e(Hi,17,2),

/* snare (just a clap with sine) */
f=.4-.2*(1-1/(1+35*Sn)),z=.5+.9/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),s3+=f*(s2-s3),
sn=pan=>((s1-s3)*.85*(Sn<.008?2*e2(Sn,.008):Sn<2*.008?.9*e2(Sn-.008,.008):Sn<3*.008?e2(Sn-2*.008,.008):e2(Sn-3*.008,.11))+sin(asin((pan?cos:sin)(256*cbrt(Sn%1))))*2*e(Sn,10,2)),
snare=[sn(0),sn(1)],

/* drums */
drums=pan=>kick[pan]+hihat+snare[pan],
drums=[drums(0),drums(1)],

/* output */
out=pan=>atan((mel[pan]+bass1[pan]+bass2)*sch+drums[pan]),
[out(0),out(1)]