import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
export default [{
	input: './scripts/codemirror-setup.mjs',
	output: {
		file: './scripts/codemirror.min.mjs',
		format: 'es'
	},
	plugins: [nodeResolve(), terser()]
}, {
	input: './node_modules/pako/dist/pako.esm.mjs',
	output: {
		file: './scripts/pako.esm.min.mjs',
		format: 'es'
	},
	plugins: [terser()]
}];
