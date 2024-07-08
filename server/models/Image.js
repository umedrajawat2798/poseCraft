const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: String,
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  shots: [
    {
      label: String,
      url: String,
    },
  ],
});

module.exports = mongoose.model('Image', ImageSchema);
