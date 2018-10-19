/* eslint-disable no-console */

const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const { URL } = require('url');
const validator = require('is-my-json-valid/require');

const CONFIG_SCHEMA_FILEPATH = '../../schemas/config.schema.json';

const configPathLooksLikeUrl = (configPath) => {
	try {
		if (new URL(configPath)) {
			return true;
		}
	} catch (err) {}

	return false;
};

const validateConfig = (schemaPath, config) => {

	const validate = validator(schemaPath);
	if (validate(config)) {
		return true;
	}

	const formatField = (fieldName) => {
		return (fieldName === 'data') ? '' : `'${fieldName.replace('data.', "")}' `;
	};

	const validationErrors = validate.errors.map((err) => {
		return `- ${formatField(err.field)}${err.message}`;
	}).join('\n');

	throw new Error(`Config is invalid:\n\n${validationErrors}`);
};

const getConfig = async (configPath) => {

	let config;

	if (configPathLooksLikeUrl(configPath)) {
		config = await fetch(configPath).then((res) => res.json());
		console.log(`ℹ️  Config: Read from URL '${configPath}'\n`);
	} else {
		const localConfigPath = path.resolve(`${process.cwd()}/${configPath}`);
		if (!fs.existsSync(localConfigPath)) {
			throw new Error(`Config: Could not find local file '${localConfigPath}'`);
		}
		config = require(localConfigPath);
		console.log(`ℹ️  Config: Read from local file '${localConfigPath}'\n`);
	}

	validateConfig(CONFIG_SCHEMA_FILEPATH, config);

	return config;
};

module.exports = {
	configPathLooksLikeUrl,
	validateConfig,
	getConfig,
};
