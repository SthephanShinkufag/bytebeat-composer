import { closeBrackets } from '@codemirror/autocomplete';
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentLess,
	insertNewline,
	redo
} from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, foldGutter, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
	highlightActiveLine,
	highlightSpecialChars,
	EditorView,
	keymap,
	lineNumbers
} from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';

const defaultEditorElem = document.getElementById('editor-default');
const { value } = defaultEditorElem;
defaultEditorElem.remove();

globalThis.bytebeat.editorView = new EditorView({
	parent: document.getElementById('editor-container'),
	state: EditorState.create({
		doc: value,
		extensions: [
			bracketMatching(),
			closeBrackets(),
			EditorState.tabSize.of('3'),
			EditorView.lineWrapping,
			EditorView.updateListener.of(view => {
				if(view.docChanged) {
					globalThis.bytebeat.setFunction();
				}
			}),
			foldGutter(),
			highlightActiveLine(),
			highlightSelectionMatches(),
			highlightSpecialChars(),
			history(),
			indentUnit.of('\t'),
			javascript(),
			keymap.of([
				{ key: 'Ctrl-Y', run: redo },
				{ key: 'Enter', run: insertNewline },
				{
					key: 'Tab',
					run: view => view.dispatch(view.state.replaceSelection('\t')) || true,
					shift: indentLess
				},
				...historyKeymap,
				...searchKeymap,
				...defaultKeymap
			]),
			lineNumbers(),
			syntaxHighlighting(classHighlighter)
		]
	})
});
