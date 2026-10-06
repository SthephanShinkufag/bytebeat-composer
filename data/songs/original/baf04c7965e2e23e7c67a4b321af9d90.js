t?0:A=Array(n=12288).fill(0),

mel1=[1,0,1,0,1,0,10,0,1,0,1,0,1,0,10,0,1,0,1,0,1,0,10,0,1,0,10,0,1,0,0,0],
mel2="2356",

chm1=[0,0,3,3,0,0,5,7],
chm2=[-5,-5,-2,-2,-4,-4,-2,3],
chm3=[-9,-9,-5,-5,-7,-7,2,-2],

melBass=[0,3,0,7,5,3,2,0],

dec=(spd,ramp)=>(t*ramp&((16384/spd)-1))/17e3,

TR=x=>((((t/(mel2[(t>>17)%mel2.length])*t*mel1[(t>>12)%mel1.length])%256)/256)-0.5)*dec(2,-1)*2.5,

rv=ins=TR(t)+TR(t-1e6)/1.75+A[t%n]/1.75,

A[t%n]=rv,

seq=(arr,spd)=>t*2**(arr[(t>>spd)%arr.length]/12),

chrd=vc=>atan(tan(seq(vc,16)*PI/128))/5+atan(tan(seq(vc,16)*PI/127))/10,

saw=(chrd(chm1)+chrd(chm2)+chrd(chm3))*dec(1,1),

bass=(sin((seq(melBass,13)*PI/128)+cos(seq(melBass,13)*PI/127)*dec(1,-1))*sin((seq(melBass,13)*PI/256)+sin(seq(melBass,13)*PI/256)*dec(1,-1)))/2,

sseq=[1,,1,1,,1,1],
snare=asin(sin(t*tan(t^2)^4))/5*dec(4*sseq[(t>>12)%sseq.length],-1)*3,

cseq=[,,1,1,,1,1,1],
crash=((sin(t/8*sin(t>>4))*atan(tan(t>>3^2))))*dec(2*cseq[(t>>13)%cseq.length],-1)/1.5,

kick=sin(55*log(t%16384))/2,

ins/2.25+saw/1.75+bass/1.75+snare+kick/1.5+crash