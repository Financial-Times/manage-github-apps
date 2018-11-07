const { URL } = require('url');

module.exports = (configPath) => {
	try {
		if (new URL(configPath)) {
			return true;
		}
	} catch (err) {}

	return false;
};
