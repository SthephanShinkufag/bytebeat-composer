time = t / 44000,
fract = function(x) {
  return x % 1
},
mod = function(a, b) {
  return a % b;
},
tri = function(x) {
  return asin(sin(x)) / (PI / 2.)
},
noise = function(x) {
  return sin((x + 10) * sin(pow((x + 10), fract(x) + 10)));
},
main = function(x) {
  s = 0;
  for (i = 0; i < 10; i++) {
    s += tri(time * (1000 + i + (mod(floor((time + (i * .02)) * 8), 16) * (250 + (i * 3)))));
  }
  s /= 9;
  s += sin(time * 250) * .5;
  s += sin(pow(1 - fract(time * 2), 10) * 100);
  s += noise(time) * (1 - pow(fract(time * 8), .2 + (.2 * (mod(time, 4) < .5)))) * .5;
  return s * .7;
},
main(time)