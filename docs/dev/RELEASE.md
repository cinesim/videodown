# Releasing videodown

The release pipeline is triggered by pushing a `v*` tag. The `Release videodown` workflow (`.github/workflows/release.yml`) then runs **validate → build (5-platform matrix) → publish** and creates a GitHub Release with installers and `SHA256SUMS.txt`.

The flow below covers both release candidates and stable releases — same steps, only the version string differs.

## Prerequisites

- Push access to `cinesim/videodown`
- `gh` CLI authenticated (`gh auth status`)
- A clean checkout of the latest `main`
- The release workflow must exist in the commit being tagged

## 1. Cut a release branch (first RC only)

Set these variables at the start of every release session. Use the release-candidate version for an RC and the plain version for the eventual stable release:

```bash
release_version="0.19.0-rc.1"
release_branch="release/v0.19.0"

git checkout main
git pull --ff-only
git checkout -b "$release_branch"
```

Reuse the same branch for every RC of that minor version (`rc.1`, `rc.2`, …) **and** the eventual stable tag. For follow-ups, set both variables again, run `git checkout "$release_branch"`, and continue with step 2.

## 2. Set and verify the version

Set the same version in both package manifests:

- `package.json`
- `packages/desktop/package.json`

| Stage             | Version string                  |
| ----------------- | ------------------------------- |
| Release candidate | `0.19.0-rc.1`, `0.19.0-rc.2`, … |
| Stable            | `0.19.0`                        |

Regenerate the lockfile after editing the manifests, then verify that both versions match the intended release:

```bash
bun install

test "$(node -p "require('./package.json').version")" = "$release_version"
test "$(node -p "require('./packages/desktop/package.json').version")" = "$release_version"
git diff --check
```

Do not continue if either version check fails. Electron Builder reads the desktop package version when naming installers, so a mismatch can produce a tag and artifacts with different versions.

## 3. Commit and push the branch

```bash
git add package.json packages/desktop/package.json bun.lock
git commit -m "chore(release): v${release_version}"
git push -u origin "$release_branch"
```

## 4. Tag and push

```bash
release_tag="v${release_version}"

test -z "$(git status --porcelain)"
test "$(git branch --show-current)" = "$release_branch"
git tag -a "$release_tag" -m "$release_tag"
git push origin "$release_tag"
```

A `-` in the tag (e.g. `v0.19.0-rc.1`) tells the workflow to mark the GitHub Release as **pre-release** automatically. Plain `vX.Y.Z` tags publish as stable releases.

Pushing the tag is the release trigger. Do not create a GitHub Release manually; the workflow creates a draft, uploads all artifacts, and publishes it after every platform build succeeds.

## 5. Open a tracking PR (RC only)

Open a **draft** PR from `release/vX.Y.0` → `main` for visibility. Do **not** merge it until the matching stable tag is pushed — merging an RC commit would freeze `main` at the RC version.

```bash
gh pr create --repo cinesim/videodown --draft --base main --head "$release_branch" \
  --title "chore(release): ${release_branch#release/} release branch (DO NOT MERGE until stable)" \
  --body "Tracking branch for ${release_branch#release/}. Merge after the stable tag is published."
```

## 6. Monitor the workflow

```bash
gh run list --repo cinesim/videodown --workflow=release.yml --limit 3
gh run watch --repo cinesim/videodown <run-id> --exit-status
```

Approximate timing: validate ~30 s · build matrix ~15–30 min (5 platforms in parallel) · publish ~1 min.

The same run is visible in the GitHub Actions tab:

`https://github.com/cinesim/videodown/actions/workflows/release.yml`

## 7. Verify the published release

```bash
gh release view --repo cinesim/videodown "$release_tag"
```

Confirm:

- `Pre-release` badge on the release page (RC only)
- **24 assets**:
  - **Linux** (5): `AppImage`, `deb`, `rpm`, `snap`, `tar.gz`
  - **macOS arm64** (4): `dmg`, `dmg.blockmap`, `zip`, `zip.blockmap`
  - **macOS x64** (4): `dmg`, `dmg.blockmap`, `zip`, `zip.blockmap`
  - **Windows x64** (3): `setup.exe`, `setup.exe.blockmap`, `zip`
  - **Windows arm64** (3): `setup.exe`, `setup.exe.blockmap`, `zip`
  - **Auto-updater metadata** (4): `latest.yml`, `latest-mac.yml`, `latest-linux.yml`, `builder-debug.yml`
  - **Checksums** (1): `SHA256SUMS.txt`
- Auto-generated release notes list the PRs merged since the previous tag

## 8. Post-stable cleanup (after stable `vX.Y.0` ships)

1. Mark the tracking PR from step 5 ready for review and merge it into `main`.
2. In a follow-up PR, set the next development version (for example, `0.20.0-dev`) in both `package.json` and `packages/desktop/package.json`.
3. Run `bun install` and include the resulting `bun.lock` update in that PR.

---

For hotfixes off a previously-released tag, see [RELEASE_HOTFIX.md](RELEASE_HOTFIX.md). Once the hotfix branch is ready, steps 2–7 above apply.
