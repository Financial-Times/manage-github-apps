const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const { URL } = require('url');
const validator = require('is-my-json-valid');

const looksLikeUrl = (configPath) => {
	try {
		if (new URL(configPath)) {
			return true;
		}
	} catch (err) {}

	return false;
};

const formatField = (fieldName) => {
	return (fieldName === 'data') ? '' : `'${fieldName.replace('data.', "")}' `;
};

const formatErrors = (errors) => {
	if (!errors || !errors.length) {
		return '';
	}

	return errors.map((err) => {
		return `- ${formatField(err.field)}${err.message}`;
	}).join('\n');
};

class Config {

	constructor ({ source, schema }) {
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

	async load () {

		let config;
		let sourceDescription;

		if (looksLikeUrl(this.source)) {
			config = await fetch(this.source).then((res) => res.json());
			sourceDescription = `URL: ${this.source}`;
		} else {
			const localConfigPath = path.resolve(`${process.cwd()}/${this.source}`);
			if (!fs.existsSync(localConfigPath)) {
				throw new Error(`Config: Could not find local file '${localConfigPath}'`);
			}
			config = require(localConfigPath);
			sourceDescription = `local file: ${localConfigPath}`;
		}

		const validationResult = this.validateAgainstSchema(config);
		if (validationResult === true) {
			this.configObject = config;
			this.sourceDescription = sourceDescription;
			this.loaded = true;
		} else {
			throw new Error(`The config is invalid:\n\n${formatErrors(validationResult)}`);
		}
	}

	validateAgainstSchema (config) {
		const validate = validator(this.schema);
		if (validate(config)) {
			return true;
		}
		return validate.errors;
	}

	get (property) {
		if (!this.loaded) {
			throw new Error(`Cannot get property '${property}' as config has not been loaded, Config#load must be called first`);
		}
		if (!property in this.configObject) {
			throw new Error(`The config property '${property}' does not exist`);
		}

		return this.configObject[property];
	}

}

module.exports = Config;
