import api from '../utils/axios';

export interface OrderItem {
    OrderItemID: number;
    OrderID: number;
    MenuItemID: number;
    MenuItemName?: string;
    MenuItemPrice?: number;
    Quantity: number;
    SubTotal: number;
    Created?: string;
    Modified?: string;
}

export interface OrderItemCreate {
    OrderID: number;
    MenuItemID: number;
    Quantity?: number;
}

export interface OrderItemUpdate {
    OrderID?: number;
    MenuItemID?: number;
    Quantity?: number;
}

export const orderItemService = {
    getAll: async () => {
        const response = await api.get('/order-items');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/order-items/${id}`);
        return response.data;
    },

    getByOrder: async (orderId: number) => {
        const response = await api.get(`/order-items/order/${orderId}`);
        return response.data;
    },

    getByMenuItem: async (menuItemId: number) => {
        const response = await api.get(`/order-items/menu-item/${menuItemId}`);
        return response.data;
    },

    create: async (itemData: OrderItemCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(itemData).forEach(key => {
            const val = (itemData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/order-items', cleanData);
        return response.data;
    },

    update: async (id: number, itemData: OrderItemUpdate) => {
        // Clean data: omit empty fields but ensure OrderItemID is handled
        const cleanData: any = { OrderItemID: id };
        Object.keys(itemData).forEach(key => {
            const val = (itemData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.patch(`/order-items/${id}`, cleanData);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/order-items/${id}`);
        return response.data;
    },
};
