//Coded By Bp103

main(44100);

function main(sr){

	// Set this to 1 if "throw" statement kills sound (HTML5 Bytebeat fix).
	fail_safe = 0;

	if(fail_safe){ // "We have #ifdef at home!" #ifdef at home...
		var displayMan = {yeet:function(){return 0;}};
	}else{
		var displayMan = {yeet:function(){throw display;}};
	}

	if(t==0){	// global arrays.
		f = new Array(4).fill(0);
		retrigDrum = new Array(100).fill(0);
		retrigSynth = new Array(100).fill(0);
		drum = new Array(100).fill(0);
		noise = new Array(1000).fill(0).map(() => {return (random()*2)-1;});
	}
	
	display="\n";

	bpm = 160;
	keyShift = (((t/sr)*(bpm/3840))%2)<1?-3:0;
	keytime = int(((t/sr)*(bpm/3840)%2)*100)%100;
	genTempo = int((t/sr)*(bpm/15));
	display += "Hype man: "+((keytime<98)?((genTempo%4==0)?"🙆‍♂️":"🤷‍♂️"):((genTempo%2==0)?"🙋‍♂️":"💁‍♂️"))+"\n";
	display += "Key shift: "+keyShift+" ⬅ "+((keytime<95)?((keytime%15)?"😺":"😸"):"🙀")+"%"+keytime+"\n";
	var drm = drumSynth(sr,1.2)/1.2;
	display+="\n";
	var syn = synth(sr,keyShift)/1.5;

	if(((t%512)==0))displayMan.yeet();

	return (syn + drm);
}

function drumSynth(sr,pitch){
	if(!pitch)pitch=0;
	var q=t/sr;
	var out=0;
	
	//Must use drum off command, its like midi.
	var _ = 0;	//drum off
	var X = 1;	//drum normal
	var L = 1.3;//drum low
	var H = 0.8;//drum high

	seq= [[L,_,_,_, _,_,_,_, _,_,_,_ ,L,_,_,_,  _,_,_,_, _,_,_,_, L,_,_,_ ,L,_,_,_,	//Kick
			 L,_,_,_, L,_,_,_, L,_,_,_ ,_,_,_,_,  _,_,_,_, L,_,_,_, _,_,_,_ ,H,_,X,_],

			[_,_,_,_, _,_,_,_, _,_,_,_ ,_,_,_,_,  H,H,X,X, _,_,_,_, _,_,_,_ ,_,_,_,_,	//Snare
			 _,_,_,_, _,_,_,_, _,_,_,_ ,_,_,_,_,  H,H,X,X, _,_,_,_, _,_,_,_ ,_,_,_,_],

			[X,_,_,_, X,_,_,_, X,_,_,_ ,X,_,_,_,  X,_,_,_, X,_,X,_, X,_,X,_ ,X,_,X,_,	//Hat
			 X,_,_,_, X,_,_,_, X,_,X,_ ,X,_,_,_,  X,_,X,_, X,_,_,_, X,_,_,_ ,X,_,X,_],
			
			[_,_,X,_, _,_,X,_, _,_,X,_ ,_,_,X,_,  _,_,X,_, _,_,X,_, _,_,X,_ ,_,_,X,_,	//Hi-Hat
			 _,_,X,_, _,_,X,_, _,_,X,_ ,_,_,X,_,  X,_,X,_, X,_,X,_, _,_,X,_ ,X,_,X,_]];

	seqLenght = 64;
	secCal = int(q*(bpm/7.5)%seqLenght); //calculate place in sequence at bpm
	display += "Drums: ";
	for(let i=0; i<4; i++){
	drum[i]=0; // set drum to 0 to stop rouge values.
	if(seq[i][secCal]==0)retrigDrum[i]=1;//Note cut detection

		if((seq[i][secCal]!=0) && (retrigDrum[i]==0)){
			f[i]++;	// per-channel virtual timer

			var qf=(pitch!=0)? f[i]/sr/(pitch*seq[i][secCal]) : f[i]/sr/seq[i][secCal];	
									// virtual quantizeation and crude pitch control. "qf=f[i]/sr"
			var fn=0;
			var fnb=0;
			switch(i){
				case 0:	// kick
					fn = lerpc(1500,0,qf*10);
					fnb = lerp(1.5,0,qf*24);
					drum[i] = sin(qf*fn)*fnb;
				break;
				case 1:	// snare
					fn = lerpc(4000,0,qf*2);
					fnb = lerp(1500,0,qf*7);
					drum[i] = (noise[int((qf*5e3)%300)]*(qf>.02)*(fnb/3500)-sin(qf*1500)*(qf<.06)*(fn/5500))*1.5;
				break;
				case 2:	// hat
					fn = lerp(.3,0,qf*30);
					drum[i] = noise[int(qf*3e4)%1000]*fn;
				break;
				case 3:	// Hi-hat
					fn = lerp(0.2,0,qf*64);
					drum[i] = ((noise[int(qf*8e3)%1000]-(cos(qf*7e4)/3))*fn);
				break;
				default:
					drum[i]=0;
				break;
			}
			if(!drum[i])drum[i]=0; // null protection
			if(fn<=0) retrigDrum[i]=1; // retrigger set
			}else if((seq[i][secCal]==0) && (retrigDrum[i]==1)){
				retrigDrum[i]=0;
				f[i]=0;
			}
			out+=drum[i];
			display+=(drum[i]!=0)?"💥":"💣";
		}
		display+= " ["+secCal+"]";
	return out/1.5;
}

function synth(sr,transpose){
	var out=0; const r=pow(2,1/12);
	var q=t/sr;
	if(!transpose)transpose=0;	
	// if A-1 was on 33 this WOULD be midi. (A-1 is 0, but 0 is notecut)
	lnote=[58,00,61,63,00,66,66,68,00,00,70,71,00,68,00,70,00,73,78,76,76,75,00,80,83,00,70,00,83,66,68,00,
			 68,70,71,00,70,68,00,73,71,00,68,00,66,67,68,00,73,73,75,00,66,68,00,66,68,00,71,73,75,68,66,68];
	bnote=[44,44,44,44,00,56,44,44,56,56,63,63,61,61,56,56,40,40,40,40,00,56,40,44,52,52,63,63,59,59,51,51];
	cnote=[[70,66,54,73],[56,63,68,71],[68,71,75,66],[59,64,71,73],
			 [54,66,70,73],[56,63,68,71],[71,64,56,68],[59,63,71,75]];

	bassChange = int(q*(bpm/30)%32); //Bass
	bSeq=bnote[bassChange];
	if(bSeq!=0){
		bfreq = q*55*pow(r,(bSeq+transpose));
		bass = sin((bfreq-sin(bfreq/2.03))+(sin(bfreq*4)*0.3))/3.5;
		dist=0.15;
		out+=(bass)-(((bass > dist)|(bass < 0-dist))/6)/1.5;
		display +="Bass: "+(bSeq-transpose)+" ["+bassChange+"]\n";
	}else{display +="Bass: Rest ["+bassChange+"]\n";}
	
	bassChange = int((q+0.19)*(bpm/30)%32); //Bass echo (not displayed)
	bSeq=bnote[bassChange];
	if(bSeq!=0){
		bfreq = q*55*pow(r,(bnote[bassChange]+transpose));
		bass = sin((bfreq-sin(bfreq/2.03))+(sin(bfreq*4)*0.3))/3.5;
		dist=0.15;
		out+=(bass-(((bass > dist)|(bass < 0-dist))/6))/2.5;
	}

	chordArp = int(q*(bpm/15)%3); // Arp A
	chordChange = int(q*(bpm/120)%8);
	if(cnote[chordChange][chordArp]!=0){
		lfreq=q*55*pow(r,cnote[chordChange][chordArp]+12+transpose);
		out += sin((sin(lfreq)>cos(q*(bpm/16))*0.99)/sin((lfreq/2)+sin(lfreq*3)))*lerp(.08,.02,(q*bpm/15)%1);
		display +="Arp A: "+(cnote[chordChange][chordArp]+12+transpose)+" ["+chordChange+","+chordArp+"]\n";
	}else{display +="Arp A: Rest\n";out+=0;}

	chordArp = 2-int(q*(bpm/30)%3); // Arp B
	chordChange = int(q*(bpm/120)%8);
	if(cnote[chordChange][chordArp]!=0){
		lfreq=q*55*pow(r,cnote[chordChange][chordArp]+12+transpose);
		out += sin((sin(lfreq)<cos((q)*(bpm/16))*0.99)/sin((lfreq*2)+sin(lfreq*2.5)))*lerp(.1,.02,(q*bpm/30)%1);
		display +="Arp B: "+(cnote[chordChange][chordArp]+12+transpose)+" ["+chordChange+","+chordArp+"]\n";	
	}else{display +="Arp B: rest\n";out+=0;}

	display +="Chords: ";
	chordChange = int(q*(bpm/120)%8); // Chords
	fade=((q*(bpm/150))%1)>.5?30:60;
	for(i=0;i<4;i++){
		if(cnote[chordChange][i]!=0){ // PER-note Rest detect
			lfreq=q*55*pow(r,cnote[chordChange][i]+12+transpose);
			out += sin(sin((lfreq/2)+sin(lfreq*(1.001+(i*0.003)))))*lerp(.15,.02,(q*bpm/fade)%1);
			display +=("_"+(cnote[chordChange][i]+12+transpose))+"_";
		}else{display +="_RS_";out+=0;}
	}
	display += " ["+chordChange+"]\n";

	display+="Lead: ";
	leadChange = int((q+0.03)*(bpm/30)%32) + ((keytime>49)*32); // Lead
	if(lnote[leadChange]!=0){
		lfreq=q*55*pow(r,lnote[leadChange]+transpose);
		out += (sin(sin(lfreq)-cos(q*(bpm/3.75))*0.99))*lerp(0.6,.05,(q*bpm/30)%1);
		display +=(lnote[leadChange]+transpose)+" ["+leadChange+"]\n";
	}else{display +="Rest ["+leadChange+"]";out+=0;}

	return out;
}

function lerpc(a,b,speed){
	var out = a + speed * (b - a);
	return (out < (a/2))?0:out;	// lerp function goes to 0 when it reaches half of a.
}

function lerp(a,b,speed){
	var out = a + speed * (b - a);
	return (out < 0)?0:out;		// clamps at 0, will not go into negitive values.
}