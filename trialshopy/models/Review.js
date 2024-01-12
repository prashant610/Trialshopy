const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  responses: [
    {
      text: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
