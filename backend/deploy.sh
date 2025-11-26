#!/bin/bash

# git fetch origin
# git checkout dev
# git pull --rebase origin dev
docker buildx build --platform linux/amd64 -f Dockerfile \
  -t smart-monitor-iam:latest \
  --load .
docker tag smart-monitor-iam:latest 103.20.144.134:80/develop/smart-monitor-iam:latest
docker push 103.20.144.134:80/develop/smart-monitor-iam:latest
