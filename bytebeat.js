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
	this.audioRecorder = null;
	this.bufferSize = 2048;
	this.canvas = null;
	this.canvWidth = 0;
	this.canvHeight = 0;
	this.chunks = [];
	this.context = null;
	this.contFixedEl = null;
	this.contScrollEl = null;
	this.ctx = null;
	this.errorEl = null;
	this.imageData = null;
	this.mode = 1;
	this.pageIdx = 0;
	this.playing = false;
	this.recording = false;
	this.sampleRate = 8000;
	this.sampleSize = 1;
	this.scaleMax = 9;
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
			if(+el.value === this.sampleRate) {
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
				this.controlScaleUp.setAttribute('disabled', true);
			} else if(this.scale === this.scaleMax) {
				this.controlScaleDown.setAttribute('disabled', true);
			} else {
				this.controlScaleUp.removeAttribute('disabled');
				this.controlScaleDown.removeAttribute('disabled');
			}
		}
	},
	clearCanvas: function() {
		this.ctx.clearRect(0, 0, this.canvWidth, this.canvHeight);
		this.imageData = this.ctx.getImageData(0, 0, this.canvWidth, this.canvHeight);
	},
	// "| 0" is Math.floor but faster
	// ">> 2" is division by 4
	draw: function(sampleData) {
		var width = this.canvWidth;
		var height = this.canvHeight;
		var scale = this.scale;
		var pageWidth = width >> scale;
		var pageIdx = this.pageIdx;
		var x = pageWidth * pageIdx;
		this.ctx.clearRect(x, 0, pageWidth, height);
		this.imageData = this.ctx.getImageData(0, 0, width, height);
		var imageData = this.imageData.data;
		var bufLen = sampleData.length;
		for(var i = 0; i < bufLen; i++) {
			var pos = (width * sampleData[i] +
				(pageWidth * pageIdx + ((pageWidth * i / bufLen) | 0))) << 2;
			imageData[pos++] = imageData[pos++] = imageData[pos++] = imageData[pos] = 255;
		}
		this.ctx.putImageData(this.imageData, 0, 0);
		if(scale !== 0) {
			this.pageIdx = pageIdx === (1 << scale) - 1 ? 0 : pageIdx + 1;
		}
	},
	func: function() {
		return 0;
	},
	initAudioContext: function() {
		var context = this.context = new (window.AudioContext || window.webkitAudioContext ||
			window.mozAudioContext || window.oAudioContext || window.msAudioContext)();
		if(!context.createGain) {
			context.createGain = context.createGainNode;
		}
		if(!context.createDelay) {
			context.createDelay = context.createDelayNode;
		}
		if(!context.createScriptProcessor) {
			context.createScriptProcessor = context.createJavaScriptNode;
		}
		this.sampleSize = this.sampleRate / context.sampleRate;
		var processor = context.createScriptProcessor(this.bufferSize, 1, 1);
		processor.onaudioprocess = function(e) {
			var chData = e.outputBuffer.getChannelData(/* channel = */ 0);
			var dataLen = chData.length;
			var sampleData = [];
			var lastSample = -1;
			var lastOutput = 0;
			for(var i = 0; i < dataLen; ++i) {
				var resampledTime = (this.sampleSize * this.time) | 0;
				if(!this.playing) {
					chData[i] = sampleData[i] = 0;
				} else if(lastSample !== resampledTime) {
					var value = this.func(resampledTime) & 255;
					sampleData[i] = value;
					chData[i] = lastOutput = value / 127 - 1;
				} else {
					sampleData[i] = 0;
					chData[i] = lastOutput;
				}
				lastSample = resampledTime;
				if(this.playing) {
					this.setTime(this.time + 1);
				}
			}
			if(this.playing) {
				this.draw(sampleData);
			}
		}.bind(this);
		processor.connect(context.destination);

		var mediaDest = context.createMediaStreamDestination();
		var audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.ondataavailable = function(e) {
			this.chunks.push(e.data);
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
			this.saveData(new Blob(this.chunks, { type: type }), file);
		}.bind(this);
		processor.connect(mediaDest);
	},
	initCodeInput() {
		this.errorEl = $id('error');
		this.inputEl = $id('input');
		this.inputEl.addEventListener('onchange', this.refeshCalc.bind(this));
		this.inputEl.addEventListener('onkeyup', this.refeshCalc.bind(this));
		this.inputEl.addEventListener('input', this.refeshCalc.bind(this));
		if(window.location.hash.indexOf('#b64') === 0) {
			this.inputEl.innerText = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(4))),
				{ to: 'string' }) + ';';
		} else if(window.location.hash.indexOf('#v3b64') === 0) {
			var pData = pako.inflateRaw(
				atob(decodeURIComponent(window.location.hash.substr(6))),
				{ to: 'string' });
			formula = pData;
			if(pData.startsWith('{')) {
				try {
					pData = JSON.parse(pData);
					formula = pData.formula;
					if(!this.context) {
						this.initAudioContext();
					}
					this.applySampleRate(+pData.sampleRate);
				} catch(err) {}
			}
			this.inputEl.innerText = formula;
		}
	},
	initCanvas: function() {
		this.canvas = $id('canvas-main');
		this.ctx = this.canvas.getContext('2d');
		this.canvWidth = this.canvas.width;
		this.canvHeight = this.canvas.height;
		this.imageData = this.ctx.createImageData(this.canvWidth, this.canvHeight);
	},
	initControls: function() {
		this.controlTogglePlay = $id('control-toggleplay');
		this.controlScaleUp = $id('control-scaleup');
		this.controlScaleDown = $id('control-scaledown');
		this.controlCounter = $id('control-counter-value');
	},
	initLibrary() {
		Array.prototype.forEach.call($Q('.button-toggle'), function(el) {
			el.onclick = function() {
				$toggle(el.nextElementSibling);
			};
		});
		var libraryEl = $id('library');
		libraryEl.onclick = function(e) {
			var el = e.target;
			if(el.tagName === 'CODE') {
				if(!this.context) {
					this.initAudioContext();
				}
				this.inputEl.innerText = el.innerText.trim();
				this.applySampleRate(+el.getAttribute('samplerate') || 8000);
				this.refeshCalc();
				this.setTime(0);
				this.togglePlay(true);
			}
			if(el.classList.contains('prettycode-toggle')) {
				el.classList.toggle('prettycode-show');
			}
		}.bind(this);
		libraryEl.onmouseover = function(e) {
			var el = e.target;
			if(el.tagName === 'CODE') {
				el.title = 'Click to play this code';
			}
		};
	},
	rec: function() {
		if(this.context && !this.recording) {
			this.audioRecorder.start();
			this.recording = true;
			this.chunks = [];
			if(!this.playing) {
				this.togglePlay(true);
			}
		}
	},
	refeshCalc: function() {
		var formula = this.inputEl.innerText;
		var oldF = this.func;
		try {
			eval('byteBeat.func = function(t) { return ' + formula + '; }');
			this.func(0);
		} catch(err) {
			this.func = oldF;
			this.errorEl.innerText = err.toString();
			return;
		}
		this.errorEl.innerText = '';
		var pData = (this.sampleRate === 8000 ? formula :
			JSON.stringify({ sampleRate: this.sampleRate, formula: formula }));
		window.location.hash = '#v3b64' + btoa(pako.deflateRaw(pData, { to: 'string' }));
		this.setScrollHeight();
		this.pageIdx = 0;
		this.clearCanvas();
	},
	setTime: function(value) {
		this.controlCounter.textContent = this.time = value;
		if(value === 0) {
			this.pageIdx = 0;
			this.clearCanvas();
		}
	},
	setSampleRate: function(rate) {
		this.sampleRate = rate;
		this.sampleSize = this.sampleRate / this.context.sampleRate;
	},
	setScrollHeight: function() {
		if(this.contScrollEl) {
			this.contScrollEl.style.maxHeight =
				(document.documentElement.clientHeight - this.contFixedEl.offsetHeight - 4) + 'px';
		}
	},
	togglePlay: function(isPlay) {
		this.controlTogglePlay.textContent = isPlay ? 'Stop' : 'Play';
		if(isPlay) {
			// Play
			if(!this.playing) {
				this.playing = true;
				this.setTime(0);
			}
			if(!this.context) {
				this.initAudioContext();
			}
			return;
		}
		// Stop
		if(!this.context) {
			return;
		}
		if(this.recording) {
			this.audioRecorder.stop();
			this.recording = false;
		}
		this.playing = false;
		this.setTime(0);
	}
};

var byteBeat = new ByteBeatClass();
