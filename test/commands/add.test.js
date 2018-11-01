// Third-party modules
const yargs = require('yargs');

// User modules
jest.mock('../../src/lib/logger');
const logger = require('../../src/lib/logger');

const addCommand = require('../../src/commands/add');

const fixtures = {
	paths: {
		validConfig: 'test/commands/fixtures/config.json'
	}
};

const generateLoggerSnapshot = () => {
	let loggerSnapshot = {};
	for (let method in logger) {
		if (!logger.hasOwnProperty(method)) {
			continue;
		}
		if (logger[method].mock && logger[method].mock.calls) {
			loggerSnapshot[method] = logger[method].mock.calls;
		}
	}
	return JSON.stringify(loggerSnapshot);
};

let mockProcessExit;
let mockConsoleWarn;

beforeEach(() => {
	mockProcessExit = jest
		.spyOn(process, 'exit')
		.mockImplementation((code) => code);

	mockConsoleWarn = jest.spyOn(console, 'warn');
});

afterEach(() => {
	// TODO: What kind of clearing needs to happen here? Do we need to reset spies?
	jest.clearAllMocks();
	mockProcessExit.mockRestore();
	mockConsoleWarn.mockRestore();
});

test('`add` command module exports an object that can be used by yargs', () => {
	expect.objectContaining({
		command: expect.stringMatching('add'),
		desc: expect.any(String),
		builder: expect.any(Function),
		handler: expect.any(Function)
	});
});

test('yargs can load the `add` command without any warnings', () => {
	yargs.command(addCommand.command, addCommand.desc, addCommand.builder, addCommand.handler).argv;
	expect(mockConsoleWarn).toHaveBeenCalledTimes(0);
});

test('running command handler without `repo` will exit process with error', async () => {
	await addCommand.handler({
		config: fixtures.paths.validConfig,
		token: '123abc'
	});
	expect(logger.error).toBeCalledWith(
		'ERROR: Github#extractOwnerAndRepo: Could not extract owner and repo from provided string'
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler without `config` will exit process with error', async () => {
	await addCommand.handler({
		repo: 'https://github.com/financial-times-sandbox/Timely-Moving-Coffin',
		token: '123abc'
	});
	expect(logger.error).toBeCalledWith(
		'ERROR: Config#constructor: No `source` specified'
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler without `token` will exit process with error', async () => {
	await addCommand.handler({
		repo: 'https://github.com/financial-times-sandbox/Timely-Moving-Coffin',
		config: fixtures.paths.validConfig
	});
	expect(logger.error).toBeCalledWith(
		'ERROR: Github#authenticateWithToken: No valid `token` specified'
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler with mismatching config owner and repo owner will exit process with error', async () => {
	await addCommand.handler({
		config: fixtures.paths.validConfig,
		token: '123abc',
		repo: 'https://github.com/some-other-org/some-repo'
	});
	// TODO: Change to something less brittle
	expect(logger.error).toBeCalledWith(
		expect.stringContaining('ERROR: The owner specified by the config (financial-times-sandbox) and the owner of the repo (some-other-org) do not match.')
	);
	expect(mockProcessExit).toBeCalledWith(1);
});

test('running command handler with valid options generates expected log messages', async () => {
	await addCommand.handler({
		repo: 'https://github.com/financial-times-sandbox/Timely-Moving-Coffin',
		config: fixtures.paths.validConfig,
		token: '123abc'
	});

	expect(generateLoggerSnapshot()).toMatchInlineSnapshot(
		`"{\\"info\\":[[\\"Config: Read from local file: /home/simonplend/dev/work/clients/financial-times/managing-repos/manage-github-apps/test/commands/fixtures/config.json\\\\n\\"],[\\"The options you have specified have been parsed as:\\"],[\\"- GitHub organisation: financial-times-sandbox\\"],[\\"- GitHub repo: Timely-Moving-Coffin\\\\n\\"]],\\"message\\":[],\\"success\\":[[\\"Authenticated as GitHub user testuser\\"],[\\"GitHub repo financial-times-sandbox/Timely-Moving-Coffin exists\\\\n\\"]],\\"warning\\":[],\\"error\\":[],\\"custom\\":[[\\"➕\\",\\"Adding repo to installation Some bot (https://github.com/organizations/financial-times-sandbox/settings/installations/123456)\\"],[\\"\\\\n➡️\\",\\"Go to https://github.com/financial-times-sandbox/Timely-Moving-Coffin/settings/installations to see the installed GitHub apps for this repo.\\"]]}"`
	);
	expect(logger.error).toHaveBeenCalledTimes(0);
	expect(mockProcessExit).toHaveBeenCalledTimes(0);
});
