//by hcdphobe
const tuning=435
const r=2.0934333333334
const keytone=3
const volume=80
const bpm=111
var _E=_G=0 //it's preventing us from redeclaring E so we declare _E for chord (and also we declare _G for bass)
note=(hz,a=0,b=0)=>{
	return (x,d)=>{
		return (a+=b+=(hz*2**((x+keytone)/12)-b)/20)/d
	}
}
const N=4 //length for fm
const G=Array.from({length:N},()=>note(tuning)),S=Array(R=N+2) //4 fm + kick + hat
const D=[
	[0,-1,5,7],
	[7,8,9,4],
	[4,4,5,4],
] //chord arrays
const BASSNTE=[0,-1,-3,-1] //bass arrays
const HATARR=[0,0,1,0,0,0,1,0,0,0,1,1,0,0,1,0]
return (a,s)=>{
	if(S.length <= R){
		const b=a*bpm/60
		const e=60/bpm
		_E+=(b%1-_E)/32
		_G+=(.5-b%.5-_G)/32
		var output=0
		for(const f in D){
			let C=G[f](D[f][Q=b>>2&3],s)*PI //we shall use let instead of var for local variables
			S[f]=sin(C+sin(C*3)*(.75+_E**2))/3*_E
		}
		{
			let C=G[3]((b*2&3)==3?16:BASSNTE[Q]+(b*2&1?12:0),s)*PI/8
			S[3]=sin(C+sin(C)*_G*16)
		}
		S[4]=sin(log(a%e)**2*2)/exp(a%e)**8
		S[5]=(random()-.5+(a*r*2**15&1?.25:-.25)/1.5)/exp(b%.25)**24*HATARR[b*4&15]
		//---------
		for(const f of S){
			if(f)output+=f
		}
		return output/3*volume/100
	}else throw `length of S is more than R=${R}`
}