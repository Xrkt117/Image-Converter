# Static Convert

A minimal, modern image converter with a clean black and white design. All processing happens entirely in your browser - no uploads, no server required!

## Features

- 🎨 **Minimalist Design** - Clean black and white interface
- 🌓 **Dark/Light Mode** - Toggle between themes with the button in the bottom left
- 🔄 **Multiple Formats** - Convert between JPG, PNG, WebP, GIF, and BMP
- 📤 **Drag & Drop** - Easy file upload with drag and drop support
- 👁️ **Live Preview** - See both original and converted images side by side
- ⚙️ **Quality Control** - Adjust quality for JPEG and WebP formats
- 📥 **Instant Download** - Download converted images immediately
- 🔒 **Privacy First** - All processing happens in your browser - no data leaves your device

## Supported Formats

- **Input**: JPG, PNG, WebP, GIF, BMP, TIFF
- **Output**: JPG, PNG, WebP, GIF, BMP

## How to Use

1. **Open** `index.html` in your web browser
2. **Upload** an image by:
   - Clicking the upload area and selecting a file, or
   - Dragging and dropping an image onto the upload area
3. **Select** your desired output format from the dropdown
4. **Adjust** quality (for JPEG/WebP) using the slider if needed
5. **Click** "Convert Image" to process
6. **Download** your converted image

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas API
- FileReader API
- Drag and Drop API

## Technical Details

- Pure HTML, CSS, and JavaScript - no dependencies
- Uses Canvas API for image conversion
- Client-side processing ensures privacy
- Responsive design works on desktop and mobile

## File Structure

```
Static Convert/
├── index.html      # Main HTML structure
├── styles.css      # Minimalist styling with theme support
├── script.js       # Conversion logic and theme toggle
└── README.md       # This file
```

## License

Free to use and modify for any purpose.

