const tf = require('@tensorflow/tfjs-node');
const posenet = require('@tensorflow-models/posenet');
// const sharp = require('sharp');

const loadImage = async (imagePath) => {
  // console.log("pah", imagePath)
  const image = await tf.node.decodeImage(imagePath);
  return image;
};

const detectPose = async (image) => {
  const net = await posenet.load();
  const pose = await tf.tidy(() => {
    // Estimate pose
    const poseEstimation = net.estimateSinglePose(image, {
      flipHorizontal: false,
    });
    return poseEstimation;
  });
  return pose;
};

module.exports = { loadImage, detectPose };
