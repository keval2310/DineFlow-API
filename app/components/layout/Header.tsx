'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header
      style={{
        background: '#2563eb',
        color: 'white',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
          Welcome to DineFlow POS
        </h2>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.UserName}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'capitalize' }}>
            {user.UserRole}
          </div>
        </div>
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
          }}
        >
          👤
        </div>
      </div>
    </header>
  );
};

export default Header;
