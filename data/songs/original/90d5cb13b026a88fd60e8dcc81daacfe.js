spl=(strs,...durs)=>{
	lines = Array();
	i = 0;
	j = 0;
	while (i < strs.length-1) {
		idxs = [strs[i].length/3];
		syl = strs[i++].trim();
		lineDurs = [durs[j++]];
		while(i < strs.length-1 && !strs[i].includes("\n")) {
			if (strs[i-1].includes('-')) {
				idxs.push(syl.length+strs[i].length/3);
				syl += strs[i];
			} else {
				idxs.push(syl.length+1+strs[i].length/3);
				syl += ' '+strs[i];
			}
			i++;
			lineDurs.push(durs[j++]);
		}
		lines.push({syl: syl, dur: lineDurs, offsets: idxs});
	}
	return lines;
};
lyr=spl`My${2}name,${6}my${2}age,${6}my${4}favo-${2}rite${2}co-${2}lor,${6}
my${2}height,${6}my${2}sign,${4}do${2}I${4}have${2}a${2}lo-${2}ver?${8}
What's${2}my${2}na-${2}tion-${2}al-${2}i-${2}ty?${4}Here's${2}some${2}things${2}that${1}in-${1}spi-${2}re${2}me${2}
My${2}favo-${2}rite${2}food,${2}my${2}cur-${2}rent${2}mood,${2}and${2}my${2}shoe${4}size${8}`;
lyr.advAns=[1,3,5,1,3,6,0,7,1,5,9,0];
eval(unescape(escape`獥捲整猽嬢屸愰∬≊潳栠╵䐸㍄╵䑃㑂∬∲〢Ⱒ䕬散瑲楣⁂汵攠╵䐸㍄╵䑆䔶∬∶✰尢∬≌楢牡‥甲㘴䔢Ⱒ乯‥畄㠳䐥畄䔱㐢Ⱒ❍畲楣慮‥畄㠳䌥畄䑆䄥畄㠳䌥畄䑆㠢Ⱒ偩慮漠╵䐸㍃╵䑆䈹┲䌠䝵楴慲‥畄㠳䌥畄䙂㠥㉃⁃潦晥攠╵㈶ㄵ┲䌠䅲摵楮漢Ⱒ䍨業步渠乵浧整‥畄㠳䐥畄䌱㐢Ⱒ併瑧潩湧‥畄㠳䔥畄䐲〢Ⱒ啓‱㈢崮浡瀨猽㹵湥獣慰攨猩⤠`.replace(/u(..)/g,"$1%")));
tick=0;
line=0;
idx=0;
ans=0;
chrIdx=0;
lc=4096;
return (s,sr)=>(
S=.8,
t=s*sr,
t||(idx=0,line=0,tick=0,ans=0,chrIdx=0,lc=4096),
t-=1/S<<13,
r=t*S,
q=r>>13&7,
e=~(q<1?r>>5:q<3?128+(r>>6):q<7?(r>>7)+64:(~r>>7)-64),
o=2,p5=3/2,p4=4/3,M3=5/4,m3=6/5,sc=81/80,
N=p=>(t/48000*p*256*261.6&255&e)/4,
C=n=>
N(n[0])
+N(n[1])
+N(n[2])
+N(n[3])
+(t/48000*n[0]*128*261.6&255)/4,
P=r>>16&3,
B=C([[p5**-2,p5**-2*p4**2,p5**-2*p4**3,p5**-2*p4**3*M3],[p5**-2*p4,p5**-2*p4*M3,p5**-2*p4**3,p5**-2*p4**3*M3],[o**-1/sc,p5**-1*p4/sc,m3/sc,p5/sc],[p5**-1/sc,p5**-1*M3/sc,p5**-1*p4**2/sc,p5/sc]][P]),
M=t/48000*256*261.6*("<<<H@@@0\x00<6<666H<<<H@@00\x006<<666\x00<@H<@HP\x00HPZHPZ`HQZ`QZ`lQHx\x00xll\x00H".charCodeAt(r>>13&63))/60/sc&175,
D=128*sin(t/r*300/cbrt(r&16383)-t/150)*(~r&16383)/16384+128,
(lc+=S)<1024?(M/4+B/3+D/3&255)/128-1:(lc=0,()=>{
if (idx == lyr.advAns[ans]) {
	ans = ++ans % secrets.length;
	chrIdx = 0;
}
if ((tick+=.25) >= lyr[line].dur[idx]) {
	if (++idx >= lyr[line].offsets.length) {
		if (++line >= lyr.length) line = 0;
		idx = 0;
	}
	tick = 0;
}
++chrIdx;
garbageStr = "";
for (i=chrIdx;i<secrets[ans].length;++i)
	garbageStr += String.fromCharCode(32+96*random()|0);
throw `
${'\xa0'.repeat(lyr[line].offsets[idx])}|
${lyr[line].syl}
${'\xa0'.repeat(lyr[line].offsets[idx])}|
${secrets[ans].substr(0,chrIdx)+garbageStr}`;
})())