import { formatBytes } from './utils.mjs';

export class Library {
	constructor() {
		this.cacheParentElem = null;
		this.cacheTextElem = null;
		this.pathFiles = './data/songs/';
		this.pathJSON = './data/json/';
		this.showAllSongs = false;
		this.songs = null;
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
	escapeHTML(text) {
		this.cacheTextElem.nodeValue = text;
		return this.cacheParentElem.innerHTML;
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
				notAllLib || this.showAllSongs ? ' open' : ''
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
		let tagsStr = ('#' + tags.join(' #')).replace(/\s?#(?:256|1k|big)/g, '');
		if(stereo) {
			tagsStr += (tagsStr ? ', ' : '') + '#stereo';
		}
		if(drawing) {
			songObj.drawMode = drawing.mode;
			songObj.scale = drawing.scale;
			tagsStr += (tagsStr ? ', ' : '') + '#drawing';
		}
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
				fileMin ? ` data-code-file="${ hash }.js"` : '' }>min ${ formatBytes(codeMinLen) }</button>`;
		}
		if(code || fileOrig) {
			str += `<button class="code-button code-load" data-type="original"${ sData }${
				fileOrig ? `data-code-file="${ hash }.js"` : '' }>orig ${ formatBytes(codeLen) }</button>`;
		}
		if(fileForm) {
			str += `<button class="code-button code-load" data-type="formatted"${ sData } data-code-file="${
				hash }.js">format ${ formatBytes(codeFormLen) }</button>`;
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
	initElements() {
		this.cacheParentElem = document.createElement('div');
		this.cacheParentElem.appendChild(this.cacheTextElem = document.createTextNode(''));
	}
	async onclickCodeLoadButton(buttonElem) {
		if(buttonElem.dataset.codeFile) {
			buttonElem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const waitElem = buttonElem.lastChild;
			const response = await fetch(this.pathFiles + buttonElem.dataset.type +
				'/' + buttonElem.dataset.codeFile);
			globalThis.bytebeat.loadCode(Object.assign(JSON.parse(buttonElem.dataset.songdata),
				{ code: await response.text() }));
			waitElem.remove();
		} else {
			const codeTextElem = buttonElem.parentNode.parentNode
				.querySelector(buttonElem.dataset.type === 'minified' ? '.code-text-min' : '.code-text-orig');
			globalThis.bytebeat.loadCode(Object.assign(JSON.parse(buttonElem.dataset.songdata),
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
				this.showAllSongs ? ' checked' : '' }> Show all songs</label>`;
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
	toggleAll(elem, isChecked) {
		this.showAllSongs = isChecked;
		elem.parentNode.parentNode.querySelectorAll('.songs-block').forEach(
			node => node.toggleAttribute('open', isChecked));
	}
}
