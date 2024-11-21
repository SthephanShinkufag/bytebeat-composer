OUTPUT=t&&(

X=((t>>8&511)/128-2.5),
Y=((t&255)/64-2),

C = cN(X,Y),

Z=cN(0,0),

f=(z)=>(z.powerTo(2).add(C.real,C.imag)),

(_=>{

	for(let i=0;i<32;i++) {
		Z = f(Z)
		if(Z.abs.r>4) Z = cN(5,5)
	}
})(),

Z.abs.r>4?1:-1

),

cN = function (r,i){
	return new ComplexNumber(r,i)
},

this.ComplexNumber??= class {
	constructor(real, imag) {
		this.real = real;
		this.imag = imag??0;
	}
	get r() {
		return this.real
	}
	get i() {
		return this.imag
	}
	set r(v) {
		this.real = v
	}
	set i(v) {
		this.imag = v
	}
	conjugate() {
		return new ComplexNumber(this.real, -this.imag);
	}
	add(val, valImag) {
		return new ComplexNumber(this.real + val, this.imag + (valImag??0));
	}
	subtract(val, valImag) {
		return new ComplexNumber(this.real - val, this.imag - (valImag??0));
	}
	multiply(val, valImag) {
		if (valImag !== undefined) {
			const newReal = this.real * val - this.imag * valImag;
			const newImag = this.real * valImag + this.imag * val;
			return new ComplexNumber(newReal, newImag);
		}
		else {
			return new ComplexNumber(this.real * val, this.imag * val);
		}
	}
	divide(val, valImag) {
		if (valImag !== undefined) {
			const divisor = val * val + valImag * valImag;
			const newReal = (this.real * val + this.imag * valImag) / divisor;
			const newImag = (this.imag * val - this.real * valImag) / divisor;
			return new ComplexNumber(newReal, newImag);
		}
		else {
			return new ComplexNumber(this.real / val, this.imag / val);
		}
	}
	powerTo(val, valImag) {
		const magnitude = Math.sqrt(this.real ** 2 + this.imag ** 2);
		const angle = Math.atan2(this.imag, this.real);
		if (valImag !== undefined) {
			const lnMagnitude = Math.log(magnitude);
			const lnAngle = Math.atan2(this.imag, this.real);
			const powerMagnitude = Math.exp(lnMagnitude * val - lnAngle * valImag);
			const powerAngle = lnAngle * val + lnMagnitude * valImag;
			const real = powerMagnitude * Math.cos(powerAngle);
			const imag = powerMagnitude * Math.sin(powerAngle);
			return new ComplexNumber(real, imag);
		}
		else {
			const newMagnitude = magnitude ** val;
			const newAngle = angle * val;
			const real = newMagnitude * Math.cos(newAngle);
			const imag = newMagnitude * Math.sin(newAngle);
			return new ComplexNumber(real, imag);
		}
	}
	get theta() { // Get angle
		return new ComplexNumber(Math.atan2(this.imag, this.real));
	}
	get abs() { // Get magnitude
		return new ComplexNumber(Math.sqrt(this.real ** 2 + this.imag ** 2));
	}
	out(stereo=0) {
		return stereo?[this.real,this.imag]:(this.real+this.imag)/2
	}
},

OUTPUT