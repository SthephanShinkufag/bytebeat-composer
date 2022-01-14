import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
	input: 'scripts/codemirror-setup.js',
	output: {
		file: 'scripts/codemirror.js',
		format: 'iife'
	},
	plugins: [nodeResolve()]
};
