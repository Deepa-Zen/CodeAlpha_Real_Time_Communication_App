import React from 'react';
import logo from '../assets/logo.png'; // adjust path if needed

const Header = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f0fdf4', // light green background
      borderBottom: '2px solid #10b981', // green border
    }}>
      <img src={logo} alt="AMYPO Logo" style={{ height: '50px', marginRight: '15px' }} />
      <h1 style={{ margin: 0, fontSize: '28px', color: '#black', fontWeight: 'bold' }}>
         DOT 
      </h1>
      <h1 style={{ margin: 0, fontSize: '28px', color: '#10b981', fontWeight: 'bold' }}>
         MEET
      </h1>
    </div>
  );
};

export default Header;
