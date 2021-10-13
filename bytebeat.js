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

function BytebeatClass() {
	this.audioCtx = null;
	this.audioGain = null;
	this.audioRecorder = null;
	this.audioSample = 0;
	this.bufferSize = 2048;
	this.byteSample = 0;
	this.canvasCtx = null;
	this.canvasElem = null;
	this.drawScale = 5;
	this.drawXpos = 0;
	this.errorElem = null;
	this.fnRemover = null;
	this.inputElem = null;
	this.isPlaying = false;
	this.isRecording = false;
	this.lastByteValue = NaN;
	this.lastFlooredTime = -1;
	this.lastValue = NaN;
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

BytebeatClass.prototype = {
	get saveData() {
		const a = document.createElement('a');
		document.body.appendChild(a);
		a.style.display = 'none';
		const fn = function(blob, fileName) {
			const url = URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName;
			a.click();
			setTimeout(() => window.URL.revokeObjectURL(url));
		};
		Object.defineProperty(this, 'saveData', { value: fn });
		return fn;
	},
	applySampleRate(rate) {
		this.setSampleRate(rate);
		$id('control-samplerate').value = rate;
	},
	applyMode(mode) {
		this.mode = $id('control-mode').value = mode;
	},
	changeScale(amount) {
		if(!amount) {
			return;
		}
		this.drawScale = Math.max(this.drawScale + amount, 0);
		this.clearCanvas();
		if(this.drawScale === 0) {
			this.controlScaleDown.setAttribute('disabled', true);
		} else {
			this.controlScaleDown.removeAttribute('disabled');
		}
	},
	changeVolume(el) {
		const fraction = parseInt(el.value) / parseInt(el.max);
		// Let's use an x * x curve (x-squared) instead of simple linear (x)
		this.audioGain.gain.value = fraction * fraction;
	},
	clearCanvas() {
		const { width, height } = this.canvasElem;
		this.canvasCtx.clearRect(0, 0, width, height);
		this.imageData = this.canvasCtx.getImageData(0, 0, width, height);
	},
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
			this.canvasCtx.clearRect(
				Math.ceil(startX),
				0,
				endX >= 0 && endX < width ? Math.ceil(endX) - Math.ceil(startX) : width - Math.floor(startX),
				height
			);
			if(endX < 0 || endX >= width) {
				this.canvasCtx.clearRect(0, 0, Math.floor(mod(Math.ceil(endX), width)), height);
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
			this.timeCursor.style.left = Math.ceil(drawX(drawArea)) / width * 100 + '%';
			this.timeCursor.style.display = 'block';
		} else {
			this.timeCursor.style.display = 'none';
		}
	},
	func() {
		return 0;
	},
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
			const dataLen = chData.length;
			if(!dataLen) {
				return;
			}
			let time = this.sampleRatio * this.audioSample;
			let { byteSample } = this;
			const drawBuffer = [];
			const startFlooredTime = this.lastFlooredTime;
			const isBytebeat = this.mode === 'Bytebeat';
			const isFloatbeat = this.mode === 'Floatbeat';
			for(let i = 0; i < dataLen; ++i) {
				time += this.sampleRatio;
				const flooredTime = Math.floor(time);
				if(!this.isPlaying) {
					this.lastValue = 0;
				} else if(this.lastFlooredTime !== flooredTime) {
					const roundSample = Math.floor(byteSample);
					if(isBytebeat) {
						this.lastByteValue = this.func(roundSample) & 255;
						this.lastValue = this.lastByteValue / 127.5 - 1;
					} else if(isFloatbeat) {
						this.lastValue = this.func(roundSample);
						this.lastByteValue = Math.round((this.lastValue + 1) * 127.5);
					} else { // "Signed Byteveat"
						this.lastByteValue = (this.func(roundSample) + 128) & 255;
						this.lastValue = this.lastByteValue / 127.5 - 1;
					}
					drawBuffer.length = Math.abs(flooredTime - startFlooredTime);
					drawBuffer.fill(this.lastByteValue, Math.abs(this.lastFlooredTime - startFlooredTime));
					byteSample += flooredTime - this.lastFlooredTime;
					this.lastFlooredTime = flooredTime;
				}
				chData[i] = this.lastValue;
			}
			if(this.isPlaying) {
				this.audioSample += chData.length;
				this.drawGraphics(drawBuffer);
				this.setTime(byteSample, false);
			}
		};
		const audioGain = this.audioGain = this.audioCtx.createGain();
		this.changeVolume(this.controlVolume);
		processor.connect(audioGain);
		audioGain.connect(this.audioCtx.destination);

		const mediaDest = this.audioCtx.createMediaStreamDestination();
		const audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.ondataavailable = function(e) {
			this.recordChunks.push(e.data);
		}.bind(this);
		audioRecorder.onstop = function(e) {
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
		}.bind(this);
		audioGain.connect(mediaDest);
	},
	initCodeInput() {
		this.errorElem = $id('error');
		this.inputElem = $id('input-code');
		this.inputElem.addEventListener('onchange', this.refreshCalc.bind(this));
		this.inputElem.addEventListener('onkeyup', this.refreshCalc.bind(this));
		this.inputElem.addEventListener('input', this.refreshCalc.bind(this));
		this.inputElem.addEventListener('keydown', e => {
			if(e.keyCode === 9 /* TAB */ && !e.shiftKey) {
				e.preventDefault();
				const el = e.target;
				const { value } = el;
				const selStart = el.selectionStart;
				el.value = value.slice(0, selStart) + '\t' + value.slice(el.selectionEnd);
				el.setSelectionRange(selStart + 1, selStart + 1);
			}
		});
		/* global pako */
		if(window.location.hash.indexOf('#b64') === 0) { // XXX: old format
			this.inputElem.value = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(4))), { to: 'string' }
			) + ';';
		} else if(window.location.hash.indexOf('#v3b64') === 0) {
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
				}
			}
			this.loadCode(pData, false);
		}
	},
	initCanvas() {
		this.timeCursor = $id('canvas-timecursor');
		this.canvasElem = $id('canvas-main');
		this.canvasCtx = this.canvasElem.getContext('2d');
	},
	initControls() {
		this.canvasTogglePlay = $id('canvas-toggleplay');
		this.controlTogglePlay = $id('control-toggleplay');
		this.controlScaleUp = $id('control-scaleup');
		this.controlScaleDown = $id('control-scaledown');
		this.controlCounter = $id('control-counter-value');
		this.controlVolume = $id('control-volume');
	},
	initLibrary() {
		Array.prototype.forEach.call($Q('.library-header'), el =>
			(el.onclick = () => $toggle(el.nextElementSibling)));
		const libraryElem = $q('.container-scroll');
		libraryElem.onclick = function(e) {
			const el = e.target;
			if(el.tagName === 'CODE') {
				this.loadCode(Object.assign({ code: el.innerText }, JSON.parse(el.dataset.songdata)));
			} else if(el.classList.contains('code-load')) {
				const xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if(xhr.readyState === 4 && xhr.status === 200) {
						this.loadCode(Object.assign(JSON.parse(el.dataset.songdata),
							{ code: xhr.responseText }));
					}
				}.bind(this);
				xhr.open('GET', 'library/' + el.dataset.codeFile, true);
				xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
				xhr.send(null);
			}
		}.bind(this);
		libraryElem.onmouseover = function(e) {
			const el = e.target;
			if(el.tagName === 'CODE') {
				el.title = 'Click to play this code';
			}
		};
	},
	loadCode({ code, sampleRate, mode }, start = true) {
		this.inputElem.value = code;
		this.applySampleRate(+sampleRate || 8000);
		this.applyMode(mode || 'Bytebeat');
		if(start) {
			this.refreshCalc();
			this.resetTime();
			this.togglePlay(true);
		}
	},
	rec() {
		if(this.audioCtx && !this.isRecording) {
			this.audioRecorder.start();
			this.isRecording = true;
			this.recordChunks = [];
			if(!this.isPlaying) {
				this.togglePlay(true);
			}
		}
	},
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
		try {
			bytebeat.func = Function(...params, 't', `${ this.fnRemover }; return 0, ${ codeText || 0 } \n;`)
				.bind(window, ...values);
			bytebeat.func(0);
		} catch(err) {
			bytebeat.func = oldFunc;
			bytebeat.errorElem.innerText = err.toString();
			return;
		}
		// Delete single letter variables to prevent persistent variable errors (covers a good enough range)
		for(let i = 0; i < 26; ++i) {
			delete window[String.fromCharCode(65 + i)];
			delete window[String.fromCharCode(97 + i)];
		}
		this.errorElem.innerText = '';
		let pData = { code: codeText };
		if(this.sampleRate !== 8000) {
			pData.sampleRate = this.sampleRate;
		}
		if(this.mode !== 'Bytebeat') {
			pData.mode = this.mode;
		}
		pData = JSON.stringify(pData);
		window.location.hash = '#v3b64' + btoa(pako.deflateRaw(pData, { to: 'string' }));
	},
	resetTime() {
		this.setTime(0);
		this.clearCanvas();
		this.timeCursor.style.cssText = 'display: none; left: 0px;';
		if(!this.isPlaying) {
			this.canvasTogglePlay.classList.add('canvas-toggleplay-show');
		}
	},
	setTime(value, resetAudio = true) {
		this.controlCounter.textContent = this.byteSample = value;
		if(resetAudio) {
			this.audioSample = 0;
			this.lastFlooredTime = -1;
			this.lastValue = NaN;
			this.lastByteValue = NaN;
		}
	},
	setSampleRate(rate) {
		this.sampleRate = rate;
		this.updateSampleRatio();
	},
	togglePlay(isPlay) {
		this.controlTogglePlay.innerHTML = isPlay ? '&#9632;' : '&#9654;';
		this.canvasTogglePlay.classList.toggle('canvas-toggleplay-stop', isPlay);
		if(isPlay) {
			// Play
			this.canvasTogglePlay.classList.remove('canvas-toggleplay-show');
			if(this.audioCtx.resume) {
				this.audioCtx.resume();
			}
			if(!this.isPlaying) {
				this.isPlaying = true;
			}
			return;
		}
		// Stop
		if(this.isRecording) {
			this.audioRecorder.stop();
			this.isRecording = false;
		}
		this.isPlaying = false;
	},
	updateSampleRatio() {
		if(this.audioCtx) {
			const flooredTimeOffset = this.lastFlooredTime - Math.floor(this.sampleRatio * this.audioSample);
			this.sampleRatio = this.sampleRate / this.audioCtx.sampleRate;
			this.lastFlooredTime = Math.floor(this.sampleRatio * this.audioSample) - flooredTimeOffset;
			return this.sampleRatio;
		}
	}
};

const bytebeat = new BytebeatClass();
