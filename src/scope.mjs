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
		this.fftGridData = null;
		this.fftSize = 10;
		this.canvasWidth = 1024;
		this.colorChannels = null;
		this.colorDiagram = null;
		this.colorStereoRGB = [null, null];
		this.colorWaveform = null;
		this.drawBuffer = [];
		this.drawEndBuffer = [];
		this.drawMode = 'Combined';
		this.drawScale = 5;
		this.minDecibels = -120;
		this.maxDecibels = -10;
	}
	get timeCursorEnabled() {
		return globalThis.bytebeat.sampleRate >> this.drawScale < 2000;
	}
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.canvasCtx.globalCompositeOperation = this.drawMode === 'FFT' ? 'lighter' : 'source-over';
	}
	drawGraphics(endTime) {
		if(!isFinite(endTime)) {
			globalThis.bytebeat.resetTime();
			return;
		}
		const buffer = this.drawBuffer;
		const bufferLen = buffer.length;
		if(!bufferLen || bufferLen === 1) {
			return;
		}
		const ctx = this.canvasCtx;
		const width = this.canvasWidth;
		const height = this.canvasHeight;
		// FFT graph drawing
		if(this.drawMode === 'FFT') {
			this.clearCanvas();
			const minFreq = Math.max(48000 / 2 ** this.fftSize, 10);
			const maxFreq = 24000; // audioCtx.sampleRate / 2 = 48000 / 2
			// Grid and labels
			if(this.fftGridData) {
				ctx.putImageData(this.fftGridData, 0, 0);
			} else {
				// Vertical grid and Hz labels
				ctx.beginPath();
				ctx.strokeStyle = '#444';
				ctx.fillStyle = '#faca63';
				ctx.font = '11px monospace';
				let freq = 10; // Start building from 10Hz
				while(freq <= maxFreq) {
					for(let i = 1; i < 10; ++i) {
						const curFreq = freq * i;
						const x = width * Math.log(curFreq / minFreq) / Math.log(maxFreq / minFreq);
						ctx.moveTo(x, 0);
						ctx.lineTo(x, height);
						if(i < 4 || i === 5) {
							ctx.fillText(freq < 1000 ? curFreq + 'Hz' : curFreq / 1000 + 'kHz', x + 1, 10);
						}
					}
					freq *= 10;
				}
				// Horizontal grid
				const dbRange = this.maxDecibels - this.minDecibels;
				for(let i = 10; i < dbRange; i += 10) {
					const y = i * height / dbRange;
					ctx.moveTo(0, y);
					ctx.lineTo(width, y);
				}
				ctx.stroke();
				// Horizontal dB labels
				for(let i = 0; i <= dbRange; i += 10) {
					ctx.fillText(this.maxDecibels - i + 'dB', 2, i * height / dbRange - 2);
				}
				// Save to the buffer
				this.fftGridData = ctx.getImageData(0, 0, width, height);
			}
			// Detect stereo signal
			let isStereo = false;
			let i = Math.min(bufferLen, 200);
			while(i--) {
				if(isNaN(buffer[i].value[0]) && isNaN(buffer[i].value[1])) {
					continue;
				}
				if(buffer[i].value[0] !== buffer[i].value[1]) {
					isStereo = true;
					break;
				}
			}
			// Build the chart
			let ch = isStereo ? 2 : 1;
			while(ch--) {
				ctx.beginPath();
				ctx.strokeStyle = isStereo ? this.colorStereoRGB[ch] :
					`rgb(${ this.colorWaveform.join(',') })`;
				this.analyser[ch].getByteFrequencyData(this.analyserData[ch]);
				for(let i = 0, len = this.analyserData[ch].length; i < len; ++i) {
					const y = height * (1 - this.analyserData[ch][i] / 256);
					if(i) {
						const ratio = maxFreq / minFreq;
						ctx.lineTo(width * Math.log(i / len * ratio) / Math.log(ratio), y);
						continue;
					}
					ctx.moveTo(0, y);
				}
				ctx.stroke();
			}
			// Clear buffer
			this.drawBuffer = [{ t: endTime, value: buffer[bufferLen - 1].value }];
			return;
		}
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
		// Restoring the last points of a previous segment
		const imageData = ctx.createImageData(drawWidth, height);
		const { data } = imageData;
		const isReverse = globalThis.bytebeat.playbackSpeed < 0;
		const status = [];
		if(scale) {
			const x = isReverse ? drawWidth - 1 : 0;
			for(let y = 0; y < height; ++y) {
				const drawEndBuffer = this.drawEndBuffer[y];
				if(drawEndBuffer) {
					let idx = drawWidth * (255 - y) + x;
					status[idx] = drawEndBuffer[3];
					idx <<= 2;
					data[idx++] = drawEndBuffer[0];
					data[idx++] = drawEndBuffer[1];
					data[idx] = drawEndBuffer[2];
				}
			}
		}
		// Filling an alpha channel in a segment
		for(let x = 0; x < drawWidth; ++x) {
			for(let y = 0; y < height; ++y) {
				data[((drawWidth * y + x) << 2) + 3] = 255;
			}
		}
		// Drawing in a segment
		const isCombined = this.drawMode === 'Combined';
		const isDiagram = this.drawMode === 'Diagram';
		const isWaveform = this.drawMode === 'Waveform';
		const { colorDiagram } = this;
		const colorCh = this.colorChannels;
		const colorPoints = this.colorWaveform;
		const colorWaveform = [.65 * colorPoints[0] | 0, .65 * colorPoints[1] | 0, .65 * colorPoints[2] | 0];
		let ch, drawPoint;
		for(let i = 0; i < bufferLen; ++i) {
			const curY = buffer[i].value;
			const prevY = buffer[i - 1]?.value ?? [NaN, NaN];
			const isNaNCurY = [isNaN(curY[0]), isNaN(curY[1])];
			const curTime = buffer[i].t;
			const nextTime = buffer[i + 1]?.t ?? endTime;
			const curX = mod(Math.floor(this.getX(isReverse ? nextTime + 1 : curTime)) - startX, width);
			const nextX = mod(Math.ceil(this.getX(isReverse ? curTime + 1 : nextTime)) - startX, width);
			let diagramSize, diagramStart;
			if(isCombined || isDiagram) {
				diagramSize = Math.max(1, 256 >> scale);
				diagramStart = diagramSize * mod(curTime, 1 << scale);
			} else if(isNaNCurY[0] || isNaNCurY[1]) {
				// Error value - filling with red color
				for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
					for(let y = 0; y < height; ++y) {
						const idx = (drawWidth * y + x) << 2;
						if(!data[idx + 1] && !data[idx + 2]) {
							data[idx] = 100; // Error: red color
						}
					}
				}
			}
			// Select mono or stereo drawing
			if((curY[0] === curY[1] || isNaNCurY[0] && isNaNCurY[1]) && prevY[0] === prevY[1]) {
				ch = 1;
				drawPoint = this.drawPointMono;
			} else {
				ch = 2;
				drawPoint = this.drawPointStereo;
			}
			while(ch--) {
				const curYCh = curY[ch];
				if(!isNaNCurY[ch] && !isDiagram) {
					// Points drawing
					for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
						const idx = drawWidth * (255 - curYCh) + x;
						status[idx] = 1; // Set the "Point" status
						drawPoint(data, idx << 2, colorPoints, colorCh, ch);
					}
					// Waveform vertical lines drawing
					if(isCombined || isWaveform) {
						const prevYCh = prevY[ch];
						if(isNaN(prevYCh)) {
							continue;
						}
						const x = isReverse ? mod(Math.floor(this.getX(curTime)) - startX, width) : curX;
						for(let dy = prevYCh < curYCh ? 1 : -1, y = prevYCh; y !== curYCh; y += dy) {
							const idx = drawWidth * (255 - y) + x;
							if(status[idx] != 1) { // No "Point" status
								status[idx] = 2; // Set the "Waveform" status
								drawPoint(data, idx << 2, colorWaveform, colorCh, ch);
							}
						}
					}
				}
				// Diagram drawing
				if(isCombined || isDiagram) {
					const isNaNCurYCh = isNaNCurY[ch];
					const value = (curYCh & 255) / 256;
					const color = [
						value * colorDiagram[0] | 0,
						value * colorDiagram[1] | 0,
						value * colorDiagram[2] | 0];
					for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
						for(let y = 0; y < diagramSize; ++y) {
							const idx = drawWidth * (diagramStart + y) + x;
							const s = status[idx];
							if(s != 1 && s != 2) { // No "Point" or "Waveform" status
								if(isNaNCurYCh) {
									data[idx << 2] = 100; // Error: red color
								} else {
									drawPoint(data, idx << 2, color, colorCh, ch);
								}
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
				let idx = drawWidth * (255 - y) + x;
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
	drawPointMono(data, i, color) {
		data[i++] = color[0];
		data[i++] = color[1];
		data[i] = color[2];
	}
	drawPointStereo(data, i, color, colorCh, isRight) {
		if(isRight) {
			const c1 = colorCh[1];
			const c2 = colorCh[2];
			data[i + c1] = color[c1];
			data[i + c2] = color[c2];
		} else {
			const c0 = colorCh[0];
			data[i + c0] = color[c0];
		}
	}
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
	getX(t) {
		return t / (1 << this.drawScale);
	}
	initElements() {
		this.canvasContainer = document.getElementById('canvas-container');
		this.canvasElem = document.getElementById('canvas-main');
		this.canvasCtx = this.canvasElem.getContext('2d');
		this.canvasPlayButton = document.getElementById('canvas-play');
		this.canvasTimeCursor = document.getElementById('canvas-timecursor');
		this.onresizeWindow();
		document.defaultView.addEventListener('resize', () => this.onresizeWindow());
	}
	onresizeWindow() {
		const isSmallWindow = window.innerWidth <= 768 || window.innerHeight <= 768;
		if(this.canvasWidth === 1024) {
			if(isSmallWindow) {
				this.canvasWidth = this.canvasElem.width = 512;
			}
		} else if(!isSmallWindow) {
			this.canvasWidth = this.canvasElem.width = 1024;
		}
	}
	requestAnimationFrame() {
		window.requestAnimationFrame(() => {
			this.drawGraphics(globalThis.bytebeat.byteSample);
			if(globalThis.bytebeat.isPlaying) {
				this.requestAnimationFrame();
			}
		});
	}
	setFFTAnalyzer() {
		this.analyser[0].fftSize = this.analyser[1].fftSize = 2 ** this.fftSize;
		this.analyserData = [
			new Uint8Array(this.analyser[0].frequencyBinCount),
			new Uint8Array(this.analyser[1].frequencyBinCount)];
		this.fftGridData = null;
	}
	setFFTSize(value) {
		this.fftSize = Math.min(Math.max(value, 5), 15);
	}
	setStereoColors() {
		const ch = this.colorChannels;
		const colorLeft = [0, 0, 0];
		const colorRight = [0, 0, 0];
		colorLeft[ch[0]] = this.colorWaveform[ch[0]];
		colorRight[ch[1]] = this.colorWaveform[ch[1]];
		colorRight[ch[2]] = this.colorWaveform[ch[2]];
		this.colorStereoRGB = [`rgb(${ colorLeft.join(',') })`, `rgb(${ colorRight.join(',') })`];
	}
	toggleTimeCursor() {
		this.canvasTimeCursor.classList.toggle('hidden', this.drawMode === 'FFT' || !this.timeCursorEnabled);
	}
}
