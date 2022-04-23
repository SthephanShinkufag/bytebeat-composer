let cachedElemParent, cachedTextNode;

function escapeHTML(text) {
	cachedTextNode.nodeValue = text;
	return cachedElemParent.innerHTML;
}

function createEntryElem({
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
		entry += ` <span class="code-samplerate">${ (sampleRate / 1000) | 0 }kHz</span>`;
	}
	if(mode) {
		entry += ` <span class="code-samplerate">${ mode }</span>`;
	}
	const songData = codeOriginal || codeMinified || file ? JSON.stringify({ sampleRate, mode }) : '';
	if(file) {
		if(fileFormatted) {
			entry += `<a class="code-button code-load code-load-formatted" data-songdata='${ songData
			}' data-code-file="${ file }" title="Click to load and play the formatted code">► formatted</a>`;
		}
		if(fileOriginal) {
			entry += `<a class="code-button code-load code-load-original" data-songdata='${ songData
			}' data-code-file="${ file }" title="Click to load and play the original code">► original</a>`;
		}
		if(fileMinified) {
			entry += `<a class="code-button code-load code-load-minified" data-songdata='${ songData
			}' data-code-file="${ file }" title="Click to load and play the minified code">► minified</a>`;
		}
	}
	if(codeOriginal) {
		if(Array.isArray(codeOriginal)) {
			codeOriginal = codeOriginal.join('\r\n');
		}
		const btn = codeMinified ? '<a class="code-button code-toggle code-toggle-minified"' +
			' title="Original version shown. Click to view the minified version.">original</a>' : '';
		entry += `<div class="code-original ${ codeMinified ? 'disabled' : '' }">
			<code data-songdata='${ songData }'>${ escapeHTML(codeOriginal) }</code>
			<span class="code-length" title="Size in characters">${ codeOriginal.length }c</span>${ btn }
		</div>`;
	}
	if(codeMinified) {
		const btn = '<a class="code-button code-toggle code-toggle-original" title="Minified version shown.' +
			` ${ codeOriginal ? 'Click to view the original version."' :
			'No original version." disabled="1"' }>minified</a>`;
		entry += `<div class="code-minified">
			<code data-songdata='${ songData }'>${ escapeHTML(codeMinified) }</code>
			<span class="code-length" title="Size in characters">${ codeMinified.length }c</span>${ btn }
		</div>`;
	}
	if(children) {
		let childrenStr = '';
		for(let i = 0, len = children.length; i < len; ++i) {
			childrenStr += createEntryElem(children[i]);
		}
		entry += `<div class="entry-children">${ childrenStr }</div>`;
	}
	return `<div class="${ codeOriginal || codeMinified || file || children ? 'entry' : 'entry-text' }${
		starred ? ' ' + ['star-white', 'star-yellow'][starred - 1] : '' }">${ entry }</div>`;
}

function addPlaylists(data) {
	cachedElemParent = document.createElement('div');
	cachedTextNode = document.createTextNode('');
	cachedElemParent.appendChild(cachedTextNode);
	for(const id in data) {
		if(Object.prototype.hasOwnProperty.call(data, id)) {
			let playlist = '';
			const playlistArr = data[id];
			for(let i = 0, len = playlistArr.length; i < len; ++i) {
				playlist += `<div class="entry-top">${ createEntryElem(playlistArr[i]) }</div>`;
			}
			document.getElementById(`library-${ id }`).insertAdjacentHTML('beforeend', playlist);
		}
	}
}

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
	if(xhr.readyState === 4 && xhr.status === 200) {
		addPlaylists(JSON.parse(xhr.responseText));
	}
};
xhr.open('GET', './library/library.json', true);
xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
xhr.send(null);
