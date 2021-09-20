function $q(path, root) {
	return (root || document.body).querySelector(path);
}

function $Q(path, root) {
	return (root || document.body).querySelectorAll(path);
}

function $id(id) {
	return document.getElementById(id);
}

function $toggle(el) {
	var isHidden = el.style.display;
	if(isHidden) {
		el.style.removeProperty('display');
	} else {
		el.style.display = 'none';
	}
}

function ByteBeatClass() {
	this.audioCtx = null;
	this.audioGain = null;
	this.audioRecorder = null;
	this.bufferSize = 2048;
	this.canvCtx = null;
	this.canvEl = null;
	this.canvHeight = 0;
	this.canvWidth = 0;
	this.contFixedEl = null;
	this.contScrollEl = null;
	this.errorEl = null;
	this.imageData = null;
	this.isPlaying = false;
	this.isRecording = false;
	this.mode = 1;
	this.pageIdx = 0;
	this.recChunks = [];
	this.sampleRate = 8000;
	this.sampleRatio = 1;
	this.scaleMax = 10;
	this.scale = 6;
	this.time = 0;
	document.addEventListener('DOMContentLoaded', function() {
		this.contScrollEl = $q('.container-scroll');
		this.contFixedEl = $q('.container-fixed');
		this.setScrollHeight();
		document.defaultView.addEventListener('resize', this.setScrollHeight);
		this.initLibrary();
		this.initCodeInput();
		this.initControls();
		this.initCanvas();
		this.refeshCalc();
		this.initAudioContext();
	}.bind(this));
}
ByteBeatClass.prototype = {
	get saveData() {
		var a = document.createElement('a');
		document.body.appendChild(a);
		a.style.display = 'none';
		var fn = function(blob, fileName) {
			url = URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName;
			a.click();
			setTimeout(function() {
				window.URL.revokeObjectURL(url);
			});
		};
		Object.defineProperty(this, 'saveData', { value: fn });
		return fn;
	},
	applySampleRate: function(rate) {
		this.setSampleRate(rate);
		var selectBox = $id('samplerate-change');
		selectBox.childNodes.forEach(function(el, index) {
			if(+el.value === rate) {
				selectBox.selectedIndex = index;
			}
		}.bind(this));
	},
	changeMode: function() {
		this.mode = +!this.mode;
	},
	changeScale: function(isIncrement) {
		if(!isIncrement && this.scale > 0 || isIncrement && this.scale < this.scaleMax) {
			this.scale += isIncrement ? 1 : -1;
			this.pageIdx = 0;
			this.clearCanvas();
			if(this.scale === 0) {
				this.controlScaleDown.setAttribute('disabled', true);
			} else if(this.scale === this.scaleMax) {
				this.controlScaleUp.setAttribute('disabled', true);
			} else {
				this.controlScaleDown.removeAttribute('disabled');
				this.controlScaleUp.removeAttribute('disabled');
			}
			this.toggleCursor();
		}
	},
	changeVolume: function(el) {
		var fraction = parseInt(el.value) / parseInt(el.max);
		// Let's use an x * x curve (x-squared) instead of simple linear (x)
		this.audioGain.gain.value = fraction * fraction;
	},
	clearCanvas: function() {
		this.canvCtx.clearRect(0, 0, this.canvWidth, this.canvHeight);
		this.imageData = this.canvCtx.getImageData(0, 0, this.canvWidth, this.canvHeight);
	},
	// "| 0" is Math.floor but faster, ">> 2" is "/ 4", "<< 2" is "* 4"
	drawGraphics: function(buffer) {
		var width = this.canvWidth;
		var height = this.canvHeight;
		var scale = this.scale;
		var pageWidth = width >> scale;
		// var pageWidth = width * this.sampleRatio / (2 ** scale);
		var pageIdx = this.pageIdx;
		this.canvCtx.clearRect(pageWidth * pageIdx, 0, pageWidth, height);
		this.imageData = this.canvCtx.getImageData(0, 0, width, height);
		var imageData = this.imageData.data;
		var bufLen = buffer.length;
		for(var i = 0; i < bufLen; i++) {
			var pos = (width * buffer[i] + pageWidth * (pageIdx + i / bufLen)) << 2;
			imageData[pos++] = imageData[pos++] = imageData[pos++] = imageData[pos] = 255;
		}
		this.canvCtx.putImageData(this.imageData, 0, 0);
		this.pageIdx = pageIdx === (1 << scale) - 1 ? 0 : pageIdx + 1;
		// this.pageIdx = pageIdx === (((2 ** scale) / this.sampleRatio) | 0) - 1 ? 0 : pageIdx + 1;
		if(this.scale > 3) {
			this.timeCursor.style.left = pageWidth * this.pageIdx + 'px';
		}
	},
	func: function() {
		return 0;
	},
	initAudioContext: function() {
		var audioCtx = this.audioCtx = new (window.AudioContext || window.webkitAudioContext ||
			window.mozAudioContext || window.oAudioContext || window.msAudioContext)();
		if(!audioCtx.createGain) {
			audioCtx.createGain = audioCtx.createGainNode;
		}
		if(!audioCtx.createDelay) {
			audioCtx.createDelay = audioCtx.createDelayNode;
		}
		if(!audioCtx.createScriptProcessor) {
			audioCtx.createScriptProcessor = audioCtx.createJavaScriptNode;
		}
		this.sampleRatio = this.sampleRate / audioCtx.sampleRate;
		var processor = audioCtx.createScriptProcessor(this.bufferSize, 1, 1);
		processor.onaudioprocess = function(e) {
			var chData = e.outputBuffer.getChannelData(0);
			var dataLen = chData.length;
			if(!dataLen) {
				return;
			}
			var lastValue = 0;
			var lastByteValue = 0;
			var sampleRatio = this.sampleRatio;
			var time = sampleRatio * this.time;
			var lastTime = -1;
			var buffer = [];
			for(var i = 0; i < dataLen; ++i) {
				var flooredTime = time | 0;
				if(!this.isPlaying) {
					lastValue = 0;
				} else if(lastTime !== flooredTime) {
					lastByteValue = this.func(flooredTime) & 255;
					lastValue = lastByteValue / 127 - 1;
					lastTime = flooredTime;
					//buffer.push(lastByteValue);
				}
				chData[i] = lastValue;
				buffer[i] = lastByteValue;
				time += sampleRatio;
			}
			if(this.isPlaying) {
				this.setTime(this.time + dataLen);
				this.drawGraphics(buffer);
			}
		}.bind(this);
		var audioGain = this.audioGain = audioCtx.createGain();
		this.changeVolume(this.controlVolume);
		processor.connect(audioGain);
		audioGain.connect(audioCtx.destination);

		var mediaDest = audioCtx.createMediaStreamDestination();
		var audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.ondataavailable = function(e) {
			this.recChunks.push(e.data);
		}.bind(this);
		audioRecorder.onstop = function(e) {
			var file, type;
			var types = ['audio/webm', 'audio/ogg'];
			var files = ['track.webm', 'track.ogg'];
			var check = (MediaRecorder.isTypeSupported || function(type) {
				return MediaRecorder.canRecordMimeType && MediaRecordercanRecordMimeType(type) === 'probably';
			});
			while((file = files.pop()) && !check(type = types.pop())) {
				if(types.length === 0) {
					console.error('Saving not supported in this browser!');
					break;
				}
			}
			this.saveData(new Blob(this.recChunks, { type: type }), file);
		}.bind(this);
		audioGain.connect(mediaDest);
	},
	initCodeInput: function() {
		this.errorEl = $id('error');
		this.inputEl = $id('input-code');
		this.inputEl.addEventListener('onchange', this.refeshCalc.bind(this));
		this.inputEl.addEventListener('onkeyup', this.refeshCalc.bind(this));
		this.inputEl.addEventListener('input', this.refeshCalc.bind(this));
		this.inputEl.addEventListener('keydown', function(e) {
			if(e.keyCode === 9 /* TAB */ && !e.shiftKey) {
				e.preventDefault();
				var el = e.target;
				var value = el.value;
				var selStart = el.selectionStart;
				el.value = value.slice(0, selStart) + '\t' + value.slice(el.selectionEnd);
				el.setSelectionRange(selStart + 1, selStart + 1);
			}
		});
		if(window.location.hash.indexOf('#b64') === 0) {
			this.inputEl.value = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(4))),
				{ to: 'string' }) + ';';
		} else if(window.location.hash.indexOf('#v3b64') === 0) {
			var pData = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(6))),
				{ to: 'string' });
			codeText = pData;
			if(pData.startsWith('{')) {
				try {
					pData = JSON.parse(pData);
					codeText = pData.formula;
					this.applySampleRate(+pData.sampleRate);
				} catch(err) {}
			}
			this.inputEl.value = codeText;
		}
	},
	initCanvas: function() {
		this.timeCursor = $id('canvas-timecursor');
		this.canvEl = $id('canvas-main');
		this.canvCtx = this.canvEl.getContext('2d');
		this.canvWidth = this.canvEl.width;
		this.canvHeight = this.canvEl.height;
		this.imageData = this.canvCtx.createImageData(this.canvWidth, this.canvHeight);
	},
	initControls: function() {
		this.canvasTogglePlay = $id('canvas-toggleplay');
		this.controlTogglePlay = $id('control-toggleplay');
		this.controlScaleUp = $id('control-scaleup');
		this.controlScaleDown = $id('control-scaledown');
		this.controlCounter = $id('control-counter-value');
		this.controlVolume = $id('control-volume');
	},
	initLibrary: function() {
		Array.prototype.forEach.call($Q('.button-toggle'), function(el) {
			el.onclick = function() {
				$toggle(el.nextElementSibling);
			};
		});
		var libraryEl = $q('.container-scroll');
		libraryEl.onclick = function(e) {
			var el = e.target;
			if(el.tagName === 'CODE') {
				this.insertAndRunCode(el, el.textContent);
			} else if(el.classList.contains('code-load')) {
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if(xhr.readyState === 4 && xhr.status === 200) {
						this.insertAndRunCode(el, xhr.responseText);
					}
				}.bind(this);
				xhr.open('GET', 'library/' + el.getAttribute('loadcode'), true);
				xhr.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate");
				xhr.send(null);
			}
		}.bind(this);
		libraryEl.onmouseover = function(e) {
			var el = e.target;
			if(el.tagName === 'CODE') {
				el.title = 'Click to play this code';
			}
		};
	},
	insertAndRunCode: function(codeEl, codeText) {
		this.inputEl.value = codeText;
		this.applySampleRate(+codeEl.getAttribute('samplerate') || 8000);
		this.refeshCalc();
		this.resetTime();
		this.togglePlay(true);
	},
	rec: function() {
		if(this.audioCtx && !this.isRecording) {
			this.audioRecorder.start();
			this.isRecording = true;
			this.recChunks = [];
			if(!this.isPlaying) {
				this.togglePlay(true);
			}
		}
	},
	refeshCalc: function() {
		var oldF = this.func;
		var codeText = this.inputEl.value;
		var outputCode = codeText
			.replace(/\/\/.*/g, ' ') // Remove // comments
			.replace(/\n/g, ' ') // Remove line breaks
			.replace(/\/\*.*?\*\//g, ' ') // Remove /* */ comments
			.replace(/\bint\b/g, 'floor') // Replace int to floor
			.replace(/(?:Math\.)?(\w+)/g, function(str, method) { // Replace sin to Math.sin, etc.
				return Math.hasOwnProperty(method) && method !== 'E' ? 'Math.' + method : str;
			});
		try {
			eval('byteBeat.func = function(t) { return ' + outputCode + '; }');
			this.func(0);
		} catch(err) {
			this.func = oldF;
			this.errorEl.innerText = err.toString();
			return;
		}
		this.errorEl.innerText = '';
		var pData = (this.sampleRate === 8000 ? codeText :
			JSON.stringify({ sampleRate: this.sampleRate, formula: codeText }));
		window.location.hash = '#v3b64' + btoa(pako.deflateRaw(pData, { to: 'string' }));
		this.setScrollHeight();
		this.pageIdx = 0;
		this.clearCanvas();
	},
	resetTime: function() {
		this.controlCounter.textContent = this.time = 0;
		this.pageIdx = 0;
		this.clearCanvas();
		this.timeCursor.style.cssText = 'display: none; left: 0px;';
		if(!this.isPlaying) {
			this.canvasTogglePlay.classList.add('canvas-toggleplay-show');
		}
	},
	setTime: function(value) {
		this.controlCounter.textContent = this.time = value;
	},
	setSampleRate: function(rate) {
		this.sampleRate = rate;
		if(this.audioCtx) {
			this.sampleRatio = this.sampleRate / this.audioCtx.sampleRate;
		}
	},
	setScrollHeight: function() {
		if(this.contScrollEl) {
			this.contScrollEl.style.maxHeight =
				(document.documentElement.clientHeight - this.contFixedEl.offsetHeight - 4) + 'px';
		}
	},
	toggleCursor: function() {
		this.timeCursor.style.display = this.scale <= 3 ? 'none' : 'block';
	},
	togglePlay: function(isPlay) {
		this.controlTogglePlay.textContent = isPlay ? 'Stop' : 'Play';
		this.canvasTogglePlay.classList.toggle('canvas-toggleplay-stop', isPlay);
		if(isPlay) {
			// Play
			this.canvasTogglePlay.classList.remove('canvas-toggleplay-show');
			this.toggleCursor();
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
	}
};

var byteBeat = new ByteBeatClass();
