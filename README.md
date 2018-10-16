# manage-github-apps

## Usage

1. Create a [new GitHub personal access token with all `repo` scopes](https://github.com/settings/tokens/new?description=FT%20Manage%20GitHub%20Apps%20CLI&scopes=repo).

2. Run this command in your terminal:

    ```sh
    GITHUB_REPO_NAME=$GITHUB_REPO_NAME GITHUB_PERSONAL_ACCESS_TOKEN=$TOKEN npx github:financial-times/manage-github-apps
    ```

    Note: Replace `$GITHUB_REPO_NAME` and `$TOKEN` in the above command with real values.

3. Watch the magic happen... :sparkles:
