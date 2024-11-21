noi=function(x,a){return sin(x/9000*x*x*x)/256*a},
kick=sin(pow(1.6,(-t/512%32+8)))/2,
snare=noi(floor(t/3)*"01"[t>>14&1],-(t/128%128)+128)/3,
hihat=noi(t,16-sqrt(-t&4095)/1.5),
mel=min(max(atan(tan(t*[1,4,1,4,1.05,4,1.05,4][t>>13&7]*"10"[t>>12&1]/2/41)^sin(t/41)),-1),1)/((t/512&7)+3),
bas=asin(sin(t*[1,1.05,1,1.05,0,1,1.05,1][t>>14&7]/41))/4,
(kick+snare+hihat+mel+bas)/1.5