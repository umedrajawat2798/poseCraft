const Bull = require('bull');

require('dotenv').config();

const imageQueue = new Bull('image-processing', {
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

module.exports = imageQueue;

