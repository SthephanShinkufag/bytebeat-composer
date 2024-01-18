t||(
height=16,
width=height*4,
buffer=[],
clearBuffer=()=>{buffer.length=0;for(i=0;i<height;i++)buffer.push(Array(width).fill(0));},
setPixel=(x,y,v)=>{buffer[y][x] = parseInt(v)},
drawLine=(t,a,e,s,n)=>{if(!n)return;r=abs(e-t),i=abs(s-a),o=t<e?1:-1,b=a<s?1:-1;let c=r-i;for(;setPixel(t,a,n),t!==e||a!==s;){const e=2*c;e>-i&&(c-=i,t+=o),e<r&&(c+=r,a+=b)}},
drawRect=((a,d,e,r,w)=>{drawLine(a,d,e,d,w),drawLine(e,d,e,r,w),drawLine(a,d,a,r,w),drawLine(a,r,e,r,w)}),
drawRect2=((a,d,e,r,w)=>{drawLine(a,d,a+e,d,w),drawLine(a+e,d,a+e,d+r,w),drawLine(a,d,a,d+r,w),drawLine(a,d+r,a+e,d+r,w)}),
clearBuffer()
),
dg=PI/180,
frame=floor(t/(height*1024)),
centerX=width/2,
centerY=height/2,
size=9,
dist=4,
offsetX=-3,
offsetY=2,
angle=frame*dg*10,
t%(height*1024)==0?(()=>{
	// put your rendering stuff in here
	clearBuffer();
	drawRect2(floor(centerX-size/2)+dist+offsetX,floor(centerY-size/2)-dist+offsetY,size,size,64);
	drawLine(floor(centerX-size/2)+offsetX,floor(centerY-size/2)+offsetY,floor(centerX-size/2)+dist+offsetX,floor(centerY-size/2)-dist+offsetY,192);
	drawLine(floor(centerX-size/2)+size+offsetX,floor(centerY-size/2)+offsetY,floor(centerX-size/2)+size+dist+offsetX,floor(centerY-size/2)-dist+offsetY,192);
	drawLine(floor(centerX-size/2)+size+offsetX,floor(centerY-size/2)+size+offsetY,floor(centerX-size/2)+size+dist+offsetX,floor(centerY-size/2)+size-dist+offsetY,192);
	drawRect2(floor(centerX-size/2)+offsetX,floor(centerY-size/2)+offsetY,size,size,255);
})():0,
buffer[t%height][(t>>8)%width]