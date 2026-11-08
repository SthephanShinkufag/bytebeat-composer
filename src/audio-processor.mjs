class audioProcessor extends AudioWorkletProcessor {
	constructor(...args) {
		super(...args);
		this.audioSample = 0; // Current time in samples (audio time)
		this.byteSample = 0; // Current time in samples (bytebeat time)
		this.byteSampleSent = 0; // Last time sent to the main script (bytebeat time)
		this.cacheSample = 0; // Current sample index in the cache
		this.drawMode = 'Points';
		this.errorDisplayed = true; // Flag to prevent sending multiple error messages to the main script
		this.func = null; // User-defined function for generating audio samples
		this.getValues = null; // Function to convert raw values to audio samples based on the selected mode
		this.isFuncbeat = false;
		this.isPlaying = false;
		this.lastByteValue = [null, null]; // Last values for L and R channels (used for drawing the scope)
		this.lastFuncValue = [null, null]; // Last raw values for L and R channels
		this.lastTime = -1; // Last processed time (used for checking if the time has changed)
		this.outValue = [0, 0]; // Output values for L and R channels (used for audio output)
		this.playbackSpeed = 1; // Playback speed multiplier
		this.sampleRate = 8000; // The sample rate for bytebeat audio generation
		this.sampleRatio = 1; // Ratio of the sample rate to the audio context's sample rate
		this.srDivisor = 1; // Divisor for sample rate (used for downsampling)

		// Allocate a fixed-size buffer for caching audio samples
		// 2**24 samples / 48000 = 349.525 seconds of audio at 48kHz
		// 2**24 samples * 4 bytes * 2 channels (L and R) will take ~134.2 MB
		this.audioCacheSize = 16777216;
		this.audioCacheL = new Float32Array(this.audioCacheSize);
		this.audioCacheR = new Float32Array(this.audioCacheSize);

		// An array of timestamps. Fill it with -1 (indicating that a cell is empty)
		// 2**24 samples * 4 bytes = ~67.1MB
		this.audioCacheTime = new Int32Array(this.audioCacheSize);
		this.audioCacheTime.fill(-1);

		// Array of strings for caching runtime output in the error console
		this.audioCacheError = new Array(this.audioCacheSize);
		// Flag for controlling the sending of runtime messages
		this.lastSentErrorSample = -1;

		// How far ahead the cache can be filled
		// 2**21 samples / 48000 = 43.69 seconds of audio at 48kHz
		this.audioCacheLimit = 2097152;

		// Allocate a fixed flat array for sending graphics points (time, Left value, Right value)
		this.drawBufferSize = 1024; // Number of points that can be sent at once
		this.drawBuffer = new Float32Array(this.drawBufferSize * 3);
		// Position pointer in the draw buffer
		this.drawIdx = 0;

		// Seal the instance to prevent adding new properties and ensure the structure remains fixed
		Object.seal(this);

		// Delete and freeze global variables to maintain a clean and secure environment
		audioProcessor.deleteGlobals();
		audioProcessor.freezeGlobals();

		// Set up the message port for receiving data from the main thread
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

	// Freezing global variables to prevent modification
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

	// Clear the audio cache and reset the cache sample pointer
	clearAudioCache() {
		this.cacheSample = 0;
		if(this.audioCacheTime) {
			this.audioCacheTime.fill(-1);
		}
		this.lastSentErrorSample = -1;
		if(this.audioCacheError) {
			this.audioCacheError.fill(undefined);
		}
	}

	// Handling code errors and thrown messages
	getErrorMessage(err, time) {
		const when = time === null ? 'compilation' : 't=' + time;

		// Display `throw` messages
		if(!(err instanceof Error)) {
			return `${ when } thrown: ${ typeof err === 'string' ? err : JSON.stringify(err) }`;
		}

		const { message } = err;
		let { lineNumber, columnNumber } = err;

		// If this is a Funcbeat validation error, remove the technical line number
		if(this.isFuncbeat && message === 'this.func is not a function') {
			return `${ when } error: Funcbeat code must return a function!`;
		}

		// Parse err.stack to find a reference to virtual file "user-code.js"
		if(err.stack) {
			// Look for a pattern matching user-code.js:line:character
			const match = err.stack.match(/user-code\.js:(\d+):(\d+)/);
			if(match) {
				lineNumber = parseInt(match[1], 10);
				columnNumber = parseInt(match[2], 10);
			}
		}

		return `${ when } error: ${ typeof message === 'string' ? message : JSON.stringify(message) }${
			typeof lineNumber === 'number' && typeof columnNumber === 'number' ?
				` (at line ${ lineNumber - 3 }, character ${ columnNumber })` : '' }`;
	}

	// Make sound and generate data for the main thread
	makeData(chData) {
		// The standard quantum size in the Web Audio API (chData[0].length) is 128 samples
		//   but can be larger (256, 512, ..) depending on the system
		const chDataLen = chData ? chData[0].length : 128;
		// Data object for sending to the main thread
		// It will be filled with the graphics points, current time, and cache seconds
		const data = {};
		// Destructure frequently used properties
		const { func, getValues, isFuncbeat, outValue, sampleRate } = this;
		// If the drawing mode requires a diagram
		const isDiagram = this.drawMode === 'Combined' || this.drawMode === 'Diagram';

		// --- PAUSE MODE: PRE-CALCULATING CACHE ---
		if(!this.isPlaying) {
			// Sync the cache pointer with the current time if it has fallen behind (e.g., during rewind)
			if(this.cacheSample === undefined || this.cacheSample < this.byteSample) {
				this.cacheSample = this.byteSample;
			}

			// If the cache is too far ahead of the current time, stop caching to avoid overloading
			if(this.cacheSample - this.byteSample > this.audioCacheLimit) {
				return true;
			}

			// How many samples to calculate per single trigger while paused
			let aheadLoops = 512;

			// Loop to pre-calculate audio samples and fill the cache
			while(aheadLoops-- > 0 && (this.cacheSample - this.byteSample <= this.audioCacheLimit)) {
				const currentSample = this.cacheSample;

				// Calculate the cell index in the circular cache array
				const cacheIdx = currentSample % this.audioCacheSize;

				// If the currentSample time point is already cached, just skip the calculation step
				if(this.audioCacheTime[cacheIdx] === currentSample) {
					this.cacheSample++;
					continue;
				}

				let funcValue;
				let currentErrorMsg = null;
				try {
					// Get the raw unscaled value from a user-defined compiled function
					funcValue = isFuncbeat ?
						func(currentSample / sampleRate, sampleRate) : func(currentSample);
				} catch(err) {
					// Extract the error message for the current sample
					currentErrorMsg = this.getErrorMessage(err, currentSample);
					// Set the value to NaN (to highlight the error in red in the visualizer)
					funcValue = NaN;
				}

				// Get left and right channels from the function value
				const isArrayValue = Array.isArray(funcValue);
				const funcValueL = isArrayValue ? funcValue[0] : funcValue;
				const funcValueR = isArrayValue ? funcValue[1] : funcValue;

				// Get the cache values from the current output values
				let cacheValueL = outValue[0];
				let cacheValueR = outValue[1];

				// Scaling the raw values according to the mode (Bytebeat 0..255, Floatbeat -1..1, etc).
				if(isDiagram) {
					if(!isNaN(funcValueL)) {
						outValue[0] = cacheValueL = getValues(funcValueL, 0);
					} else {
						this.lastByteValue[0] = cacheValueL = NaN;
					}
					if(!isNaN(funcValueR)) {
						outValue[1] = cacheValueR = getValues(funcValueR, 1);
					} else {
						this.lastByteValue[1] = cacheValueR = NaN;
					}
				} else {
					if(funcValueL !== this.lastFuncValue[0]) {
						if(!isNaN(funcValueL)) {
							outValue[0] = cacheValueL = getValues(funcValueL, 0);
						} else if(!isNaN(this.lastFuncValue[0])) {
							this.lastByteValue[0] = cacheValueL = NaN;
						}
					}
					if(funcValueR !== this.lastFuncValue[1]) {
						if(!isNaN(funcValueR)) {
							outValue[1] = cacheValueR = getValues(funcValueR, 1);
						} else if(!isNaN(this.lastFuncValue[1])) {
							this.lastByteValue[1] = cacheValueR = NaN;
						}
					}
				}

				// Write the current sample's data to the worker's cache
				this.audioCacheL[cacheIdx] = cacheValueL;
				this.audioCacheR[cacheIdx] = cacheValueR;
				this.audioCacheTime[cacheIdx] = currentSample; // Mark as valid by setting the time
				this.audioCacheError[cacheIdx] = currentErrorMsg; // Store the error message

				// Save the latest modified raw values
				this.lastFuncValue[0] = funcValueL;
				this.lastFuncValue[1] = funcValueR;

				// Serialize the data point into a flat array (t, valL, valR) for the scope visualizer
				if(this.drawIdx < this.drawBuffer.length - 3) {
					this.drawBuffer[this.drawIdx++] = currentSample;
					this.drawBuffer[this.drawIdx++] = this.lastByteValue[0];
					this.drawBuffer[this.drawIdx++] = this.lastByteValue[1];
				}

				// Step one point forward along the cache timeline
				this.cacheSample++;
			}

		// --- PLAY MODE: LIVE CALCULATION ---
		} else {
			// Exit if no channel data is available (e.g., when the audio context is suspended)
			if(!chData || !chDataLen) {
				return true;
			}

			// Caching is permitted only during normal playback mode
			const isCachingAllowed = Math.abs(this.playbackSpeed) === 1 && this.srDivisor === 1;

			// Get the current time based on the last sample
			let time = this.sampleRatio * this.audioSample;

			// Iterate over each sample in the current audio quantum
			for(let i = 0; i < chDataLen; ++i) {
				// Increment the time by the sample ratio for each sample in the quantum
				time += this.sampleRatio;
				const currentTime = Math.floor(time / this.srDivisor) * this.srDivisor;

				// Output old values to the speakers if the time has not changed
				if(this.lastTime === currentTime) {
					chData[0][i] = outValue[0];
					chData[1][i] = outValue[1];
					continue;
				}

				const currentSample = Math.floor(this.byteSample / this.srDivisor) * this.srDivisor;
				let currentErrorMsg = null;

				// Calculate the cell index in the worker's ring cache array
				const cacheIdx = currentSample % this.audioCacheSize;

				// CACHE CHECK: is there already a pre-calculated sample available for this time t?
				if(this.audioCacheTime[cacheIdx] === currentSample) {
					// Instant reading from the cache
					const cacheValueL = this.audioCacheL[cacheIdx];
					const cacheValueR = this.audioCacheR[cacheIdx];

					// Restore the error message from the cache if available
					if(this.audioCacheError[cacheIdx]) {
						currentErrorMsg = this.audioCacheError[cacheIdx];
					}

					// Use the cached values for output if they are valid (not NaN)
					if(!isNaN(cacheValueL)) {
						outValue[0] = cacheValueL;
					}
					if(!isNaN(cacheValueR)) {
						outValue[1] = cacheValueR;
					}

					// Restore the original bytes for the visualizer to work correctly
					this.lastByteValue[0] = Math.round((cacheValueL + 1) * 127.5);
					this.lastByteValue[1] = Math.round((cacheValueR + 1) * 127.5);
				} else {
					// Cache is empty, performing the intensive calculation
					let funcValue;
					try {
						// Get the raw unscaled value from a user-defined compiled function
						funcValue = isFuncbeat ?
							func(currentSample / sampleRate, sampleRate) :
							func(currentSample);
					} catch(err) {
						// Extract the error message for the current sample
						currentErrorMsg = this.getErrorMessage(err, currentSample);
						// Set the value to NaN (to highlight the error in red in the visualizer)
						funcValue = NaN;
					}

					// Get left and right channels from the function value
					const isArrayValue = Array.isArray(funcValue);
					const funcValueL = isArrayValue ? funcValue[0] : funcValue;
					const funcValueR = isArrayValue ? funcValue[1] : funcValue;

					// Get the cache values from the current output values
					let cacheValueL = outValue[0];
					let cacheValueR = outValue[1];

					// Scaling the raw values according to the mode (Bytebeat 0..255, Floatbeat -1..1, etc).
					if(isDiagram) {
						if(!isNaN(funcValueL)) {
							outValue[0] = cacheValueL = getValues(funcValueL, 0);
						} else {
							this.lastByteValue[0] = cacheValueL = NaN;
						}
						if(!isNaN(funcValueR)) {
							outValue[1] = cacheValueR = getValues(funcValueR, 1);
						} else {
							this.lastByteValue[1] = cacheValueR = NaN;
						}
					} else {
						if(funcValueL !== this.lastFuncValue[0]) {
							if(!isNaN(funcValueL)) {
								outValue[0] = cacheValueL = getValues(funcValueL, 0);
							} else if(!isNaN(this.lastFuncValue[0])) {
								this.lastByteValue[0] = cacheValueL = NaN;
							}
						}
						if(funcValueR !== this.lastFuncValue[1]) {
							if(!isNaN(funcValueR)) {
								outValue[1] = cacheValueR = getValues(funcValueR, 1);
							} else if(!isNaN(this.lastFuncValue[1])) {
								this.lastByteValue[1] = cacheValueR = NaN;
							}
						}
					}

					// Write a fresh sample (values and time) to the worker cache.
					// Write only for playing speed of 1 or -1 and divisor of 1,
					//   to prevent the cache from getting cluttered with "gappy" samples
					if(isCachingAllowed) {
						this.audioCacheL[cacheIdx] = cacheValueL;
						this.audioCacheR[cacheIdx] = cacheValueR;
						this.audioCacheTime[cacheIdx] = currentSample; // Mark as valid
						this.audioCacheError[cacheIdx] = currentErrorMsg; // Cache the runtime error
					}

					// Save the latest modified raw values
					this.lastFuncValue[0] = funcValueL;
					this.lastFuncValue[1] = funcValueR;
				}

				// Serialize the data point into a flat array (t, valL, valR) for the scope visualizer
				if(this.drawIdx < this.drawBuffer.length - 3) {
					// Data points are collected from the cache or during live calculation
					this.drawBuffer[this.drawIdx++] = currentSample;
					this.drawBuffer[this.drawIdx++] = this.lastByteValue[0];
					this.drawBuffer[this.drawIdx++] = this.lastByteValue[1];
				}

				// Move the time
				this.byteSample += currentTime - this.lastTime;
				this.lastTime = currentTime;

				// If a new unique error occurred while paused, send it to the main thread
				// Triggered both during live playback and when reading from the cache
				if(currentErrorMsg && this.errorDisplayed && this.lastSentErrorSample !== currentSample) {
					this.errorDisplayed = false;
					this.lastSentErrorSample = currentSample;
					this.sendData({ error: { message: currentErrorMsg, isRuntime: true } });
				}

				// Output obtained values to the speakers
				chData[0][i] = outValue[0];
				chData[1][i] = outValue[1];
			}

			// Reset the time if its value is too large
			if(Math.abs(this.byteSample) > Number.MAX_SAFE_INTEGER) {
				this.resetTime();
				return true;
			}

			// Increment the audio time by the number of samples processed in this quantum
			this.audioSample += chDataLen;
			// Synchronize cacheSample with byteSample so that the cache doesn't fall behind during playback
			this.cacheSample = this.byteSample;
		}

		// Send data if the player is paused (when paused, send data for each individual tick immediately)
		// OR if enough points have accumulated (for 512 samples, drawIdx >= 512 * 3).
		// If the buffer isn't full yet while playing, do NOT send a postMessage during this quantum.
		// The next call to process() will append more points.
		if(!this.isPlaying || this.drawIdx >= 1536) {
			// --- Calculate of the continuous cache preceding the cursor (current byteSample) ---
			let continuousSamples = 0;
			let checkSample = this.byteSample;
			// Check up to audioCacheLimit samples ahead
			while(continuousSamples < this.audioCacheLimit) {
				// If a cell with a time of -1 is encountered (a potential hole in the cache)
				if(this.audioCacheTime[checkSample % this.audioCacheSize] === -1) {
					// Looking ahead: Checking the next few cells (up to 4)
					// If the song's sample rate is greater than 48000, then the step will be greater than 1
					let isRealHole = true;
					for(let lookAhead = 1; lookAhead <= 4; lookAhead++) {
						const lookIdx = (checkSample + lookAhead) % this.audioCacheSize;
						// If there is data a little further - it's not a hole, just a frequency skip
						if(this.audioCacheTime[lookIdx] !== -1) {
							isRealHole = false;
							// Move scanner pointer to this found valid point
							checkSample += lookAhead;
							break;
						}
					}
					// If searched the cells ahead and there is indeed a void - stop the loop
					if(isRealHole) {
						break;
					}
				}
				// If the block is valid, increment the step and continue checking
				// Step in blocks of chDataLen (typically 128) so that the loop executes instantaneously
				continuousSamples += chDataLen;
				checkSample += chDataLen;
			}
			// Pass to the main thread the actual seconds of continuous cache ahead of the cursor
			data.cacheSeconds = Math.max(0, continuousSamples / sampleRate);

			// Send the current byteSample to the main thread if it has changed
			if(this.byteSample !== this.byteSampleSent) {
				data.byteSample = this.byteSampleSent = this.byteSample;
			}

			// Get a chunk of new data points to send to the main thread
			if(this.drawIdx > 0) {
				// Create a quick Float32Array slice of the size needed for the current quantum
				data.drawBuffer = new Float32Array(this.drawBuffer.buffer, 0, this.drawIdx);
			}

			// Send the data to the main thread
			if(data.drawBuffer) {
				// Send data using the Zero-Copy Transferable Object method. How Zero-Copy works:
				// The browser instantly (in 0 ms) redirects the pointer to this memory buffer from the worker
				//   to the main thread (in index.js). The memory in the worker is cleared (size becomes 0).
				this.port.postMessage(data, [data.drawBuffer.buffer]);
				// Reallocate the internal array, since the old buffer has "flown off" to the main thread
				this.drawBuffer = new Float32Array(this.drawBufferSize * 3);
			} else {
				// Use regular sending if the worker has not generated any new points for the graph.
				// The data contains only the byteSample value (the current timecode).
				this.sendData(data);
			}

			// Reset the draw buffer index after sending the data to the main thread
			this.drawIdx = 0;
		}

		// Return true to indicate that the processor should continue running
		return true;
	}

	// The main processing function of the AudioWorkletProcessor
	process(inputs, [chData]) {
		return this.makeData(chData);
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
			this.clearAudioCache();
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
			this.clearAudioCache();
		}
		if(data.setFunction !== undefined) {
			this.setFunction(data.setFunction);
			this.clearAudioCache();
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
		if(data.runPrecache === true) {
			// Run the precache function in the background while paused
			// This will fill the cache with audio samples ahead of the current time
			this.makeData();
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
		this.cacheSample = Math.max(this.cacheSample, this.byteSample);
		this.lastByteValue = [null, null];
		this.lastFuncValue = [null, null];
		this.lastTime = -1;
		this.outValue = [0, 0];
	}

	// Parsing text into function and preparing it for execution
	setFunction(codeText) {
		let isCompiled = false;

		// Deleting globalThis variables
		audioProcessor.deleteGlobals();

		// Save previously compiled function
		const oldFunc = this.func;

		// Environment setup. Construct a function header that will extract Math methods into local variables
		// Extract all properties of Math (including PI, E, sin, cos)
		// Use `var` to allow the user's code any redefinitions and re-declarations.
		const mathProps = Object.getOwnPropertyNames(Math).filter(k => k !== 'constructor');
		const mathHeader = `var { ${
			mathProps.join(', ') } } = Math; var int = Math.trunc; var window = globalThis;`;

		try {
			if(this.isFuncbeat) {
				// Wrap the call in .call(globalThis) so `this` keyword in the user's code
				//   is guaranteed to refer to the global object.
				// The //# sourceURL=... directive will cause the getErrorMessage() to treat
				//   this code as an independent script for correct column and character numbers.
				// \n is needed for the getErrorMessage() to calculate the character position from 0.
				this.func = new Function(`${ mathHeader }return (function() {\n${
					codeText }\n}).call(globalThis);
					//# sourceURL=user-code.js`)();
			} else {
				// Optimize code like eval(unescape(escape`XXXX`.replace(/u(..)/g,"$1%")))
				codeText = codeText.trim().replace(
					/^eval\(unescape\(escape(?:`|\('|\("|\(`)(.*?)(?:`|'\)|"\)|`\)).replace\(\/u\(\.\.\)\/g,["'`]\$1%["'`]\)\)\)$/,
					(match, m1) => unescape(escape(m1).replace(/u(..)/g, '$1%')));
				this.func = new Function('t', `${ mathHeader }return (function(t) { return 0,\n${
					codeText || 0 }\n}).call(globalThis, t);
					//# sourceURL=user-code.js`);
			}
			isCompiled = true;

			// Test run to check for runtime compilation errors
			if(this.isFuncbeat) {
				this.func(0, this.sampleRate);
			} else {
				this.func(0);
			}
		} catch(err) {
			if(!isCompiled) {
				// Returning the old function
				this.func = oldFunc;
			}
			this.errorDisplayed = false;

			// Sending an error
			this.sendData({
				error: { message: this.getErrorMessage(err, isCompiled ? 0 : null), isCompiled },
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
