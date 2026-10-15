import { ungzip } from 'pako';
import { formatBytes } from './utils.mjs';

export class Library {
	constructor() {
		this.cacheParentElem = null;
		this.cacheTextElem = null;
		this.currentRenderId = 0; // ID of the currently active library interface build
		this.pathFiles = './data/songs/';
		this.pathLibrary = './data/library/';
		this.showAllSongs = false;
		this.songs = null;

		// Check for admin login
		const cookie = {};
		document.cookie.split(';').forEach(el => {
			const split = el.split('=');
			cookie[split[0].trim()] = split.slice(1).join('=');
		});
		this.isAdmin = cookie.bytebeat_access;
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

	// Escape HTML special characters to prevent XSS attacks
	escapeHTML(text) {
		this.cacheTextElem.nodeValue = text;
		return this.cacheParentElem.innerHTML;
	}

	// Generate the HTML for a song entry, including its details and buttons
	generateEntryHTML(entry, libName) {
		const isAllLib = libName === 'all';

		// Generate an author block (containing an array of songs)
		if(entry.songs) {
			const { author, songs } = entry;
			const len = songs.length;
			const maxVisible = 10;
			const needToHide = len - maxVisible;
			const songsHtmlParts = [];
			if(!isAllLib && len > maxVisible + 3) {
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
		const songObj = { sampleRate, mode };

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
					`remix of <span class="code-remix-preview">${
						mainRemixUrl ?
							`<a href="${ mainRemixUrl }" target="_blank">${ rName || rAuthor }</a>` :
							`"${ rName }"` }` +
					`${ rName && rAuthor ? ' by ' + rAuthor : '' }<span></div></div>`;
			}
		}

		// Add buttons for loading the song in different formats (minified, original, formatted)
		const sData = ` data-songdata='${ JSON.stringify(songObj) }'`;
		str += '<div class="code-buttons">';
		// Min button: if the code is short, retrieve from codeMin; otherwise, load from the network
		if(entry.codeMinLen || fileMin) {
			str += `<button class="code-button code-load" data-type="minified"${ sData }` +
				`${ fileMin ? ` data-code-file="${ hash }.js"` : '' }` +
				`${ codeMin ? ' data-has-raw="1"' : '' }>Min <small class="code-size">${
					formatBytes(entry.codeMinLen) }</small></button>`;
		}
		// Orig button: similarly, if it's a short code, write to data-raw-code
		if(entry.codeLen || fileOrig) {
			str += `<button class="code-button code-load" data-type="original"${ sData }` +
				`${ fileOrig ? ` data-code-file="${ hash }.js"` : '' }` +
				`${ code ? ' data-has-raw="1"' : '' }>Orig <small class="code-size">${
					formatBytes(entry.codeLen) }</small></button>`;
		}
		// Format button
		if(entry.fileForm) {
			str += `<button class="code-button code-load" data-type="formatted"${
				sData } data-code-file="${ hash }.js">Format <small class="code-size">${
				formatBytes(entry.codeFormLen) }</small></button>`;
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

	// Collect the text values of buttons that have the .filter-selected class
	getActiveFilters() {
		const getSelectedText = id => {
			const buttonElem = document.querySelector(`#${ id } .filter-selected`);
			return buttonElem ? buttonElem.textContent.trim() : 'all';
		};

		// Assemble an array for the tags, since multiple tags can be selected
		const selectedTags = [];
		document.querySelectorAll('#filter-tags .filter-selected').forEach(buttonElem =>
			selectedTags.push(buttonElem.textContent.trim()));

		return {
			sorting: getSelectedText('filter-sorting'),
			size: getSelectedText('filter-size'),
			mode: getSelectedText('filter-mode'),
			tags: selectedTags,
			// Get the search text
			query: document.getElementById('library-search-input')?.value.toLowerCase().trim() || ''
		};
	}

	groupSongsByAuthor(songsList) {
		const groupsMap = new Map();
		for(let i = 0, len = songsList.length; i < len; ++i) {
			const song = songsList[i];
			const authorName = song.author || 'Unknown';
			if(!groupsMap.has(authorName)) {
				groupsMap.set(authorName, []);
			}
			groupsMap.get(authorName).push(song);
		}
		const result = [];
		groupsMap.forEach((authorSongs, authorName) => {
			result.push({ author: authorName, songs: authorSongs });
		});
		return result;
	}

	// Activate the newly added code buttons of the current batch (dataset.rawCode insertion)
	initDatasetForChunk(containerElem) {
		// Look for buttons with the flag only in the fresh batch of elements
		containerElem.querySelectorAll('.code-load[data-has-raw="1"]').forEach(buttonElem => {
			const entryElem = buttonElem.closest('.entry');
			if(!entryElem) {
				return;
			}
			const { hash } = entryElem.dataset;
			if(!hash) {
				return;
			}
			const songCached = this.songs.get(hash);
			if(!songCached) {
				return;
			}
			const { type } = buttonElem.dataset;
			if(type === 'minified' && songCached.codeMin) {
				buttonElem.dataset.rawCode = songCached.codeMin;
			} else if(type === 'original' && songCached.code) {
				buttonElem.dataset.rawCode = songCached.code;
			}
			buttonElem.removeAttribute('data-has-raw');
		});
	}

	// Initialize the cache element for escaping HTML
	initElements() {
		this.cacheParentElem = document.createElement('div');
		this.cacheParentElem.appendChild(this.cacheTextElem = document.createTextNode(''));
	}

	// Show corresponding article when article navigation button is clicked
	onclickArticleNavButton(buttonElem) {
		const id = buttonElem.dataset.target;
		document.querySelectorAll('.article-button').forEach(el =>
			el.classList.toggle('article-button-selected', el === buttonElem));
		document.querySelectorAll('.article-container').forEach(el =>
			el.classList.toggle('hidden', el.id !== id));
	}

	// Load the code of a song when the min/orig/format button is clicked
	async onclickCodeLoadButton(buttonElem) {
		// The full file is located on the server (network download)
		if(buttonElem.dataset.codeFile) {
			buttonElem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const waitElem = buttonElem.lastChild;
			// A network request for a specific folder (minified / original / formatted)
			const response = await fetch(this.pathFiles + buttonElem.dataset.type +
				'/' + buttonElem.dataset.codeFile);
			globalThis.bytebeat.loadCode(Object.assign(JSON.parse(buttonElem.dataset.songdata),
				{ code: await response.text() }));
			waitElem.remove();

		// The code is small and stored directly within the button (instant launch)
		} else if(buttonElem.dataset.rawCode) {
			globalThis.bytebeat.loadCode(Object.assign(JSON.parse(buttonElem.dataset.songdata),
				{ code: buttonElem.dataset.rawCode }));
		}
	}

	// Toggle the selected state of filter buttons when clicked
	onclickFilterButton(buttonElem) {
		const parentElem = buttonElem.parentNode;
		if(parentElem.id === 'filter-tags') {
			buttonElem.classList.toggle('filter-selected');
		} else {
			parentElem.querySelectorAll('.filter-button').forEach(el =>
				el.classList.toggle('filter-selected', el === buttonElem));
		}

		// If the library has already been downloaded and the cache is ready, update the list instantly
		if(this.songs) {
			this.onclickShowSongsButton();
		}
	}

	// Show the remix source song when the remix info button is clicked
	async onclickRemixLoadButton(elem) {
		// If the block is already open, close it (remove the adjacent element containing the song)
		const parentElem = elem.parentNode;
		if(parentElem.nextSibling && parentElem.nextSibling.classList.contains('entry')) {
			parentElem.nextSibling.remove();
			// Show the short preview
			elem.parentNode.querySelector('.code-remix-preview').style.display = 'inline';
			elem.textContent = '▷';
			return;
		}

		// If the library has not yet been downloaded to memory, download it once
		if(!this.songs) {
			elem.insertAdjacentHTML('beforeend',
				'<svg class="loading-wait"><use xlink:href="#symbol-wait"></use></svg>');
			const response = await fetch(this.pathLibrary + 'all.gz');
			this.cacheSongs(JSON.parse(ungzip(await response.arrayBuffer(), { to: 'string' })));
			elem.lastChild.remove();
		}

		// Search for parent song
		const songHash = elem.dataset.hash;
		const parentSongData = this.songs.get(songHash);
		if(!parentSongData) {
			console.error(`Song with hash ${ songHash } not found in library.`);
			return;
		}

		// Insert the generated HTML for the parent song immediately below the remix block
		parentElem.insertAdjacentHTML('afterend', this.generateEntryHTML(parentSongData, 'all'));

		// Code buttons activation (dataset.rawCode insertion)
		const insertedEntryElem = parentElem.nextElementSibling;
		if(insertedEntryElem) {
			// Hide the short preview
			elem.parentNode.querySelector('.code-remix-preview').style.display = 'none';
			elem.textContent = '▽';
			insertedEntryElem.querySelectorAll('.code-load[data-has-raw="1"]').forEach(buttonElem => {
				// Safely write a raw string without HTML parser distortion
				if(buttonElem.dataset.type === 'minified' && parentSongData.codeMin) {
					buttonElem.dataset.rawCode = parentSongData.codeMin;
				} else if(buttonElem.dataset.type === 'original' && parentSongData.code) {
					buttonElem.dataset.rawCode = parentSongData.code;
				}
				// Removing the temporary marker
				buttonElem.removeAttribute('data-has-raw');
			});
		}
	}

	// Show the library songs when the "Show songs" button is clicked
	async onclickShowSongsButton() {
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

		// Hide the initial load button
		const actionButton = document.getElementById('library-show-songs');
		if(actionButton) {
			actionButton.style.display = 'none';
		}

		// Cancellation check: In case the user clicked right before caching finished
		if(renderId !== this.currentRenderId) {
			return;
		}

		// Retrieve the active filters from the page
		const filters = this.getActiveFilters();
		const isSortByDate = filters.sorting === 'date';

		// Get the flat array of songs from cache (this.songs)
		let filteredSongs = Array.from(this.songs.values());

		// Filter by size
		const fSize = filters.size;
		if(fSize !== 'all') {
			filteredSongs = filteredSongs.filter(song => {
				const len = song.codeLen || song.codeMinLen || song.codeFormLen || 0;
				return fSize === '<256' ? len <= 256 :
					fSize === '<1k' ? len > 256 && len <= 1024 :
					fSize === 'big' ? len > 1024 : true;
			});
		}

		// Filter by mode
		const fMode = filters.mode;
		if(fMode !== 'all') {
			filteredSongs = filteredSongs.filter(song => {
				const sMode = song.mode;
				return fMode === 'uint8' ? !sMode : // mode === 'Bytebeat' is omitted to save JSON space
					fMode === 'int8' ? sMode === 'Signed Bytebeat' :
					fMode === 'float' ? sMode === 'Floatbeat' :
					fMode === 'func' ? sMode === 'Funcbeat' : true;
			});
		}

		// Filter by tags and independent stereo toggle
		let fTags = filters.tags;
		if(fTags.includes('stereo')) {
			filteredSongs = filteredSongs.filter(song => song.stereo === 1);
			// Exclude "stereo" from the array of text tags to avoid searching for it in the song.tags array
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
		const fQuery = filters.query;
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
		const expandElem = document.getElementById('library-expand-container');
		if(expandElem) {
			expandElem.style.display = !songsCount || isSortByDate ? 'none' : '';
			expandElem.toggleAttribute('checked', this.showAllSongs);
		}

		// Clear the container before rendering
		containerElem.innerHTML = '';

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
			filteredSongs = this.groupSongsByAuthor(filteredSongs);
		}

		// Configuring Time Slicing (Chunked Rendering)
		const itemsPerChunk = 40; // Size of a single pack (optimal for 60–144 Hz screens)
		let currentIndex = 0;
		const totalItems = filteredSongs.length;

		// Function to render a single piece of data
		const renderChunk = () => {
			// Critical cancellation check:
			// If the global currentRenderId has changed, it means the user clicked the filters again.
			// Simply return, effectively killing off this old requestAnimationFrame loop.
			if(renderId !== this.currentRenderId) {
				return;
			}
			// If all batches have been successfully rendered and activated; stopping the loop
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
			// Attach dataset.rawCode specifically to the inserted batch to avoid accumulating it for the end
			this.initDatasetForChunk(containerElem, currentIndex, endIndex);
			// Shift the pointer
			currentIndex = endIndex;
			// Schedule the rendering of the next batch for the next monitor animation frame
			requestAnimationFrame(renderChunk);
		};

		// Launch the first batch of rendering
		requestAnimationFrame(renderChunk);
	}

	// Toggle the "open" attribute of all songs blocks when the "Expand all songs" checkbox is clicked
	toggleExpandSongs(isChecked) {
		this.showAllSongs = isChecked;
		document.querySelectorAll('#library-songs > .songs-block').forEach(
			node => node.toggleAttribute('open', isChecked));
	}
}
