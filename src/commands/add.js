/* eslint-disable no-console */

const Github = require('../lib/github');
const { getConfig } = require('../lib/config.js');

const main = async (argv) => {

	const github = new Github();

	const config = await getConfig(argv.config);

	const { owner, repo } = github.extractOwnerAndRepo(argv.repo);

	const configOwnerAndRepoOwnermatch = (config.owner === owner);
	if (!configOwnerAndRepoOwnermatch) {
		throw new Error(`The owner specified by the config (${config.owner}) and the owner of the repo (${owner}) do not match.\n   It is not possible to add the repo to the installations specified by the config.`);
	}

	const githubPersonalAccessToken = argv.token;

	console.log('ℹ️  The options you have specified have been parsed as:\n');
	console.log(`️ℹ️  GitHub organisation: ${owner}`);
	console.log(`️ℹ️  GitHub repo: ${repo}\n`);

	github.authenticateWithToken(githubPersonalAccessToken);

	const authenticatedUser = await github.getAuthenticatedUser();
	console.log(`✔️  Authenticated as GitHub user ${authenticatedUser.login}`);

	const repoMeta = await github.getRepo({ owner, repo });
	console.log(`✔️  GitHub repo ${owner}/${repo} exists\n`);

	const addRequests = config.installations.map((installation) => {
		console.log(
			`➕  Adding repo to installation ${
				installation.comment
			} (https://github.com/organizations/${owner}/settings/installations/${
				installation.id
			})`
		);

		return github.client.apps.addRepoToInstallation({
			installation_id: installation.id,
			repository_id: repoMeta.id
		});
	});

	return Promise.all(addRequests).then(() => {
		console.log(
			`\n➡️  Go to https://github.com/${owner}/${repo}/settings/installations to see the installed GitHub apps for this repo.`
		);
	});
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
		console.error(`💥  ERROR: ${err.message}`);
		process.exit(1);
	}
};

module.exports = {
	command: 'add',
	desc: 'Add a GitHub repository to GitHub App installations',
	builder,
	handler,
};
