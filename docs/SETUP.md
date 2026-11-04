# Repository Setup & Configuration Guide

Follow these exact, click-by-click instructions and terminal commands to set up, configure, and operate the `ci-cd-pipeline-showcase` repository on GitHub.

---

## Step 1: Create the Empty GitHub Repository

1. Navigate to GitHub and log in to your account (`giftstack-dev`).
2. Click the **+** (plus) icon in the upper right corner and select **New repository** (or visit [https://github.com/new](https://github.com/new)).
3. Configure the following fields:
   - **Repository owner:** `giftstack-dev`
   - **Repository name:** `ci-cd-pipeline-showcase`
   - **Description:** `Production CI/CD pipeline showcase with automated testing, container security scanning, and multi-environment delivery.`
   - **Visibility:** **Public**
   - **Initialize this repository with:**
     - ❌ **Uncheck** *Add a README file*
     - ❌ **Uncheck** *Add .gitignore*
     - ❌ **Uncheck** *Choose a license*
     *(The local repository already contains these files).*
4. Click **Create repository**.

---

## Step 2: Initialize Git, Commit, and Push

In your local project root directory (where this project is downloaded/extracted), run:

```bash
# Initialize git repository
git init

# Stage all files
git add .

# Create the initial commit
git commit -m "feat: initial commit with full CI/CD pipeline, backend, and dashboard"

# Ensure the default branch is named 'main'
git branch -M main

# Add the remote origin
git remote add origin https://github.com/giftstack-dev/ci-cd-pipeline-showcase.git

# Push the codebase to GitHub
git push -u origin main
```

---

## Step 3: Enable GitHub Pages for Frontend Hosting

1. Open your repository on GitHub: `https://github.com/giftstack-dev/ci-cd-pipeline-showcase`
2. Click **Settings** in the top navigation tab bar.
3. In the left sidebar under the *Code and automation* section, click **Pages**.
4. Under **Build and deployment > Source**, select **GitHub Actions** from the dropdown menu (do **not** select "Deploy from a branch").
5. The page will save automatically.

---

## Step 4: Configure Workflow Permissions

GitHub Actions requires read and write access to create GitHub Releases and publish container packages to GHCR.

1. In repository **Settings**, click **Actions > General** in the left sidebar.
2. Scroll down to the **Workflow permissions** section.
3. Select **Read and write permissions**.
4. Check the box for **Allow GitHub Actions to create and approve pull requests** (optional, recommended for Dependabot).
5. Click **Save**.

---

## Step 5: Configure Deployment Environments

1. In repository **Settings**, click **Environments** in the left sidebar.
2. Click **New environment**.
   - Name: `staging`
   - Click **Configure environment**. (No required reviewers needed for staging).
3. Return to **Environments** and click **New environment** again.
   - Name: `production`
   - Click **Configure environment**.
   - Under **Deployment protection rules**, check **Required reviewers**.
   - Search for your GitHub username (`giftstack-dev`), select it, and click **Save protection rules**.

---

## Step 6 (Optional): Configure Live Backend Deployment on Render

If you wish to deploy a live backend instance instead of running in Demo Mode:

1. Create a free account at [Render.com](https://render.com).
2. Click **New + > Web Service**.
3. Choose **Deploy an existing image** and specify the image URL:
   `ghcr.io/giftstack-dev/ci-cd-pipeline-showcase-backend:latest` (or link your GitHub repository and select the `backend/Dockerfile`).
4. Set the container port to `8000`.
5. Under your Render Web Service settings, locate the **Deploy Hook** URL and copy it.
6. In your GitHub repository, go to **Settings > Secrets and variables > Actions**:
   - In the **Secrets** tab, click **New repository secret**:
     - Name: `STAGING_DEPLOY_HOOK_URL` -> Value: *Your Render staging deploy hook URL*
     - Name: `PRODUCTION_DEPLOY_HOOK_URL` -> Value: *Your Render production deploy hook URL*
   - In the **Variables** tab, click **New repository variable**:
     - Name: `STAGING_API_URL` -> Value: `https://your-staging-render-service.onrender.com`
     - Name: `PRODUCTION_API_URL` -> Value: `https://your-prod-render-service.onrender.com`

> *Note: If these secrets are omitted, the pipeline continues smoothly. The deployment steps skip cleanly without failing, and the frontend dashboard automatically activates its interactive Demo Mode.*

---

## Step 7: Configure Branch Protection for `main`

1. In repository **Settings**, click **Branches** in the left sidebar.
2. Under **Branch protection rules**, click **Add branch ruleset** (or **Add rule**).
   - **Branch name pattern:** `main`
3. Enable the following protections:
   - ✅ **Require a pull request before merging**
     - Require approvals: `1` (or `0` if you are a solo maintainer)
   - ✅ **Require status checks to pass before merging**
     - Check **Require branches to be up to date before merging**
     - In the search box, enter and select: `ci-success`
   - ✅ **Block force pushes**
   - ✅ **Do not allow deletions**
4. Click **Create** or **Save changes**.

---

## Step 8: Make the Container Package Public

When the first container image is published to GitHub Packages (`ghcr.io`):

1. Go to your GitHub profile: `https://github.com/giftstack-dev?tab=packages`
2. Click on the package named `ci-cd-pipeline-showcase-backend`.
3. In the right sidebar, click **Package settings**.
4. Scroll to the bottom to the **Danger Zone** section.
5. Under **Change package visibility**, select **Public**, type the package name to confirm, and click **I understand the consequences, make this package public**.
*(This allows cloud providers like Render or Docker engines to pull the image without authentication).*

---

## Step 9: Verify the Full Pipeline End-to-End

### Part A: Test Pull Request & CI Gates
1. Create and switch to a test branch:
   ```bash
   git checkout -b test/verify-pipeline
   ```
2. Make a small non-functional edit (e.g. add a comment to `backend/app/main.py`).
3. Commit and push:
   ```bash
   git commit -am "test: verify automated pull request checks"
   git push origin test/verify-pipeline
   ```
4. On GitHub, open a **Pull Request** targeting `main`.
5. Observe the checks running in real-time:
   - `Backend Lint (Ruff)`
   - `Backend Test (Python 3.11)` and `Backend Test (Python 3.12)`
   - `Frontend Quality & Build`
   - `Workflow Lint (Actionlint)`
   - `ci-success`
   - `CodeQL Analysis`
   - `Gitleaks`
6. Once all checks pass, merge the pull request.
7. Navigate to the **Actions** tab and observe the **Build and Deploy** workflow:
   - Docker container build and Trivy vulnerability scan
   - Container push to `ghcr.io`
   - Frontend deployment to GitHub Pages

### Part B: Test Tag-Based Production Release & Manual Gate
1. Pull the merged `main` branch locally:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and push the release tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Go to GitHub Actions and open the running **Release** workflow:
   - Notice the `verify` job validates that `v1.0.0` matches the `/VERSION` file.
   - Container image is tagged with `1.0.0`, `1.0`, and `latest`.
   - GitHub Release `v1.0.0` is published with attached `frontend-dist-1.0.0.zip`.
   - The `deploy-production` job enters the **Waiting for review** state!
4. Click **Review deployments**, check the `production` environment box, and click **Approve and deploy**.
5. Watch the production deployment complete.

---

## Step 10: Troubleshooting Top 6 Common Failures

### 1. GitHub Pages Fails with "Deployment request failed"
- **Cause:** Pages source is configured to a branch instead of GitHub Actions.
- **Fix:** Navigate to **Settings > Pages** and ensure **Source** is set to **GitHub Actions**.

### 2. GHCR Fails with "403 Forbidden" or "denied: installation not allowed to Write organization package"
- **Cause:** Actions does not have package write permissions.
- **Fix:** In **Settings > Actions > General > Workflow permissions**, select **Read and write permissions**.

### 3. Ruff Lint or Formatting Failure in CI
- **Cause:** Unformatted Python code or unused imports committed locally.
- **Fix:** Run locally:
  ```bash
  ruff format backend
  ruff check --fix backend
  ```
  Commit and push the changes.

### 4. Pytest Fails with "Coverage failure: total 84% is less than 85%"
- **Cause:** New endpoint or model code was added without corresponding unit test assertions.
- **Fix:** Add tests in `backend/tests/test_api.py` covering all new branches and run `pytest --cov=app --cov-fail-under=85 backend/tests/` to confirm.

### 5. Release Workflow Fails at Verify Job ("Tag version does not match /VERSION")
- **Cause:** Pushed a tag (e.g., `v1.2.0`) while `/VERSION` contains an older version (e.g., `1.0.0`).
- **Fix:** Update the `/VERSION` file, commit and merge to `main`, then re-create and push the matching tag.

### 6. Production Job Does Not Pause for Approval
- **Cause:** Environment `production` was not created under **Settings > Environments** or has no required reviewers configured.
- **Fix:** Create the environment named `production` under **Settings > Environments** and assign yourself as a **Required reviewer**.
