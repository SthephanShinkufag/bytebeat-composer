t||(
height=2,
width=height*4,
buffer=[],
clearBuffer=()=>{buffer.length=0;for(i=0;i<height;i++)buffer.push(Array(width).fill(0));},
clearBuffer()),
frame=floor(t/(height*1024)),
setPixel=(x,y,v)=>{buffer[y][x] = parseInt(v)},

anim=[0,1,2,3,4,5,6,7,7,6,5,4,3,2,1,0],
t%(height*1024)==0?(()=>{
	// put your rendering stuff in here
	clearBuffer();
	setPixel(anim[t>>12&15],t>>15&1,anim[t>>11&15]*36.428571428571428571428571428571);
})():0,
buffer[t%height][(t>>8)%width]