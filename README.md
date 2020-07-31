<p align="center">
  <a href="https://github.com/Financial-Times/manage-github-apps"><img src="static/logo.svg" width="160" alt="manage github apps logo" title="manage github apps" /></a>
</p>
<p align="center">A CLI tool for managing the repositories for GitHub App installations<p>

---

To use this tool you will need a JSON configuration file. You can find an
[example configuration](test/fixtures/config/valid.json) in the test fixtures
directory. Any JSON configuration file that you pass to this tool must validate
against [this JSON schema](schemas/config.schema.json). You will also require
a [GitHub personal access token](#github-personal-access-token-security)
with all `repo` scopes.

## Usage

```
$ npx github:financial-times/manage-github-apps --help

manage-github-apps <command>

Commands:
  manage-github-apps add              Add a GitHub repository to GitHub App
                                      installations
  manage-github-apps validate-config  Validate a JSON configuration against the
                                      manage-github-apps JSON schema

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## GitHub personal access token security

This tool requires a [GitHub personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
with all `repo` scopes. This is _very powerful_ as it has access to modify a
repository's settings, so it is strongly recommended that you store this token
securely.

Once you have created a [new GitHub personal access token with all `repo` scopes](https://github.com/settings/tokens/new?description=Manage%20GitHub%20Apps%20CLI&scopes=repo "Click here to create a new GitHub personal access token"),
you can store it in an environment variable and pass it to `manage-github-apps`
whenever you run a command that requires the `--token` option:

```sh
--token $GITHUB_PERSONAL_ACCESS_TOKEN
```

You should avoid passing your GitHub personal access token directly to any CLI
arguments as then it will be visible in your shell history.

A recommended approach is to store auth tokens in your operating system's
password management system (e.g. Keychain on macOS), retrieve it in your shell's
rcfile (e.g. `~/.bashrc`) and assign it to an environment variable so that it is
available to any shell that you run.

---

Thanks to [@apaleslimghost](https://github.com/apaleslimghost) for the lovely logo :heart:
