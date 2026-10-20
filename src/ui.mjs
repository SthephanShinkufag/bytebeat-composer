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
		this.controlLag = null;
		this.controlPlaybackMode = null;
		this.controlPlayBackward = null;
		this.controlPlayForward = null;
		this.controlRecord = null;
		this.controlSampleRate = null;
		this.controlSampleRateSelect = null;
		this.controlScale = null;
		this.controlScaleDown = null;
		this.controlScaleUp = null;
		this.controlSRDivisor = null;
		this.controlSRDivisorUp = null;
		this.controlSRDivisorDown = null;
		this.controlThemeStyle = null;
		this.controlTime = null;
		this.controlTimeUnits = null;
		this.controlVolume = null;
		this.mainElem = null;
	}

	// Copy song link into clipboard
	copyLink() {
		navigator.clipboard.writeText(window.location);
	}

	// Toggle expand player mode
	expandEditor() {
		this.containerFixed.classList.toggle('container-expanded');
	}

	// Get active filter selectors and text search value
	getLibraryFilters() {
		const getSelectedFilter = id =>
			document.querySelector(`.filter-container[data-type="${
				id }"] > .filter-selected`)?.textContent.trim() || 'all';

		// Assemble an array for the tags, since multiple tags can be selected
		const selectedTags = [];
		document.querySelectorAll('.filter-container[data-type="tags"] > .filter-selected')
			.forEach(buttonElem => selectedTags.push(buttonElem.textContent.trim()));

		return {
			sorting: getSelectedFilter('sorting'),
			size: getSelectedFilter('size'),
			mode: getSelectedFilter('mode'),
			tags: selectedTags,
			// Get the search text
			query: document.getElementById('library-search-input').value.toLowerCase().trim() || ''
		};
	}

	// Cache UI elements
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
		this.controlLag = document.getElementById('control-lag');
		this.controlPlaybackMode = document.getElementById('control-mode');
		this.controlPlayBackward = document.getElementById('control-play-backward');
		this.controlPlayForward = document.getElementById('control-play-forward');
		this.controlRecord = document.getElementById('control-rec');
		this.controlSampleRate = document.getElementById('control-samplerate');
		this.controlSampleRateSelect = document.getElementById('control-samplerate-select');
		this.controlScale = document.getElementById('control-scale');
		this.controlScaleDown = document.getElementById('control-scaledown');
		this.controlScaleUp = document.getElementById('control-scaleup');
		this.controlSRDivisor = document.getElementById('control-srdivisor');
		this.controlSRDivisorUp = document.getElementById('control-srdivisor-up');
		this.controlSRDivisorDown = document.getElementById('control-srdivisor-down');
		this.controlThemeStyle = document.getElementById('control-theme-style');
		this.controlTime = document.getElementById('control-counter');
		this.controlTimeUnits = document.getElementById('control-counter-units');
		this.controlVolume = document.getElementById('control-volume');
		this.downloader = document.getElementById('downloader');
		this.mainElem = document.getElementById('content');
	}

	// Show corresponding article when article navigation button is clicked
	onclickArticleNavButton(buttonElem) {
		const id = buttonElem.dataset.target;
		document.querySelectorAll('.article-button').forEach(el =>
			el.classList.toggle('article-button-selected', el === buttonElem));
		document.querySelectorAll('.article-container').forEach(el =>
			el.classList.toggle('hidden', el.id !== id));
	}

	// Toggle the selected state of filter buttons when clicked
	onclickFilterButton(buttonElem) {
		const parentElem = buttonElem.parentNode;
		if(parentElem.dataset.type === 'tags') {
			buttonElem.classList.toggle('filter-selected');
		} else {
			parentElem.querySelectorAll('.filter-button').forEach(el =>
				el.classList.toggle('filter-selected', el === buttonElem));
		}
	}

	// Show formatted bytes value on Code Size indicator
	setCodeSize(value) {
		this.controlCodeSize.textContent = formatBytes(new Blob([value]).size);
	}

	// Update zoom scale controls
	setControlScale(isDisableDown, isDisableUp, value) {
		this.controlScale.innerHTML = value;
		if(isDisableDown) {
			this.controlScaleDown.setAttribute('disabled', true);
		} else {
			this.controlScaleDown.removeAttribute('disabled');
		}
		if(isDisableUp) {
			this.controlScaleUp.setAttribute('disabled', true);
		} else {
			this.controlScaleUp.removeAttribute('disabled');
		}
	}

	// Set active library filters and text search value
	setLibraryFilters(filters) {
		document.querySelectorAll('.filter-container > .filter-button').forEach(el => {
			const { type } = el.parentElement.dataset;
			el.classList.toggle('filter-selected', type === 'tags' ?
				filters.tags.includes(el.textContent) : el.textContent === filters[type]);
		});
		document.getElementById('library-search-input').value = filters.query;
	}

	// Update playback controls
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

	// Toggle the "open" attribute of all songs blocks when the "Expand all songs" checkbox is clicked
	toggleExpandSongs(showAllSongs) {
		document.querySelectorAll('#library-songs > .songs-block').forEach(node =>
			node.toggleAttribute('open', showAllSongs));
	}
}
