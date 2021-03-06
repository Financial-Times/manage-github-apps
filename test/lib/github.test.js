/**
 * These are unit tests for the `Github` class.
 *
 * For now, most of the methods in this class are a very thin wrapper around
 * GitHub's Octokit API client, so they don't warrant their own unit tets.
 *
 * Mocks used by these tests:
 *
 * - @octokit/rest - So that calls are not made to GitHub's API
 */

const Github = require('../../src/lib/github');

const expectedOwner = 'github-organization';
const expectedRepo = 'github-repo-name';

const supportedRepoStrings = Github.SUPPORTED_REPO_STRING_PATTERNS;

const unsupportedRepoStrings = [
	`https://github.com/${expectedOwner}`,
	`this is junk subdomain.github.com/${expectedOwner}/${expectedRepo}`,
	`this is absolute/rubbish that we will not support`,
];

afterEach(() => {
	jest.clearAllMocks();
});

supportedRepoStrings.forEach((githubRepoString) => {
	test('calling `extractOwnerAndRepo` with `' + githubRepoString + '` returns `owner` and `repo`', () => {

		const { owner, repo } = Github.extractOwnerAndRepo(githubRepoString);

		expect(owner).toEqual(expectedOwner);
		expect(repo).toEqual(expectedRepo);
	});
});

unsupportedRepoStrings.forEach((githubRepoString) => {
	test('calling `extractOwnerAndRepo` with `' + githubRepoString + '` will throw an error', () => {

		expect(() => {
			Github.extractOwnerAndRepo(githubRepoString);
		}).toThrowError('Github#extractOwnerAndRepo');
	});
});
