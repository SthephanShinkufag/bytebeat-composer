import { deflateRaw, inflateRaw } from './pako.esm.min.mjs';

const loadScript = src => new Promise(resolve => {
	try {
		const scriptElem = document.createElement('script');
		scriptElem.type = 'module';
		scriptElem.async = true;
		scriptElem.src = src;
		scriptElem.addEventListener('load', () => resolve());
		scriptElem.addEventListener('error', () => console.error(`Failed to load the script ${ src }`));
		document.head.appendChild(scriptElem);
	} catch(err) {
		console.error(err.message);
	}
});

globalThis.bytebeat = new class {
	constructor() {
		this.audioCtx = null;
		this.audioGain = null;
		this.audioRecordChunks = [];
		this.audioRecorder = null;
		this.audioWorkletNode = null;
		this.byteSample = 0;
		this.cacheParentElem = null;
		this.cacheTextElem = null;
		this.canvasContainer = null;
		this.canvasCtx = null;
		this.canvasElem = null;
		this.canvasHeight = 256;
		this.canvasPlayButton = null;
		this.canvasTimeCursor = null;
		this.canvasWidth = 1024;
		this.containerFixedElem = null;
		this.controlCodeStyle = null;
		this.controlColorDiagram = null;
		this.controlColorDiagramInfo = null;
		this.controlColorStereo = 1; // Left=G, Right=R+B
		this.controlColorWaveform = null;
		this.controlColorWaveformInfo = null;
		this.controlDrawMode = null;
		this.controlPlaybackMode = null;
		this.controlRecord = null;
		this.controlSampleRate = null;
		this.controlSampleRateSelect = null;
		this.controlScale = null;
		this.controlScaleDown = null;
		this.controlThemeStyle = null;
		this.controlTime = null;
		this.controlTimeUnits = null;
		this.controlVolume = null;
		this.colorChannels = null;
		this.colorDiagram = null;
		this.colorWaveform = null;
		this.defaultSettings = {
			codeStyle: 'Atom Dark',
			colorDiagram: '#0080ff',
			colorStereo: 1,
			colorTimeCursor: '#80bbff',
			colorWaveform: '#ffffff',
			drawMode: 'Combined',
			drawScale: 5,
			isSeconds: false,
			showAllSongs: false,
			themeStyle: 'Default',
			volume: .5
		};
		this.drawBuffer = [];
		this.drawEndBuffer = [];
		this.editorElem = null;
		this.errorElem = null;
		this.isCompilationError = false;
		this.isNeedClear = false;
		this.isPlaying = false;
		this.isRecording = false;
		this.pathFiles = './data/songs/';
		this.pathJSON = './data/json/';
		this.playbackSpeed = 1;
		this.settings = this.defaultSettings;
		this.songData = { mode: 'Bytebeat', sampleRate: 8000 };
		this.songs = null;
		this.init();
	}
	get editorValue() {
		return this.editorView ? this.editorView.state.doc.toString() : this.editorElem.value;
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
		return this.songData.sampleRate >> this.settings.drawScale < 2000;
	}
	animationFrame() {
		this.drawGraphics(this.byteSample);
		if(this.isPlaying) {
			this.requestAnimationFrame();
		}
	}
	cacheSongs(libArr) {
		this.songs = new Map();
		for(let i = 0, iLen = libArr.length; i < iLen; ++i) {
			const { author } = libArr[i];
			for(let j = 0, jLen = libArr[i].songs.length; j < jLen; ++j) {
				const song = libArr[i].songs[j];
				song.author = author;
				this.songs.set(song.hash, song);
			}
		}
	}
	clearCanvas() {
		this.canvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}
	copyLink() {
		navigator.clipboard.writeText(window.location);
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
		const width = this.canvasWidth;
		const height = this.canvasHeight;
		const scale = this.settings.drawScale;
		const isReverse = this.playbackSpeed < 0;
		let startTime = buffer[0].t;
		let startX = this.mod(this.getX(startTime), width);
		let endX = Math.floor(startX + this.getX(endTime - startTime));
		startX = Math.floor(startX);
		let drawWidth = Math.abs(endX - startX) + 1;
		// Truncate large segments (for high playback speed or 512px canvas)
		if(drawWidth > width) {
			startTime = (this.getX(endTime) - width) * (1 << scale);
			startX = this.mod(this.getX(startTime), width);
			endX = Math.floor(startX + this.getX(endTime - startTime));
			startX = Math.floor(startX);
			drawWidth = Math.abs(endX - startX) + 1;
		}
		startX = Math.min(startX, endX);
		// Restoring the last points of a previous segment
		const imageData = this.canvasCtx.createImageData(drawWidth, height);
		const { data } = imageData;
		if(scale) {
			const x = isReverse ? drawWidth - 1 : 0;
			for(let y = 0; y < height; ++y) {
				const drawEndBuffer = this.drawEndBuffer[y];
				if(drawEndBuffer) {
					let idx = (drawWidth * (255 - y) + x) << 2;
					data[idx++] = drawEndBuffer[0];
					data[idx++] = drawEndBuffer[1];
					data[idx] = drawEndBuffer[2];
				}
			}
		}
		// Filling an alpha channel in a segment
		for(let x = 0; x < drawWidth; ++x) {
			for(let y = 0; y < height; ++y) {
				data[((drawWidth * y + x) << 2) + 3] = 255;
			}
		}
		// Drawing in a segment
		const { drawMode } = this.settings;
		const isCombined = drawMode === 'Combined';
		const isDiagram = drawMode === 'Diagram';
		const isWaveform = drawMode === 'Waveform';
		const { colorDiagram } = this;
		const colorPoints = this.colorWaveform;
		const colorWaveform = !isWaveform ? colorPoints : [
			Math.floor(.6 * colorPoints[0] | 0),
			Math.floor(.6 * colorPoints[1] | 0),
			Math.floor(.6 * colorPoints[2] | 0)];
		let ch, drawDiagramPoint, drawPoint, drawWavePoint;
		for(let i = 0; i < bufferLen; ++i) {
			const curY = buffer[i].value;
			const prevY = buffer[i - 1]?.value ?? [NaN, NaN];
			const isNaNCurY = [isNaN(curY[0]), isNaN(curY[1])];
			const curTime = buffer[i].t;
			const nextTime = buffer[i + 1]?.t ?? endTime;
			const curX = this.mod(Math.floor(this.getX(isReverse ? nextTime + 1 : curTime)) - startX, width);
			const nextX = this.mod(Math.ceil(this.getX(isReverse ? curTime + 1 : nextTime)) - startX, width);
			let diagramSize, diagramStart;
			if(isCombined || isDiagram) {
				diagramSize = Math.max(1, 256 >> scale);
				diagramStart = diagramSize * this.mod(curTime, 1 << scale);
			} else if(isNaNCurY[0] || isNaNCurY[1]) {
				// Error value - filling with red color
				for(let x = curX; x !== nextX; x = this.mod(x + 1, width)) {
					for(let y = 0; y < height; ++y) {
						const idx = (drawWidth * y + x) << 2;
						if(!data[idx + 1] && !data[idx + 2]) {
							data[idx] = 100; // Error: red color
						}
					}
				}
			}
			// Select mono or stereo drawing
			if((curY[0] === curY[1] || isNaNCurY[0] && isNaNCurY[1]) && prevY[0] === prevY[1]) {
				ch = 1;
				drawDiagramPoint = isCombined ? this.drawSoftPointMono : this.drawPointMono;
				drawPoint = this.drawPointMono;
				drawWavePoint = isCombined ? this.drawPointMono : this.drawSoftPointMono;
			} else {
				ch = 2;
				drawDiagramPoint = isCombined ? this.drawSoftPointStereo : this.drawPointStereo;
				drawPoint = this.drawPointStereo;
				drawWavePoint = isCombined ? this.drawPointStereo : this.drawSoftPointStereo;
			}
			while(ch--) {
				const curYCh = curY[ch];
				const colorCh = this.colorChannels;
				// Diagram drawing
				if(isCombined || isDiagram) {
					const isNaNCurYCh = isNaNCurY[ch];
					const value = (curYCh & 255) / 256;
					const color = [
						value * colorDiagram[0] | 0,
						value * colorDiagram[1] | 0,
						value * colorDiagram[2] | 0];
					for(let x = curX; x !== nextX; x = this.mod(x + 1, width)) {
						for(let y = 0; y < diagramSize; ++y) {
							const idx = (drawWidth * (diagramStart + y) + x) << 2;
							if(isNaNCurYCh) {
								data[idx] = 100; // Error: red color
							} else {
								drawDiagramPoint(data, idx, color, colorCh, ch);
							}
						}
					}
				}
				if(isNaNCurY[ch] || isDiagram) {
					continue;
				}
				// Points drawing
				for(let x = curX; x !== nextX; x = this.mod(x + 1, width)) {
					drawPoint(data, (drawWidth * (255 - curYCh) + x) << 2, colorPoints, colorCh, ch);
				}
				// Waveform vertical lines drawing
				if(isCombined || isWaveform) {
					const prevYCh = prevY[ch];
					if(isNaN(prevYCh)) {
						continue;
					}
					const x = isReverse ? this.mod(Math.floor(this.getX(curTime)) - startX, width) : curX;
					for(let dy = prevYCh < curYCh ? 1 : -1, y = prevYCh; y !== curYCh; y += dy) {
						drawWavePoint(data, (drawWidth * (255 - y) + x) << 2, colorWaveform, colorCh, ch);
					}
				}
			}
		}
		// Saving the last points of a segment
		if(scale) {
			const x = isReverse ? 0 : drawWidth - 1;
			for(let y = 0; y < height; ++y) {
				let idx = (drawWidth * (255 - y) + x) << 2;
				this.drawEndBuffer[y] = [data[idx++], data[idx++], data[idx]];
			}
		}
		// Placing a segment on the canvas
		this.canvasCtx.putImageData(imageData, startX, 0);
		if(endX >= width) {
			this.canvasCtx.putImageData(imageData, startX - width, 0);
		} else if(endX <= 0) {
			this.canvasCtx.putImageData(imageData, startX + width, 0);
		}
		// Move the cursor to the end of the segment
		if(this.timeCursorEnabled) {
			this.canvasTimeCursor.style.left = endX / width * 100 + '%';
		}
		// Clear buffer
		this.drawBuffer = [{ t: endTime, value: buffer[bufferLen - 1].value }];
	}
	drawPointMono(data, i, color) {
		data[i++] = color[0];
		data[i++] = color[1];
		data[i] = color[2];
	}
	drawPointStereo(data, i, color, colorCh, isRight) {
		if(isRight) {
			const c1 = colorCh[1];
			const c2 = colorCh[2];
			data[i + c1] = color[c1];
			data[i + c2] = color[c2];
		} else {
			const c0 = colorCh[0];
			data[i + c0] = color[c0];
		}
	}
	drawSoftPointMono(data, i, color) {
		if(data[i] || data[i + 1] || data[i + 2]) {
			return;
		}
		data[i++] = color[0];
		data[i++] = color[1];
		data[i] = color[2];
	}
	drawSoftPointStereo(data, i, color, colorCh, isRight) {
		if(isRight) {
			let i1, i2, c1, c2;
			if(data[i1 = i + (c1 = colorCh[1])] || data[i2 = i + (c2 = colorCh[2])]) {
				return;
			}
			data[i1] = color[c1];
			data[i2] = color[c2];
			return;
		}
		const c0 = colorCh[0];
		const i0 = i + c0;
		if(data[i0]) {
			return;
		}
		data[i0] = color[c0];
	}
	escapeHTML(text) {
		this.cacheTextElem.nodeValue = text;
		return this.cacheParentElem.innerHTML;
	}
	expandEditor() {
		this.containerFixedElem.classList.toggle('container-expanded');
	}
	formatBytes(bytes) {
		if(bytes < 1E4) {
			return bytes + 'B';
		}
		const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
		return (i ? (bytes / (1024 ** i)).toFixed(2) : bytes) + ['B', 'KB', 'MB', 'GB', 'TB'][i];
	}
	generateEntryHTML({
		author, code, codeFormLen, codeLen, codeMin, codeMinLen, coverName, coverUrl, date, description,
		drawing, fileForm, fileMin, fileOrig, hash, mode, name, rating, remix, sampleRate, songs, stereo,
		tags, url
	}, libName) {
		const notAllLib = libName !== 'all';
		if(songs) {
			let songsStr = '';
			const len = songs.length;
			const maxVisible = 10;
			const needToHide = len - maxVisible;
			if(notAllLib && len > maxVisible + 3) {
				songsStr += `<details><summary class="code-button songs-toggle">${
					needToHide } more bytebeats</summary>`;
				for(let i = 0; i < len; ++i) {
					if(i === needToHide) {
						songsStr += '</details>';
					}
					songsStr += this.generateEntryHTML(songs[i], libName);
				}
			} else {
				for(let i = 0; i < len; ++i) {
					songsStr += this.generateEntryHTML(songs[i], libName);
				}
			}
			return `<details class="songs-block"${
				notAllLib || this.settings.showAllSongs ? ' open' : ''
			}><summary class="songs-header"> <b>${ author }</b>${
				author === 'SthephanShi' ? '<small style="color: #ff0;">dollchan creator</small>' : '' }${
				len ? `<small> ${ len } song${ len > 1 ? 's' : '' }</small>` : ''
			}</summary><div class="songs">${ songsStr }</div></details>`;
		}
		let str = '';
		const noArrayUrl = url && !Array.isArray(url);
		if(name) {
			str += url ? `<a href="${ noArrayUrl ? url : url[0] }" target="_blank">${ name }</a>` : name;
		}
		if(author) {
			str += ` <span>by ${ name || !noArrayUrl ? `<b>${ author }</b>` :
				`<a href="${ url }" target="_blank">${ author }</a>` }</span>`;
		}
		const songObj = { sampleRate, mode };
		if(url && (!noArrayUrl || !name && !author)) {
			if(noArrayUrl) {
				str += `[<a href="${ url }" target="_blank">link</a>]`;
			} else {
				const urlsArr = [];
				for(let i = name ? 1 : 0, len = url.length; i < len; ++i) {
					urlsArr.push(`<a href="${ url[i] }" target="_blank">link${ i + 1 }</a>`);
				}
				str += ` [${ urlsArr.join(', ') }]`;
			}
		}
		str += ' <span class="code-info">';
		if(date) {
			str += date;
		}
		if(mode) {
			str += ' ' + mode;
		}
		str += ` ${ sampleRate }Hz`;
		if(stereo) {
			tags.push('stereo');
		}
		if(drawing) {
			songObj.drawMode = drawing.mode;
			songObj.scale = drawing.scale;
			tags.push('drawing');
		}
		let tagsStr = ('#' + tags.join(' #')).replace(/\s?#(?:256|1k|big)/g, '');
		if(notAllLib) {
			tagsStr = tagsStr.replace(/\s?#c/, '');
		}
		if(tagsStr) {
			str += ` <span class="code-tags">${ tagsStr }</span>`;
		}
		str += '</span>';
		if(description) {
			str += `<div class="code-description">${ description }</div>`;
		}
		if(remix) {
			for(let i = 0, len = remix.length; i < len; ++i) {
				const { hash: rHash, url: rUrl, name: rName, author: rAuthor } = remix[i];
				str += '<div class="code-remix"><div class="code-remix-preview"> remix of ' +
					`<button class="code-button code-remix-load" data-hash="${
						rHash }" title="Show detailed source information">&gt;</button> <span>${
						rUrl ? `<a href="${ rUrl }" target="_blank">${ rName || rAuthor }</a>` :
						`"${ rName }"` }${ rName && rAuthor ? ' by ' + rAuthor : '' }</span></div></div>`;
			}
		}
		if(coverName) {
			str += `<div class="code-cover">cover of ${ coverUrl ?
				`<a href="${ coverUrl }" target="_blank">${ coverName }</a>` : `"${ coverName }"` }</div>`;
		}
		const sData = ` data-songdata='${ JSON.stringify(songObj) }'`;
		str += '<div class="code-buttons">';
		if(codeMin || fileMin) {
			str += `<button class="code-button code-load" data-type="minified"${ sData }${
				fileMin ? ` data-code-file="${ hash }.js"` : '' }>min ${
				this.formatBytes(codeMinLen) }</button>`;
		}
		if(code || fileOrig) {
			str += `<button class="code-button code-load" data-type="original"${ sData }${
				fileOrig ? `data-code-file="${ hash }.js"` : '' }>orig ${
				this.formatBytes(codeLen) }</button>`;
		}
		if(fileForm) {
			str += `<button class="code-button code-load" data-type="formatted"${ sData } data-code-file="${
				hash }.js">format ${ this.formatBytes(codeFormLen) }</button>`;
		}
		str += '</div>';
		if(codeMin) {
			str += `<button class="code-text code-text-min"${ sData }>${ this.escapeHTML(codeMin) }</button>`;
		}
		if(code) {
			str += `<button class="code-text code-text-orig${ codeMin ? ' hidden' : '' }"${
				sData }>${ this.escapeHTML(code) }</button>`;
		}
		return `<div class="entry${ rating ? ' star-' + rating : '' }" data-hash="${ hash }">${ str }</div>`;
	}
	getColor(value) {
		return [
			parseInt(value.substr(1, 2), 16),
			parseInt(value.substr(3, 2), 16),
			parseInt(value.substr(5, 2), 16)];
	}
	getColorTest(value) {
		let rgbTxt, leftColor, rightColor;
		const c = this.colorChannels;
		switch(c[0]) {
		case 0:
			rgbTxt = ['R', 'G', 'B']; // [Left, Rigtht1, Right2]
			leftColor = `${ value[c[0]] }, 0, 0`;
			rightColor = `0, ${ value[c[1]] }, ${ value[c[2]] }`;
			break;
		case 2:
			rgbTxt = ['B', 'R', 'G'];
			leftColor = `0, 0, ${ value[c[0]] }`;
			rightColor = `${ value[c[1]] }, ${ value[c[2]] }, 0`;
			break;
		default:
			rgbTxt = ['G', 'R', 'B'];
			leftColor = `0, ${ value[c[0]] }, 0`;
			rightColor = `${ value[c[1]] }, 0, ${ value[c[2]] }`;
		}
		return `[ Left <span class="control-color-test" style="background: rgb(${ leftColor });"></span>
			${ rgbTxt[0] }=${ value[c[0]] }, Right
			<span class="control-color-test" style="background: rgb(${ rightColor });"></span>
			${ rgbTxt[1] }=${ value[c[1]] } + ${ rgbTxt[2] }=${ value[c[2]] } ]`;
	}
	getX(t) {
		return t / (1 << this.settings.drawScale);
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
				this.controlColorDiagramInfo.innerHTML = this.getColorTest(this.colorDiagram);
				this.controlColorWaveformInfo.innerHTML = this.getColorTest(this.colorWaveform);
				break;
			case 'control-color-timecursor': this.setColorTimeCursor(elem.value); break;
			case 'control-color-waveform': this.setColorWaveform(elem.value); break;
			case 'control-drawmode': this.setDrawMode(); break;
			case 'control-mode': this.setPlaybackMode(elem.value); break;
			case 'control-samplerate':
			case 'control-samplerate-select': this.setSampleRate(+elem.value); break;
			case 'control-theme-style': this.setThemeStyle(elem.value); break;
			case 'library-show-all':
				this.settings.showAllSongs = elem.checked;
				elem.parentNode.parentNode.querySelectorAll('.songs-block').forEach(
					node => node.toggleAttribute('open', this.settings.showAllSongs));
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
			case 'control-expand': this.expandEditor(); break;
			case 'control-link': this.copyLink(); break;
			case 'control-play-backward': this.playbackToggle(true, true, -1); break;
			case 'control-play-forward': this.playbackToggle(true, true, 1); break;
			case 'control-rec': this.toggleRecording(); break;
			case 'control-reset': this.resetTime(); break;
			case 'control-scale': this.setScale(-this.settings.drawScale); break;
			case 'control-scaledown': this.setScale(-1, elem); break;
			case 'control-scaleup': this.setScale(1); break;
			case 'control-stop': this.playbackStop(); break;
			case 'control-counter-units': this.toggleCounterUnits(); break;
			default:
				if(elem.classList.contains('code-text')) {
					this.loadCode(Object.assign({ code: elem.innerText },
						elem.hasAttribute('data-songdata') ? JSON.parse(elem.dataset.songdata) : {}));
				} else if(elem.classList.contains('code-load')) {
					this.onclickCodeLoadButton(elem);
				} else if(elem.classList.contains('code-remix-load')) {
					this.onclickRemixLoadButton(elem);
				} else if(elem.classList.contains('library-header')) {
					this.onclickLibraryHeader(elem);
				} else if(elem.parentNode.classList.contains('library-header')) {
					this.onclickLibraryHeader(elem.parentNode);
				}
			}
			return;
		case 'input':
			switch(elem.id) {
			case 'control-counter': this.oninputCounter(e); break;
			case 'control-volume': this.setVolume(false); break;
			case 'editor-default': this.setFunction(); break;
			}
			return;
		case 'keydown':
			switch(elem.id) {
			case 'control-counter': this.oninputCounter(e); break;
			case 'editor-default': this.onkeydownEditor(e); break;
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
		} catch(err) {
			this.saveSettings();
		}
		this.setThemeStyle();
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
		loadScript('./scripts/codemirror.min.mjs?version=2024111602');
	}
	async initAudioContext() {
		this.audioCtx = new AudioContext({ latencyHint: 'balanced', sampleRate: 48000 });
		this.audioGain = new GainNode(this.audioCtx);
		this.audioGain.connect(this.audioCtx.destination);
		await this.audioCtx.audioWorklet.addModule('./scripts/audioProcessor.mjs?version=2024111602');
		this.audioWorkletNode = new AudioWorkletNode(this.audioCtx, 'audioProcessor',
			{ outputChannelCount: [2] });
		this.audioWorkletNode.port.addEventListener('message', e => this.receiveData(e.data));
		this.audioWorkletNode.port.start();
		this.audioWorkletNode.connect(this.audioGain);
		const mediaDest = this.audioCtx.createMediaStreamDestination();
		const audioRecorder = this.audioRecorder = new MediaRecorder(mediaDest.stream);
		audioRecorder.addEventListener('dataavailable', e => this.audioRecordChunks.push(e.data));
		audioRecorder.addEventListener('stop', () => {
			let file, type;
			const types = ['audio/webm', 'audio/ogg'];
			const files = ['track.webm', 'track.ogg'];
			while((file = files.pop()) && !MediaRecorder.isTypeSupported(type = types.pop())) {
				if(types.length === 0) {
					console.error('Recording is not supported in this browser!');
					break;
				}
			}
			this.saveData(new Blob(this.audioRecordChunks, { type }), file);
		});
		this.audioGain.connect(mediaDest);
	}
	initElements() {
		// Containers
		this.cacheParentElem = document.createElement('div');
		this.cacheTextElem = document.createTextNode('');
		this.cacheParentElem.appendChild(this.cacheTextElem);
		this.containerFixedElem = document.getElementById('container-fixed');
		['change', 'click', 'input', 'keydown'].forEach(
			e => this.containerFixedElem.addEventListener(e, this));
		const containerScroll = document.getElementById('container-scroll');
		['change', 'click', 'mouseover'].forEach(e => containerScroll.addEventListener(e, this));

		// Volume
		this.controlVolume = document.getElementById('control-volume');
		this.setVolume(true);

		// Canvas
		this.canvasContainer = document.getElementById('canvas-container');
		this.canvasElem = document.getElementById('canvas-main');
		this.canvasCtx = this.canvasElem.getContext('2d');
		this.canvasPlayButton = document.getElementById('canvas-play');
		this.canvasTimeCursor = document.getElementById('canvas-timecursor');
		this.onresizeWindow();
		document.defaultView.addEventListener('resize', () => this.onresizeWindow());

		// Time counter
		this.controlTime = document.getElementById('control-counter');
		this.controlTimeUnits = document.getElementById('control-counter-units');
		this.setCounterUnits();

		// Editor
		this.editorContainer = document.getElementById('editor-container');
		this.setCodeStyle();
		this.editorElem = document.getElementById('editor-default');
		this.errorElem = document.getElementById('error');

		// Controls
		this.controlCodeSize = document.getElementById('control-codesize');
		this.controlColorStereo = document.getElementById('control-color-stereo');
		this.setColorStereo();
		this.controlColorDiagram = document.getElementById('control-color-diagram');
		this.controlColorDiagramInfo = document.getElementById('control-color-diagram-info');
		this.setColorDiagram();
		this.controlColorWaveform = document.getElementById('control-color-waveform');
		this.controlColorWaveformInfo = document.getElementById('control-color-waveform-info');
		this.setColorWaveform();
		this.controlColorTimeCursor = document.getElementById('control-color-timecursor');
		this.setColorTimeCursor();
		this.controlDrawMode = document.getElementById('control-drawmode');
		this.controlDrawMode.value = this.settings.drawMode;
		this.sendData({ drawMode: this.settings.drawMode });
		this.controlPlaybackMode = document.getElementById('control-mode');
		this.controlPlayBackward = document.getElementById('control-play-backward');
		this.controlPlayForward = document.getElementById('control-play-forward');
		this.controlRecord = document.getElementById('control-rec');
		this.controlSampleRate = document.getElementById('control-samplerate');
		this.controlSampleRateSelect = document.getElementById('control-samplerate-select');
		this.controlScale = document.getElementById('control-scale');
		this.controlScaleDown = document.getElementById('control-scaledown');
		this.setScale(0);
		this.controlThemeStyle = document.getElementById('control-theme-style');
		this.controlThemeStyle.value = this.settings.themeStyle;
		this.controlCodeStyle = document.getElementById('control-code-style');
		this.controlCodeStyle.value = this.settings.codeStyle;
	}
	loadCode({ code, sampleRate, mode, drawMode, scale }, isPlay = true) {
		this.songData.mode = this.controlPlaybackMode.value = mode = mode || 'Bytebeat';
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
		const data = {
			mode,
			sampleRate: this.songData.sampleRate,
			sampleRatio: this.songData.sampleRate / this.audioCtx.sampleRate
		};
		if(isPlay) {
			this.playbackToggle(true, false);
			data.resetTime = true;
			data.isPlaying = isPlay;
		}
		data.setFunction = code;
		if(drawMode) {
			this.controlDrawMode.value = drawMode;
			this.setDrawMode();
		}
		if(scale !== undefined) {
			this.setScale(scale - this.settings.drawScale);
		}
		this.sendData(data);
	}
	mod(a, b) {
		return ((a % b) + b) % b;
	}
	async onclickCodeLoadButton(buttonElem) {
		if(buttonElem.dataset.codeFile) {
			buttonElem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const waitElem = buttonElem.lastChild;
			const response = await fetch(this.pathFiles + buttonElem.dataset.type +
				'/' + buttonElem.dataset.codeFile);
			this.loadCode(Object.assign(JSON.parse(buttonElem.dataset.songdata),
				{ code: await response.text() }));
			waitElem.remove();
		} else {
			const codeTextElem = buttonElem.parentNode.parentNode
				.querySelector(buttonElem.dataset.type === 'minified' ? '.code-text-min' : '.code-text-orig');
			this.loadCode(Object.assign(JSON.parse(buttonElem.dataset.songdata),
				{ code: codeTextElem.innerText }));
		}
	}
	async onclickLibraryHeader(headerElem) {
		const containerElem = headerElem.nextElementSibling;
		const state = containerElem.classList;
		if(state.contains('loaded') || headerElem.parentNode.open) {
			return;
		}
		state.add('loaded');
		const waitElem = headerElem.querySelector('.loading-wait');
		waitElem.classList.remove('hidden');
		const libName = containerElem.id.replace('library-', '');
		const response = await fetch(this.pathJSON + libName + '.json');
		const { status } = response;
		if(status !== 200 && status !== 304) {
			state.remove('loaded');
			containerElem.innerHTML = `<div class="loading-error">Unable to load the library: ${ status } ${
				response.statusText }</div>`;
			waitElem.classList.add('hidden');
			return;
		}
		containerElem.innerHTML = libName !== 'all' ? '' :
			`<label><input type="checkbox" id="library-show-all"${
				this.settings.showAllSongs ? ' checked' : '' }> Show all songs</label>`;
		let libHTML = '';
		const libArr = await response.json();
		for(let i = 0, len = libArr.length; i < len; ++i) {
			libHTML += this.generateEntryHTML(libArr[i], libName);
		}
		if(!this.songs && libName === 'all') {
			this.cacheSongs(libArr);
		}
		containerElem.insertAdjacentHTML('beforeend', libHTML);
		waitElem.classList.add('hidden');
	}
	async onclickRemixLoadButton(elem) {
		const parentElem = elem.parentNode;
		if(parentElem.nextSibling) {
			parentElem.nextSibling.remove();
			elem.nextElementSibling.style.display = 'inline';
			return;
		}
		if(!this.songs) {
			elem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const response = await fetch(this.pathJSON + 'all.json');
			this.cacheSongs(await response.json());
			elem.lastChild.remove();
		}
		parentElem.insertAdjacentHTML('afterend',
			this.generateEntryHTML(this.songs.get(elem.dataset.hash), 'all'));
		elem.nextElementSibling.style.display = 'none';
	}
	oninputCounter(e) {
		if(e.key === 'Enter') {
			this.controlTime.blur();
			this.playbackToggle(true);
			return;
		}
		const { value } = this.controlTime;
		const byteSample = this.settings.isSeconds ? Math.round(value * this.songData.sampleRate) : value;
		this.setByteSample(byteSample);
		this.sendData({ byteSample });
	}
	onkeydownEditor(e) {
		if(e.key === 'Tab' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
			e.preventDefault();
			const editorElem = e.target;
			const { value, selectionStart } = editorElem;
			editorElem.value = value.slice(0, selectionStart) + '\t' + value.slice(editorElem.selectionEnd);
			editorElem.setSelectionRange(selectionStart + 1, selectionStart + 1);
			this.setFunction();
		}
	}
	onresizeWindow() {
		const isSmallWindow = window.innerWidth <= 768 || window.innerHeight <= 768;
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
		if(hash.startsWith('#4')) {
			const dataArr = Uint8Array.from(atob(hash.substring(2)), el => el.charCodeAt());
			try {
				songData = {
					mode: ['Bytebeat', 'Signed Bytebeat', 'Floatbeat', 'Funcbeat'][dataArr[0]],
					sampleRate: new DataView(dataArr.buffer).getFloat32(1, 1),
					code: inflateRaw(new Uint8Array(dataArr.buffer, 5), { to: 'string' })
				};
			} catch(err) {
				console.error(`Couldn't load data from url: ${ err }`);
			}
		} else if(hash.startsWith('#v3b64')) {
			try {
				songData = inflateRaw(
					Uint8Array.from(atob(hash.substring(6)), el => el.charCodeAt()), { to: 'string' });
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
		this.loadCode(songData || { code: this.editorValue }, false);
	}
	playbackStop() {
		this.playbackToggle(false, false);
		this.sendData({ isPlaying: false, resetTime: true });
	}
	playbackToggle(isPlaying, isSendData = true, speedIncrement = 0) {
		const isReverse = speedIncrement ? speedIncrement < 0 : this.playbackSpeed < 0;
		const buttonElem = isReverse ? this.controlPlayBackward : this.controlPlayForward;
		if(speedIncrement && buttonElem.getAttribute('disabled')) {
			return;
		}
		const multiplierElem = buttonElem.firstElementChild;
		const speed = speedIncrement ? +multiplierElem.textContent : 1;
		multiplierElem.classList.toggle('control-fast-multiplier-large', speed >= 8);
		const nextSpeed = speed === 64 ? 0 : speed * 2;
		this.setPlayButton(this.controlPlayBackward, isPlaying && isReverse ? nextSpeed : 1);
		this.setPlayButton(this.controlPlayForward, isPlaying && !isReverse ? nextSpeed : 1);
		if(speedIncrement || !isPlaying) {
			this.playbackSpeed = isPlaying ? speedIncrement * speed : Math.sign(this.playbackSpeed);
		}
		this.canvasContainer.title = isPlaying ? `Click to ${
			this.isRecording ? 'pause and stop recording' : 'pause' }` :
			`Click to play${ isReverse ? ' in reverse' : '' }`;
		this.canvasPlayButton.classList.toggle('canvas-play-backward', isReverse);
		this.canvasPlayButton.classList.toggle('canvas-play', !isPlaying);
		this.canvasPlayButton.classList.toggle('canvas-pause', isPlaying);
		if(isPlaying) {
			this.canvasPlayButton.classList.remove('canvas-initial');
			if(this.audioCtx.resume) {
				this.audioCtx.resume();
				this.requestAnimationFrame();
			}
		} else {
			if(this.isRecording) {
				this.isRecording = false;
				this.controlRecord.classList.remove('control-recording');
				this.controlRecord.title = 'Record to file';
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
		const { byteSample, drawBuffer, error } = data;
		if(typeof byteSample === 'number') {
			this.setCounterValue(byteSample);
			this.setByteSample(byteSample);
		}
		if(Array.isArray(drawBuffer)) {
			this.drawBuffer = this.drawBuffer.concat(drawBuffer);
			const limit = this.canvasWidth * (1 << this.settings.drawScale) - 1;
			if(this.drawBuffer.length > limit) {
				this.drawBuffer = this.drawBuffer.slice(-limit);
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
			if(data.updateUrl !== true) {
				this.setCodeSize(this.editorValue);
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
		this.isNeedClear = true;
		this.sendData({ resetTime: true, playbackSpeed: this.playbackSpeed });
	}
	saveSettings() {
		localStorage.settings = JSON.stringify(this.settings);
	}
	sendData(data) {
		this.audioWorkletNode.port.postMessage(data);
	}
	setByteSample(value) {
		this.byteSample = +value || 0;
		if(this.isNeedClear && value === 0) {
			this.isNeedClear = false;
			this.drawBuffer = [];
			this.clearCanvas();
			this.canvasTimeCursor.style.left = 0;
			if(!this.isPlaying) {
				this.canvasPlayButton.classList.add('canvas-initial');
			}
		}
	}
	setCodeStyle(value) {
		if(value === undefined) {
			if((value = this.settings.codeStyle) === undefined) {
				value = this.settings.codeStyle = this.defaultSettings.codeStyle;
				this.saveSettings();
			}
			this.editorContainer.dataset.theme = value;
			return;
		}
		this.editorContainer.dataset.theme = this.settings.codeStyle = value;
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
		this.controlColorStereo.value = value;
		switch(value) {
		// [Left, Right1, Right2]
		case 0: this.colorChannels = [0, 1, 2]; break;
		case 2: this.colorChannels = [2, 0, 1]; break;
		default: this.colorChannels = [1, 0, 2];
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
		this.controlColorDiagram.value = value;
		this.controlColorDiagramInfo.innerHTML = this.getColorTest(this.colorDiagram = this.getColor(value));
	}
	setColorTimeCursor(value) {
		if(value !== undefined) {
			this.settings.colorTimeCursor = value;
			this.saveSettings();
		} else if((value = this.settings.colorTimeCursor) === undefined) {
			value = this.settings.colorTimeCursor = this.defaultSettings.colorTimeCursor;
			this.saveSettings();
		}
		this.controlColorTimeCursor.value = value;
		this.canvasTimeCursor.style.borderLeft = '2px solid ' + value;
	}
	setColorWaveform(value) {
		if(value !== undefined) {
			this.settings.colorWaveform = value;
			this.saveSettings();
		} else if((value = this.settings.colorWaveform) === undefined) {
			value = this.settings.colorWaveform = this.defaultSettings.colorWaveform;
			this.saveSettings();
		}
		this.controlColorWaveform.value = value;
		this.controlColorWaveformInfo.innerHTML =
			this.getColorTest(this.colorWaveform = this.getColor(value));
	}
	setCounterUnits() {
		this.controlTimeUnits.textContent = this.settings.isSeconds ? 'sec' : 't';
		this.setCounterValue(this.byteSample);
	}
	setCodeSize(value) {
		this.controlCodeSize.textContent = this.formatBytes(new Blob([value]).size);
	}
	setCounterValue(value) {
		this.controlTime.value = this.settings.isSeconds ?
			(value / this.songData.sampleRate).toFixed(2) : value;
	}
	setDrawMode() {
		const drawMode = this.controlDrawMode.value;
		this.settings.drawMode = drawMode;
		this.saveSettings();
		this.sendData({ drawMode });
	}
	setFunction() {
		this.sendData({ setFunction: this.editorValue });
	}
	setPlaybackMode(mode) {
		this.songData.mode = mode;
		this.updateUrl();
		this.sendData({ mode });
	}
	setPlayButton(buttonElem, speed) {
		const isFast = speed !== 1;
		buttonElem.classList.toggle('control-fast', isFast);
		buttonElem.classList.toggle('control-play', !isFast);
		if(speed) {
			buttonElem.firstElementChild.textContent = speed;
			buttonElem.removeAttribute('disabled');
		} else {
			buttonElem.setAttribute('disabled', true);
			buttonElem.removeAttribute('title');
			return;
		}
		const direction = buttonElem === this.controlPlayForward ? 'forward' : 'reverse';
		buttonElem.title = `Play ${ isFast ? `fast ${ direction } x${ speed } speed` : direction }`;
	}
	setSampleRate(sampleRate, isSendData = true) {
		if(!sampleRate || !isFinite(sampleRate) ||
			// Float32 limit
			(sampleRate = Number(parseFloat(Math.abs(sampleRate)).toFixed(2))) > 3.4028234663852886E+38
		) {
			sampleRate = 8000;
		}
		switch(sampleRate) {
		case 8000:
		case 11025:
		case 16000:
		case 22050:
		case 32000:
		case 44100:
		case 48000: this.controlSampleRateSelect.value = sampleRate; break;
		default: this.controlSampleRateSelect.selectedIndex = -1;
		}
		this.controlSampleRate.value = this.songData.sampleRate = sampleRate;
		this.controlSampleRate.blur();
		this.controlSampleRateSelect.blur();
		this.toggleTimeCursor();
		if(isSendData) {
			this.updateUrl();
			this.sendData({
				sampleRate: this.songData.sampleRate,
				sampleRatio: this.songData.sampleRate / this.audioCtx.sampleRate
			});
		}
	}
	setScale(amount, buttonElem) {
		if(buttonElem?.getAttribute('disabled')) {
			return;
		}
		const scale = Math.max(this.settings.drawScale + amount, 0);
		this.settings.drawScale = scale;
		this.controlScale.innerHTML = !scale ? '1x' :
			scale < 7 ? `1/${ 2 ** scale }${ scale < 4 ? 'x' : '' }` :
			`<sub>2</sub>-${ scale }`;
		this.saveSettings();
		this.clearCanvas();
		this.toggleTimeCursor();
		if(this.settings.drawScale <= 0) {
			this.controlScaleDown.setAttribute('disabled', true);
		} else {
			this.controlScaleDown.removeAttribute('disabled');
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
			colorCursor = '#80c0ff';
			colorDiagram = '#0080ff';
		}
		this.setColorTimeCursor(colorCursor);
		this.setColorStereo(colorStereo);
		this.controlColorWaveformInfo.innerHTML = this.getColorTest(this.colorWaveform);
		this.setColorDiagram(this.controlColorDiagram.value = colorDiagram); // Contains this.saveSettings();
	}
	setVolume(isInit) {
		let volumeValue = NaN;
		if(isInit) {
			volumeValue = parseFloat(this.settings.volume);
		}
		if(isNaN(volumeValue)) {
			volumeValue = this.controlVolume.value / this.controlVolume.max;
		}
		this.controlVolume.value = this.settings.volume = volumeValue;
		this.controlVolume.title = `Volume: ${ (volumeValue * 100).toFixed(2) }%`;
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
		this.controlRecord.classList.add('control-recording');
		this.controlRecord.title = 'Pause and stop recording';
		this.audioRecorder.start();
		this.audioRecordChunks = [];
		this.playbackToggle(true);
	}
	toggleTimeCursor() {
		this.canvasTimeCursor.classList.toggle('hidden', !this.timeCursorEnabled);
	}
	updateUrl() {
		const code = this.editorValue;
		this.setCodeSize(code);
		const codeArr = deflateRaw(code);
		// First byte is mode, next 4 bytes is sampleRate, then the code
		const outputArr = new Uint8Array(5 + codeArr.length);
		outputArr[0] = ['Bytebeat', 'Signed Bytebeat', 'Floatbeat', 'Funcbeat'].indexOf(this.songData.mode);
		outputArr.set(new Uint8Array(new Float32Array([this.songData.sampleRate]).buffer), 1);
		outputArr.set(codeArr, 5);
		window.location.hash = '4' + btoa(String.fromCharCode.apply(null, outputArr)).replaceAll('=', '');
	}
}();
