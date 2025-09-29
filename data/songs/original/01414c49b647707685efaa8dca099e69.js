// Change this to 1 to more easily read the explanation.
const read = 0;

let clock = 0;
let sampleRate = 0;
let tick = 1;

function display() {
	let s = "The telephone company sends a dial tone to indicate it's ready.\n...\n...";
   let c = "Yes, you can call someone now."
   let A = "(waiting)"
	let B = "(waiting)"
	if(clock>1) {
		A = "Yes, i'd like to contact my dialup provider.";
		s = "The modem in who whishes to connect dials a specific number\n(The fictional (ABA)762-24C6 in this case.)\n..."
	}
	if(clock>3) c="Understood, i'll get you through."
	if(clock>3.3) A="(waiting)"
	if(clock>4.5) c="(waiting)"
	if(clock>5) {
		B="Hello, please use this standard of communication."
		A="!"
		s="The modem in the dialup service sets a modem standard and asks the calling modem it's working standards.\nThe calling modem accepts then goes into Information Transfer Mode to decide on a better standard.\n..."
	}
	if(clock>5.3) B+=" Now, can you tell me in what ways you can speak?"
	if(clock>5.4) A="Sure thing!"
	if(clock>5.7) A+=" Let's go into ITM."
	if(clock>5.8) {
		A="I can speak in English, French, and German. I can acknowledge. What about you?"
		B="..."
		s="The two modems are now deciding what modulation mode to use next.\n...\n..."
	}
	if(clock>6.4) B = "I can speak in English and Japanese, and I can also acknowledge. let's go ahead and use English."
	if(clock>7) A = "OK I Agree"
	if(clock>7.2153846153846154) {
		A="(waiting)";
		B="..."
	}
	if(clock>7.8) {
		s="It's time for the modems to decide on their final modulation method.\nThe answering modem turns off the phone line's echo suppression to avoid data corruption.\nBoth modems then list their standards, and how they're connected to the phone network (Landline, sattelite, etc.)"
		A="(waiting)";
		B="Let me turn off echo suppression so our chat isn't corrupted."
		c="(turning off echo suppression)"
	}
	if(clock>8.3) A="I'm connected to a landline. I know English, French, and German in 3 different accents.";
	if(clock>9.9) {
		B="I'm connected to a sattelite. I know English and Japenese, in 4 different accents each.";
		c="(waiting)"
	}
	if(clock>11.5) {
		s="The modems now want to know how far apart they are; how long it takes for their messages to get to each other.\n...\n..."
		A="How long is the phone line?";
		B="Let's find out! Here I GO!"
	}
	if(clock>11.6) B="AEAEAEAEAE";
	if(clock>11.9) {
		B="aeaeaeaeae";
		A="I see..."
	}
	if(clock>12.2) {
		A="Alright, here I GO!";
		B="Your turn!"
	}
	if(clock>12.3) A="AEAEAEAEAE";
	if(clock>12.6) {
		A="aeaeaeaeae";
		B="I see..."
	}
	if(clock>12.9) {
		A="Seems like this long.";
		B="Checks out."
	}
	if(clock>13.1) {
		s="The modems now need to know how each other sound, so they can tune their hearing.\nThis way they can tak with each other at the same time, and faster.\nThey also decide on the final speeds and modes here."
		A="(screaming)";
		B="(listening)";
	}
	if(clock>16.1) A="(beep)";
	if(clock>16.15) {
		B="(screaming)";
		A="(listening)";
	}
	if(clock>19.15) B="(beep)";
	if(clock>19.2) {
		s="Celebration!\nThe modems have finished their setup and are about to send data.\n..."
		A="YAYAYAYAYAY";
		B="YAEAEEAEAEA";
	}
	if(clock>22) A=B="(Not sure what this is.)";
	if(clock>22.25) {
		s="Data is now being transmitted.\nProbably a bunch of text.\nIn a real connection, this is where you'd finally have internet!"
		A="(screaming)";
		B="(screaming)";
	}
	throw `\n${s}\n----------------\nTelephone&Co.: ${c}\nCalling modem: ${A}\nRecieving modem: ${B}`;
}

let phases = Array(0);
let phaseIndex = 0;

function sine(freq,q=sin) {
	while(phaseIndex >= phases.length) phases.push(0);
	phases[phaseIndex] += freq;
	return q(phases[phaseIndex++]/sampleRate*2*PI);
}


function tone(...Z) {
	let o = 0;
	for(let i = 0; i < Z.length; i++) {
		o+=sine(Z[i],i&1?cos:sin);
	}
	return o/Z.length;
}

function DTMF(letter) {
	switch(letter) {
		case '1':           return tone(697,1209);
		case '2':           return tone(697,1336);
		case '3':           return tone(697,1477);
		case 'A': case 'a': return tone(697,1633);
		
		case '4':           return tone(770,1209);
		case '5':           return tone(770,1336);
		case '6':           return tone(770,1477);
		case 'B': case 'b': return tone(770,1633);
		
		case '7':           return tone(852,1209);
		case '8':           return tone(852,1336);
		case '9':           return tone(852,1477);
		case 'C': case 'c': return tone(852,1633);

		case '*':           return tone(941,1209);
		case '0':           return tone(941,1336);
		case '#':           return tone(941,1477);
		case 'D': case 'd': return tone(941,1633);
		
		default: return 0;
	}
}

function FSK(space,mark,char) {return tone(char=='1'?mark:space)}

let poles = [];
let poleIndex=0;
function F(a,c) {
	const i=poleIndex++;
	poles[i]??=0;
	return poles[i]+=(a-poles[i])*c;
}

function sound() {
	const GAURD = tone(1200,1800,2400);
	const L1 = tone(150,315,454,610,757,1050,1350,1500,1650,1950,2100,2250,2550,2700,2850,3000,3150,3300,3450,3600,3750)*4;
	if(clock>22.25) return random()*2-1; // D A T A .
	if(clock>22.05) return tone(1400); // boop
	if(clock>22) return tone(1800); // beep
	if(clock>19.2) return tone(1000,1100,1200,1300,1500,1600,1700,1800,2000,2100,2200,2300)/9*2*(clock-18.2)**2; // YAY WE DID IT
	if(clock>19.15) return tone(1800); // ok im done
	if(clock>16.15) return F((R=random()*2-1)-F(R,0.00),0.3); //AEAEAEAEAE
	if(clock>16.1) return tone(1300); // Your turn
	if(clock>13.1) return F(random()*2-1,0.1)*4; // AEAEAEAEAE
	if(clock>12.9) return GAURD;
	if(clock>12.6) return L1 / 2;
	if(clock>12.3) return L1; // I'd like to figure that out too.
	if(clock>12.2) return GAURD;
	if(clock>11.9) return L1 / 4;
	if(clock>11.6) return L1 / 2; // Alright how long is the line?
	if(clock>11.5) return GAURD / 2;
	if(clock>9.9) return FSK(1650,1850,"01010011000100000100010101000001010100000100010100010011000001001001"[(clock-9.9)*130%68|0])/2+FSK(990,1280,"01001100000100000100010011100001000100000100110000010010010001001110"[(clock-8.3)*130%68|0])/2;; // me too
	if(clock>8.3) return tone(2100)/2+FSK(990,1280,"01001100000100000100010011100001000100000100110000010010010001001110"[(clock-8.3)*130%68|0])/2; // more standards i have
	if(clock>7.8) return tone(2100)/2; // (disables echo suppression so data isn't corrupted)
	if(clock>7.2153846153846154) return 0;
	if(clock>7) return FSK(990,1280,"0101100100010001010001010011"[(clock-7)*130|0]); // ok
	if(clock>6.4) return FSK(1650,1850,"010100110001001111000010000000010101000001001000000100100100010100110000111111"[(clock-6.4)*130|0])/2; // let's use this one
	if(clock>5.8) return FSK(990,1280,"0100100100001000000001000011000100000100010011100000100000000100010000010011110"[(clock-5.8)*130|0]); // here are my standards
	if(clock>5.7) return tone(1900)/2 // let's talk
	if(clock>5.4) return tone(1500,2200) // ok i will
	if(clock>5.3) return tone(400)/4 // tell me what standards you have
	if(clock>5) return tone(1400,2000)/2 // hi you've reached the modem, please use this standard
	if(clock>1) return DTMF("A B A 7 6 2 2 4 C 6"[(clock-1)*10|0]); // Fictional number. Any correlation with reality is only conincidence.
	return tone(350,450); // dial tone
}

return function(t,S) {
	clock = t/(read?4:1)+(read?3/4:0); sampleRate = S;
	phaseIndex = 0; poleIndex = 0;
	if((t*32&1) != tick) {
		tick = t*32&1
		display();
	}
	return sound();
}