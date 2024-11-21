128+a();
function a(){
	k=22050;
	tk=int(t*11.5/k)%96;
	return c(tk)+c(tk-4)/10+(6-tk%6)*((tk%6>2&&tk%6<4)?(random()*128):0)/24;
}
function c(tk){
	o1=d(b("000fffjj0ffhhh0jjjhh0ffff00aa0aa0ccddddff0cc0aa0000mm0mm0kkjjj0hh0ff0hh0000mm0mm0kk0jjjj00hhh000",tk));
	o2=d(b("NNN000000NNNIII000000IIIKKK000000KKKLLL000000LLLGGG000000GGGHHH000000HHHIII000000IIIAAA000000III",tk));
	o3=d(b("000R00000R00000P00000P00000N00000N00000R00000R00000N00000N00000R00000R00000P00000P00000M00000M00",tk)+12);
	return o1+o2+o3;
}
function d(n){ff=pow(2,n/12)*16.4;q=k/ff;return (n==8||n==20)?0:(t%q>=q/2)?16:-16;}
function b(s,p){return s.charCodeAt(p)-40;}