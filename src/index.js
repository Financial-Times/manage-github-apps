#!/usr/bin/env node

/* eslint-disable no-console */

const program = require('commander');
const Octokit = require('@octokit/rest');

const authenticateWithToken = (octokit, token) => {

	octokit.authenticate({
		type: 'token',
		token,
	});
};

const getAuthenticatedUser = async (octokit) => {
	const user = await octokit.users.get();
	
	return user.data;
};

const getRepo = async (octokit, { githubRepoOwner, githubRepoName }) => {

	const repo = await octokit.repos.get({
		owner: githubRepoOwner,
		repo: githubRepoName,
	});

	return repo.data;
};

const main = async () => {

	program
		.version('1.0.0')
		.option('-r, --repo <repo>', 'GitHub repository e.g. github-organization/github-repo-name')
		.option('-t, --token <token>', 'GitHub Personal Access Token (must have all repo scopes)')
		.parse(process.argv);

	const githubRepo = program.repo;
	const [githubRepoOwner, githubRepoName] = githubRepo.split('/');
	const githubPersonalAccessToken = program.token;

	console.log('-- The options you have specified have been parsed as:\n');
	console.log(`-- GitHub organisation: ${githubRepoOwner}`);
	console.log(`-- GitHub repo: ${githubRepoName}`);

	const installationsConfigPath = process.cwd() + '/installations.json';
	console.log(`-- Config is being read from ${installationsConfigPath}\n`);
	const { installations } = require(installationsConfigPath);

	const octokit = new Octokit({
		debug: true
	});

	authenticateWithToken(octokit, githubPersonalAccessToken);

	const authenticatedUser = await getAuthenticatedUser(octokit);
	console.log(`✔️  Authenticated as GitHub user ${authenticatedUser.login}`);

	const repo = await getRepo(octokit, { githubRepoOwner, githubRepoName });
	console.log(`✔️  GitHub repo ${githubRepo} exists\n`);

	const addRequests = installations.map((installation) => {
		console.log(`➕  Adding repo to installation ${installation.comment} (https://github.com/organizations/financial-times-sandbox/settings/installations/${installation.id})`);

		return octokit.apps.addRepoToInstallation({
			installation_id: installation.id,
			repository_id: repo.id,
		});
	});

	return Promise.all(addRequests).then(() => {
		console.log(`\n➡️  Go to https://github.com/${githubRepo}/settings/installations to see the installed GitHub apps for this repo.`);
	});
};

(async () => {
	try {
		await main();
	} catch (err) {
		console.error(`ERROR: ${err.message}`);
	}
})();
