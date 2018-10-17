#!/usr/bin/env node

/* eslint-disable no-console */

const program = require('commander');
const Octokit = require('@octokit/rest');

/**
 * Parses owner and repo from the following URL types:
 *
 *   financial-times-sandbox/manage-github-apps
 *   https://github.com/github-organization/github-repo-name
 *   https://github.com/github-organization/github-repo-name.git
 *   git+https://github.com/github-organization/github-repo-name.git
 *   git@github.com:github-organization/github-repo-name.git
 *
 * @param {string} githubRepo
 */
const parseGithubRepo = (githubRepo) => {
	const extractOwnerAndRepoRegExp = /(?:\/|\:)?([\w\-]+)\/([^\.\/]+)(?:\.git)?$/;
	const [, owner, repo] = extractOwnerAndRepoRegExp.exec(githubRepo);

	return { owner, repo };
};

const authenticateWithToken = (octokit, token) => {
	octokit.authenticate({
		type: 'token',
		token
	});
};

const getAuthenticatedUser = async (octokit) => {
	const user = await octokit.users.get();

	return user.data;
};

const getRepo = async (octokit, { owner, repo }) => {
	const repoMeta = await octokit.repos.get({ owner, repo });

	return repoMeta.data;
};

const main = async () => {
	program
		.version('1.0.0')
		.option(
			'-r, --repo <repo>',
			'GitHub repository e.g. https://github.com/github-organization/github-repo-name'
		)
		.option(
			'-t, --token <token>',
			'GitHub Personal Access Token (must have all repo scopes)'
		)
		.parse(process.argv);

	const { owner, repo } = parseGithubRepo(program.repo);

	const githubPersonalAccessToken = program.token;

	console.log('-- The options you have specified have been parsed as:\n');
	console.log(`-- GitHub organisation: ${owner}`);
	console.log(`-- GitHub repo: ${repo}`);

	const installationsConfigPath = process.cwd() + '/installations.json';
	console.log(`-- Config is being read from ${installationsConfigPath}\n`);
	const { installations } = require(installationsConfigPath);

	const octokit = new Octokit({
		debug: true
	});

	authenticateWithToken(octokit, githubPersonalAccessToken);

	const authenticatedUser = await getAuthenticatedUser(octokit);
	console.log(`✔️  Authenticated as GitHub user ${authenticatedUser.login}`);

	const repoMeta = await getRepo(octokit, { owner, repo });
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

(async () => {
	try {
		await main();
	} catch (err) {
		console.error(`ERROR: ${err.message}`);
	}
})();
