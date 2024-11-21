l=1.34373501,

j=t/l,
B=(u,x)=>t*l*pow(2,parseInt(u[x%u.length],36)/12),
S=(c,k)=>c[k],
pwm=i=>(i%256>i%257)*32,
saw=k=>k/8&31,
tri=o=>(o&64?-o:o)&127,
sqr=n=>n/4&32,

drums=(
   s=sqr(t*sin(t/(1+(15&-j>>7)/3)>>2)),
   h=50*random(),
   qh=20*random(),
fi=[
  h,qh,qh,h,
  s,qh,h,h
],
 S(fi,(j>>12)%fi.length)*(1&j>>11?0:-j>>3&255)>>8
),

bass1=saw(B((j&131072?j&65536?j&32768?"7c77c77c":"9e99e99e":"7c77c77c":j&65536?"bgbbgbbg":"27227227"),j>>12)/4),
melody1=saw(B((j&131072?j&65536?"962b62c62b62c2e2":"c74e74c74e74c4e4":j&65536?"jgblgbjgblgblgng":"b72c62b72b627b92"),j>>12))*(-j>>4&255)>>8,
bell=sqr(B((j&262144?"74ce":"b7c6"),j>>16)*4)*(-j>>8&255)>>8,
melody2=tri(B((j&262144?j&131072?j&65536?"bceg79ce44447777":"74274272":"b72b62b7":j&131072?j&65536?"79ce247944442222":"24747924":"b72b62b7"),j>>12)/2),
arp=sqr(B((j&262144?j&131072?j&65536?"cil":"cjl":j&65536?"cgl":"cej":j&131072?j&65536?"69c":"79c":j&65536?"47b":"27b"),j>>9)),
a1=bass1+melody1+drums,
a2=a1+bell,
a3=a1+melody2,
a4=a1+bell+melody2,
a5=a4+arp/1.5,
a6=a1+arp/1.5,
fn=bass1+melody1,

f=[
   a1,a1,a3,a3,
   a4,a4,a2,a2,
   a4,a4,a5,a5,
   a5,a5,a6,a6,
   a1,a1,fn,fn
],

S(f,j>>18)
