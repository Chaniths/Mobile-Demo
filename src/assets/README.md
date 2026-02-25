# Assets Directory

This directory contains all static assets for the FreshRoute mobile application.

## Structure

- **images/** - Application images, logos, illustrations
- **icons/** - Icon assets (SVG, PNG)
- **fonts/** - Custom fonts (Outfit font family)
- **animations/** - Lottie animations or other animated assets

## Adding Assets

### Images
Place images in the `images/` directory. Supported formats: PNG, JPG, GIF, WebP

### Icons
Place icon files in the `icons/` directory. Prefer SVG for scalability.

### Fonts
1. Add font files (.ttf, .otf) to the `fonts/` directory
2. Update `app.json` to include fonts in the build
3. Load fonts using `expo-font` before app renders

### Animations
Place Lottie JSON files or other animation assets in the `animations/` directory.

## Usage Example

```javascript
import { Image } from 'react-native';

// Using local images
<Image source={require('./images/logo.png')} />

// Using icons
import Logo from './icons/logo.svg';
<Logo width={40} height={40} />
```

## Notes

- Keep assets optimized for mobile (compress images)
- Use appropriate sizes (@2x, @3x for iOS)
- Consider using remote images for dynamic content

