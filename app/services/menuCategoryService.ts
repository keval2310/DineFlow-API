import api from '../utils/axios';

export interface MenuCategory {
    MenuCategoryID: number;
    MenuCategoryName: string;
    MenuCategoryImagePath?: string;
    RestaurantID: number;
    Created?: string;
    Modified?: string;
}

export interface MenuCategoryCreate {
    MenuCategoryName: string;
    MenuCategoryImagePath?: string;
    RestaurantID?: number;
}

export interface MenuCategoryUpdate {
    MenuCategoryName?: string;
    MenuCategoryImagePath?: string;
    RestaurantID?: number;
}

export const menuCategoryService = {
    getAll: async () => {
        const response = await api.get('/menu-categories');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/menu-categories/${id}`);
        return response.data;
    },

    getByRestaurant: async (restaurantId: number) => {
        const response = await api.get(`/menu-categories/restaurant/${restaurantId}`);
        return response.data;
    },

    create: async (categoryData: MenuCategoryCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(categoryData).forEach(key => {
            const val = (categoryData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/menu-categories', cleanData);
        return response.data;
    },

    update: async (id: number, categoryData: MenuCategoryUpdate) => {
        // Clean data: omit empty fields but ensure MenuCategoryID is handled if needed
        const cleanData: any = { MenuCategoryID: id };
        Object.keys(categoryData).forEach(key => {
            const val = (categoryData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });

        const response = await api.patch(`/menu-categories/${id}`, cleanData);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/menu-categories/${id}`);
        return response.data;
    },
};
