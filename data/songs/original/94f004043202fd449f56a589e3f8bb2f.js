t||(
F=1408/2205,m=q=>r=>r==q,c=(l,I)=>(r=l[0].match(/^([A-G][#b]?)([Mm+o]|mM|maj|min|augM?|dim)?([5679]|1[13])?((?:(?:add|#|b)(?:[569]|1[13])|sus[24])*)(?:\/([A-G6][#b]?))?$/),R=q=>'A BC D EF G'.indexOf(q[0])+'b #'.indexOf(q[1]??' ')-1,i='min aug dim maj m + o M mM augM'.split(' ').findIndex(m(r[2]))&3,s=[[0,,3,,7],[0,,4,,8],[0,,3,,6],[0,,4,,7]][i],u=s[1],s.push(...Array(8)),((S=r[4].match(/sus([24])/))&&(S=S[1],s[S==2?1:3]=S|S>>2)||r[3]==5)&&delete s[2],P=[9,14,,17,,21],r[3]>6&&(s[6]=(i!=2)+9+/M|maj/.test(r[2])),s.splice(8,n=max(0,r[3]-8),...P.slice(1,n+1)),/6/.test(r[3]+r[4]+r[5])&&(s[5]=9),Array.from(r[4].matchAll(/(add|#|b)([569]|1[13])/g)).forEach(q=>((s[q[2]-1]??0)||(s[q[2]-1]=P[q[2]-8]),s[q[2]-1]+=(q[1]=='#')-(q[1]=='b'))),s=s.filter(q=>q+1).map((q,i)=>(i<(I??0)?q+12:q)+R(r[1])),(r[5]??6)!=6&&s.unshift(R(r[5])-12),s),
chords=[
	c`A`,c`A9/G${1}`,c`F6`,c`E7`,c`Aadd9/C#`,c`Dm6`,c`E6`,
	c`F#m9`,c`DM9`,c`F#m7/B`,c`G`,c`E7sus4`,c`E7`
],
durations=[
	4,4,2,2,2,1,1,
	4,4,4,2,1,1
],
T=durations[0],I=0,h=0
), // End of t=0
t>h+32767&&(h=t,--T==0&&(T=durations[++I%durations.length])),
C=q=>q.reduce((v,a,i)=>v+((t*F*2**(a/12))%256&(i>0?t>>7:255)),0)/q.length,
C(chords[I%durations.length])