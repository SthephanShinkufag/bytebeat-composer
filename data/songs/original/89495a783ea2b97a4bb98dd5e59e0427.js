// Stukade Makaroner (V1.4)
// By: Maktone
// 34200 HZ
// Description: compressed it a bit, the kick gets more audible the longer you listen. Enjoy!

reg=1.135,
fulval=(t/t)-2,
mosval=(t/t)+128,
val=(t/t)+64,
parval=(t/t)+32,
semiparval=(t/t)+15,
noval=(t/t),
hh=(t*random()|t>>9)%8,
bhh=[hh,0,0,0,hh,0,hh,0,hh,0,0,0,hh,0,0,0][t>>10&15],
kick=t/50/(1023&t>>2)%100,
kickkit=[0,0,0,0,0,0,0,0,kick,0,0,0,0,0,0,0][t>>11&15],
C=3.54*reg,
Csh=3.75*reg,
D=3.95*reg,
Dsh=4.2*reg,
E=4.4*reg,
F=4.7*reg,
Fsh=5*reg,
G=5.3*reg,
Gsh=5.6*reg,
A=5.9*reg,
Ash=6.3*reg,
B=6.7*reg,
bass=[C,,C,,,G/2,,C/2,C,C*2,C,,,Dsh/2,,Dsh,G/2,,G/2,,,D,,Ash/2,G/2,G,G/2,,,,Ash/2,Ash,C,,C,,,G/2,,C/2,C,C*2,C,,,Dsh/2,,Dsh,Ash/2,,Ash/2,Ash/2,,F,,D,Ash/2,Ash,Ash/2,,,,D,D*2][t>>12&63],
Intro=[G,G,0,Dsh,G,G,0,D,G,G,0,Dsh,F,F,0,Ash/2,G,G,0,Dsh,G,G,0,D,G,G,0,Dsh,D,D,0,Ash/2][t>>14&31],
Chorusvar1=[C*2,,,,Ash,,G,G,G,G,G,,Dsh,Dsh,Dsh,Dsh,F,,G,G,,,F,,G,G,,,Dsh,Dsh,Dsh,Dsh,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,,,,,,,,,Ash/2,,C,,D,,F,][t>>11&63],
Chorusvar2=[C*2,,,,Ash,,G,G,G,G,G,,Dsh,Dsh,Dsh,Dsh,F,,G,G,,,F,,G,G,,,Dsh,Dsh,Dsh,Dsh,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,F,,,,,,,,,Ash/2,,C,,D,,F,][t>>11&63],
b4=[,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,Ash/2,,C,,D,,F,][t>>11&63],
chp1=[C*4,G*2,Dsh*2,C*2][t>>9&3],
chp1complex=[chp1,chp1,chp1,chp1/2,chp1,chp1,chp1,chp1][t>>13&7],
chp2=[G*2,D*2,Ash,G][t>>9&3],
chp3=[Ash*2,F*2,D*2,Ash][t>>9&3],
quwaveb4=[parval,noval,noval,noval,parval,noval,noval,noval]
[t/128*[,,,b4][t>>17&3]&7],
quwave=[parval,noval,semiparval,noval,parval,noval,semiparval,noval]
[t/128*[Chorusvar1,Chorusvar1,Chorusvar1,Chorusvar2][t>>17&3]&7],
quwavein=[parval,noval,noval,noval,parval,noval,noval,noval]
[t/128*[Intro,Intro,Intro,Intro][t>>17&3]&7],
downst=[val,parval,noval,noval,val,parval,noval,noval]
[t/512*[bass,bass,bass,bass][t>>17&3]&7],
sqwav=[semiparval,noval,semiparval,noval,semiparval,noval,semiparval,noval]
[t/256*[chp1complex,chp2,chp1complex,chp3][t>>16&3]&7],

// FULL THING (so far)
[downst+hh+kickkit,downst+quwavein+bhh+kickkit,downst+sqwav+quwavein+bhh+kickkit,sqwav+downst+quwave+bhh+kickkit,sqwav+downst+quwave+bhh+kickkit][t>>19]