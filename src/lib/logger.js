/**
 * Modified version of code from https://www.npmjs.com/package/log-symbols
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
 */
const symbols = (() => {
	const isSupported = (process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color');

	const main = {
		info: 'ℹ',
		success: '✔',
		warning: '⚠',
		error: '✖'
	};

	const fallbacks = {
		info: 'i',
		success: '√',
		warning: '‼',
		error: '×'
	};

	return isSupported ? main : fallbacks;
})();

const WHITESPACE = '\x20';

const createLogger = (prefix, stream) => (message) => {
	process[stream].write(`${prefix} ${(message)}\n`);
};

module.exports = {
	info: createLogger(symbols.info, 'stdout'),
	message: createLogger(WHITESPACE, 'stdout'),
	success: createLogger(symbols.success, 'stdout'),
	warning: createLogger(symbols.warning, 'stdout'),
	error: createLogger(symbols.error, 'stderr'),
	custom: (prefix, message) => createLogger(prefix, 'stdout')(message),
	symbols,
};
