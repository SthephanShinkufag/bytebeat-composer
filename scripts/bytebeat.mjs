import { deflateRaw, inflateRaw } from './pako.esm.min.mjs';

const loadScript = src => new Promise(resolve => {
	try {
		const scriptElem = document.createElement('script');
		scriptElem.type = 'module';
		scriptElem.async = true;
		scriptElem.src = src;
		scriptElem.onload = () => resolve();
		scriptElem.onerror = () => console.error(`Failed to load the script ${ src }`);
		document.head.appendChild(scriptElem);
	} catch(err) {
		console.error(err.message);
	}
});

globalThis.bytebeat = new class {
	constructor() {
		this.audioCtx = null;
		this.audioGain = null;
		this.audioRecorder = null;
		this.audioWorkletNode = null;
		this.byteSample = 0;
		this.canvasCtx = null;
		this.canvasElem = null;
		this.canvasHeight = 256;
		this.canvasWidth = 1024;
		this.canvasTogglePlay = null;
		this.containerFixed = null;
		this.controlCounter = null;
		this.controlMode = null;
		this.controlSampleRate = null;
		this.controlScaleDown = null;
		this.controlTogglePlay = null;
		this.controlVolume = null;
		this.drawBuffer = [];
		this.drawEndBuffer = [];
		this.editorElem = null;
		this.errorElem = null;
		this.isActiveTab = true;
		this.isCompilationError = false;
		this.isPlaying = false;
		this.isRecording = false;
		this.mode = 'Bytebeat';
		this.recordChunks = [];
		this.sampleRate = 8000;
		this.settings = { drawMode: 'Points', drawScale: 5, isSeconds: false };
		this.timeCursor = null;
		this.init();
	}
	get saveData() {
		const a = document.body.appendChild(document.createElement('a'));
		a.style.display = 'none';
		const saveData = function(blob, fileName) {
			const url = URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName;
			a.click();
			setTimeout(() => window.URL.revokeObjectURL(url));
		};
		Object.defineProperty(this, 'saveData', { value: saveData });
		return saveData;
	}
	get timeCursorEnabled() {
		return this.sampleRate >> this.settings.drawScale < 3950;
	}
	animationFrame() {
		this.drawGraphics(this.byteSample);
		if(this.isPlaying) {
			this.requestAnimationFrame();
		}
	}
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}
	drawGraphics(endTime) {
		if(!isFinite(endTime)) {
			this.resetTime();
			return;
		}
		const buffer = this.drawBuffer;
		const bufferLen = buffer.length;
		if(!bufferLen) {
			return;
		}
		const redColor = 140;
		const waveColor = 160;
		const width = this.canvasWidth;
		const height = this.canvasHeight;
		const startTime = buffer[0].t;
		let startX = this.mod(this.getX(startTime), width);
		const endX = Math.floor(startX + this.getX(endTime - startTime));
		startX = Math.floor(startX);
		const drawWidth = Math.min(Math.abs(endX - startX) + 1, width);
		// Restoring the last points of a previous segment
		const imageData = this.canvasCtx.createImageData(drawWidth, height);
		if(this.settings.drawScale) {
			for(let y = 0; y < height; ++y) {
				let idx = (drawWidth * (255 - y)) << 2;
				const value = this.drawEndBuffer[y];
				if(value === redColor) {
					imageData.data[idx] = redColor;
				} else {
					imageData.data[idx++] = imageData.data[idx++] = imageData.data[idx] = value;
				}
			}
		}
		// Filling an alpha channel in a segment
		for(let x = 0; x < drawWidth; ++x) {
			for(let y = 0; y < height; ++y) {
				imageData.data[((drawWidth * y + x) << 2) + 3] = 255;
			}
		}
		// Drawing in a segment
		const isWaveform = this.settings.drawMode === 'Waveform';
		let prevY = buffer[0].value;
		for(let i = 0; i < bufferLen; ++i) {
			const curY = buffer[i].value;
			const curX = this.mod(Math.floor(this.getX(buffer[i].t)) - startX, width);
			const nextX = this.mod(Math.ceil(this.getX(buffer[i + 1]?.t ?? endTime)) - startX, width);
			// Error value - filling with red color
			if(isNaN(curY)) {
				for(let x = curX; x < nextX; ++x) {
					for(let y = 0; y < height; ++y) {
						const idx = (drawWidth * y + x) << 2;
						if(!imageData.data[idx + 1]) {
							imageData.data[idx] = redColor;
						}
					}
				}
				continue;
			}
			// Drawing vertical lines in Waveform mode
			if(isWaveform && curY !== prevY && !isNaN(prevY)) {
				for(let dy = prevY < curY ? 1 : -1, y = prevY + dy; y !== curY; y += dy) {
					let idx = (drawWidth * (255 - y) + curX) << 2;
					if(imageData.data[idx] === 0) {
						imageData.data[idx++] = imageData.data[idx++] = imageData.data[idx] = waveColor;
					}
				}
				prevY = curY;
			}
			// Points drawing
			for(let x = curX; x !== nextX; x = this.mod(x + 1, width)) {
				let idx = (drawWidth * (255 - curY) + x) << 2;
				imageData.data[idx++] = imageData.data[idx++] = imageData.data[idx] = 255;
			}
		}
		// Saving the last points of a segment
		if(this.settings.drawScale) {
			for(let y = 0; y < height; ++y) {
				this.drawEndBuffer[y] = imageData.data[(drawWidth * (255 - y) + drawWidth - 1) << 2];
			}
		}
		// Placing a segment on the canvas
		this.canvasCtx.putImageData(imageData, startX, 0);
		if(endX > width) {
			this.canvasCtx.putImageData(imageData, startX - width, 0);
		}
		// Move the cursor to the end of the segment
		if(this.timeCursorEnabled) {
			this.timeCursor.style.left = endX / width * 100 + '%';
		}
		// Clear buffer
		this.drawBuffer = [{ t: endTime, value: buffer[bufferLen - 1].value }];
	}
	expandEditor() {
		this.containerFixed.classList.toggle('container-expanded');
	}
	getX(t) {
		return t / (1 << this.settings.drawScale);
	}
	async init() {
		document.addEventListener('visibilitychange', () => (this.isActiveTab = !document.hidden));
		if(!window.location.hostname.includes(unescape('%64%6f%6c%6c%63%68%61%6e%2e%6e%65%74'))) {
			return;
		}
		try {
			this.settings = JSON.parse(localStorage.settings);
		} catch(err) {
			this.saveSettings();
		}
		await this.initAudioContext();
		if(document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.initAfterDom());
			return;
		}
		this.initAfterDom();
	}
	async initAfterDom() {
		this.initControls();
		this.initSettings();
		this.initLibraryEvents();
		this.parseUrl();
		loadScript('./scripts/playlist.mjs');
		loadScript('./scripts/codemirror.min.mjs');
	}
	async initAudioContext() {
		this.audioCtx = new AudioContext();
		this.audioGain = new GainNode(this.audioCtx);
		this.audioGain.connect(this.audioCtx.destination);
		await this.audioCtx.audioWorklet.addModule('./scripts/audioProcessor.mjs');
		this.audioWorkletNode = new AudioWorkletNode(this.audioCtx, 'audioProcessor');
		this.audioWorkletNode.port.onmessage = ({ data }) => this.receiveData(data);
		this.audioWorkletNode.connect(this.audioGain);
		const mediaDest = this.audioCtx.createMediaStreamDestination();
		const audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.ondataavailable = e => this.recordChunks.push(e.data);
		audioRecorder.onstop = e => {
			let file, type;
			const types = ['audio/webm', 'audio/ogg'];
			const files = ['track.webm', 'track.ogg'];
			while((file = files.pop()) && !MediaRecorder.isTypeSupported(type = types.pop())) {
				if(types.length === 0) {
					console.error('Saving is not supported in this browser!');
					break;
				}
			}
			this.saveData(new Blob(this.recordChunks, { type }), file);
		};
		this.audioGain.connect(mediaDest);
	}
	initControls() {
		this.canvasElem = document.getElementById('canvas-main');
		this.canvasCtx = this.canvasElem.getContext('2d');
		this.canvasTogglePlay = document.getElementById('canvas-toggleplay');
		this.containerFixed = document.getElementById('container-fixed');
		this.containerScroll = document.getElementById('container-scroll');
		this.controlCounter = document.getElementById('control-counter');
		this.controlCounterUnits = document.getElementById('control-counter-units');
		this.controlDrawMode = document.getElementById('control-drawmode');
		this.controlMode = document.getElementById('control-mode');
		this.controlSampleRate = document.getElementById('control-samplerate');
		this.controlScaleDown = document.getElementById('control-scaledown');
		this.controlTogglePlay = document.getElementById('control-toggleplay');
		this.controlVolume = document.getElementById('control-volume');
		this.errorElem = document.getElementById('error');
		this.editorElem = document.getElementById('editor-default');
		this.timeCursor = document.getElementById('canvas-timecursor');
		this.controlCounter.oninput = this.controlCounter.onkeydown = e => {
			if(e.key === 'Enter') {
				this.controlCounter.blur();
				this.togglePlay(true);
				return;
			}
			const { value } = this.controlCounter;
			const byteSample = this.settings.isSeconds ? Math.round(value * this.sampleRate) : value;
			this.setByteSample(byteSample);
			this.sendData({ byteSample });
		};
		this.editorElem.oninput = () => this.setFunction();
		this.editorElem.onkeydown = e => {
			if(e.key === 'Tab' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
				e.preventDefault();
				const el = e.target;
				const { value, selectionStart } = el;
				el.value = value.slice(0, selectionStart) + '\t' + value.slice(el.selectionEnd);
				el.setSelectionRange(selectionStart + 1, selectionStart + 1);
				this.setFunction();
			}
		};
		this.setVolume(this.controlVolume);
		this.onWindowResize();
		document.defaultView.addEventListener('resize', () => this.onWindowResize());
	}
	initLibraryEvents() {
		document.body.querySelectorAll('.library-header').forEach(el =>
			(el.onclick = () => el.nextElementSibling.classList.toggle('disabled')));
		const libraryElem = document.getElementById('container-scroll');
		libraryElem.onclick = e => {
			const el = e.target;
			if(el.tagName === 'CODE') {
				this.loadCode(Object.assign({ code: el.innerText },
					el.hasAttribute('data-songdata') ? JSON.parse(el.dataset.songdata) : {}));
			} else if(el.classList.contains('code-load')) {
				const xhr = new XMLHttpRequest();
				xhr.onreadystatechange = () => {
					if(xhr.readyState === 4 && xhr.status === 200) {
						this.loadCode(Object.assign(JSON.parse(el.dataset.songdata),
							{ code: xhr.responseText }));
					}
				};
				xhr.open('GET', `library/${
					el.classList.contains('code-load-formatted') ? 'formatted' :
					el.classList.contains('code-load-minified') ? 'minified' :
					el.classList.contains('code-load-original') ? 'original' : ''
				}/${ el.dataset.codeFile }`, true);
				xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
				xhr.send(null);
			} else if(el.classList.contains('code-toggle') && !el.getAttribute('disabled')) {
				const parentEl = el.parentNode;
				parentEl.classList.toggle('disabled');
				if(el.classList.contains('code-toggle-original')) {
					parentEl.previousElementSibling.classList.toggle('disabled');
				} else if(el.classList.contains('code-toggle-minified')) {
					parentEl.nextElementSibling.classList.toggle('disabled');
				}
			}
		};
		libraryElem.onmouseover = function(e) {
			const el = e.target;
			if(el.tagName === 'CODE') {
				el.title = 'Click to play this code';
			}
		};
	}
	initSettings() {
		this.setScale(0);
		this.setCounterUnits();
		this.controlDrawMode.value = this.settings.drawMode;
	}
	loadCode({ code, sampleRate, mode }, isPlay = true) {
		this.mode = this.controlMode.value = mode = mode || 'Bytebeat';
		if(this.editorView) {
			this.editorView.dispatch({
				changes: {
					from: 0,
					to: this.editorView.state.doc.toString().length,
					insert: code
				}
			});
		} else {
			this.editorElem.value = code;
		}
		this.setSampleRate(this.controlSampleRate.value = +sampleRate || 8000, false);
		const sampleRatio = this.sampleRate / this.audioCtx.sampleRate;
		const data = { mode, sampleRatio };
		if(isPlay) {
			this.togglePlay(true, false);
			data.isPlaying = isPlay;
			data.resetTime = true;
		} else {
			data.setFunction = code;
		}
		this.sendData(data);
	}
	mod(a, b) {
		return ((a % b) + b) % b;
	}
	onWindowResize() {
		const isSmallWindow = window.innerWidth <= 768;
		if(this.canvasWidth === 1024) {
			if(isSmallWindow) {
				this.canvasWidth = this.canvasElem.width = 512;
			}
		} else if(!isSmallWindow) {
			this.canvasWidth = this.canvasElem.width = 1024;
		}
	}
	parseUrl() {
		let { hash } = window.location;
		if(!hash) {
			this.updateUrl();
			({ hash } = window.location);
		}
		if(!hash.startsWith('#v3b64')) {
			console.error('Unrecognized url data');
			return;
		}
		const hashString = atob(hash.substr(6));
		const dataBuffer = new Uint8Array(hashString.length);
		for(const i in hashString) {
			if(Object.prototype.hasOwnProperty.call(hashString, i)) {
				dataBuffer[i] = hashString.charCodeAt(i);
			}
		}
		let songData = inflateRaw(dataBuffer, { to: 'string' });
		if(!songData.startsWith('{')) { // XXX: old format
			songData = { code: songData, sampleRate: 8000, mode: 'Bytebeat' };
		} else {
			try {
				songData = JSON.parse(songData);
				if(songData.formula) { // XXX: old format
					songData.code = songData.formula;
				}
			} catch(err) {
				console.error('Couldn\'t load data from url:', err);
				songData = null;
			}
		}
		if(songData !== null) {
			this.loadCode(songData, false);
		}
	}
	rec() {
		if(this.audioCtx && !this.isRecording) {
			this.audioRecorder.start();
			this.isRecording = true;
			this.recordChunks = [];
			if(!this.isPlaying) {
				this.togglePlay(true);
			}
		}
	}
	receiveData(data) {
		const { byteSample, error } = data;
		if(byteSample !== undefined) {
			this.setCounterValue(byteSample);
			this.setByteSample(byteSample);
		}
		if(data.drawBuffer !== undefined) {
			this.drawBuffer = this.drawBuffer.concat(data.drawBuffer);
			if(!this.isActiveTab) {
				this.drawBuffer = this.drawBuffer.slice(
					-this.canvasWidth * (1 << this.settings.drawScale));
			}
		}
		if(error !== undefined) {
			let isUpdate = false;
			if(error.isCompiled === false) {
				isUpdate = true;
				this.isCompilationError = true;
			} else if(error.isCompiled === true) {
				isUpdate = true;
				this.isCompilationError = false;
			} else if(error.isRuntime === true && !this.isCompilationError) {
				isUpdate = true;
			}
			if(isUpdate) {
				this.errorElem.innerText = error.message;
				this.sendData({ errorDisplayed: true });
			}
		}
		if(data.updateUrl === true) {
			this.updateUrl();
		}
	}
	requestAnimationFrame() {
		window.requestAnimationFrame(() => this.animationFrame());
	}
	resetTime() {
		this.sendData({ resetTime: true });
	}
	saveSettings() {
		localStorage.settings = JSON.stringify(this.settings);
	}
	sendData(data) {
		this.audioWorkletNode.port.postMessage(data);
	}
	setByteSample(value) {
		this.byteSample = +value || 0;
		if(value === 0) {
			this.drawBuffer = [];
			this.clearCanvas();
			this.timeCursor.style.left = 0;
			if(!this.isPlaying) {
				this.canvasTogglePlay.classList.add('canvas-initial');
			}
		}
	}
	setCounterUnits() {
		this.controlCounterUnits.textContent = this.settings.isSeconds ? 'sec' : 't';
		this.setCounterValue(this.byteSample);
	}
	setCounterValue(value) {
		this.controlCounter.value = this.settings.isSeconds ? (value / this.sampleRate).toFixed(2) : value;
	}
	setDrawMode() {
		this.settings.drawMode = this.controlDrawMode.value;
		this.saveSettings();
	}
	setFunction() {
		const setFunction = this.editorView ? this.editorView.state.doc.toString() : this.editorElem.value;
		this.sendData({ setFunction });
	}
	setMode(mode) {
		this.mode = mode;
		this.updateUrl();
		this.sendData({ mode });
	}
	setSampleRate(sampleRate, isSendData = true) {
		this.sampleRate = sampleRate;
		this.toggleTimeCursor();
		if(isSendData) {
			this.updateUrl();
			this.sendData({ sampleRatio: this.sampleRate / this.audioCtx.sampleRate });
		}
	}
	setScale(amount, buttonElem) {
		if(buttonElem?.getAttribute('disabled')) {
			return;
		}
		this.settings.drawScale = Math.max(this.settings.drawScale + amount, 0);
		this.saveSettings();
		this.clearCanvas();
		this.toggleTimeCursor();
		if(this.settings.drawScale <= 0) {
			this.controlScaleDown.setAttribute('disabled', true);
		} else {
			this.controlScaleDown.removeAttribute('disabled');
		}
	}
	setVolume({ value, max }) {
		const fraction = parseInt(value) / parseInt(max);
		this.audioGain.gain.value = fraction * fraction;
	}
	stopPlay() {
		this.togglePlay(false, false);
		this.sendData({ isPlaying: false, resetTime: true });
	}
	toggleCounterUnits() {
		this.settings.isSeconds = !this.settings.isSeconds;
		this.saveSettings();
		this.setCounterUnits();
	}
	togglePlay(isPlaying, isSendData = true) {
		this.controlTogglePlay.title = isPlaying ? 'Pause' : 'Play';
		this.controlTogglePlay.classList.toggle('control-play', !isPlaying);
		this.controlTogglePlay.classList.toggle('control-pause', isPlaying);
		this.canvasTogglePlay.classList.toggle('canvas-play', !isPlaying);
		this.canvasTogglePlay.classList.toggle('canvas-pause', isPlaying);
		if(isPlaying) {
			this.canvasTogglePlay.classList.remove('canvas-initial');
			if(this.audioCtx.resume) {
				this.audioCtx.resume();
				this.requestAnimationFrame();
			}
		} else if(this.isRecording) {
			this.audioRecorder.stop();
			this.isRecording = false;
		}
		this.isPlaying = isPlaying;
		if(isSendData) {
			this.sendData({ isPlaying });
		}
	}
	toggleTimeCursor() {
		this.timeCursor.classList.toggle('disabled', !this.timeCursorEnabled);
	}
	updateUrl() {
		const code = this.editorView ? this.editorView.state.doc.toString() : this.editorElem.value;
		const songData = { code };
		if(this.sampleRate !== 8000) {
			songData.sampleRate = this.sampleRate;
		}
		if(this.mode !== 'Bytebeat') {
			songData.mode = this.mode;
		}
		window.location.hash = `#v3b64${ btoa(String.fromCharCode.apply(undefined,
			deflateRaw(JSON.stringify(songData)))).replaceAll('=', '') }`;
	}
}();
