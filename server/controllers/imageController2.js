// const TaskQueue = require('./queue');
const { generateShots } = require('../utils/shotGeneration');
const Image = require('../models/Image');
const { default: axios } = require('axios');
const { uploadToS3 } = require('../utils/uploadToS3');
const { taskQueue } = require('../app');


const processImage = async (req, res) => {
  const { imageUrl, imageData } = req.body;
  let url = "";

  const task = async () => {
    let imageBuffer;
    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      const s3Response = await uploadToS3(imageData, `images/${Date.now()}.jpeg`);
      url = s3Response.Location;
    } else if (imageUrl) {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data, 'binary');
      url = imageUrl;
    }

    const shots = await generateShots(imageBuffer);
    const image = new Image({
      url: url,
      shots: [
        { label: 'Neck Shot', url: shots.neckShot },
        { label: 'Sleeve Shot', url: shots.sleeveShot },
        { label: 'Zoomed View Shot', url: shots.zoomedShot },
        { label: 'Waist Shot', url: shots.waistShot },
        { label: 'Length Shot', url: shots.lengthShot }
      ],
    });
    await image.save();

    const resp = [
      { label: 'Neck Shot', url: shots.neckShot },
      { label: 'Sleeve Shot', url: shots.sleeveShot },
      { label: 'Zoomed View Shot', url: shots.zoomedShot },
      { label: 'Waist Shot', url: shots.waistShot },
      { label: 'Length Shot', url: shots.lengthShot }
    ];

    return resp;
  };

  try {
    console.log("queue", taskQueue.queue)
    const taskId = taskQueue.addTask(task)
    res.json({ message: 'Image processing started', taskId });
  } catch (error) {
    console.error('Error adding task to queue:', error);
    res.status(500).json({ error: 'Failed to add task to queue' });
  }
};

const processBatchImages = async (req, res) => {
  const { imageUrls } = req.body;
  const taskIds = [];

  for (const imageUrl of imageUrls) {
    const task = async () => {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      const shots = await generateShots(imageBuffer);
      const image = new Image({
        url: imageUrl,
        shots: [
          { label: 'Neck Shot', url: shots.neckShot },
          { label: 'Sleeve Shot', url: shots.sleeveShot },
          { label: 'Zoomed View Shot', url: shots.zoomedShot },
          { label: 'Waist Shot', url: shots.waistShot },
          { label: 'Length Shot', url: shots.lengthShot }
        ],
      });
      await image.save();

      return [
        { label: 'Neck Shot', url: shots.neckShot },
        { label: 'Sleeve Shot', url: shots.sleeveShot },
        { label: 'Zoomed View Shot', url: shots.zoomedShot },
        { label: 'Waist Shot', url: shots.waistShot },
        { label: 'Length Shot', url: shots.lengthShot }
      ];
    };

    try {
      const taskId = taskQueue.addTask(task);
      taskIds.push(taskId);
    } catch (error) {
      console.error('Error adding task to queue:', error);
      res.status(500).json({ error: 'Failed to add task to queue' });
    }
  }

  res.json({ message: 'Batch image processing started', taskIds });
};

module.exports = { processImage, processBatchImages };
