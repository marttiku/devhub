# DevHub

Local developer dashboard — shows all your `/Coding` projects and Docker containers in one view.

## Features

- Live status for Docker containers (WebSocket updates)
- Git info: branch, last commit, link to remote (GitHub/GitLab)
- Start/stop Docker projects with one click
- Open in browser (auto-starts stopped projects)
- Open in Cursor IDE

## Requirements

- macOS (for `open` and `cursor` commands)
- Docker Desktop
- Node.js 18+
- `gh` CLI (optional, for repo creation)

## Install

```bash
git clone https://github.com/marttiku/devhub
cd devhub
cp .env.example .env   # edit HOST_CODING_ROOT if your Coding folder is elsewhere
./install.sh
```

Open http://localhost:4242

## Update

```bash
git pull && docker compose up -d --build
```

## Commands

| Command | Purpose |
|---|---|
| `docker compose up -d` | Start DevHub |
| `docker compose down` | Stop DevHub |
| `docker compose logs -f` | View logs |
| `pm2 status` | Check host helper |
| `pm2 restart devhub-helper` | Restart host helper |

## Architecture

- **Docker container** (port 4242): Node.js + Express API + React UI. Mounts `/var/run/docker.sock` for container management and `/Coding` as read-only for project scanning.
- **Host helper** (port 4243, managed by pm2): tiny Node.js HTTP server that handles `open` (browser) and `cursor` (IDE) commands from the container.
