# Modern Screen Recording Tool

A powerful, feature-rich screen recording application built with Electron and React. Record your screen with high-quality output, camera overlay, and various export options.

## Features

- High-quality screen recording (1080p or above)
- Smooth zoom functionality with keyboard shortcuts
- Camera overlay with customizable position and size
- Microphone audio recording
- Aesthetic backgrounds and themes
- Export to MP4 and GIF formats
- Local storage only - no cloud dependencies
- Preview before exporting
- Modern, clean UI inspired by Loom/Focusee

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- FFmpeg (for video processing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/screen-recorder.git
cd screen-recorder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The built application will be available in the `dist` directory.

## Usage

1. Launch the application
2. Select your recording preferences in the Settings page
3. Click "Start Recording" to begin capturing your screen
4. Use the zoom controls or keyboard shortcuts to adjust the view
5. Toggle camera overlay if needed
6. Click "Stop Recording" when finished
7. Preview your recording
8. Export in your preferred format (MP4 or GIF)

## Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Zoom in
- `Ctrl/Cmd + Shift + Z`: Zoom out
- `Ctrl/Cmd + R`: Start/Stop recording
- `Ctrl/Cmd + C`: Toggle camera overlay
- `Space`: Play/Pause preview
- `Esc`: Exit preview

## Development

The project structure is organized as follows:

```
src/
├── components/         # React components
│   ├── pages/         # Page components
│   └── common/        # Shared components
├── services/          # Business logic and services
├── utils/            # Helper functions
└── main.ts           # Electron main process
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [FFmpeg](https://ffmpeg.org/)
- [Whammy.js](https://github.com/antimatter15/whammy) 