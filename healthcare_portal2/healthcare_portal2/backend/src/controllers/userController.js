const User = require('../models/userModel');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, avatarUrl, phone,
      address,
      dateOfBirth,
      emergencyContact,
      medicalHistory,
      allergies,
      currentMedications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (medicalHistory) user.medicalHistory = medicalHistory;
    if (allergies) user.allergies = allergies;
    if (currentMedications) user.currentMedications = currentMedications;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    next(err);
  }
};
