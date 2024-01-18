PS=0,NS=1,LN=2,DS=3,WT=4,
// "tn|WF|vl|DT"

speed = 11,
/*
CH1        CH2        CH3        */
d = [
'30|00|0f','00|00|00','00|00|00',
'30|00|0a','00|00|00','00|00|00',
'30|00|06','00|00|00','00|00|00',
'30|00|00','00|00|00','00|00|00',

'30|00|00','80|00|04','90|00|02',
'30|00|00','80|00|02','90|00|04',
'30|00|00','80|00|04','90|00|02',
'30|00|00','80|00|02','90|00|04',

'60|00|0f','00|00|00','00|00|00',
'60|00|0a','00|00|00','00|00|00',
'60|00|06','00|00|00','00|00|00',
'60|00|00','00|00|00','00|00|00',

'30|00|00','80|00|04','90|00|02',
'30|00|00','80|00|02','90|00|04',
'30|00|00','90|00|04','a0|00|02',
'30|00|00','90|00|02','a0|00|04',


],


chip(
[
parseInt(d[((t>>speed)%(d.length/3))*3].split("|")[0],16),
parseInt(d[((t>>speed)%(d.length/3))*3].split("|")[1],16),
parseInt(d[((t>>speed)%(d.length/3))*3].split("|")[2],16),
parseInt(d[((t>>speed)%(d.length/3))*3].split("|")[3],16),
],[
parseInt(d[((t>>speed)%(d.length/3))*3+1].split("|")[0],16),
parseInt(d[((t>>speed)%(d.length/3))*3+1].split("|")[1],16),
parseInt(d[((t>>speed)%(d.length/3))*3+1].split("|")[2],16),
parseInt(d[((t>>speed)%(d.length/3))*3+1].split("|")[3],16)
],[
parseInt(d[((t>>speed)%(d.length/3))*3+2].split("|")[0],16),
parseInt(d[((t>>speed)%(d.length/3))*3+2].split("|")[1],16),
parseInt(d[((t>>speed)%(d.length/3))*3+2].split("|")[2],16),
parseInt(d[((t>>speed)%(d.length/3))*3+2].split("|")[3],16)
]
);

function chip(TaCS1,TaCS2,TaCS3){

	

	// INIT

	//clk = t/256/111.2; // 1.78mHz
	clk = t/256; // 16kHz


	outch1 = 0;
	outch2 = 0;
	outch3 = 0;

	TaCS1[0]%=256;
	TaCS2[0]%=256;
	TaCS3[0]%=256;


	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // TaCS1 CH	


	// TaCS - Tone and Channel Settings

	if(TaCS1[1]==0) { 				// Clear Sq Wave

		outch1 = ((clk * round(TaCS1[0]))/16&1)*TaCS1[2];

	} else if (TaCS1[1]==1) { 		// Noise

		outch1 = (sin((clk*256)>>TaCS1[0])*28402&1)*TaCS1[2];

	} else if (TaCS1[1]==2) { 		// Pseudo-LFSR 2-bit Noise

		((clk*256)%(256-TaCS1[0]))==2?eval("this.r = random()"):0;
		outch1 = (r*4&3)*(TaCS1[2]%5);

	} else if(TaCS1[1]==3) { 		// Duty Sq Wave

		outch1 = 
			(((clk * round(TaCS1[0]))/16&1) ^
			(((clk + round(TaCS1[3])/64) * 
			round(TaCS1[0]))/16&1))*TaCS1[2];

	} else if(TaCS1[1]==4) { 		// Wavetable (16 bytes, 3 bit depth)

			outch1 = parseInt(TaCS1[4][(round(clk*round(TaCS1[0])))%16],8)*TaCS1[2]/16;

	} 
	
	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // TaCS2 CH	

	if(TaCS2[1]==0) { 				// Clear Sq Wave

		outch2 = ((clk * round(TaCS2[0]))/16&1)*TaCS2[2];

	} else if (TaCS2[1]==1) { 		// Noise

		outch2 = (sin((clk*256)>>TaCS2[0])*28402&1)*TaCS2[2];

	} else if (TaCS2[1]==2) { 		// Pseudo-LFSR 2-bit Noise

		((clk*256)%(256-TaCS2[0]))==2?eval("this.r = random()"):0;
		outch2 = (r*4&3)*(TaCS2[2]%5);

	} else if(TaCS2[1]==3) { 		// Duty Sq Wave

		outch2 = 
			(((clk * round(TaCS2[0]))/16&1) ^
			(((clk + round(TaCS2[3])/64) * 
			round(TaCS2[0]))/16&1))*TaCS2[2];

	} else if(TaCS2[1]==4) { 		// Tabled Waveform (16 bytes, 3 bit depth)

			outch2 = parseInt(TaCS2[4][(round(clk*round(TaCS2[0])))%16],8)*TaCS2[2]/16;

	} 

	// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // TaCS3 CH	

	if(TaCS3[1]==0) { 				// Clear Sq Wave

		outch3 = ((clk * round(TaCS3[0]))/16&1)*TaCS3[2];

	} else if (TaCS3[1]==1) { 		// Noise

		outch3 = (sin((clk*256)>>TaCS3[0])*28402&1)*TaCS3[2];

	} else if (TaCS3[1]==2) { 		// Pseudo-LFSR 2-bit Noise

		((clk*256)%(256-TaCS3[0]))==2?eval("this.r = random()"):0;
		outch3 = (r*4&3)*(TaCS3[2]%5);

	} else if(TaCS3[1]==3) { 		// Duty Sq Wave

		outch3 = 
			(((clk * round(TaCS3[0]))/16&1) ^
			(((clk + round(TaCS3[3])/64) * 
			round(TaCS3[0]))/16&1))*TaCS3[2];

	} else if(TaCS3[1]==4) { 		// Tabled Waveform (16 bytes, 3 bit depth)

			outch3 = parseInt(TaCS3[4][(round(clk*round(TaCS3[0])))%16],8)*TaCS3[2]/16;

	} 



	// POST

	outch1 &= 15;
	outch1 *= 16;
	
	outch2 &= 31;
	outch2 *= 32;

	outch3 &= 31;
	outch3 *= 32;

	if((outch1+outch2+outch3>255 )){
		throw `the output is higher than 255 (${outch1+outch2+outch3}>255)`;
	}
   /*if(t%(2**speed)==0){
      throw `
| ${d[((t>>speed)-2)%d.length]}
| ${d[((t>>speed)-1)%d.length]}
>-${d[(t>>speed)%d.length]}-
| ${d[1+((t>>speed)%d.length)]}
| ${d[2+((t>>speed)%d.length)]}
| ${d[3+((t>>speed)%d.length)]}
| ${d[4+((t>>speed)%d.length)]}`
   }*/

	// AOUT

	return [round(outch1+outch2),round(outch1+outch3)];
}