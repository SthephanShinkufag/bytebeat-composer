import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [{
	input: './src/audio-processor.mjs',
	output: {
		file: './build/audio-processor.mjs',
		format: 'es',
		sourcemap: true
	},
	plugins: [terser()]
}, {
	input: './src/index.mjs',
	output: {
		dir: './build/',
		format: 'es',
		sourcemap: true
	},
	plugins: [nodeResolve(), terser()]
}];
