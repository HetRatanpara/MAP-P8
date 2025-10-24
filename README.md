# CI/CD Practical — Instructor One-Page Handout

![Jenkins Build](https://img.shields.io/badge/jenkins-BUILD_PASSING-brightgreen) ![Tests](https://img.shields.io/badge/tests-passing-brightgreen) ![Registry](https://img.shields.io/badge/registry-local%3A5000-blue)

## Purpose

This single-file handout explains a lightweight, local CI/CD practical using Jenkins, Docker and docker-compose. It's designed for a 10–15 minute instructor demo you can run from your laptop (Windows, cmd.exe).

Goals (what the demo shows)

- Checkout code from Git

# Quick README — minimal steps to run the CI/CD demo (Windows cmd.exe)

This file contains only the necessary steps you need to run the practical locally and verify the staging service. Keep it open during your demo.

Prerequisites

- Docker Desktop (Linux containers) installed and running
- Docker CLI and Docker Compose available (Docker Desktop provides both)
- 4 GB free RAM recommended

Start Jenkins + local registry

1. Open cmd.exe in the repo root (where this README sits).
2. Start services (builds Jenkins image if needed):

```cmd
docker compose -f jenkins/docker-compose.yml up -d --build
```

3. Confirm Jenkins is up:

```cmd
docker compose -f jenkins/docker-compose.yml ps
```

One-time Jenkins setup (UI)

1. Open http://localhost:8080 and complete the setup wizard (use initial admin password from logs):

```cmd
docker logs jenkins -f
```

2. Install recommended plugins (ensure Git and Pipeline are installed).
3. (Optional) Add Docker registry credential if you use a secured registry:
   Jenkins → Credentials → System → Global → Add Credentials
   - Kind: Username with password or Secret text
   - ID: registry-creds

Run the pipeline

1. In Jenkins create a Pipeline (or Multibranch) job pointing to this repo. Jenkins will use the `Jenkinsfile` in the repo.
2. Click Build Now on your branch job.
3. Watch Console Output: stages you should see — Checkout, Install & Test, Build Image, Push Image, Deploy Staging.

Verify the image and staging service

1. Check registry tags (should include build number and latest):

```cmd
curl http://localhost:5000/v2/sample-node-app/tags/list
```

2. Confirm staging containers are running:

```cmd
docker compose -f deploy/staging/docker-compose.yml ps
```

3. Check logs (follow):

```cmd
docker compose -f deploy/staging/docker-compose.yml logs -f
```

4. Call the service (the app returns JSON):

```cmd
curl http://localhost:3001/
```

Expected response:

```json
{ "status": "ok", "env": "staging" }
```

Notes & quick fixes

- If `curl` is missing on Windows, open http://localhost:3001/ in your browser.
- If push fails with `unauthorized`, add `registry-creds` in Jenkins (see above) and re-run the job.
- If Docker refuses to push to localhost:5000, add `"insecure-registries": ["localhost:5000"]` to Docker Desktop → Settings → Docker Engine (JSON) and restart Docker.

Manual deploy (replicate what pipeline runs)

1. If you want to manually deploy a specific tag (e.g., 16):

```cmd
set IMAGE_TAG=16
docker compose -f deploy/staging/docker-compose.yml pull
docker compose -f deploy/staging/docker-compose.yml up -d
curl http://localhost:3001/
```

Cleanup

```cmd
docker compose -f deploy/staging/docker-compose.yml down
docker compose -f jenkins/docker-compose.yml down
```

If anything fails: copy the Jenkins Console Output or the `docker compose` logs and paste them here — I will help pinpoint the fix.

That's it — this file contains the minimum commands and steps you need to run the demo and prove the staging service is reachable.

What you get

- A tiny Node.js Express sample app (in `app/`) with tests and a Dockerfile.
- A Jenkins setup using Docker Compose (`jenkins/docker-compose.yml`) that also runs a local Docker Registry.
- A custom Jenkins image Dockerfile that includes Docker CLI and docker-compose so pipelines can build and deploy images.
- A Declarative `Jenkinsfile` at the repo root showing build/test/image/push/deploy stages.
- `deploy/staging/` and `deploy/production/` docker-compose stacks that pull images from the local registry.

High-level flow

1. Start Jenkins + registry with Docker Compose.
2. Create a Pipeline job (or Multibranch) in Jenkins that points to this repository.
3. The pipeline checks out code, runs `npm test`, builds a Docker image, pushes it to the local registry, then deploys to staging or production stacks.

Prerequisites (Windows, cmd.exe)

- Docker Desktop for Windows (use Linux containers)
- docker and docker-compose available in PATH
- At least 4 GB free RAM for Docker

Quick start (Windows cmd.exe)

1. Open a command prompt in the workspace root.
2. Start services:

   docker compose -f jenkins/docker-compose.yml up -d --build

3. Wait for Jenkins to start. Get initial admin password:

   docker logs jenkins -f

   (or)
   type jenkins\jenkins_home\secrets\initialAdminPassword

4. Open http://localhost:8080 in your browser and follow the initial setup. Install recommended plugins and the following plugins at minimum: Git, Pipeline, Docker Pipeline (optional), Blue Ocean (optional).

5. Create credentials as needed (Git credentials if your repository is private). For the local registry we show no-auth examples; in production use secured registries.

6. Create a Pipeline job pointing to this repo (or Multibranch) — it will detect `Jenkinsfile` and run the pipeline.

## Jenkins CI/CD Practical — Instructor-ready README

This repository contains a minimal end-to-end CI/CD practical you can run locally. It demonstrates a complete pipeline implemented with Jenkins that builds, tests, packages as a Docker image, pushes to a (local) Docker registry, and deploys to staging and production docker-compose stacks.

Contents and purpose

- `app/` — minimal Node.js Express application with unit/integration test and a `Dockerfile`.
- `jenkins/` — contains a Dockerfile to build a Jenkins image (with Docker CLI) and `docker-compose.yml` to run Jenkins and a local registry.
- `Jenkinsfile` — Declarative pipeline that runs tests, builds and pushes Docker images, and deploys to staging.
- `deploy/staging/docker-compose.yml` and `deploy/production/docker-compose.yml` — deployment stacks that pull images from the local registry.

Architecture (text diagram)

```
  +-----------+    git     +----------+   docker push   +-----------+   docker pull  +-----------+
  | Developer | -------->  | Jenkins  | --------------> | Registry  | --------------> | Staging   |
  | (you)     |           | (CI/CD)  |                 | (localhost:5000) |           | (docker-compose)
  +-----------+           +----------+                 +-----------+               +-----------+
```

How this practical maps to learning objectives

- Understand Jenkins pipeline stages (checkout, test, build, push, deploy)
- Learn how to containerize an application and push to a registry
- Practice deploying a Docker image with docker-compose
- Troubleshoot common issues: docker socket, insecure registry, tagging

Prerequisites (Windows, cmd.exe)

- Docker Desktop for Windows (set to Linux containers) and running
- Docker CLI + docker compose available in your PATH (Docker Desktop includes both)
- ~4 GB available RAM for Docker

Quick setup (commands for Windows cmd.exe)

1. From the repository root, start Jenkins and the local registry:

```cmd
docker compose -f jenkins/docker-compose.yml up -d --build
```

2. Wait until Jenkins finishes initializing. To follow logs and find the initial admin password:

```cmd
docker logs jenkins -f
```

or (if the jenkins_home volume is mapped locally):

```cmd
type jenkins\\jenkins_home\\secrets\\initialAdminPassword
```

3. Open the Jenkins UI at: http://localhost:8080

   - Complete the wizard and install recommended plugins.
   - Install at minimum: Git, Pipeline. Optionally install Blue Ocean and Docker Pipeline.

4) Create a new Pipeline job (or Multibranch Pipeline):
   - New Item → [enter name] → Pipeline (or Multibranch Pipeline)
   - For a Pipeline job: in the Pipeline section choose “Pipeline script from SCM” → SCM: Git → Repository: your repo URL → Script Path: `Jenkinsfile`.

Jenkins credentials and registry login (recommended)

- If you want Jenkins to push to a secured registry (Docker Hub, GitHub Packages, private registry), create credentials in Jenkins:

  1. In Jenkins UI: Credentials → System → Global credentials (unrestricted) → Add Credentials.
  2. Kind: "Username with password" (or Docker Registry credential plugin if installed).
  3. Username: (your registry username)
  4. Password: (your registry password or token)
  5. ID: `registry-creds` (or set the ID of your choice and update `Jenkinsfile` accordingly)

- The pipeline's `Jenkinsfile` now looks for `REGISTRY_CREDENTIALS` environment variable (default `registry-creds`) and will perform a `docker login` using those credentials before pushing images.

How we handle image tags and immutable deploys (important for demonstrations)

- The pipeline builds an image tagged with `${BUILD_NUMBER}` and also tags `latest` for convenience. It pushes both tags to the registry.
- Deployments now use the specific `${BUILD_NUMBER}` tag to ensure immutability. The `deploy/*/docker-compose.yml` files accept an `IMAGE_TAG` environment variable and default to `latest` when not provided.

To run a full demo after configuring Jenkins credentials:

1. Start Jenkins + registry: `docker compose -f jenkins/docker-compose.yml up -d --build`
2. Create credentials in Jenkins (ID `registry-creds`) as described above.
3. Create the Pipeline job pointing to this repo (script from SCM). Jenkins will read the `Jenkinsfile` and run the pipeline when you click Build Now.

What the pipeline will do when you click Build Now

1. Checkout the repo
2. Run `npm ci` & `npm test` in `app/`
3. Build Docker image `localhost:5000/sample-node-app:${BUILD_NUMBER}` and tag `latest`
4. Login to the registry using the Jenkins credentials (if present)
5. Push both `${BUILD_NUMBER}` and `latest` tags
6. Run `docker-compose` on the host to pull and deploy the specific `${BUILD_NUMBER}` tag to staging

Local testing (before using Jenkins)

1. Run tests locally from the `app` directory:

```cmd
cd app
npm ci
npm test
```

2. Build the Docker image and run it locally:

```cmd
docker build -t localhost:5000/sample-node-app:local -f app/Dockerfile app
docker run -p 3000:3000 localhost:5000/sample-node-app:local
```

Then open http://localhost:3000/ or run:

```cmd
curl http://localhost:3000/
```

Working with the local registry

- The compose setup creates a registry at `localhost:5000`.
- If Docker refuses to push to `localhost:5000`, add this to Docker Desktop → Settings → Docker Engine JSON:

```json
{ "insecure-registries": ["localhost:5000"] }
```

then Apply & Restart Docker Desktop.

Example: tag and push an image (you may have done this already):

---

# MAP-P8 — Quick & Clean README (minimum steps)

This file gives the exact, minimal steps you need to run the CI/CD practical locally on Windows (cmd.exe).

What this repo does (short)

- Builds and tests a small Node.js app
- Packages it as a Docker image, pushes to a local registry (localhost:5000)
- Deploys the image to a staging docker-compose stack

Prerequisites

- Docker Desktop for Windows (Linux containers)
- 4 GB free RAM recommended

Quick start (copy & run in cmd.exe from repo root)

1. Start Jenkins + registry (builds images if needed):

```cmd
docker compose -f jenkins/docker-compose.yml up -d --build
```

2. Confirm Jenkins is running:

```cmd
docker compose -f jenkins/docker-compose.yml ps
```

One-time: set up Jenkins UI

1. Open http://localhost:8080 and follow the wizard. Get the initial password from:

```cmd
docker logs jenkins -f
```

2. Install recommended plugins (ensure Git and Pipeline are installed).
3. (Optional) Add Docker registry credential if you later use a secured registry:
   Jenkins → Credentials → System → Global → Add Credentials
   - Kind: Username with password or Secret text
   - ID: registry-creds

Run the pipeline

1. Create a Pipeline or Multibranch Pipeline in Jenkins that points to this repository (it will use the `Jenkinsfile`).
2. Click Build Now on the branch job.
3. Watch Console Output. Expected stages:
   - Checkout
   - Install & Test (npm)
   - Build Image (docker build)
   - Push Image (docker push)
   - Deploy Staging (docker compose pull & up -d)

Verify the deployment

1. Registry tags (shows available tags):

```cmd
curl http://localhost:5000/v2/sample-node-app/tags/list
```

2. Check staging containers and logs:

```cmd
docker compose -f deploy/staging/docker-compose.yml ps
docker compose -f deploy/staging/docker-compose.yml logs -f
```

3. Query the service (staging maps host port 3001 -> container 3000):

```cmd
curl http://localhost:3001/
```

Expected response:

```json
{ "status": "ok", "env": "staging" }
```

Manual deploy (same commands pipeline runs)

```cmd
set IMAGE_TAG=16
docker compose -f deploy/staging/docker-compose.yml pull
docker compose -f deploy/staging/docker-compose.yml up -d
curl http://localhost:3001/
```

Common quick fixes

- If push is `unauthorized`: add `registry-creds` in Jenkins and re-run the job.
- If Docker blocks push to localhost:5000, add to Docker Desktop → Settings → Docker Engine JSON:

```json
{ "insecure-registries": ["localhost:5000"] }
```

- If Jenkins reports `docker compose: not found`, rebuild the Jenkins image with docker-cli & compose plugin and restart the jenkins stack:

```cmd
docker compose -f jenkins/docker-compose.yml up -d --build
```

Cleanup

```cmd
docker compose -f deploy/staging/docker-compose.yml down
docker compose -f jenkins/docker-compose.yml down
```

