t||(
// Buffer
Br=[],

// Comb-filter
Cb=(

t, // Time variable
x, // Input
l, // Delay
fb, // Feedback
m, // Volume
d, // Second feedback?
dk, // "Enable" the detune
df // Function of detune

)=>(Cno=Cn++,Br[Cno+(t+128*dk-round(df))%l]??=0,y=x*m+Br[Cno+(t+128*dk-round(df))%l]*d,t%1?0:Br[Cno+t%l]=y*fb,Cn+=l,y),


// All-pass filter
Ap=(

t, // Time variable
x, // Input
l, // Delay
fb // Feedback

)=>(Cno=Cn++,Br[Cno+t%l]??=0,y=Br[Cno+t%l]-fb*x,t%1?0:Br[Cno+t%l]=x+y*fb,Cn+=l,y),


// REVERB ENGINE
R=(

t, // Time variable
inp, // Input
m, // Volume
g, // Gain
aC, // Amount of comb-filters
vC, // Delay of comb-filters
sC, // Subtraction value (comb-filter)
aAP, // Amount of all-pass filters
vAP, // Delay of all-pass filters
sAP, // Subtraction value (all-pass filter)
enD, // Enable detune
aD, // Volume of detune
vD, // Detune speed
sD, // Subtraction value (all-pass filter)
wet, // Wet signal
dry // Dry signal

)=>{for(CB=CBSum=0;CB<aC;++CB){i2=CBSum+=Cb(t,inp,vC-sC*CB,g,m,-1,enD,sin(t*PI/(vD-sD*CB))*aD)/aC;}for(AP=APSum=0;AP<aAP;++AP){APSum+=Ap(t,i2,vAP-sAP*AP,g)/aAP;}return-APSum*wet+inp*dry}

),

Cn=0,

// For input (I'm using here the sequence from "Long Release Reverb" by PrincessPriscillaPT)
BPM=120,sR=48e3,r=abs(t/sR/180*3*32768*BPM),p=(1/sR*256)*480,q=(30*sR)/(BPM*2/3),m=x=>(t/sR*256)*432*2**((x-64)/12)*(x>-1?x<128?1:0:0),sinc=x=>((x*64/PI*128+4096)+4096&8191)*(-(x*64/PI*128+4096)+4096&8191)*((((x*64/PI*128+4096)+4096&8192)>>12)-1)/16777215,cosc=x=>sinc(x-256),mel=m([69,71,72,71,69,71,72,71,65,71,72,71,65,71,72,71,67,71,72,71,67,71,72,71,64,71,72,71,64,71,72,76][r>>14]),

i=x=>tanh(sinc((x?cosc:sinc)(mel*PI/128)+cosc(mel*PI/128*6)*(1-r/16384%1)))*4*min(1,abs(sin(r*PI/16384))*64)*(1-r/16384%1)**2/2/PI,

// Output
[i(0),i(1)].map(x=>R(t,x,.5,.95,7,8600,750,3,1500,200,1,50,54000,2000,3,0))