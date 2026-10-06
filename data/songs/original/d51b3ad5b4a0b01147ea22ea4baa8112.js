/* 
  /¯¯¯¯/\¯¯¯¯\'    /¯¯¯¯/`·.¯¯/|  |¯¯¯¯| |¯¯¯¯|\¯¯¯¯\'  |¯¯¯¯|  /¯¯¯¯/`·.¯¯/| 
 '|       |::|       |   '|       |::::'\/::|  |       | |       | |       |  |       | '|       |::::'\/::| 
 '|____|/\|____|   |\____\`·.:|::/‘  |____| |____|/____/|‘ |____| |\____\`·.:|::/‘ 
 '|¯¯¯¯|  |¯¯¯¯|   |'|::::'|\¯¯¯¯\    |¯¯¯¯| |¯¯¯¯|\¯¯¯¯\|‘ |¯¯¯¯| |'|::::'|\¯¯¯¯\   
 '|       |  |       |   \|/\:::|:|       |'‚  |       | |       |:|       |  |       | \|/\:::|:|       |'‚ 
 |\____\'/____/| ' /__`·./____/|   |____| |____|\|____|  |____| /__`·./____/|  
 |:|:::::::|:::::::'|:|'‚ |::::::|:::::::|:|'‚  |:::::::| |:::::::| |:::::::|  |:::::::| |::::::|:::::::|:|'‚ 
  \|:::::::|:::::::|/'‚  |::::::|:::::::|/    |:::::::| |:::::::| |:::::::|  |:::::::| |::::::|:::::::|/   
    ¯¯¯¯ ¯¯¯¯'     ¯¯¯ ¯¯¯¯       ¯¯¯¯'  ¯¯¯¯  ¯¯¯¯    ¯¯¯¯'  ¯¯¯ ¯¯¯¯     

OSIRIS EDM Mix, Coded by Semaphore/MarioFan171

After working on some SMW Romhacking stuff, I decided to make my own EDM Remix of my older Bytebeats, but this time, in Floatbeat, as it's much more versatile compared to regular Bytebeat, at the cost of performance.

*/

i=0, // Turn Tracker ON/OFF

// Adjustable Variables
tune=.9, // Master Tuning
speed=1, //Master Speed (Adjust to your liking)
// Meta: Important Variables
T=t*tune, // "T" Substitute for tuning
p=t*speed, // "T" Substitute for speed

// Meta Variables: Important for the song to play
a=(spd,len)=>(p>>spd)%len,
dec=(ramp,spd,vol)=>((p*ramp)&(4096*spd)-1)/vol,
r = repeat = (x, y) => Array(x).fill(y).flat(9),
seq=(arr,spd)=>T*2**(arr[a(spd,arr.length)]/12)||0,

// "t" substitute for Hihats and Effects
t2=t,
t ? 0 : fx = r(4e4, 0), // Effect Variable, by Greaserpirate

fxi = 0, // Iterator, resets to 0 at every t

// Effects (Coded by Greaserpirate)
rv = reverb = (x, len = 16e3, feedb = .7, dry = .4, wet = 1, dsp = 2, T = t2) => (
	ech = y => fxi + (0 | (y % len) / dsp),
	x = x * dry + wet * fx[ech(T)] || 0,
	t2 % dsp ? 0 : fx[ech(t2)] = x * feedb,
	fxi += 0 | (len / dsp),
	x
),

m = mix = (x, vol = 1, dist = 0) => ((x * vol * (1 + dist)) % (256 * vol)) || 0,

// Sequences
m1=[-5,0,3,,2,3,-5,,-5,0,3,,5,3,2,-2][a(13,16)],
m2=[-4,0,3,-4,0,3,-4,0,-4,0,3,-4,0,3,-2,2][a(13,16)],
m3=[0,3,7,0,3,7,0,3,7,0,3,7,5,3,2,0][a(13,16)],

mel=[m1,m1,m1,m1,m1,m1,m1,m1,m2,m3,m2,m3],

l1=[0,7,,10,,2,3,0,7,,0,10,,2,3,0,-5,,0,7,,5,3,2,0,,-2,0,,,,][a(13,32)],
l2=
[-4,0,,3,,5,7,2,3,,0,7,,10,3,2,7,,-4,0,,7,,5,3,2,0,,-2,,0][a(13,16)],
l3=[-4,0,2,3,,,7,3,,2,3,,2,0,,0][a(13,16)],
l4=[-2,-5,-7,,,0,-5,,-2,-9,-10,,-9,-10,,][a(13,16)],
melLead=[l1,l1,l2,l2,l1,l1,l2,l2,l3,l4,l3,l4],

melChrd1=
[
0,0,3,3,
-4,-4,-2,-1,
0,0,3,3,
5,5,7,10,

-4,-2,0,-2,
-4,-2,0,3,],

melChrd2=
[
-5,-5,-2,-2,
-7,-7,-5,-5,
-5,-5,-2,-2,
-4,-4,-2,2,

-9,-7,-5,-7,
-9,-7,-5,0,],

melChrd3=
[-9,-9,-5,-5,
-12,-12,-9,-9,
-9,-9,-5,-5,
0,0,2,5,

0,0,-9,-9,
0,0,-9,-5
],

melBass=[0,5,7,12,0,5,7,10,0,3,5,8,0,3,5,7],

// Instruments

chrd=vc=>((atan(tan(seq(vc,16)*PI/128))/2)+(atan(tan(seq(vc,16)*PI/127))/2))*dec(1,4,3e4),

saw=chrd(melChrd1)+chrd(melChrd2)+chrd(melChrd3),

lead1=((sin(seq(mel,17)*PI/32)/3*cbrt(sin(cos((seq(mel,17)*PI/32)+(seq(mel,17)*PI/1.05>>3)+(seq(mel,17)*PI/1.09>>5))))+cos(seq(mel,17)*PI/32)/2))/1.5*dec(-1,2,6e3),

lead2=cbrt(sin(sin(seq(melLead,17)*PI/32+sin(seq(melLead,17)*PI/32))))/3+cbrt(sin(sin(seq(melLead,17)*PI/31.75+sin(seq(melLead,17)*PI/31.75))))/3,

bass=sin(sin(sin(sin(seq(melBass,13)*PI/256+sin(seq(melBass,13)*PI/128+sin(seq(melBass,13)*PI/512))*dec(-1,2,2e3))))),

//Percussions

beat=bt=(arr,spd1,spd2,vol)=>dec(-1*arr[a(spd1,sseq.length)],spd2,vol),

k1=[
2,1,2,1,2,1,2,1,
1,2,1,2,2,1,2,2,
][a(13,16)],
k2=[
2,1,2,2,2,2,2,1,
2,1,2,1,4,2,4,8
][a(13,16)],
kseq=[k1,k1,k1,k1,k1,k1,k1,k2],

kick=(spd1,spd2)=>(sin(10*cbrt(((p*spd2)*kseq[a(16,kseq.length)])%(32768/spd1))))/2.75,

s1=[1,,1,1,1,,1,1][a(12,8)],
s2=[1,1,1,1,1,1,1,][a(12,8)],
sseq=[s1,s1,s1,s1,s1,s1,s1,s2],
snare=sin((t>>5^14)*sin(t>>1))/4*bt(sseq,16,1,4e3),

c1=[,1,,1,,1,1,][a(13,8)],
c2=[1,,1,1,,1,1,][a(13,8)],
cseq=[c1,c1,c1,c1,c1,c1,c1,c2],
crash=(sin(t>>5^14*sin(t>>3)))/4*bt(cseq,16,2,5.5e3),

hseq=[,1,1,1,,1,1,1],
hihat=(spd,vol)=>(1&(t2*441/480))/2*bt(hseq,12+spd,1+spd,vol),

// Formula (In stereo)
formula=[
// Left Channel (Green)
(m(saw,.4*dec(-1,4,5e3))+
rv(lead1,14e3,.7,.5,.9,8))+
rv(lead2,12e3,.7,.5,.7,1)+
m(bass,.4)+

m((m(kick(1,1),1.25)+
snare+
crash+
hihat(1,7e3)),.95)
,

// Right Channel (Pink)
(m(saw,.4*dec(1,4,9e3))+
rv(lead1,14e3,.9,.5,.9,8))+
rv(lead2,12e3,.5,.6,.9,1)+
m(bass,.4)+

m((m(kick(2,2),1.25)+
snare+
crash+
hihat(0,5e3)),.94)
],

// Infoboard for Error Console

info = function(length) {

var Title = "---------=+\0OSIRIS Leap\0+=---------"
var Credits = "\n Copyright © 2016-2024 MarioFan171"

var ProgressbarL = [
"[-------",
"[-------",
"[█------",
"[██-----",
"[███----",
"[████---",
"[█████--",
"[██████-",
"[███████",
"[███████",
"[-██████",
"[--█████",
"[---████",
"[----███",
"[-----██",
"[------█",
"[-------",
][a(11,16)]
var ProgressbarR = [
"-------]",
"-------]",
"------█]",
"-----██]",
"----███]",
"---████]",
"--█████]",
"-██████]",
"███████]",
"███████]",
"██████-]",
"█████--]",
"████---]",
"███----]",
"██-----]",
"█------]",
][a(11,16)]

// Meter Function, which is used to convert a channel, to volume data:
var M = chm => abs(chm*256)-128

// Code for the volume meters:

var vol = chm=> [
"███████████\0| ",
"██████████\0\0| ",
"█████████\0\0\0| ",
"████████\0\0\0\0| ",
"███████\0\0\0\0\0| ",
"██████\0\0\0\0\0\0| ",
"█████\0\0\0\0\0\0\0| ",
"████\0\0\0\0\0\0\0\0| ",
"███\0\0\0\0\0\0\0\0\0| ",
"██\0\0\0\0\0\0\0\0\0\0| ",
"█\0\0\0\0\0\0\0\0\0\0\0| ",
"\0\0\0\0\0\0\0\0\0\0\0\0| ",
][((abs(chm-128)/4.000000000000001)&12)]||"\0\0\0\0\0\0\0\0\0\0\0\0| "

// These Variables are needed in order for the master volume meter to work
var formL = (m(saw,.4*dec(-1,4,5e3))+
rv(lead1,14e3,.7,.5,.9,8))+
rv(lead2,12e3,.7,.5,.7,1)+
m(bass,.4)+

m((m(kick(1,1),1.25)+
snare+
crash+
hihat(1,7e3)),.95)

var formR = (m(saw,.4*dec(1,4,9e3))+
rv(lead1,14e3,.9,.5,.9,8))+
rv(lead2,12e3,.5,.6,.9,1)+
m(bass,.4)+

m((m(kick(2,2),1.25)+
snare+
crash+
hihat(0,5e3)),.94)

var fMaster = formL+formR

var Mvol = chm =>[
"|█████████████████████████████████|",
"|████████████████████████████████\0|",
"|███████████████████████████████\0\0|",
"|██████████████████████████████\0\0\0|",
"|█████████████████████████████\0\0\0\0|",
"|████████████████████████████\0\0\0\0\0|",
"|███████████████████████████\0\0\0\0\0\0|",
"|██████████████████████████\0\0\0\0\0\0\0|",
"|█████████████████████████\0\0\0\0\0\0\0\0|",
"|████████████████████████\0\0\0\0\0\0\0\0\0|",
"|███████████████████████\0\0\0\0\0\0\0\0\0\0|",
"|██████████████████████\0\0\0\0\0\0\0\0\0\0\0|",
"|█████████████████████\0\0\0\0\0\0\0\0\0\0\0\0|",
"|████████████████████\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|███████████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|██████████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|█████████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|████████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|███████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|██████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|█████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|████████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|███████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|██████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|█████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|████████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|███████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|██████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|█████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|████\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|███\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|██\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|█\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
"|\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|",
][((abs(chm-128)/4.000000000000001)&34)]||"|\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0|"

// Instrument Variables
var Ins = ""

if (mel[a(17,mel.length)]!=undefined){
Ins=Ins.concat(mel[a(17,mel.length)])
}else{
Ins=Ins.concat("\0\0")
}
var Lead = ""
if (melLead[a(17,melLead.length)]!=undefined){
Lead=Lead.concat(melLead[a(17,mel.length)])
}else{
Lead=Lead.concat("\0\0")
}
var C1 = ""
C1=C1.concat(melChrd1[a(16,melChrd1.length)])
var C2 = ","
C2=C2.concat(melChrd2[a(16,melChrd2.length)])
var C3 = ","
C3=C3.concat(melChrd3[a(16,melChrd3.length)])

// Percussion Variables
var Bass = ""
Bass=Bass.concat(melBass[a(13,melBass.length)])
var Hhat = ""
Hhat=Hhat.concat(hseq[a(13,hseq.length)]?["🔔"," "][a(12,2)]:"  ")
var Kick = ""
Kick=Kick.concat(ceil(100*cbrt(t%(16384/kseq[a(14,kseq.length)])))/20>70?"🔈":["🔊","🔉"][a(10,2)])

var Snare = ""
Snare=Snare.concat(ceil(100*cbrt(t%(16384/sseq[a(14,sseq.length)])))/20>70?"💥":"💣")

var Crash = ""
Crash=Crash.concat(ceil(100*cbrt(t%(16384/cseq[a(14,cseq.length)])))/20>70?"💥":"💣")

throw Display =
"\n"
+ Title
+ Credits
+ "\n"
+ ProgressbarL
+ "] + Instruments + ["
+ ProgressbarR
+ "\n|Lead 1 : | "
+ vol(M(lead1))
+ Ins
+ "\n|Lead 2 : | "
+ vol(M(lead2))
+ Lead
+ "\n|Synth\0\0: | "
+ vol(M(saw))
+ C1 + C2 + C3
+ "\n|Bass\0\0\0: | "
+ vol(M(bass))
+ Bass
+ "\n"
+ ProgressbarL
+ "] + Percussions + ["
+ ProgressbarR
+ "\n|Hihat\0 : | "
+ vol(M(Hhat))
+ Hhat
+ "\n|Kick\0\0 : | "
+ vol(M(kick(1,1)+kick(2,2)))
+ Kick
+ "\n|Snare\0 : | "
+ vol(M(snare))
+ Snare
+ "\n|Crash\0 : | "
+ vol(M(crash))
+ Crash
+ "\n"
+ ProgressbarL
+ "]=================["
+ ProgressbarR
+ "\n"
+ Mvol(M(fMaster))
},

i>0||(t/8.15%1%1)?formula:info()