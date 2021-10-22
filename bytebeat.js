// eslint-disable-next-line no-unused-vars
const bytebeat = new class Bytebeat {
	constructor() {
		this.audioCtx = null;
		this.audioGain = null;
		this.audioRecorder = null;
		this.audioWorkletNode = null;
		this.byteSample = 0;
		this.canvasCtx = null;
		this.canvasElem = null;
		this.canvasTogglePlay = null;
		this.containerFixed = null;
		this.controlCounter = null;
		this.controlMode = null;
		this.controlSampleRate = null;
		this.controlScaleDown = null;
		this.controlTogglePlay = null;
		this.controlVolume = null;
		this.drawBuffer = [];
		this.drawScale = 5;
		this.editorElem = null;
		this.errorElem = null;
		this.isPlaying = false;
		this.isRecording = false;
		this.mode = 'Bytebeat';
		this.recordChunks = [];
		this.sampleRate = 8000;
		this.timeCursor = null;
		document.addEventListener('DOMContentLoaded', async () => {
			this.canvasElem = document.getElementById('canvas-main');
			this.canvasCtx = this.canvasElem.getContext('2d');
			this.canvasTogglePlay = document.getElementById('canvas-toggleplay');
			this.containerFixed = document.getElementById('container-fixed');
			this.controlCounter = document.getElementById('control-counter-value');
			this.controlMode = document.getElementById('control-mode');
			this.controlSampleRate = document.getElementById('control-samplerate');
			this.controlScaleDown = document.getElementById('control-scaledown');
			this.controlTogglePlay = document.getElementById('control-toggleplay');
			this.controlVolume = document.getElementById('control-volume');
			this.timeCursor = document.getElementById('canvas-timecursor');
			await this.initAudioContext();
			this.initLibraryEvents();
			this.initEditor();
		});
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
		return this.sampleRate >> this.drawScale < 3950;
	}
	animationFrame() {
		this.drawGraphics(this.byteSample);
		window.requestAnimationFrame(() => this.animationFrame());
	}
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
	}
	drawGraphics(endTime) {
		const buffer = this.drawBuffer;
		const bufferLen = buffer.length;
		if(!bufferLen) {
			return;
		}
		const { width, height } = this.canvasElem;
		const startTime = buffer[0].t;
		const mod = (a, b) => ((a % b) + b) % b;
		const getX = t => t / (1 << this.drawScale);
		let startX = mod(getX(startTime), width);
		const endX = Math.floor(startX + getX(endTime - startTime));
		startX = Math.floor(startX);
		const drawWidth = Math.abs(endX - startX) + 1;
		// Drawing on a segment
		const imageData = this.canvasCtx.createImageData(drawWidth, height);
		for(let i = 0; i < bufferLen; ++i) {
			const { t, value } = buffer[i];
			const nextElem = buffer[i + 1];
			const currentX = mod(Math.floor(getX(t)) - startX, width);
			const nextX = mod(Math.ceil(getX(nextElem ? nextElem.t : endTime)) - startX, width);
			for(let x = currentX; x !== nextX; x = mod(x + 1, width)) {
				let pos = (drawWidth * (255 - value) + Math.floor(x)) << 2;
				imageData.data[pos++] = imageData.data[pos++] =
				imageData.data[pos++] = imageData.data[pos] = 255;
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
	async initAudioContext() {
		this.audioCtx = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
		await this.audioCtx.audioWorklet.addModule('audioProcessor.js');
		if(!this.audioCtx.createGain) {
			this.audioCtx.createGain = this.audioCtx.createGainNode;
		}
		this.audioGain = this.audioCtx.createGain();
		this.setVolume(this.controlVolume);
		this.audioWorkletNode = new AudioWorkletNode(this.audioCtx, 'audioProcessor');
		this.audioWorkletNode.port.onmessage = ({ data }) => this.receiveData(data);
		this.audioWorkletNode.connect(this.audioGain);
		this.audioGain.connect(this.audioCtx.destination);
		const mediaDest = this.audioCtx.createMediaStreamDestination();
		const audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.ondataavailable = e => this.recordChunks.push(e.data);
		audioRecorder.onstop = e => {
			let file, type;
			const types = ['audio/webm', 'audio/ogg'];
			const files = ['track.webm', 'track.ogg'];
			while((file = files.pop()) && !MediaRecorder.isTypeSupported(type = types.pop())) {
				if(types.length === 0) {
					console.error('Saving not supported in this browser!');
					break;
				}
			}
			this.saveData(new Blob(this.recordChunks, { type }), file);
		};
		this.audioGain.connect(mediaDest);
	}
	initEditor() {
		this.errorElem = document.getElementById('error');
		this.editorElem = document.getElementById('editor');
		this.editorElem.addEventListener('input', () => this.setFunction());
		this.editorElem.addEventListener('keydown', e => {
			if(e.keyCode === 9 /* TAB */ && !e.shiftKey && !e.altKey && !e.ctrlKey) {
				e.preventDefault();
				const el = e.target;
				const { value, selectionStart } = el;
				el.value = value.slice(0, selectionStart) + '\t' + value.slice(el.selectionEnd);
				el.setSelectionRange(selectionStart + 1, selectionStart + 1);
				this.setFunction();
			}
		});
		/* global pako */
		let { hash } = window.location;
		if(!hash) {
			this.updateLocation();
			({ hash } = window.location);
		}
		if(!hash.startsWith('#v3b64')) {
			console.error('Unrecognized url data');
			return;
		}
		let pData = pako.inflateRaw(
			atob(decodeURIComponent(hash.substr(6))), { to: 'string' }
		);
		if(!pData.startsWith('{')) { // XXX: old format
			pData = { code: pData, sampleRate: 8000, mode: 'Bytebeat' };
		} else {
			try {
				pData = JSON.parse(pData);
				if(pData.formula) { // XXX: old format
					pData.code = pData.formula;
				}
			} catch(err) {
				console.error("Couldn't load data from url:", err);
				pData = null;
			}
		}
		if(pData !== null) {
			this.loadCode(pData, false);
		}
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
				xhr.open('GET', 'library/' + el.dataset.codeFile, true);
				xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
				xhr.send(null);
			}
		};
		libraryElem.onmouseover = function(e) {
			const el = e.target;
			if(el.tagName === 'CODE') {
				el.title = 'Click to play this code';
			}
		};
	}
	loadCode({ code, sampleRate, mode }, isPlay = true) {
		this.mode = this.controlMode.value = mode = mode || 'Bytebeat';
		this.editorElem.value = code;
		this.setSampleRate(this.controlSampleRate.value = +sampleRate || 8000, false);
		const sampleRatio = this.sampleRate / this.audioCtx.sampleRate;
		const data = { mode, sampleRatio, setFunction: code };
		if(isPlay) {
			this.togglePlay(true, false);
			data.isPlaying = isPlay;
			data.resetTime = true;
		}
		this.sendData(data);
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
		if(data.byteSample !== undefined) {
			this.setByteSample(data.byteSample);
		}
		if(data.drawBuffer !== undefined) {
			this.drawBuffer = this.drawBuffer.concat(data.drawBuffer);
		}
		if(data.error !== undefined) {
			this.errorElem.innerText = data.error;
		}
		if(data.updateLocation === true) {
			this.updateLocation();
		}
	}
	resetTime() {
		this.sendData({ resetTime: true });
	}
	sendData(data) {
		this.audioWorkletNode.port.postMessage(data);
	}
	setByteSample(value) {
		this.controlCounter.textContent = this.byteSample = value;
		if(value === 0) {
			this.drawBuffer = [];
			this.clearCanvas();
			this.timeCursor.style.left = 0;
			if(!this.isPlaying) {
				this.canvasTogglePlay.classList.add('canvas-toggleplay-show');
			}
		}
	}
	setFunction() {
		this.sendData({ setFunction: this.editorElem.value });
	}
	setMode(mode) {
		this.mode = mode;
		this.updateLocation();
		this.sendData({ mode });
	}
	setSampleRate(sampleRate, isSendData = true) {
		this.sampleRate = sampleRate;
		this.toggleTimeCursor();
		if(isSendData) {
			this.sendData({ sampleRatio: this.sampleRate / this.audioCtx.sampleRate });
		}
	}
	setScale(amount) {
		if(!amount) {
			return;
		}
		this.drawScale = Math.max(this.drawScale + amount, 0);
		this.clearCanvas();
		this.toggleTimeCursor();
		if(this.drawScale <= 0) {
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
	togglePlay(isPlaying, isSendData = true) {
		this.controlTogglePlay.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9654;';
		this.controlTogglePlay.title = isPlaying ? 'Pause' : 'Play';
		this.canvasTogglePlay.classList.toggle('canvas-toggleplay-stop', isPlaying);
		if(isPlaying) {
			this.canvasTogglePlay.classList.remove('canvas-toggleplay-show');
			if(this.audioCtx.resume) {
				this.audioCtx.resume();
				window.requestAnimationFrame(() => this.animationFrame());
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
	updateLocation() {
		const pData = { code: this.editorElem.value };
		if(this.sampleRate !== 8000) {
			pData.sampleRate = this.sampleRate;
		}
		if(this.mode !== 'Bytebeat') {
			pData.mode = this.mode;
		}
		window.location.hash = '#v3b64' + btoa(pako.deflateRaw(JSON.stringify(pData), { to: 'string' }));
	}
}();
