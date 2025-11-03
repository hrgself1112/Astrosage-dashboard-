# AI Background Remover

A powerful bulk background removal tool integrated into the Astrosage Dashboard that uses free, open-source ML models to remove backgrounds from multiple images simultaneously.

## Features

### 🚀 **Core Capabilities**
- **Bulk Processing**: Remove backgrounds from multiple images at once
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Progress**: Live progress tracking for each image
- **Multiple Models**: Choose between different AI models for optimal results
- **High Quality**: Professional-grade background removal
- **Free to Use**: No expensive API calls - uses open-source models

### 🎨 **User Interface**
- **Modern Design**: Material Design 3 compliant interface
- **Responsive**: Works perfectly on desktop and mobile devices
- **Preview**: See before/after results instantly
- **Batch Download**: Download all processed images at once
- **Error Handling**: Retry failed processing attempts

### ⚡ **Supported Features**
- **File Formats**: JPG, PNG, WebP, GIF
- **File Size**: Up to 10MB per image
- **Batch Size**: Up to 50 images per batch
- **Export Format**: PNG with transparent background
- **AI Models**: Multiple specialized models available

## Quick Start

### 1. Access the Tool
Navigate to "Background Remover" in the sidebar menu

### 2. Upload Images
- Drag and drop images onto the upload area
- Or click "Select Images" to browse files
- Supports multiple file selection

### 3. Choose AI Model
- **Rembg (Fast)**: Quick processing, good for most images
- **U2-Net (High Quality)**: Slower but better results

### 4. Process & Download
- Automatic processing starts after upload
- Monitor progress for each image
- Download individual images or all at once

## AI Models Available

### 1. **Rembg (isnet-general-use)**
- ⚡ Speed: Fast
- 🎯 Best for: General objects, products, animals
- 📊 Quality: Good
- 💡 Use case: Quick bulk processing

### 2. **U2-Net**
- ⚡ Speed: Medium
- 🎯 Best for: Complex images, multiple subjects
- 📊 Quality: Excellent
- 💡 Use case: Professional quality needed

### 3. **Silueta**
- ⚡ Speed: Medium
- 🎯 Best for: Portraits, people photos
- 📊 Quality: Excellent
- 💡 Use case: Profile pictures, headshots

### 4. **U2-Net Plus**
- ⚡ Speed: Slow
- 🎯 Best for: High-detail images
- 📊 Quality: Best
- 💡 Use case: Critical applications

## Setup Options

### Option 1: Client-Side Processing (Current)
The current implementation uses browser-based canvas manipulation for basic background removal. Perfect for:
- Quick testing
- Privacy-sensitive images
- No server setup required

### Option 2: Self-Hosted Server (Recommended)
Set up your own Node.js server with rembg for professional results:

```bash
# Clone the repository
git clone <your-repo>

# Install dependencies
npm install express rembg multer cors sharp

# Start the server
node server.js
```

### Option 3: Commercial API
Integration with services like Remove.bg for enterprise use.

## Technical Implementation

### Frontend Components
```
components/
├── BackgroundRemover.tsx      # Main component
├── SessionTimeoutWarning.tsx  # Security features
└── icons/                     # UI icons
```

### Services
```
services/
└── backgroundRemovalService.ts  # Image processing logic
```

### Styling
```
styles/
└── background-remover.css      # Component-specific styles
```

## API Endpoints

### Single Image Processing
```http
POST /api/remove-background
Content-Type: multipart/form-data

{
  "image": <file>,
  "model": "isnet-general-use"
}
```

### Batch Processing
```http
POST /api/remove-background-batch
Content-Type: multipart/form-data

{
  "images": [<file1>, <file2>, ...],
  "model": "isnet-general-use"
}
```

### Model Information
```http
GET /api/models

Response:
{
  "models": [
    {
      "id": "isnet-general-use",
      "name": "General Use",
      "description": "Best for general images",
      "speed": "fast",
      "quality": "good"
    }
  ]
}
```

## Performance Optimization

### Client-Side
- **Image Compression**: Automatic resizing for faster processing
- **Web Workers**: Background processing without UI blocking
- **Progressive Loading**: Images load progressively
- **Memory Management**: Automatic cleanup of processed images

### Server-Side
- **Queue System**: Handle large batches efficiently
- **Caching**: Cache frequently processed images
- **Load Balancing**: Distribute processing across multiple instances
- **Monitoring**: Track performance and errors

## Security Features

### Data Protection
- **No Data Retention**: Images are processed and deleted
- **Secure Upload**: Encrypted file transfers
- **Session Timeout**: Automatic logout for admin users
- **Access Control**: Role-based access to features

### Privacy
- **Client-Side Option**: Process images entirely in browser
- **Self-Hosting**: Complete control over your data
- **No Third-Party Sharing**: Images never leave your infrastructure

## Troubleshooting

### Common Issues

#### 1. **Processing Fails**
- Check file format (JPG, PNG, WebP only)
- Verify file size (< 10MB)
- Try a different AI model
- Check internet connection

#### 2. **Slow Processing**
- Reduce batch size
- Use faster model (Rembg)
- Close other browser tabs
- Check server resources

#### 3. **Poor Results**
- Try different AI model
- Ensure good image contrast
- Use higher resolution images
- Check lighting conditions

### Error Messages

| Error | Solution |
|-------|----------|
| "Failed to process image" | Retry with different model |
| "File too large" | Resize image or use smaller file |
| "Unsupported format" | Convert to JPG/PNG/WebP |
| "Server timeout" | Reduce batch size |

## Future Enhancements

### Planned Features
- [ ] Advanced AI models (SAM, Mask R-CNN)
- [ ] Custom background replacement
- [ ] Batch file format conversion
- [ ] API rate limiting and quotas
- [ ] Integration with cloud storage
- [ ] Mobile app version

### Performance Improvements
- [ ] GPU acceleration support
- [ ] CDN integration for faster loading
- [ ] Progressive Web App (PWA) features
- [ ] Offline processing capability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## License

This project is open-source and available under the MIT License.

## Support

For support and questions:
- 📧 Email: support@astrosage.com
- 🐛 Issues: GitHub Issues
- 📖 Documentation: Full docs available

---

**Note**: The current implementation uses a placeholder background removal algorithm. For production use, set up the Node.js server with rembg as described in the setup documentation.