function play() {
	if(!playing) {
		playing = true;
		n = 0;
	}
}

function stop() {
	if(recording) {
		mediaRecorder.stop();
		recording = false;
	}
	playing = false;
	n = 0;
}

function changeScale(isIncrement) {
	if(!isIncrement && scale > 0 || isIncrement && scale < 13) {
		scale += isIncrement ? 1 : -1;
	}
}

function rec() {
	if(!recording) {
		mediaRecorder.start();
		recording = true;
		chunks = [];
		if(!playing) {
			play();
		}
	}
}

function changeMode() {
	mode = +!mode;
}

function refeshCalc(e) {
	var formula = inputEl.innerText;
	var oldF = func;
	try {
		eval('func = function(t) { return ' + formula + '; }');
		func(0);
	} catch(e) {
		func = oldF;
		errorEl.innerText = e.toString();
		return;
	}
	errorEl.innerText = '';
	window.location.hash = '#v3b64' + btoa(pako.deflateRaw(formula, { to: 'string' }));
	draw(imageData.data);
}

function draw(data) {
	// | 0 is faster than Math.floor
	var graphSizeInSamples = (data.length >> 2) >> scale;
	var k = 8e3 / context.sampleRate;
	var currentSample = k * n;
	// var deltaTime = (k * bufferSize) | 0;
	var page = graphSizeInSamples * ((currentSample / graphSizeInSamples) | 0);
	var width = canvas.width;
	var height = canvas.height;
	var arr = [];
	var dataLen = data.length;
	for(var i = 0; i < dataLen; i += 4) {
		var t = i >> 2;
		var ts = (t >> scale);
		var result = func(ts + page) & 255;
		if(mode === 1) {
			arr[ts] = result;
		}
		var pos = (width * (t % height) + ((t / height) | 0)) << 2;
		data[pos++] = data[pos++] = data[pos++] = mode === 0 ? result : 0;
		data[pos] = 255;
	}
	if(mode === 1) {
		var arrLen = arr.length;
		// var ratio1 = dataLen / (arrLen * 4);
		// var ratio2 = Math.pow(2, scale);
		// ratio1 === ratio2;
		// console.log(dataLen, arrLen, ratio, ratio2);
		for(var i = 0; i < arrLen; i++) {
			var pos = (arr[i] * width + (((i * width / arrLen) | 0) || 1)) << 2;
			data[pos++] = data[pos++] = data[pos] = 255;
		}
	}
	if(scale < 6) {
		var cursor = ((page ? currentSample % page : currentSample) * width / graphSizeInSamples) | 0;
		for(var i = 0; i < height; i++) {
			var pos = (i * width + cursor) << 2;
			data[pos] = data[pos + 4] = 255;
			data[pos + 1] = data[pos + 2] = data[pos + 5] = data[pos + 6] = 0;
		}
	}
	ctx.putImageData(imageData, 0, 0);
}

var canvas, ctx, imageData, saveData, errorEl, inputEl;
var mode = 0;
var n = 0;
var scale = 3;
var playing = false;
var recording = false;
var func = function() {
	return 0;
};

var context = new (window.AudioContext || window.webkitAudioContext ||
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

var bufferSize = 8192;
var sampleSize = 8e3 / context.sampleRate;
var scriptNode = context.createScriptProcessor(bufferSize, 1, 1);
scriptNode.onaudioprocess = function(e) {
	draw(imageData.data);
	var data = e.outputBuffer.getChannelData(/* channel = */ 0);
	var dataLen = data.length;
	var lastSample = -1;
	var lastOutput = 0;
	for(var i = 0; i < dataLen; ++i) {
		var resampledTime = (sampleSize * n) | 0;
		if(!playing) {
			data[i] = 0;
		} else if(lastSample !== resampledTime) {
			data[i] = lastOutput = (func(resampledTime) & 255) / 127 - 1;
		} else {
			data[i] = lastOutput;
		}
		lastSample = resampledTime;
		if(playing) {
			n++;
		}
	}
}
scriptNode.connect(context.destination);

var chunks = [];
var dest = context.createMediaStreamDestination();
var mediaRecorder = new MediaRecorder(dest.stream);
mediaRecorder.ondataavailable = function(e) {
	chunks.push(e.data);
};
mediaRecorder.onstop = function(e) {
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
	saveData(new Blob(chunks, { type: type }), file);
};
scriptNode.connect(dest);

document.addEventListener('DOMContentLoaded', function() {
	var $q = function(path, root) {
		return (root || document.body).querySelector(path);
	};
	var $Q = function(path, root) {
		return (root || document.body).querySelectorAll(path);
	};
	var $id = function(id) {
		return document.getElementById(id);
	};
	var $toggle = function(el) {
		var isHidden = el.style.display;
		if(isHidden) {
			el.style.removeProperty('display');
		} else {
			el.style.display = 'none';
		}
	};

	var contScrollEl = $q('.container-scroll');
	var contFixedEl = $q('.container-fixed');
	var setScrollHeight = function() {
		contScrollEl.style.maxHeight =
			(document.documentElement.clientHeight - contFixedEl.offsetHeight - 30) + 'px';
	};

	setScrollHeight();
	document.defaultView.addEventListener('resize', setScrollHeight);

	Array.prototype.forEach.call($Q('.button-toggle'), function(el) {
		el.onclick = function() {
			$toggle(el.nextElementSibling);
		};
	});

	var libraryEl = $id('library');
	libraryEl.onclick = function(e) {
		var el = e.target;
		if(el.tagName === 'CODE') {
			inputEl.innerText = el.innerText.trim();
			setScrollHeight();
			n = 0;
			refeshCalc();
			play();
		}
	};
	libraryEl.onmouseover = function(e) {
		var el = e.target;
		if(el.tagName === 'CODE') {
			el.title = 'Click to play this code';
		}
	};

	errorEl = document.getElementById('error');
	inputEl = document.getElementById('input');
	inputEl.addEventListener('onchange', refeshCalc);
	inputEl.addEventListener('onkeyup', refeshCalc);
	inputEl.addEventListener('input', refeshCalc);

	if(window.location.hash.indexOf('#b64') === 0) {
		inputEl.innerText = pako.inflateRaw(
			atob(decodeURIComponent(window.location.hash.substr(4))),
			{ to: 'string' }) + ';';
	} else if(window.location.hash.indexOf('#v3b64') === 0) {
		inputEl.innerText = pako.inflateRaw(
			atob(decodeURIComponent(window.location.hash.substr(6))),
			{ to: 'string' });
	}

	canvas = document.getElementById('graph');
	ctx = canvas.getContext('2d');
	imageData = ctx.createImageData(canvas.width, canvas.height);

	saveData = (function() {
		var a = document.createElement('a');
		document.body.appendChild(a);
		a.style.display = 'none';
		return function(blob, fileName) {
			url = URL.createObjectURL(blob);
			a.href = url;
			a.download = fileName;
			a.click();
			setTimeout(function() {
				window.URL.revokeObjectURL(url);
			});
		};
	}());

	refeshCalc();
});
