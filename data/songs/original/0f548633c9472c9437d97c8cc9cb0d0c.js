c=.00000012,
t=-log(log(2)*(-t*c+log(E)/log(2)))/(c*log(2)),
t%=2654208,
t-=t<2064384?0:589824,
T=q=>2**(q/12),
S=t=>((t&t>>2&255)+(t*0.99&255)+(t*1.01&255))/3,
e=1-(t/3>>3)/256%1,
m="kppppppp0po0ok0km0mhh0hhhh0hf0dddddddd0hf0ddddddddddd0kppppppp0po0ok0km0mhh0hhhh0hf0dddddddd0hf0ddddddddddd0hhhhhhhh0hj0jh0hj0jhh0cccc0cc0ccccccccccc0kkkkkkkk0kmomk0kmomkk0ffff0ff0ffffffffffff0ooom00ooom00p0om0pooooo0ooom00ooom00p0om0pk0hh0hh0hh0hh0hh0hh0hh0hppppp0r0pm0pk0hh0ik0ih0fddddd0",
// ((A)=>{throw m.length;})(),
s=t/3>>11,
g=s%3,
b=q=>(S(t*T(q[0]))+S(t*T(q[1]))+S(t*T(q[2])))/5*e*(g!=1)+(S(t*T(q[0]-4-('0x'+(s<312?'818D8D8D'[t/9>>11&7]:'8')))))/2*e*(g==0),
s<24?
S(t*T("popkjklnlkihfefkihfhihfh".charCodeAt(s))/256)*(.5+.5*e):
b(s<156?[4,8,11]:s<198?[8,11,15]:s<282?[-1,3,6]:s<312?[[4,8,11],[8,12,15],[1,4,8],[8,12,15],[1,4,8]][(s-282)/3>>1]:[[-3,1,4],[-2,1,4],[-1,4,8],[1,5,8],[6,9,13],[-1,3,6],[4,8,11],[4,8,11]][(s-312)/3|0])+S(t*(n=m.charCodeAt(s-47),n!=48?T(n):0)/128)/4