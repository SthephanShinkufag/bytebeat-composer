function dsp(t) {

var S='1000101010001000000010001000001010000000100010000010100010001010'[t*8&63];

var m='48266486'[t*2&7];

var SC=(S==0?1:t*8%1)**2;

var a=t*PI*[98,103.825][t/4&1];

return(

(

min(max(

	(sin(pow(t*4%1-1,20)*PI*8)*S+
	 
	 sin(t*9E8|t*2E8)/((t+1)/2%1)/200+
	 
	 sin(t*12E6|t*12E4)/2/((t+1)/2%1)/200+
	 
	 sin(t*3E3|t*9E3)/((t+1.25)/4%1)/5E3)*4,
	
	-1),1)+

min(max(
	
	(sin(a)/2+
	 
	 sin(t*13.5*9E8|t*500*9E8)/((t+1)/2%1)/1E3+

	 sin(t*2E8|t*1E4)/((t+2.25)/2%1)/1E3+

	 tan(sin(a*32/((t*8&5)+2)))/(t*4%1)/500+

	 tan(sin(a*32/((t*8&1)+1)))/(t*8*((t&1)+1)%1)/100+

	 sign(sin(a*128/((t*8&3)+1)))/(t*8%1)/400+

	 sin(sin(a*128/((t*8&3)+1)))/(t*8%1)/300+

	 sin(sin(a)*sin(t*PI*4)*5)/8+

	 sin(sin(a)*sin(t*8*PI*(1-(t*8*('11122242'[t*4&7])&1)))*16)/2+

	 (sin(sin(abs(sin(a*m)*2+sin(a*5)*3))*16)/2*sin(t*PI*m)+

	 sin(sin(abs(sin(a*5)*m*2+sin(a*3)*3))*16)/2*sin(t*PI*m)+
	 
	 sin(sin(abs(sin(a*5)*2+sin(a*m)))*12)/2*sin(t*PI*m))/2)*SC,
	
	-1),1))

)};

return dsp;