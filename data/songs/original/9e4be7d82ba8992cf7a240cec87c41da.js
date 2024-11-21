m=parseInt(
"kotojotohotojotokqtaketqkqtaketa"
[(t>>13|((t>>10)^(t>>14))*(t>>14&1))%32],
36)/((t>>16^t>>14)&1?1:1.5),

n=((m*(t/3)&64)+(m*(t/4)&64))*~t>>10,

o=(sin(t)*6e3)&63&~t>>((t>>12|t>>15)&1?6:9),

(n&255)/2+o