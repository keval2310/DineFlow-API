'use client';

import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '1rem'
    }}>
      <div className="loading-spinner"></div>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
};

export default Loading;
