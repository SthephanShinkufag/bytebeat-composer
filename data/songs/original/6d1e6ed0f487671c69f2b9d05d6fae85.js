/*
 * get sepulched
 * by troubleshoot
 * (remake of Sepulchre)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=82,K=H=S=k=h=s=b1=b2=h1=h2=h3=s1=s2=s3=sl1=sl2=0,Ki=Hi=Sn=1,r=Array(m=16384).fill(0),R=i=>r[i%m],br=Array(m).fill(0),BR=i=>br[i%m],mr=Array(m).fill(0),MR=i=>mr[i%m],sr=Array(m).fill(0),SR=i=>sr[i%m],clip=x=>atan(1.5*x)/1.5,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c), // thas a lot of arrays

/* T crap */
T=t*samp/30*BPM, // speed
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* sidechain */
sch=(T>128+64?(([T*2%1,1]['0111'[3&T*2]])**1.5):1),

/* vibrato (credits to hrllobrothers4)*/
vib=1e3*sin(2*PI*t/(4096*2))/t,

/* saw function */
saw=x=>atan(tan(note(x)/1024*PI))/8,

/* mel 1 */
mel1Arr=[2,,5,,9,,7,,1,,5,,17,,7,5,-3,,5,,9,,7,,-2,,5,,22,,21,,], // mel 1 array

me=T=>sign(sin(tan(note(mel1Arr[31&T*2])/128*PI)))/8+sin(tan(note(mel1Arr[31&T*2])/128*PI))/16,
me1=(me(T)+me(T-1.5)*.7*(T>1.5)+me(T-3)*.5*(T>3)+me(T-4.5)*.3*(T>4.5))*.8,
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.5*me1),
mel1=[me1+R(t)+R(t+1),me1+R(t)+R(t+50)],

/* sliding note function */
sNote=x=>isNaN(x)?0:(sl1+=sl2+=(1.4*2**(x/12)-sl2)/1.2e4),

/* melody 2 */
/* (may be a lil out of sync)*/
mel2arr=[2,2,5,4,2,2,-3,9,2,2,5,7,2,2,-3,,2,14,17,21,17,14,2,-3,9,14,9,17,19,14,13,9,,2,5,9,7,1,5,17,7,-3,5,9,7,-2,5,22,21,2,4,5,,2,1,-3,,2,14,5,,1,4,9,,],
// mel 2 array

me2=(sign(sin(sNote(mel2arr[63&(T+1)/4])/(128+vib)*PI))+sign(sin(sNote(mel2arr[63&(T+1)/4])/(127+vib)*PI)))/11*(T>256),
me2=isNaN(me2)?0:me2,
mr[t%m]=.97*(.4*MR(t)+.3*MR(t+2192)+.2*MR(t+2828)+.5*me2),
mel2=[me2+MR(t)+MR(t+1),me2+MR(t)+MR(t+50)],

/* bass */
b=(saw(mel1Arr[(31&T/8)&6]+(oct=(T>128?[0,12][1&T/2]:0)))+saw(mel1Arr[(31&T/8)&6]+oct+.1)+saw(mel1Arr[(31&T/8)&6]+oct+.2))*.8*(T>64),
f=((1-T*(T>128?[128,256][1&T/2]:128)%1)**2)*.5,z=.4+.7/(1-f),
b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2),
br[t%m]=.97*(.4*BR(t)+.3*BR(t+2192)+.2*BR(t+2828)+.5*b2),
bass=[b1+BR(t)+BR(t+1),b1+BR(t)+BR(t+50)],

/* drum things */
n=K,K='1000'[3&T],K-n>0?Ki=0:Ki+=samp,
n=H,H='1010'[3&T*4],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
kick=pan=>clip((pan?cos:sin)(256*sqrt(Ki%1))*1.5*e(Ki,4,2)+
(random()-.5)*.1*e(Ki,6,2)),
// kick noise because why not
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.1+.1/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*sch*e(Hi,25,2),

/* snare */
c=1900*e(Sn,50,6)+180*e(Sn,25,2)+150,s=(s+c/sa)%1,
f=.2,z=.2+.2/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
sn=((s1-s2)*(e(Sn,40,4)/2+e(Sn,1,4)*min(Sn*9,1)**1.5)*2),
sr[t%m]=.97*(.4*SR(t)+.3*SR(t+2192)+.2*SR(t+2828)+.4*sn),
snare=pan=>sn+(SR(t)+SR(t+(pan?50:1)))*sch+clip((pan?cos:sin)(2*s*PI)*e(Sn,6,2)*2),
snare=[snare(0),snare(1)],

/* drums */
drums=[(kick[0]+hihat+snare[0])*(T>128+64),(kick[1]+hihat+snare[1])*(T>128+64)],

/* output */
out=pan=>(T>32?atan((mel1[pan]+bass[pan]+mel2[pan])*sch+drums[pan])/1.1:atan(mel1[pan])/1.1*(T/32%1)),
[out(0),out(1)]