# SchoolFlow coding workspace and recovery workflow

## Source of truth

- GitHub repository: `https://github.com/mattshola-creator/schoolflow`
- Default branch: `main`
- RU6 Finance branch: `feat/px6-ru6-finance`
- Production site: `https://schoolflow-app.netlify.app`
- Package manager: pnpm, pinned by `package.json`'s `packageManager` field.

Always confirm the current `main` and feature-branch heads from GitHub before
resuming work. A remembered commit SHA is a checkpoint, not proof that a local
directory is current.

## Open a clean checkout

Use a fresh directory if the current checkout has an unexpected branch, stale
remote, failed proxy, or unrelated staged changes. Never reset or delete a
previous checkout to recover the project.

```sh
git clone https://github.com/mattshola-creator/schoolflow.git schoolflow-work
cd schoolflow-work
git fetch --all --prune
git switch --track -c feat/px6-ru6-finance origin/feat/px6-ru6-finance
git status --short --branch
git rev-parse HEAD
git remote -v
```

For a different release unit, use its existing branch if one exists; otherwise
create a new `feat/px6-ruN-<scope>` branch from the verified `origin/main`.
Keep each release unit on an independent branch and pull request.

Before touching an existing checkout, inspect `git status`, `git diff`, and
`git diff --cached`. Preserve uncommitted and staged work until its owner and
purpose are known. Do not use `reset --hard`, force-push, or overwrite another
release unit's branch.

## Dependencies and local checks

Use the Node.js version supported by the repository and its pinned pnpm version.
Install exactly from the committed lockfile:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --prod
pnpm audit
```

Keep the full audit result separate from the production audit. The known
development-only `braces@3.0.3` advisory must remain reported until its upstream
dependency is resolved; do not suppress it to make CI appear green. Run the
repository's available local tracked-secret scan and review the hosting
provider's enhanced scan after preview deployment.

Do not use production credentials or production records for tests. Do not add
credentials to source files, command history, commit messages, or test
fixtures.

## Branch publication and preview

Publish work only to its dedicated feature branch. Use the configured Git
credential helper when available; otherwise use the connected GitHub integration
for an authorized commit/ref update. Never paste a token into a remote URL or
shell command.

Open or update the unit's draft PR against `main`. Confirm the PR head SHA, CI
run, Netlify deployment revision, preview Ready state, Next.js plugin result,
and regular/enhanced secret-scan results all refer to that same head. Keep the
preview protected by the existing Netlify access policy. A successful preview
does not authorize a production merge.

## Recovery when a workspace is lost or stale

1. Verify repository metadata, current `main`, and the relevant PR branch via
   the connected GitHub integration.
2. Inspect the old worktree status before any cleanup. Preserve local patches
   and staged changes until ownership is clear.
3. Test read-only GitHub connectivity with `git ls-remote` once. If it works,
   clone into a new sibling directory and fetch the release branch.
4. If the shell cannot authenticate for pushes, use only the authorized GitHub
   connector or request the missing coding-environment credential integration.
   Read access alone is not a writable coding workspace.
5. Run frozen installation, format, lint, TypeScript, tests and build before
   describing the checkout as recovered or resuming implementation.
6. If GitHub fetch is unavailable, do not reconstruct a checkout from isolated
   file reads or repeat a known failing proxy/archive path. Stop and record the
   exact missing access capability.

GitHub Codespaces is a suitable developer environment when the current Work
session has an integration that can access its files and terminal. Seeing a
Codespace in GitHub's browser alone does not establish that connection.
