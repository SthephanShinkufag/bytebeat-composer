class audioProcessor extends AudioWorkletProcessor {
	constructor(...args) {
		super(...args);
		this.audioSample = 0;
		this.byteSample = 0;
		this.errorDisplayed = true;
		this.func = () => 0;
		this.getByteValue = null;
		this.isPlaying = false;
		this.lastByteValue = NaN;
		this.lastFlooredTime = -1;
		this.lastFuncValue = NaN;
		this.lastValue = 0;
		this.mode = 'Bytebeat';
		this.sampleRatio = 1;
		this.port.onmessage = ({ data }) => this.receiveData(data);
	}
	static getErrorMessage(err, time) {
		const when = time === null ? 'compilation' : 't=' + time;
		if(!(err instanceof Error)) {
			return `${ when } thrown: ${ typeof err === 'string' ? err : JSON.stringify(err) }`;
		}
		const { message, lineNumber, columnNumber } = err;
		return `${ when } error: ${ typeof message === 'string' ? message : JSON.stringify(message) }${
			typeof lineNumber === 'number' && typeof columnNumber === 'number' ?
				` (at line ${ lineNumber - 3 }, character ${ +columnNumber })` : '' }`;
	}
	process(inputs, outputs, parameters) {
		const chData = outputs[0][0];
		const chDataLen = chData.length;
		if(!chDataLen) {
			return true;
		}
		if(!this.isPlaying) {
			chData.fill(0);
			return true;
		}
		let time = this.sampleRatio * this.audioSample;
		let { byteSample } = this;
		const drawBuffer = [];
		for(let i = 0; i < chDataLen; ++i) {
			time += this.sampleRatio;
			const flooredTime = Math.floor(time);
			if(this.lastFlooredTime !== flooredTime) {
				let funcValue;
				const flooredSample = Math.floor(byteSample);
				try {
					funcValue = +this.func(flooredSample);
				} catch(err) {
					if(this.errorDisplayed) {
						this.errorDisplayed = false;
						this.sendData({
							error: {
								message: audioProcessor.getErrorMessage(err, flooredSample),
								isRuntime: true
							}
						});
					}
					funcValue = NaN;
				}
				if(funcValue !== this.lastFuncValue) {
					if(isNaN(funcValue)) {
						if(!isNaN(this.lastFuncValue)) {
							this.lastByteValue = NaN;
							drawBuffer.push({ t: flooredSample, value: NaN });
						}
					} else {
						this.getByteValue(funcValue);
						drawBuffer.push({ t: flooredSample, value: this.lastByteValue });
					}
				}
				byteSample += flooredTime - this.lastFlooredTime;
				this.lastFuncValue = funcValue;
				this.lastFlooredTime = flooredTime;
			}
			chData[i] = this.lastValue;
		}
		if(Math.abs(byteSample) > Number.MAX_SAFE_INTEGER) {
			this.resetTime();
			return true;
		}
		this.audioSample += chDataLen;
		this.byteSample = byteSample;
		this.sendData({ drawBuffer, byteSample });
		return true;
	}
	receiveData(data) {
		if(data.byteSample !== undefined) {
			this.byteSample = +data.byteSample || 0;
			this.resetValues();
		}
		if(data.errorDisplayed === true) {
			this.errorDisplayed = true;
		}
		if(data.isPlaying !== undefined) {
			this.isPlaying = data.isPlaying;
		}
		if(data.mode !== undefined) {
			this.mode = data.mode;
			this.getByteValue = this.mode === 'Bytebeat' ? funcValue => {
				this.lastByteValue = funcValue & 255;
				this.lastValue = this.lastByteValue / 127.5 - 1;
			} : this.mode === 'Signed Byteveat' ? funcValue => {
				this.lastByteValue = (funcValue + 128) & 255;
				this.lastValue = this.lastByteValue / 127.5 - 1;
			} : this.mode === 'Floatbeat' ? funcValue => {
				this.lastValue = Math.max(Math.min(funcValue, 1), -1);
				this.lastByteValue = Math.round((this.lastValue + 1) * 127.5);
			} : funcValue => {
				this.lastByteValue = NaN;
				this.lastValue = 0;
			};
		}
		if(data.setFunction !== undefined) {
			this.setFunction(data.setFunction);
		}
		if(data.resetTime === true) {
			this.resetTime();
		}
		if(data.sampleRatio !== undefined) {
			this.setSampleRatio(data.sampleRatio);
		}
	}
	sendData(data) {
		this.port.postMessage(data);
	}
	resetTime() {
		this.byteSample = 0;
		this.resetValues();
		this.sendData({ byteSample: 0 });
	}
	resetValues() {
		this.audioSample = this.lastValue = 0;
		this.lastByteValue = this.lastFuncValue = NaN;
		this.lastFlooredTime = -1;
	}
	setFunction(codeText) {
		// Create shortened Math functions
		const params = Object.getOwnPropertyNames(Math);
		const values = params.map(k => Math[k]);
		params.push('int', 'window');
		values.push(Math.floor, globalThis);
		// Delete single letter variables to prevent persistent variable errors (covers a good enough range)
		for(let i = 0; i < 26; ++i) {
			delete globalThis[String.fromCharCode(65 + i)];
			delete globalThis[String.fromCharCode(97 + i)];
		}
		// Delete global variables
		for(const i in globalThis) {
			if(Object.prototype.hasOwnProperty.call(globalThis, i)) {
				delete globalThis[i];
			}
		}
		// Optimize code like eval(unescape(escape`XXXX`.replace(/u(..)/g,"$1%")))
		let hasEscapeCode = false;
		codeText = codeText.trim().replace(
			/^eval\(unescape\(escape`(.*?)`.replace\(\/u\(\.\.\)\/g,["']\$1%["']\)\)\)$/,
			...match => (hasEscapeCode = true, match[1]));
		if(hasEscapeCode) {
			codeText = unescape(escape(codeText).replace(/u(..)/g, '$1%'));
		}
		// Bytebeat code testing
		let isCompiled = false;
		const oldFunc = this.func;
		try {
			this.func = new Function(...params, 't', `return 0,\n${ codeText || 0 };`)
				.bind(globalThis, ...values);
			isCompiled = true;
			this.func(0);
		} catch(err) {
			if(!isCompiled) {
				this.func = oldFunc;
			}
			this.errorDisplayed = false;
			this.sendData({
				error: {
					message: audioProcessor.getErrorMessage(err, isCompiled ? 0 : null),
					isCompiled
				},
				updateUrl: isCompiled
			});
			return;
		}
		this.errorDisplayed = false;
		this.sendData({ error: { message: '', isCompiled }, updateUrl: true });
	}
	setSampleRatio(sampleRatio) {
		const flooredTimeOffset = Math.floor(this.sampleRatio * this.audioSample) - this.lastFlooredTime;
		this.sampleRatio = sampleRatio;
		this.lastFlooredTime = Math.floor(sampleRatio * this.audioSample) - flooredTimeOffset;
	}
}

registerProcessor('audioProcessor', audioProcessor);
