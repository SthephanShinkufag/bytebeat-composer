t2=t, //original t for readout
t/=44100,
bpm=148,
loop=false,
s=4, //speed
readout=1, //disable by changing 1 to 0
track=[
/*
 HH BB C1 C2 C3 LL DRUMS*/
'1d 11               h k ',
'   11                   ',
'1e 12               h   ',
'   12                   ',
'22 16               h k ',
'   16                   ',
'21 15               h   ',
'   15                   ',
'22 16               h k ',
'   16               h   ',
'21 15               h   ',
'   15               h   ',
'20 14             s   k ',
'   14                   ',
'21 15             s   k ',
'   15                   ',
'   0a 0a 10           k ',
'   0a 0a 10             ',
'   0d 0a 10         h   ',
'   0d 0a 10             ',
'   10 0a 10       s   k ',
'   10 0a 10             ',
'   11 0a 0d         h   ',
'   11 0a 0d             ',
'   16 0a 0d           k ',
'   16 0a 0d             ',
'   19 0a 0d         h   ',
'   19 0a 0d             ',
'   1c 04 0a       s   k ',
'   1c 04 0a             ',
'   1d 04 0a         h   ',
'   1d 04 0a             ',
'   0a 04 0a           k ',
'   0a 04 0a             ',
'   0d 04 0a         h   ',
'   0d 04 0a         h   ',
'   10             s   k ',
'   10                   ',
'   11               h   ',
'   11                   ',
'   16                 k ',
'   16                   ',
'   19 04 0a         h   ',
'   19 04 0a         h   ',
'   1c 04 0d       s   k ',
'   1c 04 0d             ',
'   1d 0a 10         h   ',
'   1d 0a 10             ',
'   19 0a 13             ',
'   19 0a 13             ',
'   19 0a 13             ',
'   19 0a 13             ',
'   19 0a 13             ',
'   19 0a 13             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
'   18 0a 12             ',
],
k=t*bpm/60,
f=v=>440*t*2**(('0x'+v)/12),
b=v=>(v!='  ')*(0x9fabdeca*('0x'+v)>>f(v)&1?8:-8), //atari bass
h=v=>(v!='  ')*(((f(v)*16&-(w=k/2*s**5))&127)+(w&127)/2-64)/4, //harmonic melo
c=v=>(v!='  ')*(((f(v)/2%1*256)&191)-95)/12, //chord
i=v=>(v!='  ')*(([0,1,2,4,8,16,32,64,96,128,224,255,224,128,96,64,32,16,8,4,2,1][(f(v)*1.375*4|0)%22])%256-95)/8,//lead
q=v=>(v=='s')*((t%.00485*16384^t%.0062399*16384)&64?16:-16)*.1**(p=k*s%1)*1.5, //snare
j=v=>(v=='h')*(random()-.5)*.001**(p)*32, //hi-hat
r=v=>(v=='k')*(floor(sin(cbrt(k%1)*200))+.5)*32, //kick
((A)=>{if(t2%768<.5&&A&&t)throw loop==false&&_u+1>_c?'\ntick finished':(
'\ntick: '+(u+1)+'/'+_c+'\nharmonic melo: '+m[0]+'\nbass: '+m[1]+'\nchord 1: '+m[2]+'\nchord 2: '+m[3]+'\nchord 3: '+m[4]+'\nlead: '+m[5]+
'\ndrums: '+(m[6]=='s'?'💥':'💣')+(m[7]=='h'?'💥':'💣')+(m[8]=='k'?'💥':'💣'))})(readout),
n=track[u=(_u=k*s|0)%(_c=track.length)], //get length of the tracks
m=[n.slice(0,2),n.slice(3,5),n.slice(6,8),n.slice(9,11),n.slice(12,14),n.slice(15,17),n.slice(18,19),n.slice(20,21),n.slice(22,23)],
128+(
 h(m[0])
+b(m[1])
+c(m[2])
+c(m[3])
+c(m[4])
+i(m[5])
+q(m[6])
+j(m[7])
+r(m[8])
)*1.2*(loop==false?_u<_c:1)