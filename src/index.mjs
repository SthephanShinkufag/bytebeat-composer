import { Editor } from './editor.mjs';
import { Library } from './library.mjs';
import { Scope } from './scope.mjs';
import { UI } from './ui.mjs';
import { getCodeFromUrl, getUrlFromCode } from './url.mjs';

const editor = new Editor();
const library = new Library();
const scope = new Scope();
const ui = new UI();

globalThis.bytebeat = new class {
	constructor() {
		// Settings
		this.defaultSettings = {
			codeStyle: 'Atom Dark',
			colorDiagram: '#0080ff',
			colorStereo: 1,
			colorTimeCursor: '#80bbff',
			colorWaveform: '#ffffff',
			drawMode: scope.drawMode,
			drawScale: scope.drawScale,
			fftSize: scope.fftSize,
			isSeconds: false,
			libraryFilters: library.filters,
			showAllSongs: library.showAllSongs,
			srDivisor: 1,
			themeStyle: 'Default Dark',
			volume: .5
		};
		this.settings = this.defaultSettings;

		// Playback and calculations
		this.byteSample = 0; // Current time in samples
		this.isCompilationError = false;
		this.isPlaying = false;
		this.isRecording = false;
		this.mode = 'Bytebeat';
		this.playbackSpeed = 1;
		this.sampleRate = 8000;

		// Visualizator scope
		this.isNeedClear = false; // Flag to clear the ring buffer, the scope canvas and time cursor in the UI

		// Lag detection
		this.isLagging = false;
		this.lastUpdateTime = 0;
		this.updateCounter = 0;

		// Audio nodes
		this.audioCtx = null;
		this.audioGain = null;
		this.audioRecordChunks = [];
		this.audioRecorder = null;
		this.audioWorkletNode = null;

		// A timer that sends signals to warm up the cache after a page has loaded, covering the period
		//   before any user interaction and while the worker process() is not yet available
		this.precacheInterval = null;

		// Start the initialization
		this.init();
	}

	// Main events handler on the page
	handleEvent(event) {
		let elem = event.target;
		const { classList } = elem;
		switch(event.type) {
		case 'change':
			switch(elem.id) {
			case 'control-code-style': this.setCodeStyle(elem.value); break;
			case 'control-color-diagram': this.setColorDiagram(elem.value); break;
			case 'control-color-stereo':
				this.setColorStereo(+elem.value);
				ui.controlColorDiagramInfo.innerHTML = scope.getColorTest('colorDiagram');
				ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform');
				break;
			case 'control-color-timecursor': this.setColorTimeCursor(elem.value); break;
			case 'control-color-waveform': this.setColorWaveform(elem.value); break;
			case 'control-drawmode': this.setDrawMode(elem.value); break;
			case 'control-mode': this.setPlaybackMode(elem.value); break;
			case 'control-samplerate':
			case 'control-samplerate-select': this.setSampleRate(+elem.value); break;
			case 'control-theme-style': this.setThemeStyle(elem.value); break;
			case 'library-expand-checkbox':
				library.showAllSongs = elem.checked;
				ui.toggleExpandSongs(library.showAllSongs);
				this.saveSettings();
				break;
			}
			return;

		case 'click':
			switch(elem.tagName) {
			case 'svg': elem = elem.parentNode; break;
			case 'use': elem = elem.parentNode.parentNode; break;
			default:
				if(classList.contains('control-fast-multiplier')) {
					elem = elem.parentNode;
				}
			}
			switch(elem.id) {
			case 'scroll-btn-down':
				ui.containerScroll.scrollTo({ top: ui.containerScroll.scrollHeight, behavior: 'smooth' });
				break;
			case 'scroll-btn-up':
				ui.containerScroll.scrollTo({ top: 0, behavior: 'smooth' });
				break;
			case 'canvas-container':
			case 'canvas-main':
			case 'canvas-play':
			case 'canvas-timecursor': this.playbackToggle(!this.isPlaying); break;
			case 'control-counter':
			case 'control-pause': this.playbackToggle(false); break;
			case 'control-expand': ui.expandEditor(); break;
			case 'control-link': ui.copyLink(); break;
			case 'control-play-backward': this.playbackToggle(true, true, -1); break;
			case 'control-play-forward': this.playbackToggle(true, true, 1); break;
			case 'control-rec': this.toggleRecording(); break;
			case 'control-reset': this.resetTime(); break;
			case 'control-scale': this.resetScopeAdjustment(); break;
			case 'control-scaledown': this.setScopeAdjustment(-1, elem); break;
			case 'control-scaleup': this.setScopeAdjustment(1); break;
			case 'control-srdivisor-down': this.setSRDivisor(-1); break;
			case 'control-srdivisor-up': this.setSRDivisor(1); break;
			case 'control-stop': this.playbackStop(); break;
			case 'control-counter-units': this.toggleCounterUnits(); break;
			default:
				switch(true) {
				case classList.contains('article-button'):
					ui.onclickArticleNavButton(elem);
					break;
				case classList.contains('code-load'):
					library.onclickCodeLoadButton(elem);
					break;
				case classList.contains('code-remix-load'):
					library.onclickRemixLoadButton(elem);
					break;
				case classList.contains('code-size'):
					library.onclickCodeLoadButton(elem.parentNode);
					break;
				case classList.contains('code-text'): {
					// If in the description block then load code from text
					if(elem.parentNode.classList.contains('code-description')) {
						this.loadCode(Object.assign({ code: elem.innerText },
							elem.hasAttribute('data-songdata') ? JSON.parse(elem.dataset.songdata) : {}));
						break;
					}
					// Look for the panel with "min / orig / format" buttons within the same song
					const buttonsContainer = elem.previousElementSibling;
					if(buttonsContainer) {
						const targetButton = buttonsContainer.querySelector('[data-type="minified"]') ||
							buttonsContainer.querySelector('[data-type="original"]') ||
							buttonsContainer.querySelector('[data-type="formatted"]');
						if(targetButton) {
							// Simulate a click, passing the button to handler
							library.onclickCodeLoadButton(targetButton);
						}
					}
					break;
				}
				case classList.contains('filter-button'):
					ui.onclickFilterButton(elem);
					this.settings.libraryFilters = library.filters = ui.getLibraryFilters();
					this.saveSettings();
					library.showSongs();
					break;
				case classList.contains('song-hash'):
					navigator.clipboard.writeText(elem.dataset.hash);
					event.preventDefault();
					break;
				}
			}
			return;

		case 'input':
			switch(elem.id) {
			case 'control-counter':
				this.oninputCounter(event);
				break;
			case 'control-volume':
				this.setVolume(false);
				break;
			case 'library-search-input':
				this.settings.libraryFilters = library.filters = ui.getLibraryFilters();
				this.saveSettings();
				library.showSongs();
				break;
			}
			return;

		case 'keydown':
			if(elem.id === 'control-counter') {
				this.oninputCounter(event);
			}
			return;

		case 'mouseover':
			switch(true) {
			case classList.contains('code-load'):
				elem.title = `Click to play the ${ elem.dataset.type } code`;
				break;
			case classList.contains('code-text'):
				elem.title = 'Click to play this code';
				break;
			case classList.contains('songs-header'):
				elem.title = 'Click to show/hide the songs';
				break;
			case classList.contains('song-hash'):
				elem.title = 'Click to copy the song hash into clipboard';
				break;
			case classList.contains('tag-c'):
				elem.title = 'C-compatible code';
				break;
			case classList.contains('tag-console'):
				elem.title = 'Outputs messages in the error console';
				break;
			case classList.contains('tag-drawing'):
				elem.title = 'Generates art in the visualiser\'s scope';
				break;
			case classList.contains('tag-port'):
				elem.title = 'Ported to bytebeat from other platform formats.';
				break;
			case classList.contains('tag-sample'):
				elem.title = 'Uses encoded audio samples (PCM, for example)';
				break;
			case classList.contains('tag-slow'):
				elem.title = 'May be performance issues. Try switching Chrome/Firefox.';
				break;
			}
			return;

		case 'scroll': {
			const { clientHeight, scrollHeight, scrollTop } = ui.containerScroll;
			// Show "Back to top" if scrolled more than 100px from the top
			ui.containerScrollUp.classList.toggle('hidden', scrollTop < 5);
			// Hide "To the end" if the bottom limit has already been reached (with a 5px margin)
			ui.containerScrollDown.classList.toggle('hidden', scrollTop >= scrollHeight - clientHeight - 5);
			return;
		}
		}
	}

	// Initial running on the page
	async init() {
		try {
			this.settings = JSON.parse(localStorage.settings);
			scope.drawMode = this.settings.drawMode;
			scope.drawScale = this.settings.drawScale;
			scope.setFFTSize(+this.settings.fftSize || 10);
			library.filters = this.settings.libraryFilters || this.defaultSettings.libraryFilters;
			library.showAllSongs = this.settings.showAllSongs;
		} catch(err) {
			this.saveSettings();
		}
		this.setThemeStyle();
		await this.initAudio();
		if(document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.initAfterDom());
			return;
		}
		this.initAfterDom();
	}

	// Running after the DOM content was loaded
	initAfterDom() {
		library.showSongs(); // Load the songs in the library
		editor.init(); // Initialize the code editor and CodeMirror
		ui.initElements();
		scope.initElements();
		this.setVolume(true);
		this.setCounterUnits();
		this.setCodeStyle();
		this.setColorStereo();
		this.setColorDiagram();
		this.setColorWaveform();
		this.setColorTimeCursor();
		this.setScopeAdjustment(0);
		this.parseUrl(); // Load the code from the location hash
		console.log('initAfterDom > sendData', { drawMode: scope.drawMode });
		this.sendData({ drawMode: scope.drawMode });
		ui.setLibraryFilters(library.filters);
		ui.controlDrawMode.value = scope.drawMode;
		ui.controlThemeStyle.value = this.settings.themeStyle;
		ui.controlCodeStyle.value = this.settings.codeStyle;
		ui.mainElem.addEventListener('click', this);
		ui.mainElem.addEventListener('change', this);
		ui.containerFixed.addEventListener('input', this);
		ui.containerFixed.addEventListener('keydown', this);
		ui.containerScroll.addEventListener('input', this);
		ui.containerScroll.addEventListener('mouseover', this);
		ui.containerScroll.addEventListener('scroll', this);
	}

	// Audio context initialization
	async initAudio() {
		this.audioCtx = new AudioContext({ latencyHint: 'playback', sampleRate: 48000 });
		this.audioGain = new GainNode(this.audioCtx);
		this.audioGain.connect(this.audioCtx.destination);

		// Analyser for FFT mode
		scope.analyser = [this.audioCtx.createAnalyser(), this.audioCtx.createAnalyser()];
		scope.analyser[0].minDecibels = scope.analyser[1].minDecibels = scope.minDecibels;
		scope.analyser[0].maxDecibels = scope.analyser[1].maxDecibels = scope.maxDecibels;
		scope.setFFTAnalyzer();

		// Connect the analyzer to the audio context
		const splitter = this.audioCtx.createChannelSplitter(2);
		splitter.connect(scope.analyser[0], 0);
		splitter.connect(scope.analyser[1], 1);

		const analyserGain = new GainNode(this.audioCtx);
		analyserGain.connect(splitter);

		// AudioWorklet for main calculations processing
		await this.audioCtx.audioWorklet.addModule('./build/audio-processor.mjs');
		this.audioWorkletNode = new AudioWorkletNode(this.audioCtx, 'audioProcessor',
			{ outputChannelCount: [2] });
		this.audioWorkletNode.port.addEventListener('message', event => this.receiveData(event.data));
		this.audioWorkletNode.port.start();
		this.audioWorkletNode.connect(this.audioGain);
		this.audioWorkletNode.connect(analyserGain);

		// Recorder for recording audio files
		const mediaDest = this.audioCtx.createMediaStreamDestination();
		this.audioRecorder = new MediaRecorder(mediaDest.stream);
		this.audioRecorder.addEventListener('dataavailable',
			event => this.audioRecordChunks.push(event.data));
		this.audioRecorder.addEventListener('stop', () => {
			let fileName, type;
			const types = ['audio/webm', 'audio/ogg'];
			const files = ['track.webm', 'track.ogg'];
			while((fileName = files.pop()) && !MediaRecorder.isTypeSupported(type = types.pop())) {
				if(types.length === 0) {
					console.error('Recording is not supported in this browser!');
					break;
				}
			}
			const url = URL.createObjectURL(new Blob(this.audioRecordChunks, { type }));
			ui.downloader.href = url;
			ui.downloader.download = fileName;
			ui.downloader.click();
			setTimeout(() => window.URL.revokeObjectURL(url));
		});
		this.audioGain.connect(mediaDest);
	}

	// Get the code with parameters and apply to player controls, scope and audio worker
	loadCode({ code, sampleRate, mode, drawMode, scale }, isPlay = true) {
		// Get the playback mode
		this.mode = ui.controlPlaybackMode.value = mode = mode || 'Bytebeat';

		// Set the code in the editor
		editor.setValue(code);

		// Apply the sample rate and divisor
		this.setSampleRate(ui.controlSampleRate.value = +sampleRate || 8000, false);
		this.setSRDivisor(0);

		// Set data for the worker
		const data = {
			mode,
			sampleRate: this.sampleRate,
			sampleRatio: this.sampleRate / this.audioCtx.sampleRate
		};

		if(isPlay) {
			// If the song has loaded with autoplay then start playing
			data.playbackSpeed = this.playbackSpeed = 1;
			this.playbackToggle(true, false);
			data.resetTime = true;
		} else {
			// If the song has loaded without autoplay (on the page load),
			//   instruct the worker to begin warming up the cache in the background
			if(!this.precacheInterval) {
				this.precacheInterval = setInterval(() => {
					// Send a trigger to the worker only if the player is actually paused
					if(!this.isPlaying) {
						console.log('loadCode > sendData', { runPrecache: true });
						this.sendData({ runPrecache: true });
					} else {
						clearInterval(this.precacheInterval);
						this.precacheInterval = true;
					}
				}, 10);
			}
		}
		data.isPlaying = isPlay;
		data.setFunction = code;

		// Set the draw mode and scale for the visualizer scope, if they are specified in the song data
		if(drawMode) {
			ui.controlDrawMode.value = scope.drawMode = drawMode;
			scope.toggleTimeCursor();
			scope.clearCanvas();
			this.saveSettings();
		}
		if(scale !== undefined) {
			this.setScale(scale - scope.drawScale);
		}

		// Update the worker with the new code and parameters
		console.log('loadCode > sendData', data);
		this.sendData(data);
	}

	// Apply the time from the timer counter input
	oninputCounter(event) {
		if(event.key === 'Enter') {
			ui.controlTime.blur();
			this.playbackToggle(true);
			return;
		}
		const byteSample = this.settings.isSeconds ? Math.round(ui.controlTime.value * this.sampleRate) :
			ui.controlTime.value;
		this.setByteSample(byteSample);
		console.log('oninputCounter > sendData', { byteSample });
		this.sendData({ byteSample });
	}

	// Load the code from the location hash
	parseUrl() {
		let urlHash = window.location.hash;
		if(!urlHash) {
			this.updateUrl();
			urlHash = window.location.hash;
		}
		this.loadCode(getCodeFromUrl(urlHash) || { code: editor.value }, false);
	}

	// Stop the playback and reset the time
	playbackStop() {
		this.playbackToggle(false, false);
		console.log('playbackStop > sendData', { isPlaying: false, resetTime: true });
		this.sendData({ isPlaying: false, resetTime: true });
	}

	// Play/pause the playback
	playbackToggle(isPlaying, isSendData = true, speedIncrement = 0) {
		const isReverse = speedIncrement ? speedIncrement < 0 : this.playbackSpeed < 0;
		const buttonElem = isReverse ? ui.controlPlayBackward : ui.controlPlayForward;
		if(speedIncrement && buttonElem.getAttribute('disabled')) {
			return;
		}
		const multiplierElem = buttonElem.firstElementChild;
		const speed = speedIncrement ? +multiplierElem.textContent : 1;
		multiplierElem.classList.toggle('control-fast-multiplier-large', speed >= 8);
		const nextSpeed = speed === 64 ? 0 : speed * 2;
		ui.setPlayButton(ui.controlPlayBackward, isPlaying && isReverse ? nextSpeed : 1);
		ui.setPlayButton(ui.controlPlayForward, isPlaying && !isReverse ? nextSpeed : 1);
		if(speedIncrement || !isPlaying) {
			this.playbackSpeed = isPlaying ? speedIncrement * speed : Math.sign(this.playbackSpeed);
		}
		scope.canvasContainer.title = isPlaying ? `Click to ${
			this.isRecording ? 'pause and stop recording' : 'pause' }` :
			`Click to play${ isReverse ? ' in reverse' : '' }`;
		scope.canvasPlayButton.classList.toggle('canvas-play-backward', isReverse);
		scope.canvasPlayButton.classList.toggle('canvas-play', !isPlaying);
		scope.canvasPlayButton.classList.toggle('canvas-pause', isPlaying);
		if(isPlaying) {
			scope.canvasPlayButton.classList.remove('canvas-initial');
			if(this.audioCtx.state === 'suspended') {
				this.audioCtx.resume();
			}
			scope.requestAnimationFrame(); // Main call for drawing in the scope
		} else {
			this.lastUpdateTime = 0;
			this.updateCounter = 0;
			this.isLagging = false;
			ui.controlLag.innerText = '---';
			ui.controlLag.classList.remove('control-lag-red');
			if(this.isRecording) {
				this.isRecording = false;
				ui.controlRecord.classList.remove('control-recording');
				ui.controlRecord.title = 'Record to file';
				this.audioRecorder.stop();
			}
		}
		this.isPlaying = isPlaying;
		if(isSendData) {
			console.log('playbackToggle > sendData', { isPlaying, playbackSpeed: this.playbackSpeed });
			this.sendData({ isPlaying, playbackSpeed: this.playbackSpeed });
		} else {
			// Set a flag to clear the ring buffer, the scope canvas and time cursor in the UI
			this.isNeedClear = true;
		}
	}

	// Communicating with the audio worker
	receiveData(data) {
		const { byteSample, drawBuffer, error } = data;

		// If the current time has changed
		if(typeof byteSample === 'number') {
			this.setCounterValue(byteSample);
			this.setByteSample(byteSample);
		}

		// If sample data for the buffer has arrived
		// Iterate through the incoming points and add them directly to the graphics ring buffer
		if(drawBuffer && drawBuffer instanceof Float32Array) {
			const len = drawBuffer.length;
			// Step with a stride of 3, extracting (t, valL, valR)
			for(let i = 0; i < len; i += 3) {
				scope.pushToRingBuffer(drawBuffer[i], drawBuffer[i + 1], drawBuffer[i + 2]);
			}
		}

		// Output the accumulated number of cache seconds before the cursor
		if(typeof data.cacheSeconds === 'number') {
			ui.setCacheCounter(data.cacheSeconds);
		}

		// If an error has arrived, display it in the error console
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
				editor.errorElem.innerText = error.message;
				console.log('receiveData > sendData', { errorDisplayed: true });
				this.sendData({ errorDisplayed: true });
			}
			if(data.updateUrl !== true) {
				ui.setCodeSize(editor.value);
			}
		}

		// Update the URL if the worker has requested it
		if(data.updateUrl === true) {
			this.updateUrl();
		}
	}

	// Reset the zoom (or FFT resolution) of the visualizator scope
	resetScopeAdjustment() {
		if(scope.drawMode === 'FFT') {
			this.setFFTBins(-scope.fftSize + 10);
		} else {
			this.setScale(-scope.drawScale);
		}
	}

	// Reset the time, clear the scope, ring buffer and cache counter
	resetTime() {
		// Set a flag to clear ring buffer, the scope canvas and time cursor in the UI
		this.isNeedClear = true;

		// Send command to the worker to reset the time
		console.log('resetTime > sendData', { resetTime: true, playbackSpeed: this.playbackSpeed });
		this.sendData({ resetTime: true, playbackSpeed: this.playbackSpeed });
	}

	// Saving the settings in the localStorage
	saveSettings() {
		this.settings.drawMode = scope.drawMode;
		this.settings.drawScale = scope.drawScale;
		this.settings.fftSize = scope.fftSize;
		this.settings.libraryFilters = library.filters;
		this.settings.showAllSongs = library.showAllSongs;
		localStorage.settings = JSON.stringify(this.settings);
	}

	// Messaging with the audio worker
	sendData(data) {
		this.audioWorkletNode.port.postMessage(data);
	}

	// Set the current time (and clear the scope, time cursor and buffer if needed)
	setByteSample(value) {
		this.byteSample = +value || 0;

		// If the time has been reset to 0, then clear the ring buffer, scope canvas and time cursor in the UI
		if(this.isNeedClear && value === 0) {
			this.isNeedClear = false;
			scope.initRingBuffer();
			scope.clearCanvas();
			scope.canvasTimeCursor.style.left = 0;
			if(!this.isPlaying) {
				// Set the initial state of the play button in the scope
				scope.canvasPlayButton.classList.add('canvas-initial');
			}
		}
	}

	// Apply the syntax highlighting style
	setCodeStyle(value) {
		if(value !== undefined) {
			this.settings.codeStyle = value;
			this.saveSettings();
		} else if((value = this.settings.codeStyle) === undefined) {
			value = this.settings.codeStyle = this.defaultSettings.codeStyle;
			this.saveSettings();
		}
		document.documentElement.dataset.syntax = value;
		document.documentElement.dataset.syntaxType = value.endsWith('Light') ? 'light' : 'dark';
	}

	// Apply color for the Diagram mode in the scope
	setColorDiagram(value) {
		if(value !== undefined) {
			this.settings.colorDiagram = value;
			this.saveSettings();
		} else if((value = this.settings.colorDiagram) === undefined) {
			value = this.settings.colorDiagram = this.defaultSettings.colorDiagram;
			this.saveSettings();
		}
		ui.controlColorDiagram.value = value;
		ui.controlColorDiagramInfo.innerHTML = scope.getColorTest('colorDiagram', value);
	}

	// Apply colors for the left and right waveforms in the scope
	setColorStereo(value) {
		// value: Red=0, Green=1, Blue=2
		if(value !== undefined) {
			this.settings.colorStereo = value;
			this.saveSettings();
		} else if((value = this.settings.colorStereo) === undefined) {
			value = this.settings.colorStereo = this.defaultSettings.colorStereo;
			this.saveSettings();
		}
		ui.controlColorStereo.value = value;
		switch(value) {
		// [Left, Right1, Right2]
		case 0: scope.colorChannels = [0, 1, 2]; break;
		case 2: scope.colorChannels = [2, 0, 1]; break;
		default: scope.colorChannels = [1, 0, 2];
		}
		if(scope.colorWaveform) {
			scope.setStereoColors();
		}
	}

	// Apply color for the time cursor in the scope
	setColorTimeCursor(value) {
		if(value !== undefined) {
			this.settings.colorTimeCursor = value;
			this.saveSettings();
		} else if((value = this.settings.colorTimeCursor) === undefined) {
			value = this.settings.colorTimeCursor = this.defaultSettings.colorTimeCursor;
			this.saveSettings();
		}
		ui.controlColorTimeCursor.value = value;
		scope.canvasTimeCursor.style.borderLeft = '2px solid ' + value;
	}

	// Apply color for the waveform and points in the scope
	setColorWaveform(value) {
		if(value !== undefined) {
			this.settings.colorWaveform = value;
			this.saveSettings();
		} else if((value = this.settings.colorWaveform) === undefined) {
			value = this.settings.colorWaveform = this.defaultSettings.colorWaveform;
			this.saveSettings();
		}
		ui.controlColorWaveform.value = value;
		ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform', value);
		scope.setStereoColors();
	}

	// Set t or seconds for the timer counter
	setCounterUnits() {
		ui.controlTimeUnits.textContent = this.settings.isSeconds ? 'sec' : 't';
		this.setCounterValue(this.byteSample);
	}

	// Set the value for the timer counter, and detect the calculation lag
	setCounterValue(value) {
		ui.controlTime.value = this.settings.isSeconds ? (value / this.sampleRate).toFixed(2) : value;
		// Lag detection
		this.updateCounter++;
		if(this.updateCounter === 400) {
			this.updateCounter = 0;
			const time = Date.now();
			if(this.lastUpdateTime) {
				const lag =
					Math.min(Math.max(Math.round((time - this.lastUpdateTime) * 37.5 / 400) - 100, 0), 999);
				ui.controlLag.innerText = lag + '%';
				if(lag > 3) {
					if(!this.isLagging) {
						this.isLagging = true;
						ui.controlLag.classList.add('control-lag-red');
					}
				} else if(this.isLagging) {
					this.isLagging = false;
					ui.controlLag.classList.remove('control-lag-red');
				}
			}
			this.lastUpdateTime = time;
		}
	}

	// Apply a drawing mode for the visualizer scope
	setDrawMode(drawMode) {
		scope.drawMode = drawMode;
		this.setScopeAdjustment(0);
		scope.toggleTimeCursor();
		scope.clearCanvas();
		this.saveSettings();
		console.log('setDrawMode > sendData', { drawMode });
		this.sendData({ drawMode });
	}

	// Apply the FFT resolution for the FFT mode in the visualizer scope
	setFFTBins(amount, buttonElem) {
		if(buttonElem?.getAttribute('disabled')) {
			return;
		}
		scope.setFFTSize(scope.fftSize + amount);
		scope.setFFTAnalyzer();
		scope.clearCanvas();
		this.saveSettings();
		ui.setControlScale(scope.fftSize >= 15, scope.fftSize <= 5,
			scope.fftSize < 10 ? 2 ** scope.fftSize : `<sub>2</sub>${ scope.fftSize }`);
	}

	// Apply the mode: Bytebeat, Floatbeat, etc
	setPlaybackMode(mode) {
		this.mode = mode;
		this.updateUrl();
		console.log('setPlaybackMode > sendData', { mode, setFunction: editor.value });
		this.sendData({ mode, setFunction: editor.value });
	}

	// Apply the sample rate
	setSampleRate(sampleRate, isSendData = true) {
		if(!sampleRate || !isFinite(sampleRate) ||
			// Float32 limit
			(sampleRate = Number(parseFloat(Math.abs(sampleRate)).toFixed(3))) > 3.4028234663852886E+38
		) {
			sampleRate = 8000;
		}
		sampleRate = Math.max(0.1, sampleRate);
		switch(sampleRate) {
		case 8000:
		case 11025:
		case 16000:
		case 22050:
		case 32000:
		case 44100:
		case 48000: ui.controlSampleRateSelect.value = sampleRate; break;
		default: ui.controlSampleRateSelect.selectedIndex = -1;
		}
		const oldSampleRate = this.sampleRate;
		ui.controlSampleRate.value = this.sampleRate = sampleRate;
		ui.controlSampleRate.blur();
		ui.controlSampleRateSelect.blur();
		scope.toggleTimeCursor();
		if(isSendData) {
			const data = {
				sampleRate: this.sampleRate,
				sampleRatio: this.sampleRate / this.audioCtx.sampleRate
			};
			if(this.mode === 'Funcbeat') {
				data.byteSample = Math.round(ui.controlTime.value * sampleRate /
					(this.settings.isSeconds ? 1 : oldSampleRate));
				this.setCounterValue(data.byteSample);
				this.setByteSample(data.byteSample);
			}
			this.updateUrl();
			console.log('setSampleRate > sendData', data);
			this.sendData(data);
		}
	}

	// Apply the zoom factor for the visualizer scope
	setScale(amount, buttonElem) {
		if(buttonElem?.getAttribute('disabled')) {
			return;
		}
		scope.drawScale = Math.min(Math.max(scope.drawScale + amount, 0), 20);
		scope.toggleTimeCursor();
		scope.clearCanvas();
		this.saveSettings();
		ui.setControlScale(scope.drawScale <= 0, scope.drawScale >= 20,
			!scope.drawScale ? '1x' :
			scope.drawScale < 7 ? `1/${ 2 ** scope.drawScale }${ scope.drawScale < 4 ? 'x' : '' }` :
			`<sub>2</sub>-${ scope.drawScale }`);
	}

	// Apply the zoom factor or FFT resolution in the visualizer scope
	setScopeAdjustment(amount, buttonElem) {
		if(scope.drawMode === 'FFT') {
			ui.controlScaleDown.title = 'Use more FFT bins';
			ui.controlScaleUp.title = 'Use less FFT bins';
			ui.controlScale.title = 'FFT bins. Click to reset to 1024';
			this.setFFTBins(-amount, buttonElem);
		} else {
			ui.controlScaleDown.title = 'Zoom in the scope';
			ui.controlScaleUp.title = 'Zoom out the scope';
			ui.controlScale.title = 'Scope zoom factor. Click to reset to 1.';
			this.setScale(amount, buttonElem);
		}
	}

	// Apply the sample rate divisor value
	setSRDivisor(increment) {
		const value = (this.settings.srDivisor || 1) + increment;
		if(value === 0) {
			return;
		}
		ui.controlSRDivisor.textContent = this.settings.srDivisor = value;
		this.saveSettings();
		console.log('setSRDivisor > sendData', { srDivisor: value });
		this.sendData({ srDivisor: value });
	}

	// Apply site style
	setThemeStyle(value) {
		if(value === undefined) {
			if((value = this.settings.themeStyle) === undefined) {
				value = this.settings.themeStyle = this.defaultSettings.themeStyle;
				this.saveSettings();
			}
			document.documentElement.dataset.theme = value;
			document.documentElement.dataset.themeType = value.endsWith('Light') ? 'light' : 'dark';
			return;
		}
		document.documentElement.dataset.theme = this.settings.themeStyle = value;
		document.documentElement.dataset.themeType = value.endsWith('Light') ? 'light' : 'dark';
		let colorCursor = '#80c0ff';
		let colorDiagram = '#0080ff';
		let colorStereo = 1; // Red=0, Green=1, Blue=2
		let { codeStyle } = this.defaultSettings;
		switch(value) {
		case 'Blue Dark': codeStyle = 'Github Dark'; break;
		case 'Cake Dark':
			colorCursor = '#40ffff';
			colorDiagram = '#c000c0';
			colorStereo = 0;
			codeStyle = 'Monokai';
			break;
		case 'Dusk Dark': codeStyle = 'One Dark'; break;
		case 'Green Dark':
			colorCursor = '#00ffa8';
			colorDiagram = '#00a080';
			codeStyle = 'Retro Green';
			break;
		case 'Orange Dark':
			colorCursor = '#ffff80';
			colorDiagram = '#8000ff';
			colorStereo = 0;
			codeStyle = 'Github v2 Dark';
			break;
		case 'Purple Dark':
			colorCursor = '#ff50ff';
			colorDiagram = '#a040ff';
			colorStereo = 0;
			codeStyle = 'Atom Dark';
			break;
		case 'Teal Dark':
			colorCursor = '#80c0ff';
			colorDiagram = '#00a0c0';
			codeStyle = 'VSCode Dark';
			break;
		case 'Default Light': codeStyle = 'Atom Light'; break;
		case 'Blue Light': codeStyle = 'Github Light'; break;
		case 'Green Light': codeStyle = 'VSCode Light'; break;
		}
		this.setColorTimeCursor(colorCursor);
		this.setColorStereo(colorStereo);
		ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform');
		this.setColorDiagram(ui.controlColorDiagram.value = colorDiagram); // Contains this.saveSettings();
		this.setCodeStyle(codeStyle);
		ui.controlCodeStyle.value = codeStyle;
	}

	// Apply the volume value
	setVolume(isInit) {
		let volumeValue = NaN;
		if(isInit) {
			volumeValue = parseFloat(this.settings.volume);
		}
		if(isNaN(volumeValue)) {
			volumeValue = ui.controlVolume.value / ui.controlVolume.max;
		}
		ui.controlVolume.value = this.settings.volume = volumeValue;
		ui.controlVolume.title = `Volume: ${ (volumeValue * 100).toFixed(2) }%`;
		this.saveSettings();
		this.audioGain.gain.value = volumeValue * volumeValue;
	}

	// Toggle between t and seconds for the timer counter
	toggleCounterUnits() {
		this.settings.isSeconds = !this.settings.isSeconds;
		this.saveSettings();
		this.setCounterUnits();
	}

	// Toggle recording for the playback
	toggleRecording() {
		if(!this.audioCtx) {
			return;
		}
		if(this.isRecording) {
			this.playbackToggle(false);
			return;
		}
		this.isRecording = true;
		ui.controlRecord.classList.add('control-recording');
		ui.controlRecord.title = 'Pause and stop recording';
		this.audioRecorder.start();
		this.audioRecordChunks = [];
		this.playbackToggle(true);
	}

	// Get URL and size from the code
	updateUrl() {
		const code = editor.value;
		ui.setCodeSize(code);
		getUrlFromCode(code, this.mode, this.sampleRate);
	}
}();
