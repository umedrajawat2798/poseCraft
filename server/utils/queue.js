const Bull = require('bull');

require('dotenv').config();

const imageQueue = new Bull('image-processing', {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  }
});

imageQueue.isReady().then(()=>{
  console.log("bull connected")
}).catch((err)=> {
  console.log("error in bull", err)
})

module.exports = imageQueue;

