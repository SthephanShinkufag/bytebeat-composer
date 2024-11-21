s=sin(t>>5), h=1&t, t*=.18,

beat=(arr,len,spd,vel=2e4,morph=t,oct=0)=>(vel/(morph&(2**(spd-oct)/(arr[(t>>spd)%len]))-1)),

mix=(x,v,dist=0)=>(x*v*(1+dist))%(256*v),
m=(x,v,d)=>isNaN(mix(x,v,d))?0:mix(x,v,d),

//song

p= [4,9,10,12,9.2,6,7,8],
q= [1,2,1,,1,1,1,2],
q2=[1,h,s,h,h,2,s,h],
q3=[1, , , , ,1, , ],
mel1=[1,1,1.2,1.375],
mel2=[].concat(mel1,mel1,mel1,[1.6,1.5,1.3,1.06]),

mel3=t*mel2[(t>>12)%16],

m(m(beat(p,8,10,6e4,mel3,-.6+((t>>12)%16)*.05),.9,7)+m(beat(q,8,11,9e3,t,0),9),.4)+m(mel3,.1)+m(beat(q2,8,11),.6)^m(beat(q3,8,11,1e4),.5)