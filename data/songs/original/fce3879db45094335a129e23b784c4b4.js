/* 
 * WDYT (What Do You Think) 
 * by troubleshoot
 * (headphone-friendly!)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,ch=[[-3,0,-5,-7],[2,5,-1,-3],[5,9,2,0]],K=S=H=k=s=s1=s2=h=h1=h2=h3=a1=a2=b1=b2=c1=c2=c3=c4=0,Ki=Sn=Hi=1,BPM=237,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,clip=x=>atan(1.4*x)/1.4,r=Array(m=2e4).fill(0),R=i=>r[i%m],eh=Array(me=2e4).fill(0),Eh=i=>eh[i%me]),

/* T crap */
T=t*samp/30*BPM, // speed
T2=t*samp,
p=t/1.42, // pitch

/* note function */
note=n=>p*2**(n/12),

/* bass */
bas=[[2,2,2,[0,-3][1&T/4]],[5,5,5,[5,4][1&T/4]],[0,0,0,[-1,-3][1&T/4]],[-5,-5,-5,[-3,0][1&T/4]]],
// bass arrays

b=atan(tan(note(bas[3&T/32][3&T/8])/512*PI))/6,
f=((1-T%1)**2)*.2,z=.7+.7/(1-f),
bass=((b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2))*(T/4%1)**1.5)+(sin(sin(note(bas[3&T/32][3&T/8])/256*PI))/9), // low sine wave for extra bass

/* drum things */
n=K,K='1000'[3&T/2],K-n>0?Ki=0:Ki+=samp,
n=S,S='0010'[3&T/2],S-n>0?Sn=s=0:Sn+=samp,
n=H,H='1010'[3&T*2],H-n>0?Hi=h=0:Hi+=samp,

c=3e3/(1+1100*Ki),k=(k+c/sa)%1,
kick=sin(2*k*PI)*e(Ki,5,1)*.75, // kick

c=2e3*e(Sn,50,6)+200*e(Sn,25,2)+130,s=(s+c/sa)%1,
f=.5,z=.1+.1/(1-f),n=2*random()-1,
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
snare=(((s1-s2+(n-s2)*.6)*(e(Sn,80,2)/4+e(Sn,7,2)*min(Sn*9,1)**1.5)*1.7)+(sin(2*s*PI)*e(Sn,10,2)))*.9, // snare

n=(random()-.5),
f=6880*PI*samp,z=.7+.7/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.15)*e(Hi,18,3)*.5, // hihat

/* drums */
drums=clip(kick+snare+hihat)*1.1,

/* chords */
chn=(x,o)=>((note2=x=>(p+128)*2**(x/12),note(x)*o%254.4+note2(x)*o%255.6+note(x)*o%257+note(x)*o%256.3)/512-1)+sin(cos(note(x)/128*PI))/5,
c=(chn(ch[0][3&T/32],2)+chn(ch[1][3&T/32],2)+chn(ch[2][3&T/32],2))/8,
cHigh=(chn(ch[0][3&T/32],8)+chn(ch[1][3&T/32],8)+chn(ch[2][3&T/32],8))/18,
f=.4,z=.7+.5/(1-f),
c1+=f*(c-c1+z*(c1-c2)),c2+=f*(c1-c2),
f=.3,z=.7+.5/(1-f),
c3+=f*(cHigh-c3+z*(c3-c4)),c4+=f*(c3-c4),
c=clip(c2*2+(c-c1)*1.2)+((cHigh-c3+(c3-c4)*.6)*.8)*(T>128),
r[t%m]=.97*(R(t)*.4+R(t+2192)*.3+R(t+2828)*.2+c*.3),
sch=(T/4%1)**1.8, // sidechain
cLeft=(c+R(t+1)*1.25)*sch,cRight=(c+R(t+50)*1.25)*sch,
chords=[cLeft,cRight],

/* arp */
ar=[[2,16,17,12],[2,17,21,17],[0,16,17,14],[0,12,16,12]], // arp arrays

a=atan(tan(note(ar[3&T/32][3&T])/256*PI))/11,
f=((1-T%1)**2)*.3,z=.75+.9/(1-f),
a=(a1+=f*(a-a1+z*(a1-a2)),a2+=f*(a1-a2))*(T>256),
eh[t%me]=.97*(Eh(t)*.4+Eh(t+2192)*.3+Eh(t+2828)*.2+a*.3),
aLeft=(a+Eh(t+1)*1.25),aRight=(a+Eh(t+50)*1.25),
arp=[aLeft,aRight],

/* output */
out=p=>bass+chords[p]+drums+arp[p],
[out(0),out(1)]