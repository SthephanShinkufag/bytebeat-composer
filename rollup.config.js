import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
export default {
	input: 'scripts/codemirror-setup.js',
	output: {
		file: 'scripts/codemirror.min.js',
		format: 'es'
	},
	plugins: [nodeResolve(), terser()]
};
