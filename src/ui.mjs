import { formatBytes } from './utils.mjs';

export class UI {
	constructor() {
		this.containerFixed = null;
		this.containerScroll = null;
		this.controlCodeSize = null;
		this.controlCodeStyle = null;
		this.controlColorDiagram = null;
		this.controlColorDiagramInfo = null;
		this.controlColorStereo = null;
		this.controlColorTimeCursor = null;
		this.controlColorWaveform = null;
		this.controlColorWaveformInfo = null;
		this.controlDrawMode = null;
		this.controlPlaybackMode = null;
		this.controlPlayBackward = null;
		this.controlPlayForward = null;
		this.controlRecord = null;
		this.controlSampleRate = null;
		this.controlSampleRateSelect = null;
		this.controlScale = null;
		this.controlScaleDown = null;
		this.controlThemeStyle = null;
		this.controlTime = null;
		this.controlTimeUnits = null;
		this.controlVolume = null;
		this.mainElem = null;
	}
	copyLink() {
		navigator.clipboard.writeText(window.location);
	}
	expandEditor() {
		this.containerFixed.classList.toggle('container-expanded');
	}
	initElements() {
		this.containerFixed = document.getElementById('container-fixed');
		this.containerScroll = document.getElementById('container-scroll');
		this.controlCodeSize = document.getElementById('control-codesize');
		this.controlCodeStyle = document.getElementById('control-code-style');
		this.controlColorDiagram = document.getElementById('control-color-diagram');
		this.controlColorDiagramInfo = document.getElementById('control-color-diagram-info');
		this.controlColorStereo = document.getElementById('control-color-stereo');
		this.controlColorTimeCursor = document.getElementById('control-color-timecursor');
		this.controlColorWaveform = document.getElementById('control-color-waveform');
		this.controlColorWaveformInfo = document.getElementById('control-color-waveform-info');
		this.controlDrawMode = document.getElementById('control-drawmode');
		this.controlPlaybackMode = document.getElementById('control-mode');
		this.controlPlayBackward = document.getElementById('control-play-backward');
		this.controlPlayForward = document.getElementById('control-play-forward');
		this.controlRecord = document.getElementById('control-rec');
		this.controlSampleRate = document.getElementById('control-samplerate');
		this.controlSampleRateSelect = document.getElementById('control-samplerate-select');
		this.controlScale = document.getElementById('control-scale');
		this.controlScaleDown = document.getElementById('control-scaledown');
		this.controlTime = document.getElementById('control-counter');
		this.controlTimeUnits = document.getElementById('control-counter-units');
		this.controlThemeStyle = document.getElementById('control-theme-style');
		this.controlVolume = document.getElementById('control-volume');
		this.downloader = document.getElementById('downloader');
		this.mainElem = document.getElementById('content');
	}
	setCodeSize(value) {
		this.controlCodeSize.textContent = formatBytes(new Blob([value]).size);
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
}
