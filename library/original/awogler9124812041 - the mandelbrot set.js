t||(
height=256,
width=height*4,
buffer=[],
clearBuffer=()=>{buffer.length=0;for(i=0;i<height;i++)buffer.push(Array(width).fill(0));},
setPixel=(x,y,v)=>{buffer[y][x] = parseInt(v)},
drawLine=(t,a,e,s,n)=>{if(!n)return;r=abs(e-t),i=abs(s-a),o=t<e?1:-1,b=a<s?1:-1;let c=r-i;for(;setPixel(t,a,n),t!==e||a!==s;){const e=2*c;e>-i&&(c-=i,t+=o),e<r&&(c+=r,a+=b)}},
drawRect=((a,d,e,r,w)=>{drawLine(a,d,e,d,w),drawLine(e,d,e,r,w),drawLine(a,d,a,r,w),drawLine(a,r,e,r,w)}),
drawRect2=((a,d,e,r,w)=>{drawLine(a,d,a+e,d,w),drawLine(a+e,d,a+e,d+r,w),drawLine(a,d,a,d+r,w),drawLine(a,d+r,a+e,d+r,w)}),
clearBuffer()
),
ZOOM=128,
MAX_ITER=100,
t==0?(()=>{
	// put your rendering stuff in here
	clearBuffer();
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			zx = 0, zy = 0, cx = (x - floor(width / 2) - 96) / ZOOM, cy = (y - floor(height / 2)) / ZOOM, i = 0;
			for(;i < MAX_ITER; i++) {
				if(zx*zx + zy*zy > 4) break;
				tmp = zx * zx - zy * zy + cx
				zy = 2 * zx * zy + cy
				zx = tmp
			}
			if(i) setPixel(x,y,i/MAX_ITER*255);
		}
	}
})():0,
buffer[t%height][(t>>8)%width]