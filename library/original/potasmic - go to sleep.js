
/*!
 *
 * potasmic - go to sleep
 *
 */

return function dsp(t) {
  var s = 0;
  var feedback = 0.4;
  var p = [0.737,0.415,0.322,0.17];
  for(i=0; i<Math.PI;i+=Math.PI/7) 
  {
   _t = t < Math.PI? t : t-i;
    s+= 0.3 * Math.sin(2 * Math.PI * _t * (440 + 440*((i/0.75)%4))*p[Math.round(_t/Math.PI/2)%p.length] ) * Math.exp(0.01-_t%Math.PI/4*4) * (feedback-(i/4)*feedback);
  }
  return s;
}
