/*
 * hyper hexagonest (unfinished)
 * by troubleshoot
 * (remake of Focus)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=175,K=H=S=k=h=s=b1=b2=h1=h2=h3=s1=s2=sl1=sl2=0,Ki=Hi=Sn=1,clip=x=>atan(1.5*x)/1.5,r=Array(m=16384).fill(0),R=i=>r[i%m],r2=Array(m).fill(0),R2=i=>r2[i%m],br=Array(m).fill(0),BR=i=>br[i%m],e=(a,b,c)=>(1-(a*b<1?a*b:1))**c),

/* T crap */
T=t*samp/30*BPM, // speed
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* slide note function */
sNote=x=>isNaN(x)?0:(sl1+=sl2+=((1.4*2**(transpose/12))*2**(x/12)-sl2)/1.3e3),

/* saw function */
saw=(x,o)=>atan(tan(note(x)/o*PI))/8,

/* square function */
squ=(x,o)=>sign(sin(note(x)/o*PI))/8,
// non-sliding version
squ2=(x,o)=>sign(sin(sNote(x)/o*PI))/12,
// sliding version

/* sidechain */
sch=([T%1,1]['01011001'[(T>128?3:7)&T]])**2,

/* mel 1 */
me=(squ2([-2,1,0,5,-2,,-2,][7&T],128)+squ2([-2,1,0,5,-2,,-2,][7&T],127))*(T>128?.9:1),
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.7*me),
mel1=[me+R(t)+R(t+1),me+R(t)+R(t+50)],

/* mel 2 */
mel2Arr=[[-2,,0,,1,,-2,],[-2,,5,,8,,3,],[5,,8,,10,,12,,13,12,8,5,10,,]],
// mel 2 arr

mel2arr2=[,-2,-2,,-2,,,,,0,0,,0,,,,,1,1,,1,,,,,5,5,,5,,], // mel 2 arr 2

me2=squ(T>256?mel2arr2[31&T]:mel2Arr['00001122'[7&T/8]][[7,15]['00000001'[7&T/8]]&T],[32,16][1&T*8])*1.3*(T>128),
r2[t%m]=.97*(.4*R2(t)+.3*R2(t+2192)+.2*R2(t+2828)+.6*me2),
mel2=[me2+R2(t)+R2(t+1),me2+R2(t)+R2(t+50)],

/* bass */
bArr=[-2,[-2,-2,-2,-2,-2,-2,-2,0][7&T/4],-6,-4], // bass arr

b=saw(bArr[3&T/16],(oct=[512,256][1&T/4]))+saw(bArr[3&T/16],oct-2),
f=((1-T%1)+(1-T*128%1))*.2,z=.4+.7/(1-f),
bass=((b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2))+squ(bArr[3&T/16],256)+squ(bArr[3&T/16],254))*.6,
br[t%m]=.97*(.4*BR(t)+.3*BR(t+2192)+.2*BR(t+2828)+.7*bass),
bass=[bass+(BR(t)+BR(t+1))*1.5,bass+(BR(t)+BR(t+50))*1.5],

/* drum things */
n=K,K='10000100'[(T>128?3:7)&T],K-n>0?Ki=0:Ki+=samp,
n=H,H='1010'[3&T*4],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
c=1e3*e(Ki,50,6)+90*e(Ki,25,2)+100,k=(k+c/sa)%1,
// snare structure bcuz yes

kick=pan=>clip((pan?cos:sin)(2*k*PI)*1.5*e(Ki,6,2)+(random()-.5)*.1*e(Ki,7,2))*1.6,
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.4+.4/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.3)*.8*sch*e(Hi,20,2),

/* snare */
n=2*random()-1,
c=2e3*e(Sn,50,6)+200*e(Sn,25,2)+230,s=(s+c/sa)%1,
f=.4,z=.1+.1/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
sn=pan=>((s1-s2+(n-s2)*.6)*(e(Sn,40,4)/4+e(Sn,6,3)*min(Sn*9,1)**1.5)*2.5+clip((pan?cos:sin)(2*s*PI)*e(Sn,6,2)*1.5))*1.25,
snare=[sn(0),sn(1)],

/* drums */
drums=[kick[0]+hihat+snare[0],kick[1]+hihat+snare[1]],

/* fader */
fader=T>8?(T>128+8?0:(T>128?(h1-h2)*(1-T/8%1):(T>120?(h1-h2)*.7*(T/8%1):0))):(h1-h2)*.7*(1-T/8%1),

/* output */
out=pan=>atan(((mel1[pan]+mel2[pan]+bass[pan])*sch+drums[pan]+fader)*.9),
[out(0),out(1)]