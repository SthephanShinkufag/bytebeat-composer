t/=4.35,
t||(fx=Array(50).fill(0)), // initialize memory for the effects
fxi=0, // iterates over the fx array

lp=(inp,w,res=0)=>{fx[fxi]+=fx[fxi+1]+=(inp-fx[fxi])*w-fx[fxi+1]*(1-res);fxi+=2;return fx[fxi-2]}, // lowpass
hp=(inp,w,res=0)=>{return inp-lp(inp,w,res)}, // highpass
e=(a,b,c)=>(1-(a*b<1?a*b:1))**c, // envelope

aS = (x,y,mult=1) => [(x[0]+y[0])*mult,(x[1]+y[1])*mult], // add 2 stereo inputs together with a multiplier
aS2 = (x,y,mult=1) => [(x[0]+y)*mult,(x[1]+y)*mult], // same as above, but y is not stereo
fS = (x,func,...args) => [func(x[0],...args),func(x[1],...args)], // lets you use effects on stereo inputs

B=t%8192/48e3,
u="037a58cf37ae27ac",

a=t=>t>0&&tanh(tan(t/2**15*PI+asin(sin(t/11*(2**(("0x"+u[t>>11&3^t>>13&12])/12))))))/6,
b=v=>tanh(sin(sin(t/v*(2**(("0x"+u[t>>13&12])/12)))*(1.5-t/2**15%1)*2)*2)/4,

k=atan(sin(cbrt(t%8192)*9)*2)*e(B,10,2)*(~t>>13&1),
h=hp(sin(t**7),.8,.7)/4*e(t%2048/48e3,(t>>11&3)==2?15:40,3),
s=atan(sin(cbrt(t%8192)*12)*e(B,40,.5)*1.7+lp(sin(t**7),.5,.4)*2*(e(B,160,3)/3+e(B,20,2)*min(B*60,1)**1.5))*(t>>13&1),
l=(c,n)=>tanh(tan(c/11*(2**(("0x"+"07535357"[t>>12&7^t>>15&3]-n)/12))+sin(t/300)/4)*(.1+t/2**15%1))/3,

V = min(1,t/4096%2),
arp = [a(t)+a(t-4096)/2+a(t-12288)/4,a(t)+a(t-8192)/2+a(t-16384)/4],
bas = [b(44)+b(21.9),b(43.9)+b(22)],
lead = [l(t,G=t>>17&1?5:0)-l(t+sin(t*PI/2**15)*16,G),l(t,G)-l(t-sin(t*PI/2**15)*16,G)],

[
	fS(aS(arp,bas),hp,1-t/2**17%1),
	aS2(aS(arp,bas,V),s+k+h),
	aS2(aS(arp,bas,V),s+k+h),
	aS2(aS(aS(arp,lead),bas,V),s+k+h),
	aS2(aS(aS(arp,lead),bas,V),s+k+h),
	aS2(aS(arp,bas,V),s+k),
	fS(aS2(aS(arp,bas,V),s+k),lp,1-t/2**17%1),
][t>>17]