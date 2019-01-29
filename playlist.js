(function() {
'use strict';
function $id(id) {
	return document.getElementById(id);
};

function processCodeHTML(code, samplerate) {
	if(typeof code !== 'string') {
		code = code.join('@!@LINE_BREAK@!@');
	}
	code = code.replace(/&/g, '&amp;')
		.replace(/>/g, '&gt;')
		.replace(/</g, '&lt;')
		.replace(/ /g, '&#xA0;')
		.replace(/@!@LINE_BREAK@!@/g, '<br>');
	var sRate = samplerate;
	return '<code' + (sRate ? ' samplerate="' + sRate + '"' : '') + '>' + code + '</code>' +
		(sRate ? ' <span class="samplerate">' + sRate.substr(0, 2) + 'kHz</span>' : '');
}

function getEntryHTML(entry, isChildren) {
	var descr = entry.description;
	var author = entry.author;
	var url = entry.url;
	var authorHTML = '';
	if(author) {
		if(typeof author === 'string') {
			authorHTML = !url ? author : '<a href="' + url + '" target="_blank">' + author + '</a>';
		} else {
			var authorsArr = [];
			for(var j = 0, aLen = author.length; j < aLen; ++j) {
				authorsArr.push('<a href="' + author[j][1] + '" target="_blank">' + author[j][0] + '</a>');
			}
			authorHTML = authorsArr.join(', ');
		}
		authorHTML = descr ? ' (by ' + authorHTML + ')' : 'by ' + authorHTML;
	}
	var descrHTML = '';
	if(descr) {
		descrHTML = author || !url ? descr : '<a href="' + url + '" target="_blank">' + descr + '</a>';
	}
	descrHTML += authorHTML;
	var starredHTML = '';
	switch(entry.starred) {
	case 1: starredHTML = ' &#9733;'; break;
	case 2: starredHTML = ' <span class="yellow">&#9733;</span>';
	}
	var codeHTML = '';
	if(entry.code) {
		codeHTML = (entry.prettycode ? '<a class="prettycode-toggle">Toggle pretty code</a>' +
			processCodeHTML(entry.prettycode, entry.samplerate) + '</br>' : '') +
			processCodeHTML(entry.code, entry.samplerate);
	}
	return isChildren ?
		codeHTML + (descrHTML ? (starredHTML || ' -') + ' ' + descrHTML : starredHTML) :
		descrHTML + (entry.code ? '<br>\r\n' + codeHTML + starredHTML : '');
}

function addPlaylist(obj, id) {
	var html = [];
	var arr = obj.playlist[id];
	for(var i = 0, len = arr.length; i < len; ++i) {
		var entry = arr[i];
		var entryHTML = [getEntryHTML(entry, false)];
		var children = entry.children;
		if(children) {
			for(var j = 0, cLen = children.length; j < cLen; ++j) {
				entryHTML.push(getEntryHTML(children[j], true));
			}
		}
		html.push(entryHTML.join('<br>\r\n'));
	}
	$id('library-' + id).innerHTML = '<ul><li>' + html.join('</li>\r\n<li>') + '</li></ul>';
}

document.addEventListener('DOMContentLoaded', function() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState === 4 && xhr.status === 200) {
			var obj = JSON.parse(xhr.responseText);
			addPlaylist(obj, 'classic8k');
			addPlaylist(obj, 'js8k');
			addPlaylist(obj, 'high');
			addPlaylist(obj, 'sthephanshi');
		}
	};
	xhr.open('GET', 'playlist.json', true);
	xhr.send(null);
});
}());