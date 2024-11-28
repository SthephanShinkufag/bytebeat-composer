sth ='KHHHSHSHHSHKHSHH', // Stats Hardcore
K=32*sin(16*log(t%8192/80))&64, // Kick
H=((t*t*sin(t>>1)&255)*(-t>>5&255)>>8)/4, // HiHat
S=((t*sin(t>>3)&255)*(-t>>5&255)>>8)/2, // Snare
h=(sth[t>>13&(sth.length-1)]=='K'?K:sth[t>>13&(sth.length-1)]=='H'?H:sth[t>>13&(sth.length-1)]=='S'?S:0),
h