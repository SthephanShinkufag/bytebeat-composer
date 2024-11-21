time = t/32000,
PI = 3.14159265358979323,
fract=function(x) {
    return x%1
},
mix=function(a,b,c) {
    return (a*(1-c))+(b*c)
},
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
melodytest=function(time) {
	melody_string = "5789357857893572";
	melody = 0;
	for (var i = 0; i < 5; i++) {
	melody += tri(time*mix(200+(i*900),600+(i*900),(melody_string.charAt(floor(time*2)%melody_string.length))/9))*(1-fract(time*4));
	}
	return melody;
}
,
hihat = noise(time)*pow(1-fract(time*4),4),
kick = sin(pow(1-fract(time*2),5)*100),
snare = noise(floor(time*9000)/9000)*pow(1-fract(time+.5),6),
melody = melodytest(time)*pow(fract(time*2),2)*2,
(hihat+kick+snare+melody)/4