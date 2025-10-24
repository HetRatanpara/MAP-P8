# CI/CD Practical — Instructor One-Page Handout

![Jenkins Build](https://img.shields.io/badge/jenkins-BUILD_PASSING-brightgreen) ![Tests](https://img.shields.io/badge/tests-passing-brightgreen) ![Registry](https://img.shields.io/badge/registry-local%3A5000-blue)

## Purpose

This single-file handout explains a lightweight, local CI/CD practical using Jenkins, Docker and docker-compose. It's designed for a 10–15 minute instructor demo you can run from your laptop (Windows, cmd.exe).

Goals (what the demo shows)

- Checkout code from Git
- Run unit tests (npm)
- Build a Docker image and push to a local registry
- Deploy the image to a staging stack using docker compose

Architecture (compact)

Developer (push) ---> Jenkins (pipeline) ---> Registry (localhost:5000) ---> Staging (docker compose)

## Quick commands — run these on Windows (cmd.exe)

All commands assume your current working directory is the repo root (where this README sits).

- Start Jenkins + local registry (builds the custom Jenkins image used in the demo):

```cmd
docker compose -f jenkins/docker-compose.yml up -d --build
```

- Follow Jenkins logs and get the initial admin password:

```cmd
docker logs jenkins -f
```

or, if the volume is mapped locally:

```cmd
type jenkins\jenkins_home\secrets\initialAdminPassword
```

- Open Jenkins UI: http://localhost:8080 — install recommended plugins (Git, Pipeline). Create a Pipeline or Multibranch Pipeline and point it at this repo.

- Run tests locally (optional quick check):

```cmd
cd app
npm ci
npm test
```

- Manually build & push an image (if you want to test registry behavior before Jenkins):

```cmd
docker build -t localhost:5000/sample-node-app:local -f app/Dockerfile app
docker push localhost:5000/sample-node-app:local
```

- Deploy staging manually (compose will pull the tag in IMAGE_TAG or default to latest):

```cmd
set IMAGE_TAG=local
docker compose -f deploy/staging/docker-compose.yml pull
docker compose -f deploy/staging/docker-compose.yml up -d
```

## Quick verification (what to show the instructor)

- Jenkins pipeline log — show stages: Checkout → Install & Test → Build Image → Push Image → Deploy Staging
- Registry tags (query the registry API):

```cmd
curl http://localhost:5000/v2/sample-node-app/tags/list
```

- Staging service reachable (default mapping in stack):

```cmd
curl http://localhost:3001/
```

## Notes & gotchas (short)

- If Docker refuses to push to `localhost:5000`, mark it as insecure in Docker Desktop: Settings → Docker Engine and add:

```json
{ "insecure-registries": ["localhost:5000"] }
```

- If Jenkins cannot push because `registry-creds` is missing, open Jenkins → Credentials → Add Global credential (Kind: Username with password or Secret text) with ID `registry-creds`.

- The demo config mounts the host Docker socket into Jenkins for convenience. This is OK for a local demo but not for production.

## Instructor demo script (10–12 minutes)

1. Show repo tree and the `Jenkinsfile` (1 min).
2. Start Jenkins: run the docker compose command and show logs until Jenkins is ready (2–3 min).
3. Run `npm test` in `app/` to show tests pass (1 min).
4. Trigger the Jenkins job (Build Now) and walk the console: show each stage (4–5 min).
5. Open the staging endpoint and show the running app (1–2 min).

Suggested small improvements (post-demo)

- Add an approval step before production deploy.
- Add a smoke test stage that runs after deploy to verify the service is up.
- Replace the controller-mounted docker socket with ephemeral build agents for safer demos.

## Badges and status

The badges at the top are static placeholders for this local demo. For live status replace them with your Jenkins or CI provider badge URLs.

## One-file summary

This README is the one-page handout you can read aloud to your instructor and use during your demo. It contains the commands (Windows `cmd.exe`) needed to run the full pipeline locally, where to look for verification, and what to say while demonstrating.

If you want, I can:

- Create a printable PDF version of this page formatted for a one-page handout, or
- Add a ready-to-print slide (A4) with the same content.

---

End of handout — good luck with your demo!

# Jenkins CI/CD Practical (local, Windows-friendly)

This workspace contains a minimal end-to-end CI/CD example using Jenkins and other open-source tools.

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

```cmd
docker tag localhost:5000/sample-node-app:local localhost:5000/sample-node-app:local
docker push localhost:5000/sample-node-app:local
```

Verify tags in the registry:

```cmd
curl http://localhost:5000/v2/sample-node-app/tags/list
```

Deploying to staging (manual)

1. If the registry has the `latest` tag, the provided staging compose expects `:latest`. If you pushed `:local` instead, either retag it as `:latest` and push, or change the compose to use `:local`.

To retag and push `latest`:

```cmd
docker tag localhost:5000/sample-node-app:local localhost:5000/sample-node-app:latest
docker push localhost:5000/sample-node-app:latest
```

To deploy using the provided compose file:

```cmd
docker compose -f deploy/staging/docker-compose.yml pull
docker compose -f deploy/staging/docker-compose.yml up -d
```

Staging will be available at http://localhost:3001/ (per `deploy/staging/docker-compose.yml`).

How the `Jenkinsfile` works (stage-by-stage)

- environment:
  - REGISTRY = "localhost:5000"
  - IMAGE = "${REGISTRY}/sample-node-app"

Stages:

1. Checkout — Jenkins checks out the repository using SCM configured on the job.
2. Install & Test — runs `npm ci` and `npm test` inside the `app` directory. This validates your code before building an image.
3. Build Image — runs `docker build -t ${IMAGE}:${BUILD_NUMBER} app` and tags `:latest` as well.
4. Push Image — pushes both `${BUILD_NUMBER}` tag and `latest` to the registry.
5. Deploy Staging — runs `docker-compose -f deploy/staging/docker-compose.yml pull` and `up -d` on the host where the Jenkins job executes.

Notes on immutability and best practice

- The pipeline currently tags with `BUILD_NUMBER` and also pushes `latest`. For reproducible deployments prefer deploying a specific immutable tag (e.g., `${BUILD_NUMBER}`) rather than `latest`.
- To use immutable tags in deployment, parameterize your compose files and have the pipeline pass the tag when running `docker-compose`.

Suggested `deploy` change (parameterized image tag)

Change `deploy/staging/docker-compose.yml` image line to:

```yaml
image: localhost:5000/sample-node-app:${IMAGE_TAG:-latest}
```

Then deploy with:

```cmd
set IMAGE_TAG=123
docker compose -f deploy/staging/docker-compose.yml pull
docker compose -f deploy/staging/docker-compose.yml up -d
```

CI security and credential notes

- Do not run builds that use the controller as a build node in production; prefer ephemeral agents.
- If you move to Docker Hub or another remote registry, add credentials in Jenkins (Credentials → Username with password or Docker Registry credential) and use `docker login` in the pipeline or the Docker Jenkins plugin.

Troubleshooting (common issues and fixes)

- "failed to resolve reference ... not found": you are attempting to pull a tag (e.g., `latest`) that is absent in the registry — retag or adjust compose.
- Jenkins can't run docker: ensure `/var/run/docker.sock` is mounted into the Jenkins container and the user inside Jenkins has access to it. The provided `jenkins/docker-compose.yml` already mounts it by default.
- On Windows, mounting the Docker socket may be problematic. Use WSL2 with Docker Desktop enabled, or run a dedicated build agent with Docker installed.
- Registry push blocked: add `localhost:5000` to `insecure-registries` in Docker Desktop settings.

Files added and where to look

- `app/` — app code and tests
- `app/Dockerfile` — image build
- `jenkins/Dockerfile` — Jenkins image (adds Docker CLI)
- `jenkins/docker-compose.yml` — brings up Jenkins and a local registry
- `Jenkinsfile` — pipeline used by Jenkins jobs
- `deploy/staging/docker-compose.yml` and `deploy/production/docker-compose.yml` — deployment stacks

How to demonstrate this to your instructor (suggested script)

1. Show repository tree and explain each file's purpose (2 minutes).
2. Start Jenkins + registry (show command and logs) (2 minutes).
3. Run tests locally (`npm test`) and show they pass (1 minute).
4. Build and push an image to the local registry; show the `docker push` output and query tags via the registry API (2 minutes).
5. Trigger the Jenkins pipeline (click Build Now) and walk through build logs showing the stages: checkout → test → build → push → deploy (4–6 minutes).
6. Show deployed staging site (open http://localhost:3001/) and logs (docker compose logs) (2 minutes).

Next steps and improvements (for further work)

- Add secret management: store registry credentials and other secrets in Jenkins Credentials or Vault.
- Add static analysis and policy checks (SonarQube, ESLint, Trivy) into the pipeline.
- Replace docker-compose deployments with Kubernetes (Helm / ArgoCD) for production-grade deployments.
- Use a secure, external registry (Docker Hub, GitHub Container Registry) and rotate credentials.

Contact / Notes

If you want, I can update the repo to:

- Parameterize deployment compose files to accept `IMAGE_TAG` and update `Jenkinsfile` to deploy a specific build tag (immutable deploys).
- Add a small Jenkins pipeline example that logs into a secured registry using credentials stored in Jenkins.

---

This README is intended to be read alongside a live demo. If you'd like, I can create a one-page slide or step-by-step handout formatted for printing/presentation for your instructor.
