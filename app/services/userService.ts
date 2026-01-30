import api from '../utils/axios';

export interface User {
    UserID: number;
    UserName: string;
    UserRole: string;
    RestaurantID: number;
    Created?: string;
    Modified?: string;
}

export interface UserCreate {
    UserName: string;
    Password: string;
    UserRole: string;
    RestaurantID?: number;
}

export interface UserUpdate {
    UserName?: string;
    UserRole?: string;
    RestaurantID?: number;
}

export interface PasswordUpdate {
    Password: string;
}

export const userService = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (userData: UserCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(userData).forEach(key => {
            const val = (userData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/users', cleanData);
        return response.data;
    },

    update: async (id: number, userData: UserUpdate) => {
        // Clean data: omit empty fields but ensure UserID/RestaurantID is handled if needed
        const cleanData: any = {};
        Object.keys(userData).forEach(key => {
            const val = (userData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });

        const response = await api.patch(`/users/${id}`, cleanData);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    updatePassword: async (id: number, passwordData: PasswordUpdate) => {
        const response = await api.post(`/users/updatePassword/${id}`, passwordData);
        return response.data;
    },
};
