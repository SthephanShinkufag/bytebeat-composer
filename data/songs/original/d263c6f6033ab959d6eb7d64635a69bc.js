// LP filters work great at high samplerates
t/=4,

// Formula
z=(t*(4|7&t>>13)>>(~t>>11&1)&128)+(t*(t>>11&t>>13)*(~t>>9&3)&127),

// Envelope and LFO
e=2.71828182846,
l=((sin(t/1024/8)+1.5)*0.3), // Sine LFO
d=l*e**(-1/1024*(t&255*8)), // Exp decay

// Convenience vars
CUTOFF=d,
RESONANCE=0.0, // Set to 0.9 for a TB303ish acid sound

// The guts
FB=function(u){this.lp6=0,this.lp12=0},y=("undefined"!=typeof glob&&null!=glob||(glob=new FB),glob),cl=function(u,t,f){return Math.min(Math.max(f,u),t)},w=function(u){return(255&u)/255},cp=CUTOFF,c=cl(0,.99,cp),r=RESONANCE,fb=r+r/(1-c),f=((z&255)/127-1)/4,y.lp6+=c*(f-y.lp6+fb*(y.lp6-y.lp12)),y.lp12+=c*(y.lp6-y.lp12),y.lp12;