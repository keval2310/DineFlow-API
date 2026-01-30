import api from '../utils/axios';

export interface Order {
    OrderID: number;
    TableID: number;
    TableNumber?: number;
    TotalAmount: number;
    OrderStatus: 'pending' | 'preparing' | 'served' | 'paid';
    RestaurantID: number;
    Created?: string;
    Modified?: string;
}

export interface OrderCreate {
    TableID: number;
    TotalAmount?: number;
    OrderStatus?: 'pending' | 'preparing' | 'served' | 'paid';
    RestaurantID?: number;
}

export interface OrderUpdate {
    TableID?: number;
    TotalAmount?: number;
    OrderStatus?: 'pending' | 'preparing' | 'served' | 'paid';
    RestaurantID?: number;
}

export const orderService = {
    getAll: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    getByTable: async (tableId: number) => {
        const response = await api.get(`/orders/table/${tableId}`);
        return response.data;
    },

    create: async (orderData: OrderCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(orderData).forEach(key => {
            const val = (orderData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/orders', cleanData);
        return response.data;
    },

    update: async (id: number, orderData: OrderUpdate) => {
        // Clean data: omit empty fields but ensure OrderID is handled if needed
        const cleanData: any = { OrderID: id };
        Object.keys(orderData).forEach(key => {
            const val = (orderData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });

        const response = await api.patch(`/orders/${id}`, cleanData);
        return response.data;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await api.patch(`/orders/${id}`, { OrderID: id, OrderStatus: status });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    },
};
