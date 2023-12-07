main(44100); //Actinomycetes and Petrichor - Bp103
function main(sr){
	t+=sr*5.9;
	a=0; l=0; r=pow(2,1/12);
	note=[[61,65,73],[60,65,72],[71,63,64],[59,66,71]];
	lnote=[61,68,66,71,68,75,73,68,61,68,66,71,64,75,71,63];
	for(i=7;i>0;i--){
		q=t/sr;
		a+=sin(q*55*pow(r,note[int(q*.5)%4][int(q*4)%3]))/i*3;
		lead=q*55*pow(r,lnote[int(q*4)%16]);
		l+=sin(cos(lead/24)+lead*4)*(1-q*4%1)/i*.2;
		t+=sr/i*1.3;
	}
	arp=(q*55*pow(r,note[int(q*.5)%4][int(q*32)%3]-8)%4>2)/1.4;
	bass=q*55*pow(r,note[int(q*.5)%4][2]-12);
	b=sin(sin(bass/4)+bass/4)*(1-q*.5%1)/2;
	mixer = [[l,l],[l+b,l+b],
	[(l/1.8)+(a/32)+((a>0)/((sin(q*.1)*3)+8))+b+(arp*cos(q*.5)*.2),(l/1.5)+(a/50)+((a>0)/((cos(q*.1)*2)+5))+b+(arp*sin(q*.5)*.2)]];
	return mixer[int((q-4)/8)<3?int((q-8)/8)%3:2];
}