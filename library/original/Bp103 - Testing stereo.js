//global variables.
sr=t/44100,tune=220,sh=int(sr/8)%2,

//the music
nshift=[8,4+sh,12,16+sh,12*(int((sr*16)%2)+1),(7+sh)*(int((sr*8)%2)+1),7],
chord=[0,4+sh,7+sh,nshift[int((sr/2)%7)]],

main();

function main(){
	sounds=[];
	//left
	sounds[0] = square(N2N(chord[0]   ),000,13,4,8,0,-3) + 
					square(N2N(chord[1]+12),000,13,5,8,0, 0) + 
					(square(N2N(chord[3]+12),000,13,2,10,-2, sin(sr*33)*0.0005) %
					saw(    N2N(chord[3]   ),000,20,8,10, 3, sin(sr*30)*0.0005));
	//right
	sounds[1] = saw(   N2N(chord[0]   ),180,13,8,8,1, 3) + 
					square(N2N(chord[2]+12),180,13,7,8,0, 0) + 
					(square(N2N(chord[3]+12),000,13, 3,8,0, 3) &
					saw(    N2N(chord[3]   ),180,20,12,8,6,-3));
	return sounds;
}
function square(note,offset,volume,lfo,lfoPhase,phase,detune){
	return (((phase+sr)*(note+detune))&1)*LFO(lfo,volume,lfoPhase,offset);
}
function saw(note,offset,volume,lfo,lfoPhase,phase,detune){
	return (((phase+sr)*(note+detune))%1)*LFO(lfo,volume,lfoPhase,offset);
}
function LFO(lfo,volume,lfoPhase,offset){
	return ((sin((sr*lfo)+offset)*volume)+volume)+lfoPhase;
}
function N2N(noteOffset){	//Number to Notes
	r=pow(2,1.0/12);
	noffset=r;
	for(i=0;i<noteOffset;i++)noffset*=r;
	return tune*noffset;
}