import { closeBrackets } from '@codemirror/closebrackets';
import { defaultKeymap, insertNewline, indentLess } from '@codemirror/commands';
import { commentKeymap } from '@codemirror/comment';
import { foldGutter } from '@codemirror/fold';
import { classHighlightStyle } from '@codemirror/highlight';
import { lineNumbers } from '@codemirror/gutter';
import { history, historyKeymap, redo } from '@codemirror/history';
import { javascript } from '@codemirror/lang-javascript';
import { indentUnit } from '@codemirror/language';
import { bracketMatching } from '@codemirror/matchbrackets';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { highlightActiveLine, highlightSpecialChars, EditorView, keymap } from '@codemirror/view';

const defaultEditorElem = document.getElementById('editor-default');
const { value } = defaultEditorElem;
defaultEditorElem.remove();

globalThis.bytebeat.editorView = new EditorView({
	parent: document.getElementById('editor-container'),
	state: EditorState.create({
		doc: value,
		extensions: [
			bracketMatching(),
			classHighlightStyle,
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
				...commentKeymap,
				...historyKeymap,
				...searchKeymap,
				...defaultKeymap
			]),
			lineNumbers(),
			oneDark
		]
	})
});
