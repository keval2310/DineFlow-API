import api from '../utils/axios';

export interface Table {
    TableID: number;
    TableNumber: number;
    TableCapacity: number;
    TableStatus: 'free' | 'occupied';
    RestaurantID: number;
    Created?: string;
    Modified?: string;
}

export interface TableCreate {
    TableNumber: number;
    TableCapacity: number;
    TableStatus?: 'free' | 'occupied';
    RestaurantID?: number;
}

export interface TableUpdate {
    TableNumber?: number;
    TableCapacity?: number;
    TableStatus?: 'free' | 'occupied';
    RestaurantID?: number;
}

export const tableService = {
    getAll: async () => {
        const response = await api.get('/tables');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/tables/${id}`);
        return response.data;
    },

    getByRestaurant: async (restaurantId: number) => {
        const response = await api.get(`/tables/restaurant/${restaurantId}`);
        return response.data;
    },

    create: async (tableData: TableCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(tableData).forEach(key => {
            const val = (tableData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/tables', cleanData);
        return response.data;
    },

    update: async (id: number, tableData: TableUpdate) => {
        // Clean data: omit empty fields but ensure RestaurantID is handled if needed
        const cleanData: any = { TableID: id };
        Object.keys(tableData).forEach(key => {
            const val = (tableData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });

        const response = await api.patch(`/tables/${id}`, cleanData);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/tables/${id}`);
        return response.data;
    },
};
