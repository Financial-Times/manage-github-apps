/**
 * These are unit tests for the `Config` class.
 *
 * Mocks used by these tests:
 *
 * - nock - used to mock HTTP responses
 */

const Config = require('../../src/lib/config');

const path = require('path');

// TODO: Move this out into fixtures/index.js with resolved paths
const fixtures = {
	config: {
		filepathValid: path.resolve('test/commands/fixtures/valid-config.json'),
		filepathInvalid: path.resolve('test/commands/fixtures/invalid-config.json'),
		urlHostname: 'https://raw.githubusercontent.com',
		urlPathValid: '/some-org/github-apps-config/master/valid.json',
		urlValid: null,
		urlPathInvalid: '/some-org/github-apps-config/master/invalid.json',
		urlInvalid: null,
	},
	schema: {
		filepathValid: path.resolve('test/commands/fixtures/schemas/valid.json'),
		// filepathInvalid: '../commands/fixtures/schemas/invalid.json',
	}
};

// TODO: Do this better
fixtures.config.urlValid = `${fixtures.config.urlHostname}${fixtures.config.urlPathValid}`;
fixtures.config.urlInvalid = `${fixtures.config.urlHostname}${fixtures.config.urlPathInvalid}`;

const nock = require('nock');

const nockScope = () => {
	return nock(fixtures.config.urlHostname)
		.defaultReplyHeaders({ 'Content-Type': 'application/json' });
};

afterEach(() => {
	nock.cleanAll();
});

test('new instance without `source` option throws an error', () => {
	expect(() => {
		new Config({
			schema: require(fixtures.schema.filepathValid)
		});
	}).toThrowError('Config#constructor: No `source` specified');
});

test('new instance without `schema` option throws an error', () => {
	expect(() => {
		new Config({
			source: fixtures.config.urlValid
		});
	}).toThrowError('Config#constructor: No `schema` specified');
});

test('new instance with valid options won\'t throw an error', () => {
	expect(() => {

		const source = fixtures.config.urlValid;
		const schema = require(fixtures.schema.filepathValid);

		const config = new Config({ source, schema });

		expect(config.source).toEqual(source);
		expect(config.schema).toEqual(schema);

	}).not.toThrow();
});

test('calling `isLoaded` on instance before calling `load` will return false', () => {

	const source = fixtures.config.urlValid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is URL for valid config will succeed', async () => {

	nockScope().get(fixtures.config.urlPathValid)
		.reply(200, require(fixtures.config.filepathValid));

	const source = fixtures.config.urlValid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	await expect(config.load()).resolves.toBe(true);

	expect(config.isLoaded()).toEqual(true);
});

test('calling `load` on instance where `source` is URL for invalid config will throw an error', async () => {

	nockScope().get(fixtures.config.urlPathInvalid)
		.reply(200, require(fixtures.config.filepathInvalid));

	const source = fixtures.config.urlInvalid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: The config is invalid');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is filepath for valid config will succeed', async () => {

	const source = fixtures.config.filepathValid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	await expect(config.load()).resolves.toBe(true);

	expect(config.isLoaded()).toEqual(true);
});

test('calling `load` on instance where `source` is filepath for invalid config will throw an error', async () => {

	const source = fixtures.config.filepathInvalid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: The config is invalid');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `get` on instance with config not loaded throws an error', () => {

	const source = fixtures.config.filepathValid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	expect(() => {
		config.get('owner');
	}).toThrowError('Config#get: Cannot get property');
});

test('calling `get` on instance with config loaded where property doesn\'t exist throws an error', async () => {

	const source = fixtures.config.filepathValid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	await config.load();

	expect(() => {
		config.get('non_existent_property');
	}).toThrowError('Config#get: The config property');
});

test('calling `get` on instance with config loaded returns expected values', async () => {

	const expectedConfig = require(fixtures.config.filepathValid);

	const source = fixtures.config.filepathValid;
	const schema = require(fixtures.schema.filepathValid);

	const config = new Config({ source, schema });

	await config.load();

	expect(config.get('owner')).toEqual(expectedConfig.owner);
	expect(config.get('installations')).toEqual(expectedConfig.installations);
});
