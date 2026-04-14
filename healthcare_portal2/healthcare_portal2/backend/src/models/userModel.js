const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone :{ type: String },
  address :{ type: String } ,
  dateOfBirth :{ type: String },
  emergencyContact :{ type: String },
  medicalHistory :{ type: String },
  allergies :{ type: String },
  currentMedications :{ type: String },
  avatarUrl: { type: String }, // Optional
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
