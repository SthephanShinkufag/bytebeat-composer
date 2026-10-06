r = 1024,
ce = function(a,j) {
  output = 0
  for (i = 0; i <= j; i++) {
    output += a(t - i * r)
  };
  return output / (j * 5)
},
wave=x=>asin(sin(x*PI/128)),
a = t => 64*wave(t*(t>>14&t)),
ce(a,16)*5