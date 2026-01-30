'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { menuItemService, MenuItem, MenuItemCreate, MenuItemUpdate } from '../services/menuItemService';
import { menuCategoryService, MenuCategory } from '../services/menuCategoryService';
import { restaurantService, Restaurant } from '../services/restaurantService';
import { hasPermission, formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

const MenuItemsView: React.FC = () => {
  const { user } = useAuth();
  const [dataList, setDataList] = useState<MenuItem[]>([]);
  const [catList, setCatList] = useState<MenuCategory[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currItem, setCurrItem] = useState<MenuItem | null>(null);
  const [values, setValues] = useState<MenuItemCreate>({
    MenuItemName: '',
    MenuItemPrice: 0,
    MenuCategoryID: 0,
    MenuItemImagePath: '',
  });

  const canEditMenu = hasPermission('canManageMenu');

  useEffect(() => {
    if (user) {
      syncMenuData();
    }
  }, [user]);

  const syncMenuData = async () => {
    try {
      setIsDataLoading(true);
      setErrorInfo('');
      
      const [iRes, cRes, rRes] = await Promise.all([
        menuItemService.getAll(),
        menuCategoryService.getAll(),
        restaurantService.getAll()
      ]);

      if (!cRes.error) {
        setCatList(cRes.data || []);
      }

      if (!rRes.error) {
        setRestaurants(rRes.data || []);
      }

      if (!iRes.error) {
        let items: MenuItem[] = iRes.data || [];
        const validCats = (cRes.data || []).map((c: MenuCategory) => c.MenuCategoryID);
        
        if (user && user.UserRole === 'manager' && user.RestaurantID) {
          items = items.filter((i: MenuItem) => validCats.includes(i.MenuCategoryID));
        }
        
        setDataList(items);
      }
    } catch (err: any) {
      setErrorInfo(err.response?.data?.message || 'Data sync error');
    } finally {
      setIsDataLoading(false);
    }
  };

  const findCat = (id: number) => {
    return catList.find(c => c.MenuCategoryID === id);
  };

  const getRestaurantName = (catId: number) => {
    const cat = findCat(catId);
    if (!cat) return 'N/A';
    const res = restaurants.find(r => r.RestaurantID === cat.RestaurantID);
    return res ? res.RestaurantName : `ID ${cat.RestaurantID}`;
  };

  const startEdit = (m?: MenuItem) => {
    if (m) {
      setCurrItem(m);
      setValues({
        MenuItemName: m.MenuItemName,
        MenuItemPrice: m.MenuItemPrice,
        MenuCategoryID: m.MenuCategoryID,
        MenuItemImagePath: m.MenuItemImagePath || '',
      });
    } else {
      setCurrItem(null);
      setValues({
        MenuItemName: '',
        MenuItemPrice: 0,
        MenuCategoryID: catList.length > 0 ? catList[0].MenuCategoryID : 0,
        MenuItemImagePath: '',
      });
    }
    setOpenModal(true);
  };

  const stopEdit = () => {
    setOpenModal(false);
    setCurrItem(null);
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currItem) {
        await menuItemService.update(currItem.MenuItemID, values as MenuItemUpdate);
      } else {
        await menuItemService.create(values);
      }
      stopEdit();
      syncMenuData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Save error');
      syncMenuData();
    }
  };

  const killEntry = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      setDataList(prev => prev.filter(i => i.MenuItemID !== id));
      await menuItemService.delete(id);
      syncMenuData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete error');
      syncMenuData();
    }
  };

  if (isDataLoading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Menu Items Management</h1>
          {canEditMenu && (
            <button className="btn btn-primary" onClick={() => startEdit()} style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>+</span> ADD ITEM
            </button>
          )}
        </div>

        {errorInfo && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorInfo}</div>}

        <div className="table-container" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table className="data-table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Image</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Item Name</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Restaurant</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>No items found.</td>
                </tr>
              ) : (
                dataList.map((m) => (
                  <tr key={m.MenuItemID} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>{m.MenuItemID}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f3f4f6', overflow: 'hidden' }}>
                        <img 
                          src={m.MenuItemImagePath || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100`} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: '#111827' }}>{m.MenuItemName}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#10b981', fontWeight: '700' }}>{formatCurrency(m.MenuItemPrice)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{findCat(m.MenuCategoryID)?.MenuCategoryName || '???'}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{getRestaurantName(m.MenuCategoryID)}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {canEditMenu && (
                          <>
                            <button onClick={() => startEdit(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '1.2rem' }}>✏️</button>
                            <button onClick={() => killEntry(m.MenuItemID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}>🗑️</button>
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
        isOpen={openModal}
        onClose={stopEdit}
        title={currItem ? 'Edit Item' : 'Add Item'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={stopEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEntry}>{currItem ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Item Name *</label>
            <input
              type="text"
              className="input-field"
              value={values.MenuItemName}
              onChange={(e) => setValues({ ...values, MenuItemName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Price *</label>
            <input
              type="number"
              className="input-field"
              value={values.MenuItemPrice}
              onChange={(e) => setValues({ ...values, MenuItemPrice: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Image URL</label>
            <input
              type="text"
              className="input-field"
              value={values.MenuItemImagePath}
              onChange={(e) => setValues({ ...values, MenuItemImagePath: e.target.value })}
              style={{ width: '100%' }}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Category *</label>
            <select
              className="input-field"
              value={values.MenuCategoryID}
              onChange={(e) => setValues({ ...values, MenuCategoryID: parseInt(e.target.value) })}
              style={{ width: '100%', background: 'white' }}
            >
              <option value={0}>Select Category</option>
              {catList.map(c => <option key={c.MenuCategoryID} value={c.MenuCategoryID}>{c.MenuCategoryName}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function MenuItems() {
  return (
    <ProtectedRoute>
      <MenuItemsView />
    </ProtectedRoute>
  );
}
