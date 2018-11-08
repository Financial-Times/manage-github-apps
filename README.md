# manage-github-apps

A CLI tool for managing the repositories for GitHub App installations.

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

## Storing your GitHub personal access token securely

This tool requires a [GitHub personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
with all `repo` scopes. This is _very powerful_ as it has access to modify a
repository's settings, so it is strongly recommended that you store this token
securely.

1. Create a [new GitHub personal access token with all `repo` scopes](https://github.com/settings/tokens/new?description=Manage%20GitHub%20Apps%20CLI&scopes=repo "Click here to create a new GitHub personal access token").

2. Store the newly created token securely, but also make it easy to retrieve:

    **macOS / OS X**

    ```sh
    # Store the token in the macOS keychain.
    security add-generic-password -a "$USER" -s "manage-github-apps" -w "<REPLACE-WITH-YOUR-GITHUB-PERSONAL-ACCESS-TOKEN>"

    # Retrieve the token from the macOS keychain.
    # Add the following to your `~/.bashrc` (or `~/.zshrc`)
    # so the token is available to any shell as an environment variable:
    export MGA_GITHUB_PERSONAL_ACCESS_TOKEN=$(security find-generic-password -a "$USER" -s "manage-github-apps" -w)
    ```

    **Ubuntu / Debian Linux**

    ```sh
    # Store the token in secret-tool.
    sudo apt install libsecret-tools
    secret-tool store --label='manage-github-apps-token' "<REPLACE-WITH-YOUR-GITHUB-PERSONAL-ACCESS-TOKEN>" "manage-github-apps"

    # Retrieve the token from secret-tool.
    # Add the following to your `~/.bashrc` (or `~/.zshrc`)
    # so the token is available to any shell as an environment variable:
    export MGA_GITHUB_PERSONAL_ACCESS_TOKEN=$(secret-tool lookup token "manage-github-apps")
    ```

4. When you run `manage-github-apps` with a command that requires the `--token`
   option, you can then pass in the environment variable:

    ```sh
    --token ${MGA_GITHUB_PERSONAL_ACCESS_TOKEN}
    ```
