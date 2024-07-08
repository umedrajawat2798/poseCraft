const express = require('express');
const { processImage, processBatchImages, getImageStatus } = require('../controllers/imageController');

const router = express.Router();

router.post('/process', processImage);
router.post('/process-batch', processBatchImages);
router.get('/image-status/:id', getImageStatus); // New route for getting image status

module.exports = router;
