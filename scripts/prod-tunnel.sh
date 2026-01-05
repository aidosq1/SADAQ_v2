#!/bin/bash

# Script to establish SSH tunnel to production database
# Usage: ./scripts/prod-tunnel.sh

PORT=5434
REMOTE_HOST="172.20.0.2"
REMOTE_PORT=5432
SSH_HOST="deploy@kazarchery.kz"

# Check if tunnel already exists
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "✓ Tunnel already running on port $PORT"
else
    echo "Creating SSH tunnel to production database..."
    ssh -f -N \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes \
        -L $PORT:$REMOTE_HOST:$REMOTE_PORT \
        $SSH_HOST

    if [ $? -eq 0 ]; then
        echo "✓ Tunnel created on port $PORT"
    else
        echo "✗ Failed to create tunnel"
        exit 1
    fi
fi
