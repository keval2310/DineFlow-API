'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { menuItemService, MenuItem } from '../services/menuItemService';
import { menuCategoryService, MenuCategory } from '../services/menuCategoryService';
import { tableService, Table } from '../services/tableService';
import { orderService, OrderCreate } from '../services/orderService';
import { orderItemService } from '../services/orderItemService';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

interface BasketItem extends MenuItem {
  qty: number;
}

const PointOfSaleView: React.FC = () => {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<MenuItem[]>([]);
  const [groups, setGroups] = useState<MenuCategory[]>([]);
  const [layout, setLayout] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPOSData();
  }, []);

  const loadPOSData = async () => {
    try {
      setLoading(true);
      const [mRes, gRes, lRes] = await Promise.all([
        menuItemService.getAll(),
        menuCategoryService.getAll(),
        tableService.getAll()
      ]);

      if (!mRes.error) setCatalog(mRes.data || []);
      if (!gRes.error) setGroups(gRes.data || []);
      if (!lRes.error) setLayout(lRes.data || []);
    } catch (err) {
      console.error('POS Init Error', err);
    } finally {
      setLoading(false);
    }
  };

  const pushToBasket = (it: MenuItem) => {
    setBasket(prev => {
      const match = prev.find(x => x.MenuItemID === it.MenuItemID);
      if (match) {
        return prev.map(x => x.MenuItemID === it.MenuItemID ? { ...x, qty: x.qty + 1 } : x);
      }
      return [...prev, { ...it, qty: 1 }];
    });
  };

  const dropFromBasket = (id: number) => {
    setBasket(prev => prev.filter(x => x.MenuItemID !== id));
  };

  const adjustQty = (id: number, inc: number) => {
    setBasket(prev => prev.map(x => {
      if (x.MenuItemID === id) {
        const next = Math.max(1, x.qty + inc);
        return { ...x, qty: next };
      }
      return x;
    }));
  };

  const commitTicket = async () => {
    if (!activeTable) {
      alert('Please select a table first.');
      return;
    }
    if (basket.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    try {
      setLoading(true);
      const total = calcBill();
      
      console.log('Attempting to create order for table:', activeTable.TableID);
      
      const orderPayload: OrderCreate = {
        TableID: activeTable.TableID,
        RestaurantID: user?.RestaurantID || 1,
        OrderStatus: 'pending' as const,
        TotalAmount: total 
      };

      const res = await orderService.create(orderPayload);
      console.log('Order Create Response:', res);

      if (res.error) {
        throw new Error(res.message || 'Server returned an error successfully.');
      }

      // Very robust ID extraction
      const orderData = res.data || res;
      const tid = orderData.OrderID || orderData.id || (typeof orderData === 'number' ? orderData : null);

      if (!tid) {
        throw new Error(`Order created but no ID returned. Response: ${JSON.stringify(res)}`);
      }

      console.log('Order created with ID:', tid, '. Now adding items...');

      // Create all order items
      const itemPromises = basket.map(b => 
        orderItemService.create({
          OrderID: Number(tid),
          MenuItemID: b.MenuItemID,
          Quantity: b.qty
        })
      );

      const itemResults = await Promise.all(itemPromises);
      console.log('Order items added:', itemResults);

      setMsg(`Order #${tid} has been successfully submitted!`);
      setBasket([]);
      setActiveTable(null);
      
      await loadPOSData();
      setTimeout(() => setMsg(null), 5000);
    } catch (err: any) {
      console.error('Order Submission Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      const detail = err.response?.data ? `\nServer say: ${JSON.stringify(err.response.data)}` : '';
      alert(`Submission Failed: ${errorMessage}${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const calcBill = () => basket.reduce((a, b) => a + (b.MenuItemPrice * b.qty), 0);

  const displaySpecs = activeGroup === 0 
    ? catalog 
    : catalog.filter(x => x.MenuCategoryID === activeGroup);

  if (loading && catalog.length === 0) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#111827' }}>Point of Sale</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setShowTablePicker(true)} 
              style={{ background: 'white', border: '1px solid #d1d5db', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
               <span>🪑</span> {activeTable ? `TABLE ${activeTable.TableNumber}` : 'SELECT TABLE'}
            </button>
            <button 
              onClick={() => setBasket([])} 
              style={{ background: 'white', border: '1px solid #ef444466', color: '#ef4444', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              CLEAR CART
            </button>
            <button 
              onClick={() => { setBasket([]); setActiveTable(null); }}
              style={{ background: 'white', border: '1px solid #2563eb66', color: '#2563eb', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              NEW ORDER
            </button>
          </div>
        </div>

        {msg && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '700' }}>{msg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Main Area: Catalog */}
          <div>
            <div style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid #e5e7eb',
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280' }}>Filter by Category</label>
              <select 
                value={activeGroup} 
                onChange={(e) => setActiveGroup(parseInt(e.target.value))}
                style={{ 
                  width: '300px', 
                  padding: '0.75rem', 
                  borderRadius: '10px', 
                  border: '1px solid #d1d5db', 
                  background: '#f9fafb',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#111827',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={0}>All Categories</option>
                {groups.map(g => (
                  <option key={g.MenuCategoryID} value={g.MenuCategoryID}>{g.MenuCategoryName}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {displaySpecs.map(s => (
                <div 
                  key={s.MenuItemID} 
                  style={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    padding: '1.5rem', 
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#111827' }}>{s.MenuItemName}</h4>
                  <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    {groups.find(g => g.MenuCategoryID === s.MenuCategoryID)?.MenuCategoryName || 'General'}
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2563eb' }}>{formatCurrency(s.MenuItemPrice)}</span>
                    <button 
                      onClick={() => pushToBasket(s)}
                      style={{ 
                        background: '#2563eb', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.875rem', 
                        borderRadius: '10px', 
                        fontSize: '0.875rem', 
                        fontWeight: '800', 
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                      }}
                    >
                      + ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Order Cart */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '2rem', borderRadius: '24px', position: 'sticky', top: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛒</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111827' }}>Order Cart</h3>
            </div>
            
            <div style={{ minHeight: '350px', maxHeight: '500px', overflowY: 'auto', marginBottom: '2rem', paddingRight: '0.5rem' }}>
              {basket.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                   <p style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: '500' }}>Your cart is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {basket.map(b => (
                    <div key={b.MenuItemID} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#111827' }}>{b.MenuItemName}</h4>
                         <button onClick={() => dropFromBasket(b.MenuItemID)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', fontSize: '1rem' }}>🗑️</button>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280', margin: '0.25rem 0 0.75rem' }}>
                        {formatCurrency(b.MenuItemPrice)} &times; {b.qty} = <span style={{ color: '#2563eb' }}>{formatCurrency(b.MenuItemPrice * b.qty)}</span>
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '8px', padding: '0.2rem', width: 'fit-content' }}>
                        <button onClick={() => adjustQty(b.MenuItemID, -1)} style={{ width: '28px', height: '28px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '950', color: '#4b5563' }}>-</button>
                        <span style={{ width: '32px', textAlign: 'center', fontWeight: '900', fontSize: '0.875rem', color: '#111827' }}>{b.qty}</span>
                        <button onClick={() => adjustQty(b.MenuItemID, 1)} style={{ width: '28px', height: '28px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '950', color: '#4b5563' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px dashed #f3f4f6', paddingTop: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                 <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>Total:</span>
                 <span style={{ fontSize: '2rem', fontWeight: '950', color: '#2563eb' }}>{formatCurrency(calcBill())}</span>
               </div>
               <button 
                 onClick={commitTicket} 
                 disabled={basket.length === 0 || !activeTable}
                 style={{ 
                   width: '100%', 
                   background: (basket.length === 0 || !activeTable) ? '#94a3b8' : '#111827', 
                   color: 'white', 
                   padding: '1.25rem', 
                   borderRadius: '16px', 
                   fontWeight: '900', 
                   fontSize: '1rem', 
                   cursor: (basket.length === 0 || !activeTable) ? 'not-allowed' : 'pointer',
                   transition: 'all 0.2s',
                   border: 'none',
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em'
                 }}
               >
                 {!activeTable ? 'Select a Table' : 'Submit Order'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showTablePicker} onClose={() => setShowTablePicker(false)} title="Select Table">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem' }}>
          {layout.map(l => {
            // Safely normalize status
            const rawStatus = l.TableStatus ? String(l.TableStatus) : '';
            const status = rawStatus.toLowerCase().trim();
            const isFree = status === 'free' || status === 'available' || status === '';
            const displayStatus = rawStatus || 'FREE';

            return (
              <div 
                key={l.TableID} 
                onClick={() => {
                  if (isFree) {
                    setActiveTable(l);
                    setShowTablePicker(false);
                  } else {
                     if (window.confirm(`Table ${l.TableNumber} is currently marked as ${displayStatus}. Use it anyway?`)) {
                       setActiveTable(l);
                       setShowTablePicker(false);
                     }
                  }
                }}
                style={{ 
                  padding: '1.5rem', 
                  border: isFree ? '2px solid #e5e7eb' : '2px solid #fee2e2', 
                  borderRadius: '16px', 
                  background: 'white', 
                  cursor: 'pointer', // Always actionable now
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  opacity: isFree ? 1 : 0.75,
                  boxShadow: isFree ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                  transition: 'transform 0.1s'
                }}
              >
                <span style={{ fontSize: '2rem' }}>🪑</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#111827' }}>Table {l.TableNumber}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: '900', 
                  color: isFree ? '#059669' : '#dc2626',
                  background: isFree ? '#ecfdf5' : '#fef2f2',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  {displayStatus}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
           <button onClick={() => setShowTablePicker(false)} style={{ padding: '0.6rem 1.5rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function OrderItems() {
  return (
    <ProtectedRoute>
      <PointOfSaleView />
    </ProtectedRoute>
  );
}
