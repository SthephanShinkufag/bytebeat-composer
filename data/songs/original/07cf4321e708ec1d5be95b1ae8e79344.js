T=t*.95,trig=a=>parseInt('FEDCBA98765432100123456789ABCDEF'[a>>2&31],16)*4,
b=trig(t*2**([-6,-6,-6,-6,-6,n=NaN,n,n,n,n,n,n,-6,-6,-6,-6,-6,n,n,n,-11,-11,n,n,-8,-8,n,n,-7,-7][T>>11&31]/12-.01)),

sp=(d,m,v,dw=31,mw=63,vw=31,mo=0)=>((t*2**((m[T>>13&mw]-mo)/12-1.02)&127)+(d[T>>9&dw]??d[d.length-1])&128)*((v[T>>9&vw]??v[v.length-1])/28),

dfv=[10,9,8,7,6,6,5,5,4,4,3,3,3,2,2,2,1,1,1,1,1,0],
dfd=[16,32],
m=off=>sp(dfd,[NaN,NaN,9,9,6,6,NaN,NaN,5,NaN],dfv,31,15,31,off)+sp(dfd,[NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,5,6],[10,9,7,6,5,4,3,2,2,1],31,15,15,off),
s=[[t%7?r:r=random()*255&64,48*random()][T>>13&1]][T>>9&15]??0,
m(0)+m(5)+b+s