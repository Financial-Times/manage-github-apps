/**
 * These are integration tests for the `validate-config` command. They test the
 * output from the commmand given various valid and invalid arguments.
 *
 * Mocks used by these tests:
 *
 * - src/lib/logger.js - So we can test output from the `add` command
 * - process.exit - So the Jest process isn't exited
 * - console.warn - So we don't get console messages mixed in with Jest output
 */

// Third-party modules
const yargs = require('yargs');

// User modules
jest.mock('../../src/lib/logger');
const logger = require('../../src/lib/logger');

const validateConfigCommand = require('../../src/commands/validate-config');

const collectMockCalls = require('./helpers/collect-mock-calls');

const fixtures = require('../fixtures');

const mockProcessExit = jest.spyOn(process, 'exit')
	.mockImplementation((code) => code);

const mockConsoleWarn = jest.spyOn(console, 'warn')
	.mockImplementation((message) => message);

afterEach(() => {
	jest.clearAllMocks();
});

test('`validate-config` command module exports an object that can be used by yargs', () => {
	expect.objectContaining({
		command: expect.stringMatching('validate-config'),
		desc: expect.any(String),
		builder: expect.any(Function),
		handler: expect.any(Function)
	});
});

test('yargs can load the `validate-config` command without any errors or warnings', () => {

	expect(() => {
		yargs.command(
			validateConfigCommand.command,
			validateConfigCommand.desc,
			validateConfigCommand.builder,
			validateConfigCommand.handler
		).argv;
	}).not.toThrow();

	// yargs uses `console.warn` to raise errors about incorrect types for some arguments to the `command` method
	expect(mockConsoleWarn).not.toBeCalled();
});

test('running command handler without `config` will exit process with error', async () => {
	await validateConfigCommand.handler({});
	expect(logger.error).toBeCalledWith(
		expect.stringContaining('ERROR: Config#constructor')
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler with a valid config generates expected log messages', async () => {
	await validateConfigCommand.handler({
		config: fixtures.config.valid.filepath
	});

	expect(collectMockCalls(logger)).toMatchSnapshot();
	expect(logger.error).not.toBeCalled();
	expect(mockProcessExit).not.toBeCalled();
});

test('running command handler with an invalid config generates expected log messages', async () => {
	await validateConfigCommand.handler({
		config: fixtures.config.invalid.filepath
	});

	const loggerCalls = collectMockCalls(logger);

	expect(loggerCalls).toMatchSnapshot();
	expect(logger.error).toBeCalled();
	expect(mockProcessExit).toBeCalledWith(1);
});
