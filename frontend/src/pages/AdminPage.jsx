import React from 'react';
import AdminSafetyPanel from '../component/AdminSafetyPanel';
import BlacklistManager from '../component/BlacklistManager';
import VideoApprovalPanel from '../component/VideoApprovalPanel';

const AdminPage = () => {
  return (
    <div className="admin-page-container" style={{ padding: '20px', background: '#0f0f0f', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', fontWeight: 'bold' }}>Admin Safety Dashboard</h1>
      
      <div style={{ display: 'grid', gap: '40px' }}>
        <section>
          <h2 style={{ marginBottom: '15px', color: '#ff4b2b' }}>Video Approvals</h2>
          <VideoApprovalPanel />
        </section>

        <section>
          <h2 style={{ marginBottom: '15px', color: '#ff4b2b' }}>Reported Content</h2>
          <AdminSafetyPanel />
        </section>

        <section>
          <h2 style={{ marginBottom: '15px', color: '#ff4b2b' }}>Keyword Blacklist</h2>
          <BlacklistManager />
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
