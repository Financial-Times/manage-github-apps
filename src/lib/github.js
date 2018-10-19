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
	 */
	extractOwnerAndRepo (githubRepoString) {
		const extractOwnerAndRepoRegExp = /(?:\/|\:)?([\w\-]+)\/([^\.\/]+)(?:\.git)?$/;
		const matches = extractOwnerAndRepoRegExp.exec(githubRepoString);
		if (matches === null) {
			throw new Error('Could not extract owner and repo from provided string');
		}
		const [, owner, repo] = matches;

		return { owner, repo };
	}

	authenticateWithToken (token) {
		this.client.authenticate({
			type: 'token',
			token
		});
	}

	async getAuthenticatedUser () {
		const user = await this.client.users.get();
		return user.data;
	}

	async getRepo ({ owner, repo }) {
		const repoMeta = await this.client.repos.get({ owner, repo });
		return repoMeta.data;
	}

}

module.exports = Github;
