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
		this.audioCtx = null;
		this.audioGain = null;
		this.audioRecordChunks = [];
		this.audioRecorder = null;
		this.audioWorkletNode = null;
		this.byteSample = 0;
		this.defaultSettings = {
			codeStyle: 'Atom Dark',
			colorDiagram: '#0080ff',
			colorStereo: 1,
			colorTimeCursor: '#80bbff',
			colorWaveform: '#ffffff',
			drawMode: scope.drawMode,
			drawScale: scope.drawScale,
			isSeconds: false,
			showAllSongs: library.showAllSongs,
			themeStyle: 'Default',
			volume: .5,
			donotChangeScopePreferences: false
		};
		this.isCompilationError = false;
		this.isNeedClear = false;
		this.isPlaying = false;
		this.isRecording = false;
		this.mode = 'Bytebeat';
		this.playbackSpeed = 1;
		this.sampleRate = 8000;
		this.settings = this.defaultSettings;
		this.audioFiles = new Map();
		this.init();
	}
	handleEvent(e) {
		let elem = e.target;
		switch(e.type) {
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
			case 'library-show-all':
				library.toggleAll(elem, elem.checked);
				this.saveSettings();
				break;
			case 'DONOTCHANGESCOPEPREFERENCES':
				this.settings.donotChangeScopePreferences = elem.checked;
				this.saveSettings();
				break;
			}
			return;
		case 'click':
			switch(elem.tagName) {
			case 'svg': elem = elem.parentNode; break;
			case 'use': elem = elem.parentNode.parentNode; break;
			default:
				if(elem.classList.contains('control-fast-multiplier')) {
					elem = elem.parentNode;
				}
			}
			switch(elem.id) {
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
			case 'control-scale': this.setScale(-scope.drawScale); break;
			case 'control-scaledown': this.setScale(-1, elem); break;
			case 'control-scaleup': this.setScale(1); break;
			case 'control-stop': this.playbackStop(); break;
			case 'control-counter-units': this.toggleCounterUnits(); break;
			default:
				if(elem.classList.contains('code-text')) {
					this.loadCode(Object.assign({ code: elem.innerText },
						elem.hasAttribute('data-songdata') ? JSON.parse(elem.dataset.songdata) : {}));
				} else if(elem.classList.contains('code-load')) {
					if (elem.dataset.file) {
						this.loadTB3FromUrl(elem.dataset.file);
					} else {
						library.onclickCodeLoadButton(elem);
					}
				} else if(elem.classList.contains('code-remix-load')) {
					library.onclickRemixLoadButton(elem);
				} else if(elem.classList.contains('library-header')) {
					if(elem.closest('#exotic-projects')) {
						this.toggleExoticSection(elem);
					} else {
						library.onclickLibraryHeader(elem);
					}
				} else if(elem.parentNode.classList.contains('library-header')) {
					if(elem.parentNode.closest('#exotic-projects')) {
						this.toggleExoticSection(elem.parentNode);
					} else {
						library.onclickLibraryHeader(elem.parentNode);
					}
				}
			}
			return;
		case 'input':
			switch(elem.id) {
			case 'control-counter': this.oninputCounter(e); break;
			case 'control-volume': this.setVolume(false); break;
			}
			return;
		case 'keydown':
			if(elem.id === 'control-counter') {
				this.oninputCounter(e);
			}
			return;
		case 'mouseover':
			if(elem.classList.contains('code-load')) {
				elem.title = `Click to play the ${ elem.dataset.type } code`;
			} else if(elem.classList.contains('code-text')) {
				elem.title = 'Click to play this code';
			} else if(elem.classList.contains('songs-header')) {
				elem.title = 'Click to show/hide the songs';
			}
			return;
		}
	}
	async init() {
		try {
			this.settings = JSON.parse(localStorage.settings);
			scope.drawMode = this.settings.drawMode;
			scope.drawScale = this.settings.drawScale;
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
	initAfterDom() {
		// Show loading overlay during editor initialization
		const editorLoading = document.getElementById('editor-loading');
		if (editorLoading) {
			editorLoading.classList.remove('hidden');
		}
		
		// Use setTimeout to allow loading overlay to show
		setTimeout(() => {
			editor.init();
			ui.initElements();
			scope.initElements();
			library.initElements();
			this.setVolume(true);
			this.setCounterUnits();
			this.setCodeStyle();
			this.setColorStereo();
			this.setColorDiagram();
			this.setColorWaveform();
			this.setColorTimeCursor();
			this.setScale(0);
			this.setScopePreferencesCheckbox();
			this.parseUrl();
			this.sendData({ drawMode: scope.drawMode });
			ui.controlDrawMode.value = scope.drawMode;
			ui.controlThemeStyle.value = this.settings.themeStyle;
			ui.controlCodeStyle.value = this.settings.codeStyle;
			ui.mainElem.addEventListener('click', this);
			ui.mainElem.addEventListener('change', this);
			ui.containerFixed.addEventListener('input', this);
			ui.containerFixed.addEventListener('keydown', this);
			ui.containerScroll.addEventListener('mouseover', this);
			this.initFileManager();
			this.loadExoticProjects();
			
			// Hide the initial loading overlay
			if (editorLoading) {
				editorLoading.classList.add('hidden');
			}
		}, 50);
	}
	async initAudio() {
		this.audioCtx = new AudioContext({ latencyHint: 'balanced', sampleRate: 48000 });
		this.audioGain = new GainNode(this.audioCtx);
		this.audioGain.connect(this.audioCtx.destination);
		await this.audioCtx.audioWorklet.addModule('./build/audio-processor.mjs');
		this.audioWorkletNode = new AudioWorkletNode(this.audioCtx, 'audioProcessor',
			{ outputChannelCount: [2] });
		this.audioWorkletNode.port.addEventListener('message', e => this.receiveData(e.data));
		this.audioWorkletNode.port.start();
		// Setup analyser for FFT
		scope.analyser = this.audioCtx.createAnalyser();
		scope.analyser.fftSize = 1024;
		scope.analyser.smoothingTimeConstant = 0.7;
		scope.analyserData = new Uint8Array(scope.analyser.frequencyBinCount);
		this.analyserGain = new GainNode(this.audioCtx, { gain: 0.1 }); // scale down to 10%
		this.audioWorkletNode.connect(this.analyserGain);
		this.analyserGain.connect(scope.analyser);
		this.audioWorkletNode.connect(this.audioGain);
		const mediaDest = this.audioCtx.createMediaStreamDestination();
		const audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.addEventListener('dataavailable', e => this.audioRecordChunks.push(e.data));
		audioRecorder.addEventListener('stop', () => {
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
	initFileManager() {
		const addFileBtn = document.getElementById('add-file');
		const clearFilesBtn = document.getElementById('clear-files');
		const fileInput = document.getElementById('file-input');
		const loadTB3Btn = document.getElementById('load-tb3');
		const tb3Input = document.getElementById('tb3-input');
		
		addFileBtn.addEventListener('click', () => fileInput.click());
		clearFilesBtn.addEventListener('click', () => this.clearAllFiles());
		fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
		loadTB3Btn.addEventListener('click', () => tb3Input.click());
		tb3Input.addEventListener('change', (e) => this.handleTB3Select(e));
		document.getElementById('save-tb3').addEventListener('click', () => this.saveTB3());
	}
	async handleFileSelect(e) {
		const files = Array.from(e.target.files);
		for (const file of files) {
			if (file.type.startsWith('audio/')) {
				await this.handleAudioFile(file);
			}
		}
		this.updateFileList();
		this.sendAudioFilesToProcessor();
	}
	async handleTB3Select(e) {
		const file = e.target.files[0];
		if (file) {
			editor.showLoading();
			try {
				await this.handleTB3File(file);
				this.updateFileList();
				this.sendAudioFilesToProcessor();
			} finally {
				// Don't hide loading here since handleTB3File -> loadCode will handle it
			}
		}
	}
	async handleTB3File(file) {
		const zip = new JSZip();
		const zipData = await zip.loadAsync(file);
		this.audioFiles.clear();
		
		// Detect format
		let format = 'Unknown';
		let hasAudioFolder = Object.keys(zipData.files).some(f => f.startsWith('audio/'));
		let hasAudioJson = zipData.files['audio.json'];
		
		if (hasAudioFolder) format = 'TB3';
		else if (hasAudioJson) format = 'TB2';
		else format = 'TB3';
		
		// TB2/TB3 format
		if (zipData.files['code.txt'] && zipData.files['settings.json']) {
			const code = await zipData.files['code.txt'].async('string');
			const settings = JSON.parse(await zipData.files['settings.json'].async('string'));
			
			// Don't show loading again since loadCode will handle it
			this.loadCode({ code, ...settings, format }, true);
			
			// TB3: Load from audio folder
			for (const [filename, zipEntry] of Object.entries(zipData.files)) {
				if (filename.startsWith('audio/') && filename.endsWith('.json')) {
					const index = +filename.match(/\/(\d+)\.json$/)[1];
					const audioData = JSON.parse(await zipEntry.async('text'));
					this.audioFiles.set(index, {
						name: audioData.name,
						data: new Float32Array(audioData.data),
						channels: audioData.channels,
						sampleRate: audioData.sampleRate
					});
				}
			}
			
			// TB2: Load from audio.json
			if (zipData.files['audio.json']) {
				const audioData = JSON.parse(await zipData.files['audio.json'].async('string'));
				// TB2 format: data is [sample][channel], extract first channel
				const channelData = audioData.data.map(sample => sample[0] || 0);
				this.audioFiles.set(0, {
					name: 'audio.json',
					data: new Float32Array(channelData),
					channels: audioData.channels,
					sampleRate: audioData.sampleRate
				});
			}
		}
	}
	async handleAudioFile(file) {
		const arrayBuffer = await file.arrayBuffer();
		const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
		const audioData = {
			name: file.name,
			data: audioBuffer.getChannelData(0),
			channels: audioBuffer.numberOfChannels,
			sampleRate: audioBuffer.sampleRate,
			duration: audioBuffer.duration
		};
		this.audioFiles.set(this.audioFiles.size, audioData);
	}
	updateFileList() {
		const fileList = document.getElementById('file-list') || document.getElementById('audio-list');
		if (!fileList) return;
		fileList.innerHTML = '';
		this.audioFiles.forEach((file, index) => {
			const fileItem = document.createElement('div');
			fileItem.className = 'file-item';
			fileItem.innerHTML = `
				<span>${index}: ${file.name}</span>
				<button class="remove-file" data-index="${index}">×</button>
			`;
			fileItem.querySelector('.remove-file').addEventListener('click', () => {
				this.removeFile(index);
			});
			fileList.appendChild(fileItem);
		});
	}
	removeFile(index) {
		this.audioFiles.delete(index);
		this.updateFileList();
		this.sendAudioFilesToProcessor();
	}
	clearAllFiles() {
		this.audioFiles.clear();
		this.updateFileList();
		this.sendAudioFilesToProcessor();
	}
	sendAudioFilesToProcessor() {
		this.sendData({ audioFiles: Array.from(this.audioFiles.entries()) });
	}
	async loadTB3FromUrl(url) {
		editor.showLoading();
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const file = new File([blob], url.split('/').pop());
			await this.handleTB3File(file);
			this.updateFileList();
			this.sendAudioFilesToProcessor();
		} finally {
			setTimeout(() => editor.hideLoading(), 100);
		}
	}
	async loadExoticProjects() {
		try {
			const response = await fetch('./data/exotic-projects.json');
			const data = await response.json();
			const container = document.getElementById('exotic-projects');
			container.innerHTML = '';
			
			for (const section of data.sections) {
				// Create section header
				const sectionHeader = document.createElement('div');
				sectionHeader.className = 'library-header';
				sectionHeader.innerHTML = `<span class="library-arrow">${section.expanded ? '▼' : '▶'}</span> ${section.name} <span class="library-count">${section.count} songs</span>`;
				container.appendChild(sectionHeader);
				
				// Create projects container
				const projectsContainer = document.createElement('div');
				projectsContainer.className = 'library-songs';
				projectsContainer.style.display = section.expanded ? 'block' : 'none';
				
				for (const project of section.projects) {
					const projectDiv = document.createElement('div');
					projectDiv.className = 'song';
					
					if (project.codeFile.endsWith('.tb2') || project.codeFile.endsWith('.tb3')) {
						// TB2/TB3 project file
						const formatLabel = project.codeFile.endsWith('.tb2') ? '[TB2] ' : '[TB3] ';
						projectDiv.innerHTML = `
							<div class="song-title">${formatLabel}${project.name}</div>
							<div class="song-author">${section.name} (${project.date})</div>
							${project.description ? `<div class="song-description">${project.description}</div>` : ''}
							${project.features ? `<div class="song-features">Features: ${project.features.join(', ')}</div>` : ''}
							<button class="code-load" data-file="./data/songs/exotic/${project.codeFile}">Load ${project.codeFile}</button>
						`;
					} else {
						// Regular JS file
						const codeResponse = await fetch(`./data/songs/exotic/${project.codeFile}`);
						const code = await codeResponse.text();
						const formatLabel = project.mode ? `[${project.mode}] ` : '';
						projectDiv.innerHTML = `
							<div class="song-title">${formatLabel}${project.name}</div>
							<div class="song-author">${section.name} (${project.date})</div>
							${project.description ? `<div class="song-description">${project.description}</div>` : ''}
							${project.features ? `<div class="song-features">Features: ${project.features.join(', ')}</div>` : ''}
							<div class="code-text" data-songdata='${JSON.stringify({...project, code})}'>${code}</div>
						`;
					}
					projectsContainer.appendChild(projectDiv);
				}
				container.appendChild(projectsContainer);
			}
		} catch (error) {
			console.log('No exotic projects file found');
		}
	}
	async saveTB3() {
		const zip = new JSZip();
		const audioFolder = zip.folder('audio');
		
		// Save code
		zip.file('code.txt', editor.value);
		
		// Save settings
		zip.file('settings.json', JSON.stringify({
			mode: this.mode,
			sampleRate: this.sampleRate,
			drawMode: scope.drawMode,
			scale: scope.drawScale
		}));
		
		// Save audio files in audio folder
		for (const [index, audioData] of this.audioFiles.entries()) {
			audioFolder.file(`${index}.json`, JSON.stringify({
				name: audioData.name,
				data: Array.from(audioData.data),
				channels: audioData.channels,
				sampleRate: audioData.sampleRate
			}));
		}
		
		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);
		ui.downloader.href = url;
		ui.downloader.download = 'project.tb3';
		ui.downloader.click();
		setTimeout(() => URL.revokeObjectURL(url));
	}
	toggleExoticSection(header) {
		const arrow = header.querySelector('.library-arrow');
		const songsContainer = header.nextElementSibling;
		const isExpanded = songsContainer.style.display !== 'none';
		arrow.textContent = isExpanded ? '▶' : '▼';
		songsContainer.style.display = isExpanded ? 'none' : 'block';
	}
	loadCode({ code, sampleRate, mode, drawMode, scale }, isPlay = true) {
		// Show loading overlay
		editor.showLoading();
		
		// Use setTimeout to allow the loading overlay to show before processing
		setTimeout(() => {
			this.mode = ui.controlPlaybackMode.value = mode = mode || 'Bytebeat';
			editor.setValue(code);
			this.setSampleRate(ui.controlSampleRate.value = +sampleRate || 8000, false);
			const data = {
				mode,
				sampleRate: this.sampleRate,
				sampleRatio: this.sampleRate / this.audioCtx.sampleRate
			};
			if(isPlay) {
				data.playbackSpeed = this.playbackSpeed = 1;
				this.playbackToggle(true, false);
				data.resetTime = true;
				data.isPlaying = isPlay;
			}
			data.setFunction = code;
			
			// Check if scope preferences should not be changed
			const doNotChangeScopePrefs = this.settings.donotChangeScopePreferences;
			
			if(drawMode && !doNotChangeScopePrefs) {
				ui.controlDrawMode.value = scope.drawMode = drawMode;
				this.saveSettings();
			}
			if(scale !== undefined && !doNotChangeScopePrefs) {
				this.setScale(scale - scope.drawScale);
			}
			this.sendData(data);
			
			// Hide loading overlay after a short delay
			setTimeout(() => {
				editor.hideLoading();
			}, 100);
		}, 10);
	}
	oninputCounter(e) {
		if(e.key === 'Enter') {
			ui.controlTime.blur();
			this.playbackToggle(true);
			return;
		}
		const { value } = ui.controlTime;
		const byteSample = this.settings.isSeconds ? Math.round(value * this.sampleRate) : value;
		this.setByteSample(byteSample);
		this.sendData({ byteSample });
	}
	parseUrl() {
		let urlHash = window.location.hash;
		if(!urlHash) {
			this.updateUrl();
			urlHash = window.location.hash;
		}
		const codeData = getCodeFromUrl(urlHash) || { code: editor.value };
		// Only show loading if we're loading code from URL (not default)
		if(urlHash && getCodeFromUrl(urlHash)) {
			this.loadCode(codeData, false);
		} else {
			// For default code, don't show loading overlay
			this.mode = ui.controlPlaybackMode.value = codeData.mode || 'Bytebeat';
			editor.setValue(codeData.code);
			this.setSampleRate(ui.controlSampleRate.value = +codeData.sampleRate || 8000, false);
			const data = {
				mode: this.mode,
				sampleRate: this.sampleRate,
				sampleRatio: this.sampleRate / this.audioCtx.sampleRate,
				setFunction: codeData.code
			};
			this.sendData(data);
		}
	}
	playbackStop() {
		this.playbackToggle(false, false);
		this.sendData({ isPlaying: false, resetTime: true });
	}
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
			if(this.audioCtx.resume) {
				this.audioCtx.resume();
				scope.requestAnimationFrame(); // Main call for drawing in the scope
			}
		} else {
			if(this.isRecording) {
				this.isRecording = false;
				ui.controlRecord.classList.remove('control-recording');
				ui.controlRecord.title = 'Record to file';
				this.audioRecorder.stop();
			}
		}
		this.isPlaying = isPlaying;
		if(isSendData) {
			this.sendData({ isPlaying, playbackSpeed: this.playbackSpeed });
		} else {
			this.isNeedClear = true;
		}
	}
	receiveData(data) {
		const { byteSample, drawBuffer, fftData, error } = data;
		if(typeof byteSample === 'number') {
			this.setCounterValue(byteSample);
			this.setByteSample(byteSample);
		}
		if(Array.isArray(drawBuffer)) {
			scope.drawBuffer = scope.drawBuffer.concat(drawBuffer);
			const limit = scope.canvasWidth * (1 << scope.drawScale) - 1;
			if(scope.drawBuffer.length > limit) {
				scope.drawBuffer = scope.drawBuffer.slice(-limit);
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
				editor.errorElem.innerText = error.message;
				this.sendData({ errorDisplayed: true });
			}
			if(data.updateUrl !== true) {
				ui.setCodeSize(editor.value);
			}
		}
		if(data.updateUrl === true) {
			this.updateUrl();
		}
	}
	resetTime() {
		this.isNeedClear = true;
		this.sendData({ resetTime: true, playbackSpeed: this.playbackSpeed });
	}
	saveSettings() {
		this.settings.drawMode = scope.drawMode;
		this.settings.drawScale = scope.drawScale;
		this.settings.showAllSongs = library.showAllSongs;
		localStorage.settings = JSON.stringify(this.settings);
	}
	sendData(data) {
		this.audioWorkletNode.port.postMessage(data);
	}
	setByteSample(value) {
		this.byteSample = +value || 0;
		if(this.isNeedClear && value === 0) {
			this.isNeedClear = false;
			scope.drawBuffer = [];
			scope.clearCanvas();
			scope.canvasTimeCursor.style.left = 0;
			if(!this.isPlaying) {
				scope.canvasPlayButton.classList.add('canvas-initial');
			}
		}
	}
	setCodeStyle(value) {
		if(value === undefined) {
			if((value = this.settings.codeStyle) === undefined) {
				value = this.settings.codeStyle = this.defaultSettings.codeStyle;
				this.saveSettings();
			}
			editor.container.dataset.theme = value;
			return;
		}
		editor.container.dataset.theme = this.settings.codeStyle = value;
		this.saveSettings();
	}
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
	}
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
	}
	setCounterUnits() {
		ui.controlTimeUnits.textContent = this.settings.isSeconds ? 'sec' : 't';
		this.setCounterValue(this.byteSample);
	}
	setCounterValue(value) {
		ui.controlTime.value = this.settings.isSeconds ? (value / this.sampleRate).toFixed(2) : value;
	}
	setDrawMode(drawMode) {
		scope.drawMode = drawMode;
		this.saveSettings();
		this.sendData({ drawMode });
	}
	setPlaybackMode(mode) {
		this.mode = mode;
		this.updateUrl();
		this.sendData({ mode });
	}
	setSampleRate(sampleRate, isSendData = true) {
		if(!sampleRate || !isFinite(sampleRate) ||
			// Float32 limit
			(sampleRate = Number(parseFloat(Math.abs(sampleRate)).toFixed(3))) > 3.4028234663852886E+38
		) {
			sampleRate = 8000;
		}
		switch(sampleRate) {
		case 1000:
		case 8000:
		case 11025:
		case 16000:
		case 22050:
		case 32000:
		case 44100:
		case 48000: ui.controlSampleRateSelect.value = sampleRate; break;
		default: ui.controlSampleRateSelect.selectedIndex = -1;
		}
		ui.controlSampleRate.value = this.sampleRate = sampleRate;
		ui.controlSampleRate.blur();
		ui.controlSampleRateSelect.blur();
		scope.toggleTimeCursor();
		if(isSendData) {
			this.updateUrl();
			this.sendData({
				sampleRate: this.sampleRate,
				sampleRatio: this.sampleRate / this.audioCtx.sampleRate
			});
		}
	}
	setScale(amount, buttonElem) {
		if(buttonElem?.getAttribute('disabled')) {
			return;
		}
		const scale = Math.max(scope.drawScale + amount, 0);
		scope.drawScale = scale;
		ui.controlScale.innerHTML = !scale ? '1x' :
			scale < 7 ? `1/${ 2 ** scale }${ scale < 4 ? 'x' : '' }` :
			`<sub>2</sub>-${ scale }`;
		this.saveSettings();
		scope.clearCanvas();
		scope.toggleTimeCursor();
		if(scope.drawScale <= 0) {
			ui.controlScaleDown.setAttribute('disabled', true);
		} else {
			ui.controlScaleDown.removeAttribute('disabled');
		}
	}
	setThemeStyle(value) {
		if(value === undefined) {
			if((value = this.settings.themeStyle) === undefined) {
				value = this.settings.themeStyle = this.defaultSettings.themeStyle;
				this.saveSettings();
			}
			document.documentElement.dataset.theme = value;
			return;
		}
		document.documentElement.dataset.theme = this.settings.themeStyle = value;
		let colorCursor, colorDiagram;
		let colorStereo = 1; // Red=0, Green=1, Blue=2
		switch(value) {
		case 'Cake':
			colorCursor = '#40ffff';
			colorDiagram = '#ff00ff';
			colorStereo = 0;
			break;
		case 'Green':
			colorCursor = '#ff0000';
			colorDiagram = '#00c080';
			break;
		case 'Orange':
			colorCursor = '#ffff80';
			colorDiagram = '#8000ff';
			colorStereo = 0;
			break;
		case 'Purple':
			colorCursor = '#ff50ff';
			colorDiagram = '#a040ff';
			colorStereo = 0;
			break;
		case 'Teal':
			colorCursor = '#80c0ff';
			colorDiagram = '#00ffff';
			break;
		default:
			colorCursor = '#00FFFF';
			colorDiagram = '#00a0ff';
		}
		this.setColorTimeCursor(colorCursor);
		this.setColorStereo(colorStereo);
		ui.controlColorWaveformInfo.innerHTML = scope.getColorTest('colorWaveform');
		this.setColorDiagram(ui.controlColorDiagram.value = colorDiagram); // Contains this.saveSettings();
	}
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
	toggleCounterUnits() {
		this.settings.isSeconds = !this.settings.isSeconds;
		this.saveSettings();
		this.setCounterUnits();
	}
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
	updateUrl() {
		const code = editor.value;
		ui.setCodeSize(code);
		getUrlFromCode(code, this.mode, this.sampleRate);
	}
	setScopePreferencesCheckbox() {
		const checkbox = document.getElementById('DONOTCHANGESCOPEPREFERENCES');
		if(checkbox) {
			checkbox.checked = this.settings.donotChangeScopePreferences ?? false;
		}
	}
}();

// Add CSS for file management
const style = document.createElement('style');
style.textContent = `
.file-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px;
	margin: 4px 0;
	background: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: 4px;
}
.file-item span {
	flex: 1;
	color: var(--color-text);
}
.remove-file {
	background: #ff4444;
	color: white;
	border: none;
	padding: 4px 8px;
	cursor: pointer;
	border-radius: 3px;
	font-size: 12px;
	margin-left: 8px;
}
.remove-file:hover {
	background: #ff6666;
}
`;
document.head.appendChild(style);
