const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  commissionPercentage: Number,
  parentCategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  
});

const Commission = mongoose.model('Commission', commissionSchema);

module.exports = Commission;
