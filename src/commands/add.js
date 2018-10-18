/* eslint-disable no-console */

const Octokit = require('@octokit/rest');

const githubHelpers = require('../lib/github');

const builder = (yargs) => {

	return yargs
		.option('repo', {
			alias: 'r',
			describe: 'GitHub repository e.g. https://github.com/github-organization/github-repo-name',
			demandOption: true,
		})
		.option('token', {
			alias: 't',
			describe: 'GitHub Personal Access Token (must have all repo scopes)',
			demandOption: true,
			type: 'string',
		});
};

const handler = async (argv) => {
	try {
		await commandAdd(argv);
	} catch (err) {
		console.error(`ERROR: ${err.message}`);
	}
};

const commandAdd = async (argv) => {

	const { owner, repo } = githubHelpers.parseGithubRepo(argv.repo);

	const githubPersonalAccessToken = argv.token;

	console.log('-- The options you have specified have been parsed as:\n');
	console.log(`-- GitHub organisation: ${owner}`);
	console.log(`-- GitHub repo: ${repo}`);

	const installationsConfigPath = process.cwd() + '/installations.json';
	console.log(`-- Config is being read from ${installationsConfigPath}\n`);
	const { installations } = require(installationsConfigPath);

	const octokit = new Octokit({
		debug: true
	});

	githubHelpers.authenticateWithToken(octokit, githubPersonalAccessToken);

	const authenticatedUser = await githubHelpers.getAuthenticatedUser(octokit);
	console.log(`✔️  Authenticated as GitHub user ${authenticatedUser.login}`);

	const repoMeta = await githubHelpers.getRepo(octokit, { owner, repo });
	console.log(`✔️  GitHub repo ${owner}/${repo} exists\n`);

	const addRequests = installations.map((installation) => {
		console.log(
			`➕  Adding repo to installation ${
				installation.comment
			} (https://github.com/organizations/${owner}/settings/installations/${
				installation.id
			})`
		);

		return octokit.apps.addRepoToInstallation({
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

module.exports = {
	command: 'add',
	desc: 'Add a GitHub repository to GitHub App installations',
	builder,
	handler,
};
