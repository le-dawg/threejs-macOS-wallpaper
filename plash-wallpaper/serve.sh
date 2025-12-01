#!/bin/bash

PID=$(lsof -ti:8000)
if [ -n "$PID" ]; then
    kill -9 $PID
fi

# Simple HTTP server for Plash wallpaper
echo "Starting HTTP server on http://localhost:8000"
echo "Open Plash and set wallpaper URL to: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
python3 -m http.server 8000
