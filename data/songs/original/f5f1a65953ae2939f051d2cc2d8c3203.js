// THE UNICODE SHOW
// version II
// Copyright 2025 Chasyxx. This is licensed under CC-BY-SA-4.0
// https://creativecommons.org/licenses/by-sa/4.0/

// play this in https://dollchan.net/bb/
// or https://chasyxx.github.io/EnBeat_NEW/
// FLOATBEAT 32000HZ

// https://reddit.com/u/Chasyxx
// https://dollchan.net/btb/red/756.html

// changes from v1 to v2:
// * changed sr to 32kHz
// * made the EAS sound less realistic (don't want to confuse anyone)
// * 60 fps now
// * some musical revisions
lerp=(a,t,b)=>a*(1-t)+b*t,
n=x=>2**(x/12),
s=32000,
H=x=>2**(x/12)/s*PI*2*440,
sc=x=>x*s,
cutoff16=15.50,
_=-1e300,
r=(o,l)=>Array(l).fill(o).flat(9),
acc=(n,x)=>(this[n]??=0,this[n]+=x),
rvrb=(x,y,z)=>(rvrbc=x%256+rvrba[t%rvrbn],rvrba[t%rvrbn]=rvrbc*z,rvrbc),
dontMoveTheBoxABunchAsImTypingYouCodeBag=0,
t||(
	rvrba=Array(rvrbn=16384).fill(0.5),
	lt9=t9=0,
	lw=w=0,
	bw=0
),
// t+=sc(94.1)-(sc(94.1)%307),
p2t=t-sc(38),
p2t1=p2t/s*16%128,
lt9=t9,
t9=t/s*9%1,
(lt9>t9)&&(lw=w,w=random()),
bw=lerp(bw,0.1,random()*2-1),
(t%(sc(1/60)|0))||( // 60 hz is the most common monitor refresh rate
	$="",
	top="+---------------------------------------+\n",
	t>=sc(cutoff16)&&(top="╔═══════════════════════════════════════╗\n"),
	bottom=top,
	t>=sc(cutoff16)&&(bottom="╚═══════════════════════════════════════╝\n"),
	sides="|                                       |\n",
	t>=sc(cutoff16)&&(sides="║                                       ║\n"),	
	(t>sc(0.1)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=top),
	(t>sc(0.2)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.3)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.4)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.5)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.6)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.7)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.8)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=sides),
	(t>sc(0.9)||dontMoveTheBoxABunchAsImTypingYouCodeBag)&&($+=bottom),
	$BOX=$,
	insert=(x,y,s,ns=0)=>{
		x|=0;y|=0;
		let cx = x;
		let cy = y;
		for(let i = 0; i < s.length; i++) {
			if(s[i]==="\n"){
				cx=x;
				cy++;
				continue;
			}
			const $r = $.split('\n');
			if(cy<0||cy>=$r.length) continue;
			const $l = $r[cy].split('');
			if(cx<0||cx>=$l.length) continue;
			if(!ns||s[i]!==' ')$l[cx] = s[i];
			$r[cy] = $l.join('');
			$ = $r.join('\n');
			cx++;
		}
	},
	static=(x,y,w,h,s=3,p=1)=>{
		for(let i = 0; i < h; i++) {
			for(let j = 0; j < w; j++) {
				if(random()>p**2) continue;
				const S = String.fromCharCode((Math.random()*[12,27,128,160][abs(s)]|0)+(s<0?"!".charCodeAt(0):0x2500));
				insert(x+j,y+i,S)
			}
		}
	},
	$$=_=>{
		throw new TypeError("\n"+$.trim().replace(/(\s|^)/g,"\u200c$1")+" is not a function");
	},
	(t<sc(16))&&(
		(t<sc(2))&&insert(1,1,"Licensed under CC-BY-SA-4.0\nhttps://creativecommons.org/\nlicenses/by-sa/4.0/"),
		(t>sc(3))&&insert(15,2,"Welcome to".slice(0, (t-sc(3))/sc(0.0625)|0 )),
		(t>sc(5))&&insert(12,4,"THE UNICODE SHOW".slice(0, (t-sc(5))/sc(0.0625)|0 )),
		(t>sc(5))&&insert(15,5,"version II".slice(0, (t-sc(5))/sc(0.0625)|0 )),
		(t>sc(7)&&t<sc(12))&&insert(12,6,"No two computers".slice( max(0,(t-sc(10))/sc(0.0625)|0) , (t-sc(7))/sc(0.0625)|0 )),
		(t>sc(7)&&t<sc(12))&&insert(6,7,"have all or the same symbols.".slice( max(0,(t-sc(10))/sc(0.0625)|0) , (t-sc(7))/sc(0.0625)|0 )),
		(t>sc(11)&&t<sc(15))&&insert(9,6,"I'll post a recording".slice( max(0,(t-sc(13))/sc(0.0625)|0) , (t-sc(11))/sc(0.0625)|0 )),
		(t>sc(11)&&t<sc(15))&&insert(15,7,"when I can.".slice( max(0,(t-sc(13))/sc(0.0625)|0) , (t-sc(11))/sc(0.0625)|0 )),
		(t>sc(2))&&static(1,1,39,7,t>sc(cutoff16)?3:-1,1-min(0.9,(t/s-2)/3))
	)||(t>sc(16)&&t<sc(36.55))&&(
		insert(1,6,"─".repeat(39)),
		(()=>{
			if(t<sc(32.2)) insert(1,1,
`..│%%%%%%│%%%│%%%%%%%%%%%%%│%%%%│....│.
@..│%%┌───┤%%%└┐%%┌─────┐%%%├────┤....│.
@──┴──┤%%%│%%%%├──┤#####│%%%│%%%%└───┬┴─
@.....│%%%└┬───┤%%│####┌┴───┴──┐%%%%%│..
@.....│%%%%│%%%│%%└────┘%%%%%%%│%%%%%│..`
				.replaceAll('@','')
				.replaceAll('.',' ')
				.replaceAll('#',t>sc(21)?"%":t>sc(19)?"╖╜╙╓"[t/sc(0.2)&3]:" ")
				.replaceAll('%',t>sc(22)?"┼╳"[t/sc(0.5)&1]:" ")
			)
			if(t>sc(32.3)) insert(1,1,
`..│%%%%%%│%%%│%%%%%%%%%╳......╱╬╲_.....
@..│%%┌───┤%%%└┐%%┌────╱╓╲....╱╬╬╬╬╲....
@──┴──┤%%%│%%%%├──┤###╱ ║ ╲...│╬╬╬╬╬╲...
@.....│%%%└┬───┤%%│##╱  ╜  ╲..╲╬╬╬╬╬╱...
@.....│%%%%│%%%│%%└─╱___╓___╲..‾‾‾‾‾....`
				.replaceAll('@',''));
			const S = "BREAKING NEWS │ Hostile beings spotted across Antubantia ║ASN 16║ ";
			const b = t/sc(0.1)|0;
			for(let i = 0; i < 39; i++) {
				const c = S[(b+i)%S.length];
				insert(1+i,7,c);
			}
			switch(t/s|0) {
				case 16:
					insert(2,2,"Currently we do\nnot know the source\nof the beings,")
				break;
				case 17: case 18:
					insert(2,2,"However,")
				break;
				case 19: case 20: case 21: 
					insert(2,1,"the origin of\nthe anomaly is\nsuspected to be\nOrpanta County.")
				break;
				case 22: case 23: case 24: case 25:
					insert(2,1,"We reccomend to\nevacuate the\nnearby area while\nlaw enforcement\ninvestigates.")
				break;
				case 26: case 27: case 28:
					insert(2,1,"If possible,\ndo not\nconfront the\nbeings.")
				break;
				case 29: case 30: case 31: case 32:
					insert(2,1,"There is no\nconfirmed way\nto avoid being\nabsorbed.")
				break;
				case 33: case 34: case 35:
					insert(2,1,"Currently,\nmeterological\nstorms are also\non the rise.")
				break;
				case 36:
					insert(2,2,"This effect is\nmuch more powerful\nnear mountains.")
				break;
			}
		})(),
		static(1,1,39,7,3,1-min(0.9,(t/s-16)/3))
	)||(t>sc(36.55)&&t<sc(38))&&(
		static(1,1,39,7,3,1),insert(2,2,`      \n CH${17+(t-sc(36.4))/s*1.3|0} \n      `)
	)||(t>sc(38)&&t<sc(40))&&(
		insert(1,1,
`                                                                         
@      ╔══ ║ ║ ╔══ ║ ║   ╚ ╝ ╔═╗ ║ ║   ╔═╗ ╔═╗ ╔═╗ ╔═╗ ║  ║ ═╦═ ╔═╗ ║    
@      ╠══ ║ ║ ║   ║ ╝    ║  ║ ║ ║ ║   ║ ║ ║ ║ ║ ║ ║ ║ ║╗ ║  ║  ║ ║ ║    
@      ║   ║ ║ ║   ║╔     ║  ║ ║ ║ ║   ║ ║ ║═╝ ║═╝ ║═╣ ║ ╚║  ║  ║═╣ ║    
@      ║   ║ ║ ║   ║ ╗    ║  ║ ║ ║ ║   ║ ║ ║╚  ║   ║ ║ ║  ║  ║  ║ ║      
@      ║   ╚═╝ ╚══ ║ ║    ║  ╚═╝ ╚═╝   ╚═╝ ║ ╗ ║   ║ ║ ║  ║  ║  ║ ║ ╝    
@                                    ╝                                    `.split("\n").map(x=>x.substr(max(0,min(35,p2t1)),39)).join("\n")
.replaceAll('@','')),
		static(1,1,39,7,2,0.5)
	)||(t>sc(40)&&t<sc(43))&&(
		insert(2,2,"Octopus Q. Octopus's SEATIME car shop\n if you're daring enough to look for\n a car, better look now before\nthe next storm comes!\n"+" ".repeat((t-sc(40))/sc(0.12)|0)+"AEHAHAHAEHA"),
		static(1,1,39,7,3,0.5)
	)||(t>sc(43)&&t<sc(44))&&(
		static(1,1,39,7,2,1),insert(2,2,`      \n CH${12+(t-sc(36.4))/s*1.3|0} \n      `)
	)||(t>sc(44)&&t<sc(81.16))&&(()=>{
		let le = 0;
		let re = 0;
		let cle = 0;
		let cre = 0;
		if(t>sc(400/9)&&t<sc(426/9)) {
			le = 1;
			insert(8,2,"Okay, but do you\nknow why windows\nbend over for\ntheir partners?");
		}
		if(t>sc(434/9)&&t<sc(445/9)) {
			re = -1;
			insert(20,4,"Uh, no, why?");
		}
		if(t>sc(453/9)&&t<sc(454/9)) {
			le = 1;
			insert(8,4,"B-");
		}
		if(t>sc(458/9)&&t<sc(480/9)) {
			le = 2;
			insert(8,4,"Because it's\nvery ANNEALING!");
		}
		if(t>sc(54.31)&&t<sc(501/9)) {
			cre = 1;
		}
		if(t>sc(501/9)&&t<sc(506/9)) {
			cre = 1+4*4+3;
		}
		if(t>sc(506/9)&&t<sc(512/9)) {
			cre = 1+0*4+3;
		}
		if(t>sc(512/9)&&t<sc(519/9)) {
			cle = 1+2*4+0;
		}
		if(t>sc(519/9)&&t<sc(520/9)) {
			cle = 1+4*4+0;
		}
		if(t>sc(520/9)&&t<sc(522/9)) {
			cre = 1+4*4+3;
		}
		if(t>sc(522/9)&&t<sc(528/9)) {
			cre = 1+0*4+3;
		}
		if(t>sc(528/9)&&t<sc(560/9)) {
			cre = 1+4*4+3;
		}
		if(t>sc(560/9)&&t<sc(564/9)) {
			cre = 1+0*4+3;
		}
		if(t>sc(572/9)&&t<sc(579/9)) {
			le = 1;
			insert(8,4,"Okay, but-");
		}
		if(t>sc(579/9)&&t<sc(595/9)) {
			cre = 1+4*4+2;
		}
		if(t>sc(579/9)&&t<sc(600/9)) {
			cle = 1+4*4+2;
		}
		if(t>sc(600/9)&&t<sc(625/9)) {
			cle = 1+4*4+1;
		}
		if(t>sc(625/9)&&t<sc(658/9)) {
			cle = 1+4*4+2;
		}
		if(t>sc(658/9)&&t<sc(667/9)) {
			cle = 1+0*4+2;
		}
		if(t>sc(667/9)&&t<sc(676/9)) {
			cre = 1+0*4+0;
		}
		if(t>sc(676/9)&&t<sc(684/9)) {
			cre = 1+4*4+0;
		}
		if(t>sc(684/9)&&t<sc(690/9)) {
			cre = 1+0*4+0;
		}
		// 704
		if(t>sc(690/9)&&t<sc(704/9)) {
			cle = 1+4*0+0;
		}
		if(t>sc(704/9)&&t<sc(731/9)) {
			cle = 1+4*4+1;
		}
	// 	(t>sc(453/9)&&t<sc(454/9))||
	// (t>sc(458/9)&&t<sc(480/9))
		switch(le) {
			case 0:
			insert(4,2,' O \n │ \n╱│╲\n │ \n╱ ╲')
			break;
			case -1:
			insert(4,2,' O \n╲│ \n │╲\n │ \n╱ ╲')
			break;
			case 1:
			insert(4,2,' O \n │╱\n╱│ \n │ \n╱ ╲')
			break;
			case 2:
			insert(4,2,' O \n╲│╱\n | \n │ \n╱ ╲')
			break;
		}
		switch(re) {
			case 0:
			insert(34,2,' O \n │ \n╱│╲\n │ \n╱ ╲')
			break;
			case -1:
			insert(34,2,' O \n╲│ \n │╲\n │ \n╱ ╲')
			break;
			case 1:
			insert(34,2,' O \n │╱\n╱│ \n │ \n╱ ╲')
			break;
			case 2:
			insert(34,2,' O \n╲│╱\n | \n │ \n╱ ╲')
			break;
		}
		if(cle) {
			$=$BOX;
			insert(6,1,`    ╲
     │
O O  │─
  ╲  │ │
  ╱  │╱
     │
    ╱`);
			cle-=1;
			switch(cle&3) {
				case 0:
					insert(6,2,"┉ ┉"); break;
				case 1:
					insert(6,2,"╱ ╲"); break;
				case 2:
					insert(6,2,"╲ ╱"); break;
				case 3:
					insert(6,2,"╲ ~"); break;
			}
			switch(cle>>2&7) {
				case 0:
					insert(5,6,"════"); break;
				case 1:
					insert(5,6,"└──┘"); break;
				case 2:
					insert(5,6,"┌──┐\n╲__╱"); break;
				case 3:
					insert(5,6,"┌──┐"); break;
				case 4:
					insert(5,6," ──\n╱__╲"); break;
			}
		}
		if(cre) {
			$=$BOX;
			insert(27,1,`   ╱
  │
 ─│  O O
│ │  ╱
 ╲│  ╲
  │
   ╲`);
			cre-=1;
			switch(cre&3) {
				case 0:
					insert(32,2,"┉ ┉"); break;
				case 1:
					insert(32,2,"╱ ╲"); break;
				case 2:
					insert(32,2,"╲ ╱"); break;
				case 3:
					insert(32,2,"~ ╱"); break;
			}
			switch(cre>>2&7) {
				case 0:
					insert(32,6,"════"); break;
				case 1:
					insert(32,6,"└──┘"); break;
				case 2:
					insert(32,6,"┌──┐\n╲__╱"); break;
				case 3:
					insert(32,6,"┌──┐"); break;
				case 4:
					insert(32,6," ──\n╱__╲"); break;
			}
		}
		if(t>sc(501/9)&&t<sc(510/9)) {
			insert(10,4,"Sorry, what?");
		}
		if(t>sc(512/9)&&t<sc(519/9)) {
			insert(20,4,"You see,");
		}
		if(t>sc(519/9)&&t<sc(520/9)) {
			insert(20,4,"You see, uh-");
		}
		if(t>sc(520/9)&&t<sc(528/9)) {
			insert(4,2,
`║  ║ ╔═╗   ║  ║ ╔═╗
@║╗ ║ ║ ║   ║╗ ║ ║ ║
@║ ╚║ ║ ║ ═ ║ ╚║ ║ ║
@║  ║ ║ ║   ║  ║ ║ ║
@║  ║ ╚═╝   ║  ║ ╚═╝ ╳`.replaceAll('@',''));
		}
		if(t>sc(528/9)&&t<sc(547/9)) {
			insert(5,2,"If you have to\nexplain a joke,");
		}
		if(t>sc(547/9)&&t<sc(564/9)) {
			insert(5,2,"If you have to\nexplain a joke,\n\nit's not a good\njoke!");
		}
		if(t>sc(579/9)&&t<sc(595/9)) {
			insert(4,4,"No, that's the rule,\nand you know that-");
		}
		if(t>sc(595/9)&&t<sc(600/9)) {
			insert(23,4,"Okay,");
		}
		if(t>sc(600/9)&&t<sc(608/9)) {
			insert(21,4,"I admit,");
		}
		if(t>sc(607/9)&&t<sc(625/9)) {
			insert(21,3,"That's not the\nbest joke i've\ncome up with,");
		}
		if(t>sc(625/9)&&t<sc(638/9)) {
			insert(20,2,"but you said\n\"Sorry, what,\"");
		}
		if(t>sc(638/9)&&t<sc(658/9)) {
			insert(20,2,"but you said\n\"Sorry, what,\"\nyou can't go back\non yourself like\nthat!");
		}
		if(t>sc(676/9)&&t<sc(684/9)) {
			insert(10,4,"Okay, yeah.");
		}
		if(t>sc(690/9)&&t<sc(694/9)) {
			insert(23,4,"Anyway,\n      ╲");
		}
		if(t>sc(694/9)&&t<sc(711/9)) {
			insert(15,4,"I checked your computer\nthe other day,\n                ╲");
		}
		if(t>sc(711/9)&&t<sc(729/9)) {
			insert(15,4,"Was this joke because\nof your terabyte of\n                     ╲");
		}
		if(t>sc(729/9)&&t<sc(731/9)) {
			insert(15,4,"Was this joke because\nof your terabyte of he-\n                     ╲");
		}
		static(1,1,39,7,3,0.1)
	})()||(t>sc(81.16)&&t<sc(83))&&(
		static(1,1,39,7,3,0.1)
	)||(t>sc(83)&&t<sc(92))&&(
		insert(1,1,"     WARNING DISTRIBUTION NETWORK\n\n      ANTUBANTIA WEATHER COUNCIL\n              HAS ISSUED A\n\n         SEVERE TORNADO ALERT"),
		static(1,1,39,7,3,0.1)
	)||(t>sc(92)&&t<sc(94))&&(
		static(1,1,39,7,2,1),insert(2,2,`      \n CH${22+(t-sc(91.8))/s*1.3|0} \n      `)
	)||(t>sc(94)&&t<sc(151))&&(
		(t<sc(141.3))&&insert(1,3,"░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ \n░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░▒░░\n▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░▒▒░\n▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"),t<sc(106)&&insert(2,1,"Did you know\ufffd"),
		t>sc(107)&&t<sc(114)&&insert(2,1,"Today's winning lottery numbers"),
		t>sc(115)&&t<sc(122)&&insert(2,1,"What is this station\ufffd"),
		t>sc(123)&&t<sc(130)&&insert(2,1,"What time is it\ufffd"),
		t>sc(131)&&t<sc(138)&&insert(2,1,"What is \"The Unicode Show\"\ufffd"),
		t>sc(139)&&t<sc(141.4)&&insert(2,1,"What are current weather conditions\ufffd"),
		t>sc(141)&&insert(2,1,"SYSTEM ALERT"),
		t>sc(94)&&t<sc(95)&&insert(3,4,"The longest piece of English\nliterature is a facnfiction of\nNickelodeon show \"The Loud House\"."),
		t>sc(95)&&t<sc(100)&&insert(3,4,"On May 17th, 2025, the Bytebeat\nClassic discord server was deleted,\nto much dismay."),
		t>sc(100)&&t<sc(105)&&insert(3,4,"Time rifts would cause worlds to\nfall into the eternal void."),
		t>sc(108)&&t<sc(113)&&insert(3,4,"None.\nI do not condone gambling."),
		t>sc(116)&&t<sc(121)&&insert(3,4,"This station has been automatically\nrunning from joshnson976's bunker\nsince May 17th, 2025."),
		t>sc(124)&&t<sc(129)&&insert(3,4,new Date().toString().split(' (').join('\n(')+"."),
		t>sc(132)&&t<sc(137)&&insert(3,4,"I don't think I can\ntell you about that."),
		t>sc(140)&&t<sc(141.5)&&insert(3,4,"A TP4 tornado is expected to arrive\nin Orpanta county in 20 seconds."),
		t>sc(141.1)&&insert(3,4,"Critical wind speed detected.\n\nRetracting antenna."),
		insert(1,2,"───────────────────────────────────────"),
		static(1,1,39,7,t>sc(141.3)?3:2,max(0.2,(t/s-144)/5)),
		t>sc(147.7)&&insert(2,2,'      \n CH24 \n      ')
	)||(t>sc(151)&&t<sc(153))&&(
		t>sc(147.7)&&insert(3,3,'Shutting down.\nGoodbye!')
	)||(t>sc(165))&&(
		t>sc(171)&&(
			(t/s&4)?insert(1,1,"This is the end of\nTHE UNICODE SHOW\n\nLicensed under\nCC-BY-SA-4.0"):insert(1,1,"This is the end of\nTHE UNICODE SHOW\n\nNo two computers have\nthe same symbols.\nI'll post a recording\nwhen I can."),
			static(1,1,39,7,3,0.5+sin(t/s)*0.2),
			(t/s&4)&&insert(1,6,"https://creativecommons.org/\nlicenses/by-sa/4.0/")
		),
		insert(25,1,
`    └┐
@└┐   └─┰─┐
@ ┝━━┓  ┗┓  ┌
@ └  ┡━━━╋━━╅┘
@   ┌┘   ┗┓ ┃  ┌
@      └┐ ┃ ┗━╾┘
@       ├╼┛     `.replaceAll('@',''),1)
	),
	// $=$BOX,
// insert(1,1,
// `                                       
// @     ╔═╗ ╔═╗ ╔═╗ ╔═╗ ║  ║ ═╦═ ╔═╗ ║    
// @     ║ ║ ║ ║ ║ ║ ║ ║ ║╗ ║  ║  ║ ║ ║    
// @     ║ ║ ║═╝ ║═╝ ║═╣ ║ ╚║  ║  ║═╣ ║    
// @     ║ ║ ║╚  ║   ║ ║ ║  ║  ║  ║ ║      
// @     ╚═╝ ║ ╗ ║   ║ ║ ║  ║  ║  ║ ║ ╝    
// @                                       `
// .replaceAll('@','')),
	$$()
),
pwm=(a,b)=>a<-96?0:(sin(t*H(a))>b)-0.5+b/2,
tri1=x=>((x&1)?(1-x%1):(x%1))-0.5,
tri=(a,p)=>tri1(t*H(a)/PI)*(sin(tanh(p)*PI)),
p1s=t>sc(171)?171:16,
p1=(t<sc(p1s!==16?1e10:36.55))&&pwm([-31,-31,-31,-31,-28,-28,-28,-31][t/s/2|0]||_,cos(t/sc(2)*PI/2))/2+
pwm([_,-19,-16,-18,_,-12,-16,-19][t/s/2|0]||_,-cos(t/s*PI/2))/2+((t>sc(cutoff16)&&t<sc(16.25))&&(random()-0.5)*(1-(t/sc(0.5)%1)))+(t>sc(p1s)&&cbrt(sin(acc("fall",H(61-(max(0,t/s-p1s)*18)))))/4*sqrt(1-tanh((t/s-p1s)/3))+(random()-0.5)*(1-t/sc(0.125)%1)**2*sqrt(t/sc(0.5)%1)*2+pwm((t/s&8||t<sc(24))?-43:-40,sin(t/s*PI/8)))/2+((t>sc(24)&&tri(-7,(t%sc(8))/s)+tri(-4,((t-sc(0.25))%sc(8))/s)+tri(0,((t-sc(0.5))%sc(8))/s)+tri(-11,((t-sc(3))%sc(8))/s)+tri(-7,((t-sc(3.25))%sc(8))/s)+tri(-2,((t-sc(3.5))%sc(8))/s))+(t>sc(28)&&tri(-12,((t-sc(4))%sc(8))/s)+tri(-7,((t-sc(4.25))%sc(8))/s)+tri(-4,((t-sc(4.25))%sc(8))/s)+tri(-14,((t-sc(6))%sc(8))/s)+tri(-7,((t-sc(6.25))%sc(8))/s)+tri(-5,((t-sc(6.5))%sc(8))/s)))/2,
p2=(t>sc(38)&&t<sc(43))&&(crzscf=x=>t&165&t%255&&t/256*(t&t>>x),crzsca=37649&1<<(t>>12&15)&&128*sin(2048/(t%4096/4)**.0125)+128,((((crzsca|crzscf(12)-crzscf(14)+128)+128)^(t&32&t>>8||t>>6))&255)/256-0.5)+random()/2-0.25,
chr1=sin(acc("wp",lerp(400,lerp(lw,t9,w),700)/s*PI*2))*(1-t9)/2,
chr2=sin(acc("wp2",lerp(200,lerp(lw,t9,w),500)/s*PI*2))*(1-t9)/2,
p3=(t>sc(44)&&t<sc(81.16))&&(random()*0.1-0.05+((
	(t>sc(400/9)&&t<sc(426/9))||
	(t>sc(453/9)&&t<sc(454/9))||
	(t>sc(458/9)&&t<sc(480/9))||
	(t>sc(512/9)&&t<sc(520/9))||
	(t>sc(572/9)&&t<sc(579/9))||
	(t>sc(595/9)&&t<sc(658/9))
)&&chr1)+((
	(t>sc(434/9)&&t<sc(445/9))||
	(t>sc(501/9)&&t<sc(506/9))||
	(t>sc(520/9)&&t<sc(522/9))||
	(t>sc(528/9)&&t<sc(560/9))||
	(t>sc(579/9)&&t<sc(595/9))||
	(t>sc(676/9)&&t<sc(684/9))||
	(t>sc(690/9)&&t<sc(731/9))
)&&chr2)),
eas=((t>sc(83.5)&&t<sc(89.5))&&("UUUUUUUUUUUUUUUUUUUUU ALERT ALERT THIS IS VERY BAD OH NO THE GRIEF UUUUU".charCodeAt(t/s*64&127)>>(t/s*512&7)&1?sin(t/s*2700*PI*2):sin(t/s*3700*PI*2)))+((t>sc(90)&&t<sc(92))&&(sin(t/s*1200*PI*2)+sin(t/s*1800*PI*2)+sin(t/s*2700*PI*2))/3),
c7=(t>sc(94)&&t<sc(141.2)?1:0)*(rvrbc=((t*2)/(4+(t>>17)%16)*(1+(3&t>>15))>>(2&t>>13)&16)*8,
rvrb(rvrbc*1.00009**(-t/4%16384)%256/4,64,.8)*1.5/127-0.5+random()*0.2-0.1),
p1+((
		(t>sc(36.55)&&t<sc(38))||
		(t>sc(43)&&t<sc(44))||
		(t>sc(92)&&t<sc(94))
)&&(random()*2-1))+p2+p3+eas+c7+((t>sc(141.2)&&t<sc(151.1))&&((random()-0.5)*min(1,max(0.2,(t/s-144)/5))))+((t>sc(151.1)&&t<sc(170))&&bw*(((t/s-146.1)/10)))+(sin(t/sc(1)*PI*2*3000)*((t>sc(165)&&t<sc(166))?1-cbrt(t-sc(165))%1:0))