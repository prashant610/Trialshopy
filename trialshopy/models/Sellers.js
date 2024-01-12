const mongoose = require('mongoose');

const SellersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: function (v) {
            return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        }
    }

},
name: {
    type: String,
    required: true
},

password: {
    type: String,
    required: true
},
});

const Sellers = mongoose.model('Sellers', SellersSchema);

module.exports = Sellers;
