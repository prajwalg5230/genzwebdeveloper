#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=${1:-3000}

echo "Starting genzwebdeveloper local server on port $PORT..."
python3 "$DIR/server.py" "$PORT"
