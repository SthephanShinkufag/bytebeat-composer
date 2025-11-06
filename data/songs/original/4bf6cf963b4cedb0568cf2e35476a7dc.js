return t=>(
GlobalDetune=gd=0,//detune in ¢
ü=142,
Clam=a=>min(max(a,0),1),
Clamp=A=>min(max(A,-1),1),
c="charCodeAt",
Я=(A,os=0)=>(t+os*(60/A))/(60/A)%1,
Dec=(F,C=1,os=0)=>(1-Я(F,os))**C,
Cyc=(P,A,os=0)=>((t+os)/(60/P))%A|0,
Tu=a=>440*(2**(((a+gd/100)-9)/12)),//get Hz from note order
RandomPool=R=new Array(16).fill(0).map(a=>2*random()-1),
F=a=>sin(2*PI*t*a),//freq to sine
Sw=a=>F(Tu(a)),//Sine
 St=a=>t%(1/(b=Tu(a)))*b*2-1,
 Sq=(a,Du=1/2)=>(((St(a)+1)/2)<Du)*2-1,
 MagNum=((2951594784).toString(2)),
Th=a=>{throw a},
 IP=(N,Min,Max)=>N*(Max-Min)+Min,
 LFO=(F,Min,Max,W)=>
[IP((sin(2*PI*F*t)+1)/2,Min,Max),IP(t%(1/F)*F,Min,Max),IP(((asin(sin(2*PI*t*F))/PI*2)+1)/2,Min,Max),IP((sign(sin(2*PI*F*t))+1)/2,Min,Max)][W],
XOR=(T,A=1,B=2)=>((t*A*Tu(T)*256)^(t*B*Tu(T)*256))%256/256*2-1,
Bass=a=>parseInt((MagNum[(t*16*Tu(a))&31]))*2-1,
Tr=a=>asin(Sw(a))/PI*2,
p=(a,b)=>a!=b?a:-1/0,
FM=(B,M,C)=>F(Tu(B)+M*F(Tu(B+12*C))/t),
 Proc=(Str,Ind)=>p(Str[c](Ind)-64,-32),
 PT=(A,B)=>A.map(B).reduce((a,b)=>a+b)/A.length,
 Counter=SC={Beat:(t/(60/ü)),BiB:3&(t/(60/ü))},
 SC.M=SC.Beat>>2,
 SC.sQ=((t/(60/ü))*4)|0,
SC.sQC=SC.sQ&3,
 Fifth=a=>[0,7,12].map(a),
O=(a,b)=>b>1?sin(Tu(a)*2*PI*t+O(a,b-1)):sin(Tu(a)+sin(Tu(a))),
kick=(a,H=1)=>(u=t%(60/a),Clamp(.9997**(48000*u)*sin((u*48000)**.5)*H)),
r=(x,y=12288,z=0.5)=>(t?0:a=Array(y).fill(0),b=x%256+a.shift(),a.push(b*z),b),
DP= "K K S  S SKKS SSK K S  S SKKS SSK K S  S SK   S  SKKS  S SK   S",
DP2="R R R R R R R R R R R R R R R R R R R R R R R R R R R R R R R R ",
//DP2="H H H H H H H H H H H H H H H H H H H H H H H H H H H H H H H H ",
DM=a=>(
a=="H"?R[2]*Dec(ü*4,3):
a=="K"?kick(ü*4,2):
a=="S"?snare(ü*4):
a=="R"?Ride(ü*4):0),
Debug=(a,b)=>(t*38775.4648)%1024?a:Th(b),
/*
Get "Raddy"!
C D EF G A B
()*+,-./0123    __
456789:;<=>?     _
@ABCDEFGHIJK    
LMNOPQRSTUVW    ^
XYZ[\]^_`abc    ^^
*/
ParseNote=a=>ParseInt(a&255,16)-128,


Ride=a=>Sw(43)*Dec(a,2)/2,
snare=a=>Clamp(kick(a,8)/2+R[1]*Dec(a,4)/2),
SRise=SC.Beat>=32?(SC.Beat<36?snare(ü/4):0):Clam(SC.Beat/8-3)*snare(ü*4),
Mel1="4;@;G;@;4;@;G4;@8?D?K?D?8?D?K8?D1=D=L=D=1=D=L1=D-9@9E9@9-9@9E-9@",
Bass1=" 4 4 4 4 8 8 8 8 1 1 1 1 - - - -",
 [C1,C2,C3]=["44 44 44  44 44 88 88 88  88 88 11 11 11  11 11 -- -- --  -- -- ",";; ;; ;;  ;; ;; 33 33 33  33 33 88 88 88  88 88 44 44 44  44 44 ","@@ @@ @@  @@ @@ DD DD DD  DD DD == == ==  == == EE EE EE  EE EE "],
 Arp="=@DIKID@=@DIKID@=@DIKID@=@DIKID@8?DFGFD?8?DFGFD?8?DFGFD?8?DFGFD?;BGIKIGB;BGIKIGB;BGIKIGB;BGIKIGB6=BDEDB=6=BDEDB=6=BDEDB=6=BDEDB=",
 Bassline=(XOR(Proc(C1,Cyc(ü*4,64)))/3+XOR(Proc(C2,Cyc(ü*4,64)))/3+XOR(Proc(C3,Cyc(ü*4,64)))/3),
r(SRise+Dec(ü*4,1)*FM(Proc(Mel1,Cyc(ü*4,64)),LFO(0.3,0,0.8,2),1)/2,12288,0.4)+
(DM(DP[Cyc(ü*4,64)])/2+DM(DP2[Cyc(ü*4,64)])/2)/2
)