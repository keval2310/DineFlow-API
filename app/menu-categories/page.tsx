'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { menuCategoryService, MenuCategory, MenuCategoryCreate, MenuCategoryUpdate } from '../services/menuCategoryService';
import { restaurantService, Restaurant } from '../services/restaurantService';
import { hasPermission } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

const CategoriesView: React.FC = () => {
  const { user } = useAuth();
  const [cats, setCats] = useState<MenuCategory[]>([]);
  const [sites, setSites] = useState<Restaurant[]>([]);
  const [wait, setWait] = useState(true);
  const [fail, setFail] = useState('');
  const [modal, setModal] = useState(false);
  const [selection, setSelection] = useState<MenuCategory | null>(null);
  const [fields, setFields] = useState<MenuCategoryCreate>({
    MenuCategoryName: '',
    MenuCategoryImagePath: '',
    RestaurantID: 0,
  });

  const permit = hasPermission('canManageMenu');

  useEffect(() => {
    if (user) {
      loadSpecs();
    }
  }, [user]);

  const loadSpecs = async () => {
    try {
      setWait(true);
      setFail('');
      const [cRes, sRes] = await Promise.all([
        menuCategoryService.getAll(),
        restaurantService.getAll()
      ]);

      if (!cRes.error) {
        let stream = cRes.data || [];
        if (user && user.UserRole === 'manager' && user.RestaurantID) {
          stream = stream.filter((c: MenuCategory) => c.RestaurantID === user.RestaurantID);
        }
        setCats(stream);
      }
      if (!sRes.error) {
        const restaurants = sRes.data || [];
        setSites(restaurants);
        if (restaurants.length > 0 && !fields.RestaurantID) {
           // Default to first restaurant or user's restaurant
           const defaultId = user?.RestaurantID || restaurants[0].RestaurantID;
           setFields(prev => ({ ...prev, RestaurantID: defaultId }));
        }
      }
    } catch (e: any) {
      setFail('Specs sync failure');
    } finally {
      setWait(false);
    }
  };

  const getSiteName = (id: number) => {
    const s = sites.find(x => x.RestaurantID === id);
    return s ? s.RestaurantName : `Site ${id}`;
  };

  const edit = (c?: MenuCategory) => {
    if (c) {
      setSelection(c);
      setFields({ 
        MenuCategoryName: c.MenuCategoryName, 
        MenuCategoryImagePath: c.MenuCategoryImagePath || '',
        RestaurantID: c.RestaurantID
      });
    } else {
      setSelection(null);
      setFields({ 
        MenuCategoryName: '', 
        MenuCategoryImagePath: '',
        RestaurantID: user?.RestaurantID || (sites.length > 0 ? sites[0].RestaurantID : 0)
      });
    }
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selection) {
        await menuCategoryService.update(selection.MenuCategoryID, fields as MenuCategoryUpdate);
      } else {
        await menuCategoryService.create(fields);
      }
      setModal(false);
      loadSpecs();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Sync error');
      loadSpecs();
    }
  };

  const del = async (id: number) => {
    if (!window.confirm('Wipe this category?')) return;
    try {
      setCats(old => old.filter(x => x.MenuCategoryID !== id));
      await menuCategoryService.delete(id);
      loadSpecs();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Wipe failed');
      loadSpecs();
    }
  };

  if (wait) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Menu Categories Management</h1>
          {permit && (
            <button className="btn btn-primary" onClick={() => edit()} style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>+</span> ADD CATEGORY
            </button>
          )}
        </div>

        {fail && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{fail}</div>}

        <div className="table-container" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table className="data-table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Name</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {cats.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>No categories found.</td>
                </tr>
              ) : (
                cats.map(c => (
                  <tr key={c.MenuCategoryID} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{c.MenuCategoryID}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {c.MenuCategoryImagePath ? (
                          <img src={c.MenuCategoryImagePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '1.2rem' }}>🍴</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '700', color: '#111827', textTransform: 'uppercase' }}>{c.MenuCategoryName}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>{getSiteName(c.RestaurantID)}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {permit && (
                          <>
                            <button onClick={() => edit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '1.2rem' }}>✏️</button>
                            <button onClick={() => del(c.MenuCategoryID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}>🗑️</button>
                          </>
                        )}
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
        isOpen={modal} 
        onClose={() => setModal(false)} 
        title={selection ? 'Edit Category' : 'Add Category'} 
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{selection ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Category Name *</label>
            <input 
              type="text" 
              className="input-field"
              value={fields.MenuCategoryName} 
              onChange={(e) => setFields({...fields, MenuCategoryName: e.target.value})} 
              placeholder="e.g. Desserts"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Image URL</label>
            <input 
              type="text" 
              className="input-field"
              value={fields.MenuCategoryImagePath} 
              onChange={(e) => setFields({...fields, MenuCategoryImagePath: e.target.value})} 
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Restaurant *</label>
            <select 
              className="input-field"
              value={fields.RestaurantID} 
              onChange={(e) => setFields({...fields, RestaurantID: parseInt(e.target.value)})}
              style={{ background: 'white' }}
            >
              <option value={0}>Select Restaurant</option>
              {sites.map(s => (
                <option key={s.RestaurantID} value={s.RestaurantID}>{s.RestaurantName}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function MenuCategories() {
  return (
    <ProtectedRoute>
      <CategoriesView />
    </ProtectedRoute>
  );
}
