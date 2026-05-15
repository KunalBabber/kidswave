import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { showCustomAlert } from "./CustomAlert";

const ChildProfileSetup = ({ onProfileCreated }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !age || age < 1 || age > 18) {
      showCustomAlert("Please enter a valid name and age (1-18)");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${serverUrl}/api/safety/profile/child`,
        { name, age: parseInt(age) },
        { withCredentials: true }
      );

      showCustomAlert("Child profile created successfully!");
      onProfileCreated?.();
    } catch (error) {
      showCustomAlert(error.response?.data?.message || "Error creating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)', 
      padding: '30px', 
      borderRadius: '20px', 
      maxWidth: '450px', 
      margin: '0 auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      border: '1px solid #333'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>👶 New Profile</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
          Set up a safe viewing experience for your child.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Child's Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: '#2a2a2a', 
              border: '1px solid #444', 
              borderRadius: '10px', 
              color: 'white',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#ccc' }}>Age</label>
          <input
            type="number"
            min="1"
            max="18"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            required
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: '#2a2a2a', 
              border: '1px solid #444', 
              borderRadius: '10px', 
              color: 'white',
              outline: 'none'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: 'linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)', 
            border: 'none', 
            borderRadius: '12px', 
            color: 'white', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {loading ? "Creating..." : "✨ Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default ChildProfileSetup;
