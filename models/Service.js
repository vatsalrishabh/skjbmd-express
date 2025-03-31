const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description:{
    type: String,
  },
  doctorIds: {
    type: [String], // Array of strings
    required: true
  },
  serviceImg:{
    type:String,
  },
});

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
