time = t/44100,
PI = 3.14159265358979323,
fract=function(x) {
    return x%1
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
noise=function(x) {
    return sin((x+10)*sin(pow((x+10),fract(x)+10)));
},
main=function(x) {
	s = 0;
	for (i = 0; i < 10; i++) {
	s += tri(time*(1000+i+(mod(floor((time+(i*.02))*8),16)*(250+(i*3)))));
	}
	s /= 9;
	s += sin(time*250)*.5;
	s += sin(pow(1-fract(time*2),10)*100);
	s += noise(time)*(1-pow(fract(time*8),.2+(.2*(mod(time,4)<.5))))*.5;
	return s*.7;
}
,
main(time);