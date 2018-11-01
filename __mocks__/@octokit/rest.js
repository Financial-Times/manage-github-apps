function Octokit () {}

Octokit.prototype.authenticate = jest.fn();

Octokit.prototype.apps = {
	addRepoToInstallation: jest.fn().mockResolvedValue()
};

Octokit.prototype.repos = {
	get: jest.fn().mockResolvedValue({
		data: {
			id: 1234
		}
	})
};

Octokit.prototype.users = {
	get: jest.fn().mockResolvedValue({
		data: {
			login: 'testuser'
		}
	})
};

module.exports = Octokit;
