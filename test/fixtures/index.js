const path = require('path');

const FIXTURES_PATH = 'test/fixtures';
const FIXTURES_CONFIG_PATH = `${FIXTURES_PATH}/config`;
const FIXTURES_SCHEMAS_PATH = `${FIXTURES_PATH}/schemas`;

const fixtures = {

	config: {

		urlHostname: 'https://raw.githubusercontent.com',

		valid: {
			filepath: path.resolve(`${FIXTURES_CONFIG_PATH}/valid.json`),
			url: {
				path: '/github-organization/github-apps-config/master/valid.json',
				get: () => `${fixtures.config.urlHostname}${fixtures.config.valid.url.path}`
			}
		},

		invalid: {
			filepath: path.resolve(`${FIXTURES_CONFIG_PATH}/invalid.json`),
			url: {
				path: '/github-organization/github-apps-config/master/invalid.json',
				get: () => `${fixtures.config.urlHostname}${fixtures.config.invalid.url.path}`
			}
		},

		invalidJson: {
			filepath: path.resolve(`${FIXTURES_CONFIG_PATH}/invalid-json.json`),
			url: {
				path: '/github-organization/github-apps-config/master/invalid-json.json',
				get: () => `${fixtures.config.urlHostname}${fixtures.config.invalidJson.url.path}`
			}
		},

		nonExistent: {
			filepath: path.resolve(`${FIXTURES_CONFIG_PATH}/non-existent.json`),
			url: {
				path: '/github-organization/github-apps-config/master/non-existent.json',
				get: () => `${fixtures.config.urlHostname}${fixtures.config.nonExistent.url.path}`
			}
		},

	},

	schema: {

		valid: {
			filepath: path.resolve(`${FIXTURES_SCHEMAS_PATH}/valid.json`),
		},

	}

};

module.exports = fixtures;
