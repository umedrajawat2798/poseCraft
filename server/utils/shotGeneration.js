const { loadImage, detectPose } = require('./poseDetection');
const sharp = require('sharp');
const { uploadToS3 } = require('./uploadToS3');

const cropImage = async (imageBuffer, bbox) => {
  const { x, y, width, height } = bbox;
  const croppedImage = await sharp(imageBuffer).extract({
    left: Math.round(x),
    top: Math.round(y),
    width: Math.round(width),
    height: Math.round(height)
  }).toBuffer();
  return croppedImage;
};

const getBoundingBox = (keypoints) => {
  const minX = Math.min(...keypoints.map((kp) => kp.position.x));
  const maxX = Math.max(...keypoints.map((kp) => kp.position.x));
  const minY = Math.min(...keypoints.map((kp) => kp.position.y));
  const maxY = Math.max(...keypoints.map((kp) => kp.position.y));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const generateShots = async (imageBuffer) => {
  const image = await loadImage(imageBuffer);
  const pose = await detectPose(image);

  const keypoints = pose.keypoints.filter((kp) => kp.score > 0.5);
  const neckPoints = keypoints.filter(
    (kp) => kp.part === 'nose' || kp.part === 'leftShoulder' || kp.part === 'rightShoulder'
  );
  const sleevePoints = keypoints.filter(
    (kp) => kp.part === 'leftElbow' || kp.part === 'rightElbow' || kp.part === 'leftShoulder' || kp.part === 'rightShoulder'
  );
  const zoomedPoints = keypoints.filter(
    (kp) => kp.part === 'nose' || kp.part === 'leftElbow' || kp.part === 'rightElbow'
  );

  const waistPoints = keypoints.filter(
    (kp) => kp.part === 'leftHip' || kp.part === 'rightHip' || kp.part === 'leftWaist' || kp.part === 'rightWaist'
  );
  const lengthPoints = keypoints.filter(
    (kp) => kp.part === 'leftShoulder' || kp.part === 'rightShoulder' || kp.part === 'leftHip' || kp.part === 'rightHip'
  );

  const neckBbox = getBoundingBox(neckPoints);
  let sleeveBbox = getBoundingBox(sleevePoints);
  const zoomedBbox = getBoundingBox(zoomedPoints);
  let waistBbox = getBoundingBox(waistPoints);
  const lengthBbox = getBoundingBox(lengthPoints);

  sleeveBbox = {
    ...sleeveBbox,
    height: sleeveBbox.height * 1.5 // Increase the height by 50%
  };

  waistBbox = {
    ...waistBbox,
    height: waistBbox.height * 7 // Increase the height by 50%
  };


  const neckShot = await cropImage(imageBuffer, neckBbox);
  const sleeveShot = await cropImage(imageBuffer, sleeveBbox);
  const zoomedShot = await cropImage(imageBuffer, zoomedBbox);
  const waistShot = await cropImage(imageBuffer, waistBbox);
  const lengthShot = await cropImage(imageBuffer, lengthBbox);


    // Upload the images to S3 and get their URLs
    const neckShotKey = `shots/neck_${Date.now()}.jpeg`;
    const sleeveShotKey = `shots/sleeve_${Date.now()}.jpeg`;
    const zoomedShotKey = `shots/zoomed_${Date.now()}.jpeg`;
    const waistShotKey = `shots/waist_${Date.now()}.jpeg`;
    const lengthShotKey = `shots/length_${Date.now()}.jpeg`;
  
    const neckShotUrl = (await uploadToS3(neckShot, neckShotKey)).Location;
    const sleeveShotUrl = (await uploadToS3(sleeveShot, sleeveShotKey)).Location;
    const zoomedShotUrl = (await uploadToS3(zoomedShot, zoomedShotKey)).Location;
    const waistShotUrl = (await uploadToS3(waistShot, waistShotKey)).Location;
    const lengthShotUrl = (await uploadToS3(lengthShot, lengthShotKey)).Location;

    return {
      neckShot: neckShotUrl,
      sleeveShot: sleeveShotUrl,
      zoomedShot: zoomedShotUrl,
      waistShot: waistShotUrl,
      lengthShot: lengthShotUrl,
    };
};

module.exports = { generateShots };
