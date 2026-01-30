'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { restaurantService, Restaurant, RestaurantCreate, RestaurantUpdate } from '../services/restaurantService';
import { hasPermission } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

const EntitiesView: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<Restaurant[]>([]);
  const [wait, setWait] = useState(true);
  const [msg, setMsg] = useState('');
  const [uiModal, setUiModal] = useState(false);
  const [chosen, setChosen] = useState<Restaurant | null>(null);
  const [data, setData] = useState<RestaurantCreate>({
    RestaurantName: '',
    RestaurantAddress: '',
    RestaurantPhone: '',
  });

  const permit = hasPermission('canManageRestaurant');

  useEffect(() => {
    if (permit && user) {
      sync();
    }
  }, [permit, user]);

  const sync = async () => {
    try {
      setWait(true);
      setMsg('');
      const res = await restaurantService.getAll();
      if (!res.error) {
        setList(Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []));
      } else {
        setMsg(res.message || 'Entity feed empty');
      }
    } catch (e: any) {
      setMsg('Feed sync failure');
    } finally {
      setWait(false);
    }
  };

  const trigger = (r?: Restaurant) => {
    if (r) {
      setChosen(r);
      setData({ RestaurantName: r.RestaurantName, RestaurantAddress: r.RestaurantAddress || '', RestaurantPhone: r.RestaurantPhone || '' });
    } else {
      setChosen(null);
      setData({ RestaurantName: '', RestaurantAddress: '', RestaurantPhone: '' });
    }
    setUiModal(true);
  };

  const commit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (chosen) {
        await restaurantService.update(chosen.RestaurantID, data as RestaurantUpdate);
      } else {
        await restaurantService.create(data);
      }
      setUiModal(false);
      sync();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Transaction error');
      sync();
    }
  };

  const wipe = async (id: number) => {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      setList(old => old.filter(x => x.RestaurantID !== id));
      await restaurantService.delete(id);
      sync();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete error');
      sync();
    }
  };

  if (!permit) return <DashboardLayout><div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Forbidden</div></DashboardLayout>;
  if (wait) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Restaurants Management</h1>
          <button className="btn btn-primary" onClick={() => trigger()} style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>+</span> ADD RESTAURANT
          </button>
        </div>

        {msg && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{msg}</div>}

        <div className="table-container" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table className="data-table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Restaurant Name</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Address</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>No restaurants found.</td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r.RestaurantID} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{r.RestaurantID}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: '#111827' }}>{r.RestaurantName}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{r.RestaurantAddress || 'N/A'}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{r.RestaurantPhone || 'N/A'}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => trigger(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '1.2rem' }}>✏️</button>
                        <button onClick={() => wipe(r.RestaurantID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}>🗑️</button>
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
        isOpen={uiModal}
        onClose={() => setUiModal(false)}
        title={chosen ? 'Edit Restaurant' : 'Add Restaurant'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUiModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={commit}>{chosen ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Restaurant Name *</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. DineFlow Downtown" 
              value={data.RestaurantName} 
              onChange={e => setData({...data, RestaurantName: e.target.value})} 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Address</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. 123 Main St" 
              value={data.RestaurantAddress} 
              onChange={e => setData({...data, RestaurantAddress: e.target.value})} 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '700' }}>Phone</label>
            <input 
              type="tel" 
              className="input-field"
              placeholder="e.g. +1 234 567 890" 
              value={data.RestaurantPhone} 
              onChange={e => setData({...data, RestaurantPhone: e.target.value})} 
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function Restaurants() {
  return (
    <ProtectedRoute>
      <EntitiesView />
    </ProtectedRoute>
  );
}
