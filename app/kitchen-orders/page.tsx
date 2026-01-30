'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import { orderService, Order } from '../services/orderService';
import { orderItemService, OrderItem } from '../services/orderItemService';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { menuItemService } from '../services/menuItemService';
import ProtectedRoute from '../components/common/ProtectedRoute';

const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<number, OrderItem[]>>({});
  const [menuRef, setMenuRef] = useState<Record<number, any>>({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const { user, loading: authStatusLoading } = useAuth();
  const navigator = useRouter();

  useEffect(() => {
    if (!authStatusLoading) {
      if (user) {
        initKitchenView();
      } else {
        navigator.push('/login');
        setIsProcessing(false);
      }
    }
  }, [user, authStatusLoading, navigator]);

  const initKitchenView = async () => {
    try {
      setIsProcessing(true);
      setErrMsg('');
      await Promise.all([
        syncOrders(),
        fetchMenuData()
      ]);
    } catch (e: any) {
      setErrMsg('Initializing kitchen failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchMenuData = async () => {
    try {
      const resp = await menuItemService.getAll();
      if (!resp.error) {
        const dictionary: Record<number, any> = {};
        (resp.data || []).forEach((m: any) => {
          dictionary[m.MenuItemID] = m;
        });
        setMenuRef(dictionary);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const syncOrders = async () => {
    try {
      const res = await orderService.getAll();
      if (!res.error) {
        let stream = res.data || [];
        if (user && user.UserRole !== 'admin' && user.RestaurantID) {
          stream = stream.filter((o: Order) => o.RestaurantID === user.RestaurantID);
        }
        setOrders(stream);
        for (const o of stream) {
          pullOrderItems(o.OrderID);
        }
      } else {
        setErrMsg(res.message);
      }
    } catch (err) {
      setErrMsg('Orders sync failed.');
    }
  };

  const refreshOrders = async () => {
    try {
      setIsProcessing(true);
      await syncOrders();
    } catch (err: any) {
      setErrMsg(err.response?.data?.message || 'Refresh failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const pullOrderItems = async (id: number) => {
    try {
      const resp = await orderItemService.getByOrder(id);
      if (!resp.error) {
        setItemsMap((old) => ({
          ...old,
          [id]: resp.data || [],
        }));
      }
    } catch (ignore) {}
  };

  const updateOrderProcess = async (id: number, status: string) => {
    try {
      setOrders(current => current.map(o => o.OrderID === id ? { ...o, OrderStatus: status as any } : o));
      await orderService.updateStatus(id, status);
      syncOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
      syncOrders();
    }
  };

  const statusColorMap = (st: string) => {
    const s = st.toLowerCase();
    if (s === 'pending') return '#ea580c';
    if (s === 'preparing') return '#0284c7';
    if (s === 'served' || s === 'paid') return '#16a34a';
    return '#6b7280';
  };

  const displayTime = (ts: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
  };

  const activeOrders = currentFilter === 'all' 
    ? orders 
    : orders.filter(o => o.OrderStatus === currentFilter);

  if (isProcessing && orders.length === 0) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🍴</span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>Kitchen Queue</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Filter</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select 
                  value={currentFilter}
                  onChange={(e) => setCurrentFilter(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: '600' }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="served">Served</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <button 
              onClick={refreshOrders}
              className="btn-icon"
              style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', fontSize: '1.25rem' }}
            >
              🔄
            </button>
          </div>
        </div>

        {errMsg && <div className="alert alert-error">{errMsg}</div>}

        {activeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#6b7280' }}>
            <p style={{ fontSize: '1.125rem' }}>No orders matching filter.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {activeOrders.map((order) => {
              const themeColor = statusColorMap(order.OrderStatus);
              const list = itemsMap[order.OrderID] || [];
              
              return (
                <div key={order.OrderID} style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  border: `2px solid ${themeColor}`,
                  padding: '1.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: 0 }}>Order #{order.OrderID}</h3>
                      <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '0.25rem' }}>Table {order.TableNumber || order.TableID}</p>
                    </div>
                    <span style={{ 
                      background: themeColor, 
                      color: 'white', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}>
                      {order.OrderStatus}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Items:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {list.map(it => (
                        <div key={it.OrderItemID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                          <span style={{ color: '#4b5563' }}>{it.Quantity}x {it.MenuItemName || menuRef[it.MenuItemID]?.MenuItemName || 'Dish'}</span>
                          <span style={{ fontWeight: '700', color: '#111827' }}>
                            {formatCurrency(
                              it.MenuItemPrice || 
                              (it.SubTotal > 0 ? (it.SubTotal / it.Quantity) : 0) || 
                              menuRef[it.MenuItemID]?.MenuItemPrice || 
                              0
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '1.5rem', 
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                       <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111827' }}>Total: {formatCurrency(order.TotalAmount)}</span>
                    </div>

                    {order.OrderStatus === 'pending' && (
                      <button 
                        onClick={() => updateOrderProcess(order.OrderID, 'preparing')}
                        style={{ 
                          background: '#f97316', 
                          color: 'white', 
                          width: '100%', 
                          padding: '0.875rem', 
                          fontWeight: '800',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        ✅ START PREPARING
                      </button>
                    )}

                    {order.OrderStatus === 'preparing' && (
                      <button 
                        onClick={() => updateOrderProcess(order.OrderID, 'served')}
                        style={{ 
                          background: '#0ea5e9', 
                          color: 'white', 
                          width: '100%', 
                          padding: '0.875rem', 
                          fontWeight: '800',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        ✅ MARK AS READY
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function KitchenOrders() {
  return (
    <ProtectedRoute>
      <KitchenView />
    </ProtectedRoute>
  );
}
