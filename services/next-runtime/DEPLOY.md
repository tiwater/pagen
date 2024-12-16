# Deployment Guide

This guide explains how to deploy the Pagen runtime to Railway.

## Prerequisites

1. Install the Railway CLI:
```bash
brew install railway
```

2. Login to Railway:
```bash
railway login
```

## Deployment Steps

1. Create a new project in Railway:
```bash
railway init
```

2. Link your local repository:
```bash
railway link
```

3. Deploy the application:
```bash
railway up
```

4. Set up environment variables in Railway dashboard:
- `NODE_ENV`: development
- `PORT`: 3000
- `HOSTNAME`: 0.0.0.0

## Volume Management

The Docker container uses a volume mount at `/app/app/pages` for dynamic page updates. Railway will automatically manage this volume.

## Monitoring

1. View logs:
```bash
railway logs
```

2. Check status:
```bash
railway status
```

## Troubleshooting

1. If the deployment fails, check the logs:
```bash
railway logs
```

2. Verify the environment variables are set correctly in the Railway dashboard

3. Ensure the Docker build succeeds locally:
```bash
docker build -t pagen-runtime -f docker/Dockerfile .
docker run -p 3000:3000 pagen-runtime
```
