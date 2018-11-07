const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const looksLikeUrl = require('./helpers/looks-like-url');
const validation = require('./helpers/validation');

class Config {

	constructor({ source, schema }) {
		if (!source) {
			throw new Error('Config#constructor: No `source` specified');
		}
		if (!schema) {
			throw new Error('Config#constructor: No `schema` specified');
		}

		this.source = source;
		this.schema = schema;

		this.configObject = {};
		this.sourceDescription = null;
		this.loaded = false;
	}

	async load() {
		let config;
		let sourceDescription;

		if (looksLikeUrl(this.source)) {
			config = await fetch(this.source).then((res) => res.json());
			sourceDescription = `URL: ${this.source}`;
		} else {
			const localConfigPath = path.resolve(this.source);
			if (!fs.existsSync(localConfigPath)) {
				throw new Error(
					`Config#load: Could not find local file '${localConfigPath}'`
				);
			}
			config = require(localConfigPath);
			sourceDescription = `local file: ${localConfigPath}`;
		}

		const validationResult = validation.dataAgainstSchema(this.schema, config);
		if (validationResult !== true) {
			throw new Error(
				`Config#load: The config is invalid:\n\n${validation.formatErrors(
					validationResult
				)}`
			);
		}

		this.configObject = config;
		this.sourceDescription = sourceDescription;
		this.loaded = true;

		return true;
	}

	isLoaded() {
		return this.loaded;
	}

	get(property) {
		if (!this.loaded) {
			throw new Error(
				`Config#get: Cannot get property '${property}' as config has not been loaded, Config#load must be called first`
			);
		}
		if (typeof this.configObject[property] === 'undefined') {
			throw new Error(`Config#get: The config property '${property}' does not exist`);
		}

		return this.configObject[property];
	}
}

module.exports = Config;
