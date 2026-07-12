---
name: dsa-docker-deploy
description: "Deploy DSA (Daily Stock Analysis) server to remote server via Docker. Use when the user wants to build, save, transfer, and deploy the DSA Docker image to the production server. Triggers: 'deploy DSA', 'push to server', '更新服务器', '部署DSA', 'docker deploy'. Steps: build image → save to tar → scp to remote → SSH to load and restart."
version: 1.0.0
---

# DSA Docker Deploy Skill

Deploy the Daily Stock Analysis (DSA) server to the production server using Docker.

## Prerequisites

- Docker must be installed and running locally
- SSH key at `D:\aly-key.pem` for remote server access
- Remote server: `root@47.76.111.5`
- Docker Compose config at `/opt/dsa/docker/` on remote

## Workflow

### Step 1: Build Docker Image

```bash
docker build -f docker/Dockerfile -t dsa-server:latest . 2>&1
```

Working directory: `D:\daily_stock_analysis`

Wait for build to complete. Check for "Successfully built" or "ERROR" in output.

### Step 2: Save and Transfer Image

```bash
docker save dsa-server:latest -o D:\dsa-server-latest.tar
scp -i D:\aly-key.pem D:\dsa-server-latest.tar root@47.76.111.5:/root/dsa-server-latest.tar 2>&1
```

This step can take several minutes depending on image size.

### Step 3: Deploy on Remote Server

```bash
ssh -i D:\aly-key.pem root@47.76.111.5 "docker load -i /root/dsa-server-latest.tar && cd /opt/dsa/docker && docker compose up -d --force-recreate 2>&1"
```

### Step 4: Verify Deployment

```bash
ssh -i D:\aly-key.pem root@47.76.111.5 "sleep 10 && curl -s https://alpha.cyberloom.work/api/health" 2>&1
```

Wait 10 seconds for container to start, then check health endpoint.

### Step 5: Cleanup

```bash
Remove-Item "D:\dsa-server-latest.tar" -ErrorAction SilentlyContinue
```

## Error Handling

- If Docker build fails, check Dockerfile and dependencies
- If SCP fails, verify SSH key path and server connectivity
- If health check fails, check container logs: `ssh -i D:\aly-key.pem root@47.76.111.5 "docker logs dsa-server --tail 50"`

## Notes

- The entire workflow typically takes 3-5 minutes
- Health endpoint: `https://alpha.cyberloom.work/api/health`
- Docker Compose project is at `/opt/dsa/docker/` on remote
