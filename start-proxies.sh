#!/usr/bin/env bash
# Start all self-hosted CORS proxies for XSKULLX
# Usage: ./start-proxies.sh

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting corsify (port 3000)..."
node "$DIR/corsify-proxy/server.js" &
PID_CORSIFY=$!

echo "Starting simple-cors-proxy (port 8080)..."
node "$DIR/simple-cors-proxy/server.js" &
PID_SIMPLE=$!

echo "Starting corsfix-selfhosted (port 4000)..."
node "$DIR/corsfix-selfhosted/server.js" &
PID_CORSFIX=$!

echo "Starting xskullx-proxy (port 5000)..."
node "$DIR/xskullx-proxy/server.js" &
PID_XSKULLX=$!

echo ""
echo "All proxies started:"
echo "  corsify ......... http://localhost:3000/?url="
echo "  simple-cors-proxy  http://localhost:8080/proxy/"
echo "  corsfix ......... http://localhost:4000/?url="
echo "  xskullx ......... http://localhost:5000/?url="
echo ""
echo "Press Ctrl+C to stop all."

trap "kill $PID_CORSIFY $PID_SIMPLE $PID_CORSFIX $PID_XSKULLX 2>/dev/null; exit" INT TERM
wait
