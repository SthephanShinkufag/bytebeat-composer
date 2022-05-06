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
		this.cachedElemParent = null;
		this.cachedTextNode = null;
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
		const saveData = (blob, fileName) => {
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
	escapeHTML(text) {
		this.cachedTextNode.nodeValue = text;
		return this.cachedElemParent.innerHTML;
	}
	expandEditor() {
		this.containerFixed.classList.toggle('container-expanded');
	}
	generateLibraryEntry({
		author,
		children,
		codeMinified,
		codeOriginal,
		date,
		description,
		file,
		fileFormatted,
		fileMinified,
		fileOriginal,
		mode,
		remixed,
		sampleRate,
		starred,
		url
	}) {
		let entry = '';
		if(description) {
			entry += !url ? description : `<a href="${ url }" target="_blank">${ description }</a>`;
		}
		if(author) {
			let authorsList = '';
			const authorsArr = Array.isArray(author) ? author : [author];
			for(let i = 0, len = authorsArr.length; i < len; ++i) {
				const authorElem = authorsArr[i];
				if(typeof authorElem === 'string') {
					authorsList += description || !url ? authorElem :
						`<a href="${ url }" target="_blank">${ authorElem }</a>`;
				} else {
					authorsList += `<a href="${ authorElem[1] }" target="_blank">${ authorElem[0] }</a>`;
				}
				if(i < len - 1) {
					authorsList += ', ';
				}
			}
			entry += `<span>${ description ? ` (by ${ authorsList })` : `by ${ authorsList }` }</span>`;
		}
		if(url && !description && !author) {
			entry += `(<a href="${ url }" target="_blank">source</a>)`;
		}
		if(remixed) {
			entry += ` (remix of ${ remixed.url ?
				`<a href="${ remixed.url }" target="_blank">${ remixed.description || '(source)' }</a>` :
				`"${ remixed.description }"` }${ remixed.author ? ' by ' + remixed.author : '' })`;
		}
		if(date) {
			entry += ` <span class="code-date">(${ date })</span>`;
		}
		if(sampleRate) {
			entry += ` <span class="code-samplerate">${ sampleRate }Hz</span>`;
		}
		if(mode) {
			entry += ` <span class="code-samplerate">${ mode }</span>`;
		}
		const songData = codeOriginal || codeMinified || file ? JSON.stringify({ sampleRate, mode }) : '';
		if(codeMinified) {
			if(codeOriginal) {
				entry += ` <span class="code-length" title="Size in characters">${
					codeMinified.length }c</span><button class="code-button code-toggle"` +
					' title="Minified version shown. Click to view the original version.">+</button>';
			}
		} else if(codeOriginal) {
			entry += ` <span class="code-length" title="Size in characters">${ codeOriginal.length }c</span>`;
		}
		if(file) {
			if(fileFormatted) {
				entry += `<button class="code-button code-load code-load-formatted" data-songdata='${
					songData }' data-code-file="${ file
				}" title="Click to load and play the formatted code">► formatted</button>`;
			}
			if(fileOriginal) {
				entry += `<button class="code-button code-load code-load-original" data-songdata='${
					songData }' data-code-file="${ file
				}" title="Click to load and play the original code">► original</button>`;
			}
			if(fileMinified) {
				entry += `<button class="code-button code-load code-load-minified" data-songdata='${
					songData }' data-code-file="${ file
				}" title="Click to load and play the minified code">► minified</button>`;
			}
		}
		if(codeOriginal) {
			if(Array.isArray(codeOriginal)) {
				codeOriginal = codeOriginal.join('\r\n');
			}
			entry += `<br><button class="code-text code-text-original${
				codeMinified ? ' disabled' : '' }" data-songdata='${
				songData }' code-length="${ codeOriginal.length }">${ this.escapeHTML(codeOriginal) }</a>`;
		}
		if(codeMinified) {
			entry += `${ codeOriginal ? '' : '<br>' }<button class="code-text code-text-minified"` +
				` data-songdata='${ songData }' code-length="${ codeMinified.length }">${
					this.escapeHTML(codeMinified) }</a>`;
		}
		if(children) {
			let childrenStr = '';
			for(let i = 0, len = children.length; i < len; ++i) {
				childrenStr += this.generateLibraryEntry(children[i]);
			}
			entry += `<div class="entry-children">${ childrenStr }</div>`;
		}
		return `<div class="${ codeOriginal || codeMinified || file || children ? 'entry' : 'entry-text' }${
			starred ? ' ' + ['star-white', 'star-yellow'][starred - 1] : '' }">${ entry }</div>`;
	}
	getX(t) {
		return t / (1 << this.settings.drawScale);
	}
	handleEvent({ target: el, type }) {
		if(type === 'click') {
			if(el.classList.contains('code-text')) {
				this.loadCode(Object.assign({ code: el.innerText },
					el.hasAttribute('data-songdata') ? JSON.parse(el.dataset.songdata) : {}));
			} else if(el.classList.contains('code-load')) {
				this.onclickCodeLoadButton(el);
			} else if(el.classList.contains('code-toggle') && !el.getAttribute('disabled')) {
				this.onclickCodeToggleButton(el);
			} else if(el.classList.contains('library-header')) {
				this.onclickLibraryHeader(el);
			} else if(el.parentNode.classList.contains('library-header')) {
				this.onclickLibraryHeader(el.parentNode);
			}
			return;
		}
		if(type === 'mouseover' && el.classList.contains('code-text')) {
			el.title = 'Click to play this code';
		}
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
	initAfterDom() {
		this.initElements();
		this.parseUrl();
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
					console.error('Recording is not supported in this browser!');
					break;
				}
			}
			this.saveData(new Blob(this.recordChunks, { type }), file);
		};
		this.audioGain.connect(mediaDest);
	}
	initElements() {
		// Containers
		this.containerFixed = document.getElementById('container-fixed');
		this.containerScroll = document.getElementById('container-scroll');
		this.containerScroll.addEventListener('click', this);
		this.containerScroll.addEventListener('mouseover', this);
		this.cachedElemParent = document.createElement('div');
		this.cachedTextNode = document.createTextNode('');
		this.cachedElemParent.appendChild(this.cachedTextNode);

		// Volume
		this.controlVolume = document.getElementById('control-volume');
		this.setVolume(this.controlVolume);

		// Canvas
		this.canvasElem = document.getElementById('canvas-main');
		this.onresizeWindow();
		document.defaultView.addEventListener('resize', () => this.onresizeWindow());
		this.canvasCtx = this.canvasElem.getContext('2d');
		this.canvasTogglePlay = document.getElementById('canvas-toggleplay');
		this.timeCursor = document.getElementById('canvas-timecursor');

		// Controls
		this.controlDrawMode = document.getElementById('control-drawmode');
		this.controlDrawMode.value = this.settings.drawMode;
		this.controlMode = document.getElementById('control-mode');
		this.controlSampleRate = document.getElementById('control-samplerate');
		this.controlScaleDown = document.getElementById('control-scaledown');
		this.controlTogglePlay = document.getElementById('control-toggleplay');
		this.setScale(0);

		// Time counter
		this.controlCounter = document.getElementById('control-counter');
		this.controlCounterUnits = document.getElementById('control-counter-units');
		this.setCounterUnits();
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

		// Editor
		this.errorElem = document.getElementById('error');
		this.editorElem = document.getElementById('editor-default');
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
	onclickCodeLoadButton(el) {
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
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
	}
	onclickCodeToggleButton(el) {
		const parentEl = el.parentNode;
		const origEl = parentEl.querySelector('.code-text-original');
		const minEl = parentEl.querySelector('.code-text-minified');
		origEl?.classList.toggle('disabled');
		minEl?.classList.toggle('disabled');
		const isMinified = el.textContent === '–';
		parentEl.querySelector('.code-length').textContent =
			`${ (isMinified ? minEl : origEl).getAttribute('code-length') }c`;
		el.title = isMinified ? 'Minified version shown. Click to view the original version.' :
			'Original version shown. Click to view the minified version.';
		el.textContent = isMinified ? '+' : '–';
	}
	onclickLibraryHeader(el) {
		const containerEl = el.nextElementSibling;
		const state = containerEl.classList;
		if(state.contains('loaded') || el.parentNode.open) {
			return;
		}
		state.add('loaded');
		const waitEl = el.querySelector('.loading-wait');
		waitEl.classList.remove('disabled');
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState !== 4) {
				return;
			}
			waitEl.classList.add('disabled');
			const { status } = xhr;
			if(status !== 200 && status !== 304) {
				state.remove('loaded');
				containerEl.innerHTML = `<div class="loading-error">Unable to load the library: ${
					status } ${ xhr.statusText }</div>`;
				return;
			}
			containerEl.innerHTML = '';
			let libraryHTML = '';
			const libraryArr = JSON.parse(xhr.responseText);
			for(let i = 0, len = libraryArr.length; i < len; ++i) {
				libraryHTML += `<div class="entry-top">${ this.generateLibraryEntry(libraryArr[i]) }</div>`;
			}
			containerEl.insertAdjacentHTML('beforeend', libraryHTML);
		};
		xhr.open('GET', `./library/${ containerEl.id.replace('library-', '') }.json`, true);
		xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		xhr.send(null);
	}
	onresizeWindow() {
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
		let songData;
		if(hash.startsWith('#v3b64')) {
			const hashString = atob(hash.substr(6));
			const dataBuffer = new Uint8Array(hashString.length);
			for(const i in hashString) {
				if(Object.prototype.hasOwnProperty.call(hashString, i)) {
					dataBuffer[i] = hashString.charCodeAt(i);
				}
			}
			try {
				songData = inflateRaw(dataBuffer, { to: 'string' });
				if(!songData.startsWith('{')) { // XXX: old format
					songData = { code: songData, sampleRate: 8000, mode: 'Bytebeat' };
				} else {
					songData = JSON.parse(songData);
					if(songData.formula) { // XXX: old format
						songData.code = songData.formula;
					}
				}
			} catch(err) {
				console.error(`Couldn't load data from url: ${ err }`);
			}
		} else {
			console.error('Couldn\'t load data from url: unrecognized url data');
		}
		this.loadCode(songData ||
			{ code: this.editorView ? this.editorView.state.doc.toString() : this.editorElem.value }, false);
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
