const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION // Optional: specify your AWS region
  });

const uploadToS3 = async (imageBuffer, imageName) => {
  const params = {
    Bucket: 'posecraft',
    Key: imageName,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
  };

  return s3.upload(params).promise();
};

module.exports = { uploadToS3 };
