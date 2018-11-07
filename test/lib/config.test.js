/**
 * These are unit tests for the `Config` class.
 *
 * Mocks used by these tests:
 *
 * - nock - used to mock HTTP responses
 */

const Config = require('../../src/lib/config');

const fixtures = require('../fixtures');

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
			schema: require(fixtures.schema.valid.filepath)
		});
	}).toThrowError('Config#constructor: No `source` specified');
});

test('new instance without `schema` option throws an error', () => {
	expect(() => {
		new Config({
			source: fixtures.config.valid.url.get()
		});
	}).toThrowError('Config#constructor: No `schema` specified');
});

test('new instance with valid options won\'t throw an error', () => {
	expect(() => {

		const source = fixtures.config.valid.url.get();
		const schema = require(fixtures.schema.valid.filepath);

		const config = new Config({ source, schema });

		expect(config.source).toEqual(source);
		expect(config.schema).toEqual(schema);

	}).not.toThrow();
});

test('calling `isLoaded` on instance before calling `load` will return false', () => {

	const source = fixtures.config.valid.url.get();
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is URL that doesn\'t exist will throw an error', async () => {

	nockScope().get(fixtures.config.nonExistent.url.path)
		.reply(404, '404 Not Found');

	const source = fixtures.config.nonExistent.url.get();
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: Could not load config from URL');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is URL that doesn\'t return valid JSON will throw an error', async () => {

	nockScope().get(fixtures.config.invalidJson.url.path)
		.replyWithFile(200, fixtures.config.invalidJson.filepath);

	const source = fixtures.config.invalidJson.url.get();
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: Could not load config from URL');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is URL for valid config will succeed', async () => {

	nockScope().get(fixtures.config.valid.url.path)
		.replyWithFile(200, fixtures.config.valid.filepath);

	const source = fixtures.config.valid.url.get();
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load()).resolves.toBe(true);

	expect(config.isLoaded()).toEqual(true);
});

test('calling `load` on instance where `source` is URL for invalid config will throw an error', async () => {

	nockScope().get(fixtures.config.invalid.url.path)
		.replyWithFile(200, fixtures.config.invalid.filepath);

	const source = fixtures.config.invalid.url.get();
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: The config is invalid');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is filepath that doesn\'t exist will throw an error', async () => {

	const source = fixtures.config.nonExistent.filepath;
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: Could not find local file');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `load` on instance where `source` is filepath for valid config will succeed', async () => {

	const source = fixtures.config.valid.filepath;
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load()).resolves.toBe(true);

	expect(config.isLoaded()).toEqual(true);
});

test('calling `load` on instance where `source` is filepath for invalid config will throw an error', async () => {

	const source = fixtures.config.invalid.filepath;
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await expect(config.load())
		.rejects.toThrowError('Config#load: The config is invalid');

	expect(config.isLoaded()).toEqual(false);
});

test('calling `get` on instance with config not loaded throws an error', () => {

	const source = fixtures.config.valid.filepath;
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	expect(() => {
		config.get('owner');
	}).toThrowError('Config#get: Cannot get property');
});

test('calling `get` on instance with config loaded where property doesn\'t exist throws an error', async () => {

	const source = fixtures.config.valid.filepath;
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await config.load();

	expect(() => {
		config.get('non_existent_property');
	}).toThrowError('Config#get: The config property');
});

test('calling `get` on instance with config loaded returns expected values', async () => {

	const expectedConfig = require(fixtures.config.valid.filepath);

	const source = fixtures.config.valid.filepath;
	const schema = require(fixtures.schema.valid.filepath);

	const config = new Config({ source, schema });

	await config.load();

	expect(config.get('owner')).toEqual(expectedConfig.owner);
	expect(config.get('installations')).toEqual(expectedConfig.installations);
});
