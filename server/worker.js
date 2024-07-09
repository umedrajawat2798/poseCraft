const Bull = require("bull");
const { generateShots } = require("./utils/shotGeneration");
const Image = require("./models/Image");
const mongoose = require("mongoose");
const { uploadToS3 } = require("./utils/uploadToS3");
const { default: axios } = require("axios");
require("dotenv").config();

const mongo = process.env.DATABASE_URL;
// Connect to MongoDB
mongoose
  .connect(mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  })
  .then(() => {
    console.log("Worker connected to MongoDB");
  })
  .catch((err) => {
    console.error("Worker failed to connect to MongoDB", err);
  });

const imageQueue = new Bull("image-processing", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
      removeOnComplete: true, // Automatically remove completed jobs
      removeOnFail: true      // Optionally, automatically remove failed jobs
    }
});

imageQueue.isReady().then(()=>{
  console.log("bull connected")
}).catch((err)=> {
  console.log("error in bull", err)
})

imageQueue.process(async (job) => {
  const { imageUrl, imageData } = job.data;
  let url = "";
  let imageBuffer;

  try {
    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
      // const s3Response = await uploadToS3(imageData, `images/${Date.now()}.jpeg`);
      // url = s3Response.Location;
    } else if (imageUrl) {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(response.data, "binary");
      // url = imageUrl;
    }
    url = imageUrl;

    const shots = await generateShots(imageBuffer);

    setTimeout(async () => {
      await retry(
        async () => {
          await Image.updateOne(
            { _id: job.data.imageId },
            {
              $set: {
                shots: [
                  {
                    label: "Neck Shot",
                    url: shots.neckShot,
                    _id: job.data.imageId,
                  },
                  {
                    label: "Sleeve Shot",
                    url: shots.sleeveShot,
                    _id: job.data.imageId,
                  },
                  {
                    label: "Zoomed View Shot",
                    url: shots.zoomedShot,
                    _id: job.data.imageId,
                  },
                  {
                    label: "Waist Shot",
                    url: shots.waistShot,
                    _id: job.data.imageId,
                  },
                  {
                    label: "Length Shot",
                    url: shots.lengthShot,
                    _id: job.data.imageId,
                  },
                ],
                url: url,
                status: "completed",
              },
            }
          );
        },
        3,
        1000
      ); // Retry 3 times with a 1-second delay between retries
    }, 7000);
    return shots;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
});

console.log("Worker is running");

async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
