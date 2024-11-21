t||(
F=1408/1600,m=q=>r=>r==q,c=(l,I)=>(r=l[0].match(/^([A-G][#b]?)([Mm+o]|mM|maj|min|augM?|dim)?([5679]|1[13])?((?:(?:add|#|b)(?:[569]|1[13])|sus[24])*)(?:\/([A-G6][#b]?))?$/),R=q=>'A BC D EF G'.indexOf(q[0])+'b #'.indexOf(q[1]??' ')-1,i='min aug dim maj m + o M mM augM'.split(' ').findIndex(m(r[2]))&3,s=[[0,,3,,7],[0,,4,,8],[0,,3,,6],[0,,4,,7]][i],u=s[1],s.push(...Array(8)),((S=r[4].match(/sus([24])/))&&(S=S[1],s[S==2?1:3]=S|S>>2)||r[3]==5)&&delete s[2],P=[9,14,,17,,21],r[3]>6&&(s[6]=(i!=2)+9+/M|maj/.test(r[2])),s.splice(8,n=max(0,r[3]-8),...P.slice(1,n+1)),/6/.test(r[3]+r[4]+r[5])&&(s[5]=9),Array.from(r[4].matchAll(/(add|#|b)([569]|1[13])/g)).forEach(q=>((s[q[2]-1]??0)||(s[q[2]-1]=P[q[2]-8]),s[q[2]-1]+=(q[1]=='#')-(q[1]=='b'))),s=s.filter(q=>q+1).map((q,i)=>(i<(I??0)?q+12:q)+R(r[1])),s.unshift(((r[5]??6)!=6?R(r[5]):R(r[1]))-12),s.o=q=>s.map((N,i)=>i>0?N+q*12:N),s),
chords=[
	c`Gm/C`,c`Absus2${2}`,c`Eb`,c`Bb${2}`,
	c`Gm/C`,c`Cm${2}`,c`Absus2${2}`,c`Ab${2}`,c`Ebsus2${2}`.o(-1),c`Eb${2}`.o(-1),c`Bbsus4${2}`,c`Bb${2}`,
	c`Gm7/C`,c`Cm7${3}`,c`Absus2b5`.o(1),c`Abadd9${3}`,c`EbM11`,c`EbM9`.concat(22),c`Ab6/Bb`.o(1),c`Bb7${3}`,
	c`Bb/Ab${2}`,c`Eb/Ab${1}`,c`Adim`.o(1),c`F7/A${1}`,c`Eb/Bb${2}`,c`Cm`.o(1),c`Ab${1}`.o(1),c`Ab/F${1}`.o(1),c`G7${1}`
],
durations=[
	4,4,4,4,
	2,2,2,2,2,2,2,2,
	2,2,2,2,2,2,2,2,
	2,2,2,2,2,2,2,1,1
],
T=durations[0],I=0,h=0
), // End of t=0
t>h+32767&&(h=t,--T==0&&(T=durations[++I%durations.length])),
C=q=>q.reduce((v,a,i)=>v+((t*F*2**(a/12-(i==0&&~t>>13&1)))%256&(i>0?128:255))*(i>0?t%16384/16384:1),0)/q.length,
C(chords[I%durations.length])*.8+32*sin(20*cbrt(t%16384/40))+32*random()*(-t&8E3)/8E3+(t*[0,sin(t/1.3>>1)][1&t>>14]&-t>>7&127)/3+32