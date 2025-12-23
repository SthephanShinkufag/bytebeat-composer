(function() {
	let settings = {};
	try {
		settings = JSON.parse(localStorage.settings);
	} catch(err) {}
	if(settings.themeStyle) {
		document.documentElement.dataset.theme = settings.themeStyle;
		document.documentElement.dataset.themeType = settings.themeStyle.endsWith('Light') ? 'light' : 'dark';
	}
	if(settings.codeStyle) {
		document.documentElement.dataset.syntax = settings.codeStyle;
		document.documentElement.dataset.syntaxType = settings.codeStyle.endsWith('Light') ? 'light' : 'dark';
	}
})();
