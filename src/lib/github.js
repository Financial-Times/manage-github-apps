const { Octokit } = require('@octokit/rest');

/**
 * This class exposes an instance of GitHub's Octokit API client, provides
 * convenience methods for some of the client's API methods, as well as some
 * GitHub-related utility methods.
 */
class Github {

	/**
	 * Creates a new instance of the `Github` class, which itself exposes a
	 * an instance of the GitHub Octokit client.
	 *
	 * @see https://github.com/octokit/rest.js
	 *
	 * @params {object} options
	 * @params {string} options.personalAccessToken - GitHub personal access token
	 */
	constructor ({ personalAccessToken }) {
		if (!personalAccessToken) {
			throw new Error('Github#constructor: Invalid `personalAccessToken` option');
		}

		/**
		 * @type {import('@octokit/rest')}
		 * @see https://github.com/octokit/rest.js#authentication
		 */
		this.client = new Octokit({
			auth: `token ${personalAccessToken}`
		});
	}

	/**
	 * Parses owner and repo from a supported list of string patterns defined by
	 * `Github.SUPPORTED_REPO_STRING_PATTERNS`.
	 *
	 * @param {string} githubRepoString
	 * @returns {object} - Properties: owner, repo
	 */
	static extractOwnerAndRepo (githubRepoString) {
		const extractOwnerAndRepoRegExp = /^(?:\S*github\.com(?:\/|:))?([\w-]+)\/([\w-]+)/;
		const matches = extractOwnerAndRepoRegExp.exec(githubRepoString);

		if (matches === null) {
			throw new Error(`Github#extractOwnerAndRepo: Could not extract owner and repo from provided string. The string must match one of the following patterns:\n\n- ${Github.SUPPORTED_REPO_STRING_PATTERNS.join('\n- ')}`);
		}
		const [, owner, repo] = matches;

		return { owner, repo };
	}

	/**
	 * Wrapper around octokit's `users.get` method.
	 *
	 * @see https://octokit.github.io/rest.js/#api-Users-get
	 *
	 * @returns {object} - Data for GitHub user that the octokit client is authenticated as
	 */
	async getAuthenticatedUser () {
		const user = await this.client.users.getAuthenticated();
		return user.data;
	}

	/**
	 * Wrapper around octokit's `repos.get` method.
	 *
	 * @see https://octokit.github.io/rest.js/#api-Repos-get
	 *
	 * @param {object} - owner and repo
	 * @returns {object} - Data for the GitHub repository
	 */
	async getRepo ({ owner, repo }) {
		const repoMeta = await this.client.repos.get({ owner, repo });
		return repoMeta.data;
	}

}

/**
 * Array of repo string patterns supported by `Github#extractOwnerAndRepo`.
 *
 * @type {Array<string>}
 */
Github.SUPPORTED_REPO_STRING_PATTERNS = [
	'github-organization/github-repo-name',
	'github.com/github-organization/github-repo-name',
	'subdomain.github.com/github-organization/github-repo-name',
	'https://github.com/github-organization/github-repo-name',
	'https://github.com/github-organization/github-repo-name/blob/main',
	'https://github.com/github-organization/github-repo-name.git',
	'git+https://github.com/github-organization/github-repo-name.git',
	'git@github.com:github-organization/github-repo-name.git',
];

module.exports = Github;
