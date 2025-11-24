#!/bin/bash
# Simple HTTP server for Plash wallpaper
echo "Starting HTTP server on http://localhost:8000"
echo "Open Plash and set wallpaper URL to: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
python3 -m http.server 8000
