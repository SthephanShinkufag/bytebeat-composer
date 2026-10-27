class audioProcessor extends AudioWorkletProcessor {
	constructor(...args) {
		super(...args);
		this.audioSample = 0;
		this.byteSample = 0;
		this.drawMode = 'Points';
		this.errorDisplayed = true;
		this.func = null;
		this.getValues = null;
		this.isFuncbeat = false;
		this.isPlaying = false;
		this.lastByteValue = [null, null];
		this.lastFuncValue = [null, null];
		this.lastTime = -1;
		this.outValue = [0, 0];
		this.playbackSpeed = 1;
		this.sampleRate = 8000;
		this.sampleRatio = 1;
		this.srDivisor = 1;
		// Allocate a fixed flat array for sending graphics points (t, valL, valR)
		this.drawBufferRaw = new Float32Array(128 * 3);
		Object.seal(this);
		audioProcessor.deleteGlobals();
		audioProcessor.freezeGlobals();
		this.port.addEventListener('message', e => this.receiveData(e.data));
		this.port.start();
	}

	// Deleting global variables
	static deleteGlobals() {
		// Delete single letter variables to prevent persistent variable errors (covers a good enough range)
		for(let i = 0; i < 26; ++i) {
			delete globalThis[String.fromCharCode(65 + i)];
			delete globalThis[String.fromCharCode(97 + i)];
		}
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

	// Errors handling
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

	// Core calculations to obtain values and write them to the buffer
	process(inputs, [chData]) {
		const chDataLen = chData[0].length;
		if(!chDataLen || !this.isPlaying) {
			return true;
		}
		let { // Local caching to offload the JIT optimizer
			byteSample,
			errorDisplayed,
			func,
			getValues,
			isFuncbeat,
			sampleRate,
			sampleRatio,
			srDivisor
		} = this;
		let time = sampleRatio * this.audioSample;
		let drawIdx = 0; // Position pointer in a flat array
		const isDiagram = this.drawMode === 'Combined' || this.drawMode === 'Diagram';
		const drawRaw = this.drawBufferRaw;
		const outVal = this.outValue;
		for(let i = 0; i < chDataLen; ++i) {
			time += sampleRatio;
			const currentTime = Math.floor(time / srDivisor) * srDivisor;
			if(this.lastTime !== currentTime) {
				let funcValue;
				const currentSample = Math.floor(byteSample / srDivisor) * srDivisor;
				try {
					funcValue = isFuncbeat ? func(currentSample / sampleRate, sampleRate) :
						func(currentSample);
				} catch(err) {
					if(errorDisplayed) {
						errorDisplayed = false;
						this.sendData({
							error: {
								message: audioProcessor.getErrorMessage(err, currentSample),
								isRuntime: true
							}
						});
					}
					funcValue = NaN;
				}

				// Eliminate memory allocation for arrays in the case of mono signals
				const isArrayValue = Array.isArray(funcValue);
				let fv0 = isArrayValue ? funcValue[0] : funcValue;
				let fv1 = isArrayValue ? funcValue[1] : funcValue;

				fv0 = +fv0;
				fv1 = +fv1;
				let hasValue = false;

				// Channel 1 (Right)
				if(isDiagram) {
					if(!isNaN(fv1)) {
						outVal[1] = getValues(fv1, 1);
					} else {
						this.lastByteValue[1] = NaN;
					}
					hasValue = true;
				} else if(fv1 !== this.lastFuncValue[1]) {
					if(!isNaN(fv1)) {
						outVal[1] = getValues(fv1, 1);
						hasValue = true;
					} else if(!isNaN(this.lastFuncValue[1])) {
						this.lastByteValue[1] = NaN;
						hasValue = true;
					}
				}

				// Channel 0 (Left)
				if(isDiagram) {
					if(!isNaN(fv0)) {
						outVal[0] = getValues(fv0, 0);
					} else {
						this.lastByteValue[0] = NaN;
					}
					hasValue = true;
				} else if(fv0 !== this.lastFuncValue[0]) {
					if(!isNaN(fv0)) {
						outVal[0] = getValues(fv0, 0);
						hasValue = true;
					} else if(!isNaN(this.lastFuncValue[0])) {
						this.lastByteValue[0] = NaN;
						hasValue = true;
					}
				}

				if(hasValue) {
					// Serialize the data directly into a flat array
					drawRaw[drawIdx++] = currentSample;
					drawRaw[drawIdx++] = this.lastByteValue[0];
					drawRaw[drawIdx++] = this.lastByteValue[1];
				}
				byteSample += currentTime - this.lastTime;
				this.lastFuncValue[0] = fv0;
				this.lastFuncValue[1] = fv1;
				this.lastTime = currentTime;
			}
			chData[0][i] = outVal[0];
			chData[1][i] = outVal[1];
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
		if(drawIdx > 0) {
			isSend = true;
			// Create a quick Float32Array slice of exactly the size needed for the current quantum
			data.drawBuffer = new Float32Array(drawRaw.buffer, 0, drawIdx);
		}
		if(isSend) {
			if(data.drawBuffer) {
				// Send data using the Zero-Copy Transferable Object method. How Zero-Copy works:
				// The browser instantly (in 0 ms) redirects the pointer to this memory buffer from the worker
				// to the main thread (in index.js). The memory in the worker is cleared (its size becomes 0).
				this.port.postMessage(data, [data.drawBuffer.buffer]);
				// Reallocate the internal array, since the old memory buffer has "flown off" to the UI thread
				this.drawBufferRaw = new Float32Array(128 * 3);
			} else {
				// If data contains only the byteSample value (the current timecode)
				// but the worker has not generated any new points for the graph.
				this.sendData(data);
			}
		}
		return true;
	}

	// Handler for received commands
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
		if(data.srDivisor !== undefined) {
			this.srDivisor = data.srDivisor;
		}
		if(data.playbackSpeed !== undefined) {
			const sampleRatio = this.sampleRatio / this.playbackSpeed;
			this.playbackSpeed = data.playbackSpeed;
			this.setSampleRatio(sampleRatio);
		}
		if(data.mode !== undefined) {
			this.isFuncbeat = data.mode === 'Funcbeat';
			switch(data.mode) {
			case 'Bytebeat':
				this.getValues = (funcValue, ch) => (this.lastByteValue[ch] = funcValue & 255) / 127.5 - 1;
				break;
			case 'Signed Bytebeat':
				this.getValues = (funcValue, ch) =>
					(this.lastByteValue[ch] = (funcValue + 128) & 255) / 127.5 - 1;
				break;
			case 'Floatbeat':
			case 'Funcbeat':
				this.getValues = (funcValue, ch) => {
					const outValue = Math.max(Math.min(funcValue, 1), -1);
					this.lastByteValue[ch] = Math.round((outValue + 1) * 127.5);
					return outValue;
				};
				break;
			default: this.getValues = (funcValue, ch) => (this.lastByteValue[ch] = NaN);
			}
		}
		if(data.drawMode !== undefined) {
			this.drawMode = data.drawMode;
		}
		if(data.setFunction !== undefined) {
			this.setFunction(data.setFunction);
		}
		if(data.resetTime === true) {
			this.resetTime();
		}
		if(data.sampleRate !== undefined) {
			this.sampleRate = data.sampleRate;
		}
		if(data.sampleRatio !== undefined) {
			this.setSampleRatio(data.sampleRatio);
		}
	}

	// Data sending
	sendData(data) {
		this.port.postMessage(data);
	}

	// Set time to 0
	resetTime() {
		this.byteSample = 0;
		this.resetValues();
		this.sendData({ byteSample: 0 });
	}

	// Reset calculations
	resetValues() {
		this.audioSample = 0;
		this.lastByteValue = [null, null];
		this.lastFuncValue = [null, null];
		this.lastTime = -1;
		this.outValue = [0, 0];
	}

	// Parsing text into function and preparing it for execution
	setFunction(codeText) {
		// Create shortened Math functions
		const params = Object.getOwnPropertyNames(Math);
		const values = params.map(k => Math[k]);
		params.push('int', 'window');
		values.push(Math.floor, globalThis);
		audioProcessor.deleteGlobals();
		// Code testing
		let isCompiled = false;
		const oldFunc = this.func;
		try {
			if(this.isFuncbeat) {
				this.func = new Function(...params, codeText).bind(globalThis, ...values);
			} else {
				// Optimize code like eval(unescape(escape`XXXX`.replace(/u(..)/g,"$1%")))
				codeText = codeText.trim().replace(
					/^eval\(unescape\(escape(?:`|\('|\("|\(`)(.*?)(?:`|'\)|"\)|`\)).replace\(\/u\(\.\.\)\/g,["'`]\$1%["'`]\)\)\)$/,
					(match, m1) => unescape(escape(m1).replace(/u(..)/g, '$1%')));
				this.func = new Function(...params, 't', `return 0,\n${ codeText || 0 };`)
					.bind(globalThis, ...values);
			}
			isCompiled = true;
			if(this.isFuncbeat) {
				this.func = this.func();
				this.func(0, this.sampleRate);
			} else {
				this.func(0);
			}
		} catch(err) {
			if(!isCompiled) {
				this.func = oldFunc;
			}
			this.errorDisplayed = false;
			this.sendData({
				error: { message: audioProcessor.getErrorMessage(err, isCompiled ? 0 : null), isCompiled },
				updateUrl: isCompiled
			});
			return;
		}
		this.errorDisplayed = false;
		this.sendData({ error: { message: '', isCompiled }, updateUrl: true });
	}

	// Get sample parameters
	setSampleRatio(sRatio) {
		const timeOffset = Math.floor(this.sampleRatio * this.audioSample) - this.lastTime;
		this.sampleRatio = sRatio * this.playbackSpeed;
		this.lastTime = Math.floor(this.sampleRatio * this.audioSample) - timeOffset;
	}
}

registerProcessor('audioProcessor', audioProcessor);
