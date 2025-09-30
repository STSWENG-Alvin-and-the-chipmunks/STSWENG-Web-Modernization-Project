const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesSchema = new Schema({
  serviceName: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  serviceDescription: {
    type: String,
    required: true
  },
  serviceImages: {
    type:[String],
    required: true
  },
  pricing: {
    short: {
      type: String,
      required: false
    },
    medium: {
      type: String,
      required: false
    },
    long: {
      type: String,
      required: false
    },
    extraLong: {
      type: String,
      required: false
    },
    matrix: {
      type: String,
      required:false
    },
    elgon: {
      type: String,
      required:false
    },
    ordeve: {
      type: String,
      required:false
    },
    normal: {
      type: String,
      required:false
    }
  },
  cutOffTime: {
    type: String,
    required: true
  },
  branches: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Service', ServicesSchema);