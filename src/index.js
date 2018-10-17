#!/usr/bin/env node

const assert = require('assert');
const Octokit = require('@octokit/rest');

const octokit = new Octokit({
	debug: true
});

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

	const githubRepo = process.env.GITHUB_REPO;
	const [githubRepoOwner, githubRepoName] = githubRepo.split('/');
	const githubPersonalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

	const installationsConfigPath = process.cwd() + '/installations.json';
	console.log(`-- Reading installations config from ${installationsConfigPath}\n`);
	const { installations } = require(installationsConfigPath);

	authenticateWithToken(octokit, githubPersonalAccessToken);

	const authenticatedUser = await getAuthenticatedUser(octokit);
	console.log(`✔️  Authenticated as GitHub user ${authenticatedUser.login}`);

	const repo = await getRepo(octokit, { githubRepoOwner, githubRepoName });
	console.log(`✔️  GitHub repo ${githubRepo} exists\n`);

	const addRequests = installations.map((installation) => {
		console.log(`➕  Adding repo to installation ${installation.name} (https://github.com/organizations/financial-times-sandbox/settings/installations/${installation.id})`);

		return octokit.apps.addRepoToInstallation({
			installation_id: installation.id,
			repository_id: repo.id,
		});
	});

	return Promise.all(addRequests).then((responses) => {
		console.log(`\n➡️  Go to https://github.com/${githubRepo}/settings/installations to see the installed GitHub apps for this repo.`);
	});
};

(async () => {
	try {
		assert(
			process.env.GITHUB_REPO,
			'Environment variable GITHUB_REPO must be set e.g. GitHub-Organization/repo-name'
		);
	
		assert(
			process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
			'Environment variable GITHUB_PERSONAL_ACCESS_TOKEN must be set'
		);
	
		await main();
	} catch (err) {
		console.error(`ERROR: ${err.message}`);
	}
})();
