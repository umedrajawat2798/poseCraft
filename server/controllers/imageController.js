// const processImage = async (req, res) => {
//     const { imageUrl } = req.body;
//     // Add image processing logic here using pose detection
//     res.send({ shots: [] });
//   };
  
//   const processBatchImages = async (req, res) => {
//     const { imageUrls } = req.body;
//     // Add batch processing logic here
//     res.send({ shots: [] });
//   };
  
//   module.exports = { processImage, processBatchImages };

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
    // const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    // const imageBuffer = Buffer.from(response.data, 'base64'); // binary
    // // const imageBuffer = Buffer.from(imageData, 'base64');
    // console.log("buffer", buffer)

    let imageBuffer;
    if (imageData) {
    //   // imageBuffer = Buffer.from(imageData, 'binary');
    //   const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

    //   // Convert the base64 string to a buffer
    //   imageBuffer = Buffer.from(base64Data, 'base64');
    //   // console.log("bf", imageBuffer)
    //   // console.log("data", imageData)
    //   const s3Response = await uploadToS3(imageData, `images/${Date.now()}.jpeg`);
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

    // const image = new Image({
    //   url: url,
    //   status: "pending",
    //   shots: [
    //     { label: 'Neck Shot', url: shots.neckShot },
    //     { label: 'Sleeve Shot', url: shots.sleeveShot },
    //     { label: 'Zoomed View Shot', url: shots.zoomedShot },
    //     { label: 'Waist Shot', url: shots.waistShot },
    //     { label: 'Length Shot', url: shots.lengthShot }
    //   ],
    // });

    // await image.save();

    // bull call

    // const job = await myFirstQueue.add({
    //   url: url
    // });

    console.log("imageurl", imageUrl)

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

    // const shots = await generateShots(imageBuffer);

    // // Save the original and processed images to your storage (file system, S3, etc.)

    // const image = new Image({
    //   url: url,
    //   shots: [
    //     { label: 'Neck Shot', url: shots.neckShot },
    //     { label: 'Sleeve Shot', url: shots.sleeveShot },
    //     { label: 'Zoomed View Shot', url: shots.zoomedShot },
    //     { label: 'Waist Shot', url: shots.waistShot },
    //     { label: 'Length Shot', url: shots.lengthShot }
    //   ],
    // });
    // await image.save();

    // const resp = [
    //   { label: 'Neck Shot', url: shots.neckShot },
    //   { label: 'Sleeve Shot', url: shots.sleeveShot },
    //   { label: 'Zoomed View Shot', url: shots.zoomedShot },
    //   { label: 'Waist Shot', url: shots.waistShot },
    //   { label: 'Length Shot', url: shots.lengthShot }
    // ]

    // await image.save();
    // res.json({ shots: [...resp] });
    // res.json({ shots });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

// const processBatchImages = async (req, res) => {
//   const { imageUrls } = req.body;
//   const results = [];

//   try {
//     for (const url of imageUrls) {
//       const response = await axios.get(url, { responseType: 'arraybuffer' });
//       const imageBuffer = Buffer.from(response.data, 'binary');
//       const shots = await generateShots(imageBuffer);
//       console.log(shots)

//       // Save the original and processed images to your storage (file system, S3, etc.)
//       const image = new Image({
//         url,
//         shots: [
//           { label: 'Neck Shot', url: shots.neckShot },
//           { label: 'Sleeve Shot', url: shots.sleeveShot },
//           { label: 'Zoomed View Shot', url: shots.zoomedShot },
//           { label: 'Waist Shot', url: shots.waistShot },
//           { label: 'Length Shot', url: shots.lengthShot }
//         ],
//       });
//       await image.save();
//       const item = [
//         { label: 'Neck Shot', url: shots.neckShot },
//         { label: 'Sleeve Shot', url: shots.sleeveShot },
//         { label: 'Zoomed View Shot', url: shots.zoomedShot },
//         { label: 'Waist Shot', url: shots.waistShot },
//         { label: 'Length Shot', url: shots.lengthShot }
//       ]

//       results.push(item);
//     }
//     console.log("results", results)
//     res.json({ shots: results });
//   } catch (error) {
//     console.error('Error processing batch images:', error);
//     res.status(500).json({ error: 'Failed to process batch images' });
//   }
// };

const processBatchImages = async (req, res) => {
  const { imageUrls } = req.body;
  // const imageQueue = req.app.locals.imageQueue;

  try {
    const imageIds = [];

    for (const imageUrl of imageUrls) {
      const image = new Image({
        url: imageUrl,
        status: 'pending',
        shots: []
      });

      await image.save();
      imageIds.push(image._id);

      await imageQueue.add({
        imageId: image._id,
        imageUrl
      });
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