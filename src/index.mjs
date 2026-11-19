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
			autoplay: true,
			caching: true,
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
		this.mode = 'Bytebeat';
		this.playbackSpeed = 1;
		this.sampleRate = 8000;

		// Visualizator scope
		this.isNeedClear = false; // Flag to clear the ring buffer, the scope canvas and time cursor in the UI

		// Lag detection
		this.isLagging = false;
		this.lastUpdateByteSample = undefined; // The last byte sample received from the worker
		this.lastUpdateTime = 0; // The last time the byte sample was updated
		this.updateCounter = 0;

		// Audio nodes
		this.audioCtx = null;
		this.audioGain = null;
		this.audioWorkletNode = null;

		// A timer that sends signals to warm up the cache after a page has loaded, covering the period
		//   before any user interaction and while the worker process() is not yet available
		this.precacheInterval = null;

		// Start the initialization
		this.init();
	}

	// Detect the calculation lag, taking a measurement once every 60 incoming byteSample batches
	detectLag(byteSample) {
		this.updateCounter++;
		if(this.updateCounter < 60) {
			return;
		}
		this.updateCounter = 0;
		const currentTimeMs = Date.now();
		if(this.lastUpdateTime && this.lastUpdateByteSample !== undefined) {
			// How much physical time has elapsed according to the computer's clock (in ms)
			const realTimePassedMs = currentTimeMs - this.lastUpdateTime;

			// How many `t` units (byteSamples) the track should have played during this time
			//   based on its own custom sample rate
			const idealSamplesPassed = realTimePassedMs * (this.sampleRate / 1000);

			// How many samples the song has actually processed along the timeline
			const realSamplesPassed = Math.abs(byteSample - this.lastUpdateByteSample);

			// Calculate the lag percentage
			let lag = 0;
			if(realSamplesPassed < idealSamplesPassed && idealSamplesPassed > 0) {
				// Lag percentage = (how many samples weren't processed / how many should have been) * 100
				lag = Math.min(999,
					Math.round(((idealSamplesPassed - realSamplesPassed) / idealSamplesPassed) * 100));
			}
			ui.controlLag.innerText = lag + '%';

			// Switching the red color indicator
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

		// Remember the current markers for the next measurement
		this.lastUpdateTime = currentTimeMs;
		this.lastUpdateByteSample = byteSample;
	}

	// Update the timer counter display based on the current value and units
	getTime(value) {
		return this.settings.isSeconds ? (value / this.sampleRate).toFixed(2) : value;
	}

	// Main events handler on the page
	handleEvent(event) {
		let elem = event.target;
		const { classList } = elem;
		switch(event.type) {

		// Handle change events
		case 'change':
			switch(elem.id) {
			case 'control-code-style':
				this.setCodeStyle(elem.value);
				this.saveSettings();
				break;
			case 'control-color-diagram':
				this.setColorDiagram(elem.value);
				this.saveSettings();
				break;
			case 'control-color-stereo':
				this.setColorStereo(+elem.value);
				ui.controlColorDiagramInfo.innerHTML = scope.getColorTest('colorDiagram');
				ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform');
				this.saveSettings();
				break;
			case 'control-color-timecursor':
				this.setColorTimeCursor(elem.value);
				this.saveSettings();
				break;
			case 'control-color-waveform':
				this.setColorWaveform(elem.value);
				this.saveSettings();
				break;
			case 'control-drawmode':
				this.setDrawMode(elem.value);
				this.saveSettings();
				break;
			case 'control-mode':
				this.setBytebeatMode(elem.value);
				break;
			case 'control-samplerate':
			case 'control-samplerate-select':
				this.setSampleRate(+elem.value);
				break;
			case 'control-theme-style':
				this.setThemeStyle(elem.value, false);
				this.saveSettings();
				break;
			case 'library-expand-checkbox':
				library.showAllSongs = elem.checked;
				ui.toggleExpandSongs(library.showAllSongs);
				this.saveSettings();
				break;
			}
			return;

		// Handle click events
		case 'click':
			// Clicks on elements with specific tags
			switch(elem.tagName) {
			case 'svg':
				elem = elem.parentNode;
				break;
			case 'use':
				elem = elem.parentNode.parentNode;
				break;
			default:
				if(classList.contains('control-fast-multiplier')) {
					elem = elem.parentNode;
				}
				/* Fall through */
			}

			// Click on elements with specific ids
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
			case 'canvas-timecursor':
				this.playbackToggle(!this.isPlaying);
				break;
			case 'control-autoplay':
				this.toggleAutoplay(!this.settings.autoplay);
				this.saveSettings();
				break;
			case 'control-cache-toggle':
				this.toggleCaching(!this.settings.caching);
				this.saveSettings();
				break;
			case 'control-counter':
			case 'control-pause':
				this.playbackToggle(false);
				break;
			case 'control-counter-units':
				this.settings.isSeconds = !this.settings.isSeconds;
				this.setCounterUnits();
				this.saveSettings();
				break;
			case 'control-expand':
				ui.expandEditor();
				break;
			case 'control-export':
				this.openExportModal();
				break;
			case 'control-link':
				ui.copyLink();
				break;
			case 'control-play-backward':
				this.playbackToggle(true, true, -1);
				break;
			case 'control-play-forward':
				this.playbackToggle(true, true, 1);
				break;
			case 'control-reset':
				this.resetTime();
				break;
			case 'control-scale':
				this.resetScopeAdjustment();
				this.saveSettings();
				break;
			case 'control-scaledown':
				this.setScopeAdjustment(-1, elem);
				this.saveSettings();
				break;
			case 'control-scaleup':
				this.setScopeAdjustment(1);
				this.saveSettings();
				break;
			case 'control-srdivisor-down':
				this.setSRDivisor(-1);
				this.saveSettings();
				break;
			case 'control-srdivisor-up':
				this.setSRDivisor(1);
				this.saveSettings();
				break;
			case 'control-stop':
				this.playbackStop();
				break;
			case 'modal-cancel':
			case 'modal-close':
				ui.exportWavModal.close();
				break;
			case 'export-wav-time-current':
				ui.exportWavStart.value = this.getTime(this.byteSample);
				break;
			case 'export-wav-time-start':
				ui.exportWavStart.value = this.getTime(0);
				break;
			case 'library-show-songs':
				library.showSongs();
				break;

			// Click on elements with specific classes
			default:
				switch(true) {
				case classList.contains('article-button'):
					ui.onclickArticleNavButton(elem);
					break;
				case classList.contains('code-load'):
					library.onclickCodeLoadButton(elem);
					this.saveSettings();
					break;
				case classList.contains('code-remix-load'):
					library.onclickRemixLoadButton(elem);
					break;
				case classList.contains('code-size'):
					library.onclickCodeLoadButton(elem.parentNode);
					this.saveSettings();
					break;
				case classList.contains('code-text'):
					this.onclickCodeText(elem);
					break;
				case classList.contains('export-preset'):
					// Set the WAV export duration based on the selected preset
					ui.exportWavDuration.value = elem.dataset.dur;
					break;
				case classList.contains('filter-button'):
					// Apply the selected library filter and load the songs library
					ui.onclickFilterButton(elem);
					this.updateLibraryFilters();
					this.saveSettings();
					library.showSongs();
					break;
				case classList.contains('song-hash'):
					// Copy the song hash to the clipboard
					navigator.clipboard.writeText(elem.dataset.hash);
					event.preventDefault();
					break;
				}
			}
			return;

		// Handle input events on elements with specific ids
		case 'input':
			switch(elem.id) {
			case 'control-volume':
				// Update the volume based on the current input value
				this.setVolume();
				this.saveSettings();
				break;
			case 'library-search-input':
				// Apply the search filter and load the songs library
				this.updateLibraryFilters();
				this.saveSettings();
				library.showSongs();
				break;
			}
			return;

		// Apply the time from the timer counter input when Enter is pressed
		case 'keydown':
			if(elem.id === 'control-counter' && event.key === 'Enter') {
				this.oninputTimeCounter();
			}
			return;

		// Update element titles on mouseover
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

		// Handle scrolling within the scrollable container
		case 'scroll':
			ui.onscrollContainer();
			return;

		// Handle the export to WAV form submission
		case 'submit':
			event.preventDefault();
			this.onsubmitExportToWav();
			return;
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
		this.setThemeStyle(this.settings.themeStyle, true);
		await this.initAudio();
		if(document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.initAfterDom());
			return;
		}
		this.initAfterDom();
	}

	// Running after the DOM content was loaded
	initAfterDom() {
		editor.init(); // Initialize the code editor and CodeMirror
		ui.initElements(); // Initialize UI elements and controls
		scope.initElements(); // Initialize canvas elements and window resize handling

		// Apply initial settings to the UI and scope
		this.setVolume(parseFloat(this.settings.volume));
		this.setCounterUnits();
		this.setCodeStyle(this.settings.codeStyle);
		this.setColorStereo(this.settings.colorStereo);
		this.setColorDiagram(this.settings.colorDiagram);
		this.setColorWaveform(this.settings.colorWaveform);
		this.setColorTimeCursor(this.settings.colorTimeCursor);
		this.setScopeAdjustment(0);
		this.toggleCaching(this.settings.caching);
		this.toggleAutoplay(this.settings.autoplay);

		// Load the code from the location hash
		let urlHash = window.location.hash;
		if(!urlHash) {
			this.updateUrl();
			urlHash = window.location.hash;
		}
		const songData = getCodeFromUrl(urlHash) || { code: editor.value };
		songData.drawMode = scope.drawMode;
		this.loadCode(songData, false);
		this.saveSettings();

		// Apply library filters and update UI controls
		ui.setLibraryFilters(library.filters);
		ui.controlDrawMode.value = scope.drawMode;
		ui.controlThemeStyle.value = this.settings.themeStyle;
		ui.controlCodeStyle.value = this.settings.codeStyle;

		// Add event listeners for UI elements
		ui.mainElem.addEventListener('click', this);
		ui.mainElem.addEventListener('change', this);
		ui.containerFixed.addEventListener('input', this);
		ui.containerFixed.addEventListener('keydown', this);
		ui.containerScroll.addEventListener('input', this);
		ui.containerScroll.addEventListener('mouseover', this);
		ui.containerScroll.addEventListener('scroll', this);
		ui.exportWavModal.addEventListener('click', this);
		ui.exportWavModal.addEventListener('submit', this);
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
	}

	// Get the code with parameters and apply to player controls, scope and audio worker
	loadCode({ code, sampleRate, mode, drawMode, scale }, isAudioInited = true) {
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
			sampleRatio: this.sampleRate / this.audioCtx.sampleRate,
			enableCaching: this.settings.caching
		};

		if(isAudioInited) {
			// The song has loaded from the library
			data.playbackSpeed = this.playbackSpeed = 1;
			this.playbackToggle(this.settings.autoplay, false);
			data.resetTime = true;
		} else {
			// The song has loaded from the url on the page load,
			//   instruct the worker to begin warming up the cache in the background
			if(!this.precacheInterval) {
				this.precacheInterval = setInterval(() => {
					// Send a trigger to the worker only if the player is actually paused
					if(!this.isPlaying) {
						this.sendData({ runPrecache: true });
					} else {
						clearInterval(this.precacheInterval);
						this.precacheInterval = true;
					}
				}, 10);
			}
		}
		// Set the playing state if the audio is initialized and autoplay is enabled
		data.isPlaying = isAudioInited && this.settings.autoplay;
		// Set the code for the worker to execute
		data.setFunction = code;
		// Allow cache calculations while paused
		if(this.settings.caching) {
			// Notify the worker that the main thread is free and ready to process the first batch
			data.readyForNextBatch = true;
		}
		// Set the draw mode and scale for the visualizer scope, if they are specified in the song data
		if(drawMode) {
			ui.controlDrawMode.value = scope.drawMode = drawMode;
			scope.toggleTimeCursor();
			scope.clearCanvas();
		}
		if(scale !== undefined) {
			this.setScale(scale - scope.drawScale);
		}

		// Update the worker with the new code and parameters
		this.sendData(data);
	}

	// Opening a modal window with the current units of measurement inserted
	openExportModal() {
		ui.exportWavStart.value = this.getTime(this.byteSample);
		ui.exportWavStartUnits.textContent = this.settings.isSeconds ? 'sec' : 't';
		ui.exportWavModal.showModal();
	}

	// Handle click event on code text elements within the song entry
	onclickCodeText(elem) {
		// If in the description block then load code from text
		if(elem.parentNode.classList.contains('code-description')) {
			this.loadCode(Object.assign({ code: elem.innerText },
				elem.hasAttribute('data-songdata') ? JSON.parse(elem.dataset.songdata) : {}));
			this.saveSettings();
			return;
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
				this.saveSettings();
			}
		}
	}

	// Apply the time from the timer counter input
	oninputTimeCounter() {
		const byteSample = this.settings.isSeconds ?
			Math.round(ui.controlTime.value * this.sampleRate) : ui.controlTime.value;
		this.setByteSample(byteSample);
		this.sendData({ byteSample });
		ui.controlTime.blur();
		this.playbackToggle(true);
	}

	// Handle the export to WAV form submission
	onsubmitExportToWav() {
		const rawStart = parseFloat(ui.exportWavStart.value) || 0;
		const durationSeconds = parseFloat(ui.exportWavDuration.value) || 60;
		const startSample = Math.round(this.settings.isSeconds ? rawStart * this.sampleRate : rawStart);
		ui.exportWavModal.close();
		if(!this.audioWorkletNode) {
			return;
		}
		this.sendData({ exportWav: { durationSeconds, startSample } });
	}

	// Stop the playback and reset the time
	playbackStop() {
		this.playbackToggle(false, false);
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
		scope.canvasContainer.title = isPlaying ? 'Click to pause' :
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
			this.lastUpdateByteSample = undefined;
			this.lastUpdateTime = 0;
			this.updateCounter = 0;
			this.isLagging = false;
			ui.controlLag.innerText = '---';
			ui.controlLag.classList.remove('control-lag-red');
		}
		this.isPlaying = isPlaying;
		if(isSendData) {
			this.sendData({ isPlaying, playbackSpeed: this.playbackSpeed, readyForNextBatch: true });
		} else {
			// Set a flag to clear the ring buffer, the scope canvas and time cursor in the UI
			this.isNeedClear = true;
		}
	}

	// Communicating with the audio worker
	receiveData(data) {
		const { byteSample, drawBuffer, error } = data;

		// If the current time has changed, detect lag and update the timer counter
		if(typeof byteSample === 'number') {
			this.detectLag(byteSample);
			ui.controlTime.value = this.getTime(byteSample);
			this.setByteSample(byteSample);
		}

		// If sample data for the buffer has arrived
		// Iterate through the incoming points and add them directly to the graphics ring buffer
		if(drawBuffer && drawBuffer instanceof Float64Array) {
			const len = drawBuffer.length;
			// Step with a stride of 3, extracting (t, valL, valR)
			for(let i = 0; i < len; i += 3) {
				scope.pushToRingBuffer(drawBuffer[i], drawBuffer[i + 1], drawBuffer[i + 2]);
			}
		}

		// Output the accumulated number of cache seconds before the cursor
		if(this.settings.caching &&typeof data.cacheSeconds === 'number') {
			ui.setCacheCounter(data.cacheSeconds, this.sampleRate);
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

		// Acknowledgment signal for backpressure (for cache calculations while paused)
		// If currently paused and a data batch arrives (containing graphics or timing information),
		//   notify the worker that the main thread is free and ready to process the next batch
		if(this.settings.caching && !this.isPlaying) {
			this.sendData({ readyForNextBatch: true });
		}

		// If a ready WAV file has arrived from the worker
		if(data.exportWavBuffer) {
			const blob = new Blob([data.exportWavBuffer], { type: 'audio/wav' });
			const url = URL.createObjectURL(blob);

			// Use the existing downloader element
			ui.downloader.href = url;
			ui.downloader.download = `bytebeat_${ data.exportSampleRate }Hz.wav`;
			ui.downloader.click();

			setTimeout(() => window.URL.revokeObjectURL(url), 1000);

			if(ui.controlCacheCounter) {
				ui.controlCacheCounter.innerText = 'WAV Ready!';
			}
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

	// Apply the mode: Bytebeat, Floatbeat, etc
	setBytebeatMode(mode) {
		this.mode = mode;
		this.updateUrl();
		this.sendData({ mode, setFunction: editor.value });
	}

	// Set the current time (and clear the scope, time cursor and buffer if needed)
	setByteSample(value) {
		this.byteSample = +value || 0;

		// If the time has been reset to 0, then clear the ring buffer, scope canvas and time cursor in the UI
		if(this.isNeedClear && value === 0) {
			this.isNeedClear = false;
			this.lastUpdateByteSample = undefined;

			// Reset and clear the canvas
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
		if(value === undefined) {
			value = this.defaultSettings.codeStyle;
		}
		this.settings.codeStyle = value;
		document.documentElement.dataset.syntax = value;
		document.documentElement.dataset.syntaxType = value.endsWith('Light') ? 'light' : 'dark';
	}

	// Apply color for the Diagram mode in the scope
	setColorDiagram(value) {
		if(value === undefined) {
			value = this.defaultSettings.colorDiagram;
		}
		this.settings.colorDiagram = value;
		ui.controlColorDiagram.value = value;
		ui.controlColorDiagramInfo.innerHTML = scope.getColorTest('colorDiagram', value);
	}

	// Apply colors for the left and right waveforms in the scope
	setColorStereo(value) {
		// value: Red=0, Green=1, Blue=2
		if(value === undefined) {
			value = this.defaultSettings.colorStereo;
		}
		this.settings.colorStereo = value;
		ui.controlColorStereo.value = value;
		switch(value) {
		// [Left, Right1, Right2]
		case 0:
			scope.colorChannels = [0, 1, 2];
			break;
		case 2:
			scope.colorChannels = [2, 0, 1];
			break;
		default:
			scope.colorChannels = [1, 0, 2];
		}
		if(scope.colorWaveform) {
			scope.setStereoColors();
		}
	}

	// Apply color for the time cursor in the scope
	setColorTimeCursor(value) {
		if(value === undefined) {
			value = this.defaultSettings.colorTimeCursor;
		}
		this.settings.colorTimeCursor = value;
		ui.controlColorTimeCursor.value = value;
		scope.canvasTimeCursor.style.borderLeft = '2px solid ' + value;
	}

	// Apply color for the waveform and points in the scope
	setColorWaveform(value) {
		if(value === undefined) {
			value = this.defaultSettings.colorWaveform;
		}
		this.settings.colorWaveform = value;
		ui.controlColorWaveform.value = value;
		ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform', value);
		scope.setStereoColors();
	}

	// Set t or seconds for the timer counter
	setCounterUnits() {
		ui.controlTimeUnits.textContent = this.settings.isSeconds ? 'sec' : 't';
		ui.controlTime.value = this.getTime(this.byteSample);
	}

	// Apply a drawing mode for the visualizer scope
	setDrawMode(drawMode) {
		scope.drawMode = drawMode;
		this.setScopeAdjustment(0);
		scope.toggleTimeCursor();
		scope.clearCanvas();
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
		ui.setControlScale(scope.fftSize >= 15, scope.fftSize <= 5,
			scope.fftSize < 10 ? 2 ** scope.fftSize : `<sub>2</sub>${ scope.fftSize }`);
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
		case 48000:
			ui.controlSampleRateSelect.value = sampleRate;
			break;
		default: ui.controlSampleRateSelect.selectedIndex = -1;
		}
		const oldSampleRate = this.sampleRate;
		this.sampleRate = sampleRate;
		ui.controlSampleRate.value = sampleRate;
		ui.controlSampleRate.blur();
		ui.controlSampleRateSelect.blur();
		scope.toggleTimeCursor();
		if(isSendData) {
			const data = { sampleRate, sampleRatio: sampleRate / this.audioCtx.sampleRate };
			if(this.mode === 'Funcbeat') {
				data.byteSample = Math.round(ui.controlTime.value * sampleRate /
					(this.settings.isSeconds ? 1 : oldSampleRate));
				ui.controlTime.value = this.getTime(data.byteSample);
				this.setByteSample(data.byteSample);
			}
			this.updateUrl();
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
		this.settings.srDivisor = value;
		ui.controlSRDivisor.textContent = value;
		this.sendData({ srDivisor: value });
	}

	// Apply site style
	setThemeStyle(value, isInit) {
		if(value === undefined) {
			value = this.defaultSettings.themeStyle;
		}
		if(!isInit) {
			let colorCursor = '#80c0ff';
			let colorDiagram = '#0080ff';
			let colorStereo = 1; // Red=0, Green=1, Blue=2
			let { codeStyle } = this.defaultSettings;
			switch(value) {
			case 'Blue Dark':
				codeStyle = 'Github Dark';
				break;
			case 'Cake Dark':
				colorCursor = '#40ffff';
				colorDiagram = '#c000c0';
				colorStereo = 0;
				codeStyle = 'Monokai';
				break;
			case 'Dusk Dark':
				codeStyle = 'One Dark';
				break;
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
			case 'Default Light':
				codeStyle = 'Atom Light';
				break;
			case 'Blue Light':
				codeStyle = 'Github Light';
				break;
			case 'Green Light':
				codeStyle = 'VSCode Light';
				break;
			}
			this.setCodeStyle(codeStyle);
			ui.controlCodeStyle.value = codeStyle;
			this.setColorStereo(colorStereo);
			ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform');
			this.setColorDiagram(colorDiagram);
			this.setColorTimeCursor(colorCursor);
		}
		this.settings.themeStyle = value;
		document.documentElement.dataset.theme = value;
		document.documentElement.dataset.themeType = value.endsWith('Light') ? 'light' : 'dark';
	}

	// Apply the volume value
	setVolume(volumeValue = NaN) {
		if(isNaN(volumeValue)) {
			volumeValue = ui.controlVolume.value / ui.controlVolume.max;
		}
		this.settings.volume = volumeValue;
		ui.controlVolume.value = volumeValue;
		ui.controlVolume.title = `Volume: ${ (volumeValue * 100).toFixed(2) }%`;
		this.audioGain.gain.value = volumeValue * volumeValue;
	}

	// Toggle autoplay songs checkbox in settings
	toggleAutoplay(isEnable) {
		if(typeof isEnable !== 'boolean') {
			isEnable = this.defaultSettings.autoplay;
		}
		this.settings.autoplay = isEnable;
		ui.controlAutoplay.checked = isEnable;
	}

	// Toggle songs caching checkbox in settings
	toggleCaching(isEnable) {
		if(typeof isEnable !== 'boolean') {
			isEnable = this.defaultSettings.caching;
		}
		this.settings.caching = isEnable;
		ui.controlCacheToggle.innerText = isEnable ? '✔' : '✖';
		ui.controlCacheCounter.innerText = isEnable ? '0.0s' : '---';

		// Notify the worker about a change in the caching mode
		const data = { enableCaching: isEnable };
		// If caching has just been enabled while in a paused state, provide an initial warm-up process
		if(isEnable && !this.isPlaying) {
			data.readyForNextBatch = true;
		}
		this.sendData(data);
	}

	// Update the library filters based on the current selections
	updateLibraryFilters() {
		this.settings.libraryFilters = library.filters = ui.getLibraryFilters();
	}

	// Get URL and size from the code
	updateUrl() {
		const code = editor.value;
		ui.setCodeSize(code);
		getUrlFromCode(code, this.mode, this.sampleRate);
	}
}();
