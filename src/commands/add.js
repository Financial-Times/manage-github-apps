/* eslint-disable no-console */

const Octokit = require('@octokit/rest');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const { URL } = require('url');
const validator = require('is-my-json-valid/require');

const githubHelpers = require('../lib/github');
const validate = validator('../../schemas/config.schema.json');

const builder = (yargs) => {

	return yargs
		.option('repo', {
			alias: 'r',
			describe: 'GitHub repository e.g. https://github.com/github-organization/github-repo-name',
			demandOption: true,
			type: 'string',
		})
		.option('config', {
			alias: 'c',
			describe: 'Path to JSON configuration (URL or local filepath)',
			demandOption: true,
			type: 'string',
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
		console.error(`💥  ERROR: ${err.message}`);
		process.exit(1);
	}
};

const configPathLooksLikeUrl = (configPath) => {
	try {
		if (new URL(configPath)) {
			return true;
		}
	} catch (err) {}

	return false;
};

const validateConfig = (config) => {

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
		console.log(`-- Config: Read from URL '${configPath}'\n`);
	} else {
		const localConfigPath = path.resolve(`${process.cwd()}/${configPath}`);
		if (!fs.existsSync(localConfigPath)) {
			throw new Error(`Config: Could not find local file '${localConfigPath}'`);
		}
		config = require(localConfigPath);
		console.log(`-- Config: Read from local file '${localConfigPath}'\n`);
	}

	validateConfig(config);

	return config;
};

const commandAdd = async (argv) => {

	const config = await getConfig(argv.config);

	const { owner, repo } = githubHelpers.parseGithubRepo(argv.repo);

	const githubPersonalAccessToken = argv.token;

	console.log('-- The options you have specified have been parsed as:\n');
	console.log(`-- GitHub organisation: ${owner}`);
	console.log(`-- GitHub repo: ${repo}`);

	const config = await getConfig(argv.config);

	const octokit = new Octokit({
		debug: true
	});

	githubHelpers.authenticateWithToken(octokit, githubPersonalAccessToken);

	const authenticatedUser = await githubHelpers.getAuthenticatedUser(octokit);
	console.log(`✔️  Authenticated as GitHub user ${authenticatedUser.login}`);

	const repoMeta = await githubHelpers.getRepo(octokit, { owner, repo });
	console.log(`✔️  GitHub repo ${owner}/${repo} exists\n`);

	const addRequests = config.installations.map((installation) => {
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
