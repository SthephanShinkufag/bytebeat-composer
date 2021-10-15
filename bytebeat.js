const $q = (path, root = document.body) => root.querySelector(path);
const $Q = (path, root = document.body) => root.querySelectorAll(path);
const $id = id => document.getElementById(id);

function $toggle(el) {
	if(el.style.display) {
		el.style.removeProperty('display');
	} else {
		el.style.display = 'none';
	}
}

const bytebeat = new class Bytebeat {
	constructor() {
		this.audioCtx = null;
		this.audioGain = null;
		this.audioRecorder = null;
		this.audioSample = 0;
		this.bufferSize = 2048;
		this.byteSample = 0;
		this.canvasCtx = null;
		this.canvasElem = null;
		this.drawScale = 5;
		this.errorElem = null;
		this.fnRemover = null;
		this.func = () => 0;
		this.inputElem = null;
		this.isPlaying = false;
		this.isRecording = false;
		this.lastByteValue = 0;
		this.lastFlooredTime = -1;
		this.lastFuncValue = -1;
		this.lastValue = 0;
		this.mode = 'Bytebeat';
		this.recordChunks = [];
		this.sampleRate = 8000;
		this.sampleRatio = 1;
		document.addEventListener('DOMContentLoaded', () => {
			this.initLibrary();
			this.initCodeInput();
			this.initControls();
			this.initCanvas();
			this.refreshCalc();
			this.initAudioContext();
		});
	}
	get saveData() {
		const a = document.createElement('a');
		document.body.appendChild(a);
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
	applySampleRate(rate) {
		this.setSampleRate(rate);
		$id('control-samplerate').value = rate;
	}
	applyMode(mode) {
		this.mode = $id('control-mode').value = mode;
	}
	changeScale(amount) {
		if(!amount) {
			return;
		}
		this.drawScale = Math.max(this.drawScale + amount, 0);
		this.clearCanvas();
		if(this.drawScale <= 0) {
			this.controlScaleDown.setAttribute('disabled', true);
		} else {
			this.controlScaleDown.removeAttribute('disabled');
		}
	}
	changeVolume(el) {
		const fraction = parseInt(el.value) / parseInt(el.max);
		this.audioGain.gain.value = fraction * fraction;
	}
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
	}
	drawGraphics(buffer) {
		const drawArea = buffer.length;
		if(!drawArea) {
			return;
		}
		const { width, height } = this.canvasElem;
		const mod = (a, b) => ((a % b) + b) % b;
		const drawX = (i = 0, j = 0) => mod(((this.byteSample + i) / (1 << this.drawScale)) + j, width);
		const drawLen = (i = 0, j = 0) => i / (1 << this.drawScale) + j;
		// Clear canvas
		if(drawArea >> this.drawScale > width) {
			this.canvasCtx.clearRect(0, 0, width, height);
		} else {
			const startX = drawX();
			const endX = startX + drawLen(drawArea);
			const ceiledEndx = Math.ceil(endX);
			this.canvasCtx.clearRect(
				Math.ceil(startX),
				0,
				endX >= 0 && endX < width ? ceiledEndx - Math.ceil(startX) : width - Math.floor(startX),
				height
			);
			if(endX < 0 || endX >= width) {
				this.canvasCtx.clearRect(0, 0, Math.floor(mod(ceiledEndx, width)), height);
			}
		}

		// Draw
		const imageData = this.canvasCtx.getImageData(0, 0, width, height);
		for(let i = 0; i < drawArea; ++i) {
			let pos = (width * (255 - buffer[i]) + drawX(i)) << 2;
			imageData.data[pos++] = imageData.data[pos++] = imageData.data[pos++] = imageData.data[pos] = 255;
		}
		this.canvasCtx.putImageData(imageData, 0, 0);

		// Cursor
		if(this.sampleRate >> this.drawScale < 3950) {
			this.timeCursor.style.cssText =
				`display: block; left: ${ Math.ceil(drawX(drawArea)) / width * 100 }%;`;
		} else {
			this.timeCursor.style.display = 'none';
		}
	}
	initAudioContext() {
		this.audioCtx = new (window.AudioContext || window.webkitAudioContext ||
			window.mozAudioContext || window.oAudioContext || window.msAudioContext)();
		if(!this.audioCtx.createGain) {
			this.audioCtx.createGain = this.audioCtx.createGainNode;
		}
		if(!this.audioCtx.createDelay) {
			this.audioCtx.createDelay = this.audioCtx.createDelayNode;
		}
		if(!this.audioCtx.createScriptProcessor) {
			this.audioCtx.createScriptProcessor = this.audioCtx.createJavaScriptNode;
		}
		this.updateSampleRatio();
		const processor = this.audioCtx.createScriptProcessor(this.bufferSize, 1, 1);
		processor.onaudioprocess = e => {
			const chData = e.outputBuffer.getChannelData(0);
			const chDataLen = chData.length;
			if(!chDataLen) {
				return;
			}
			if(!this.isPlaying) {
				chData.fill(0);
				return;
			}
			let time = this.sampleRatio * this.audioSample;
			let { byteSample } = this;
			const drawBuffer = [];
			const startFlooredTime = this.lastFlooredTime;
			const isBytebeat = this.mode === 'Bytebeat';
			const isFloatbeat = this.mode === 'Floatbeat';
			for(let i = 0; i < chDataLen; ++i) {
				time += this.sampleRatio;
				const flooredTime = Math.floor(time);
				if(this.lastFlooredTime !== flooredTime) {
					let funcValue = 0;
					let noErrors = true;
					try {
						funcValue = this.func(Math.floor(byteSample));
					} catch(err) {
						noErrors = false;
					}
					if(funcValue !== this.lastFuncValue && noErrors) {
						if(isBytebeat) {
							this.lastByteValue = funcValue & 255;
							this.lastValue = this.lastByteValue / 127.5 - 1;
						} else if(isFloatbeat) {
							this.lastValue = funcValue;
							this.lastByteValue = Math.round((this.lastValue + 1) * 127.5);
						} else { // "Signed Byteveat"
							this.lastByteValue = (funcValue + 128) & 255;
							this.lastValue = this.lastByteValue / 127.5 - 1;
						}
					}
					drawBuffer.length = Math.abs(flooredTime - startFlooredTime);
					drawBuffer.fill(this.lastByteValue, Math.abs(this.lastFlooredTime - startFlooredTime));
					byteSample += flooredTime - this.lastFlooredTime;
					this.lastFuncValue = funcValue;
					this.lastFlooredTime = flooredTime;
				}
				chData[i] = this.lastValue;
			}
			if(this.isPlaying) {
				this.audioSample += chDataLen;
				this.drawGraphics(drawBuffer);
				this.setByteSample(byteSample, false);
			}
		};
		const audioGain = this.audioGain = this.audioCtx.createGain();
		this.changeVolume(this.controlVolume);
		processor.connect(audioGain);
		audioGain.connect(this.audioCtx.destination);

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
		audioGain.connect(mediaDest);
	}
	initCodeInput() {
		this.errorElem = $id('error');
		this.inputElem = $id('input-code');
		this.inputElem.addEventListener('input', () => this.refreshCalc());
		this.inputElem.addEventListener('keydown', e => {
			if(e.keyCode === 9 /* TAB */ && !e.shiftKey && !e.altKey && !e.ctrlKey) {
				e.preventDefault();
				const el = e.target;
				const { value, selectionStart } = el;
				el.value = value.slice(0, selectionStart) + '\t' + value.slice(el.selectionEnd);
				el.setSelectionRange(selectionStart + 1, selectionStart + 1);
				this.refreshCalc();
			}
		});
		/* global pako */
		if(window.location.hash.startsWith('#b64')) { // XXX: old format
			this.inputElem.value = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(4))), { to: 'string' }
			) + ';';
		} else if(window.location.hash.startsWith('#v3b64')) {
			let pData = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(6))), { to: 'string' }
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
		} else if(window.location.hash) {
			console.error('Unrecognized url data');
		}
	}
	initCanvas() {
		this.timeCursor = $id('canvas-timecursor');
		this.canvasElem = $id('canvas-main');
		this.canvasCtx = this.canvasElem.getContext('2d');
	}
	initControls() {
		this.canvasTogglePlay = $id('canvas-toggleplay');
		this.controlTogglePlay = $id('control-toggleplay');
		this.controlScaleUp = $id('control-scaleup');
		this.controlScaleDown = $id('control-scaledown');
		this.controlCounter = $id('control-counter-value');
		this.controlVolume = $id('control-volume');
	}
	initLibrary() {
		$Q('.library-header').forEach(el => (el.onclick = () => $toggle(el.nextElementSibling)));
		const libraryElem = $q('.container-scroll');
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
	loadCode({ code, sampleRate, mode }, start = true) {
		this.inputElem.value = code;
		this.applySampleRate(+sampleRate || 8000);
		this.applyMode(mode || 'Bytebeat');
		if(start) {
			this.refreshCalc();
			this.resetTime();
			this.togglePlay(true);
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
	refreshCalc() {
		const oldFunc = this.func;
		const codeText = this.inputElem.value;

		// Create shortened Math functions
		const params = Object.getOwnPropertyNames(Math);
		const values = params.map(k => Math[k]);
		params.push('int');
		values.push(Math.floor);

		// Remove functions to prevent XSS
		this.fnRemover = this.fnRemover || (function() {
			const keys = {};
			Object.getOwnPropertyNames(globalThis).forEach(key => (keys[key] = true));
			['console', 'escape', 'Math', 'parseInt', 'window'].forEach(key => delete keys[key]);
			return `let ${ Object.keys(keys).sort().join(',\n') }`;
		}());

		// Test bytebeat code
		try {
			this.func = new Function(...params, 't', `${ this.fnRemover }; return 0, ${ codeText || 0 } \n;`)
				.bind(window, ...values);
			this.func(0);
		} catch(err) {
			this.func = oldFunc;
			this.errorElem.innerText = err.toString();
			return;
		}
		this.errorElem.innerText = '';

		// Delete single letter variables to prevent persistent variable errors (covers a good enough range)
		for(let i = 0; i < 26; ++i) {
			delete window[String.fromCharCode(65 + i)];
			delete window[String.fromCharCode(97 + i)];
		}

		// Generate url
		let pData = { code: codeText };
		if(this.sampleRate !== 8000) {
			pData.sampleRate = this.sampleRate;
		}
		if(this.mode !== 'Bytebeat') {
			pData.mode = this.mode;
		}
		pData = JSON.stringify(pData);
		window.location.hash = '#v3b64' + btoa(pako.deflateRaw(pData, { to: 'string' }));
	}
	resetTime() {
		this.setByteSample(0);
		this.clearCanvas();
		this.timeCursor.style.display = 'none';
		if(!this.isPlaying) {
			this.canvasTogglePlay.classList.add('canvas-toggleplay-show');
		}
	}
	setByteSample(value, resetAudio = true) {
		this.controlCounter.textContent = this.byteSample = value;
		if(resetAudio) {
			this.audioSample = this.lastByteValue = this.lastValue = 0;
			this.lastFlooredTime = this.lastFuncValue = -1;
		}
	}
	setSampleRate(rate) {
		this.sampleRate = rate;
		this.updateSampleRatio();
	}
	togglePlay(isPlay) {
		this.controlTogglePlay.innerHTML = isPlay ? '&#9632;' : '&#9654;';
		this.canvasTogglePlay.classList.toggle('canvas-toggleplay-stop', isPlay);
		if(isPlay) {
			this.canvasTogglePlay.classList.remove('canvas-toggleplay-show');
			if(this.audioCtx.resume) {
				this.audioCtx.resume();
			}
		} else if(this.isRecording) {
			this.audioRecorder.stop();
			this.isRecording = false;
		}
		this.isPlaying = isPlay;
	}
	updateSampleRatio() {
		if(this.audioCtx) {
			const flooredTimeOffset = this.lastFlooredTime - Math.floor(this.sampleRatio * this.audioSample);
			this.sampleRatio = this.sampleRate / this.audioCtx.sampleRate;
			this.lastFlooredTime = Math.floor(this.sampleRatio * this.audioSample) - flooredTimeOffset;
			return this.sampleRatio;
		}
	}
}();
