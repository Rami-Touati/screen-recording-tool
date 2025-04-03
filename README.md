# Screen Recording App

A professional-grade screen recording app built with Electron and React, featuring high-quality video recording, editing, and exporting capabilities.

## Features

### Recording
- Full-screen, custom area, or window recording
- Camera integration with draggable webcam overlay
- Microphone selection and audio recording
- Multiple quality settings (Standard, High, Ultra)

### Editing
- Timeline editing with trim functionality
- Background customization (gradients, images, solid colors)
- Blur and dim controls for backgrounds
- Video playback with zoom controls
- Placeholder for future AI-powered smart edits

### Exporting
- Export to MP4 (H.264) with customizable quality
- Export to GIF for shareable animations
- Resolution options (1080p, 720p, 480p)
- Quality presets (Low, Medium, High)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/screen-recorder.git
cd screen-recorder

# Install dependencies
npm install

# Development
npm start          # Start React development server
npm run electron:dev  # Start Electron in development mode

# Build for production
npm run build      # Build React app
npm run electron:build  # Build Electron app for your platform
```

## Usage Guide

### Recording
1. Launch the application
2. Select recording mode (Full Screen, Custom, or Window)
3. Choose your camera and microphone from the dropdown menus
4. Select recording quality (Standard, High, Ultra)
5. Click "Start Recording"
6. Use the floating controls to pause or stop the recording
7. Click "Stop" when finished

### Editing
After recording, you'll be taken to the editing screen where you can:

1. **Timeline Editing**:
   - Use the slider handles to trim the start and end of your recording
   - Click on the timeline to jump to a specific point
   - Use zoom controls to zoom in/out of the timeline

2. **Background Customization**:
   - Select from various background types (Gradient, Landscape, Abstract, Solid)
   - Adjust blur to apply a blur effect to the background
   - Adjust dim to darken the background

3. **Smart Edits** (Coming Soon):
   - Auto Zoom
   - Smart Cursor Tracking
   - Noise Reduction
   - Auto Captions

### Exporting
1. Click the "Export Video" button
2. Choose your preferred format (MP4 or GIF)
3. Select resolution (1080p, 720p, 480p)
4. Select quality (High, Medium, Low)
5. Click "Export Video" to process and download your file

## Development

This project uses:
- Electron for the desktop application
- React (Create React App) for the UI
- FFmpeg.wasm for video processing
- Material UI for components
- TypeScript for type safety

### Project Structure
- `/src` - React application code
- `/electron` - Electron main process code
- `/public` - Static assets

## License
MIT

## Credits
- FFmpeg.wasm for video processing
- Material UI for components
- Electron for desktop app capabilities 