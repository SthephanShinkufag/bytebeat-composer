/*
 * submersion (unfinished)
 * by troubleshoot
 * (remix of OSIRIS)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=165,K=H=S=k=h=s=b1=b2=c1=c2=h1=h2=h3=s1=s2=0,Ki=Hi=Sn=1,r=Array(m=16384).fill(0),R=i=>r[i%m],cr=Array(m).fill(0),CR=i=>cr[i%m],clip=x=>atan(1.25*x)/1.25,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c),

/* T crap */
T=t*samp/30*BPM, // speed
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* sidechain */
sch=([T*2%1,1]['01110111011101110111011101110101'[31&T*2]])**1.5,

/* saw function */
saw=(x,o,p)=>atan(tan(note(x+p)/o*PI))/5,

/* vibrato (credits to hrllobrothers4)*/
vib=v=>v*sin(2*PI*t/(4096*2))/t,

/* chords */
chArr=[[-4,0,-7,-4],[0,3,-2,0],[5,7,3,[3,4][1&T/8]]],

c=o=>(saw(chArr[0][3&T/16],o,vib(300))+saw(chArr[1][3&T/16],o,vib(300))+saw(chArr[2][3&T/16],o,vib(300)))*.2,
c=c(127.5)+c(128.7)+c(129.6),
f=((T/2%1)**.2)*.4,z=.2+.2/(1-f),
c1+=f*(c-c1+z*(c1-c2)),c2+=f*(c1-c2),
cr[t%m]=.97*(.4*CR(t)+.3*CR(t+2192)+.2*CR(t+2828)+.5*c2),
chords=[c2+CR(t)+CR(t+1),c2+CR(t)+CR(t+50)],

/* arp */
arpArr=[0,5,8,,7,8,-2,,0,3,5,,10,8,7,3],

a=(T,p)=>sin((note(arpArr[15&T]+p)+5*cbrt(sin((note(arpArr[15&T]+p)*PI/1.05>>3)+(note(arpArr[15&T]+p)*PI/1.09>>4)))*(1-T%1))/32*PI)/2*((1-T%1)**.5),
ar=a(T,vib(180)),
ar2=a(T-1.5,vib(180))*.6*(T>1.5),
ar3=a(T-3,vib(180))*.4*(T>3),
ar4=a(T-4.5,vib(180))*.3*(T>4.5),
ar=(ar+ar2+ar3+ar4)*.6,
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.5*ar),
arp=[ar+R(t)+R(t+1),ar+R(t)+R(t+50)],

/* bass */
b=saw([5,10,12,17,5,10,12,15,5,7,10,13,5,7,10,12][15&T],1024,0),
f=((1-T%1)**.35)*.1,z=.4+.7/(1-f),
bass=(b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2)),

/* drum things */
n=K,K='1010'[3&T*('11111112'[7&T/2])/('22222221'[7&T/2])],K-n>0?Ki=0:Ki+=samp,
n=H,H='1010'[3&T*4],H-n>0?Hi=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
kick=pan=>clip((pan?cos:sin)(256*sqrt(Ki%1))*1.5*e(Ki,5,2)+
(random()-.5)*.1*e(Ki,6,2)),
// kick noise because why not
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.1+.1/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*.6*sch*e(Hi,25,2),

/* snare */
c=1900*e(Sn,50,6)+180*e(Sn,25,2)+150,s=(s+c/sa)%1,
f=.4,z=.1+.1/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
snare=pan=>(((s1-s2+(n-s2)*.6)*(e(Sn,80,4)/4+e(Sn,7,2)*min(Sn*9,1)**1.5)*2)+clip((pan?cos:sin)(2*s*PI)*e(Sn,8,2)*2)),
snare=[snare(0),snare(1)],

/* drums */
drums=[kick[0]+hihat+snare[0],kick[1]+hihat+snare[1]],

/* output */
out=pan=>atan((arp[pan]+chords[pan]+bass)*sch+drums[pan]),
[out(0),out(1)]