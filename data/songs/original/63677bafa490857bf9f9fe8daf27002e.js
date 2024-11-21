lerp=(a,amt,b)=>((a*(1-amt))+(b*amt)),
$=_=>{throw _},

rev=(input,a,len,name='reverb_channel',len2)=>{
	if(this[name] == undefined)
		this[name]={array: Array(len2??len).fill(0), position:0};
	if(typeof input == 'function') {
		input = input(t,len,len2);
	}
	input&=255;
	let {array, position} = this[name];
	array[position] =
	lerp( array[position], a, input);
	position = (position + 1)%len;
	this[name].position = position;
	return array[position==0?len-1:position-1]
},
btc=(input,amt,name='bitcrusher_channel')=>(this[name]=((t%amt)<1)?input:this[name]),
//t*'=k3b1BCbvZXZkBCalJHIh5GZgk3b1ByapxGblRGIovmc'.charCodeAt(t>>8),
R=t/22e4,
beat=R*16,
bar=beat>>4&3,
beat&=15,

S=((R*(bar==3?16:(bar==2&&beat==15?32:8)))%1),

FALLING_NOTE_1=(this.FALLING_NOTE_1??0)+lerp(3.5,((R%1)**2),0.5),
FALLING_NOTE=rev(FALLING_NOTE_1,0.5,4096)*lerp(0.5,((R%1)**2),4/3),
BEAT_1=sin(6/S),
BEAT=(S<0.08||bar==3||(bar==2&&beat==15))&&(BEAT_1*48+96),
BASS_1=rev( (((t/1.15)&224)*(((R*32)%1)<0.25?1.5:0.7)) ,0.5,1024,'rv2')*1.3,

STING_1=(this.STING_1??0)+lerp(1,sin(((R*16)%1)*PI*0.7)**0.7,3.8),
STING_1A=STING_1*((t&3)?1:2),
STING_2=beat&1&&sin(STING_1A/128*PI+sin(STING_1A/128*PI+sin(STING_1A/128*PI*3.96)*1.5))*32+32,
STING=bar&2&&rev(rev(STING_2,0.6,2e3,'rv3'),0.6,2e4,'rv4')*5,

min(255,max(0,
	(
		(
			btc(BEAT,bar&2?9:3)*1.8||FALLING_NOTE
		)+(
			(bar==3||(bar==2&&beat==15))&&FALLING_NOTE-192
		)+BASS_1+STING
	)/(bar&2?2.3:2.1)-(bar&2||32)
))