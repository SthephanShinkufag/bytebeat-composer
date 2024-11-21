function mod(a, b) {
	return ((a % b) + b) % b;
}

export class Scope {
	constructor() {
		this.canvasContainer = null;
		this.canvasCtx = null;
		this.canvasElem = null;
		this.canvasHeight = 256;
		this.canvasPlayButton = null;
		this.canvasTimeCursor = null;
		this.canvasWidth = 1024;
		this.colorChannels = null;
		this.colorDiagram = null;
		this.colorWaveform = null;
		this.drawBuffer = [];
		this.drawEndBuffer = [];
		this.drawMode = 'Combined';
		this.drawScale = 5;
	}
	get timeCursorEnabled() {
		return globalThis.bytebeat.sampleRate >> this.drawScale < 2000;
	}
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}
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
		const width = this.canvasWidth;
		const height = this.canvasHeight;
		const scale = this.drawScale;
		const isReverse = globalThis.bytebeat.playbackSpeed < 0;
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
		const imageData = this.canvasCtx.createImageData(drawWidth, height);
		const { data } = imageData;
		if(scale) {
			const x = isReverse ? drawWidth - 1 : 0;
			for(let y = 0; y < height; ++y) {
				const drawEndBuffer = this.drawEndBuffer[y];
				if(drawEndBuffer) {
					let idx = (drawWidth * (255 - y) + x) << 2;
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
		const colorPoints = this.colorWaveform;
		const colorWaveform = !isWaveform ? colorPoints : [
			Math.floor(.6 * colorPoints[0] | 0),
			Math.floor(.6 * colorPoints[1] | 0),
			Math.floor(.6 * colorPoints[2] | 0)];
		let ch, drawDiagramPoint, drawPoint, drawWavePoint;
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
				drawDiagramPoint = isCombined ? this.drawSoftPointMono : this.drawPointMono;
				drawPoint = this.drawPointMono;
				drawWavePoint = isCombined ? this.drawPointMono : this.drawSoftPointMono;
			} else {
				ch = 2;
				drawDiagramPoint = isCombined ? this.drawSoftPointStereo : this.drawPointStereo;
				drawPoint = this.drawPointStereo;
				drawWavePoint = isCombined ? this.drawPointStereo : this.drawSoftPointStereo;
			}
			while(ch--) {
				const curYCh = curY[ch];
				const colorCh = this.colorChannels;
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
							const idx = (drawWidth * (diagramStart + y) + x) << 2;
							if(isNaNCurYCh) {
								data[idx] = 100; // Error: red color
							} else {
								drawDiagramPoint(data, idx, color, colorCh, ch);
							}
						}
					}
				}
				if(isNaNCurY[ch] || isDiagram) {
					continue;
				}
				// Points drawing
				for(let x = curX; x !== nextX; x = mod(x + 1, width)) {
					drawPoint(data, (drawWidth * (255 - curYCh) + x) << 2, colorPoints, colorCh, ch);
				}
				// Waveform vertical lines drawing
				if(isCombined || isWaveform) {
					const prevYCh = prevY[ch];
					if(isNaN(prevYCh)) {
						continue;
					}
					const x = isReverse ? mod(Math.floor(this.getX(curTime)) - startX, width) : curX;
					for(let dy = prevYCh < curYCh ? 1 : -1, y = prevYCh; y !== curYCh; y += dy) {
						drawWavePoint(data, (drawWidth * (255 - y) + x) << 2, colorWaveform, colorCh, ch);
					}
				}
			}
		}
		// Saving the last points of a segment
		if(scale) {
			const x = isReverse ? 0 : drawWidth - 1;
			for(let y = 0; y < height; ++y) {
				let idx = (drawWidth * (255 - y) + x) << 2;
				this.drawEndBuffer[y] = [data[idx++], data[idx++], data[idx]];
			}
		}
		// Placing a segment on the canvas
		this.canvasCtx.putImageData(imageData, startX, 0);
		if(endX >= width) {
			this.canvasCtx.putImageData(imageData, startX - width, 0);
		} else if(endX <= 0) {
			this.canvasCtx.putImageData(imageData, startX + width, 0);
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
	drawSoftPointMono(data, i, color) {
		if(data[i] || data[i + 1] || data[i + 2]) {
			return;
		}
		data[i++] = color[0];
		data[i++] = color[1];
		data[i] = color[2];
	}
	drawSoftPointStereo(data, i, color, colorCh, isRight) {
		if(isRight) {
			let i1, i2, c1, c2;
			if(data[i1 = i + (c1 = colorCh[1])] || data[i2 = i + (c2 = colorCh[2])]) {
				return;
			}
			data[i1] = color[c1];
			data[i2] = color[c2];
			return;
		}
		const c0 = colorCh[0];
		const i0 = i + c0;
		if(data[i0]) {
			return;
		}
		data[i0] = color[c0];
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
	toggleTimeCursor() {
		this.canvasTimeCursor.classList.toggle('hidden', !this.timeCursorEnabled);
	}
}
