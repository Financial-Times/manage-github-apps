# manage-github-apps

## Usage

1. Open up your terminal and in your current working directory drop in the
   `installations.json` config file that you've been given.

2. Create a [new GitHub personal access token with all `repo` scopes](https://github.com/settings/tokens/new?description=FT%20Manage%20GitHub%20Apps%20CLI&scopes=repo).

3. Set these environment variables in your terminal:

    ```sh
    export GITHUB_REPO=$GITHUB_ORG_NAME/$GITHUB_REPO_NAME
    export GITHUB_PERSONAL_ACCESS_TOKEN=$TOKEN
    ```

    Note: Replace all `$*` instances above with real values.

4. Run this command:

    ```sh
    npx github:financial-times/manage-github-apps
    ```

5. Watch the magic happen... :sparkles:

6. Delete the [GitHub personal access token](https://github.com/settings/tokens)
   that you created.
