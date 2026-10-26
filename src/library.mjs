import { ungzip } from 'pako';
import { formatBytes } from './utils.mjs';

export class Library {
	constructor() {
		this.currentRenderId = 0; // ID of the currently active library interface build
		this.filters = { sorting: 'author', size: 'all', mode: 'all', tags: [], query: '' };
		this.isAdmin = document.cookie.match(/(?:^|; )bytebeat_access=([^;]*)/)?.[1] || ''; // Admin check
		this.pathFiles = './data/songs/';
		this.pathLibrary = './data/library/';
		this.showAllSongs = false;
		this.songs = null;
	}

	// Escape HTML special characters to prevent XSS attacks
	get escapeHTML() {
		const parent = document.createElement('div');
		const textNode = document.createTextNode('');
		parent.appendChild(textNode);
		const value = text => {
			textNode.nodeValue = text;
			return parent.innerHTML;
		};
		Object.defineProperty(this, 'escapeHTML', { value, configurable: true });
		return value;
	}

	// Cache the songs in a Map for quick access by hash
	cacheSongs(libArr) {
		this.songs = new Map();
		for(let i = 0, iLen = libArr.length; i < iLen; ++i) {
			const { author, songs } = libArr[i];
			if(songs) {
				for(let j = 0, jLen = songs.length; j < jLen; ++j) {
					const song = songs[j];
					song.author = author;
					this.songs.set(song.hash, song);
				}
			}
		}
	}

	// Generate the HTML for a song entry, including its details and buttons
	generateEntryHTML(entry, libName) {
		// Generate an author block (containing an array of songs)
		if(entry.songs) {
			const { author, songs } = entry;
			const len = songs.length;
			const maxVisible = 10;
			const needToHide = len - maxVisible;
			const songsHtmlParts = [];
			if(libName !== 'all' && len > maxVisible + 3) {
				// If there are more songs than the maximum, wrap the extra songs in a <details> element
				for(let i = 0; i < len; ++i) {
					if(i === maxVisible) {
						songsHtmlParts.push(`<details><summary class="code-button songs-toggle">${
							needToHide } more bytebeats</summary>`);
					}
					songsHtmlParts.push(this.generateEntryHTML(songs[i], libName));
				}
				songsHtmlParts.push('</details>');
			} else {
				// Generate the HTML for all songs
				for(let i = 0; i < len; ++i) {
					songsHtmlParts.push(this.generateEntryHTML(songs[i], libName));
				}
			}
			// Return the HTML for the author block, including the list of songs
			return `<details class="songs-block"${ this.showAllSongs ? ' open' : '' }>` +
				`<summary class="songs-header"> <b>${ author }</b>` +
				`${ author === 'SthephanShi' ?
					'<small style="color: #ff0;">dollchan creator</small>' : '' }` +
				`${ len ? `<small> ${ len } song${ len > 1 ? 's' : '' }</small>` : '' }</summary>` +
				`<div class="songs">${ songsHtmlParts.join('') }</div></details>`;
		}

		// Generate a specific song
		const {
			author, code, codeMin, coverName, coverUrl, date, description, drawing, fileMin, fileOrig, hash,
			mode, name, remix, sampleRate, tags, url
		} = entry;
		let str = '';
		const isUrlArray = Array.isArray(url);
		const mainUrl = isUrlArray ? url[0] : url;

		// Display the name of the song, either as a link if a URL is available or as bold text
		if(name) {
			str += mainUrl ? `<a href="${ mainUrl }" target="_blank">${ name }</a>` : name;
		}

		// Display the author of the song, either as a link if a URL is available or as bold text
		if(author) {
			str += ` <span>by ${ name || !mainUrl ? `<b>${ author }</b>` :
				`<a href="${ mainUrl }" target="_blank">${ author }</a>` }</span>`;
		}

		// Add [link, link2, ...] if no name and author
		if(mainUrl && (isUrlArray || (!name && !author))) {
			if(isUrlArray) {
				const urlsArr = [];
				// If the first link is already used for name/author, output the remaining
				for(let i = name ? 1 : 0, len = url.length; i < len; ++i) {
					urlsArr.push(`<a href="${ url[i] }" target="_blank">link${ i + 1 }</a>`);
				}
				if(urlsArr.length) {
					str += ` [${ urlsArr.join(', ') }]`;
				}
			} else {
				str += ` [<a href="${ url }" target="_blank">link</a>]`;
			}
		}

		// Display the date, mode, and sample rate of the song
		const songObj = { sampleRate, mode };
		str += ' <span class="code-info">';
		if(date) {
			str += date;
		}
		if(mode) {
			str += ' ' + mode;
		}
		str += ` ${ sampleRate }Hz`;

		// Add tags for the song
		const tagsArr = [];
		if(entry.stereo) {
			tagsArr.push('<span class="tag-stereo">stereo</span>');
		}
		if(drawing) {
			songObj.drawMode = drawing.mode;
			songObj.scale = drawing.scale;
			tagsArr.push('<span class="tag-drawing">drawing</span>');
		}
		if(tags && Array.isArray(tags)) {
			for(let i = 0, len = tags.length; i < len; ++i) {
				switch(tags[i]) {
				case '1k':
				case '256':
				case 'big': continue;
				case 'c':
					tagsArr.push('<span class="tag-c">c</span>');
					continue;
				case 'console':
					tagsArr.push('<span class="tag-console">console</span>');
					continue;
				case 'port':
					tagsArr.push('<span class="tag-port">port</span>');
					continue;
				case 'sample':
					tagsArr.push('<span class="tag-sample">sample</span>');
					continue;
				case 'slow':
					tagsArr.push('<span class="tag-slow">slow</span>');
					continue;
				}
				tagsArr.push(`<span class="tag-custom">${ tags[i] }</span>`);
			}
		}
		if(tagsArr.length) {
			str += ` <span class="code-tags">${ tagsArr.join('') }</span>`;
		}
		str += '</span>';

		// Add admin controls for editing and viewing the hash of the song
		if(this.isAdmin) {
			str += ` <a href="bytebeat.php?song_edit_call&hash=${ hash }" target="_blank">Edit</a> / ` +
				`<a class="song-hash" href="#" data-hash="${ hash }">Hash</a>`;
		}

		// Add the description of the song
		if(description) {
			str += `<div class="code-description">${ description }</div>`;
		}

		// Add cover information for the song
		if(coverName) {
			str += `<div class="code-cover">cover of ${ coverUrl ?
				`<a href="${ coverUrl }" target="_blank">${ coverName }</a>` : `"${ coverName }"` }</div>`;
		}

		// Add information if song is remix (parent song preview)
		if(remix && Array.isArray(remix)) {
			for(let i = 0, len = remix.length; i < len; ++i) {
				const { hash: rHash, url: rUrl, name: rName, author: rAuthor } = remix[i];
				const mainRemixUrl = Array.isArray(rUrl) ? rUrl[0] : rUrl;
				str += '<div class="code-remix"><div class="code-remix-parent">' +
					`<button class="code-button code-remix-load" data-hash="${
						rHash }" title="Show detailed source information">▷</button>` +
					` remix of <span class="code-remix-preview">${
						mainRemixUrl ?
							`<a href="${ mainRemixUrl }" target="_blank">${ rName || rAuthor }</a>` :
							`"${ rName }"` }` +
					`${ rName && rAuthor ? ' by ' + rAuthor : '' }<span></div></div>`;
			}
		}

		// Add buttons for loading the song in different formats (minified, original, formatted)
		str += `<div class="code-buttons" data-hash="${
			hash }" data-songdata='${ JSON.stringify(songObj) }'>`;
		// Min button: if the code is short, retrieve from codeMin. Otherwise, load from the network.
		if(entry.codeMinLen || fileMin) {
			str += `<button class="code-button code-load" data-type="minified"${
				fileMin ? ' data-has-file="1"' : '' }${ codeMin ? ' data-has-local="1"' : '' }>` +
				`Min <small class="code-size">${ formatBytes(entry.codeMinLen) }</small></button>`;
		}
		// Orig button: similarly, if it's a short code, write to data-raw-code
		if(entry.codeLen || fileOrig) {
			str += `<button class="code-button code-load" data-type="original"${
				fileOrig ? ' data-has-file="1"' : '' }${ code ? ' data-has-local="1"' : '' }>` +
				`Orig <small class="code-size">${ formatBytes(entry.codeLen) }</small></button>`;
		}
		// Format button
		if(entry.fileForm) {
			str += '<button class="code-button code-load" data-type="formatted" data-has-file="1">' +
				`Format <small class="code-size">${ formatBytes(entry.codeFormLen) }</small></button>`;
		}
		str += '</div>';

		// Rendering the text preview (showing what is available)
		const textPreview = codeMin || code || entry.codeText || '';
		if(textPreview) {
			// If the song is large (fileMin/fileOrig) or a flag has been received from the database
			const isTruncated = fileMin || fileOrig || entry.isTruncated;
			str += `<button class="code-text${ isTruncated ? ' truncated' : '' }">${
				this.escapeHTML(textPreview) }</button>`;
		}

		return `<div class="entry" data-hash="${ hash }">${ str }</div>`;
	}

	// Load the code of a song when the min/orig/format button is clicked
	async onclickCodeLoadButton(buttonElem) {
		let code;
		const { hash, songdata } = buttonElem.parentNode.dataset;
		const { hasFile, hasLocal, type } = buttonElem.dataset;
		// The full file is located on the server (network download)
		if(hasFile === '1') {
			buttonElem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const waitElem = buttonElem.lastChild;
			// A network request for a specific folder (minified / original / formatted)
			const result = await fetch(this.pathFiles + type + '/' + hash + '.js');
			code = await result.text();
			waitElem.remove();

		// The code is small and stored directly within the button (instant launch)
		} else if(hasLocal === '1') {
			// Get the song code from cash
			const songCached = this.songs.get(hash);
			code = type === 'minified' ? songCached.codeMin : songCached.code;
		}
		// Copy the code property into the songdata object then play the song form it
		globalThis.bytebeat.loadCode(Object.assign(JSON.parse(songdata), { code }));
	}

	// Show the remix source song when the remix info button is clicked
	async onclickRemixLoadButton(buttonElem) {
		// If the block is already open, close it (remove the adjacent element containing the song)
		const parentElem = buttonElem.parentNode;
		if(parentElem.nextSibling?.classList.contains('entry')) {
			parentElem.nextSibling.remove();
			// Show the short preview
			parentElem.querySelector('.code-remix-preview').style.display = 'inline';
			buttonElem.textContent = '▷';
			return;
		}

		// If the library has not yet been downloaded to memory, download it once
		if(!this.songs) {
			buttonElem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const response = await fetch(this.pathLibrary + 'all.gz');
			this.cacheSongs(JSON.parse(ungzip(await response.arrayBuffer(), { to: 'string' })));
			buttonElem.lastChild.remove();
		}

		// Search for parent song
		const songHash = buttonElem.dataset.hash;
		const parentSongData = this.songs.get(songHash);
		if(!parentSongData) {
			console.error(`Song with hash ${ songHash } not found in library.`);
			return;
		}

		// Insert the generated HTML for the parent song immediately below the remix block
		parentElem.insertAdjacentHTML('afterend', this.generateEntryHTML(parentSongData, 'all'));

		// Hide the short preview
		if(parentElem.nextElementSibling) {
			parentElem.querySelector('.code-remix-preview').style.display = 'none';
			buttonElem.textContent = '▽';
		}
	}

	// Loading and filtering the list of songs
	async showSongs() {
		const containerElem = document.getElementById('library-songs');

		// Generating a unique ID for this click
		this.currentRenderId++;
		const renderId = this.currentRenderId;

		// If the library is not in memory at all, first download its "all.gz" file once.
		if(!this.songs) {
			// Show the loading wait icon
			containerElem.innerHTML = '<div class="library-loading-wait">' +
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg></div>';
			const waitElem = containerElem.lastChild;

			// Load the library file
			const response = await fetch(this.pathLibrary + 'all.gz');
			const { status } = response;

			// Cancellation check: If the user clicks again while the file is downloading, cancel that stream
			if(renderId !== this.currentRenderId) {
				return;
			}

			// Loading error check
			if(status !== 200 && status !== 304) {
				containerElem.innerHTML = `<div class="loading-error entry">Unable to load the library: ${
					status } ${ response.statusText }</div>`;
				waitElem.remove();
				return;
			}

			// Get the unpacked JSON from the library file
			const libArr = JSON.parse(ungzip(await response.arrayBuffer(), { to: 'string' }));
			// Cache the songs for future use
			this.cacheSongs(libArr);
			waitElem.remove();
		}

		// Cancellation check: In case the user clicked right before caching finished
		if(renderId !== this.currentRenderId) {
			return;
		}

		// Get the flat array of songs from cache (this.songs)
		let filteredSongs = Array.from(this.songs.values());

		// Filter by size
		const fSize = this.filters.size;
		if(fSize !== 'all') {
			filteredSongs = filteredSongs.filter(song => {
				const len = song.codeLen || song.codeMinLen || song.codeFormLen || 0;
				return fSize === '<256' ? len <= 256 :
					fSize === '<1k' ? len > 256 && len <= 1024 :
					fSize === 'big' ? len > 1024 : true;
			});
		}

		// Filter by mode
		const fMode = this.filters.mode;
		if(fMode !== 'all') {
			filteredSongs = filteredSongs.filter(song => {
				const sMode = song.mode;
				return fMode === 'Bytebeat' ? !sMode : // mode === 'Bytebeat' is omitted to save JSON space
					fMode === 'all' ? true : fMode === sMode;
			});
		}

		// Filter by tags and independent drawing and stereo toggles
		let fTags = this.filters.tags;
		if(fTags.includes('drawing')) {
			filteredSongs = filteredSongs.filter(song => !!song.drawing);
			// Exclude "drawing" from the array of text tags to avoid searching for it in the song.tags array
			fTags = fTags.filter(t => t !== 'drawing');
		}
		if(fTags.includes('stereo')) {
			filteredSongs = filteredSongs.filter(song => song.stereo === 1);
			fTags = fTags.filter(t => t !== 'stereo');
		}
		// Filter by the remaining text tags
		if(fTags.length > 0) {
			filteredSongs = filteredSongs.filter(song => {
				if(song.tags && Array.isArray(song.tags)) {
					return fTags.every(t => song.tags.includes(t));
				}
				return false;
			});
		}

		// Filtering by search query
		const fQuery = this.filters.query;
		if(fQuery !== '') {
			filteredSongs = filteredSongs.filter(song => {
				// Convert all fields to lowercase for case-insensitive searching
				const name = (song.name || '').toLowerCase();
				const author = (song.author || '').toLowerCase();
				const description = (song.description || '').toLowerCase();

				// Check if there is a match in at least one of the fields
				return name.includes(fQuery) || author.includes(fQuery) || description.includes(fQuery);
			});
		}

		// Display the number of found songs in the counter
		const songsCount = filteredSongs.length;
		const counterElem = document.getElementById('library-counter');
		if(counterElem) {
			// Collect all unique authors from the filtered songs
			const uniqueAuthors = new Set();
			for(let i = 0; i < songsCount; ++i) {
				// If there is no author, we’ll record 'Unknown' so that it also counts as one unique block
				uniqueAuthors.add(filteredSongs[i].author || 'Unknown');
			}
			const authorsCount = uniqueAuthors.size;
			const songsText = `${ songsCount } song${ songsCount !== 1 ? 's' : '' }`;
			const authorsText = `${ authorsCount } author${ authorsCount !== 1 ? 's' : '' }`;
			counterElem.textContent = `Found: ${ songsText } by ${ authorsText }`;
			counterElem.style.display = '';
		}

		// Display/hide the "Expand all songs" checkbox
		const isSortByDate = this.filters.sorting === 'date';
		const expandElem = document.getElementById('library-expand-container');
		if(expandElem) {
			expandElem.style.display = !songsCount || isSortByDate ? 'none' : '';
			document.getElementById('library-expand-checkbox').toggleAttribute('checked', this.showAllSongs);
		}

		// Sorting
		if(isSortByDate) {
			// Sort by date: flat list without grouping by author
			filteredSongs.sort((a, b) => {
				const dateA = a.date || '';
				const dateB = b.date || '';
				if(dateA !== dateB) {
					return dateB.localeCompare(dateA); // New songs to the top
				}
				return (a.author || '').localeCompare(b.author || '');
			});
		} else {
			// Sort by author: classic behavior with <details> blocks
			filteredSongs.sort((a, b) => {
				const authA = a.author || '';
				const authB = b.author || '';
				if(authA !== authB) {
					return authA.localeCompare(authB); // Authors in alphabetical order
				}
				return (b.date || '').localeCompare(a.date || '');
			});

			// Group the filtered songs back into author blocks
			const groupsMap = new Map();
			for(let i = 0, len = filteredSongs.length; i < len; ++i) {
				const song = filteredSongs[i];
				const authorName = song.author || 'Unknown';
				if(!groupsMap.has(authorName)) {
					groupsMap.set(authorName, []);
				}
				groupsMap.get(authorName).push(song);
			}
			filteredSongs = [];
			groupsMap.forEach((authorSongs, authorName) =>
				filteredSongs.push({ author: authorName, songs: authorSongs }));
		}

		// Configuring Time Slicing (Chunked Rendering)
		let currentIndex = 0;
		const itemsPerChunk = 40; // Size of a single pack (optimal for 60–144 Hz screens)
		const totalItems = filteredSongs.length;

		// Function to render a single piece of data
		const renderChunk = () => {
			// Cancellation check:
			// If the currentRenderId has changed, it means the user clicked the filters again.
			// Simply return, stopping this old requestAnimationFrame loop.
			if(renderId !== this.currentRenderId) {
				return;
			}
			// If all batches have been successfully rendered and activated, stopping the loop.
			if(currentIndex >= totalItems) {
				return;
			}
			const chunkHtmlParts = [];
			const endIndex = Math.min(currentIndex + itemsPerChunk, totalItems);
			// Assemble the HTML code strictly for the current batch (e.g., elements 0 through 40)
			for(let i = currentIndex; i < endIndex; ++i) {
				chunkHtmlParts.push(this.generateEntryHTML(filteredSongs[i], 'filtered'));
			}
			// Inject a batch into the DOM
			containerElem.insertAdjacentHTML('beforeend', chunkHtmlParts.join(''));
			// Shift the pointer
			currentIndex = endIndex;
			// Schedule the rendering of the next batch for the next monitor animation frame
			requestAnimationFrame(renderChunk);
		};

		// Clear the container before rendering
		containerElem.innerHTML = '';
		// Launch the first batch of rendering
		requestAnimationFrame(renderChunk);
	}
}
