// A new adventure
// by: Demari Smith
melody=t/2*"6363896363638919"[(t>>13)%16],
kick=(3e3/(t&16383)&1)*100,
snare=t*random()&63|t>>6&63*((t&16383)>8192),
bassBase=t/2*"444411111"[(t>>13)%8],bass=abs(sin(bassBase/300)*100),
synth=t/2*"3333555433331111"[(t>>13)%16],
((melody*0.9%90+melody%80)/3)+((synth*0.8%80+synth%80)/5.5)+kick+(snare/2)+(bass/2)