/* eslint indent: ["error", "tab", { "outerIIFEBody": 0 }] */

(function() {
let cachedElemParent, cachedTextNode;
function escapeHTML(text) {
	cachedTextNode.nodeValue = text;
	return cachedElemParent.innerHTML;
}

function parseEntry(entryObj) {
	if(Array.isArray(entryObj.code)) {
		entryObj.code = entryObj.code.join('\n');
	}
	return entryObj;
}

function stripEntryToSong({ sampleRate, mode }) {
	return { sampleRate, mode };
}

function createEntryElem(entryObj) {
	let entry = '';
	if(entryObj.description) {
		entry += !entryObj.url ? entryObj.description :
			`<a href="${ entryObj.url }" target="_blank">${ entryObj.description }</a>`;
	}
	if(entryObj.author) {
		let authorsList = '';
		const authorsArr = Array.isArray(entryObj.author) ? entryObj.author : [entryObj.author];
		for(let i = 0, len = authorsArr.length; i < len; ++i) {
			const author = authorsArr[i];
			if(typeof author === 'string') {
				authorsList += entryObj.description || !entryObj.url ? author :
					`<a href="${ entryObj.url }" target="_blank">${ author }</a>`;
			} else {
				authorsList += `<a href="${ author[1] }" target="_blank">${ author[0] }</a>`;
			}
			if(i < len - 1) {
				authorsList += ', ';
			}
		}
		entry += `<span>${ entryObj.description ? ` (by ${ authorsList })` : `by ${ authorsList }` }</span>`;
	}
	if(entryObj.sampleRate) {
		entry += ` <span class="code-samplerate">${
			entryObj.sampleRate.substring(0, entryObj.sampleRate.length - 3) }kHz</span>`;
	}
	if(entryObj.mode) {
		entry += ` <span class="code-samplerate">${ entryObj.mode }</span>`;
	}
	let starred = '';
	if(entryObj.starred) {
		starred = ['star-white', 'star-yellow'][entryObj.starred - 1];
	}
	if(entryObj.codeFile) {
		entry += ` <a class="code-load" data-songdata='${
			JSON.stringify(stripEntryToSong(entryObj)) }' data-code-file="${
			entryObj.codeFile }" title="Click to load the pretty code">► pretty code</a>`;
	}
	if(entry.length) {
		entry += '<br>\n';
	}
	if(entryObj.code) {
		entry += `<code data-songdata='${
			JSON.stringify(stripEntryToSong(entryObj)) }'>${ escapeHTML(entryObj.code) }</code>
			<span class="code-length">${ entryObj.code.length }c</span>`;
	}
	if(entryObj.children) {
		let children = '';
		for(let i = 0, len = entryObj.children.length; i < len; ++i) {
			children += createEntryElem(parseEntry(entryObj.children[i]));
		}
		entry += `<div class="list-block list-dependant">${ children }</div>`;
	}
	return `<div class="${ entryObj.code || entryObj.codeFile || entryObj.children ?
		'list-entry' : 'list-text' } ${ starred || '' }">${ entry }</div>`;
}

function addPlaylist(obj, id) {
	let playlist = '';
	const playlistArr = obj.playlists[id];
	for(let i = 0, len = playlistArr.length; i < len; ++i) {
		playlist += createEntryElem(parseEntry(playlistArr[i]));
	}
	document.getElementById(`library-${ id }`).insertAdjacentHTML('beforeend',
		`<div class="list-block list-main">${ playlist }</div>`);
}

document.addEventListener('DOMContentLoaded', () => {
	cachedElemParent = document.createElement('div');
	cachedTextNode = document.createTextNode('');
	cachedElemParent.appendChild(cachedTextNode);
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState === 4 && xhr.status === 200) {
			const obj = JSON.parse(xhr.responseText);
			for(const p in obj.playlists) {
				addPlaylist(obj, p);
			}
		}
	};
	xhr.open('GET', 'playlists.json', true);
	xhr.send(null);
});
}());
