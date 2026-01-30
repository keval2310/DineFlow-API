'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [uname, setUname] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [checking, setChecking] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const nav = useRouter();

  useEffect(() => {
    if (isAuthenticated) nav.push('/dashboard');
  }, [isAuthenticated, nav]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setChecking(true);

    try {
      const res = await login({ UserName: uname, Password: pwd });
      if (res.success) {
        nav.push('/dashboard');
      } else {
        setErrMsg(res.message || 'Verification failed. Try again.');
      }
    } catch (err) {
      setErrMsg('Server connection issue.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        className="fade-in"
        style={{
          maxWidth: '450px',
          width: '100%',
          padding: '3rem',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: '#2563eb', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem' 
          }}>
            <span style={{ fontSize: '2rem', color: 'white' }}>🍽️</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#111827', marginBottom: '0.5rem' }}>
            DineFlow POS
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>Sign In</p>
        </div>

        {errMsg && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.875rem', borderRadius: '12px', fontSize: '0.875rem', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
            {errMsg}
          </div>
        )}

        <form onSubmit={onLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>Username *</label>
            <input
              type="text"
              className="input-field"
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              placeholder="Enter your username"
              required
              style={{ width: '100%', padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '12px', outline: 'none', background: '#f3f4f6' }}
            />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>Password *</label>
            <input
              type="password"
              className="input-field"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '12px', outline: 'none', background: '#f3f4f6' }}
            />
          </div>

          <button
            type="submit"
            disabled={checking}
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '800', 
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
            }}
          >
            {checking ? 'Signing In...' : 'SIGN IN'}
          </button>
        </form>
      </div>

      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem' }}>
         <div style={{ width: '40px', height: '40px', background: '#111827', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>N</div>
      </div>
    </div>
  );
}
