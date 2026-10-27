function mod(a, b) {
	return ((a % b) + b) % b;
}

export class Scope {
	constructor() {
		this.analyser = [null, null];
		this.analyserData = [null, null];
		this.bufferHead = 0;
		this.bufferSize = 32768; // Allocate a buffer size with a margin to accommodate any drawScale limits
		this.bufferTail = 0;
		this.canvasContainer = null;
		this.canvasCtx = null;
		this.canvasElem = null;
		this.canvasHeight = 256;
		this.canvasPlayButton = null;
		this.canvasTimeCursor = null;
		this.canvasWidth = 1024;
		this.colorChannels = null;
		this.colorDiagram = null;
		this.colorStereoRGB = [null, null];
		this.colorWaveform = null;
		this.drawEndBuffer = [];
		this.drawMode = 'Combined';
		this.drawScale = 5;
		this.fftGridCanvas = null;
		this.fftSize = 10;
		this.fftXTable = null;
		this.maxDecibels = -10;
		this.minDecibels = -120;
		this.ringBuffer = null; // Ring Buffer for drawing samples, 3 cells (t, valL, valR) for each point
	}

	// Display the time cursor depending on scale
	get timeCursorEnabled() {
		return globalThis.bytebeat.sampleRate >> this.drawScale < 2000;
	}

	// Clear the canvas
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.canvasCtx.globalCompositeOperation = this.drawMode === 'FFT' ? 'lighter' : 'source-over';
	}

	// Main drawing function
	drawGraphics(endTime) {
		if(!isFinite(endTime)) {
			globalThis.bytebeat.resetTime();
			return;
		}

		// Save the head (the newest point)
		// While rendering is in progress, even newer points may arrive from the worker
		const currentHead = this.bufferHead;

		// Calculate how many points have accumulated in the Ring Buffer before head
		const bufferLen = currentHead >= this.bufferTail ?
			currentHead - this.bufferTail : this.bufferSize - this.bufferTail + currentHead;

		// If there are no points sent by an audio worker, then skip the drawing
		if(bufferLen === 0) {
			return;
		}

		// Canvas variables
		const ctx = this.canvasCtx;
		const width = this.canvasWidth;
		const height = this.canvasHeight;

		// --- FFT mode ---
		if(this.drawMode === 'FFT') {
			// Initialize the table on the first run, in case it wasn't called at startup
			if(!this.fftXTable || this.fftXTable.length !== this.analyser[0].frequencyBinCount) {
				this.updateFFTLookUpTable();
			}

			this.clearCanvas();

			// Rendering the grid and labels via offscreen canvas
			if(this.fftGridCanvas) {
				ctx.drawImage(this.fftGridCanvas, 0, 0);
			} else {
				// Create an offscreen canvas for caching the grid on the GPU
				this.fftGridCanvas = document.createElement('canvas');
				this.fftGridCanvas.width = width;
				this.fftGridCanvas.height = height;
				const gCtx = this.fftGridCanvas.getContext('2d');

				// Set labels style
				gCtx.beginPath();
				gCtx.strokeStyle = '#444';
				gCtx.fillStyle = '#faca63';
				gCtx.font = '11px monospace';

				// Vertical grid and Hz labels
				let freq = 10; // Start building from 10Hz
				const minFreq = Math.max(48000 / 2 ** this.fftSize, 10);
				const maxFreq = 24000; // audioCtx.sampleRate / 2 = 48000 / 2
				const logMaxMin = Math.log(maxFreq / minFreq);
				while(freq <= maxFreq) {
					for(let i = 1; i < 10; ++i) {
						const curFreq = freq * i;
						if(curFreq > maxFreq) {
							break;
						}
						const x = width * Math.log(curFreq / minFreq) / logMaxMin;
						gCtx.moveTo(x, 0);
						gCtx.lineTo(x, height);
						if(i < 4 || i === 5) {
							gCtx.fillText(freq < 1000 ? curFreq + 'Hz' : curFreq / 1000 + 'kHz', x + 1, 10);
						}
					}
					freq *= 10;
				}

				// Horizontal grid and  dB labels
				const dbRange = this.maxDecibels - this.minDecibels;
				for(let i = 10; i <= dbRange; i += 10) {
					const y = (i * height) / dbRange;
					if(i < dbRange) {
						gCtx.moveTo(0, y);
						gCtx.lineTo(width, y);
					}
					gCtx.fillText(this.maxDecibels - i + 'dB', 1, y - 2);
				}
				gCtx.stroke();
			}

			// Stereo detection for a ring buffer (scanning up to bufferLimit recent elements from the end)
			let isStereo = false;
			const bufferLimit = 200;
			const checkLen = bufferLen > bufferLimit ? bufferLimit : bufferLen;
			// Starting with the most recent element (before the head)
			let checkIdx = (this.bufferHead - 1 + this.bufferSize) % this.bufferSize;
			for(let i = 0; i < checkLen; ++i) {
				const bufIdx = checkIdx * 3;
				const valL = this.ringBuffer[bufIdx + 1];
				const valR = this.ringBuffer[bufIdx + 2];
				if(valL !== valR && !isNaN(valL) && !isNaN(valR)) {
					isStereo = true;
					break;
				}
				// Stepping backward in a circle
				checkIdx = (checkIdx - 1 + this.bufferSize) % this.bufferSize;
			}

			// Plotting the frequency graph (using a look-up table)
			let chIdx = isStereo ? 2 : 1;
			const xTable = this.fftXTable;
			while(chIdx--) {
				const data = this.analyserData[chIdx];
				this.analyser[chIdx].getByteFrequencyData(data);
				ctx.beginPath();
				ctx.strokeStyle = isStereo ? this.colorStereoRGB[chIdx] :
					`rgb(${ this.colorWaveform.join(',') })`;
				// Handle the first point separately to avoid a check inside the loop
				ctx.moveTo(0, height * (1 - data[0] / 256));
				for(let i = 1, len = data.length; i < len; ++i) {
					ctx.lineTo(xTable[i], height * (1 - data[i] / 256));
				}
				ctx.stroke();
			}

			// Limit the buffer tail for the FFT so that, when switching to waveform mode,
			// the player doesn't render an accumulated tail spanning the duration of the FFT's operation
			this.bufferTail = (this.bufferHead - bufferLimit + this.bufferSize) % this.bufferSize;
			return;
		}

		// --- Points, Waveform, Diagram, Combined modes ---

		// Get the start time, taking the first (oldest) element using the tail index
		let startTime = this.ringBuffer[this.bufferTail * 3];

		// Calculate X-coordinates of the segment
		let startX = mod(this.getX(startTime), width);
		let endX = Math.floor(startX + this.getX(endTime - startTime));
		startX = Math.floor(startX);
		let drawWidth = Math.abs(endX - startX) + 1;

		// Truncate large segments (for high playback speed or 512px canvas)
		const scale = this.drawScale;
		if(drawWidth > width) {
			startTime = (this.getX(endTime) - width) * (1 << scale);
			startX = mod(this.getX(startTime), width);
			endX = Math.floor(startX + this.getX(endTime - startTime));
			startX = Math.floor(startX);
			drawWidth = Math.abs(endX - startX) + 1;
		}
		startX = Math.min(startX, endX);

		// Look-up table for row offsets (eliminating multiplication from loops)
		const rowOffsets = new Int32Array(height);
		for(let y = 0; y < height; ++y) {
			rowOffsets[y] = drawWidth * y;
		}

		// Restoring the last points of a previous segment from drawEndBuffer
		const imageData = ctx.createImageData(drawWidth, height);
		const { data } = imageData;
		const isReverse = globalThis.bytebeat.playbackSpeed < 0;
		const status = new Uint8Array(drawWidth * height); // Pixel state buffer
		if(scale) {
			const x = isReverse ? drawWidth - 1 : 0;
			for(let y = 0; y < height; ++y) {
				const drawEndBuffer = this.drawEndBuffer[y];
				if(drawEndBuffer) {
					const idx = rowOffsets[255 - y] + x;
					let dIdx = idx << 2;
					data[dIdx++] = drawEndBuffer[0];
					data[dIdx++] = drawEndBuffer[1];
					data[dIdx] = drawEndBuffer[2];
					status[idx] = drawEndBuffer[3];
				}
			}
		}

		// Setting the alpha channel via a 32-bit integer (set the transparency to 255)
		const buf32 = new Uint32Array(data.buffer); // Fast 32-bit window over Canvas bytes
		for(let i = 0; i < buf32.length; ++i) {
			buf32[i] |= 0xFF000000;
		}

		// Get drawing mode
		const mode = this.drawMode;
		const isPoints = mode === 'Points';
		const isWaveform = mode === 'Waveform' || mode === 'Combined';
		const isDiagram = mode === 'Diagram' || mode === 'Combined';

		// Get drawing colors
		const colorD = this.colorDiagram;
		const colorP = this.colorWaveform; // Points color actually, "Waveform color" in settings
		const colorW = [.65 * colorP[0] | 0, .65 * colorP[1] | 0, .65 * colorP[2] | 0];
		const colorErr = 0xFF000064; // Error color in 32-bit format (Alpha=255, Blue=0, Green=0, Red=100)
		const c0 = this.colorChannels[0];
		const c1 = this.colorChannels[1];
		const c2 = this.colorChannels[2];

		// Speculative fast stereo detection from a typed array
		let isStereo = false;
		let checkIdx = this.bufferTail;
		for(let i = 0; i < bufferLen; ++i) {
			const bufIdx = checkIdx * 3;
			const valL = this.ringBuffer[bufIdx + 1];
			const valR = this.ringBuffer[bufIdx + 2];
			if(valL !== valR && !isNaN(valL) && !isNaN(valR)) {
				isStereo = true;
				break;
			}
			checkIdx = (checkIdx + 1) % this.bufferSize;
		}
		const channelsCount = isStereo ? 2 : 1;

		// Variables to detect pixel duplicates
		let lastPlottedX = -1;
		let lastPlottedYR = -1;
		let lastPlottedYL = -1;

		// Drawing in a segment, iterating through the Ring Buffer from tail to head
		let curIdx = this.bufferTail;
		for(let i = 0; i < bufferLen; ++i) {
			// Calculate the current and next coordinates
			const bufIdx = curIdx * 3;
			const curTime = this.ringBuffer[bufIdx];
			const curYR = this.ringBuffer[bufIdx + 1];
			const curYL = this.ringBuffer[bufIdx + 2];
			const nextIdx = (curIdx + 1) % this.bufferSize;
			const nextTime = i < bufferLen - 1 ? this.ringBuffer[nextIdx * 3] : endTime;
			const curX = mod(Math.floor(this.getX(isReverse ? nextTime + 1 : curTime)) - startX, width);
			const nextX = mod(Math.ceil(this.getX(isReverse ? curTime + 1 : nextTime)) - startX, width);

			// NaN errors handling
			if(isNaN(curYR) || isNaN(curYL)) {
				for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
					if(x >= drawWidth) {
						continue;
					}
					for(let y = 0; y < height; ++y) {
						const idx = rowOffsets[y] + x;
						const dIdx = idx << 2;
						// Fill with red if the pixel is not a restored point (status !== 1)
						// and there is no color yet
						if(status[idx] !== 1 && !data[dIdx + 1] && !data[dIdx + 2]) {
							buf32[idx] = colorErr;
						}
					}
				}
				curIdx = nextIdx;
				continue; // Moving on to the next sample, skipping the charts drawing
			}

			// Skip if X and Y are identical to the previous sample
			if(isPoints) {
				if(curX === lastPlottedX && curYR === lastPlottedYR && curYL === lastPlottedYL) {
					curIdx = nextIdx;
					continue;
				}
				lastPlottedX = curX;
				lastPlottedYR = curYR;
				lastPlottedYL = curYL;
			}

			// Calculate the previous coordinates
			const prevBufIdx = ((curIdx - 1 + this.bufferSize) % this.bufferSize) * 3;
			const prevYR = i > 0 ? this.ringBuffer[prevBufIdx + 1] : NaN;
			const prevYL = i > 0 ? this.ringBuffer[prevBufIdx + 2] : NaN;

			// Diagram mode parameters
			let diagramSize, diagramStart;
			if(isDiagram) {
				diagramSize = Math.max(1, 256 >> scale);
				diagramStart = diagramSize * mod(curTime, 1 << scale);
			}

			// Drawing for each channel (or mono)
			let chIdx = channelsCount;
			while(chIdx--) {
				const curYCh = chIdx ? curYL : curYR;
				if(isPoints || isWaveform) {
					// Points drawing
					for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
						if(x >= drawWidth) {
							continue;
						}
						const idx = rowOffsets[255 - curYCh] + x;
						status[idx] = 1; // Set the point status to "Point"
						const dIdx = idx << 2;
						if(isStereo) {
							if(chIdx) { // Right channel
								data[dIdx + c1] = colorP[c1];
								data[dIdx + c2] = colorP[c2];
							} else { // Left channel
								data[dIdx + c0] = colorP[c0];
							}
						} else { // Mono
							data[dIdx] = colorP[0];
							data[dIdx + 1] = colorP[1];
							data[dIdx + 2] = colorP[2];
						}
					}

					// Waveform vertical lines drawing
					if(isWaveform) {
						const prevYCh = chIdx ? prevYL : prevYR;
						if(!isNaN(prevYCh)) {
							const x = isReverse ? mod(Math.floor(this.getX(curTime)) - startX, width) : curX;
							if(x >= drawWidth) {
								continue;
							}
							const dy = prevYCh < curYCh ? 1 : -1;
							for(let y = prevYCh; y !== curYCh; y += dy) {
								const idx = rowOffsets[255 - y] + x;
								if(status[idx] === 1) {
									continue; // Skip if the status "Point" is present
								}
								status[idx] = 2; // Set the point status to "Waveform"
								const dIdx = idx << 2;
								if(isStereo) {
									if(chIdx) { // Right channel
										data[dIdx + c1] = colorW[c1];
										data[dIdx + c2] = colorW[c2];
									} else { // Left channel
										data[dIdx + c0] = colorW[c0];
									}
								} else { // Mono
									data[dIdx] = colorW[0];
									data[dIdx + 1] = colorW[1];
									data[dIdx + 2] = colorW[2];
								}
							}
						}
					}
				}

				// Diagram drawing
				if(isDiagram) {
					const value = (curYCh & 255) / 256;
					const cR = value * colorD[0] | 0;
					const cG = value * colorD[1] | 0;
					const cB = value * colorD[2] | 0;
					for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
						if(x >= drawWidth) {
							continue;
						}
						for(let y = 0; y < diagramSize; ++y) {
							const idx = rowOffsets[diagramStart + y] + x;
							if(status[idx] === 1 || status[idx] === 2) {
								continue; // Skip if the status "Point" or "Waveform" is present
							}
							const dIdx = idx << 2;
							if(isStereo) {
								if(chIdx) { // Right channel
									if(c1 === 1) {
										data[dIdx + 1] = cG;
									}
									if(c2 === 2) {
										data[dIdx + 2] = cB;
									}
									if(c1 === 0) {
										data[dIdx] = cR;
									}
								} else { // Left channel
									data[dIdx + c0] = c0 === 1 ? cG : c0 === 2 ? cB : cR;
								}
							} else { // Mono
								data[dIdx] = cR;
								data[dIdx + 1] = cG;
								data[dIdx + 2] = cB;
							}
						}
					}
				}
			}
			curIdx = nextIdx;
		}

		// Saving the last points of a segment
		if(scale) {
			const x = isReverse ? 0 : drawWidth - 1;
			for(let y = 0; y < height; ++y) {
				const idx = rowOffsets[255 - y] + x;
				let dIdx = idx << 2;
				this.drawEndBuffer[y] = [data[dIdx++], data[dIdx++], data[dIdx], status[idx]];
			}
		}

		// Placing a segment on the canvas
		ctx.putImageData(imageData, startX, 0);
		if(endX >= width) {
			ctx.putImageData(imageData, startX - width, 0);
		} else if(endX <= 0) {
			ctx.putImageData(imageData, startX + width, 0);
		}

		// Move the cursor to the end of the segment
		if(this.timeCursorEnabled) {
			this.canvasTimeCursor.style.left = endX / width * 100 + '%';
		}

		// Instead of clearing the Ring Buffer, shift the tail to the (currentHead - 1) position.
		// We are signaling to the graphics engine that everything preceding that point has already been read.
		// New points that arrive while this function is runnung will remain in the buffer for the next frame.
		this.bufferTail = (currentHead - 1 + this.bufferSize) % this.bufferSize;
		this.ringBuffer[this.bufferTail * 3] = endTime;
	}

	// Stereo colors indicators
	getColorTest(colorMode, newValue) {
		if(newValue) {
			this[colorMode] = [
				parseInt(newValue.substr(1, 2), 16),
				parseInt(newValue.substr(3, 2), 16),
				parseInt(newValue.substr(5, 2), 16)];
		}
		let rgbTxt, leftColor, rightColor;
		const value = this[colorMode];
		const c = this.colorChannels;
		switch(c[0]) {
		case 0:
			rgbTxt = ['R', 'G', 'B']; // [Left, Rigtht1, Right2]
			leftColor = `${ value[c[0]] }, 0, 0`;
			rightColor = `0, ${ value[c[1]] }, ${ value[c[2]] }`;
			break;
		case 2:
			rgbTxt = ['B', 'R', 'G'];
			leftColor = `0, 0, ${ value[c[0]] }`;
			rightColor = `${ value[c[1]] }, ${ value[c[2]] }, 0`;
			break;
		default:
			rgbTxt = ['G', 'R', 'B'];
			leftColor = `0, ${ value[c[0]] }, 0`;
			rightColor = `${ value[c[1]] }, 0, ${ value[c[2]] }`;
		}
		return `[ Left <span class="control-color-test" style="background: rgb(${ leftColor });"></span>
			${ rgbTxt[0] }=${ value[c[0]] }, Right
			<span class="control-color-test" style="background: rgb(${ rightColor });"></span>
			${ rgbTxt[1] }=${ value[c[1]] } + ${ rgbTxt[2] }=${ value[c[2]] } ]`;
	}

	// Calculating X-coordinate from t (for drawing)
	getX(t) {
		return t / (1 << this.drawScale);
	}

	// Initialization of the Graphics Ring Buffer
	// Instead of removing and adding elements, we simply overwrite the old data using a pointer (index).
	// Memory is allocated only once, and the Garbage Collector is never invoked.
	initRingBuffer() {
		// Allocate a single contiguous array: 3 cells (t, valL, valR) for each point
		this.ringBuffer = new Float32Array(this.bufferSize * 3);
		this.bufferHead = 0; // Pointer to the index of the current point
		this.bufferTail = 0;
	}

	// Canvas initialization
	initElements() {
		this.canvasContainer = document.getElementById('canvas-container');
		this.canvasElem = document.getElementById('canvas-main');
		this.canvasCtx = this.canvasElem.getContext('2d');
		this.canvasPlayButton = document.getElementById('canvas-play');
		this.canvasTimeCursor = document.getElementById('canvas-timecursor');
		this.onresizeWindow();
		document.defaultView.addEventListener('resize', () => this.onresizeWindow());
	}

	// Adapting the visualizer when the window is resized
	onresizeWindow() {
		const isSmallWindow = window.innerWidth <= 768 || window.innerHeight <= 768;
		if(this.canvasWidth === 1024) {
			if(isSmallWindow) {
				this.canvasWidth = this.canvasElem.width = 512;
			}
		} else if(!isSmallWindow) {
			this.canvasWidth = this.canvasElem.width = 1024;
		}
		this.updateFFTLookUpTable();
	}

	// Push data values into the Ring Buffer
	pushToRingBuffer(t, valL, valR) {
		if(!this.ringBuffer) {
			this.initRingBuffer();
		}

		// Calculate the actual offset in a flat array
		const idx = this.bufferHead * 3;
		this.ringBuffer[idx] = t;
		this.ringBuffer[idx + 1] = valL;
		this.ringBuffer[idx + 2] = valR;

		// Move the pointer in a circle
		this.bufferHead = (this.bufferHead + 1) % this.bufferSize;

		// If the buffer has overflowed (head has caught up to tail), shift the tail forward to make space
		if(this.bufferHead === this.bufferTail) {
			this.bufferTail = (this.bufferTail + 1) % this.bufferSize;
		}
	}

	// Starting the visualizer animation
	requestAnimationFrame() {
		window.requestAnimationFrame(() => {
			this.drawGraphics(globalThis.bytebeat.byteSample);
			if(globalThis.bytebeat.isPlaying) {
				this.requestAnimationFrame();
			}
		});
	}

	// FFT analyzer initializion
	setFFTAnalyzer() {
		this.analyser[0].fftSize = this.analyser[1].fftSize = 2 ** this.fftSize;
		this.analyserData = [
			new Uint8Array(this.analyser[0].frequencyBinCount),
			new Uint8Array(this.analyser[1].frequencyBinCount)];
		this.updateFFTLookUpTable();
	}

	// Size of FFT bins
	setFFTSize(value) {
		this.fftSize = Math.min(Math.max(value, 6), 15);
	}

	// Stereo colors calculatinon
	setStereoColors() {
		const ch = this.colorChannels;
		const colorLeft = [0, 0, 0];
		const colorRight = [0, 0, 0];
		colorLeft[ch[0]] = this.colorWaveform[ch[0]];
		colorRight[ch[1]] = this.colorWaveform[ch[1]];
		colorRight[ch[2]] = this.colorWaveform[ch[2]];
		this.colorStereoRGB = [`rgb(${ colorLeft.join(',') })`, `rgb(${ colorRight.join(',') })`];
	}

	// Toggling the time cursor
	toggleTimeCursor() {
		this.canvasTimeCursor.classList.toggle('hidden', this.drawMode === 'FFT' || !this.timeCursorEnabled);
	}

	// FFT coordinates pre-calculation
	updateFFTLookUpTable() {
		const minFreq = Math.max(48000 / 2 ** this.fftSize, 10);
		const maxFreq = 24000;
		const ratio = maxFreq / minFreq;
		const logRatio = Math.log(ratio);
		const width = this.canvasWidth;
		const len = this.analyser[0].frequencyBinCount;
		this.fftXTable = new Float32Array(len);

		for(let i = 0; i < len; ++i) {
			if(i === 0) {
				this.fftXTable[i] = 0;
				continue;
			}
			// Precalculate the X coordinate for each frequency bin
			const x = width * Math.log((i / len) * ratio) / logRatio;
			this.fftXTable[i] = x < 0 ? 0 : x;
		}

		// Reset the grid's offscreen canvas so it gets redrawn to the new dimensions
		this.fftGridCanvas = null;
	}
}
