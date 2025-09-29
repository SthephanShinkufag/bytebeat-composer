/*
 * idk what genre this is
 * by troubleshoot
 * (remix of "synthwave type chord")
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=90,K=H=S=k=h=s=b1=b2=c1=c2=c3=c4=h1=h2=h3=s1=s2=0,Ki=Hi=Sn=1,r=Array(me=16384).fill(0),R=i=>r[(i+me|0)%me],clip=x=>atan(1.2*x)/1.2,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c),

/* T crap */
T=t*samp/30*BPM, // time
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12), 
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* saw function */
saw=x=>atan(tan(note(x)/256*PI))/6,

/* sidechain */
sch=([T*4%1,1]['01111111'[7&T*4]])**1.5,

/* chords */
chArr=[[6,6,-1,3],[10,10,3,6],[13,13,6,8],[17,17,10,12]],
// chord array

ch=saw(chArr[0][3&T/4])+saw(chArr[1][3&T/4])+saw(chArr[2][3&T/4])+saw(chArr[3][3&T/4]),
f=.4,z=.4+.4/(1-f),
c1+=f*(ch-c1+z*(c1-c2)),c2+=f*(c1-c2),
ch=clip((c2+(random()-.5)*.04)/([T*2%1,.7]['01101101'[7&T*2]]**.7)*([1-T*4%1,1]['10010010'[7&T*2]]))*.9,
ch=isNaN(ch)?0:ch,
r[t%me]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.7*(ch+c2*.2)),
chords=[(ch/2+R(t)+R(t+1))*.5,(ch/2+R(t)+R(t+50))*.5],

/* bass */
b=saw(chArr[2][3&T/4]-24)+saw(chArr[3][3&T/4]-24)*.8,
f=((1-T*2%1)**.5)*.05,z=.4+.7/(1-f),
bass=(b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2)),

/* drum things */
n=K,K='1000'[3&T],K-n>0?Ki=0:Ki+=samp,
n=H,H='1010'[3&T*2],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
kick=pan=>clip((pan?cos(256*sqrt(Ki%1)):sin(256*sqrt(Ki%1)))*1.5*e(Ki,5,2)+
(random()-.5)*.1*e(Ki,6,2)),
// kick noise because why not
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.1+.1/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*.8*sch*e(Hi,20,2),

/* snare */
c=1900*e(Sn,50,6)+180*e(Sn,25,2)+150,s=(s+c/sa)%1,
f=.4,z=.1+.1/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
snare=pan=>(((s1-s2+(n-s2)*.6)*(e(Sn,80,4)/4+e(Sn,7,2)*min(Sn*9,1)**1.5)*2)+clip((pan?cos(2*s*PI)*e(Sn,8,2):sin(2*s*PI)*e(Sn,8,2))*2)),
snare=[snare(0),snare(1)],

/* drums */
drums=[kick[0]+snare[0]+hihat,kick[1]+snare[1]+hihat],

/* output */
out=pan=>clip(chords[pan]*sch+bass+drums[pan]),
[out(0),out(1)]