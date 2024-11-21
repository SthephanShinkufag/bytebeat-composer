time = (t/32000),
PI = 3.14159265358979323,
fract=function(x) {
    return ((x%1)+1)%1;
},
mod=function(a,b) {
    return ((a%b)+b)%b;
},
mix=function(a,b,c) {
    return (a*(1-c))+(b*c)
},
clamp=function(a,b,c) {
    return max(min(a,c),b);
},
tri=function(x) {
    return asin(sin(x))/(PI/2.)
},
pulse=function(x) {
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
floattobyte=function(x) {
    return (clamp(x,-.9999,.9999)*128)+128
}
,
a = noise(time)*pow(1-fract(time*8),4)*.25,
a += sin(pow(1-fract(time*2),10)*100),
a /= 3,
floattobyte(a)