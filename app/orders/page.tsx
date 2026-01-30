'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { orderService, Order, OrderCreate, OrderUpdate } from '../services/orderService';
import { orderItemService, OrderItem } from '../services/orderItemService';
import { tableService, Table } from '../services/tableService';
import { restaurantService, Restaurant } from '../services/restaurantService';
import { hasPermission, formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { menuItemService } from '../services/menuItemService';
import ProtectedRoute from '../components/common/ProtectedRoute';

const OrdersView: React.FC = () => {
  const { user, loading: authPending } = useAuth();
  const nav = useRouter();
  const [list, setList] = useState<Order[]>([]);
  const [tableList, setTableList] = useState<Table[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuMap, setMenuMap] = useState<Record<number, any>>({});
  const [busy, setBusy] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [payItems, setPayItems] = useState<OrderItem[]>([]);
  const [receivedCash, setReceivedCash] = useState<number>(0);
  const [payType, setPayType] = useState<'cash' | 'card'>('cash');
  const [activeItem, setActiveItem] = useState<Order | null>(null);
  const [fields, setFields] = useState<OrderCreate & { RestaurantID: number }>({
    TableID: 0,
    OrderStatus: 'pending',
    RestaurantID: 0,
  });

  const permitCreate = hasPermission('canCreateOrders');
  const permitUpdate = hasPermission('canUpdateOrders');
  const permitDelete = hasPermission('canDeleteOrders');

  useEffect(() => {
    if (!authPending) {
      if (user) {
        initDataLoad();
      } else {
        nav.push('/login');
        setBusy(false);
      }
    }
  }, [user, authPending, nav]);

  const initDataLoad = async () => {
    try {
      setBusy(true);
      setErrorText('');
      
      const [oRes, tRes, mRes, rRes] = await Promise.all([
        orderService.getAll(),
        tableService.getAll(),
        menuItemService.getAll(),
        restaurantService.getAll()
      ]);

      if (!rRes.error) {
        setRestaurants(rRes.data || []);
      }

      if (!oRes.error) {
        let content: Order[] = oRes.data || [];
        if (user && user.UserRole === 'manager' && user.RestaurantID) {
          content = content.filter((o: Order) => o.RestaurantID === user.RestaurantID);
        }
        setList(content);
      }

      if (!tRes.error) {
        setTableList(tRes.data || []);
      }

      if (!mRes.error) {
        const dict: Record<number, any> = {};
        (mRes.data || []).forEach((i: any) => {
          dict[i.MenuItemID] = i;
        });
        setMenuMap(dict);
      }
    } catch (e: any) {
      setErrorText(e.response?.data?.message || 'Data sync error');
    } finally {
      setBusy(false);
    }
  };

  const getRestaurantName = (tableId: number) => {
    const table = tableList.find(t => t.TableID === tableId);
    if (!table) return 'N/A';
    const res = restaurants.find(r => r.RestaurantID === table.RestaurantID);
    return res ? res.RestaurantName : `ID ${table.RestaurantID}`;
  };

  const prettyDate = (raw: string) => {
    if (!raw) return '-';
    return new Date(raw).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '/');
  };

  const openEditor = (item?: Order) => {
    if (item) {
      setActiveItem(item);
      setFields({
        TableID: item.TableID,
        OrderStatus: item.OrderStatus,
        RestaurantID: item.RestaurantID
      });
    } else {
      setActiveItem(null);
      setFields({
        TableID: 0,
        OrderStatus: 'pending',
        RestaurantID: user?.RestaurantID || (restaurants.length > 0 ? restaurants[0].RestaurantID : 0)
      });
    }
    setEditVisible(true);
  };

  const openPayment = async (item: Order) => {
    setActiveItem(item);
    setPayType('cash');
    setReceivedCash(item.TotalAmount);
    try {
      const res = await orderItemService.getByOrder(item.OrderID);
      if (!res.error) setPayItems(res.data || []);
    } catch (err) {}
    setPayVisible(true);
  };

  const closeModals = () => {
    setEditVisible(false);
    setPayVisible(false);
    setActiveItem(null);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeItem) {
        await orderService.update(activeItem.OrderID, fields as OrderUpdate);
      } else {
        await orderService.create(fields);
      }
      closeModals();
      initDataLoad();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
      initDataLoad();
    }
  };

  const finalizePay = async () => {
    if (!activeItem) return;
    if (payType === 'cash' && receivedCash < activeItem.TotalAmount) {
      alert('Insufficient amount!');
      return;
    }

    try {
      await orderService.updateStatus(activeItem.OrderID, 'paid');
      closeModals();
      initDataLoad();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment processing error');
    }
  };

  const trashRecord = async (id: number) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      setList(prev => prev.filter(o => o.OrderID !== id));
      await orderService.delete(id);
      initDataLoad();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete error');
      initDataLoad();
    }
  };

  if (busy) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Orders Management</h1>
          {permitCreate && (
            <button className="btn btn-primary" onClick={() => openEditor()} style={{ borderRadius: '8px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>+</span> ADD ORDER
            </button>
          )}
        </div>

        {errorText && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{errorText}</div>}

        <div className="table-container" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table className="data-table">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Table</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Restaurant</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>No records found.</td>
                </tr>
              ) : (
                list.map((order) => (
                  <tr key={order.OrderID} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>#{order.OrderID}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>Table {order.TableNumber || order.TableID}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: '#10b981' }}>{formatCurrency(order.TotalAmount)}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        background: order.OrderStatus === 'paid' ? '#ecfdf5' : '#eef2ff', 
                        color: order.OrderStatus === 'paid' ? '#065f46' : '#3730a3', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {order.OrderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{getRestaurantName(order.TableID)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{prettyDate(order.Created || '')}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {order.OrderStatus === 'served' && (
                          <button onClick={() => openPayment(order)} title="Pay" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>💰</button>
                        )}
                        {permitUpdate && (
                          <button onClick={() => openEditor(order)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: '1.2rem' }}>✏️</button>
                        )}
                        {permitDelete && (
                          <button onClick={() => trashRecord(order.OrderID)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}>🗑️</button>
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
        isOpen={editVisible}
        onClose={closeModals}
        title={activeItem ? 'Modify Order' : 'Add Order'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
            <button className="btn btn-primary" onClick={onSave}>{activeItem ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Table Number *</label>
            <select
              className="input-field"
              value={fields.TableID}
              onChange={(e) => setFields({ ...fields, TableID: parseInt(e.target.value) })}
              style={{ background: 'white' }}
            >
              <option value={0}>Choose Table...</option>
              {tableList.map(t => <option key={t.TableID} value={t.TableID}>T-{t.TableNumber} ({getRestaurantName(t.TableID)})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Order Status *</label>
            <select
              className="input-field"
              value={fields.OrderStatus}
              onChange={(e) => setFields({ ...fields, OrderStatus: e.target.value as any })}
              style={{ background: 'white' }}
            >
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="served">Served</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={payVisible}
        onClose={closeModals}
        title="Receive Payment"
        footer={
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
            <button 
              className="btn" 
              onClick={closeModals}
              style={{ background: '#64748b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '700' }}
            >
              CANCEL
            </button>
            <button 
              className="btn" 
              onClick={finalizePay}
              style={{ background: '#15803d', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              💳 PROCESS PAYMENT
            </button>
          </div>
        }
      >
        <div style={{ padding: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>Order #{activeItem?.OrderID} - Table {activeItem?.TableNumber || activeItem?.TableID}</p>
          
          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', marginBottom: '1rem' }}>Order Items:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {payItems.map(i => {
              const itemPrice = menuMap[i.MenuItemID]?.MenuItemPrice || 0;
              const subTotal = i.SubTotal || (i.Quantity * itemPrice);
              return (
                <div key={i.OrderItemID} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#111827' }}>
                  <span style={{ fontWeight: '500' }}>{i.Quantity}x {i.MenuItemName || menuMap[i.MenuItemID]?.MenuItemName || 'Dish'}</span>
                  <span style={{ fontWeight: '700' }}>{formatCurrency(subTotal)}</span>
                </div>
              );
            })}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#111827' }}>Total Amount:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#2563eb' }}>{formatCurrency(activeItem?.TotalAmount || 0)}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.75rem' }}>Payment Method</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                <input type="radio" checked={payType === 'cash'} onChange={() => setPayType('cash')} style={{ width: '1.1rem', height: '1.1rem' }} /> Cash
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                <input type="radio" checked={payType === 'card'} onChange={() => setPayType('card')} style={{ width: '1.1rem', height: '1.1rem' }} /> Card
              </label>
            </div>
          </div>

          {payType === 'cash' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#2563eb', marginBottom: '0.5rem' }}>Amount Received *</label>
              <input 
                type="number" 
                className="input-field"
                value={receivedCash} 
                onChange={(e) => setReceivedCash(parseFloat(e.target.value))} 
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', border: '2px solid #2563eb', borderRadius: '10px', outline: 'none' }}
                autoFocus
              />
              <div style={{ marginTop: '0.75rem', fontSize: '1rem' }}>
                <span style={{ color: '#6b7280' }}>Change: </span>
                <span style={{ fontWeight: '800', color: '#111827' }}>{formatCurrency(Math.max(0, receivedCash - (activeItem?.TotalAmount || 0)))}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default function Orders() {
  return (
    <ProtectedRoute>
      <OrdersView />
    </ProtectedRoute>
  );
}
