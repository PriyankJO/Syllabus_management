import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/login" style={{ marginTop: '20px', color: 'var(--color-secondary)' }}>Return to Login</Link>
    </div>
  );
};

export default Unauthorized;
