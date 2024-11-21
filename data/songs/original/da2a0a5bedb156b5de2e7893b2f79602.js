function callib(i){return ((i)%255)/127-1} 												//byte -> float
gen = Array(1000);for(var i=0;i<gen.length;i++){gen[i] = round(random()*3);}	//noise gen
// Klöffenklain beat pattern
bk =[1,0,0,0,3,0,0,0,1,3,0,0,3,1,1,1]; //first channel 
bk2=[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]; //second channel expand
f = 0;
f2 = 0;
return function (time, sampleRate) {
t = Math.round(time*sampleRate/(44100/22050)); // translated from 22.05kHz

if(bk[(t>>12)%bk.length]==1){ // first channel 
	f = (t/2&128)&5e5/(t&4095);
} else if (bk[(t>>12)%bk.length]==2){
	//f = Math.random()*255*(255/(t%(2**12)));
	f = gen[(t*4)%255]*64*(255/(t%(2**12)));
} else if (!bk[(t>>12)%bk.length]){
   f = 0;
} else if (bk[(t>>12)%bk.length]==3){
   f = gen[(t>>1)%255]*64;
}

if(bk2[(t>>12)%bk2.length]==1){ // second channel 
	f2 = (t/2&128)&5e5/(t&4095);
} else if (bk2[(t>>12)%bk2.length]==2){
	//f = Math.random()*255*(255/(t%(2**12)));
	f2 = gen[(t*4)%255]*64*(255/(t%(2**12)));
} else if (!bk2[(t>>12)%bk2.length]){
   f2 = 0;
} else if (bk2[(t>>12)%bk2.length]==3){
   f2 = gen[(t>>1)%255]*64;
}

return callib(f+f2);
}