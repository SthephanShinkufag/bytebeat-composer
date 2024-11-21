// "Depp" - bytebeat cover
// TrashImpossible3699 MMXXIV
// the worst cover i've ever had in my life
// this is also an attempt of covering "Depp" by an unknown composer. i don't know who that is but let me cover up the whole song, enjoy!
// https://keithclark.github.io/ZzFXM/
// ^_^
 
s=1870,
tune=x=>pow(2,x/12),
noise=x=>(z=1e5,sin(x*3.14*z*z*z)*z),
dec=x=>(-int(t*x/s)&255),
song=[
 [3,3,15,3,3,15,3,3,15,3,3,15,3,3,15,15],
 [13,,,,,,,,,,,,,,16,,15,,,,,,,,,,,,16,15,13,,],
 [2,,,,,,,,,,,,,,2,,2,,,,,,,,,,,,2,2,2,,],
 [3,,1,,3,3,2,,1,,3,3,3,,1,,2,2,1,,2,2,1,,1,,3,3,3,,1,,],
 [
  2,,,2,,,2,,,
  ,,,,,,,2,,,2,,,2
  ,,,,2,2,2,2,2,2
 ],
 [
  5,5,17,5,5,18,5,5,
  17,5,5,18,5,5,17,17,
  5,5,17,5,5,17,5,5,18,
  5,5,17,5,5,18,18
 ],
 [
  4,2,3,3,1,3,2,3,
  4,2,3,3,1,3,1,1,
  4,2,3,3,1,3,2,3,
  4,2,3,3,1,1,1,1
 ],
 [
  3,3,15,3,3,15,3,3,15,3,3,15,3,3,15,15,
  3,3,15,3,3,15,3,3,15,3,3,15,3,3,15,15,
  -1,-1,11,-1,-1,11,-1,-1,11,-1,-1,11,-1,-1,11,11,
  -1,-1,11,-1,-1,11,-1,-1,11,-1,-1,11,-1,-1,11,11
 ],
 [
  3,-3,8,-3,-3,8,-3,-3,8,-3,-3,8,-3,-3,8,8,
  -3,-3,8,-3,-3,8,-3,-3,8,-3,-3,8,-3,-3,8,8,
  -1,-1,11,-1,-1,11,-1,-1,11,-1,-1,11,-1,-1,11,11,
  1,1,13,1,1,13,1,1,13,1,1,13,1,1,13,13
 ]
],
b1it=song[0][(int(t/s))%song[0].length],
lit=song[1][(int(t/2/s))%song[1].length],
n1it=song[2][(int(t/2/s))%song[2].length],
n2it=song[3][(int(t/s))%song[3].length],
n3it=song[4][(int(t/s))%song[4].length],
b2it=song[5][(int(t/s))%song[5].length],
n4it=song[6][(int(t/s))%song[6].length],
b3cit1=song[7][(int(t/s))%song[7].length],
b3cit2=song[8][(int(t/s))%song[8].length],
blp=(int(t*4/s)&3?0:0.8*2),
patA=((t/4*tune(b1it)&32)*dec(64*4)>>8)+(((t/2*tune(lit)&78)/1.5+((noise(t>>n1it)*n1it)&63)/1.5)*dec(32*4)>>8),
patB=patA+(((noise(t>>n2it)*n2it)&31)*dec(64*4)>>8),
patC=((t/4*tune(b1it)&32)*dec(64*4)>>8)+(((noise(t>>n3it)*n3it)&31)*dec(64*4)>>8),
patD=((t/4*tune(b2it)&32)*dec(64*4)>>8)+(((noise(t>>n4it)*n4it)&31)*dec(64*4)>>8),
patE=((t/4*tune(b3cit1)&32)*dec(64*4)>>8)+(((noise(t>>n4it)*n4it)&31)*dec(64*4)>>8)+(t/2*blp&16),
patF=((t/4*tune(b3cit2)&32)*dec(64*4)>>8)+(((noise(t>>n4it)*n4it)&31)*dec(64*4)>>8)+(t/2*blp&16),

seq=[
  patA,
  patA,
  patB,
  patB,
  patB,
  patB,
  patC,
  patD,
  patE,
  patE,
  patF,
  patF,
  patF,
  patF,
],

(seq[(int(t/32/s))%seq.length])*1.7