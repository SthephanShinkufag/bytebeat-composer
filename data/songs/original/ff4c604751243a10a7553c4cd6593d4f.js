SR=48e3,
t||(F=[],D1=[],D2=[]),

str=(n,L,t)=>(
p=t%L,
t||(F[n]=[]),

S=F[n],
S?(
S[p]=S[p]??(random()-0.5),
S[p]=(S[p]+(S[(p+1)%L]||0)+(S[(p+L-1)%L]||0))/3*0.9998,
S[p]*4
):0
),

sd=0.2,dl=SR/2,dr=SR/3,
sdl=(s)=>(
  l=s+(D2[(t-dl)%SR]||0)*sd,
  D1[t%SR]=l,
  r=s+(D1[(t-dr)%SR]||0)*sd,
  D2[t%SR]=r,
  [l+r*0.25,r+l*0.25]
),

sdl(
str(0,180-20*(floor(t/SR/4)%2),(t%SR))
+
str(1,100,((t+SR*2/3)%SR))
+
str(2,150,((t+SR/3)%SR))
+
str(3,(180+43*(floor(t/SR/4)%3))*2,(t%(SR*4)))*0.3
)