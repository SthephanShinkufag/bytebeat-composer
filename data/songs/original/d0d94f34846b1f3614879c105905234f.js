tra=-85,

t||(z=[],dl=Array(l=12288).fill(0)),x=0,lp=(a,c)=>(y=x++,z[y]??=0,z[y]+=(a-z[y])*c),
kt1='10100010001000101010001000100011'[int(t/4096)&31],
st1='0000100101001000'[int(t/4096)&15],
kt2=(int(t/4096)&3)==0,
k=kt=>lp(sin(4*cbrt(t%4096))*(t/4096%1-1)*kt,.1),
s=st=>(sin(6*cbrt(t%4096))+random()-random())*(t/4096%1-1)**2*st,
d=(kt,st)=>min(max(k(kt)+s(st),-.5),.5),

m1='-04094<9-0409<94+/2/72;7+/2/7;72)-0-5095)-0-5950+/2/72;7+/2/7;72',

m2='-+)+',

a=t*PI/8*2**((m1.charCodeAt(63&t>>13)+tra)/12),
b=t*PI/32*2**((m2.charCodeAt(3&t>>17)+tra)/12),

dc=(t/512&15?1:t/512%1)*(t/8192%1-1),

sc=(kt,st)=>(kt==1?t/2048&1?1:t/2048%1:st==1?t/2048&1?1:t/2048%1:1)**3,

nsUp=((random()-random())*(t>>11&255)/1024),
nsDn=((random()-random())*(-t>>11&255)/1024),

x1=sin(a+sin(a)/2)*dc/2+dl[t%l],dl[t%l]=x1/2,
x2=sin(b+sin(b)/2)/3,

ar=[x1,x1+nsUp,(x1+x2+nsDn)*sc(kt1,st1)+d(kt1,st1),(x1+x2)*sc(kt1,st1+nsUp)+d(kt1,st1),(x1+x2+nsDn)*sc(kt2,0)+d(kt2,0),(x1+x2+nsUp)*sc(kt2,0)+d(kt2,0),nsDn*sc(kt2,0)],
ar[int(t/524288)%ar.length]*(t/524288<ar.length)