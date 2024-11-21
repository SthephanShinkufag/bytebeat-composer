time = t/44100,
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
	speed = 2;
	pitch = 0;
	melody_notes = [
[2,4,5,9,2,4,5,9,-2,4,5,9,-2,4,5,9],
[-10,-10,-10,-10,-10,-10,-10,-10,-14,-14,-14,-14,-14,-14,-12,-12],
[-22,-19,-22,-19,-22,-19,-22,-19,-26,-22,-26,-22,-26,-22,-24,-20]
];
	melody = 0;
	for (i = 0; i < melody_notes.length; i++) {
		melody_tune = pow(pow(2,1/12),(melody_notes[i][floor(time*speed)%melody_notes[i].length]+pitch)-49)*44000;
		melody += puls(time*melody_tune)*(1-fract(time*speed));
	}
	return (melody/melody_notes.length);
}
,
main(time);