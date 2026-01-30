'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Link from 'next/link';

const DashboardView: React.FC = () => {
  const { user } = useAuth();

  const navigationOptions = {
    manager: [
      { label: 'Manage Users', url: '/users', em: '👥', tint: '#3b82f6' },
      { label: 'Manage Tables', url: '/tables', em: '🪑', tint: '#10b981' },
      { label: 'Menu Items', url: '/menu-items', em: '🍕', tint: '#f59e0b' },
      { label: 'View Orders', url: '/orders', em: '📝', tint: '#ef4444' },
    ],
    waiter: [
      { label: 'Manage Tables', url: '/tables', em: '🪑', tint: '#10b981' },
      { label: 'Menu Items', url: '/menu-items', em: '🍕', tint: '#f59e0b' },
      { label: 'View Orders', url: '/orders', em: '📝', tint: '#ef4444' },
    ],
    chef: [
      { label: 'Kitchen Orders', url: '/kitchen-orders', em: '👨‍🍳', tint: '#ef4444' },
      { label: 'Menu Items', url: '/menu-items', em: '🍕', tint: '#f59e0b' },
    ],
    cashier: [
      { label: 'View Orders', url: '/orders', em: '📝', tint: '#ef4444' },
      { label: 'Manage Tables', url: '/tables', em: '🪑', tint: '#10b981' },
    ],
  };

  const navs = user ? navigationOptions[user.UserRole as keyof typeof navigationOptions] || [] : [];

  return (
    <DashboardLayout>
      <div className="fade-in">
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '2.5rem' }}>
          Welcome back, <strong style={{ color: '#111827' }}>{user?.UserName}!</strong>
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {navs.map((opt) => (
            <Link key={opt.url} href={opt.url} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                padding: '1.75rem',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                borderLeft: `5px solid ${opt.tint}`,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: `${opt.tint}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {opt.em}
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937' }}>{opt.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>System Information</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'Role:', value: user?.UserRole },
              { label: 'Restaurant ID:', value: user?.RestaurantID },
              { label: 'User ID:', value: user?.UserID }
            ].map((info, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '1.25rem 1.5rem', 
                background: idx % 2 === 0 ? '#f9fafb' : 'white',
                borderBottom: idx === 2 ? 'none' : '1px solid #f3f4f6'
              }}>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>{info.label}</span>
                <span style={{ color: '#111827', fontWeight: '800', textTransform: info.label === 'Role:' ? 'capitalize' : 'none' }}>{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  );
}
