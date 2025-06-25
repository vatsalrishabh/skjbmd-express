const mongoose = require('mongoose');

// Address schema for detailed address information
const AddressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String }
});

// Define all roles
const roles = [
  // National Level
  'rashtriyapramukh',
  'sahpramukh',
  'sangathanmantri',
  'sahsangathanmantri',
  'koshadhaksh',
  'karyalaysachiv',
  'rashtriyapracharak',
  'sahpracharak',
  'mediaprabhari',

  // State Level
  'pradeshprabhari',                // ✅ Added
  'pradeshpramukh',
  'pradeshsahpramukh',
  'pradeshsangathanmantri',
  'pradeshsahsangathanmantri',
  'pradeshkoshadhaksh',
  'pradeshkaryalaysachiv',
  'pradeshpracharak',
  'pradeshsahpracharak',
  'pradeshmediaprabhari',

  // Mandal Level
  'mandalprabhari',                 // ✅ Added

  // District Level
  'jilapramukh',
  'sahjilapramukh',
  'jilasangathanmantri',
  'jilasahsangathanmantri',
  'jilakoshadhaksh',
  'jilakaryalaysachiv',
  'jilapracharak',
  'jilasahpracharak',
  'districtmediaprabhari',

  // General
  'member',
];


// User schema including the nested address schema
const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  dpUrl: {
    type: String,
    default: '' // or a default image URL
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: roles, default: 'member' },
  padKaNaam: { type: String }, // Actual title/name of the post in Hindi

  gender: { type: String, enum: ['male', 'female', 'prefer not to say'] },
  address: AddressSchema,
  age: { type: Number },
  aadharCard: { type: String, unique: true },
  pancard: { type: String },
  blocked: { type: Boolean, required: true, default: false },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
