t2=t, // Needed so the other "t" doesn't default to the melody

BPM=184,
sR=sampleRate=48e3,
sPB=samplesPerBeat=32768,
u=t*abs(BPM/((120*sR)/sPB)),

ts=u,

tt=(t/sR*256)*440*2**(-10/12),

lfo=(x=9,y=0)=>abs(sin(ts*PI/pow(2,x)))+y,

r=repeat=(x,y)=>Array(x).fill(y).flat(9), // Repeat Instances in Array (credit to Greaserpirate)

f=(len=7,exp=1,rmp=0)=> // "f" function: A special kind of wave that its formant can be adjusted
rmp?abs(pow(atan(tan(u/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp)): // Condition added to prevent NaN values from appearing in negative numbers
-abs(pow(atan(tan(u/2%(pow(2,len)/2)*(PI/pow(2,len))))/(PI/2),exp))+1
,

seq=(
x, // Array
y=13, // Length
z=0 // Enable Custom Sequencing (great for making new melodies)
)=>z?x[y]:x[(u>>y)%x.length], // Non-Melodic Sequence

mseq=(
x, // Array
y=13, // Length
mode="parse", // Mode: (Array = Number Array, Parse = parseInt() function)
z=0 // Enable Custom Sequencing (great for making new melodies)
)=>{

var T = tt

if(mode=="parse"){
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0
} else if(mode=="array"){
T=tt*2**((seq(x,y)/12))||0
} else {
T=tt*2**((parseInt(seq(x,y,z?1:0),36))/12)||0
};

return T

},

env=(
al=14, // Attack Length
ae=.2, // Attack Formant
dl=14, // Delay Length
de=lfo(18,.3), // Delay Formant
st=0, // Sustain Length
sv=1 // Sustain Volume
)=>seq(

dl>-1?(al>-1?
[f(al,ae,1)].concat(r(st,sv),f(dl,de)):
r(st,1).concat(f(dl,de))):(al>-1?
[f(al,ae,1)].concat(r(st,sv)):
r(st,1))

,13),

wf=(
T=t, // "t" Substitute
mode, 
/* Wave Modes:
sin = Sinewave
tri = Triangle Wave
sth = Sawtooth Wave
sqr = Square Wave
bt = Convert Floatbeat to Bytebeat
*/
amp=1, // Amplitude
exp=1 // Exponent Multiply, will work differently on Square and Bytebeat Mode
)=>{

var p=T // These functions will make sure that the mode you chosen had chose this wave
if(mode=="sin"){ // Sine Mode
	p=(ph=0)=>sin(T*(PI/128)+ph)
} 
else if(mode=="tri"){ // Triangle Mode
	p=(ph=0)=>asin(sin(T*(PI/128)+ph))/(PI/2)
} 
else if(mode=="sth"){ // Sawtooth Mode
	p=(ph=0)=>atan(tan(T/2*(PI/128)+(PI/2)+ph))/(PI/2)
} 
else if (mode=="sqr"){ // Square Mode
	p=(ph=0)=>((sin(T)<t&t+ph>>6)-0.5)*2
} 
else if (mode=="bt"){ // Convert Floatbeat to Bytebeat
	p=(ph=0)=>((T)&255)/127-1
}
else { // Will default to Sine if no waveform is chosen
	p=(ph=0)=>sin(T*(PI/128)+ph)
}
var wint = p
if(mode!=="sth"){
wint=pow((p()*amp),exp)||-pow((p(PI)*amp),exp) // "||" Gate to prevent NaN outputs from negative inputs
}
else{
wint=pow((p()*amp),exp)||pow((p(PI/2)*amp),1/exp)-1||0
};
return wint
},

mel=
tt/4*2**(round(log((0xCA98CA98>>(u>>12&30)&15))/log(2)*12)/12),

ins=x=>(wf(mel,"sth")/4+wf(mel/x,"sth")/4)*wf((mel^mel*(x*(t&16384?((u>>13&5^u>>13&3)-1):((u>>14&7^u>>13&4)+1)))),"tri")+(wf(mel^mel>>1,"sth")/4+wf(mel/x^(mel/x)>>1,"sth")/4),

p1='22 111  111 111 33 322 21 11444 44111 111 111  13  355  55 11 11',

bass=c=>(pat2=seq(p1),
m1=mseq('GJGEGGCE',16),
pat2=='1'?sin(cbrt(tan(u/280)-(9+c)%m1*tan(u/(40+c))%tan(m1/(80+c)))):pat2=='2'?sin(cbrt(tan(u/280)-(9+c)%m1*tan(u/(54+c))%tan(m1/(70+c)))):pat2=='3'?tan(sin(u/(280+c)))*tan(m1/(280+c))*cbrt(u/20)%sin(u/2047)*3:pat2=='4'?sin(tan(t/(160+c))+tan(u/(80+c)))*(-u>>5&255)/90:pat2=='5'?sin(tan(m1/(160+c))+tan(u/(240+c)))*(-u>>5&255)/180:0),

bs2=x=>{
m1=mseq('GJGEGGCE',16)/2
m2=mseq('C957',18)/2
return atan(
wf(m1|m1>>1,"sth")+wf(m1/x|m1/x>>1,"sth")/2+
wf(m2^m2/2,"sth")*2)/3
},

kk=atan(sin(16*cbrt(u%32768)**.55)*(1.97-(u/16384%1)**.15))%256/(u%32768)*2048||0,

sn=(sin(t2>>1^.9*t2>>2^1.2))*env(13,.6,14,.2)/1.5+wf(t2*1.07)*env(-1,0,14,.2)/1.5*seq([,1,,1],14)||0,

M=x=>tanh(tanh(atan(((ins(x?.99:1.01)*6*env(15,.5,-1)*1.5)+bass(x?.01:-.01)*2.5*env(15,.2,-1)))+(kk*2+sn)*2)+bs2(x?.99:1.01)*env(15,.2,-1)*6*env(15,2,-1))+kk+sn/1.5,

[M(0),M(1)]