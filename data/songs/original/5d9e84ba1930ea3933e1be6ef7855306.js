//order
//song mainly by Ok_District2473 also known as Glebguything and Gaham
/*
stuff suggested by the other members of the team:
\Two2Fall:
 \Stereo
*/
//entry for ByteBattle Season A

r=t,t/=2,     //nesenary variables
o=r=>r&&(t*r*(1&t/r>>12)*(t/r>>9&1))%256/r/4+o(r-1),     //a palindrome-like function
d=(e,r)=>e&&(t*e&t>>e)%256/32+d(e-1)&((t>>r)^(t<<e)),     //the cool "synth"
c=t=>(
r>1801217?0:     //if r=>~18e5, formula -> 0, else...
 r>1703489?(t*t*t/100)%256/(1+(t>>9&127)/4)%256/2     //...if r=>~17e5, replace the current formula with the snare, else do nothing with the formula
 :min(((o(32)-o(2))*4%256*(-t&2047)/2E3)     //the palidrome melody
 +(r>131200?(t*t*t/100)%256/(1+(t>>10&7)/2)/4*(1&t>>13):0)     //if r>=131200, enable snare
 +(r>1179713?0:(r>254251?d(t>>12&7,t>>16)*10:o(8)/2))
 +(r>1179713?0:(r>523224?o(45)/1.5:0)),255)/2     //Adds an extra palindrome melody in the drop
 +(r>1179841?cbrt(sin(cbrt(t/2%4096*4096)))*25+25:(r>262337?cbrt(sin(cbrt(t/4*(2**(7&(t>>11|t>>14^t>>10))/2**(3&t>>12))%4096*4096)))*25+25:cbrt(sin(cbrt(t/2%4096*4096)))*25+25))),     //the kick (goes crazy in the drop)
[c(t*0.9995),c(t*1.0005)] //the stereo