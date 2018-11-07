/**
 * These are unit tests for the `Github` class.
 *
 * For now, most of the methods in this class are a very thin wrapper around
 * @octokit/rest, so they don't warrant their own unit tets.
 *
 * Mocks used by these tests:
 *
 * - @octokit/rest - So that calls are not made to GitHub's API
 */

const Github = require('../../src/lib/github');

const expectedOwner = 'github-organization';
const expectedRepo = 'manage-github-apps';
const expectedFullRepoName = `${expectedOwner}/${expectedRepo}`;

test('calling `extractOwnerAndRepo` with `' + expectedFullRepoName + '` returns `owner` and `repo`', () => {

	const githubRepoString = expectedFullRepoName;

	const github = new Github();
	const { owner, repo } = github.extractOwnerAndRepo(githubRepoString);

	expect(owner).toEqual(expectedOwner);
	expect(repo).toEqual(expectedRepo);
});

test('calling `extractOwnerAndRepo` with `https://github.com/' + expectedFullRepoName + '` returns `owner` and `repo`', () => {

	const githubRepoString = `https://github.com/${expectedFullRepoName}`;

	const github = new Github();
	const { owner, repo } = github.extractOwnerAndRepo(githubRepoString);

	expect(owner).toEqual(expectedOwner);
	expect(repo).toEqual(expectedRepo);
});

test('calling `extractOwnerAndRepo` with `https://github.com/' + expectedFullRepoName + '.git` returns `owner` and `repo`', () => {

	const githubRepoString = `https://github.com/${expectedFullRepoName}.git`;

	const github = new Github();
	const { owner, repo } = github.extractOwnerAndRepo(githubRepoString);

	expect(owner).toEqual(expectedOwner);
	expect(repo).toEqual(expectedRepo);
});

test('calling `extractOwnerAndRepo` with `git+https://github.com/' + expectedFullRepoName + '.git` returns `owner` and `repo`', () => {

	const githubRepoString = `git+https://github.com/${expectedFullRepoName}.git`;

	const github = new Github();
	const { owner, repo } = github.extractOwnerAndRepo(githubRepoString);

	expect(owner).toEqual(expectedOwner);
	expect(repo).toEqual(expectedRepo);
});

test('calling `extractOwnerAndRepo` with `git@github.com:' + expectedFullRepoName + '.git` returns `owner` and `repo`', () => {

	const githubRepoString = `git@github.com:${expectedFullRepoName}.git`;

	const github = new Github();
	const { owner, repo } = github.extractOwnerAndRepo(githubRepoString);

	expect(owner).toEqual(expectedOwner);
	expect(repo).toEqual(expectedRepo);
});

test('calling `extractOwnerAndRepo` with `https://github.com/' + expectedFullRepoName + '/blob/master/file.js` will throw an error', () => {

	const githubRepoString = `https://github.com/${expectedFullRepoName}/blob/master/file.js`;

	const github = new Github();

	expect(() => {
		github.extractOwnerAndRepo(githubRepoString);
	}).toThrowError('Github#extractOwnerAndRepo');
});

// TODO: This test will fail until regex in `extractOwnerAndRepo` is fixed
test('calling `extractOwnerAndRepo` with `https://github.com/' + expectedFullRepoName + '/blob/master` will throw an error', () => {

	const githubRepoString = `https://github.com/${expectedFullRepoName}/blob/master`;

	const github = new Github();

	expect(() => {
		github.extractOwnerAndRepo(githubRepoString);
	}).toThrowError('Github#extractOwnerAndRepo');
});

// TODO: This test will fail until regex in `extractOwnerAndRepo` is fixed
test('calling `extractOwnerAndRepo` with `https://github.com/' + expectedOwner + '` will throw an error', () => {

	const githubRepoString = `https://github.com/${expectedOwner}`;

	const github = new Github();

	expect(() => {
		github.extractOwnerAndRepo(githubRepoString);
	}).toThrowError('Github#extractOwnerAndRepo');
});

// TODO: Add more tests when fixing the regex in `extractOwnerAndRepo`
