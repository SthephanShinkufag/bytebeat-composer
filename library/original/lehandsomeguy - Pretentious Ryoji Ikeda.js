time = t/32000,
PI = 3.14159265358979323,
fract=function(x) {
    return ((x%1)+1)%1;
},
mix=function(a,b,c) {
    return (a*(1-c))+(b*c)
},
mod=function(a,b) {
    return a%b;
}
,
clamp=function(a,b,c) {
    return max(min(a,c),b);
}
,
tri=function(x) {
    return asin(sin(x))/(PI/2.)
},
puls=function(x) {
    return (floor(sin(x))+0.5)*2.;
},
saw=function(x) {
    return (fract((x/2.)/PI)-0.5)*2.;
},
hash=function(x) {
    return fract(sin(x*1342.874+sin(5212.42*x))*414.23);
},
noise=function(x) {
    return sin((x+10)*sin(pow((x+10),fract(x)+10)));
},
music1=function(time) {
	time *= .93+((sin(time)*.01)/time);
	a = sin(time*99000)*pow(1-fract(time*.5),100);
	a += sin(time*300)*[1,1,0,0,1,0,0,0,1][floor(time)%9]*.5;
	a += sin(time*200)*[0,0,0,0,0,0,1,1][floor(time)%8]*.5;
	a += puls(time*80000)*[1,1,0,0,1,0,0,0,1][floor(time*2)%9]*pow(1-fract(time*8),90);
	a += puls(time*80000)*[0,0,1,1,0,0,1,1,0,0,1,1,0,0,1][floor(time*2)%15]*pow(1-fract(time*16),90);
	for(i = 0; i<5; i++) {
	a += sin(time*(200+((1+hash(i+.3+floor(time*.25)))*1100)))*.02;
	}
	a += sin(pow(1-fract(time*32),5)*20)*[0,0,1,1,0,0,0,0,0,1,0,0,0,1,0,0][floor(time*4)%16]*.06;
	a += (sin(time*9000)+sin(time*9060))*pow(1-fract(time*.125),100)*.2;
	return a*.8;
}
,
main=function(x) {
	return music1(time);
},
main(time);