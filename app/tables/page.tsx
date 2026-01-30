'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { tableService, Table, TableCreate, TableUpdate } from '../services/tableService';
import { restaurantService, Restaurant } from '../services/restaurantService';
import { hasPermission } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

const TablesView: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Table[]>([]);
  const [venues, setVenues] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [target, setTarget] = useState<Table | null>(null);
  const [draft, setDraft] = useState<TableCreate & { RestaurantID: number }>({
    TableNumber: 0,
    TableCapacity: 4,
    TableStatus: 'free',
    RestaurantID: 0,
  });

  const canEdit = hasPermission('canManageTables');

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const [tRes, rRes] = await Promise.all([
        tableService.getAll(),
        restaurantService.getAll()
      ]);

      if (!tRes.error) {
        let stream = tRes.data || [];
        if (user && user.UserRole === 'manager' && user.RestaurantID) {
          stream = stream.filter((t: Table) => t.RestaurantID === user.RestaurantID);
        }
        setData(stream);
      }

      if (!rRes.error) {
        const restaurants = rRes.data || [];
        setVenues(restaurants);
        if (restaurants.length > 0 && !draft.RestaurantID) {
           const defaultId = user?.RestaurantID || restaurants[0].RestaurantID;
           setDraft(prev => ({ ...prev, RestaurantID: defaultId }));
        }
      }
    } catch (e: any) {
      setErrorMessage('Failed to sync tables.');
    } finally {
      setIsLoading(false);
    }
  };

  const findVenue = (id: number) => {
    const v = venues.find(r => r.RestaurantID === id);
    return v ? v.RestaurantName : `ID ${id}`;
  };

  const openEditor = (t?: Table) => {
    if (t) {
      setTarget(t);
      setDraft({
        TableNumber: t.TableNumber,
        TableCapacity: t.TableCapacity,
        TableStatus: t.TableStatus,
        RestaurantID: t.RestaurantID,
      });
    } else {
      setTarget(null);
      setDraft({
        TableNumber: 0,
        TableCapacity: 4,
        TableStatus: 'free',
        RestaurantID: user?.RestaurantID || (venues.length > 0 ? venues[0].RestaurantID : 0)
      });
    }
    setIsEditorOpen(true);
  };

  const saveChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (target) {
        await tableService.update(target.TableID, draft as TableUpdate);
      } else {
        await tableService.create(draft);
      }
      setIsEditorOpen(false);
      refreshData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Sync failed');
      refreshData();
    }
  };

  const trashItem = async (id: number) => {
    if (!window.confirm('Delete this table record?')) return;
    try {
      setData(old => old.filter(t => t.TableID !== id));
      await tableService.delete(id);
      refreshData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete error');
      refreshData();
    }
  };

  if (isLoading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1f2937' }}>Tables Management</h1>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => openEditor()} style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>+</span> ADD TABLE
            </button>
          )}
        </div>

        <div className="table-container" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="data-table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Table Number</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Capacity</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Restaurant</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>No tables found.</td>
                </tr>
              ) : (
                data.map((t) => (
                  <tr key={t.TableID} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{t.TableID}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{t.TableNumber}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{t.TableCapacity} Pax</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '700', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px',
                        background: t.TableStatus === 'free' ? '#ecfdf5' : '#fef2f2',
                        color: t.TableStatus === 'free' ? '#065f46' : '#991b1b',
                        textTransform: 'uppercase'
                      }}>
                        {t.TableStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{findVenue(t.RestaurantID)}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => openEditor(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '1.2rem' }}>✏️</button>
                        <button onClick={() => trashItem(t.TableID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}>🗑️</button>
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
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={target ? 'Edit Table' : 'Add Table'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditorOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveChange}>{target ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Table Number *</label>
            <input type="number" className="input-field" value={draft.TableNumber} onChange={(e) => setDraft({...draft, TableNumber: parseInt(e.target.value)})} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Capacity *</label>
            <input type="number" className="input-field" value={draft.TableCapacity} onChange={(e) => setDraft({...draft, TableCapacity: parseInt(e.target.value)})} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Status *</label>
            <select className="input-field" value={draft.TableStatus} onChange={(e) => setDraft({...draft, TableStatus: e.target.value as any})} style={{ width: '100%', background: 'white' }}>
              <option value="free">Free</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Restaurant *</label>
            <select className="input-field" value={draft.RestaurantID} onChange={(e) => setDraft({...draft, RestaurantID: parseInt(e.target.value)})} style={{ width: '100%', background: 'white' }}>
              <option value={0}>Select Restaurant</option>
              {venues.map(v => (
                <option key={v.RestaurantID} value={v.RestaurantID}>{v.RestaurantName}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function Tables() {
  return (
    <ProtectedRoute>
      <TablesView />
    </ProtectedRoute>
  );
}
