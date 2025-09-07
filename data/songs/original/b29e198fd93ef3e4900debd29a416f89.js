//by hcdphobe, date: 2023-05-24
//sample rates
samp=48e3,
z=256*t/samp,
w=PI/128,
//shortcuts
l='length',
//the BPM
BPM=0x8d, //you can convert it to any number base
//pitch
pitch=1,
//volume: minimum is 0 and maximum is 100
volume=function(c,code){
var v;
if(c>100||c<0)
v=0 //mute
else
v=code*c //else it has sound
return v/100
},
fract=function(x){
return ((x%1)+1)%1
},
waveform=function(x,c){
var v,h;
h=c*w; //warning: for square, sine and triangle only
switch(x){
//quest: use the following wave to make up with this
case 'sqr':
v=(floor(sin(h))+.5)*2;
break;
case 'sin':
v=sin(h);
break;
case 'saw':
v=(fract(c/256)-.5)*2;
break;
case 'tri':
v=asin(sin(h))/1.565;
break;
}
return v
},
//notes
notes=function(x){
return x*z
},
//BPM to HZ
bpmtohz=function(x){
return x*z/2.5/4*32/384
},
k=bpmtohz(BPM),
//rhythm
rhythm=function(notes,speed,limit,pitches){
return pitches*notes[int(k*speed)%limit]
},
main=function(){
var v,med;
//setting the pitch will cause changes in notes
pitch=8;
//get notes
c=notes(65.41);
cs=notes(69.30);
d=notes(73.42);
ds=notes(77.78);
e=notes(82.41);
f=notes(87.31);
fs=notes(92.50);
g=notes(98);
gs=notes(103.83);
a=notes(110);
as=notes(116.54);
b=notes(123.47);
p=rhythm([as,gs,as,cs*2],1/64,4,1);
q=rhythm([fs,ds,fs,gs],1/64,4,1);
med=[[as,p,as,p,as,p,ds,q],[f,0,f,0,0,gs,0,gs,f,0,f,0,0,gs,0,gs,f,0,f,0,0,gs,0,f,as,0,as,0,c*2,0,c*2,0],[as,as,as,as,as,as,ds*2,f*2]];
r=rhythm(med[1],1/64,32,16); r2=rhythm(med[2],1/256,8,k&64?.5:.25); //used for fm synths
v=waveform('saw',rhythm(med[0],1/256,8,1))*(1-fract(k/(k&256?64:128)))/5;
v+=waveform('sin',r+waveform('sin',r/2)*44)*(1-fract(k/64))/6;
v+=waveform('sin',pow(1.5,-k%128)*2**11)/5;
v+=(9<<((k/32)%4)&0b100)*(random()*1-.5)*(1-fract(k/32))/12;
v+=waveform('sin',r2*2+waveform('sin',r2)*256*(1-fract(k/64)))*(1-fract(k/64))/3

return v
},
volume(100,main())