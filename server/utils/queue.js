const Bull = require('bull');

const imageQueue = new Bull('image-processing', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

module.exports = imageQueue;

