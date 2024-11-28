C=2**(-1.52/12),
Cs=2**(-.52/12),
D=2**(.48/12),
Eb=2**(1.48/12),
E=2**(2.48/12),
F=2**(3.48/12),
Fs=2**(4.48/12),
G=2**(5.48/12),
Ab=2**(6.48/12),
A=2**(7.48/12),
Bb=2**(8.48/12),
B=2**(9.48/12),
N=0, 

//Note Options.
K=sin(t>>6), S=sin(t>>4), H=sin(t>>2),
//Drum Options.
l = [Eb/2,F/2][floor(t/(2**11))%2],
m = [D/2,Eb/2][floor(t/(2**11))%2],
n = [C/4,N,C/4,N,C/4,N,Bb/4,C/2,C/4,N,C/4,N,Bb/4,Bb/4,Bb/4,N,C/4,N,C/4,N,C/4,N,Bb/4,C/2,l,Eb/2,D/2,Bb/4,m,D/2,Bb/4,G/4],

//Melody Options.
i = floor(t/(2**12))%32,
k = tan(t*PI/128*n[i]),
//Song Options.
k