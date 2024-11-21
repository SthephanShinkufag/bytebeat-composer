t||(
height=16,
width=height*4,
buffer=[],
clearBuffer=()=>{buffer.length=0;for(i=0;i<height;i++)buffer.push(Array(width).fill(0));},
setPixel=(x,y,v)=>{buffer[y][x] = parseInt(v)},
drawLine=(t,a,e,s,n)=>{if(!n)return;r=abs(e-t),i=abs(s-a),o=t<e?1:-1,b=a<s?1:-1;let c=r-i;for(;setPixel(t,a,n),t!==e||a!==s;){const e=2*c;e>-i&&(c-=i,t+=o),e<r&&(c+=r,a+=b)}},
drawRect=((a,d,e,r,w)=>{drawLine(a,d,e,d,w),drawLine(e,d,e,r,w),drawLine(a,d,a,r,w),drawLine(a,r,e,r,w)}),
drawRect2=((a,d,e,r,w)=>{drawLine(a,d,a+e,d,w),drawLine(a+e,d,a+e,d+r,w),drawLine(a,d,a,d+r,w),drawLine(a,d+r,a+e,d+r,w)}),
font={A:'010101111101',B:'110110101111',C:'011100100011',D:'110101101110',E:'111100111111',F:'111100111100',G:'111100101111',H:'101101111101',I:'1111',J:'001001101010',K:'101110101101',L:'100100100111',M:'10001110111010110001',N:'1001110110111001',O:'111101101111',P:'110101110100',Q:'010101101011',R:'110101110101',S:'011110001110',T:'111010010010',U:'101101101111',V:'101101101010',W:'10001101011101110001',X:'101010010101',Y:'101010010010',Z:'111001010111',0:'010101101010',1:'01110101',2:'110001010111',3:'110001111110',4:'011101111001',5:'11100111',6:'011100111010',7:'111001010010',8:'010101010111',9:'010111001110','!':'1101','"':'101101000000','\'':'1100','(':'01101001',')':'10010110','*':'01110000','+':'010111010000',',':'00000011','-':'000111000000','.':'0001','/':'001010010100',':':'1001',';':'10000011','=':'111000111000','?':'110001000010','[':'11101011',']':'11010111','\\':'100010010001','^':'010101000000','_':'000000000111','`':'10010000','{':'011110110011','}':'110011011110','|':'1111','~':'0000010110100000'},
drawText=(e,l,t,n)=>{let f=0;for(let g=0;g<t.length;g++){let h=font[t[g]];if(h){for(let t=0;t<h.length;t++)1==h[t]&&setPixel(t%(h.length/4)+f+e,floor(t/(h.length/4))+l,n);f+=h.length/4+1}else f++}},
clearBuffer()
),
frame=floor(t/(height*1024)),
t%(height*1024)==0?(()=>{
	// put your rendering stuff in here
	clearBuffer();
	if(frame < 5) drawText(22,6,"HELLO!",255);
	else if(frame < 15) {
		drawText(12,1,"THIS IS A TEST",255);
		drawText(6,6,"OF THE DRAWTEXT",255);
		drawText(16,11,"FUNCTION.",255);
	}
	else if(frame < 25) {
		drawText(6,3,"THIS FONT IS NOT",255);
		drawText(6,9,"MONOSPACE!",255);
	}
	else if(frame < 40) {
		drawText(12,6,"TAKE A LOOK!",max(255-max(frame-25,0)*20,0));
	} else {
		if(frame%20 < 10) {
			drawText(0,1,"ABCDEFGHIJKLMNOP",255);
			drawText(0,6,"QRSTUVWXYZ012345",255);
			drawText(0,11,"6789!\"'()*+,-./:;=?",255);
		} else {
			drawText(0,1,"[]\\^_`{}|~",255);
		}
	}
})():0,
buffer[t%height][(t>>8)%width]