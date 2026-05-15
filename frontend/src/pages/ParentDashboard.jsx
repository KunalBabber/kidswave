import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import ChildProfileSetup from '../component/ChildProfileSetup';
import { showCustomAlert } from '../component/CustomAlert';

const ParentDashboard = () => {
  const { userData } = useSelector(state => state.user);
  const [childProfiles, setChildProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/safety/profiles/child`, { withCredentials: true });
      setChildProfiles(response.data.profiles);
    } catch (error) {
      console.error("Error fetching child profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSwitchProfile = async (childId) => {
    try {
      await axios.post(`${serverUrl}/api/safety/profile/switch`, { childId }, { withCredentials: true });
      showCustomAlert(childId ? "Switched to Child Mode!" : "Switched to Parent Mode!");
      window.location.href = '/'; // Reload to apply changes
    } catch (error) {
      console.error("Switch profile error:", error);
      const msg = error.response?.data?.message || "Error switching profile";
      showCustomAlert(msg);
    }
  };

  return (
    <div className="parent-dashboard" style={{ padding: '40px', background: '#0f0f0f', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>Parental Controls</h1>
          <button 
            onClick={() => setShowSetup(!showSetup)}
            style={{ 
              padding: '10px 20px', 
              background: '#ff4b2b', 
              border: 'none', 
              borderRadius: '25px', 
              color: 'white', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showSetup ? 'Back to Profiles' : '+ Create Child Profile'}
          </button>
        </header>

        {showSetup ? (
          <ChildProfileSetup onProfileCreated={() => { setShowSetup(false); fetchProfiles(); }} />
        ) : (
          <div className="profiles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {/* Parent Profile Card */}
            <div 
              onClick={() => handleSwitchProfile(null)}
              style={{ 
                padding: '20px', 
                background: '#1e1e1e', 
                borderRadius: '15px', 
                textAlign: 'center', 
                cursor: 'pointer',
                border: !userData.isChildProfile ? '2px solid #ff4b2b' : '2px solid transparent',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👤</div>
              <h3>Parent Mode</h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Full Access</p>
            </div>

            {/* Child Profile Cards */}
            {childProfiles.map(profile => (
              <div 
                key={profile._id}
                onClick={() => handleSwitchProfile(profile._id)}
                style={{ 
                  padding: '20px', 
                  background: '#1e1e1e', 
                  borderRadius: '15px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  border: userData.activeChildProfile === profile._id ? '2px solid #ff4b2b' : '2px solid transparent',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👶</div>
                <h3>{profile.name}</h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Age: {profile.age}</p>
              </div>
            ))}

            {loading && <p>Loading profiles...</p>}
            {!loading && childProfiles.length === 0 && !showSetup && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', marginTop: '20px' }}>
                No child profiles found. Create one to get started!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
