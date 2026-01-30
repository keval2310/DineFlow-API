import api from '../utils/axios';

export interface Restaurant {
    RestaurantID: number;
    RestaurantName: string;
    RestaurantAddress?: string;
    RestaurantPhone?: string;
    Created?: string;
    Modified?: string;
}

export interface RestaurantCreate {
    RestaurantName: string;
    RestaurantAddress?: string;
    RestaurantPhone?: string;
}

export interface RestaurantUpdate {
    RestaurantName?: string;
    RestaurantAddress?: string;
    RestaurantPhone?: string;
}

export const restaurantService = {
    getAll: async () => {
        const response = await api.get('/restaurants');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/restaurants/${id}`);
        return response.data;
    },

    create: async (restaurantData: RestaurantCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(restaurantData).forEach(key => {
            const val = (restaurantData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/restaurants', cleanData);
        return response.data;
    },

    update: async (id: number, restaurantData: RestaurantUpdate) => {
        // Clean data: omit empty fields but ensure RestaurantID is present in body
        const cleanData: any = { RestaurantID: id };
        Object.keys(restaurantData).forEach(key => {
            const val = (restaurantData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });

        const response = await api.patch(`/restaurants/${id}`, cleanData);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/restaurants/${id}`);
        return response.data;
    },
};
