class audioProcessor extends AudioWorkletProcessor {
	constructor(...args) {
		super(...args);
		this.audioSample = 0;
		this.byteSample = 0;
		this.errorDisplayed = true;
		this.func = () => 0;
		this.getByteValue = (funcValue, ch) => {
			this.lastByteValue[ch] = NaN;
			this.lastValue[ch] = 0;
		};
		this.isPlaying = false;
		this.playbackSpeed = 1;
		this.lastByteValue = [NaN, NaN];
		this.lastFlooredTime = -1;
		this.lastFuncValue = [NaN, NaN];
		this.lastValue = [0, 0];
		this.mode = 'Bytebeat';
		this.sampleRatio = 1;
		Object.seal(this);
		audioProcessor.deleteGlobals();
		audioProcessor.freezeGlobals();
		this.port.addEventListener('message', e => this.receiveData(e.data));
		this.port.start();
	}
	static deleteGlobals() {
		// Delete single letter variables to prevent persistent variable errors (covers a good enough range)
		for(let i = 0; i < 26; ++i) {
			delete globalThis[String.fromCharCode(65 + i)];
			delete globalThis[String.fromCharCode(97 + i)];
		}
		// Delete global variables
		for(const name in globalThis) {
			if(Object.prototype.hasOwnProperty.call(globalThis, name)) {
				delete globalThis[name];
			}
		}
	}
	static freezeGlobals() {
		Object.getOwnPropertyNames(globalThis).forEach(name => {
			const prop = globalThis[name];
			const type = typeof prop;
			if((type === 'object' || type === 'function') && name !== 'globalThis') {
				Object.freeze(prop);
			}
			if(type === 'function' && Object.prototype.hasOwnProperty.call(prop, 'prototype')) {
				Object.freeze(prop.prototype);
			}
			Object.defineProperty(globalThis, name, { writable: false, configurable: false });
		});
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
	process(inputs, [chData], parameters) {
		const chDataLen = chData[0].length;
		if(!chDataLen || !this.isPlaying) {
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
				const t = Math.floor(byteSample);
				try {
					funcValue = this.func(t);
				} catch(err) {
					if(this.errorDisplayed) {
						this.errorDisplayed = false;
						this.sendData({
							error: {
								message: audioProcessor.getErrorMessage(err, t),
								isRuntime: true
							}
						});
					}
					funcValue = NaN;
				}
				funcValue = Array.isArray(funcValue) ? [funcValue[0], funcValue[1]] : [funcValue, funcValue];
				let hasValue = false;
				let ch = 2;
				while(ch--) {
					try {
						funcValue[ch] = +funcValue[ch];
					} catch(err) {
						funcValue[ch] = NaN;
					}
					const funcValueCh = funcValue[ch];
					const lastFuncValueCh = this.lastFuncValue[ch];
					if(funcValueCh !== lastFuncValueCh) {
						if(!isNaN(funcValueCh)) {
							this.getByteValue(funcValueCh, ch);
							hasValue = true;
						} else if(!isNaN(lastFuncValueCh)) {
							this.lastByteValue[ch] = NaN;
							hasValue = true;
						}
					}
				}
				if(hasValue) {
					drawBuffer.push({ t, value: [this.lastByteValue[0], this.lastByteValue[1]] });
				}
				byteSample += flooredTime - this.lastFlooredTime;
				this.lastFuncValue = funcValue;
				this.lastFlooredTime = flooredTime;
			}
			chData[0][i] = this.lastValue[0];
			chData[1][i] = this.lastValue[1];
		}
		if(Math.abs(byteSample) > Number.MAX_SAFE_INTEGER) {
			this.resetTime();
			return true;
		}
		this.audioSample += chDataLen;
		let isSend = false;
		const data = {};
		if(byteSample !== this.byteSample) {
			isSend = true;
			data.byteSample = this.byteSample = byteSample;
		}
		if(drawBuffer.length) {
			isSend = true;
			data.drawBuffer = drawBuffer;
		}
		if(isSend) {
			this.sendData(data);
		}
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
		if(data.playbackSpeed !== undefined) {
			const sampleRatio = this.sampleRatio / this.playbackSpeed;
			this.playbackSpeed = data.playbackSpeed;
			this.setSampleRatio(sampleRatio);
		}
		if(data.mode !== undefined) {
			this.mode = data.mode;
			this.getByteValue = this.mode === 'Bytebeat' ? (funcValue, ch) => {
				this.lastByteValue[ch] = funcValue & 255;
				this.lastValue[ch] = this.lastByteValue[ch] / 127.5 - 1;
			} : this.mode === 'Signed Bytebeat' ? (funcValue, ch) => {
				this.lastByteValue[ch] = (funcValue + 128) & 255;
				this.lastValue[ch] = this.lastByteValue[ch] / 127.5 - 1;
			} : this.mode === 'Floatbeat' ? (funcValue, ch) => {
				this.lastValue[ch] = Math.max(Math.min(funcValue, 1), -1);
				this.lastByteValue[ch] = Math.round((this.lastValue[ch] + 1) * 127.5);
			} : (funcValue, ch) => {
				this.lastByteValue[ch] = NaN;
				this.lastValue[ch] = 0;
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
		this.audioSample = 0;
		this.lastValue = [0, 0];
		this.lastByteValue = this.lastFuncValue = [NaN, NaN];
		this.lastFlooredTime = -1;
	}
	setFunction(codeText) {
		// Create shortened Math functions
		const params = Object.getOwnPropertyNames(Math);
		const values = params.map(k => Math[k]);
		params.push('int', 'window');
		values.push(Math.floor, globalThis);
		audioProcessor.deleteGlobals();
		// Optimize code like eval(unescape(escape`XXXX`.replace(/u(..)/g,"$1%")))
		codeText = codeText.trim().replace(
			/^eval\(unescape\(escape`(.*?)`.replace\(\/u\(\.\.\)\/g,["']\$1%["']\)\)\)$/,
			(match, m1) => unescape(escape(m1).replace(/u(..)/g, '$1%')));
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
		this.sampleRatio = sampleRatio * this.playbackSpeed;
		this.lastFlooredTime = Math.floor(this.sampleRatio * this.audioSample) - flooredTimeOffset;
	}
}

registerProcessor('audioProcessor', audioProcessor);
