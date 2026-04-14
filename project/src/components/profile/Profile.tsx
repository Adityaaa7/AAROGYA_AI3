import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
}

export default function Profile() {
  const { user, setUser } = useAuth(); // Make sure `setUser` is available
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: ''
  });
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  const fetchProfile = async () => {
    try {
      const userToken = localStorage.getItem("healthcareToken");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      const data = await res.json();
      setProfile(data);
      setTempProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const userToken = localStorage.getItem("healthcareToken");

    if (!userToken) {
      alert("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          ...tempProfile,
          avatarUrl: user?.avatar || ''
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Update failed");

      alert("Profile updated successfully!");
      setProfile(tempProfile);
      setIsEditing(false);
      if (setUser) setUser((prev: any) => ({ ...prev, ...tempProfile })); // optional
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const profileSections = [
    {
      title: 'Personal Information',
      fields: [
        { key: 'firstName', label: 'First Name', icon: User, type: 'text' },
        { key: 'lastName', label: 'Last Name', icon: User, type: 'text' },
        { key: 'email', label: 'Email', icon: Mail, type: 'email' },
        { key: 'phone', label: 'Phone', icon: Phone, type: 'tel' },
        { key: 'dateOfBirth', label: 'Date of Birth', icon: Calendar, type: 'date' },
        { key: 'address', label: 'Address', icon: MapPin, type: 'text' }
      ]
    },
    {
      title: 'Emergency & Medical Information',
      fields: [
        { key: 'emergencyContact', label: 'Emergency Contact', icon: Phone, type: 'text' },
        { key: 'medicalHistory', label: 'Medical History', icon: User, type: 'textarea' },
        { key: 'allergies', label: 'Allergies', icon: User, type: 'textarea' },
        { key: 'currentMedications', label: 'Current Medications', icon: User, type: 'textarea' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600">Manage your personal and medical information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white"
                  />
                  <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                  <p className="text-primary-100">{profile.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {profileSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{section.title}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.fields.map((field) => {
                    const Icon = field.icon;
                    const value = isEditing
                      ? tempProfile[field.key as keyof UserProfile]
                      : profile[field.key as keyof UserProfile];

                    return (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          {field.label}
                        </label>
                        {isEditing ? (
                          field.type === 'textarea' ? (
                            <textarea
                              value={value}
                              onChange={(e) => handleChange(field.key as keyof UserProfile, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                              rows={3}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={value}
                              onChange={(e) => handleChange(field.key as keyof UserProfile, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            />
                          )
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900">{value || 'Not specified'}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Account Settings</h4>
                <p className="text-sm text-gray-600">Manage your account preferences</p>
              </div>
              <div className="space-x-2">
                <button className="text-sm text-primary-600 hover:text-primary-700 px-3 py-1 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                  Change Password
                </button>
                <button className="text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy & Security</h4>
          <p className="text-sm text-blue-800">
            Your medical information is encrypted and stored securely. We comply with HIPAA regulations
            and never share your personal health information without your explicit consent.
          </p>
        </div>
      </div>
    </div>
  );
}
