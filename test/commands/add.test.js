/**
 * These are integration tests for the `add` command. They test the output from
 * the commmand given various valid and invalid arguments.
 *
 * Mocks used by these tests:
 *
 * - @octokit/rest - So that calls are not made to GitHub's API
 * - src/lib/logger.js - So we can test output from the `add` command
 * - process.exit - So the Jest process isn't exited
 * - console.warn - So we don't get console messages mixed in with Jest output
 */

// Third-party modules
const yargs = require('yargs');

// User modules
jest.mock('../../src/lib/logger');
const logger = require('../../src/lib/logger');

const addCommand = require('../../src/commands/add');

const collectMockCalls = require('./helpers/collect-mock-calls');

const mockProcessExit = jest.spyOn(process, 'exit')
	.mockImplementation((code) => code);

const mockConsoleWarn = jest.spyOn(console, 'warn')
	.mockImplementation((message) => message);

const fixtures = {
	paths: {
		validConfig: 'test/commands/fixtures/valid-config.json'
	}
};

afterEach(() => {
	jest.clearAllMocks();
});

test('`add` command module exports an object that can be used by yargs', () => {
	expect.objectContaining({
		command: expect.stringMatching('add'),
		desc: expect.any(String),
		builder: expect.any(Function),
		handler: expect.any(Function)
	});
});

test('yargs can load the `add` command without any errors or warnings', () => {

	expect(() => {
		yargs.command(
			addCommand.command,
			addCommand.desc,
			addCommand.builder,
			addCommand.handler
		).argv;
	}).not.toThrow();

	// yargs uses `console.warn` to raise errors about incorrect types for some arguments to the `command` method
	expect(mockConsoleWarn).not.toBeCalled();
});

test('running command handler without `repo` will exit process with error', async () => {
	await addCommand.handler({
		config: fixtures.paths.validConfig,
		token: '123abc'
	});
	expect(logger.error).toBeCalledWith(
		expect.stringContaining('ERROR: Github#extractOwnerAndRepo')
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler without `config` will exit process with error', async () => {
	await addCommand.handler({
		repo: 'https://github.com/financial-times-sandbox/Timely-Moving-Coffin',
		token: '123abc'
	});
	expect(logger.error).toBeCalledWith(
		expect.stringContaining('ERROR: Config#constructor')
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler without `token` will exit process with error', async () => {
	await addCommand.handler({
		repo: 'https://github.com/financial-times-sandbox/Timely-Moving-Coffin',
		config: fixtures.paths.validConfig
	});
	expect(logger.error).toBeCalledWith(
		expect.stringContaining('ERROR: Github#authenticateWithToken')
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler with mismatching config owner and repo owner will exit process with error', async () => {
	await addCommand.handler({
		config: fixtures.paths.validConfig,
		token: '123abc',
		repo: 'https://github.com/some-other-org/some-repo'
	});
	expect(logger.error).toBeCalledWith(
		expect.stringContaining('GitHubOwnerMismatch')
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler with valid options generates expected log messages', async () => {
	await addCommand.handler({
		repo: 'https://github.com/financial-times-sandbox/Timely-Moving-Coffin',
		config: fixtures.paths.validConfig,
		token: '123abc'
	});

	const loggerOutput = collectMockCalls(logger);

	expect(loggerOutput).toMatchSnapshot();
	expect(logger.error).not.toBeCalled();
	expect(mockProcessExit).not.toBeCalled();
});
