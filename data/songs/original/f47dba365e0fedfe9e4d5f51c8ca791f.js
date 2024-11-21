delay=1714.5,
distorsion=0,

t?0:a=Array(n=round(delay*6*1.5)).fill(0),
t/=6,

EqT=p=>32/(delay/round(delay/(32/2**(p/12-.02)))),

Melody=EqT([5,10,12,17,20,24,27,32][floor((t+(Math.random()*distorsion))/delay)%8]),
Chords=8*EqT([12,12,12,15,10,10,10,3,5,5,5,5,8,8,8,5,10,10,10,10,8,8,8,3,5,5,5,5,8,8,8,10][floor(((t+(delay*32))+(Math.random()*distorsion))/((delay)*2))%32]),
melodyvolume=t<54864?(t/128000):0.42,
chordsvolume=t<274320?0:0.5,
melodyvolume2=t<164592?0:t<(54864+164592)?((t-164592)/128000):0.42,
Melody2=EqT([-7,-4,0,3,5,10,12,15][floor(((t+(Math.random()*distorsion)))/delay)%8]),




ev=(((((abs(((((t*Melody)/1)/8)%4)-2))-1))*melodyvolume
+
(((abs(((((t*Melody2)/1)/8)%4)-2))-1))*(melodyvolume2/2)
+
((((t)*Chords)%256)*(chordsvolume/192))-0.5
))+a[t*6%n], a[t*6%n]+= ev /*this*/, a[t*6%n]/=3, ev/2
