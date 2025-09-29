/* random vars */
t||(sa=48e3,samp=1/48e3,BPM=182,ch=[10,9],K=S=H=k=s=s1=s2=h=h1=h2=h3=b1=b2=c1=c2=0,Ki=Sn=Hi=1,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,clip=x=>atan(1.4*x)/1.4,r=Array(m=1.5e4).fill(0),R=i=>r[i%m]),

/* T crap */
T=t*samp/30*BPM,
n=T%2,T-=n<5/4?n/5:0,

/* note function */
note=x=>isNaN(x)?0:(t/1.42)*2**(x/12),

/* saw function */
saw=x=>atan(tan(note(x)/1024*PI))/13,

/* supersaw function */
supsaw=x=>(note2=i=>isNaN(i)?0:((t+128)/1.42)*2**(i/12),note(x)*2%254.4+note2(x)*2%255.6+note(x)*2%257+note(x)*2%256.3)/512-1,

/* chords */
cho=(supsaw(0)+supsaw(3)+supsaw(7)+supsaw(ch[1&T>>4])*1.2)/6,
f=((1-T/16%1)**.6)*.13,z=.4+.7/(1-f),
cho=(c1+=f*(cho-c1+z*(c1-c2)),c2+=f*(c1-c2)),
sch=([1,(T%1)][['1000100010010000','1000100010010100']['0001'[3&T/16]][15&T]])**4, // sidechain
r[t%m]=.97*(R(t)*.4+R(t+2192)*.3+R(t+2828)*.2+cho*.3),
cLeft=(cho+R(t+1)*1.25)*sch,cRight=(cho+R(t+50)*1.25)*sch,
chords=[cLeft,cRight],

/* drum things */
n=K,K=['1000000010010000','1000000010010100']['0001'[3&T/16]][15&T],K-n>0?Ki=0:Ki+=samp, // ????
n=S,S='0010'[3&T/2],S-n>0?Sn=s=0:Sn+=samp,
n=H,H='1010'[3&T*2],H-n>0?Hi=h=0:Hi+=samp,

c=3e3/(1+1100*Ki),k=(k+c/sa)%1,
kick=sin(2*k*PI)*e(Ki,5,1)*.6, // kick

c=2e3*e(Sn,50,6)+200*e(Sn,25,2)+150,s=(s+c/sa)%1,
f=.5,z=.1+.1/(1-f),n=2*random()-1,
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
snare=(((s1-s2+(n-s2)*.6)*(e(Sn,80,2)/4+e(Sn,7,2)*min(Sn*9,1)**1.5)*1.7)+(sin(2*s*PI)*e(Sn,10,2)))*.9, // snare

n=(random()-.5),
f=6880*PI*samp,z=.7+.7/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.15)*e(Hi,18,3)*.5, // hihat

/* drums */
drums=clip(kick+hihat+snare)*1.1,

/* bass */
ba=[8,[5,5,10,3][3&T/4]][1&T/16],

b=saw(ba),
f=((1-T/4%1)**4)*.05,z=.4+.4/(1-f),
bass=(b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2)),

/* main */
main=pan=>chords[pan]+drums+bass,
[main(0),main(1)]