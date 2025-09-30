const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromoSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  branches: {
    type: String,
  },
  contents: {
    type: String,
    required: true
  },
  validity: {
    type: String,
    required: true
  },
  pricing: {
    short: {
      type: String,
      required: true
    },
    medium: {
      type: String,
      required: true
    },
    long: {
      type: String,
      required: true
    },
    extraLong: {
      type: String,
      required: true
    }
  }
});

module.exports = mongoose.model('Promo', PromoSchema);