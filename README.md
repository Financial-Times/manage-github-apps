<p align="center">
  <a href="https://github.com/Financial-Times/manage-github-apps"><img src="static/logo.svg" width="160" alt="manage github apps logo" title="manage github apps" /></a>
</p>
<p align="center">A CLI tool for managing the repositories for GitHub App installations<p>

---

To use this tool you will need a JSON configuration file. You can find an
[example configuration](test/fixtures/config/valid.json) in the test fixtures
directory. Any JSON configuration file that you pass to this tool must validate
against [this JSON schema](schemas/config.schema.json). You will also require
the [GitHub personal access token](#github-personal-access-token-security)
with all `repo` scopes owned by the Platforms team.

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

This tool requires a GitHub personal access token with all `repo` scopes set up by the code-management team. The token is stored in the `Next Repos GitHub Access Token` secret in the `Shared-cp-platforms-team` folder in LastPass.

This token is created on the FT service GitHub account (and not the `next-team` GitHub account). To rotate it or for any questions on its set up please contact the [#code-management team](https://app.slack.com/client/T025C95MN/C02ST9MNV0S).

## Using GitHub personal access tokens securely

The token access required for use with this tool is _very powerful_ as it has access to modify a repository's settings, so it is strongly recommended that you store this token
securely.

You can store it in an environment variable and pass it to `manage-github-apps`
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

## If you are a member of the Platforms team and have been asked to add GitHub apps to a new repo

When creating a new repo, developers will follow [this guide in the wiki](https://github.com/Financial-Times/next/wiki/Creating-New-Apps#add-our-github-apps-to-the-repository) and ask you to add GitHub apps to the repo for them.

To do this, running one of the following commands should work:

```
npx github:financial-times/manage-github-apps add \
    --token [The Platforms GitHub token] \
    --repo "Financial-Times/[repository name]" \
    --config "https://raw.githubusercontent.com/Financial-Times/github-apps-config-next/main/manage-github-apps/default.json"
```

Sometimes there are issues with `npx` on this repo, and in that case you can run the command locally:

```
git clone git@github.com:Financial-Times/manage-github-apps.git
cd manage-github-apps
npm install
```

then

```
./src/index.js add \
    --token [The Platforms GitHub token] \
    --repo "Financial-Times/[repository name]" \
    --config "https://raw.githubusercontent.com/Financial-Times/github-apps-config-next/main/manage-github-apps/default.json"
```

---

Thanks to [@apaleslimghost](https://github.com/apaleslimghost) for the lovely logo :heart:
