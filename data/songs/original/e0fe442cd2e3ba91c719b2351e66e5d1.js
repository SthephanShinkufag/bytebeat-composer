/*
 * (INHALE) A gasoline or electric-powered vehicle 
 * used for land transportation also known as an 
 * automobile in a timeline far forward than ours
 * by troubleshoot
 * (remix of "Future Car" by Zackx)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=245,bas=[3,3,-4,-1,3,3,6,8],K=H=S=k=h=s=b1=b2=h1=h2=h3=s1=s2=sy1=sy2=0,Ki=Hi=Sn=1,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,clip=x=>atan(1.4*x)/1.4,arr=i=>Array(i).fill(0),r=arr(m=2e4),R=i=>r[i%m],b=arr(m),B=i=>b[i%m]),

/* T crap */
T=t*samp/30*BPM, // speed

/* note function */
note=x=>isNaN(x)?0:(t/1.42)*2**(x/12),

/* saw function */
saw=(x,o)=>atan(tan(note(x)/o*PI))/8,

/* bass */
ba=saw(bas[7&T/16],[1024,512]['0010011001010111'[15&T]]),
f=(([1-T/2%1,1-T/4%1,1-T%1]['0000011002222111'[15&T]]**.25)+(T>128?(1-T*128%1)**2:0))*.05,z=.4+.7/(1-f),
sch=(T>128?[T%1,1,1,1][3&T]**5:1), // sidechain
bass=(b1+=f*(ba-b1+z*(b1-b2)),b2+=f*(b1-b2)),
b[t%m]=.97*(.4*B(t)+.3*B(t+2192)+.2*B(t+2828)+.3*bass),
bLeft=(bass*1.25+B(t+1))*sch,bRight=(bass/1.25+B(t+50))*sch,
bass=[bLeft,bRight],

/* drum things */
n=K,K='1000'[3&T/(T>256?2:1)],K-n>0?Ki=0:Ki+=samp,
n=H,H='0101'[3&T/2],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T/2],S-n>0?Sn=s=0:Sn+=samp,

c=4e3/(3+2e3*Ki),k=(k+c/sa)%1,
kick=sin(2*k*PI)*e(Ki,5,2)*.6*(T>64), // kick

n=(random()-.5),
f=6880*PI*samp,z=.7+.7/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.05)*e(Hi,18,3)*.5*(T>128+64),
hihat=(T<128+(64+60)?hihat:0)+(T>256?hihat:0),
// hihat

c=2e3*e(Sn,50,6)+200*e(Sn,25,2)+160,s=(s+c/sa)%1,
f=.6,z=.1+.1/(1-f),n=2*random()-1,
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
snare=(((s1-s2+(n-s2)*.5)*(e(Sn,80,2)/4+e(Sn,7,2)*min(Sn*9,1)**1.5)*1.7)+(sin(2*s*PI)*e(Sn,10,2)))*.8*(T>128+(64+60)), // snare

/* drums */
drums=[clip(kick+snare+hihat),clip(kick+(snare+hihat)*1.25)],

/* synth */
syn=(saw(bas[7&T/16],[256,64]['0010011001010111'[15&T]])+saw(bas[7&T/16],[86*4,86]['0010011001010111'[15&T]])+saw(bas[7&T/16],[512,256]['0010011001010111'[15&T]]))*(T>128),
f=([1-T/2%1,1-T/4%1,1-T%1]['0000011002222111'[15&T]]**.4)*.3,z=.4+.7/(1-f),
syn=clip((sy1+=f*(syn-sy1+z*(sy1-sy2)),sy2+=f*(sy1-sy2))*sch)*.7,
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.3*syn),
sLeft=syn+R(t+1),sRight=syn+R(t+50),
synth=[sLeft,sRight],

/* output */
out=pan=>(T<128+(64+60)?(bass[pan]+synth[pan]):0)+(T>256?(bass[pan]+synth[pan]):0)+drums[pan],
[out(0),out(1)]