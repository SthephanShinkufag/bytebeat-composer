height=256,

main=(x,y)=>{
  let zigzag = x*2%512;
  zigzag = min(zigzag, 511-zigzag);
  return abs(zigzag-y)<10?255:0;
},

main((t/height)%(height*256*4),255-t*(256/height)%256)