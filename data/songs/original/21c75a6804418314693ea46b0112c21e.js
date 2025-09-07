//jackpost
//by hcdphobe, date: 13-04-2023
volume=100, //the volume
x=volume>100?0:volume<0?0:volume/100, //check exceeds and below 0 and mute it
samp_rate=48000,
p=256,
beat=p*t/samp_rate,
v=beat/8,
//shortcuts
p=pow,
l='length',
k=sin(t*44100/samp_rate>>5),
n=1&t*44100/samp_rate,
r=round,
q=int,
//the notes
//meantone (81/80==1)
//notes made by u/PiotrGrochowski
_1=1,
_2=2,
_3=p(5,0.25)*2, //uses p from shortcuts
_4=_2*_2,
_5=5,
_6=_2*_3,
_8=_4*_2,
_9=_3*_3,
_10=_2*_5,
_12=_4*_3,
_15=_3*_5,
_16=_8*_2,
a=110*beat,
e=a*_3/_4,
b=e*_3/_2,
fs=b*_3/_4,
cs=fs*_3/_4,
gs=cs*_3/_2,
d=a*_2/_3,
g=d*_4/_3,
c=g*_2/_3,
f=c*_4/_3,
as=f*_4/_3,
ds=as*_2/_3,
//the notes pitch
//note: the division is the low pitch and the multiplier is the high pitch
s2=2,
s3=4,
s4=8,
s5=16,
//this song requires constructor to make up with functions
channel={
ch1:[a,,a,,d*s2,,a,,,,a,,,,a,,g,,g,,g,,a,,,,a,,,,a,,], //ch1
ch2:[a/s2,a,a/s2,a,c,c*s2,c,c*s2,e,e*s2,e,e*s2,d,d*s2,d,d*s2], //ch2
ch3:[a/s2,a,c,c*s2,e,e*s2,d,d*s2], //ch3
ch4:[0], //ch4
breakbeat:[1,,n,,k,,n,,],
//ch1 ch2 ch3 ch4 pitch
ch1p:1,
ch2p:1,
ch3p:2,
ch4p:1,
ch1speed:.25, //set ch1 speed
ch2speed:.125, //set ch2 speed
ch3speed:.0625, //set ch3 speed
ch4speed:.5,  //set ch4 speed
breakbeatspeed:.25, 
pitch:1, //set pitch
ch2duty:25, //duty
ch3duty:sin(v/6)*21+52, //duty
//divisor for ch1,ch2,ch3,ch4,breakbeat
ch1v:2,
ch2v:2.5,
ch3v:3.5,
ch4v:1,
breakbeatv:3
},
main()
//main songs, the ch1, ch2, ch3 and ch4
function main(){
//4 functions for channel
function CH1(x){
return x/2&127;
};
function CH2(x,b){
return ((x/2&127)+b*1.3&128);
};
function CH3(x,b){
return ((x/2&127)+b*1.3&128);
};
function CH4(x){
return x&128;
};
/*main*/
return x*(
CH1(channel.pitch*channel.ch1p*channel.ch1[q(v*channel.ch1speed)%channel.ch1[l]])/channel.ch1v+
CH2(channel.pitch*channel.ch2p*channel.ch2[q(v*channel.ch2speed)%channel.ch2[l]],channel.ch2duty)/channel.ch2v+
CH3(channel.pitch*channel.ch3p*channel.ch3[q(v*channel.ch3speed)%channel.ch3[l]],channel.ch3duty)/channel.ch3v+
CH4(channel.pitch*channel.ch4p*channel.ch4[q(v*channel.ch4speed)%channel.ch4[l]])/channel.ch4v+
((2e5/((v*1024*channel.breakbeatspeed*2)&(2**12/channel.breakbeat[int(v*channel.breakbeatspeed)%channel.breakbeat[l]])-1))&255)/channel.breakbeatv
); //get song length
}