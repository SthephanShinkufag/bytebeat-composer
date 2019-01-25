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
	this.bufferSize = 8192;
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
	this.mode = 0;
	this.playing = false;
	this.recording = false;
	this.sampleRate = 8000;
	this.sampleSize = 1;
	this.scale = 3;
	this.time = 0;
	document.addEventListener('DOMContentLoaded', function() {
		this.contScrollEl = $q('.container-scroll');
		this.contFixedEl = $q('.container-fixed');
		this.setScrollHeight();
		document.defaultView.addEventListener('resize', this.setScrollHeight);
		this.initLibrary();
		this.initInput();
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
		if(!this.playing) {
			this.refeshCalc();
		}
	},
	changeScale: function(isIncrement) {
		if(!isIncrement && this.scale > 0 || isIncrement && this.scale < 13) {
			this.scale += isIncrement ? 1 : -1;
			if(!this.playing) {
				this.refeshCalc();
			}
		}
	},
	draw: function(data) {
		// | 0 is faster than Math.floor
		var graphSizeInSamples = (data.length >> 2) >> this.scale;
		var currentSample = this.sampleSize * this.time;
		var page = graphSizeInSamples * ((currentSample / graphSizeInSamples) | 0);
		var width = this.canvWidth;
		var height = this.canvHeight;
		var arr = [];
		var dataLen = data.length;
		for(var i = 0; i < dataLen; i += 4) {
			var t = i >> 2;
			var ts = (t >> this.scale);
			var result = this.func(ts + page) & 255;
			if(this.mode === 1) {
				arr[ts] = result;
			}
			var pos = (width * (t % height) + ((t / height) | 0)) << 2;
			data[pos++] = data[pos++] = data[pos++] = this.mode === 0 ? result : 0; // R, G, B
			data[pos] = 255; // Alpha
		}
		if(this.mode === 1) {
			var arrLen = arr.length;
			for(var i = 0; i < arrLen; i++) {
				var pos = (arr[i] * width + (((i * width / arrLen) | 0) || 1)) << 2;
				data[pos++] = data[pos++] = data[pos] = 255;
			}
		}
		if(this.scale < 6) {
			var cursor = ((page ? currentSample % page : currentSample) * width / graphSizeInSamples) | 0;
			for(var i = 0; i < height; i++) {
				var pos = (i * width + cursor) << 2;
				data[pos] = data[pos + 4] = 255;
				data[pos + 1] = data[pos + 2] = data[pos + 5] = data[pos + 6] = 0;
			}
		}
		this.ctx.putImageData(this.imageData, 0, 0);
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
			this.draw(this.imageData.data);
			var data = e.outputBuffer.getChannelData(/* channel = */ 0);
			var dataLen = data.length;
			var lastSample = -1;
			var lastOutput = 0;
			for(var i = 0; i < dataLen; ++i) {
				var resampledTime = (this.sampleSize * this.time) | 0;
				if(!this.playing) {
					data[i] = 0;
				} else if(lastSample !== resampledTime) {
					data[i] = lastOutput = (this.func(resampledTime) & 255) / 127 - 1;
				} else {
					data[i] = lastOutput;
				}
				lastSample = resampledTime;
				if(this.playing) {
					this.time++;
				}
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
	initInput() {
		this.errorEl = document.getElementById('error');
		this.inputEl = document.getElementById('input');
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
					this.applySampleRate(+pData.sampleRate);
				} catch(err) {}
			}
			this.inputEl.innerText = formula;
		}
	},
	initCanvas: function() {
		this.canvas = document.getElementById('graph');
		this.ctx = this.canvas.getContext('2d');
		this.canvWidth = this.canvas.width;
		this.canvHeight = this.canvas.height;
		this.imageData = this.ctx.createImageData(this.canvWidth, this.canvHeight);
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
				this.setScrollHeight();
				this.time = 0;
				this.refeshCalc();
				this.play();
			}
		}.bind(this);
		libraryEl.onmouseover = function(e) {
			var el = e.target;
			if(el.tagName === 'CODE') {
				el.title = 'Click to play this code';
			}
		};
	},
	play: function() {
		if(!this.context) {
			this.initAudioContext();
		}
		if(!this.playing) {
			this.playing = true;
			this.time = 0;
		}
	},
	rec: function() {
		if(this.context && !this.recording) {
			this.audioRecorder.start();
			this.recording = true;
			this.chunks = [];
			if(!this.playing) {
				this.play();
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
		this.draw(this.imageData.data);
	},
	setSampleRate: function(rate) {
		this.sampleRate = rate;
		this.sampleSize = this.sampleRate / this.context.sampleRate;
	},
	setScrollHeight: function() {
		this.contScrollEl.style.maxHeight =
			(document.documentElement.clientHeight - this.contFixedEl.offsetHeight - 30) + 'px';
	},
	stop: function() {
		if(!this.context) {
			return;
		}
		if(this.recording) {
			this.audioRecorder.stop();
			this.recording = false;
		}
		this.playing = false;
		this.time = 0;
	}
};

var byteBeat = new ByteBeatClass();
