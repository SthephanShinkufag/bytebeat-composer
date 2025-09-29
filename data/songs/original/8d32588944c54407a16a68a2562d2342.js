/*
 * short cooling (unfinished)
 * by troubleshoot
 * (remake of 𝑳𝒐𝒏𝒈 𝑾𝒂𝒓𝒎𝒕𝒉)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=97,K=H=S=k=h=s=a1=a2=b1=b2=c1=c2=f2=p1=p2=h1=h2=h3=s1=s2=s3=0,Ki=Hi=Sn=1,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,clip=x=>atan(1.4*x)/1.4,r=Array(m=15e3).fill(0),R=i=>r[i%m],cr=Array(m=15e3).fill(0),CR=i=>cr[i%m],ar=Array(m).fill(0),AR=i=>ar[i%m],e2=(a,b)=>1>a/b?(n=1-a/b)*n:0),

/* T crap */
T=t*samp/30*BPM, // time
p=t/1.43, // pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* phonk saw */
phSaw=x=>atan(tan(note(x)/176*PI))/8+atan(tan(note(x)/118*PI))/8,

/* supersaw */
supsaw=x=>(atan(tan(note(x)/59*PI))+atan(tan(note(x)/59.3*PI))+atan(tan(note(x)/59.5*PI))+atan(tan(note(x)/59.7*PI)))/8,

/* sidechain */
sch=([T*2%1,1,1,1][3&T*2])**1.5,

/* chords */
chArr=[[-6,-2,1,5],[-9,-6,-2,3],[-6,-2,1,8],[-14,-6,-2,3]][T/8&3], // chord array

ch=(supsaw(chArr[0]+.3)+supsaw(chArr[1]+.3)+supsaw(chArr[2]+.3)+supsaw(chArr[3]+.3))/5*(T>128?1:0),
f=.4,z=.4+.7/(1-f),
chords=(c1+=f*(ch-c1+z*(c1-c2)),c2+=f*(c1-c2)),
cr[t%m]=.97*(.4*CR(t)+.3*CR(t+2192)+.2*CR(t+2828)+.6*chords),
chords=[(c2+CR(t)+CR(t+1))*((T/2%1)**.7),(c2+CR(t)+CR(t+50))*((T/2%1)**.7)],

/* melody */
ph=phSaw(chArr[t*2&3])*1.1,
f=.3,z=.4+.9/(1-f),
mel=(clip((p1+=f*(ph-p1+z*(p1-p2)),p2+=f*(p1-p2))/(T%8%1.5%1)**.7)/1.8),
mel=isNaN(mel)?0:mel,
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.6*(p2*.2+mel*.8)),
mel=[(mel+R(t)+R(t+1))*sch,(mel+R(t)+R(t+50))*sch],

/* arp (idk) */
arpArr=[[,,,-2,1,,5,-7],[,,,-6,-2,,-6,3],[,,,-2,1,,8,-2],[,,,-6,-2,,3,-9]][3&T/8], // arp array

arp=(supsaw(arpArr[7&T*2]+.3)/1.3*'10'[1&T/4])*(T>128+64?1:0),
f=(1-T*2%1)*.4,z=.4-.9/(1-f),
arp=(a1+=f*(arp-a1+z*(a1-a2)),a2+=f*(a1-a2)),
ar[t%m]=.97*(.4*AR(t)+.3*AR(t+2192)+.2*AR(t+2828)+.9*arp),
arp=[arp+(AR(t)+AR(t+1))*1.2*sch,arp+(AR(t)+AR(t+50))*1.2*sch],

/* bass */
b=(sin(note([-6,-9,-6,-2][3&T/8])/176*PI)+sin(note([-6,-9,-6,-2][3&T/8])/118*PI))/6+phSaw([-6,-9,-6,-2][3&T/8]-12)/4,
f=.2,z=.3+.5/(1-f),
bass=(b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2))*sch,

/* drum things */
n=K,K='1000'[3&T],K-n>0?Ki=0:Ki+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=0:Sn+=samp,
n=H,H='1010'[3&T*4],H-n>0?Hi=h=0:Hi+=samp,

/* kick */
kick=pan=>(pan?cos(256*sqrt(Ki%1)):sin(256*sqrt(Ki%1)))*e(Ki,6,1)*2+
(random()-.5)*.15*e(Ki,6,2),
// kick noise because why not
kick=[kick(0),kick(1)],

/* snare (just a clap with sine) */
n=2*random()-1,
f=.5-.25*(1-1/(1+35*Sn)),z=.5+.5/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),s3+=f*(s2-s3),
sn=clip((s1-s3)*(Sn<.008?2*e2(Sn,.008):Sn<2*.008?.9*e2(Sn-.008,.008):Sn<3*.008?e2(Sn-2*.008,.008):e2(Sn-3*.008,.11))+sin(asin(sin(256*cbrt(Sn%1))))*2*e(Sn,10,2))*1.5,
snare=[sn*1.2,sn],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.7+.7/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*.6*e(Hi,19,2)*(sch**2)*(T>128?1:0),

/* drums */
drums=pan=>kick[pan]+hihat+snare[pan],

/* fader */
fader=((h1-h2)*.1*(T>8?0:1-T/8%1)**1.5)+(n-h2)*.004*(T>64?sch:1),

/* output */
out=pan=>(T>64?atan(mel[pan]+bass+drums(pan)+chords[pan]+arp[pan])*.9:atan(mel[pan]+(T>32?bass/1.2:0))*.9*(T>32?1:T/32%1))+fader,
[out(0),out(1)]