/*
 * non-existence
 * by troubleshoot
 * (remix of Nothing Is Real)
 */

/* random vars */
t||(sa=48e3,samp=1/sa,BPM=120,K=H=S=k=h=s=b1=b2=b3=b4=c1=c2=h1=h2=h3=m1=m2=r1=r2=r3=r4=r5=r6=s1=s2=0,Ki=Hi=Sn=1,dbuf=[],e=(a,b,c)=>(1-(a*b<1?a*b:1))**c),

/* delay (credits to Two2Fall) (modified) */
dcc=0,
del=(i,fb,mem)=>(call=dcc++,dbuf[call]??=Array(mem).fill(0),ri=(t+mem|0)%mem,buff=dbuf[call],i+=buff[ri],buff[ri]=i*fb,i*(1-fb)+buff[ri]),

/* T crap */
T=t*samp/30*BPM, // speed
transpose=0, // transpose (not related to to but whatever)
p=((t/sa*48e3)/1.43)*2**(transpose/12), // pitch

/* note function */
note=x=>isNaN(x)?0:p*2**(x/12),

/* sidechain */
sch=([T%1,1][1&T])**2,

/* saw function */
saw=(x,o)=>atan(tan(note(x)/o*PI))/3,

/* bitcrushed saw function */
bsaw=(x,b,o)=>trunc(saw(x,o)/(b+1)*128)*(b+1)/128,

/* sine function */
sine=(x,o)=>sin(note(x)/o*(2*PI))/4,

/* mel */
melArr=[G=(1&T/16?8:7),12,G,15,G,12,G,17,G,12,G,19,G,12,G,22], // mel array

me=T=>bsaw(melArr[15&T],16,256)*((1-T%1)**.5),
me=me(T)+(me(T-1.5)*.6*(T>1.5))+(me(T-3)*.5*(T>3))+(me(T-6)*.4*(T>6)),
f=.7,z=.4+.5/(1-f),
m1+=f*(me-m1+z*(m1-m2)),m2+=f*(m1-m2),
mel=pan=>(me=tanh((m2*.5)/128*PI)*72,wet=del(del(me,.75,pan/2),.75,pan*2),tanh((me*.7+wet*.5)/128*PI)*32),
mel=[mel(12288),mel(12288*(9/8))].map(x=>(x=tanh((x*.5)/128*PI)*32,r1+=.1*(x-r1),r2+=.5*(x-r2),x=x+((r2)+(x-r1))/1.75,min(max(x*1.25,-127),128))),

/* chords */
ch=(o,s)=>(s?sine:saw)([7,8][1&T/16],o)*3+((s?sine:saw)(0,o/2)+(s?sine:saw)([3,3,5,7][3&T/4],o/2.01))*4,
ch=((ch(1024.4,1)+ch(1023,1))*2+ch(512.3,0)+ch(510.9,0)+ch(516.1,0)+ch(507.3,0)+ch(256.3,0)+ch(254,0)+ch(255.6))*.025,
f=.6,z=.4+.4/(1-f),
c1+=f*(ch-c1+z*(c1-c2)),c2+=f*(c1-c2),
cho=pan=>(ch=tanh((c2*.5)/128*PI)*128,wet=del(del(ch,.75,pan/2),.75,pan*2),tanh((ch*.5+wet*.5)/128*PI)*32),
chords=[cho(12288*(7/8)),cho(12288)].map(x=>(x=tanh((x*.5)/128*PI)*32,r3+=.1*(x-r3),r4+=.5*(x-r4),x=((x+r4)-r3),min(max(x*1.25,-127),128))),

/* bass */
bArr=[12,8], // bass arr
b=(saw(bArr[1&T/16],2048)+saw(bArr[1&T/16],1023.4))/4,
f=((1-T*256%1)**2)*.2,z=.4+.7/(1-f),
b1+=f*(b-b1+z*(b1-b2)),b2+=f*(b1-b2),
bass=pan=>(ba=tanh((b2*.5)/128*PI)*128,wet=del(del(ba,.5,pan/2),.5,pan*2),tanh((ba*.5+wet*.5)/128*PI)*32),
bass=[bass(12288*(7/8)),bass(12288*(9/8))].map(x=>(x=tanh((x*.5)/128*PI)*64,r5+=.1*(x-r5),r6+=.5*(x-r6),x=x+(((x+r6*.11)-r5)*2),min(max(x*1.25,-127),128))),

/* drum things */
n=K,K='1010'[3&T],K-n>0?Ki=0:Ki+=samp,
n=H,H='1010'[3&T*2],H-n>0?Hi=h=0:Hi+=samp,
n=S,S='0010'[3&T],S-n>0?Sn=s=0:Sn+=samp,

/* kick */
c=1e3*e(Ki,60,6)+70*e(Ki,25,2)+50,
k=(k+c/sa)%1,
// snare structure bcuz yes

kick=pan=>(tan((pan?cos:sin)(2*k*PI))*1.7*e(Ki,5,2)+(random()-.5)*.15*e(Ki,6,2)),
kick=[kick(0),kick(1)],

/* hihat */
Q=n=>(n*(t*samp)*2&1)-.5,
n=((Q(800)+Q(540)+Q(523)+Q(370)+Q(304)+Q(205))+(2*random()-1)/3)*e(Hi,6,2),
f=6880*PI*samp,z=.1+.4/(1-f),
h1+=f*(n-h1+z*(h1-h2)),h2+=f*(h1-h2),
f=21e3*PI*samp,h3+=f*(n-h3),
hihat=(n-h3+(h1-h2)*.2)*1.5*sch*(e(Hi,8,2)),

/* snare */
n=2*random()-1,
c=2.5e3*e(Sn,50,6)+100*e(Sn,25,2)+150,
s=(s+c/sa)%1,
f=.2,z=.2+.2/(1-f),
s1+=f*(n-s1+z*(s1-s2)),s2+=f*(s1-s2),
sn=pan=>((s1-s2+(n-s2)*.2)*(e(Sn,30,4)/2+e(Sn,3,2.25)*min(Sn*15,1)**1.5)+(pan?cos:sin)(2*s*PI)*e(Sn,5,2))*2,
snare=[sn(0),sn(1)],

/* drums */
drums=pan=>kick[pan]+hihat+snare[pan],
drums=[drums(0),drums(1)],

/* output */
out=pan=>atan((mel[pan]+chords[pan]+bass[pan])*sch+drums[pan]),
[out(0),out(1)]