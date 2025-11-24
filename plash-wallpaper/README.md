# Plash Wallpaper - Three.js Warped Gradient Animation

A live animated wallpaper featuring a smooth warped gradient effect created with Three.js r177.

## Features

- Smooth warped gradient animation
- Fully offline-capable (no external dependencies)
- Optimized for Plash wallpaper engine
- Auto-resizes to window dimensions
- Desktop icons remain clickable (pointer events disabled)
- Sharp rendering with pixel ratio support

## Installation

### Option 1: Local Server (Recommended)

1. Run a local server:
   ```bash
   cd plash-wallpaper
   python3 -m http.server 8000
   ```

2. In Plash, set wallpaper URL to:
   ```
   http://localhost:8000
   ```

### Option 2: Alternative Server Methods

Using Node.js (if installed):
```bash
cd plash-wallpaper
npx serve
```

Using PHP (if installed):
```bash
cd plash-wallpaper
php -S localhost:8000
```

## Using with Plash

1. Download and install [Plash](https://sindresorhus.com/plash) from the Mac App Store
2. Start the local server using one of the methods above
3. Open Plash preferences
4. Add a new website wallpaper
5. Enter the URL: `http://localhost:8000`
6. Adjust opacity and other settings as desired

## Customization

You can customize the animation by editing `animation.js`:

- **Colors**: Modify the `palette()` function and `baseColor` in the fragment shader
- **Animation Speed**: Adjust the time multipliers in the shader
- **Warp Intensity**: Change the amplitude values (e.g., `* 0.1`, `* 0.05`)
- **Rotation**: Modify or remove the `plane.rotation.z` line

## Files

- `index.html` - Main HTML file with styling and ES module setup
- `three.module.min.js` - THREE.js r177 ES module library
- `animation.js` - Warped gradient animation code
- `README.md` - This file
- `serve.sh` - Quick start server script

## Technical Details

- **Library**: Three.js r177
- **Renderer**: WebGL
- **Technique**: Custom GLSL shaders for warped gradient effect
- **Performance**: Optimized for smooth 60 FPS playback
- **Compatibility**: Works with any webview wallpaper engine

## Troubleshooting

**Animation not loading:**
- Make sure you're serving over HTTP (file:// won't work)
- Check browser console for errors
- Verify all files are in the same directory

**Performance issues:**
- Lower the resolution by adjusting geometry detail
- Reduce the number of warp layers in the shader
- Check that hardware acceleration is enabled

**Desktop icons not clickable:**
- This should work by default as pointer-events are disabled
- If not, check Plash settings

## License

This wallpaper is based on the gradient animation style from Luma's event pages.
Feel free to modify and use for personal purposes.
