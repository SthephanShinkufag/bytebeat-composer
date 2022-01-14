import { closeBrackets } from '@codemirror/closebrackets';
import { defaultKeymap, insertTab, indentLess } from '@codemirror/commands';
import { commentKeymap } from '@codemirror/comment';
import { foldGutter } from '@codemirror/fold';
import { classHighlightStyle } from '@codemirror/highlight';
import { lineNumbers } from '@codemirror/gutter';
import { history, historyKeymap, redo } from '@codemirror/history';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching } from '@codemirror/matchbrackets';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { highlightActiveLine, highlightSpecialChars, EditorView, keymap } from '@codemirror/view';

/* global bytebeat */
bytebeat.editorView = new EditorView({
	parent: document.getElementById('editor'),
	state: EditorState.create({
		doc: 't*(t&16384?6:5)*(4-(1&t>>8))>>(3&-t>>9)|t>>6',
		extensions: [
			bracketMatching(),
			classHighlightStyle,
			closeBrackets(),
			EditorView.lineWrapping,
			EditorView.updateListener.of(view => {
				if(view.docChanged) {
					bytebeat.setFunction();
				}
			}),
			foldGutter(),
			highlightActiveLine(),
			highlightSelectionMatches(),
			highlightSpecialChars(),
			history(),
			javascript(),
			keymap.of([
				...commentKeymap,
				...defaultKeymap,
				...historyKeymap,
				...searchKeymap,
				{ key: 'Ctrl-Y', run: redo },
				{ key: 'Shift-Tab', run: indentLess },
				{ key: 'Tab', run: insertTab }
			]),
			lineNumbers(),
			oneDark
		]
	})
});
