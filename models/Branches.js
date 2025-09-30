const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BranchesSchema = new Schema({
  branchName: {
    type: String,
    required: true,
    unique: true
  },
  branchLocation: {
    type: String,
    required: true
  },
  branchDescription: {
    type: String,
    required: true
  },
  branchAdditionalDescription: {
    type: String,
    required: false
  },
  locationImage: {
    type:String,
    required: true
  },
  operatingHours: {
    type: String,
    required: true
  },
  mobileNumbers: {
    type: String,
    required: true
  },
  landLineNumbers: {
    type: String,
    required: true
  },
  fbLink:{
    type: String,
    required: true
  },
  numberOfStations:{
    type: Number,
    required: true
  },
  maxClientOccupancy:{
    type: Number,
    required: true
  },
  restroom:{
    type: String,
    required: true
  },
  wifi:{
    type: String,
    required: true
  },
  parkingLocation:{
    type: String,
    required: true
  } 
})

module.exports = mongoose.model('Branches', BranchesSchema);