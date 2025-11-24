# Technical Notes

## Issue Resolution: Black Wallpaper Fix

### Problem
The original `three.min.js` file extracted from the Luma website was bundled using Turbopack and did not expose the `THREE` global variable, causing the error:
```
ReferenceError: THREE is not defined
```

### Solution
Replaced with the official THREE.js r177 ES module from jsDelivr CDN and updated the codebase to use modern ES modules.

### Changes Made

1. **Downloaded proper THREE.js library**
   - Source: `https://cdn.jsdelivr.net/npm/three@0.177.0/+esm`
   - File: `three.module.min.js` (686 KB)
   - Format: ES module (not UMD/global)

2. **Updated HTML structure**
   - Added import map to resolve 'three' module
   - Changed script tag to `type="module"`
   - Removed old global script loading

3. **Updated animation.js**
   - Added: `import * as THREE from 'three';`
   - Now uses ES module syntax

### Import Map Usage
The HTML uses an import map to map the bare specifier 'three' to the local file:
```html
<script type="importmap">
  {
    "imports": {
      "three": "./three.module.min.js"
    }
  }
</script>
```

This allows clean imports in JavaScript:
```javascript
import * as THREE from 'three';
```

### Browser Compatibility
- Import maps are supported in modern browsers (Chrome 89+, Safari 16.4+, Firefox 108+)
- The wallpaper works in any browser with ES module support
- Older browsers may need a polyfill or fallback to UMD build

### Performance
- WebGL rendering at 60 FPS
- Smooth gradient animations with GLSL shaders
- Hardware-accelerated when possible
- Software fallback available

### Future Maintenance
If THREE.js needs to be updated:
1. Download from: `https://cdn.jsdelivr.net/npm/three@<version>/+esm`
2. Replace `three.module.min.js`
3. Test the animation still works
4. Update version numbers in documentation
