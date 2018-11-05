/* eslint-disable no-console */

const Config = require('../lib/config');
const Github = require('../lib/github');
const logger = require('../lib/logger');

const configSchema = require('../../schemas/config.schema.json');

const main = async (argv) => {

	const github = new Github();
	const config = new Config({
		source: argv.config,
		schema: configSchema
	});

	await config.load();

	logger.info(`Config: Read from ${config.sourceDescription}\n`);

	const { owner, repo } = github.extractOwnerAndRepo(argv.repo);

	const configOwner = config.get('owner');
	const configOwnerAndRepoOwnermatch = (configOwner === owner);
	if (!configOwnerAndRepoOwnermatch) {
		throw new Error(`GitHubOwnerMismatch: The owner specified by the config (${configOwner}) and the owner of the repo (${owner}) do not match.\n   It is not possible to add the repo to the installations specified by the config.`);
	}

	const githubPersonalAccessToken = argv.token;

	logger.info('The options you have specified have been parsed as:');
	logger.info(`- GitHub organisation: ${owner}`);
	logger.info(`- GitHub repo: ${repo}\n`);

	github.authenticateWithToken(githubPersonalAccessToken);

	const authenticatedUser = await github.getAuthenticatedUser();
	logger.success(`Authenticated as GitHub user ${authenticatedUser.login}`);

	const repoMeta = await github.getRepo({ owner, repo });
	logger.success(`GitHub repo ${owner}/${repo} exists\n`);

	const installations = config.get('installations');

	const addRequests = installations.map((installation) => {

		logger.custom('➕',
			`Adding repo to installation ${
				installation.comment
			} (https://github.com/organizations/${owner}/settings/installations/${
				installation.id
			})`
		);

		// https://octokit.github.io/rest.js/#api-Apps-addRepoToInstallation
		return github.client.apps.addRepoToInstallation({
			installation_id: installation.id,
			repository_id: repoMeta.id
		});
	});

	await Promise.all(addRequests);

	logger.custom('\n➡️',
		`Go to https://github.com/${owner}/${repo}/settings/installations to see the installed GitHub apps for this repo.`
	);
};

const builder = (yargs) => {

	return yargs
		.option('repo', {
			alias: 'r',
			describe: 'GitHub repository e.g. https://github.com/github-organization/github-repo-name',
			demandOption: true,
			type: 'string',
			// TODO: coerce - check if owner and repo can be extracted
		})
		.option('config', {
			alias: 'c',
			describe: 'Path to JSON configuration (URL or local filepath)',
			demandOption: true,
			type: 'string',
			// TODO: coerce?
		})
		.option('token', {
			alias: 't',
			describe: 'GitHub Personal Access Token (must have all repo scopes)',
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
	command: 'add',
	desc: 'Add a GitHub repository to GitHub App installations',
	builder,
	handler,
};
