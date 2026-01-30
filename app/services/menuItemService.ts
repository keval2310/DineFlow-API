import api from '../utils/axios';

export interface MenuItem {
    MenuItemID: number;
    MenuItemName: string;
    MenuItemPrice: number;
    MenuCategoryID: number;
    MenuCategoryName?: string;
    MenuItemImagePath?: string;
    Created?: string;
    Modified?: string;
}

export interface MenuItemCreate {
    MenuItemName: string;
    MenuItemPrice: number;
    MenuCategoryID: number;
    MenuItemImagePath?: string;
}

export interface MenuItemUpdate {
    MenuItemName?: string;
    MenuItemPrice?: number;
    MenuCategoryID?: number;
    MenuItemImagePath?: string;
}

export const menuItemService = {
    getAll: async () => {
        const response = await api.get('/menu-items');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/menu-items/${id}`);
        return response.data;
    },

    getByCategory: async (categoryId: number) => {
        const response = await api.get(`/menu-items/category/${categoryId}`);
        return response.data;
    },

    create: async (itemData: MenuItemCreate) => {
        // Clean data: omit empty fields
        const cleanData: any = {};
        Object.keys(itemData).forEach(key => {
            const val = (itemData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });
        const response = await api.post('/menu-items', cleanData);
        return response.data;
    },

    update: async (id: number, itemData: MenuItemUpdate) => {
        // Clean data: omit empty fields but ensure MenuItemID is handled if needed
        const cleanData: any = { MenuItemID: id };
        Object.keys(itemData).forEach(key => {
            const val = (itemData as any)[key];
            if (val !== '' && val !== null && val !== undefined) {
                cleanData[key] = val;
            }
        });

        const response = await api.patch(`/menu-items/${id}`, cleanData);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/menu-items/${id}`);
        return response.data;
    },
};
