t?0:Z=Y=Array(16384).fill(b=c=d=0),
h=0,
H=(t,b)=>{for(i=m=0;i<t.length;i++)b>t[i]&&(m=b-t[i]);return m},
lpr=(b,n)=>(t||(Z[h]=0),t||(Z[++h]=0),g=(i,n,r)=>min(max(Z[r]+=(Z[n]+=b/4+64-Z[r])-(Z[n]/=1+i/48e3),0),255),h+=2,g(n,h,h+1)),
b+=(U=170/288e4),l=0,
p=(k,s=b,f=sin,q=10)=>(t?0:Z[h]=0,Q=Z[h]=(q*Z[h]+(isNaN(parseInt(k[s|0],36))?0:2**(parseInt(k[s|0],36)/12)))/(q+1),h+=2,t?0:Z[h]=0,Q=Z[h]+=isNaN(parseInt(k[s|0],36))?0:Q,Y=f(Q),Q=0,Y),
(p('    CCCCCCCCCCCCFFFFFFFFAAAAHHHHFCCCCCCCHHHHFFFFAAAAAAAAHHHHFFEE',b*4%64,k=>sin(k*PI/128)>.75,1200)*(1.5-H([0,1,2,3,4,5,6,6.5,7,8,9,9.5,10,10.5,11,11.5,12,13,14,15,15.5],b%16))/2.5+((R=k=>lpr(random()*256-128,k)/64-1)(8000)>0)*max((1+b*4)&3,1)*(b*4%1-1)/6+p(['CFJF','CFJF','CFJF','AFJF'][b/2&3|0],b*16%4,k=>k/256%1>.25,0)/2*(((b+.5)%1-1)*(1==((b+.5)&1)))+p('CCCA885A',b/2%8,k=>sin(k*PI/512*+'12'[b*2&1])>0,0)/3+(sin(cbrt(b*('222222242222242422222224222484848'[b*2&31])%1*4)*128)>0)/3+(((2==(b*2&3))*(R(1000)+R(5000)+R(7000)+R(10000)+R(25000))>0)*(b*2%1-1)**1)/2)*64