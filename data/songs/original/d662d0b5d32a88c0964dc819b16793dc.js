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
},

p=[1.5,1.79,2,1,1,2,1,1,1.6,1,1,1.5,1,1,1.2,1][(t>>12)%16]*[1,1,1.5,1.34][3&t>>17]*t,

a=new ComplexNumber(p,p).multiply(1,2),

[a.r,a.i]