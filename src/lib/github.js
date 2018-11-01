const Octokit = require('@octokit/rest');

class Github {

	constructor () {
		this.client = new Octokit();
	}

	/**
	 * Parses owner and repo from the following URL types:
	 *
	 *   financial-times-sandbox/manage-github-apps
	 *   https://github.com/github-organization/github-repo-name
	 *   https://github.com/github-organization/github-repo-name.git
	 *   git+https://github.com/github-organization/github-repo-name.git
	 *   git@github.com:github-organization/github-repo-name.git
	 *
	 * @param {string} githubRepoString
	 * @returns {object} - owner and repo
	 */
	extractOwnerAndRepo (githubRepoString) {
		// TODO: Fix regex so it doesn't match https://github.com/github-organization
		const extractOwnerAndRepoRegExp = /(?:\/|\:)?([\w\-]+)\/([^\.\/]+)(?:\.git)?$/;
		const matches = extractOwnerAndRepoRegExp.exec(githubRepoString);
		if (matches === null) {
			throw new Error('Github#extractOwnerAndRepo: Could not extract owner and repo from provided string');
		}
		const [, owner, repo] = matches;

		return { owner, repo };
	}

	/**
	 * Wrapper around octokit's `authenticate` method:
	 * https://github.com/octokit/rest.js#authentication
	 *
	 * @param {string} token - A GitHub personal access token
	 */
	authenticateWithToken (token) {
		if (!token) {
			throw new Error('Github#authenticateWithToken: No valid `token` specified');
		}
		this.client.authenticate({
			type: 'token',
			token
		});
	}

	/**
	 * Wrapper around octokit's `users.get` method:
	 * https://octokit.github.io/rest.js/#api-Users-get
	 *
	 * @returns {object} - Data for GitHub user that the octokit client is authenticated as
	 */
	async getAuthenticatedUser () {
		const user = await this.client.users.get();
		return user.data;
	}

	/**
	 * Wrapper around octokit's `repos.get` method:
	 * https://octokit.github.io/rest.js/#api-Repos-get
	 *
	 * @param {object} - owner and repo
	 * @returns {object} - Data for the GitHub repository
	 */
	async getRepo ({ owner, repo }) {
		const repoMeta = await this.client.repos.get({ owner, repo });
		return repoMeta.data;
	}

}

module.exports = Github;
