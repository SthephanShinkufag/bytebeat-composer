/* eslint indent: ["error", "tab", { "outerIIFEBody": 0 }] */

(function() {
let cachedElemParent, cachedTextNode;

function escapeHTML(text) {
	cachedTextNode.nodeValue = text;
	return cachedElemParent.innerHTML;
}

function createEntryElem({
	author,
	children,
	code,
	codeFile,
	date,
	description,
	mode,
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
	if(date) {
		entry += ` <span class="code-date">(${ date })</span>`;
	}
	if(sampleRate) {
		entry += ` <span class="code-samplerate">${
			sampleRate.substring(0, sampleRate.length - 3) }kHz</span>`;
	}
	if(mode) {
		entry += ` <span class="code-samplerate">${ mode }</span>`;
	}
	let starClass = '';
	if(starred) {
		starClass = ' ' + ['star-white', 'star-yellow'][starred - 1];
	}
	const songData = code || codeFile ? JSON.stringify({ sampleRate, mode }) : '';
	if(codeFile) {
		entry += ` <a class="code-load" data-songdata='${ songData }' data-code-file="${
			codeFile }" title="Click to load the pretty code">► pretty code</a>`;
	}
	if(entry.length) {
		entry += '<br>\n';
	}
	if(code) {
		entry += `<code data-songdata='${ songData }'>${
			escapeHTML(code) }</code> <span class="code-length">${ code.length }c</span>`;
	}
	if(children) {
		let childrenStr = '';
		for(let i = 0, len = children.length; i < len; ++i) {
			childrenStr += createEntryElem(children[i]);
		}
		entry += `<div class="entry-children">${ childrenStr }</div>`;
	}
	return `<div class="${ code || codeFile || children ? 'entry' : 'entry-text' }${ starClass || '' }">${
		entry }</div>`;
}

function addPlaylists(data) {
	cachedElemParent = document.createElement('div');
	cachedTextNode = document.createTextNode('');
	cachedElemParent.appendChild(cachedTextNode);
	for(const id in data) {
		let playlist = '';
		const playlistArr = data[id];
		for(let i = 0, len = playlistArr.length; i < len; ++i) {
			playlist += `<div class="entry-top">${ createEntryElem(playlistArr[i]) }</div>`;
		}
		document.getElementById(`library-${ id }`).insertAdjacentHTML('beforeend', playlist);
	}
}

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
	if(xhr.readyState === 4 && xhr.status === 200) {
		const data = JSON.parse(xhr.responseText);
		if(document.readyState !== 'loading') {
			addPlaylists(data);
			return;
		}
		document.addEventListener('DOMContentLoaded', () => addPlaylists(data));
	}
};
xhr.open('GET', 'playlists.json', true);
xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
xhr.send(null);
}());
