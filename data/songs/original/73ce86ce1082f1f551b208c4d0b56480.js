sample_rate=44100,
vol=0.2,

st=t/32*8000/sample_rate*1.025, // sawtooth wave that cycles once every second (roughly)

alow=st*[110/2,146.83,349.228/8,391.995/8][(t/32*8000/sample_rate>>10)%4],
a=st*220,
c=st*[261.6,261.6,293.665,329.628][(t/32*8000/sample_rate>>6)%4], 
e=st*[329.6,329.6,391.995,441][(t/32*8000/sample_rate>>6)%4],
g=st*[391.995,440,493.883,523.2][(t/32*8000/sample_rate>>6)%4],

((a*vol)%(255*vol))+((c*vol)%(255*vol))+((e*vol)%(255*vol))+((g*vol)%(255*vol))+((alow*vol)%(255*vol))
