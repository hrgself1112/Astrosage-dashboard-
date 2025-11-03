# Background Removal Server Setup

This document explains how to set up a proper backend server for advanced background removal using ML models.

## Option 1: Using Rembg (Recommended)

### Installation
```bash
npm install rembg
```

### Server Implementation (server.js)
```javascript
const express = require('express');
const { rembg } = require('rembg');
const multer = require('multer');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Background removal endpoint
app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { model = 'isnet-general-use' } = req.body;

    // Process image with rembg
    const result = await rembg(req.file.buffer, { model });

    // Convert buffer to base64 for response
    const base64 = result.toString('base64');
    const mimeType = 'image/png';

    res.json({
      success: true,
      image: `data:${mimeType};base64,${base64}`
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process image'
    });
  }
});

// Batch processing endpoint
app.post('/api/remove-background-batch', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const { model = 'isnet-general-use' } = req.body;
    const results = [];

    for (const file of req.files) {
      try {
        const result = await rembg(file.buffer, { model });
        const base64 = result.toString('base64');

        results.push({
          filename: file.originalname,
          success: true,
          image: `data:image/png;base64,${base64}`
        });
      } catch (error) {
        results.push({
          filename: file.originalname,
          success: false,
          error: error.message
        });
      }
    }

    res.json({ success: true, results });

  } catch (error) {
    console.error('Error processing batch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process images'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Background removal server running on port ${PORT}`);
});
```

### Available Models
- `isnet-general-use` - General purpose, good for most images
- `silueta` - Best for portraits and people
- `u2net` - Universal model for various subjects
- `u2netp` - Improved version of u2net
- `rembg` - Original model

## Option 2: Using Remove.bg API (Commercial)

If you want to use a professional service:

```javascript
const axios = require('axios');

app.post('/api/remove-background-pro', upload.single('image'), async (req, res) => {
  try {
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', {
      image_file: req.file.buffer,
      size: 'preview',
      type: 'auto'
    }, {
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
      responseType: 'arraybuffer'
    });

    const base64 = Buffer.from(response.data).toString('base64');
    res.json({
      success: true,
      image: `data:image/png;base64,${base64}`
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Option 3: Using TensorFlow.js (Client-side)

For processing directly in the browser:

```javascript
// Install: npm install @tensorflow/tfjs @tensorflow-models/body-pix
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

class ClientSideBackgroundRemoval {
  async loadModel() {
    this.net = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    });
  }

  async removeBackground(imageElement) {
    const segmentation = await this.net.segmentPerson(imageElement, {
      flipHorizontal: false,
      internalResolution: 'medium',
      segmentationThreshold: 0.7
    });

    // Create mask and apply to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Implementation details for applying mask...

    return canvas.toDataURL();
  }
}
```

## Package.json Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "rembg": "^2.0.50",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "sharp": "^0.32.6"
  }
}
```

## Docker Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

## Environment Variables

```bash
PORT=3001
NODE_ENV=production
REMOVE_BG_API_KEY=your_api_key_here # Optional for commercial service
```

## Usage Instructions

1. Choose your preferred method (Rembg is recommended for free usage)
2. Set up the server according to the instructions
3. Update the `backgroundRemovalService.ts` to call your API
4. Deploy and enjoy fast background removal!

## Performance Tips

- Use image compression before processing
- Implement caching for frequently processed images
- Use CDN for serving processed images
- Consider queue system for batch processing
- Monitor memory usage for large batch operations