export function formatBytes(bytes) {
	if(bytes < 1E4) {
		return bytes + 'B';
	}
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
	return (i ? (bytes / (1024 ** i)).toFixed(2) : bytes) + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
