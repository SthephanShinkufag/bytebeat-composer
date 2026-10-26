function mod(a, b) {
	return ((a % b) + b) % b;
}

export class Scope {
	constructor() {
		this.analyser = [null, null];
		this.analyserData = [null, null];
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
		this.drawBuffer = [];
		this.drawEndBuffer = [];
		this.drawMode = 'Combined';
		this.drawScale = 5;
		this.fftGridCanvas = null;
		this.fftSize = 10;
		this.fftXTable = null;
		this.maxDecibels = -10;
		this.minDecibels = -120;
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
		const buffer = this.drawBuffer;
		const bufferLen = buffer.length;
		if(!bufferLen) {
			return;
		}
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

			// Stereo detect (scanning from the end)
			let isStereo = false;
			for(let i = bufferLen - 1, len = Math.min(200, bufferLen); i >= bufferLen - len; --i) {
				const val = buffer[i].value;
				if(val[0] !== val[1] && !isNaN(val[0]) && !isNaN(val[1])) {
					isStereo = true;
					break;
				}
			}

			// Plotting the frequency graph (using a look-up table)
			let ch = isStereo ? 2 : 1;
			const xTable = this.fftXTable;
			while(ch--) {
				const data = this.analyserData[ch];
				this.analyser[ch].getByteFrequencyData(data);
				ctx.beginPath();
				ctx.strokeStyle = isStereo ? this.colorStereoRGB[ch] :
					`rgb(${ this.colorWaveform.join(',') })`;
				// Handle the first point separately to avoid a check inside the loop
				ctx.moveTo(0, height * (1 - data[0] / 256));
				for(let i = 1, len = data.length; i < len; ++i) {
					ctx.lineTo(xTable[i], height * (1 - data[i] / 256));
				}
				ctx.stroke();
			}

			// Trim buffer only if it's too large (to avoid triggering GC too frequently)
			if(bufferLen > 400) {
				this.drawBuffer = buffer.slice(-200);
			}
			return;
		}

		// --- Points, Waveform, Diagram, Combined modes ---
		const scale = this.drawScale;
		let startTime = buffer[0].t;
		let startX = mod(this.getX(startTime), width);
		let endX = Math.floor(startX + this.getX(endTime - startTime));
		startX = Math.floor(startX);
		let drawWidth = Math.abs(endX - startX) + 1;

		// Truncate large segments (for high playback speed or 512px canvas)
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
		const buf32 = new Uint32Array(data.buffer); // Fast 32-bit window over Canvas bytes
		const isReverse = globalThis.bytebeat.playbackSpeed < 0;
		const status = new Uint8Array(drawWidth * height); // Pixel state buffer
		if(scale) {
			const x = isReverse ? drawWidth - 1 : 0;
			for(let y = 0; y < height; ++y) {
				const drawEndBuffer = this.drawEndBuffer[y];
				if(drawEndBuffer) {
					const idx = rowOffsets[255 - y] + x;
					status[idx] = drawEndBuffer[3];
					let dIdx = idx << 2;
					data[dIdx++] = drawEndBuffer[0];
					data[dIdx++] = drawEndBuffer[1];
					data[dIdx] = drawEndBuffer[2];
				}
			}
		}

		// Setting the alpha channel via a 32-bit integer (set the transparency to 255)
		for(let i = 0; i < buf32.length; ++i) {
			buf32[i] |= 0xFF000000;
		}

		// Colors and mode
		const isPoints = this.drawMode === 'Points';
		const isWaveform = this.drawMode === 'Waveform' || this.drawMode === 'Combined';
		const isDiagram = this.drawMode === 'Diagram' || this.drawMode === 'Combined';
		const { colorDiagram } = this;
		const colorCh = this.colorChannels;
		const colorPoints = this.colorWaveform;
		const colorWaveform = [.65 * colorPoints[0] | 0, .65 * colorPoints[1] | 0, .65 * colorPoints[2] | 0];
		const c0 = colorCh[0];
		const c1 = colorCh[1];
		const c2 = colorCh[2];

		// Variables to detect pixel duplicates
		let lastPlottedX = -1;
		let lastPlottedY0 = -1;
		let lastPlottedY1 = -1;

		// Drawing in a segment
		for(let i = 0; i < bufferLen; ++i) {
			// Get current coordinates
			const curY = buffer[i].value;
			const curY0 = curY[0];
			const curY1 = curY[1];
			const curTime = buffer[i].t;
			const curX = mod(Math.floor(this.getX(
				isReverse ? (buffer[i + 1]?.t ?? endTime) + 1 : curTime)) - startX, width);

			// Skip if X and Y are identical to the previous step
			if(isPoints) {
				if(curX === lastPlottedX && curY0 === lastPlottedY0 && curY1 === lastPlottedY1) {
					continue;
				}
				lastPlottedX = curX;
				lastPlottedY0 = curY0;
				lastPlottedY1 = curY1;
			}

			const isNaNCurY = [isNaN(curY0), isNaN(curY1)];
			const prevY = buffer[i - 1]?.value ?? [NaN, NaN];
			const nextTime = buffer[i + 1]?.t ?? endTime;
			const nextX = mod(Math.ceil(this.getX(isReverse ? curTime + 1 : nextTime)) - startX, width);
			let diagramSize, diagramStart;
			if(isDiagram) {
				diagramSize = Math.max(1, 256 >> scale);
				diagramStart = diagramSize * mod(curTime, 1 << scale);
			} else if(isNaNCurY[0] || isNaNCurY[1]) {
				// Error value - filling with red color
				for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
					if(x >= drawWidth) {
						continue;
					}
					for(let y = 0; y < height; ++y) {
						const idx = rowOffsets[y] + x;
						const dIdx = idx << 2;
						if(!data[dIdx + 1] && !data[dIdx + 2]) {
							data[dIdx] = 100; // Red error color
						}
					}
				}
			}

			// Detect mono/stereo
			const isStereoNode =
				!((curY0 === curY1 || isNaNCurY[0] && isNaNCurY[1]) && prevY[0] === prevY[1]);
			let ch = isStereoNode ? 2 : 1;

			while(ch--) {
				const curYCh = curY[ch];
				if(!isNaNCurY[ch] && (isPoints || isWaveform)) {
					// Points drawing
					for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
						if(x >= drawWidth) {
							continue;
						}
						const idx = rowOffsets[255 - curYCh] + x;
						status[idx] = 1;
						const dIdx = idx << 2;
						if(isStereoNode) {
							if(ch) { // Right channel
								data[dIdx + c1] = colorPoints[c1];
								data[dIdx + c2] = colorPoints[c2];
							} else { // Left channel
								data[dIdx + c0] = colorPoints[c0];
							}
						} else { // Mono
							data[dIdx] = colorPoints[0];
							data[dIdx + 1] = colorPoints[1];
							data[dIdx + 2] = colorPoints[2];
						}
					}

					// Waveform vertical lines drawing
					if(isWaveform) {
						const prevYCh = prevY[ch];
						if(!isNaN(prevYCh)) {
							const x = isReverse ? mod(Math.floor(this.getX(curTime)) - startX, width) : curX;
							if(x < drawWidth) {
								const dy = prevYCh < curYCh ? 1 : -1;
								for(let y = prevYCh; y !== curYCh; y += dy) {
									const idx = rowOffsets[255 - y] + x;
									if(status[idx] === 1) { // Skip if "Point" status exists
										continue;
									}
									status[idx] = 2; // Set the "Waveform" status
									const dIdx = idx << 2;
									if(isStereoNode) {
										if(ch) { // Right channel
											data[dIdx + c1] = colorWaveform[c1];
											data[dIdx + c2] = colorWaveform[c2];
										} else { // Left channel
											data[dIdx + c0] = colorWaveform[c0];
										}
									} else { // Mono
										data[dIdx] = colorWaveform[0];
										data[dIdx + 1] = colorWaveform[1];
										data[dIdx + 2] = colorWaveform[2];
									}
								}
							}
						}
					}
				}

				// Diagram drawing
				if(isDiagram) {
					const isNaNCurYCh = isNaNCurY[ch];
					const value = (curYCh & 255) / 256;
					const cR = value * colorDiagram[0] | 0;
					const cG = value * colorDiagram[1] | 0;
					const cB = value * colorDiagram[2] | 0;
					for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
						if(x >= drawWidth) {
							continue;
						}
						for(let y = 0; y < diagramSize; ++y) {
							const idx = rowOffsets[diagramStart + y] + x;
							const s = status[idx];
							if(s === 1 || s === 2) { // Skip if "Point" or "Waveform" status exists
								continue;
							}
							const dIdx = idx << 2;
							if(isNaNCurYCh) {
								data[dIdx] = 100; // Red error color
								continue;
							}
							if(isStereoNode) {
								if(ch) { // Right channel
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
		}

		// Saving the last points of a segment
		if(scale) {
			const x = isReverse ? 0 : drawWidth - 1;
			for(let y = 0; y < height; ++y) {
				let idx = rowOffsets[255 - y] + x;
				const s = status[idx];
				idx <<= 2;
				this.drawEndBuffer[y] = [data[idx++], data[idx++], data[idx], s];
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

		// Clear buffer
		this.drawBuffer = [{ t: endTime, value: buffer[bufferLen - 1].value }];
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
