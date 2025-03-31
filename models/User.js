const mongoose = require('mongoose');

// Address schema for detailed address information
const AddressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String }
});

// User schema including the nested address schema
const UserSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true},
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'donor','doctor','subadmin'], default: 'user' },
  license:{type: String,},
  mobile: { type: String },
  gender: { type: String, enum: ['male', 'female', 'prefer not to say'] },
  address: AddressSchema,
  age: { type: Number },
  pancard: { type: String },
  blocked: {type:Boolean, required:true, default:false},
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
