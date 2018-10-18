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

module.exports = {
	parseGithubRepo,
	authenticateWithToken,
	getAuthenticatedUser,
	getRepo
};
