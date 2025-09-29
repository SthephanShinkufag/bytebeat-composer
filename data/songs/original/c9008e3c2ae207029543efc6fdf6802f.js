/*
 * plss give pcm saple (unfinished)
 * by troubleshoot
 * (recreation of Dance 'Til You're 
 * Dead)
 * (i actually need the pcm sample)
 * (also if someone can help me with
 * the chord envelopes it would help
 * so much ok thx baii)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=154,K=H=S=k=h=s=c1=c2=h1=h2=h3=s1=s2=s3=0,Ki=Hi=Sn=1,r=Array(m=16384).fill(0),R=i=>r[i%m],e=(a,b,c)=>(1-(a*b<1?a*b:1))**c,e2=(a,b)=>1>a/b?(n=1-a/b)*n:0),

/* T crap */
T=t*samp/30*BPM, // speed
transpose=0, // transpose (not related to T but whatever)
p=(t/1.43)*2**(transpose/12),
// pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* sidechain */
sch=T>64?([T*2%1,1]['0111011101101101'[15&T*2]])**2:1,

/* saw function */
saw=(x,o)=>atan(tan(note(x)/o*PI))/16,

/* supersaw function */
supsaw=x=>saw(x,128)*.4+saw(x,127)+(saw(x,256)+saw(x,512))*1.5,

/* chords */
chArr=T=>[[[4,1][1&T/32],[3,6][1&T/32],8,8],[[8,4][1&T/32],[7,10][1&T/32],11,11],[[11,8][1&T/32],[10,1][1&T/32],15,[15,13,13,13][3&T]]], // chord array

ch=T=>(supsaw(chArr(T)[0][3&T/4])+supsaw(chArr(T)[1][3&T/4])+supsaw(chArr(T)[2][3&T/4]))*.9*('11001100110110110011011011011011'[2*T&31]),
ch=ch(T)+(ch(T-1)*.3*(T>1)),
f=.5,z=.4+.7/(1-f),
c1+=f*(ch-c1+z*(c1-c2)),c2+=f*(c1-c2),
r[t%m]=.97*(.4*R(t)+.3*R(t+2192)+.2*R(t+2828)+.7*c2),
rand=()=>(random()-.5)*.04,
chords=[(c1+R(t)+R(t+1))+rand(),(c1+R(t)+R(t+50))+rand()],

/* drum things */
n=K,K='1000100010010010'[15&T*2],K-n>0?Ki=0:Ki+=samp,
n=H,H='0101'[3&T],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='1000100010010010'[15&T*2],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
c=1e3*e(Ki,50,6)+90*e(Ki,25,2)+80,k=(k+c/sa)%1,
// snare structure bcuz yes

kick=pan=>atan((asin((pan?cos:sin)(2*k*PI))*3*e(Ki,6,2)+(random()-.5)*.2*e(Ki,7,2))*2)*(T>64),
kick=[kick(0),kick(1)],

/* hihat */
n=2*random()-1,
f=6880*PI*samp,z=.7+.7/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*e(Hi,15,3)*(T>32&&T<56),

/* snare (clap) */
f=.5-.25*(1-1/(1+35*Sn)),z=.5+.5/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),s3+=f*(s2-s3),
clap=(s1-s2)*1.5*(Sn<.008?2*e2(Sn,.008):Sn<2*.008?.9*e2(Sn-.008,.008):Sn<3*.008?e2(Sn-2*.008,.008):e2(Sn-3*.008,.11))*(T>32&&T<56),

/* fader */
fader=(h1-h2)*2*(T>60&&T<64?(T/4%1):(T>64&&T<72?((1-T/8%1)*.5*sch):0)),

/* output */
out=pan=>atan(chords[pan]*sch+hihat+kick[pan]+clap+fader)*.9,
[out(0),out(1)]