/* eslint-disable no-console */

/** yargs command module: validate-config */

const Config = require('../lib/config');
const logger = require('../lib/logger');

const configSchema = require('../../schemas/config.schema.json');

/**
 * yargs handler function logic.
 *
 * @param {object} argv - argv parsed and filtered by yargs
 */
const main = async (argv) => {

	const config = new Config({
		source: argv.config,
		schema: configSchema
	});

	await config.load();

	logger.info(`Config: Read from ${config.sourceDescription}\n`);
	logger.success('Config is valid');

};

/**
 * yargs builder function.
 *
 * @param {import('yargs/yargs').Yargs} yargs - Instance of yargs
 */
const builder = (yargs) => {

	return yargs
		.option('config', {
			alias: 'c',
			describe: 'Path to JSON configuration (URL or local filepath)',
			demandOption: true,
			type: 'string'
		});
};

/**
 * yargs handler function with error handling wrapper around main logic.
 *
 * @param {object} argv - argv parsed and filtered by yargs
 */
const handler = async (argv) => {
	try {
		await main(argv);
	} catch (err) {
		logger.error(`ERROR: ${err.message}`);
		process.exit(1);
	}
};

/**
 * @see https://github.com/yargs/yargs/blob/HEAD/docs/advanced.md#providing-a-command-module
 */
module.exports = {
	command: 'validate-config',
	desc: 'Validate a JSON configuration against the manage-github-apps JSON schema',
	builder,
	handler,
};
