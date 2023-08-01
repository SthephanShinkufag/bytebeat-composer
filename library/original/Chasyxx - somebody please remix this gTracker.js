createFilters=(...names)=>{for(i of names){this[i]??={a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0}}},
useFilter=(value,name,amount=0.5,stage='h',acidity=0.9)=>(
z=acidity+acidity/(1-amount),
this[name].a+=amount*(value-this[name].a+z*(this[name].a-this[name].b)),
this[name].b+=amount*(this[name].a-this[name].b),
this[name].c+=amount*(this[name].b-this[name].c),
this[name].d+=amount*(this[name].c-this[name].d),
this[name].e+=amount*(this[name].d-this[name].e),
this[name].f+=amount*(this[name].e-this[name].f),
this[name].g+=amount*(this[name].f-this[name].g),
this[name].h+=amount*(this[name].g-this[name].h),
this[name][stage]
),useFilterHi=(value,name,amount=0.5,stage='h',acidity=0.9)=>(
value-useFilter(value,name,amount,stage,acidity)
),createFilters('filter')

,a=(x)=>(((x&x+(t>>8))&128)+((x&x+(t>>7))&64)+((x&x+(t>>6))&32)+((x&x+(t>>5))&16)+((x&x+(t>>4))&8)+((x&x+(t>>3))&4)+((x&x+(t>>2))&2)+((x&x+(t>>1))&1)),

aa=(x)=>a(x|x+0b1010101+(t>>5))^(x|x+(t>>6)),

t/=4,

this.LFSR??=65535,

this.noise??= function(t,o=2,w=0) {


	//if (t<2) {console.error("start")}

	processLFSR = function(width=0) {
		S=width?100000100000000:100000000000000
		trade =(a,b)=>(LFSR[a] = LFSR[b])
		temp= LFSR&1^((LFSR&2)>>1)
		LFSR>>=1,
		LFSR = (temp ? (LFSR|S) : (LFSR&~S))
	}

	if ((t%(1<<(o)))==0) {
	processLFSR(w)
	//console.log(LFSR)
	v=LFSR&1
	}
	return v*128

},

this.track??=
[/*
 N SS SS*/
'2 L3 L1',
'  P2 P1',
'  I2 I1',

'0 I3 I1',
'  P2 P1',
'  I2 I1',

'2 L3 L1',
'  P2 P1',
'  I2 I1',

'0 I3 I1',
'  P2 P1',
'  I2 I1',

'2 L3 L1',
'  P2 P1',
'0 I3 I1',
'  I2 I1',



'2 N3 N1',
'  P2 P1',
'  I2 I1',

'0 I3 I1',
'  P2 P1',
'  E2 E1',

'2 N3 N1',
'  Q2 Q1',
'  I2 I1',

'0 K3 K1',
'  S2 S1',
'  N2 N1',

'2 N3 N1',
'  S2 S1',
'0 B3 B1',
'  K3 K1',




'2 P3 P1',
'  P2 P1',
'  I2 I1',

'0 L3 L1',
'  P2 P1',
'  I2 I1',

'2 P3 P1',
'  P2 P1',
'  I2 I1',

'0 L3 L1',
'  P2 P1',
'  I2 I1',

'2 P3 P1',
'  P2 P1',
'0 L3 L1',
'  I2 I1',



'2 P3 P1',
'  P2 P1',
'  I2 I1',

'0 L3 L1',
'  P2 P1',
'  I2 I1',

'2 P3 P1',
'  P2 P1',
'  Z2 Z1',

'0 E3 E1',
'  S2 S1',
'  W2 W1',

'2 N2 N1',
'  S2 S1',
'0 I3 I1',
'  W2 W1',



// segment 2

'2 L3 L1',
'  L2 L1',
'  E2 E1',

'0 I3 I1',
'  L2 L1',
'  E2 E1',

'2 L3 L1',
'  L2 L1',
'  I2 I1',

'0 I3 I1',
'  L2 L1',
'  E2 E1',

'2 N3 N1',
'  L2 L1',
'0 I3 I1',
'  I2 I1',



'2 K3 K1',
'  N2 N1',
'  G2 G1',

'0 G3 G1',
'  N2 N1',
'  G2 G1',

'2 K3 K1',
'  N2 N1',
'  G2 G1',

'0 G3 G1',
'  G2 G1',
'  N2 N1',

'2 L3 L1',
'  W2 W1',
'0 I3 I1',
'  N3 N1',




'2 P3 P1',
'  P2 P1',
'  I2 I1',

'0 L3 L1',
'  P2 P1',
'  I2 I1',

'2 P3 P1',
'  P2 P1',
'  I2 I1',

'0 L3 L1',
'  P2 P1',
'  I2 I1',

'2 P3 P1',
'  P2 P1',
'0 L3 L1',
'  I2 I1',



'2 P3 P1',
'  P2 P1',
'  I2 I1',

'0 L3 L1',
'  P2 P1',
'  I2 I1',

'2 P3 P1',
'  P2 P1',
'  Z2 Z1',

'0 E3 E1',
'  S2 S1',
'  W2 W1',

'2 N2 N1',
'  S2 S1',
'0 I3 I1',
'  W2 W1',
],
o0= (note,oct,amp) => (((t*4)*2**((note/12)+oct))&128)/(128/amp), // Square wave synth
o1= (note,oct,amp) => (temp=(((t*4)*2**((note/12)+oct))&255),temp>128?255-temp:temp)/(128/amp), // Triangle wave synth
i=(t*1.2)>>2,	// Noise fade
r=int(i>>8)%track.length,
STR=track[r]??'      1 ', // Tracker
i&=255, // Noise fade pt 2

N=STR[0]==' '?0:noise(t,STR[0],0)/max(1,i/64),				 // Noise channel
S1=STR[2]==' '?0:o0(STR.charCodeAt(2)-67,STR[3]-2,128),	// Square channel 1
S2=STR[5]==' '?0:o0(STR.charCodeAt(5)-67,STR[6]-2,128), //  Square channel 2
this.H ??= 0, H++,
((A)=>{
	if(H>260 && A) {
	H=0;
	throw `\nTick.......: ${r+1}/${track.length} ${r>=track.length?' (Track finished) ':''}${''.padEnd((i>>4)&15,';')}`
	+ STR
	.replace(/([\d\s])\s([\w\s][\d\s])\s([\w\s][\d\s])/g,'\n\nNoise....: $1\nSquare1: $2\nSquare2: $3')
	}
})(1), // Change 1 to 0 to disable info
O=(N+S1+S2)*(5/9)//,useFilterHi(O,'filter',0.2,'a',0.6)/1.2+128