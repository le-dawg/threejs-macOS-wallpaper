#!/bin/bash

# Define Paths
WORK_DIR=$(pwd)
MONITOR_SRC="monitor.swift"
MONITOR_BIN="monitor"
PLIST_MONITOR="$HOME/Library/LaunchAgents/com.thedawgctor.plash.monitor.plist"
PLIST_SERVER="$HOME/Library/LaunchAgents/com.thedawgctor.plash.server.plist"

echo "----------------------------------------"
echo "  Plash Wallpaper - System Monitor Setup"
echo "----------------------------------------"

# 1. Create Temporary Swift Source
echo "[1/4] Generating Swift source..."
cat <<EOF > "$MONITOR_SRC"
import Cocoa
import Foundation

// Configuration
let bufferSize = 5
let updateInterval: TimeInterval = 1.0
let outputFilePath = "$WORK_DIR/speed.json"

// State
var eventCount = 0
var buffer: [Double] = Array(repeating: 0.0, count: bufferSize)
var bufferIndex = 0

// Event Tap Callback
func eventCallback(proxy: CGEventTapProxy, type: CGEventType, event: CGEvent, refcon: UnsafeMutableRawPointer?) -> Unmanaged<CGEvent>? {
    if type == .keyDown || type == .leftMouseDown {
        eventCount += 1
    }
    return Unmanaged.passUnretained(event)
}

// Main Loop
func startMonitoring() {
    print("Starting System-Wide Activity Monitor...")
    print("Output file: \(outputFilePath)")

    // Create Event Tap
    let eventMask = (1 << CGEventType.keyDown.rawValue) | (1 << CGEventType.leftMouseDown.rawValue)
    guard let eventTap = CGEvent.tapCreate(
        tap: .cgSessionEventTap,
        place: .headInsertEventTap,
        options: .defaultTap,
        eventsOfInterest: CGEventMask(eventMask),
        callback: eventCallback,
        userInfo: nil
    ) else {
        print("failed to create event tap. check accessibility permissions.")
        exit(1)
    }

    let runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, eventTap, 0)
    CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
    CGEvent.tapEnable(tap: eventTap, enable: true)

    // Timer for SMA Calculation
    Timer.scheduledTimer(withTimeInterval: updateInterval, repeats: true) { _ in
        // 1. Get current count (events per second)
        let currentActivity = Double(eventCount)
        eventCount = 0 // Reset counter
        
        // 2. Update Buffer
        buffer[bufferIndex] = currentActivity
        bufferIndex = (bufferIndex + 1) % bufferSize
        
        // 3. Calculate SMA
        let sum = buffer.reduce(0, +)
        let sma = sum / Double(bufferSize)
        
        // 4. Write to JSON
        let jsonString = String(format: "{\"speed\": %.2f}", sma)
        do {
            try jsonString.write(toFile: outputFilePath, atomically: true, encoding: .utf8)
        } catch {
            print("failed to write to file: \(error)")
        }
    }

    CFRunLoopRun()
}

startMonitoring()
EOF

# 2. Compile Swift Monitor
echo "[2/4] Compiling monitor binary..."
swiftc "$MONITOR_SRC" -o "$MONITOR_BIN"
COMPILE_STATUS=$?

# Cleanup source immediately
rm "$MONITOR_SRC"

if [ $COMPILE_STATUS -ne 0 ]; then
    echo "Error: Compilation failed."
    exit 1
fi

# 3. Install Launch Agents
echo "[3/4] Installing Launch Agents..."
mkdir -p ~/Library/LaunchAgents

# Monitor Plist
cat <<EOF > "$PLIST_MONITOR"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.thedawgctor.plash.monitor</string>
    <key>Program</key>
    <string>$WORK_DIR/$MONITOR_BIN</string>
    <key>WorkingDirectory</key>
    <string>$WORK_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Server Plist
cat <<EOF > "$PLIST_SERVER"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.thedawgctor.plash.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$WORK_DIR/serve.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$WORK_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# 4. Load Agents
echo "[4/4] Loading background services..."
launchctl unload "$PLIST_MONITOR" 2>/dev/null
launchctl unload "$PLIST_SERVER" 2>/dev/null

launchctl load "$PLIST_MONITOR"
launchctl load "$PLIST_SERVER"

echo "----------------------------------------"
echo "Success! Setup complete."
echo "1. 'monitor' binary created."
echo "2. Launch Agents installed."
echo ""
echo "IMPORTANT: If this is your first time, go to:"
echo "System Settings > Privacy & Security > Accessibility"
echo "and grant permission to 'monitor'."
echo "----------------------------------------"
