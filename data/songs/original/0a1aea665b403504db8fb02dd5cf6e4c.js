//hcdphobe - the 3 ducks song
//date: 2023-05-03
//sample rates
samp=48000,
z=256*t/samp,
w=PI/128,
//shortcuts
l='length',
//the BPM
BPM=120,
//the pitch
//setting the pitch will cause changes in notes
pitch=1,
//volume: [0,100] are limited
volume=function(c,code){
var v;
if(c > 100 || c < 0)
v=NaN //mute
else
v=code*c //else it has sound
return v/100
},
fract=function(x){
return ((x%1)+1)%1
},
waveform=function(type,c){
var v,h;
h=c*w; //warning: for square, sine and triangle only
switch(type){
//quest: use the following wave to make up with this
case 'sqr':
v=(floor(sin(h))+.5)*2;
break;
case 'sine':
v=sin(h);
break;
case 'saw':
v=(fract(c/256)-.5)*2;
break;
case 'tri':
v=asin(sin(h))/1.565;
break;
case 'pwm':
v=(fract(((((c/2&127)+32&128)&&255)/256))-.5)*2;
break;
}
return v
},
//notes
notes=function(x){
return x*z*pitch
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
//lfo device
lfo=function(type,osc,steps){
return waveform(type,k*osc)*(k>>steps&1)
},
main=function(){
var v;
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
//arrays
med=[[gs,0,b/2,0,b/2,b/2,gs,a,gs,fs,fs,e,fs,fs,0,0,fs,fs,b/2,0,fs,fs,b/2,gs,fs,fs,e,e,e,0,gs,0,gs,b/2,b/2,b/2,b/2,0,gs,a,gs,fs,fs,e,fs,fs,0,0,b,0,b,b,b,cs*2,b,a,gs,0,e,0,e,e,0,0,fs,0,b/2,0,b/2,b/2,0,0,gs,0,e,0,e,e,0,0,b,0,b,b,b,cs*2,b,a,gs,0,e,0,e,e,0,0],[e,e,e,e,ds,fs,fs,0,fs,fs,b/2,b/2,e,e,e,0,e,e,0,0,ds,fs,ds,fs,b/2,0,b/2,0,e,e,e,0,b/2,0,b/2,0,e,0,e,0,b/2,0,b/2,0,e,e,e,0]];
v=waveform('pwm',rhythm(med[0],1/64,med[0][l],4))/4;
v+=waveform('pwm',rhythm(med[1],1/128,med[1][l],1))/4;
return v
},
volume(100,main());