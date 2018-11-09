const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const looksLikeUrl = require('./helpers/looks-like-url');
const validation = require('./helpers/validation');

/**
 * This class is for loading a JSON configuration file and validating it against
 * a JSON schema.
 */
class Config {

	/**
	 * Creates a new instance of the `Config` class.
	 *
	 * @param {object} options - Options
	 * @param {string} options.source - Path to JSON configuration (URL or local filepath)
	 * @param {object} options.schema - JSON Schema object
	 * @throws {Error} - Throws error if `source` or `schema` option are missing
	 */
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

	/**
	 * Load JSON configuration from a URL or local filepath and validate it
	 * against a JSON schema.
	 *
	 * @throws {Error} - Throws error if unable to load config or config is invalid
	 * @returns {boolean} - Indicates if config was successfully loaded
	 */
	async load() {
		let config;
		let sourceDescription;

		if (looksLikeUrl(this.source)) {
			const errorMessage = (message) => `Config#load: Could not load config from URL: ${this.source} - ${message}`;
			const response = await fetch(this.source);
			if (response.ok) {
				try {
					config = await response.json();
					sourceDescription = `URL: ${this.source}`;
				} catch (err) {
					throw new Error(errorMessage(err.message));
				}
			} else {
				throw new Error(errorMessage(await response.text()));
			}
		} else {
			const localConfigPath = path.resolve(this.source);
			if (!fs.existsSync(localConfigPath)) {
				throw new Error(
					`Config#load: Could not find local file: ${localConfigPath}`
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

	/**
	 * Indicates whether configuration has been loaded.
	 *
	 * @returns {boolean}
	 */
	isLoaded() {
		return this.loaded;
	}

	/**
	 * Get a property from the loaded configuration.
	 *
	 * @param {string} property - ???
	 * @throws {Error} - Throws an error if config hasn't been loaded or config property doesn't exist
	 * @returns {*} - ???
	 */
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
