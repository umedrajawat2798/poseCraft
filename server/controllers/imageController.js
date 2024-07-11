const { generateShots } = require('../utils/shotGeneration');
const Image = require('../models/Image');
const { default: axios } = require('axios');
const { buffer } = require('@tensorflow/tfjs');
const { uploadToS3 } = require('../utils/uploadToS3');
const imageQueue = require('../utils/queue');
// const { uploadToS3 } = require('../utils/uploadToS3');

const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp'];

// Helper function to get the image extension from the base64 string
const getImageExtension = (base64Data) => {
  const matches = base64Data.match(/^data:image\/(\w+);base64,/);
  return matches ? matches[1] : null;
};


const processImage = async (req, res) => {
  const { imageUrl, imageData } = req.body;
  let url = ""

  try {

    let imageBuffer;
    if (imageData) {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const extension = getImageExtension(imageData);
  
    if (!supportedFormats.includes(extension)) {
      throw new Error('Unsupported image format');
    }
  
    imageBuffer = Buffer.from(base64Data, 'base64');
    const s3Response = await uploadToS3(imageBuffer, `images/${Date.now()}.${extension}`);
      url = s3Response.Location

    } else if (imageUrl) {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      console.log("data resp", response.data)
      imageBuffer = Buffer.from(response.data, 'binary');
      url = imageUrl
    }

    const image = new Image({
      url: url,
      status: 'pending',
      shots: []
    });

    await image.save();

    await imageQueue.add({
      imageId: image._id,
      url,
      imageData
    });

    res.json({ message: 'Image processing started', imageId: image._id });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

const processBatchImages = async (req, res) => {
  const { imageUrls } = req.body;
  // const imageQueue = req.app.locals.imageQueue;

  try {
    const imageIds = [];

    for (const imageUrl of imageUrls) {
      // Check if an image with the same URL already exists
      const existingImage = await Image.findOne({ url: imageUrl });

      if (existingImage) {
        // If image exists, push its ID to the imageIds list
        imageIds.push(existingImage._id);
      } else {
        // If image does not exist, create a new image and add it to the queue
        const newImage = new Image({
          url: imageUrl,
          status: 'pending',
          shots: []
        });

        await newImage.save();
        imageIds.push(newImage._id);

        await imageQueue.add({
          imageId: newImage._id,
          imageUrl
        });
      }
    }

    res.json({ message: 'Batch image processing started', imageIds });
  } catch (error) {
    console.error('Error processing batch images:', error);
    res.status(500).json({ error: 'Failed to process batch images' });
  }
};

const getImageStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findById(id);
    if (!image) {
        return res.status(404).json({ error: 'Image not found' });
    }
    // if (image.status !== 'completed') {
    //     return res.status(400).json({ error: 'Image processing is not yet completed' });
    // }
    res.json({ shots: image.shots, status: image.status });
} catch (error) {
      console.error('Error fetching image status:', error);
      res.status(500).json({ error: 'Failed to fetch image status' });
  }
};


module.exports = { processImage, processBatchImages, getImageStatus };


// BMP, JPEG, PNG, or GIF
