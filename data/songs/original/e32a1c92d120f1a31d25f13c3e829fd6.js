/*
 * them bytes be dancin
 * by troubleshoot
 * (remix of 1k dance)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=150,K=H=S=k=h=s=b1=b2=h1=h2=h3=m1=m2=s1=s2=sl1=sl2=0,Ki=Hi=Sn=1,e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,clip=x=>atan(1.4*x)/1.4,r=Array(m=15e3).fill(0),r2=Array(m).fill(0),R=i=>r[i%m],R2=i=>r2[(i+m|0)%m],r3=Array(m).fill(0),R3=i=>r3[(i+m|0)%m]), // thas a lot of arrays

/* T crap */
T=t*samp/30*BPM, // time
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* sidechain */
sch=[T*2%1,1,1,1][3&T*2],

/* saw function */
saw=(x,o)=>atan(tan(note(x)/o*PI))/4,

/* chord sine function */
chSin=x=>(sin(note(x)/128*PI)+sin(note(x)/64*PI)+sin(note(x)/32*PI)*.5+sin(note(x)/16*PI)*.2)*.125,

/* bass */
b=saw([5,8,10,12][3&T/4],[1024,512][1&T])/1.25,
f=(1-T%1)*.11,z=.4+.6/(1-f),
bass=(b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2))*sch*(T>64?1:0),
bass=[bass,bass*1.3],

/* chords */
c=(chSin([12,12,10,12][3&T/4])+chSin([8,8,5,7][3&T/4])+chSin([5,3,2,4][3&T/4]))*(T>64+32?1:0),
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.3*c),
chords=[(c+R(t)+R(t+1))*(T/2%1)**2,(c+R(t)+R(t+50))*(T/2%1)**2],

/* vibrato (credits to hrllobrothers4)*/
vib=400*sin(2*PI*t/(4095*2))/t,

/* melody */
me=(saw(melArr=[,,8,10,8,,5,7,,8,,7,,3,,5,5+vib,5+vib,-7,-5,0,,-5,-2,,-4,,[-5,-2][1&T/32],,[-4,0][1&T/32],[-4,0][1&T/32]+vib,[-4,0][1&T/32]+vib,][31&T],64)+saw(melArr,64.2))*.4*(T>128?1:0),
f=.6,z=.4+.7/(1-f),
m1+=f*(me-m1+z*(m1-m2)),m2+=f*(m1-m2),
r2[t%m]=.97*(.4*R2(t)+.3*R2(t+2192)+.2*R2(t+2828)+.4*m2), // echo (or reverb idk)
mel=[m2+R2(t)+R2(t+1),m2+R2(t)+R2(t+50)],

/* bells */
beArr=[20,20,20,19,15,15,15,8,10,10,10,12,5,5,5,],
// bell array
bell=sin((note(beArr[15&T/4])+sin(note(beArr[15&T/4])/16*PI)*20*(1-T/[16,16,16,4][3&T/4]%1)**[8,8,8,2][3&T/4])/64*PI)/6*(1-T/[16,16,16,4][3&T/4]%1)**[.5,.5,.5,.2][3&T/4]*(T>128+64?1:0),
r3[t%m]=.97*(.4*R3(t)+.3*R3(t+2192)+.2*R3(t+2828)+.4*bell),
bells=[bell+R3(t)+R3(t+1),bell+R3(t)+R3(t+50)],

/* drum things */
n=K,K='1010'[3&T/(T>16?2:1)],K-n>0?Ki=0:Ki+=samp,
n=H,H='0101'[3&T],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
kick=pan=>clip((pan?cos(256*sqrt(Ki%1)):sin(256*sqrt(Ki%1)))*1.5*e(Ki,6,2)+
(random()-.5)*.1*e(Ki,6,2)),
// kick noise because why not
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.7+.7/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*.6*e(Hi,20,2)*(T>32?1:0),

/* snare */
c=2e3*e(Sn,50,6)+200*e(Sn,25,2)+160,s=(s+c/sa)%1,
f=.2,z=.1+.1/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
snare=(((s1-s2+(n-s2)*.5)*(e(Sn,80,2)/4+e(Sn,7,2)*min(Sn*9,1)**1.5)*2)+(sin(2*s*PI)*e(Sn,10,2)*1.5))*(T>16?1:0),

/* drums */
drums=[kick[0]+clip(snare+hihat)*1.25,kick[1]+clip(snare+hihat)],

/* output */
out=pan=>atan(drums[pan]*1.5+(bass[pan]+chords[pan]+mel[pan]+bells[pan])*sch),
[out(0),out(1)]