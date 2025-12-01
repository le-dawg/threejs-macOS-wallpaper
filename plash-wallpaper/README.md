# AIR Wallpaper - Starstream Edition

**Official Internal Tool of AI Raadgivning ApS**

A high-performance, adaptive animated wallpaper designed for macOS and Plash. It features a "starstream" particle effect with a central "Air Logo" that reacts to your system activity.

## ✨ Features

-   **Adaptive Speed**: The animation speed reacts to your typing and clicking activity in real-time.
-   **Cyber Retrowave Aesthetics**: The logo features wave ripples, chromatic aberration, and scanlines.
-   **Dual Modes**:
    -   **Default**: Constant, smooth animation.
    -   **Adaptive**: Reacts to your workflow intensity.
-   **Native Performance**: Powered by a lightweight Swift background monitor (negligible CPU usage).
-   **Offline Capable**: Runs entirely locally on your machine.
-   **Zero-Friction**: Single-script installation with auto-starting background services.

## 🚀 Installation

We have streamlined the setup into a single "one-click" installer.

1.  **Prerequisite**: Install **Plash** from the Mac App Store.

2.  **Open Terminal** and navigate to the folder where you pulled this repository:
    ```bash
    cd /path/to/your/downloaded/repo
    ```

3.  **Run the Installer**:
    ```bash
    ./install.sh
    ```
    *This script will compile the native monitor, install background agents, and clean up temporary files.*

3.  **Grant Permissions**:
    -   You will likely see a popup asking for **Accessibility Permissions**.
    -   Go to **System Settings > Privacy & Security > Accessibility**.
    -   Toggle the switch for `monitor` to **ON**.
    -   *If the animation doesn't react immediately, run `./install.sh` one more time to restart the service.*

4.  **Configure Plash**:
    -   Open **Plash** (available on the Mac App Store).
    -   Add a new website with one of the following URLs:
        -   **Adaptive Mode** (Recommended): `http://localhost:8000?mode=adaptive`
        -   **Default Mode** (Constant): `http://localhost:8000`

## ❓ Troubleshooting

**Problem: Animation freezes after a while.**
-   **Fix**: Ensure you are using the `?mode=adaptive` URL. The latest update includes a "minimum speed" floor to prevent freezing when idle.
-   **Fix**: Check if the `monitor` process is running: `pgrep -l monitor`. If not, run `./install.sh` again.

**Problem: "Air Logo" is missing.**
-   **Fix**: Ensure `airlogo.svg` is present in the project folder.
-   **Fix**: Check the browser console (Right-click > Inspect Element in Plash "Browsing Mode") for errors.

**Problem: Speed doesn't change when I type.**
-   **Fix**: Verify Accessibility Permissions are granted for `monitor`.
-   **Fix**: Ensure you are using the `?mode=adaptive` URL.

## 🛠 Technical Details

-   **Frontend**: Three.js (WebGL) with custom GLSL shaders.
-   **Backend**: Native Swift (`monitor`) for system-wide event tracking.
-   **Communication**: The monitor writes to `speed.json`, which the frontend polls.
-   **Persistence**: `launchd` agents keep both the web server and the monitor running in the background.

---
*Property of AI Raadgivning ApS*
