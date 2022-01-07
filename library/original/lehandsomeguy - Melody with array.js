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
main=function(time) {
	speed = 1.5;
	pitch = 0;
	melody_notes = [
[0,4,7,4,0,4,7,4,-1,4,7,4,-1,4,7,9],
[-12,-8,-12,-8,-12,-8,-12,-8,-13,-8,-13,-8,-13,-8,-13,-8],
[12+12,11+12,9+12,7+12,4+12,9+12,11+12,14+12]
];
	melody = 0;
	for (i = 0; i < melody_notes.length; i++) {
		melody_tune = pow(pow(2,1/12),(melody_notes[i][floor(time*speed)%melody_notes[i].length]+pitch)-49)*44000;
		melody += sin(time*melody_tune)*(1-fract(time*speed));
	}
	return (melody/melody_notes.length);
}
,
main(time);