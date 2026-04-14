"use client";
import React, { useState } from "react";

interface Doctor {
  name: string;
  experience_years: number;
  rating_percent: number;
  consultation_fee_inr: number;
  clinic_address: string;
}

const DoctorSearch = () => {
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleSearch = async () => {
    if (!city || !specialization) {
      alert("Please enter both city and specialization");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:9000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: city.trim().toLowerCase(),
          specialization: specialization.trim().toLowerCase(),
        }),
      });

      const data = await response.json();
      setDoctors(data.results || []);
      setSelectedDoctor(null);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  return (
    <div className="flex gap-6 p-6 max-w-7xl mx-auto">
      
      {/* Doctor Search */}
      <div className="w-1/2">
        <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter city"
            className="border rounded p-2 w-full"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter specialization"
            className="border rounded p-2 w-full"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>

        {doctors.length === 0 ? (
          <p className="text-gray-500">No doctors found. Try another search.</p>
        ) : (
          doctors.map((doc, index) => (
            <div
              key={index}
              className="p-4 border rounded mb-3 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedDoctor(doc)}
            >
              {/* <img
                src="/default-avatar.png"
                className="w-12 h-12 rounded-full"
                alt="Doctor Avatar"
              /> */}
              <div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-gray-600">
                  {specialization} • {doc.experience_years} yrs • ₹{doc.consultation_fee_inr}
                </p>
                <p className="text-sm text-yellow-600">⭐ {doc.rating_percent}%</p>
                <p className="text-sm text-gray-500">{doc.clinic_address}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Booking */}
      <div className="w-1/2 border rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
        {selectedDoctor ? (
          <div>
            <h3 className="text-lg font-medium">{selectedDoctor.name}</h3>
            <p className="text-sm text-gray-700">{specialization}</p>
            <p className="text-sm text-gray-500">{selectedDoctor.clinic_address}</p>
            <p className="text-sm text-gray-500">Experience: {selectedDoctor.experience_years} yrs</p>
            <p className="text-sm text-gray-500">Rating: ⭐ {selectedDoctor.rating_percent}%</p>
            <p className="text-sm text-gray-500">Fee: ₹{selectedDoctor.consultation_fee_inr}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              Book Now
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Select a doctor to book an appointment</p>
        )}
      </div>
    </div>
  );
};

export default DoctorSearch;
