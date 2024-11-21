about=`
Drum Machine Interpreter v0.1 - by Iwaku
------------------------------------------
`,
/*
This is a simple drum machine that allows sequencing when different channels are enabled.
The drum machine interprets a 2D array containing the arrays that represent each pattern.
It also includes an info area shown by `throw`ing it.

You could put the channel inputs as functions so you could change the arguments easily.
However here I have simply used variables.

This is yet another example using mu6k's rather famous "No Limit". The beat goes *perfect* with the rhythm!
Also to change things up, the second snare's decay length is changed every 32.8 seconds (so set "sec" to 32.8 for it). Somewhat reminds me of Zackx's "My new instrumental in new year".
*/

btof=f=>f%256/127-1,

T=t/6,m=btof((T&4095)/8191*((T<<1)*(1+.333*(32767<(T&65535))+.177*(49151<(T&65535)))&255)*.4+.25*((T>>4^T>>6|T>>10|3*T*(1+.333*(32767<(T&65535))+.177*(49151<(T&65535))))&255)),

// I had to hardcode `trate` here because the BPM is quite a long decimal...
trate=24576,
b=(0.9997**(t%trate))*sin((t%trate)**.5),
c=(0.998**(t%(trate/4)))*sin(t**5),
d=((0|t/(trate*64)%2?.9997:.9993)**(t%(trate/2)))*sin(t**4),
seq=[
[m],
[b, , , ,b, , , ,],
[ , ,c, , , ,c, ,],
[ , , , ,d,d, , ,]
],
intrp=function(time,x,rate){
  var total = 0;
  var str = ``;
  // You are not expected to understand the next 12 lines.
  for(const [j,i] of x.entries()){
    var ind=0|time/(rate/4)%(i.length);
    var val = i[ind]||0;
    total += val;
    str += `C${j}: `;
    var map = `${i.map((v)=>v==null?"":"O").toString().replaceAll(",","-")}`;
    // This is buggy, likely because of the non-monospaced font
    map = map.substr(0,ind)+"X"+map.substr(ind+1)
    str += map;
    str += `(((((((${"$".repeat(floor(abs(val*25)))}\n`;
  }
  str=`<-This is just t silly\n${about}\n`+str;
  return [total/x.length,str];
},
throwcount=0,

// Enable/disable info here
nfoenabled=1
,
drum=function(time,x,rate){
  // Until I can figure out a way to stop `throw` from NaNing samples, I'll have to add to `t` to stay in time
  var [out,info] = intrp(time+throwcount,x,rate);
  if(nfoenabled&&(time%2==0)){
    throwcount++;
    throw info;
  }
  return out;
},
//Run the drum machine!
drum(t,seq,trate)