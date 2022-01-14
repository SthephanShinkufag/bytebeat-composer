import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { indentWithTab } from '@codemirror/commands';
import { classHighlightStyle } from '@codemirror/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';

/* global bytebeat */
bytebeat.editorView = new EditorView({
	parent: document.getElementById('editor'),
	state: EditorState.create({
		doc: 't*(t&16384?6:5)*(4-(1&t>>8))>>(3&-t>>9)|t>>6',
		extensions: [
			basicSetup,
			classHighlightStyle,
			javascript(),
			keymap.of([indentWithTab]),
			oneDark,
			EditorView.lineWrapping,
			EditorView.updateListener.of(view => {
				if(view.docChanged) {
					bytebeat.setFunction();
				}
			})
		]
	})
});
