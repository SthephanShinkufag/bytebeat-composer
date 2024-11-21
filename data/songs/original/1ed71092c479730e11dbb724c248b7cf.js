//An attempt to cover "Noisy Pillars tune 1" by Jeroen Tel with terrible code
t%=3686400,
sr=48e3,
ur=50,
cc=(v)=>int(v/(sr/ur)),//Cycle with custom var
cl=cc(t),//Cycle
rt=sr/ur*6,//Length of a row in t
r=int(t/rt),//Row
lp=(n)=>2**((parseInt(n,36)+.4)/12),//Letter to pitch calculator
nn=cl%6==0,//New note
pp=int(r>383),//2nd part
pt=r>>6,
rp=(s,n)=>s.repeat(n),
sqr=(T,freq,pwm)=>(a=sr/freq,T%a<a*pwm),
saw=(T,freq)=>(a=sr/freq,T%a/a),
tri=(T,freq)=>(a=sr/freq,abs(T%a-a/2)/a*2),
noi=(T,freq)=>int(T/(sr/freq))**9%255/255,
o="0000000",

p0=(rp("IHFIHFIKMIFMIFMPNIFNIFNRPKHPKHPK",4)+rp("0",48)+"r0r0p0mk0i0kmkif"+rp("0",48)+"r0r0p0mp0r0u1011")[r%128+pp*128],nn&&p0!=0?(T0=0,e=lp(p0)):T0+=1,
p1=(rp("F00F00D0F00F0FHIB00B00B0D00D00E0",2)+"k0k0wk0ik0k0wuruk0kkwk0ikw0rruprf0f0rf0df0f0rpmpf0ffrf0dfr0mmpkm")[r%64+pp*64],nn&&p1!=0?(T1=0,f=lp(p1)*32):T1+=1,
p2="0912390992103021091239009192393309123910010231020912391001023133"[r%32+pp*32],nn&&p2!=9?(T2=0,i=p2):T2+=1,
p3=[rp((rp("rrrrr0ru0ut0r0p0",3)+"rry0w0uw0"+o),2),"r00m00r0u00t00r0n00r00n0k"+o+"m00r00m0i00r00i0h"+o+"d"+o+"i00h00d0f00a00f0i0f0i0km"+o+"0r00p00m0p00r00u0t000r000p"+o,"k"+o+o+"0i000k000f000d000f"+rp("0",31)+"k"+o+o+"0m000p000m000p000r"+rp("0",31)]["0001102222"[pt]][r%128],nn&&p3!=0?(T3=0,g=lp(p3)*(2**"0667708888"[pt])):T3+=1,
[
[noi(T1,1e5),sqr(T1,f,.2+T1/sr)][min(cc(T1),1)]*(64-(T1/1e3))+//Bass
sqr(t,e*64*"842"[cl%3],.5+T0/sr)*max(64-(T0/112),0)*"1000011111"[pt]+//Arps

[saw(T3,g),sqr(T3,g,[.1+T3/15e4,abs(.4-T3/5e4)]["0001100000"[pt]])][min(cc(T3),1)]*max(64-(T3/1400),0)*"0111101111"[pt]+//Lead

[noi(T2,1e9),[sqr(T2,lp("0OC000"[cc(T2)])*32,.5),tri(t,1244),tri(t,622),[sqr(T2,lp("0EC"[cc(T2)])*64,.5),noi(T2,2e4)][int(cc(T2)>3)]][i]][min(cc(T2),1)]*(72-min(64,(T2/128))),//Drums

(sq=(f)=>[noi(T0,1e5),sqr(T0,lp(f)*64,.1+T0/4e4)][min(cc(T0),1)]*48,sq("f")+sq("r")+sq("m"))
]
["0000000101"[pt]*(rp("0",124)+"1111")[r%128]]