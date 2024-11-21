p=409.5, // Pitch
s=sin(t/7e4)*20+22, // Sound
k=3, // Seed
v=50, // Volume
x=sin(int(t%p*s/p+k))*1e4,
(x-int(x))*v