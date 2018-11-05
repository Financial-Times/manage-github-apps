/* eslint-disable no-console */

const Config = require('../lib/config');
const logger = require('../lib/logger');

const configSchema = require('../../schemas/config.schema.json');

const main = async (argv) => {

	const config = new Config({
		source: argv.config,
		schema: configSchema
	});

	try {
		await config.load();

		logger.info(`Config: Read from ${config.sourceDescription}\n`);
		logger.success('Config is valid');
	} catch (err) {
		logger.error('Config is invalid');
		logger.error(err);
	}

};

const builder = (yargs) => {

	return yargs
		.option('config', {
			alias: 'c',
			describe: 'Path to JSON configuration (URL or local filepath)',
			demandOption: true,
			type: 'string',
			// TODO: coerce?
		});
};

const handler = async (argv) => {
	try {
		await main(argv);
	} catch (err) {
		logger.error(`ERROR: ${err.message}`);
		process.exit(1);
	}
};

module.exports = {
	command: 'validate-config',
	desc: '...',
	builder,
	handler,
};
