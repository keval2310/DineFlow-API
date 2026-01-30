'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { userService, User, UserCreate, UserUpdate } from '../services/userService';
import { restaurantService, Restaurant } from '../services/restaurantService';
import { hasPermission } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

const UsersView: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isBusy, setIsBusy] = useState(true);
  const [err, setErr] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [inputs, setInputs] = useState<UserCreate & { RestaurantID: number }>({
    UserName: '',
    Password: '',
    UserRole: 'waiter',
    RestaurantID: 0,
  });

  const canEdit = hasPermission('canManageUsers');

  useEffect(() => {
    if (canEdit && user) {
      loadInitialData();
    }
  }, [canEdit, user]);

  const loadInitialData = async () => {
    try {
      setIsBusy(true);
      setErr('');
      const [uRes, rRes] = await Promise.all([
        userService.getAll(),
        restaurantService.getAll()
      ]);

      if (!uRes.error) {
        let stream: User[] = uRes.data || [];
        if (user && user.UserRole === 'manager' && user.RestaurantID) {
          stream = stream.filter((u: User) => u.RestaurantID === user.RestaurantID);
        }
        setItems(stream);
      }

      if (!rRes.error) {
        const sites = rRes.data || [];
        setRestaurants(sites);
        if (sites.length > 0 && !inputs.RestaurantID) {
          const defaultId = user?.RestaurantID || sites[0].RestaurantID;
          setInputs(prev => ({ ...prev, RestaurantID: defaultId }));
        }
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Data sync failure');
    } finally {
      setIsBusy(false);
    }
  };

  const getRestaurantName = (id: number) => {
    const r = restaurants.find(x => x.RestaurantID === id);
    return r ? r.RestaurantName : `Site ${id}`;
  };

  const triggerModal = (u?: User) => {
    if (u) {
      setActiveUser(u);
      setInputs({
        UserName: u.UserName,
        Password: '',
        UserRole: u.UserRole,
        RestaurantID: u.RestaurantID
      });
    } else {
      setActiveUser(null);
      setInputs({
        UserName: '',
        Password: '',
        UserRole: 'waiter',
        RestaurantID: user?.RestaurantID || (restaurants.length > 0 ? restaurants[0].RestaurantID : 0)
      });
    }
    setShowModal(true);
  };

  const dismissModal = () => {
    setShowModal(false);
    setActiveUser(null);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeUser) {
        await userService.update(activeUser.UserID, {
          UserName: inputs.UserName,
          UserRole: inputs.UserRole,
          RestaurantID: inputs.RestaurantID
        });
      } else {
        await userService.create(inputs);
      }
      dismissModal();
      loadInitialData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'User update failed');
      loadInitialData();
    }
  };

  const removeUser = async (id: number) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      setItems(old => old.filter(u => u.UserID !== id));
      await userService.delete(id);
      loadInitialData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete operation failed');
      loadInitialData();
    }
  };

  if (!canEdit) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          Access restricted.
        </div>
      </DashboardLayout>
    );
  }

  if (isBusy) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1f2937' }}>Users Management</h1>
          <button className="btn btn-primary" onClick={() => triggerModal()} style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>+</span> ADD USER
          </button>
        </div>

        {err && <div className="alert alert-error">{err}</div>}

        <div className="table-container" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="data-table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Username</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Restaurant</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No personnel records.</td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.UserID} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{it.UserID}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{it.UserName}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'capitalize' }}>
                        {it.UserRole}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{getRestaurantName(it.RestaurantID)}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => triggerModal(it)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '1.2rem' }}>✏️</button>
                        <button onClick={() => removeUser(it.UserID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={dismissModal}
        title={activeUser ? 'Edit User' : 'Add User'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={dismissModal}>Cancel</button>
            <button className="btn btn-primary" onClick={onFormSubmit}>{activeUser ? 'Save' : 'Create'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Username *</label>
            <input
              type="text"
              className="input-field"
              value={inputs.UserName}
              onChange={(e) => setInputs({ ...inputs, UserName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          {!activeUser && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Password *</label>
              <input
                type="password"
                className="input-field"
                value={inputs.Password}
                onChange={(e) => setInputs({ ...inputs, Password: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Role *</label>
            <select
              className="input-field"
              value={inputs.UserRole}
              onChange={(e) => setInputs({ ...inputs, UserRole: e.target.value })}
              style={{ width: '100%', background: 'white' }}
            >
              <option value="manager">Manager</option>
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Restaurant *</label>
            <select
              className="input-field"
              value={inputs.RestaurantID}
              onChange={(e) => setInputs({ ...inputs, RestaurantID: parseInt(e.target.value) })}
              style={{ width: '100%', background: 'white' }}
            >
              <option value={0}>Select Restaurant</option>
              {restaurants.map(r => (
                <option key={r.RestaurantID} value={r.RestaurantID}>{r.RestaurantName}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function Users() {
  return (
    <ProtectedRoute>
      <UsersView />
    </ProtectedRoute>
  );
}
